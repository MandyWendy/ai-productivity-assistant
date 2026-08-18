export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const PIPELINE_STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
];

export const BOARD_STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "accepted",
  "rejected",
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

/** Status badge classes built from design tokens (never raw colors). */
export const STATUS_BADGE: Record<ApplicationStatus, string> = {
  saved: "border-status-saved/30 text-status-saved bg-status-saved/10",
  applied: "border-status-applied/30 text-status-applied bg-status-applied/10",
  screening: "border-status-screening/35 text-status-screening bg-status-screening/10",
  interview: "border-status-interview/35 text-status-interview bg-status-interview/10",
  offer: "border-status-offer/35 text-status-offer bg-status-offer/10",
  accepted: "border-status-accepted/35 text-status-accepted bg-status-accepted/10",
  rejected: "border-status-rejected/35 text-status-rejected bg-status-rejected/10",
  withdrawn: "border-status-withdrawn/30 text-status-withdrawn bg-status-withdrawn/10",
};

export const WORK_MODES = ["remote", "hybrid", "on-site"] as const;
export const EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
  "temporary",
] as const;

export const INTERVIEW_TYPES = [
  "recruiter-screen",
  "phone-screen",
  "technical",
  "behavioral",
  "system-design",
  "hiring-manager",
  "final",
] as const;
export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  "recruiter-screen": "Recruiter screen",
  "phone-screen": "Phone screen",
  technical: "Technical",
  behavioral: "Behavioral",
  "system-design": "System design",
  "hiring-manager": "Hiring manager",
  final: "Final interview",
};

export const INTERVIEW_STATUSES = ["scheduled", "completed", "cancelled"] as const;

export const TASK_PRIORITIES = ["high", "medium", "low"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const PRIORITY_BADGE: Record<TaskPriority, string> = {
  high: "border-status-rejected/35 text-status-rejected bg-status-rejected/10",
  medium: "border-status-screening/35 text-status-screening bg-status-screening/10",
  low: "border-status-saved/30 text-status-saved bg-status-saved/10",
};

export const EMAIL_PURPOSES = [
  { value: "follow-up", label: "Application follow-up" },
  { value: "thank-you", label: "Interview thank-you" },
  { value: "confirmation", label: "Interview confirmation" },
  { value: "recruiter-response", label: "Recruiter response" },
  { value: "status-update", label: "Asking for an update" },
  { value: "networking", label: "Networking" },
  { value: "referral", label: "Referral request" },
  { value: "negotiation", label: "Salary negotiation" },
  { value: "rejection-response", label: "Rejection response" },
  { value: "custom", label: "Custom" },
] as const;

export const EMAIL_TONES = ["professional", "friendly", "concise", "warm", "formal"] as const;

export const RESEARCH_KINDS = [
  { value: "company", label: "Company" },
  { value: "position", label: "Position" },
  { value: "industry", label: "Industry" },
  { value: "interview-topic", label: "Interview topic" },
  { value: "technology", label: "Technology" },
  { value: "competitors", label: "Competitors" },
  { value: "product", label: "Product" },
  { value: "recent-developments", label: "Recent developments" },
] as const;

export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null,
): string | null {
  if (min == null && max == null) return null;
  const c = currency ?? "USD";
  const fmt = (n: number) => `${n.toLocaleString()}`;
  if (min != null && max != null) return `${c} ${fmt(min)} – ${fmt(max)}`;
  return `${c} ${fmt((min ?? max) as number)}`;
}
