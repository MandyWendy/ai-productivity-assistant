import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ApplicationRow = {
  id: string;
  company: string;
  position: string;
  job_description: string | null;
  job_url: string | null;
  location: string | null;
  work_mode: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  applied_date: string | null;
  status: string;
  source: string | null;
  recruiter_name: string | null;
  recruiter_email: string | null;
  notes: string | null;
  resume_used: string | null;
  cover_letter: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type InterviewRow = {
  id: string;
  application_id: string | null;
  interview_type: string;
  scheduled_at: string | null;
  duration_minutes: number;
  interviewer: string | null;
  meeting_url: string | null;
  location: string | null;
  notes: string | null;
  status: string;
};

export type TaskRow = {
  id: string;
  application_id: string | null;
  interview_id: string | null;
  title: string;
  description: string | null;
  priority: string;
  due_date: string | null;
  estimated_minutes: number | null;
  category: string | null;
  completed: boolean;
  created_at: string;
};

export type NoteRow = {
  id: string;
  application_id: string | null;
  interview_id: string | null;
  title: string | null;
  content: string;
  ai_summary: unknown;
  source: string;
  created_at: string;
};

export type ContactRow = {
  id: string;
  application_id: string | null;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export type EmailDraftRow = {
  id: string;
  application_id: string | null;
  purpose: string;
  tone: string;
  subject: string;
  body: string;
  status: string;
  created_at: string;
};

export type ActivityRow = {
  id: string;
  kind: string;
  message: string;
  created_at: string;
};

async function must<T>(res: { data: T | null; error: { message: string } | null }): Promise<T> {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const applicationsQuery = () =>
  queryOptions({
    queryKey: ["applications"],
    queryFn: () =>
      must<ApplicationRow[]>(
        supabase.from("applications").select("*").order("updated_at", { ascending: false }) as never,
      ),
  });

export const applicationQuery = (id: string) =>
  queryOptions({
    queryKey: ["applications", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as ApplicationRow | null;
    },
  });

export const interviewsQuery = () =>
  queryOptions({
    queryKey: ["interviews"],
    queryFn: () =>
      must<InterviewRow[]>(
        supabase
          .from("interviews")
          .select("*")
          .order("scheduled_at", { ascending: true }) as never,
      ),
  });

export const tasksQuery = () =>
  queryOptions({
    queryKey: ["tasks"],
    queryFn: () =>
      must<TaskRow[]>(
        supabase
          .from("tasks")
          .select("*")
          .order("due_date", { ascending: true, nullsFirst: false }) as never,
      ),
  });

export const notesQuery = (applicationId?: string) =>
  queryOptions({
    queryKey: ["notes", applicationId ?? "all"],
    queryFn: () => {
      let q = supabase.from("notes").select("*").order("created_at", { ascending: false });
      if (applicationId) q = q.eq("application_id", applicationId);
      return must<NoteRow[]>(q as never);
    },
  });

export const contactsQuery = (applicationId: string) =>
  queryOptions({
    queryKey: ["contacts", applicationId],
    queryFn: () =>
      must<ContactRow[]>(
        supabase.from("contacts").select("*").eq("application_id", applicationId) as never,
      ),
  });

export const emailDraftsQuery = (applicationId?: string) =>
  queryOptions({
    queryKey: ["email_drafts", applicationId ?? "all"],
    queryFn: () => {
      let q = supabase.from("email_drafts").select("*").order("created_at", { ascending: false });
      if (applicationId) q = q.eq("application_id", applicationId);
      return must<EmailDraftRow[]>(q as never);
    },
  });

export const researchQuery = () =>
  queryOptions({
    queryKey: ["research_sessions"],
    queryFn: () =>
      must<{ id: string; topic: string; kind: string; result: unknown; created_at: string }[]>(
        supabase
          .from("research_sessions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20) as never,
      ),
  });

export const activityQuery = () =>
  queryOptions({
    queryKey: ["activity_log"],
    queryFn: () =>
      must<ActivityRow[]>(
        supabase
          .from("activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(12) as never,
      ),
  });

export const profileQuery = () =>
  queryOptions({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
      if (error) throw new Error(error.message);
      return data as {
        id: string;
        full_name: string | null;
        headline: string | null;
        location: string | null;
        target_role: string | null;
        skills: string[];
        preferred_tone: string;
      } | null;
    },
  });

export async function logActivity(kind: string, message: string, applicationId?: string | null) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("activity_log").insert({
    user_id: data.user.id,
    kind,
    message,
    application_id: applicationId ?? null,
  });
}
