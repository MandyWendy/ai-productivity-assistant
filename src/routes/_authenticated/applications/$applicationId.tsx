import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Pencil, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { ApplicationForm } from "@/components/applications/ApplicationForm";
import { AiDisclaimer, AiBadge } from "@/components/ai/AiPanel";
import { CardSkeletons, EmptyState, ErrorState, InlineSpinner } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  applicationQuery,
  interviewsQuery,
  tasksQuery,
  notesQuery,
  emailDraftsQuery,
  logActivity,
} from "@/lib/queries";
import { STATUS_BADGE, STATUS_LABELS, formatSalary, type ApplicationStatus } from "@/lib/domain";
import { analyzeDescription } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/applications/$applicationId")({
  head: () => ({
    meta: [
      { title: "Application details — AI Career Assistant" },
      {
        name: "description",
        content:
          "Everything about one application: role details, interviews, tasks, notes, email drafts and AI insights.",
      },
      { property: "og:title", content: "Application details — AI Career Assistant" },
      {
        property: "og:description",
        content: "Role details, interviews, tasks, notes and AI insights for a single application.",
      },
    ],
  }),
  component: ApplicationDetail,
});

type Insight = {
  summary?: string;
  keyRequirements?: string[];
  requiredSkills?: string[];
  suggestedTalkingPoints?: string[];
  likelyQuestions?: string[];
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-4 sm:p-5">
      <h2 className="mb-3 font-display text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1.5 text-sm">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ApplicationDetail() {
  const { applicationId } = Route.useParams();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);

  const app = useQuery(applicationQuery(applicationId));
  const interviews = useQuery(interviewsQuery());
  const tasks = useQuery(tasksQuery());
  const notes = useQuery(notesQuery(applicationId));
  const drafts = useQuery(emailDraftsQuery(applicationId));

  const analyze = useMutation({
    mutationFn: async () => analyzeDescription({ data: { applicationId } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setInsight(result.data as Insight);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("applications").delete().eq("id", applicationId);
      if (error) throw new Error(error.message);
      await logActivity("application_deleted", `Deleted ${app.data?.position ?? "an application"}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application deleted");
      window.location.href = "/applications";
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (app.isLoading) {
    return (
      <AppShell title="Application">
        <CardSkeletons count={3} />
      </AppShell>
    );
  }

  if (app.isError) {
    return (
      <AppShell title="Application">
        <ErrorState message={(app.error as Error).message} onRetry={() => void app.refetch()} />
      </AppShell>
    );
  }

  const data = app.data;
  if (!data) {
    return (
      <AppShell title="Application">
        <EmptyState
          title="Application not found"
          description="It may have been deleted."
          action={
            <Button asChild variant="outline">
              <Link to="/applications">Back to applications</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const relatedInterviews = (interviews.data ?? []).filter(
    (item) => item.application_id === applicationId,
  );
  const relatedTasks = (tasks.data ?? []).filter((item) => item.application_id === applicationId);

  return (
    <AppShell
      title={data.position}
      description={data.company}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Delete application">
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the application along with its interviews, tasks and
                  notes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => remove.mutate()}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
    >
      <ApplicationForm open={editOpen} onOpenChange={setEditOpen} application={data} />

      <div className="space-y-5">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/applications">
            <ArrowLeft className="size-4" aria-hidden="true" /> All applications
          </Link>
        </Button>

        <Section title="Overview">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-semibold",
                STATUS_BADGE[data.status as ApplicationStatus],
              )}
            >
              {STATUS_LABELS[data.status as ApplicationStatus] ?? data.status}
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs">
              {data.work_mode}
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs">
              {data.employment_type}
            </span>
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Location", data.location ?? "—"],
              ["Applied", data.applied_date ?? "Not applied yet"],
              [
                "Salary",
                formatSalary(data.salary_min, data.salary_max, data.salary_currency) ?? "—",
              ],
              ["Source", data.source ?? "—"],
              ["Recruiter", data.recruiter_name ?? "—"],
              ["Recruiter email", data.recruiter_email ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
                <dd className="truncate text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          {data.job_url ? (
            <Button asChild variant="outline" size="sm" className="mt-4">
              <a href={data.job_url} target="_blank" rel="noreferrer noopener">
                View posting <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </Button>
          ) : null}
        </Section>

        <section className="ai-surface p-4 sm:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold">Job description insights</h2>
              <p className="text-sm text-muted-foreground">
                Extract requirements, likely questions and talking points from the posting.
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0"
              disabled={analyze.isPending || !data.job_description}
              onClick={() => analyze.mutate()}
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Analyze
            </Button>
          </div>

          {!data.job_description ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Paste the job description into this application first — the assistant needs it for
              context.
            </p>
          ) : analyze.isPending ? (
            <div className="mt-4">
              <InlineSpinner label="Reading the job description…" />
            </div>
          ) : insight ? (
            <div className="mt-4 space-y-4">
              <AiBadge />
              {insight.summary ? <p className="text-sm leading-relaxed">{insight.summary}</p> : null}
              {[
                ["Key requirements", insight.keyRequirements],
                ["Required skills", insight.requiredSkills],
                ["Talking points", insight.suggestedTalkingPoints],
                ["Likely questions", insight.likelyQuestions],
              ].map(([label, items]) => (
                <div key={label as string}>
                  <h3 className="text-sm font-bold">{label as string}</h3>
                  <List items={items as string[] | undefined} />
                </div>
              ))}
              <AiDisclaimer />
            </div>
          ) : null}
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title={`Interviews (${relatedInterviews.length})`}>
            {relatedInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No interviews yet. Schedule one from the Interviews page.
              </p>
            ) : (
              <ul className="space-y-2">
                {relatedInterviews.map((item) => (
                  <li key={item.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-semibold">{item.interview_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.scheduled_at
                        ? new Date(item.scheduled_at).toLocaleString()
                        : "Unscheduled"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Tasks (${relatedTasks.length})`}>
            {relatedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks yet. The AI planner can build a prep plan for this role.
              </p>
            ) : (
              <ul className="space-y-2">
                {relatedTasks.map((task) => (
                  <li
                    key={task.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className={cn("truncate", task.completed && "line-through opacity-60")}>
                      {task.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {task.due_date ?? "No date"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <Section title="Notes">
          {data.notes ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{data.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No notes on this application yet.</p>
          )}
          {(notes.data ?? []).length > 0 ? (
            <ul className="mt-4 space-y-3">
              {(notes.data ?? []).map((note) => (
                <li key={note.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-semibold">{note.title ?? "Meeting note"}</p>
                  <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                    {note.content}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </Section>

        <Section title={`Email drafts (${(drafts.data ?? []).length})`}>
          {(drafts.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No drafts saved. Generate one from Smart Email.
            </p>
          ) : (
            <ul className="space-y-3">
              {(drafts.data ?? []).map((draft) => (
                <li key={draft.id} className="rounded-lg border border-border p-3">
                  <p className="truncate text-sm font-semibold">{draft.subject}</p>
                  <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {draft.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </AppShell>
  );
}
