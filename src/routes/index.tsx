import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Briefcase,
  CalendarDays,
  Mail,
  Brain,
  Search,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Career Assistant — Job Tracker & AI Career Workspace" },
      {
        name: "description",
        content:
          "Track job applications, manage interviews and tasks, and use AI to draft emails, summarize interview notes, plan prep and research companies.",
      },
      { property: "og:title", content: "AI Career Assistant — Job Tracker & AI Workspace" },
      {
        property: "og:description",
        content:
          "One calm workspace for your whole job search: applications, interviews, tasks and an AI assistant that knows your context.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Briefcase,
    title: "Application tracker",
    body: "Table, card and drag-and-drop Kanban views across every stage from saved to accepted.",
  },
  {
    icon: CalendarDays,
    title: "Interview management",
    body: "Types, times, interviewers, meeting links and prep tasks in one place.",
  },
  {
    icon: Mail,
    title: "Smart email drafts",
    body: "Follow-ups, thank-yous and negotiation emails written with your application context.",
  },
  {
    icon: Brain,
    title: "AI task planner",
    body: "Turn “prepare me for Thursday” into a reviewable, editable prep plan.",
  },
  {
    icon: Search,
    title: "Research assistant",
    body: "Structured company and role research with likely interview topics.",
  },
  {
    icon: MessageCircle,
    title: "Career chat",
    body: "Ask what's due today or which applications went quiet — grounded in your own data.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4.5" aria-hidden="true" />
          </span>
          <span className="truncate font-display text-base font-extrabold">AI Career Assistant</span>
        </div>
        <Button asChild>
          <Link to="/auth" search={{ redirect: "/dashboard" }}>
            Sign in
          </Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-4 pb-14 pt-10 text-center sm:px-6 sm:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ai-border bg-ai px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5 text-ai-accent" aria-hidden="true" />
            AI suggests, you decide
          </span>
          <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl">
            Run your entire job search from one calm workspace
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Track applications and interviews, keep your prep tasks honest, and let an AI assistant
            that actually knows your context draft the emails, summaries and plans — always editable
            before you use them.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ redirect: "/dashboard" }}>
                Get started <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth" search={{ redirect: "/applications" }}>
                See the tracker
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="sr-only">Features</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="surface-card p-5">
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <feature.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <p className="mx-auto max-w-3xl px-4 text-center text-xs leading-relaxed text-muted-foreground">
          AI-generated content may contain errors or inaccuracies. Review and verify important
          information before relying on it or sharing it.
        </p>
      </footer>
    </div>
  );
}
