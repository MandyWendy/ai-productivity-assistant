import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Link } from "@tanstack/react-router";
import { MapPin, GripVertical } from "lucide-react";
import { BOARD_STATUSES, STATUS_BADGE, STATUS_LABELS, type ApplicationStatus } from "@/lib/domain";
import type { ApplicationRow } from "@/lib/queries";
import { cn } from "@/lib/utils";

function Card({ app, dragging }: { app: ApplicationRow; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "surface-card p-3 transition-shadow",
        dragging ? "shadow-card ring-2 ring-ring" : "hover:shadow-soft",
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{app.position}</p>
          <p className="truncate text-xs text-muted-foreground">{app.company}</p>
          {app.location ? (
            <p className="mt-1.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{app.location}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DraggableCard({ app }: { app: ApplicationRow }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: app.id });

  return (
    <li ref={setNodeRef} className={cn(isDragging && "opacity-40")}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <Card app={app} />
      </div>
      <Link
        to="/applications/$applicationId"
        params={{ applicationId: app.id }}
        className="mt-1 inline-block px-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Open details
      </Link>
    </li>
  );
}

function Column({
  status,
  apps,
}: {
  status: ApplicationStatus;
  apps: ApplicationRow[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border border-border bg-secondary/40 p-3",
        isOver && "border-ring bg-secondary",
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 text-sm font-bold">
          <span
            className={cn("rounded-full border px-2 py-0.5 text-xs", STATUS_BADGE[status])}
          >
            {STATUS_LABELS[status]}
          </span>
        </h3>
        <span className="shrink-0 text-xs text-muted-foreground">{apps.length}</span>
      </header>
      <ul className="flex flex-col gap-2">
        {apps.map((app) => (
          <DraggableCard key={app.id} app={app} />
        ))}
        {apps.length === 0 ? (
          <li className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            Drop applications here
          </li>
        ) : null}
      </ul>
    </section>
  );
}

export function KanbanBoard({
  applications,
  onStatusChange,
}: {
  applications: ApplicationRow[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

  const grouped = useMemo(() => {
    const map = new Map<ApplicationStatus, ApplicationRow[]>();
    for (const status of BOARD_STATUSES) map.set(status, []);
    for (const app of applications) {
      const list = map.get(app.status as ApplicationStatus);
      if (list) list.push(app);
    }
    return map;
  }, [applications]);

  const activeApp = applications.find((app) => app.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const overId = event.over?.id;
    if (!overId) return;
    const status = String(overId) as ApplicationStatus;
    if (!BOARD_STATUSES.includes(status)) return;
    const app = applications.find((item) => item.id === String(event.active.id));
    if (!app || app.status === status) return;
    onStatusChange(app.id, status);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">
        <div className="flex gap-3">
          {BOARD_STATUSES.map((status) => (
            <Column key={status} status={status} apps={grouped.get(status) ?? []} />
          ))}
        </div>
      </div>
      <DragOverlay>{activeApp ? <Card app={activeApp} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}
