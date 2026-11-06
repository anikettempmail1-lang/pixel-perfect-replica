import { useCallback, useRef, useState } from "react";
import { getTalentState, talentActions } from "@/lib/store";
import {
  MAX_FILES_PER_BATCH,
  fileKey,
  mockResumeUploadAdapter,
  validateResumeFile,
  type QueueItemStatus,
  type ResumeUploadAdapter,
} from "@/lib/upload-service";

export interface QueueItem {
  key: string;
  file: File;
  status: QueueItemStatus;
  progress: number;
  /** Validation error — item is excluded from upload. */
  invalidReason: string | null;
  /** Processing / upload failure message. */
  error: string | null;
  warning: string | null;
  candidateId: string | null;
}

export interface AddFilesResult {
  added: number;
  duplicates: string[];
  overLimit: number;
}

const CONCURRENCY = 3;

/** Queue state machine for multi-resume upload. Adapter is injectable for real backends. */
export function useResumeUploadQueue(adapter: ResumeUploadAdapter = mockResumeUploadAdapter) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const itemsRef = useRef<QueueItem[]>([]);
  itemsRef.current = items;

  const patch = useCallback((key: string, p: Partial<QueueItem>) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...p } : it)));
  }, []);

  const addFiles = useCallback((files: File[]): AddFilesResult => {
    const existing = new Set(itemsRef.current.map((i) => i.key));
    const poolNames = new Set(getTalentState().resumes.map((r) => r.fileName.toLowerCase()));
    const duplicates: string[] = [];
    const next: QueueItem[] = [];
    let overLimit = 0;
    for (const file of files) {
      const key = fileKey(file);
      if (existing.has(key)) {
        duplicates.push(file.name);
        continue;
      }
      if (itemsRef.current.length + next.length >= MAX_FILES_PER_BATCH) {
        overLimit++;
        continue;
      }
      existing.add(key);
      next.push({
        key,
        file,
        status: "WAITING",
        progress: 0,
        invalidReason: validateResumeFile(file),
        error: null,
        warning: poolNames.has(file.name.toLowerCase()) ? "A resume with this file name is already in your pool." : null,
        candidateId: null,
      });
    }
    setItems((prev) => [...prev, ...next]);
    return { added: next.length, duplicates, overLimit };
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const processOne = useCallback(
    async (item: QueueItem) => {
      try {
        patch(item.key, { status: "UPLOADING", progress: 0, error: null });
        const resume = await adapter.upload(item.file, (pct) => patch(item.key, { progress: pct }));
        talentActions.addResume(resume);
        patch(item.key, { status: "UPLOADED", progress: 100 });
        await new Promise((r) => setTimeout(r, 250));
        patch(item.key, { status: "PROCESSING" });
        talentActions.updateResume(resume.id, { status: "PROCESSING" });
        const result = await adapter.process({ ...resume, status: "PROCESSING" });
        talentActions.updateResume(resume.id, result.resume);
        if (result.candidate) talentActions.addCandidate(result.candidate);
        if (result.resume.status === "FAILED") {
          patch(item.key, { status: "FAILED", error: result.resume.errorMessage ?? "Processing failed." });
        } else {
          patch(item.key, { status: "COMPLETED", candidateId: result.candidate?.id ?? null });
        }
      } catch (e) {
        patch(item.key, { status: "FAILED", error: e instanceof Error ? e.message : "Upload failed." });
      }
    },
    [adapter, patch],
  );

  const runQueue = useCallback(
    async (targets: QueueItem[]) => {
      if (targets.length === 0) return;
      setRunning(true);
      talentActions.logUploadBatch(targets.length);
      const queue = [...targets];
      const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
        while (queue.length) {
          const next = queue.shift()!;
          await processOne(next);
        }
      });
      await Promise.all(workers);
      setRunning(false);
    },
    [processOne],
  );

  const start = useCallback(() => {
    const targets = itemsRef.current.filter((i) => i.status === "WAITING" && !i.invalidReason);
    return runQueue(targets);
  }, [runQueue]);

  const retry = useCallback(
    (key: string) => {
      const item = itemsRef.current.find((i) => i.key === key);
      if (item) runQueue([item]);
    },
    [runQueue],
  );

  const counts = {
    total: items.length,
    ready: items.filter((i) => i.status === "WAITING" && !i.invalidReason).length,
    invalid: items.filter((i) => i.invalidReason).length,
    completed: items.filter((i) => i.status === "COMPLETED").length,
    failed: items.filter((i) => i.status === "FAILED").length,
    active: items.filter((i) => ["UPLOADING", "UPLOADED", "PROCESSING"].includes(i.status)).length,
  };

  return { items, running, counts, addFiles, remove, clear, start, retry };
}
