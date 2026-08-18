import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  AiServiceError,
  SAFETY_RULES,
  buildPrompt,
  generateStructured,
  generateText,
} from "./ai.server";
import {
  describeApplication,
  describeInterview,
  describeNotes,
  describeProfile,
  describeTasks,
  getApplicationContext,
  getApplicationNotes,
  getApplicationTasks,
  getInterviewContext,
  getProfileContext,
  getWorkspaceSnapshot,
} from "./ai-context.server";
import {
  emailOutputSchema,
  notesSummarySchema,
  plannerOutputSchema,
  researchOutputSchema,
  type EmailOutput,
  type NotesSummary,
  type PlannerOutput,
  type ResearchOutput,
} from "./ai-schemas";

type DB = SupabaseClient<any, "public", any>;
export type AiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function guard<T>(fn: () => Promise<T>): Promise<AiResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof AiServiceError) return { ok: false, error: error.message };
    console.error("AI handler failure", error);
    return {
      ok: false,
      error: "The AI service couldn't complete this request. Please try again.",
    };
  }
}

const today = () => new Date().toISOString().slice(0, 10);

export function generateEmailDraft(
  supabase: DB,
  input: { applicationId: string | null; purpose: string; tone: string; extraContext?: string },
): Promise<AiResult<EmailOutput>> {
  return guard(async () => {
    const [app, profile, notes] = await Promise.all([
      getApplicationContext(supabase, input.applicationId),
      getProfileContext(supabase),
      getApplicationNotes(supabase, input.applicationId),
    ]);

    const prompt = buildPrompt([
      { label: "ROLE", body: "You are a professional career communication assistant." },
      {
        label: "TASK",
        body: `Write a job-search email for this purpose: ${input.purpose}. Produce a subject line and an editable email body.`,
      },
      { label: "APPLICATION CONTEXT", body: describeApplication(app) },
      { label: "USER CONTEXT", body: describeProfile(profile) },
      { label: "RELEVANT NOTES", body: describeNotes(notes) },
      {
        label: "USER PREFERENCES",
        body: `Tone: ${input.tone}\nLength: 120–200 words unless the purpose requires more.`,
      },
      { label: "ADDITIONAL INSTRUCTIONS FROM USER", body: input.extraContext },
      {
        label: "CONSTRAINTS",
        body: `${SAFETY_RULES}\nUse placeholders in square brackets (e.g. [date]) when a needed detail is missing.\nDo not add signatures with invented contact details.`,
      },
      {
        label: "OUTPUT FORMAT",
        body: 'Return JSON only: {"subject": string, "body": string}. Use \\n for line breaks in the body.',
      },
    ]);

    return generateStructured(
      { system: "You return only valid JSON matching the requested shape.", user: prompt },
      emailOutputSchema,
    );
  });
}

export function summarizeMeetingNotes(
  supabase: DB,
  input: { applicationId: string | null; interviewId: string | null; content: string },
): Promise<AiResult<NotesSummary>> {
  return guard(async () => {
    const [app, interview] = await Promise.all([
      getApplicationContext(supabase, input.applicationId),
      getInterviewContext(supabase, input.interviewId),
    ]);

    const prompt = buildPrompt([
      { label: "ROLE", body: "You are an interview debrief assistant." },
      {
        label: "TASK",
        body: "Summarize the user's raw meeting/interview notes into the structured sections requested below.",
      },
      { label: "APPLICATION CONTEXT", body: describeApplication(app) },
      { label: "INTERVIEW CONTEXT", body: describeInterview(interview) },
      { label: "RAW NOTES FROM USER", body: input.content },
      {
        label: "CONSTRAINTS",
        body: `${SAFETY_RULES}\nLeave an array empty when the notes contain nothing for that section. Never pad sections with generic advice presented as fact.`,
      },
      {
        label: "OUTPUT FORMAT",
        body: 'Return JSON only: {"summary": string, "keyPoints": string[], "questionsAsked": string[], "importantPoints": string[], "wentWell": string[], "areasToImprove": string[], "nextSteps": string[]}. nextSteps must be short actionable items.',
      },
    ]);

    return generateStructured(
      { system: "You return only valid JSON matching the requested shape.", user: prompt },
      notesSummarySchema,
    );
  });
}

