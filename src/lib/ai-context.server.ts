import type { SupabaseClient } from "@supabase/supabase-js";
import { buildPrompt } from "./ai.server";

type DB = SupabaseClient<any, "public", any>;

/**
 * Retrieves the minimum context required for an AI operation.
 * We deliberately select only the fields the model needs — never whole rows of
 * private user data.
 */
export async function getApplicationContext(supabase: DB, applicationId: string | null) {
  if (!applicationId) return null;
  const { data } = await supabase
    .from("applications")
    .select(
      "id, company, position, location, work_mode, employment_type, status, applied_date, job_description, recruiter_name, salary_min, salary_max, salary_currency, notes",
    )
    .eq("id", applicationId)
    .maybeSingle();
  return data ?? null;
}

export async function getInterviewContext(supabase: DB, interviewId: string | null) {
  if (!interviewId) return null;
  const { data } = await supabase
    .from("interviews")
    .select("id, interview_type, scheduled_at, interviewer, notes, status, application_id")
    .eq("id", interviewId)
    .maybeSingle();
  return data ?? null;
}

export async function getProfileContext(supabase: DB) {
  const { data } = await supabase
    .from("profiles")
    .select("full_name, headline, target_role, location, skills, preferred_tone")
    .maybeSingle();
  return data ?? null;
}

export async function getApplicationNotes(supabase: DB, applicationId: string | null) {
  if (!applicationId) return [];
  const { data } = await supabase
    .from("notes")
    .select("title, content, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

export async function getApplicationTasks(supabase: DB, applicationId: string | null) {
  if (!applicationId) return [];
  const { data } = await supabase
    .from("tasks")
    .select("title, priority, due_date, completed")
    .eq("application_id", applicationId)
    .order("due_date", { ascending: true })
    .limit(10);
  return data ?? [];
}

export function describeApplication(app: Awaited<ReturnType<typeof getApplicationContext>>) {
  if (!app) return null;
  const lines = [
    `Company: ${app.company}`,
    `Position: ${app.position}`,
    app.location ? `Location: ${app.location} (${app.work_mode})` : null,
    `Employment type: ${app.employment_type}`,
    `Current status: ${app.status}`,
    app.applied_date ? `Applied on: ${app.applied_date}` : null,
    app.recruiter_name ? `Recruiter: ${app.recruiter_name}` : null,
    app.salary_min || app.salary_max
      ? `Salary range on file: ${app.salary_currency} ${app.salary_min ?? "?"}–${app.salary_max ?? "?"}`
      : null,
    app.job_description ? `Job description:\n${String(app.job_description).slice(0, 4000)}` : null,
    app.notes ? `User's own notes on this application:\n${String(app.notes).slice(0, 1500)}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function describeInterview(iv: Awaited<ReturnType<typeof getInterviewContext>>) {
  if (!iv) return null;
  return [
    `Interview type: ${iv.interview_type}`,
    iv.scheduled_at ? `Scheduled for: ${new Date(iv.scheduled_at).toISOString()}` : null,
    iv.interviewer ? `Interviewer: ${iv.interviewer}` : null,
    `Status: ${iv.status}`,
    iv.notes ? `Interview notes:\n${String(iv.notes).slice(0, 2000)}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function describeProfile(profile: Awaited<ReturnType<typeof getProfileContext>>) {
  if (!profile) return null;
  return [
    profile.full_name ? `Name: ${profile.full_name}` : null,
    profile.headline ? `Headline: ${profile.headline}` : null,
    profile.target_role ? `Target role: ${profile.target_role}` : null,
    profile.location ? `Location: ${profile.location}` : null,
    profile.skills?.length ? `Skills: ${profile.skills.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function describeNotes(notes: { title: string | null; content: string }[]) {
  if (!notes.length) return null;
  return notes
    .map((n, i) => `Note ${i + 1}${n.title ? ` (${n.title})` : ""}:\n${n.content.slice(0, 1500)}`)
    .join("\n\n");
}

export function describeTasks(
  tasks: { title: string; priority: string; due_date: string | null; completed: boolean }[],
) {
  if (!tasks.length) return null;
  return tasks
    .map(
      (t) =>
        `- [${t.completed ? "done" : "open"}] ${t.title} (${t.priority}${t.due_date ? `, due ${t.due_date}` : ""})`,
    )
    .join("\n");
}

/** Compact, privacy-conscious snapshot of the whole job search for the chatbot. */
export async function getWorkspaceSnapshot(supabase: DB) {
  const [apps, interviews, tasks] = await Promise.all([
    supabase
      .from("applications")
      .select("id, company, position, status, applied_date, location, updated_at")
      .order("updated_at", { ascending: false })
      .limit(40),
    supabase
      .from("interviews")
      .select("interview_type, scheduled_at, interviewer, status, application_id")
      .order("scheduled_at", { ascending: true })
      .limit(20),
    supabase
      .from("tasks")
      .select("title, priority, due_date, completed, application_id")
      .eq("completed", false)
      .order("due_date", { ascending: true })
      .limit(25),
  ]);

  const appRows = apps.data ?? [];
  const appName = (id: string | null) => {
    const found = appRows.find((a) => a.id === id);
    return found ? `${found.company} — ${found.position}` : "unlinked";
  };

  return buildPrompt([
    {
      label: "APPLICATIONS",
      body: appRows.length
        ? appRows
            .map(
              (a) =>
                `- ${a.company} — ${a.position} | status: ${a.status}${a.applied_date ? ` | applied ${a.applied_date}` : ""}${a.location ? ` | ${a.location}` : ""} | last updated ${a.updated_at.slice(0, 10)}`,
            )
            .join("\n")
        : "No applications recorded.",
    },
    {
      label: "INTERVIEWS",
      body: (interviews.data ?? []).length
        ? (interviews.data ?? [])
            .map(
              (i) =>
                `- ${appName(i.application_id)} | ${i.interview_type} | ${i.scheduled_at ?? "unscheduled"} | ${i.status}${i.interviewer ? ` | with ${i.interviewer}` : ""}`,
            )
            .join("\n")
        : "No interviews recorded.",
    },
    {
      label: "OPEN TASKS",
      body: (tasks.data ?? []).length
        ? (tasks.data ?? [])
            .map(
              (t) =>
                `- ${t.title} (${t.priority}${t.due_date ? `, due ${t.due_date}` : ""}) → ${appName(t.application_id)}`,
            )
            .join("\n")
        : "No open tasks.",
    },
  ]);
}
