import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Archive, Eye, MoreHorizontal, Pencil, Play, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { talentActions } from "@/lib/store";
import type { Job } from "@/lib/types";
import { activationProblems, jobToForm } from "./job-form-schema";

type Confirm = null | "delete" | "close";

export function activateJob(job: Job) {
  const problems = activationProblems(jobToForm(job));
  if (problems.length) {
    toast.error("This job isn't ready to activate", { description: problems.join(" ") });
    return false;
  }
  talentActions.setJobStatus(job.id, "ACTIVE");
  toast.success("Job activated", { description: job.title });
  return true;
}

export function JobActionsMenu({ job, showView = true, afterDelete }: { job: Job; showView?: boolean; afterDelete?: (() => void) | undefined }) {
  const [confirm, setConfirm] = useState<Confirm>(null);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Job actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {showView && (
            <DropdownMenuItem asChild>
              <Link to="/jobs/$id" params={{ id: job.id }}><Eye /> View details</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to="/jobs/$id/edit" params={{ id: job.id }}><Pencil /> Edit</Link>
          </DropdownMenuItem>
          {job.status === "ACTIVE" && (
            <DropdownMenuItem asChild>
              <Link to="/jobs/$id/matches" params={{ id: job.id }}><Sparkles /> View matches</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {job.status !== "ACTIVE" && (
            <DropdownMenuItem onSelect={() => activateJob(job)}><Play /> Activate</DropdownMenuItem>
          )}
          {job.status === "ACTIVE" && (
            <DropdownMenuItem onSelect={() => setConfirm("close")}><Archive /> Close job</DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setConfirm("delete")} className="text-destructive focus:text-destructive">
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <JobConfirmDialogs job={job} confirm={confirm} onChange={setConfirm} afterDelete={afterDelete} />
    </>
  );
}

export function JobConfirmDialogs({
  job,
  confirm,
  onChange,
  afterDelete,
}: {
  job: Job;
  confirm: Confirm;
  onChange: (c: Confirm) => void;
  afterDelete?: (() => void) | undefined;
}) {
  return (
    <>
      <AlertDialog open={confirm === "close"} onOpenChange={(o) => !o && onChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close “{job.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The job stops accepting new evaluations. Existing evaluation results stay available, and you can reactivate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                talentActions.setJobStatus(job.id, "CLOSED");
                toast.success("Job closed", { description: job.title });
              }}
            >
              Close job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirm === "delete"} onOpenChange={(o) => !o && onChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{job.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the job, its requirements, and its evaluation results. Candidates in your pool are not affected. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => {
                talentActions.deleteJob(job.id);
                toast.success("Job deleted", { description: job.title });
                afterDelete?.();
              }}
            >
              Delete job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function useJobConfirm() {
  const [confirm, setConfirm] = useState<Confirm>(null);
  const navigate = useNavigate();
  return { confirm, setConfirm, goToJobs: () => navigate({ to: "/jobs" }) };
}
