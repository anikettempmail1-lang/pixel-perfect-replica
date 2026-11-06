import { useRef, useState, type DragEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  FileText,
  Loader2,
  Plus,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pill, type PillTone } from "@/components/shared/primitives";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/talent-utils";
import { MAX_FILES_PER_BATCH, type QueueItemStatus } from "@/lib/upload-service";
import { useResumeUploadQueue, type QueueItem } from "./use-resume-upload-queue";

const STATUS_INFO: Record<QueueItemStatus, { label: string; tone: PillTone }> = {
  WAITING: { label: "Waiting", tone: "neutral" },
  UPLOADING: { label: "Uploading", tone: "info" },
  UPLOADED: { label: "Uploaded", tone: "primary" },
  PROCESSING: { label: "Processing", tone: "info" },
  COMPLETED: { label: "Completed", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
};

export function ResumeUploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const queue = useResumeUploadQueue();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { counts, running, items } = queue;
  const finished = items.length > 0 && !running && counts.ready === 0 && counts.active === 0 && (counts.completed > 0 || counts.failed > 0);

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const res = queue.addFiles(Array.from(list));
    if (res.duplicates.length) {
      toast.warning(`${res.duplicates.length} duplicate file${res.duplicates.length > 1 ? "s" : ""} skipped`, {
        description: res.duplicates.slice(0, 3).join(", ") + (res.duplicates.length > 3 ? "…" : ""),
      });
    }
    if (res.overLimit) toast.error(`Batch limit is ${MAX_FILES_PER_BATCH} files — ${res.overLimit} not added.`);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (running) return;
    handleFiles(e.dataTransfer.files);
  };

  const startUpload = async () => {
    const n = counts.ready;
    toast.info(`Uploading ${n} resume${n === 1 ? "" : "s"}…`);
    await queue.start();
    toast.success("Upload batch finished", { description: "Check each file's status below." });
  };

  const close = (o: boolean) => {
    if (!o && running) toast("Uploads continue in the background.");
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-5 text-left">
          <DialogTitle>Upload resumes</DialogTitle>
          <DialogDescription>Add multiple PDF resumes. Each one is parsed into a candidate profile.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!running) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !running && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition-colors",
              items.length ? "py-6" : "py-12",
              dragging ? "border-primary bg-primary-soft/60" : "border-border bg-surface hover:border-primary/40",
              running && "cursor-not-allowed opacity-60",
            )}
          >
            <div className="grid size-10 place-items-center rounded-lg border bg-card shadow-card">
              <UploadCloud className="size-5 text-primary" />
            </div>
            <p className="mt-3 text-sm font-medium">
              {dragging ? "Drop to add files" : items.length ? "Drop more PDFs or click to add" : "Drag & drop PDF resumes here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF only · up to 10 MB each · max {MAX_FILES_PER_BATCH} per batch
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {items.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  {counts.total} file{counts.total === 1 ? "" : "s"}
                  {counts.invalid > 0 && ` · ${counts.invalid} invalid`}
                  {counts.completed > 0 && ` · ${counts.completed} completed`}
                  {counts.failed > 0 && ` · ${counts.failed} failed`}
                </span>
                {!running && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
                      <Plus /> Add files
                    </Button>
                    <Button variant="ghost" size="sm" onClick={queue.clear}>
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
              <ul className="divide-y rounded-xl border">
                {items.map((item) => (
                  <QueueRow key={item.key} item={item} onRemove={() => queue.remove(item.key)} onRetry={() => queue.retry(item.key)} onNavigate={() => onOpenChange(false)} />
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 border-t bg-surface px-6 py-4 sm:justify-between">
          <p className="hidden text-xs text-muted-foreground sm:block">Mock upload — no files leave your browser.</p>
          <div className="flex gap-2">
            {finished ? (
              <>
                <Button variant="outline" onClick={queue.clear}>
                  Upload more
                </Button>
                <Button asChild onClick={() => onOpenChange(false)}>
                  <Link to="/candidates">View candidates</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => close(false)}>
                  {running ? "Hide" : "Cancel"}
                </Button>
                <Button onClick={startUpload} disabled={running || counts.ready === 0}>
                  {running ? <Loader2 className="animate-spin" /> : <UploadCloud />}
                  {running ? "Uploading…" : `Upload ${counts.ready || ""} ${counts.ready === 1 ? "file" : "files"}`.replace("  ", " ")}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QueueRow({ item, onRemove, onRetry, onNavigate }: { item: QueueItem; onRemove: () => void; onRetry: () => void; onNavigate: () => void }) {
  const info = STATUS_INFO[item.status];
  const busy = item.status === "UPLOADING" || item.status === "PROCESSING" || item.status === "UPLOADED";
  const Icon = item.invalidReason || item.status === "FAILED" ? AlertCircle : item.status === "COMPLETED" ? CheckCircle2 : busy ? Loader2 : CircleDashed;
  return (
    <li className="flex items-start gap-3 px-3 py-3 sm:px-4">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
        <FileText className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium" title={item.file.name}>
            {item.file.name}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{formatFileSize(item.file.size)}</p>
        {item.status === "UPLOADING" && <Progress value={item.progress} className="mt-2 h-1" />}
        {item.status === "PROCESSING" && <p className="mt-1 text-xs text-info">Extracting candidate details…</p>}
        {item.invalidReason && <p className="mt-1 text-xs text-destructive">{item.invalidReason}</p>}
        {item.error && <p className="mt-1 text-xs text-destructive">{item.error}</p>}
        {item.warning && item.status === "WAITING" && !item.invalidReason && <p className="mt-1 text-xs text-warning-foreground">{item.warning}</p>}
        {item.status === "COMPLETED" && item.candidateId && (
          <Link to="/candidates/$id" params={{ id: item.candidateId }} onClick={onNavigate} className="mt-1 inline-block text-xs text-primary hover:underline">
            View profile
          </Link>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {item.invalidReason ? (
          <Pill tone="danger">Invalid</Pill>
        ) : (
          <Pill tone={info.tone}>
            <Icon className={cn("size-3", busy && "animate-spin")} />
            {item.status === "UPLOADING" ? `${item.progress}%` : info.label}
          </Pill>
        )}
        {item.status === "FAILED" && (
          <Button variant="ghost" size="icon" className="size-7" onClick={onRetry} aria-label="Retry">
            <RotateCcw className="size-3.5" />
          </Button>
        )}
        {(item.status === "WAITING" || item.invalidReason) && (
          <Button variant="ghost" size="icon" className="size-7" onClick={onRemove} aria-label={`Remove ${item.file.name}`}>
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    </li>
  );
}
