import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity, type ApplicationRow } from "@/lib/queries";
import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  STATUS_LABELS,
  WORK_MODES,
  type ApplicationStatus,
} from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormState = {
  company: string;
  position: string;
  location: string;
  work_mode: string;
  employment_type: string;
  status: ApplicationStatus;
  applied_date: string;
  salary_min: string;
  salary_max: string;
  job_url: string;
  source: string;
  recruiter_name: string;
  recruiter_email: string;
  job_description: string;
  notes: string;
};

function toState(app?: ApplicationRow | null): FormState {
  return {
    company: app?.company ?? "",
    position: app?.position ?? "",
    location: app?.location ?? "",
    work_mode: app?.work_mode ?? "remote",
    employment_type: app?.employment_type ?? "full-time",
    status: (app?.status as ApplicationStatus) ?? "saved",
    applied_date: app?.applied_date ?? "",
    salary_min: app?.salary_min != null ? String(app.salary_min) : "",
    salary_max: app?.salary_max != null ? String(app.salary_max) : "",
    job_url: app?.job_url ?? "",
    source: app?.source ?? "",
    recruiter_name: app?.recruiter_name ?? "",
    recruiter_email: app?.recruiter_email ?? "",
    job_description: app?.job_description ?? "",
    notes: app?.notes ?? "",
  };
}

export function ApplicationForm({
  open,
  onOpenChange,
  application,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: ApplicationRow | null;
}) {
  const [form, setForm] = useState<FormState>(() => toState(application));
  const [seeded, setSeeded] = useState(application?.id ?? "new");
  const queryClient = useQueryClient();

  const key = application?.id ?? "new";
  if (open && seeded !== key) {
    setSeeded(key);
    setForm(toState(application));
  }

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!form.company.trim() || !form.position.trim()) {
        throw new Error("Company and position are required.");
      }
      const payload = {
        company: form.company.trim(),
        position: form.position.trim(),
        location: form.location.trim() || null,
        work_mode: form.work_mode,
        employment_type: form.employment_type,
        status: form.status,
        applied_date: form.applied_date || null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        job_url: form.job_url.trim() || null,
        source: form.source.trim() || null,
        recruiter_name: form.recruiter_name.trim() || null,
        recruiter_email: form.recruiter_email.trim() || null,
        job_description: form.job_description.trim() || null,
        notes: form.notes.trim() || null,
      };

      if (application?.id) {
        const { error } = await supabase
          .from("applications")
          .update(payload)
          .eq("id", application.id);
        if (error) throw new Error(error.message);
        await logActivity(
          "application_updated",
          `Updated ${payload.position} at ${payload.company}`,
          application.id,
        );
        return application.id;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("You need to be signed in.");
      const { data, error } = await supabase
        .from("applications")
        .insert({ ...payload, user_id: userData.user.id })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await logActivity(
        "application_created",
        `Added ${payload.position} at ${payload.company}`,
        data.id,
      );
      return data.id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
      void queryClient.invalidateQueries({ queryKey: ["activity_log"] });
      toast.success(application?.id ? "Application updated" : "Application added");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {application?.id ? "Edit application" : "Add application"}
          </DialogTitle>
          <DialogDescription>
            Only company and position are required — you can fill in the rest later.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="app-company">Company *</Label>
            <Input
              id="app-company"
              required
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-position">Position *</Label>
            <Input
              id="app-position"
              required
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-location">Location</Label>
            <Input
              id="app-location"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) => set("status", value as ApplicationStatus)}
            >
              <SelectTrigger id="app-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-work-mode">Work mode</Label>
            <Select value={form.work_mode} onValueChange={(value) => set("work_mode", value)}>
              <SelectTrigger id="app-work-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-employment">Employment type</Label>
            <Select
              value={form.employment_type}
              onValueChange={(value) => set("employment_type", value)}
            >
              <SelectTrigger id="app-employment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-applied">Applied date</Label>
            <Input
              id="app-applied"
              type="date"
              value={form.applied_date}
              onChange={(e) => set("applied_date", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-source">Source</Label>
            <Input
              id="app-source"
              placeholder="LinkedIn, referral, careers page…"
              value={form.source}
              onChange={(e) => set("source", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-salary-min">Salary min</Label>
            <Input
              id="app-salary-min"
              type="number"
              min={0}
              value={form.salary_min}
              onChange={(e) => set("salary_min", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-salary-max">Salary max</Label>
            <Input
              id="app-salary-max"
              type="number"
              min={0}
              value={form.salary_max}
              onChange={(e) => set("salary_max", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-recruiter">Recruiter name</Label>
            <Input
              id="app-recruiter"
              value={form.recruiter_name}
              onChange={(e) => set("recruiter_name", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-recruiter-email">Recruiter email</Label>
            <Input
              id="app-recruiter-email"
              type="email"
              value={form.recruiter_email}
              onChange={(e) => set("recruiter_email", e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="app-url">Job posting URL</Label>
            <Input
              id="app-url"
              type="url"
              value={form.job_url}
              onChange={(e) => set("job_url", e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="app-jd">Job description</Label>
            <Textarea
              id="app-jd"
              rows={5}
              placeholder="Paste the posting here — the assistant uses it for context."
              value={form.job_description}
              onChange={(e) => set("job_description", e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="app-notes">Notes</Label>
            <Textarea
              id="app-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : application?.id ? "Save changes" : "Add application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
