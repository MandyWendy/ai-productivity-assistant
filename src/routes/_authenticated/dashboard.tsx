import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  CalendarDays,
  CheckSquare,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ApplicationForm } from "@/components/applications/ApplicationForm";
import { EmptyState, ErrorState, CardSkeletons } from "@/components/common/states";
import { AiDisclaimer } from "@/components/ai/AiPanel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { applicationsQuery, interviewsQuery, tasksQuery, activityQuery } from "@/lib/queries";
import { PIPELINE_STATUSES, STATUS_BADGE, STATUS_LABELS, type ApplicationStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Career Assistant" },
      {
        name: "description",
        content:
          "Your job search command center: pipeline health, upcoming interviews, tasks due today and recent activity.",
      },
      { property: "og:title", content: "Dashboard — AI Career Assistant" },
      {
        property: "og:description",
        content: "Pipeline health, upcoming interviews and today's tasks in one view.",
      },
    ],
  }),
  component: DashboardPage,
});

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof Briefcase;
}) {
  return (
    <div className="surface-card p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold leading-none">{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "Unscheduled";
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DashboardPage() {
  const [formOpen, setFormOpen] = useState(false);
  const apps = useQuery(applicationsQuery());
  const interviews = useQuery(interviewsQuery());
  const tasks = useQuery(tasksQuery());
  const activity = useQuery(activityQuery());

  const applications = apps.data ?? [];
  const active = applications.filter((app) =>
    ["applied", "screening", "interview", "offer"].includes(app.status),
  );
  const now = Date.now();
  const upcoming = (interviews.data ?? []).filter(
    (item) => item.status === "scheduled" && item.scheduled_at && Date.parse(item.scheduled_at) >= now,
  );
  const openTasks = (tasks.data ?? []).filter((task) => !task.completed);
  const todayKey = new Date().toISOString().slice(0, 10);
  const dueToday = openTasks.filter((task) => task.due_date && task.due_date <= todayKey);
  const responded = applications.filter((app) =>
    ["screening", "interview", "offer", "accepted"].includes(app.status),
  ).length;
  const appliedTotal = applications.filter((app) => app.status !== "saved").length;
  const responseRate = appliedTotal ? Math.round((responded / appliedTotal) * 100) : 0;

  const appById = new Map(applications.map((app) => [app.id, app]));

  return (
    <AppShell
      title="Dashboard"
      description="Where your search stands today"
      actions={
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Add application</span>
        </Button>
      }
    >
      <ApplicationForm open={formOpen} onOpenChange={setFormOpen} />

      {apps.isError ? (
        <ErrorState message={(apps.error as Error).message} onRetry={() => void apps.refetch()} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active applications"
              value={apps.isLoading ? "—" : active.length}
              hint={`${applications.length} tracked in total`}
              icon={Briefcase}
            />
            <StatCard
              label="Upcoming interviews"
              value={interviews.isLoading ? "—" : upcoming.length}
              hint={upcoming[0] ? formatDateTime(upcoming[0].scheduled_at) : "Nothing scheduled"}
              icon={CalendarDays}
            />
            <StatCard
              label="Tasks due today"
              value={tasks.isLoading ? "—" : dueToday.length}
              hint={`${openTasks.length} open overall`}
              icon={CheckSquare}
            />
            <StatCard
              label="Response rate"
              value={`${responseRate}%`}
              hint={`${responded} of ${appliedTotal} moved forward`}
              icon={TrendingUp}
            />
          </div>

          <section className="surface-card p-4 sm:p-5">
            <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate font-display text-base font-bold">Pipeline</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/applications">
                  Open board <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </header>
            <div className="space-y-3">
              {PIPELINE_STATUSES.map((status) => {
                const count = applications.filter((app) => app.status === status).length;
                const pct = applications.length ? (count / applications.length) * 100 : 0;
                return (
                  <div key={status} className="grid gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs font-semibold",
                          STATUS_BADGE[status as ApplicationStatus],
                        )}
                      >
                        {STATUS_LABELS[status as ApplicationStatus]}
                      </span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="surface-card p-4 sm:p-5">
              <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate font-display text-base font-bold">Upcoming interviews</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/interviews">All</Link>
                </Button>
              </header>
              {interviews.isLoading ? (
                <CardSkeletons count={2} />
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No interviews scheduled yet. Add one from the Interviews page.
                </p>
              ) : (
                <ul className="space-y-3">
                  {upcoming.slice(0, 4).map((interview) => {
                    const app = interview.application_id
                      ? appById.get(interview.application_id)
                      : null;
                    return (
                      <li key={interview.id} className="rounded-lg border border-border p-3">
                        <p className="truncate text-sm font-semibold">
                          {app ? `${app.position} · ${app.company}` : "Interview"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDateTime(interview.scheduled_at)} · {interview.interview_type}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="surface-card p-4 sm:p-5">
              <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate font-display text-base font-bold">Tasks to do</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/tasks">All</Link>
                </Button>
              </header>
              {tasks.isLoading ? (
                <CardSkeletons count={2} />
              ) : openTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing open. Use the AI planner to build a prep plan.
                </p>
              ) : (
                <ul className="space-y-2">
                  {openTasks.slice(0, 6).map((task) => (
                    <li
                      key={task.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border px-3 py-2"
                    >
                      <span className="truncate text-sm">{task.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {task.due_date ?? "No date"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="surface-card p-4 sm:p-5">
            <h2 className="mb-4 font-display text-base font-bold">Recent activity</h2>
            {activity.isLoading ? (
              <CardSkeletons count={2} />
            ) : (activity.data ?? []).length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Add your first application to start building your history."
                action={<Button onClick={() => setFormOpen(true)}>Add application</Button>}
              />
            ) : (
              <ul className="space-y-2.5">
                {(activity.data ?? []).map((item) => (
                  <li key={item.id} className="flex min-w-0 items-start gap-3 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="min-w-0 flex-1">{item.message}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <AiDisclaimer />
        </div>
      )}
    </AppShell>
  );
}
