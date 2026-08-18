import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  chatInputSchema,
  emailInputSchema,
  notesInputSchema,
  plannerInputSchema,
  researchInputSchema,
} from "./ai-schemas";

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => emailInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { generateEmailDraft } = await import("./ai-handlers.server");
    return generateEmailDraft(context.supabase, data);
  });

export const summarizeNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => notesInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { summarizeMeetingNotes } = await import("./ai-handlers.server");
    return summarizeMeetingNotes(context.supabase, data);
  });

export const planTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => plannerInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { generateTaskPlan } = await import("./ai-handlers.server");
    return generateTaskPlan(context.supabase, data);
  });

export const researchTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => researchInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { runResearch } = await import("./ai-handlers.server");
    return runResearch(context.supabase, data);
  });

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => chatInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { askCareerAssistant } = await import("./ai-handlers.server");
    return askCareerAssistant(context.supabase, data);
  });

export const analyzeDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { applicationId: string }) => data)
  .handler(async ({ data, context }) => {
    const { analyzeJobDescription } = await import("./ai-handlers.server");
    return analyzeJobDescription(context.supabase, data);
  });
