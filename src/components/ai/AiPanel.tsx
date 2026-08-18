import type { ReactNode } from "react";
import { Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-ai-border bg-ai px-2.5 py-1 text-xs font-semibold text-ai-foreground",
        className,
      )}
    >
      <Sparkles className="size-3.5 text-ai-accent" aria-hidden="true" />
      AI-generated
    </span>
  );
}

const DISCLAIMERS = {
  general:
    "AI-generated content may contain errors or inaccuracies. Review and verify important information before relying on it or sharing it.",
  email: "Review AI-generated emails carefully before sending. Nothing is sent automatically.",
  research:
    "Research results may be incomplete or outdated. Verify important information using original sources.",
  notes:
    "This is the assistant's interpretation of your notes, not a verified record of the meeting.",
} as const;

export function AiDisclaimer({
  variant = "general",
  className,
}: {
  variant?: keyof typeof DISCLAIMERS;
  className?: string;
}) {
  return (
    <p
      className={cn("flex items-start gap-2 text-xs leading-relaxed text-muted-foreground", className)}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{DISCLAIMERS[variant]}</span>
    </p>
  );
}

export function AiPanel({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="ai-surface p-4 sm:p-5">
      <header className="mb-4 flex min-w-0 items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-card text-ai-accent">
          <Sparkles className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </header>
      {children}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}
