import { z } from "zod";

export const emailInputSchema = z.object({
  applicationId: z.string().uuid().nullable(),
  purpose: z.string().min(1).max(60),
  tone: z.string().min(1).max(40),
  extraContext: z.string().max(2000).optional(),
});

export const emailOutputSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
});
export type EmailOutput = z.infer<typeof emailOutputSchema>;

export const notesInputSchema = z.object({
  applicationId: z.string().uuid().nullable(),
  interviewId: z.string().uuid().nullable(),
  content: z.string().min(20, "Add a bit more detail before summarizing.").max(20000),
});

export const notesSummarySchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()).default([]),
  questionsAsked: z.array(z.string()).default([]),
  importantPoints: z.array(z.string()).default([]),
  wentWell: z.array(z.string()).default([]),
  areasToImprove: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
});
export type NotesSummary = z.infer<typeof notesSummarySchema>;

export const plannerInputSchema = z.object({
  request: z.string().min(5).max(2000),
  applicationId: z.string().uuid().nullable(),
  interviewId: z.string().uuid().nullable(),
});

export const plannedTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  dueDate: z.string().nullable().default(null),
  estimatedMinutes: z.number().int().positive().max(600).nullable().default(null),
});
export type PlannedTask = z.infer<typeof plannedTaskSchema>;

export const plannerOutputSchema = z.object({
  planTitle: z.string().min(1),
  tasks: z.array(plannedTaskSchema).min(1).max(15),
});
export type PlannerOutput = z.infer<typeof plannerOutputSchema>;

export const researchInputSchema = z.object({
  topic: z.string().min(2).max(200),
  kind: z.string().min(2).max(40),
  applicationId: z.string().uuid().nullable(),
});

export const researchOutputSchema = z.object({
  overview: z.string(),
  whatTheyDo: z.string().default(""),
  products: z.array(z.string()).default([]),
  industry: z.string().default(""),
  recentDevelopments: z.array(z.string()).default([]),
  competitors: z.array(z.string()).default([]),
  technology: z.array(z.string()).default([]),
  interviewTopics: z.array(z.string()).default([]),
  questionsToAsk: z.array(z.string()).default([]),
  talkingPoints: z.array(z.string()).default([]),
  confidenceNote: z.string().default(""),
});
export type ResearchOutput = z.infer<typeof researchOutputSchema>;

export const chatInputSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(20)
    .default([]),
});