export function generateTaskPlan(
  supabase: DB,
  input: { request: string; applicationId: string | null; interviewId: string | null },
): Promise<AiResult<PlannerOutput>> {
  return guard(async () => {
    const [app, interview, profile, tasks, notes] = await Promise.all([
      getApplicationContext(supabase, input.applicationId),
      getInterviewContext(supabase, input.interviewId),
      getProfileContext(supabase),
      getApplicationTasks(supabase, input.applicationId),
      getApplicationNotes(supabase, input.applicationId),
    ]);

    const prompt = buildPrompt([
      { label: "ROLE", body: "You are a job-search preparation planner." },
      {
        label: "TASK",
        body: "Turn the user's request into a short, realistic plan of concrete tasks. Prefer 4–8 tasks. Never propose more than 12.",
      },
      { label: "USER REQUEST", body: input.request },
      { label: "APPLICATION CONTEXT", body: describeApplication(app) },
      { label: "INTERVIEW CONTEXT", body: describeInterview(interview) },
      { label: "USER CONTEXT", body: describeProfile(profile) },
      { label: "EXISTING TASKS (do not duplicate)", body: describeTasks(tasks) },
      { label: "RELEVANT NOTES", body: describeNotes(notes) },
      { label: "TODAY", body: today() },
      {
        label: "CONSTRAINTS",
        body: `${SAFETY_RULES}\nDue dates must be ISO yyyy-mm-dd, on or after today, and before any known interview date. Use null when no date is implied.`,
      },
      {
        label: "OUTPUT FORMAT",
        body: 'Return JSON only: {"planTitle": string, "tasks": [{"title": string, "description": string, "priority": "high"|"medium"|"low", "dueDate": string|null, "estimatedMinutes": number|null}]}',
      },
    ]);

    return generateStructured(
      { system: "You return only valid JSON matching the requested shape.", user: prompt },
      plannerOutputSchema,
    );
  });
}

export function runResearch(
  supabase: DB,
  input: { topic: string; kind: string; applicationId: string | null },
): Promise<AiResult<ResearchOutput>> {
  return guard(async () => {
    const app = await getApplicationContext(supabase, input.applicationId);

    const prompt = buildPrompt([
      { label: "ROLE", body: "You are a job-search research assistant." },
      {
        label: "TASK",
        body: `Research this ${input.kind} for interview preparation: "${input.topic}". Fill the structured sections below.`,
      },
      { label: "APPLICATION CONTEXT", body: describeApplication(app) },
      {
        label: "CONSTRAINTS",
        body: `${SAFETY_RULES}\nYou have no live web access, so do not fabricate news, dates, funding rounds, headcounts, revenue or sources. Leave "recentDevelopments" empty if you cannot recall anything reliable. Use confidenceNote to state plainly what the user must verify from original sources.`,
      },
      {
        label: "OUTPUT FORMAT",
        body: 'Return JSON only: {"overview": string, "whatTheyDo": string, "products": string[], "industry": string, "recentDevelopments": string[], "competitors": string[], "technology": string[], "interviewTopics": string[], "questionsToAsk": string[], "talkingPoints": string[], "confidenceNote": string}',
      },
    ]);

    return generateStructured(
      { system: "You return only valid JSON matching the requested shape.", user: prompt },
      researchOutputSchema,
    );
  });
}

export function askCareerAssistant(
  supabase: DB,
  input: { message: string; history: { role: "user" | "assistant"; content: string }[] },
): Promise<AiResult<{ reply: string }>> {
  return guard(async () => {
    const [snapshot, profile] = await Promise.all([
      getWorkspaceSnapshot(supabase),
      getProfileContext(supabase),
    ]);

    const prompt = buildPrompt([
      { label: "TODAY", body: today() },
      { label: "USER CONTEXT", body: describeProfile(profile) },
      { label: "THE USER'S JOB SEARCH DATA", body: snapshot },
      {
        label: "CONVERSATION SO FAR",
        body: input.history.length
          ? input.history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")
          : null,
      },
      { label: "USER MESSAGE", body: input.message },
    ]);

    const reply = await generateText({
      system: buildPrompt([
        {
          label: "ROLE",
          body: "You are the user's AI career assistant inside their job application tracker.",
        },
        {
          label: "TASK",
          body: "Answer questions about their job search and help them prepare. Be concise, warm and practical. Use short paragraphs or bullet lists.",
        },
        {
          label: "CONSTRAINTS",
          body: `${SAFETY_RULES}\nIf several applications could match what the user means, ask which one instead of guessing.\nYou cannot send emails, book interviews or change records — offer to draft or suggest instead, and point the user to the matching page in the app.`,
        },
      ]),
      user: prompt,
      temperature: 0.5,
    });

    return { reply };
  });
}

export const analyzeJobDescriptionSchema = z.object({
  skills: z.array(z.string()).default([]),
  interviewTopics: z.array(z.string()).default([]),
  summary: z.string().default(""),
});

export function analyzeJobDescription(
  supabase: DB,
  input: { applicationId: string },
): Promise<AiResult<z.infer<typeof analyzeJobDescriptionSchema>>> {
  return guard(async () => {
    const app = await getApplicationContext(supabase, input.applicationId);
    if (!app?.job_description) {
      throw new AiServiceError("Add a job description to this application first.", false);
    }
    const prompt = buildPrompt([
      { label: "ROLE", body: "You are a job description analyst." },
      {
        label: "TASK",
        body: "Extract the skills that matter most and the likely interview topics from the job description.",
      },
      { label: "APPLICATION CONTEXT", body: describeApplication(app) },
      { label: "CONSTRAINTS", body: SAFETY_RULES },
      {
        label: "OUTPUT FORMAT",
        body: 'Return JSON only: {"summary": string, "skills": string[], "interviewTopics": string[]}',
      },
    ]);
    return generateStructured(
      { system: "You return only valid JSON matching the requested shape.", user: prompt },
      analyzeJobDescriptionSchema,
    );
  });
}
