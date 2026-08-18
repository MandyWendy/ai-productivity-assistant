import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search, LayoutGrid, Table2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { ApplicationForm } from "@/components/applications/ApplicationForm";
import { KanbanBoard } from "@/components/applications/KanbanBoard";
import { CardSkeletons, EmptyState, ErrorState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { applicationsQuery, logActivity, type ApplicationRow } from "@/lib/queries";
import {
  APPLICATION_STATUSES,
  STATUS_BADGE,
  STATUS_LABELS,
  formatSalary,
  type ApplicationStatus,
} from "@/lib/domain";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/applications/")({
  head: () => ({
    meta: [
      { title: "Applications — AI Career Assistant" },
      {
        name: "description",
        content:
          "Track every job application across a drag-and-drop board or a sortable table, from saved through offer.",
      },
      { property: "og:title", content: "Applications — AI Career Assistant" },
      {
        property: "og:description",
        content: "A Kanban board and table for your whole application pipeline.",
      },
    ],
  }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const apps = useQuery(applicationsQuery());

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (apps.data ?? []).filter((app) => {
      const matchesTerm =
        !term ||
        app.company.toLowerCase().includes(term) ||
        app.position.toLowerCase().includes(term) ||
        (app.location ?? "").toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [apps.data, query, statusFilter]);

  const move = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
      const app = (apps.data ?? []).find((item) => item.id === id);
      await logActivity(
        "status_changed",
        `Moved ${app?.position ?? "application"} at ${app?.company ?? ""} to ${STATUS_LABELS[status]}`,
        id,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
      void queryClient.invalidateQueries({ queryKey: ["activity_log"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell
      title="Applications"
      description="Your full pipeline, your way"
      actions={
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      }
    >
      <ApplicationForm open={formOpen} onOpenChange={setFormOpen} />

      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="pl-9"
              placeholder="Search company, role or location"
              aria-label="Search applications"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {APPLICATION_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {apps.isError ? (
          <ErrorState message={(apps.error as Error).message} onRetry={() => void apps.refetch()} />
        ) : apps.isLoading ? (
          <CardSkeletons count={4} />
        ) : (apps.data ?? []).length === 0 ? (
          <EmptyState
            icon={<Briefcase className="size-5" aria-hidden="true" />}
            title="No applications yet"
            description="Add the first role you're chasing and the assistant can start helping with emails, prep and research."
            action={<Button onClick={() => setFormOpen(true)}>Add your first application</Button>}
          />
        ) : (
          <Tabs defaultValue="board">
            <TabsList className="mb-4">
              <TabsTrigger value="board">
                <LayoutGrid className="size-4" aria-hidden="true" /> Board
              </TabsTrigger>
              <TabsTrigger value="table">
                <Table2 className="size-4" aria-hidden="true" /> Table
              </TabsTrigger>
            </TabsList>

            <TabsContent value="board">
              <KanbanBoard
                applications={filtered}
                onStatusChange={(id, status) => move.mutate({ id, status })}
              />
            </TabsContent>

            <TabsContent value="table">
              <ApplicationsTable applications={filtered} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppShell>
  );
}

function ApplicationsTable({ applications }: { applications: ApplicationRow[] }) {
  if (applications.length === 0) {
    return (
      <EmptyState title="No matches" description="Try a different search term or status filter." />
    );
  }

  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full min-w-[46rem] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="px-4 py-3 font-semibold">Role</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            <th scope="col" className="px-4 py-3 font-semibold">Location</th>
            <th scope="col" className="px-4 py-3 font-semibold">Salary</th>
            <th scope="col" className="px-4 py-3 font-semibold">Applied</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-b border-border/70 last:border-0">
              <td className="px-4 py-3">
                <Link
                  to="/applications/$applicationId"
                  params={{ applicationId: app.id }}
                  className="font-semibold underline-offset-2 hover:underline"
                >
                  {app.position}
                </Link>
                <span className="block text-xs text-muted-foreground">{app.company}</span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-semibold",
                    STATUS_BADGE[app.status as ApplicationStatus],
                  )}
                >
                  {STATUS_LABELS[app.status as ApplicationStatus] ?? app.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{app.location ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatSalary(app.salary_min, app.salary_max, app.salary_currency) ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{app.applied_date ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
