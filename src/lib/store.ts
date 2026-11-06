/**
 * Frontend-only in-memory store. Replace actions with API calls / server actions later.
 * Components read through `useTalentStore(selector)` so swapping the data source is local.
 */
import { useSyncExternalStore } from "react";
import type { Candidate, EvaluationStatus, Job, JobStatus, MatchResult, Resume } from "./types";
import { MOCK_CANDIDATES, MOCK_JOBS, MOCK_RESUMES } from "./mock-data";
import { evaluateCandidate } from "./matching";
import { MOCK_NOW, makeId } from "./talent-utils";

export type ActivityType = "resume" | "candidate" | "job" | "evaluation";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  at: string;
}

export interface JobEvaluation {
  jobId: string;
  evaluatedAt: string;
  results: MatchResult[];
}

export interface TalentState {
  resumes: Resume[];
  candidates: Candidate[];
  jobs: Job[];
  evaluations: Record<string, JobEvaluation>;
  activity: ActivityItem[];
}

function seedEvaluation(jobId: string, evaluatedAt: string, statuses: Record<string, EvaluationStatus>): JobEvaluation {
  const job = MOCK_JOBS.find((j) => j.id === jobId)!;
  const results = MOCK_CANDIDATES.map((c) => {
    const r = evaluateCandidate(c, job);
    return { ...r, evaluatedAt, status: statuses[c.id] ?? r.status };
  }).sort((a, b) => b.overallScore - a.overallScore);
  return { jobId, evaluatedAt, results };
}

function initialState(): TalentState {
  return {
    resumes: MOCK_RESUMES,
    candidates: MOCK_CANDIDATES,
    jobs: MOCK_JOBS,
    evaluations: {
      job_01: seedEvaluation("job_01", "2026-11-05T12:30:00.000Z", { cand_01: "SHORTLISTED", cand_05: "NEEDS_REVIEW", cand_08: "REJECTED" }),
      job_02: seedEvaluation("job_02", "2026-11-02T09:10:00.000Z", { cand_02: "SHORTLISTED" }),
      job_05: seedEvaluation("job_05", "2026-09-20T09:10:00.000Z", { cand_06: "SHORTLISTED", cand_12: "SHORTLISTED" }),
    },
    activity: [
      { id: "act_1", type: "resume", message: "2 resumes uploaded and queued for processing", at: "2026-11-06T09:44:00.000Z" },
      { id: "act_2", type: "candidate", message: "Priya Sharma added to the candidate pool", at: "2026-11-05T14:21:00.000Z" },
      { id: "act_3", type: "job", message: "Machine Learning Engineer – NLP saved as draft", at: "2026-11-05T17:31:00.000Z" },
      { id: "act_4", type: "evaluation", message: "12 candidates evaluated for Senior Frontend Engineer", at: "2026-11-05T12:30:00.000Z" },
      { id: "act_5", type: "candidate", message: "Arjun Mehta added to the candidate pool", at: "2026-11-04T10:06:00.000Z" },
      { id: "act_6", type: "job", message: "Product Designer saved as draft", at: "2026-11-03T15:00:00.000Z" },
    ],
  };
}

let state: TalentState = initialState();
const serverState = state;
const listeners = new Set<() => void>();

function setState(updater: (s: TalentState) => TalentState) {
  state = updater(state);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTalentStore<T>(selector: (s: TalentState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(serverState),
  );
}

export function getTalentState() {
  return state;
}

function nowIso() {
  return new Date().toISOString();
}

function logActivity(type: ActivityType, message: string) {
  return { id: makeId("act"), type, message, at: nowIso() };
}

export const talentActions = {
  addResume(resume: Resume) {
    setState((s) => ({ ...s, resumes: [resume, ...s.resumes] }));
  },
  updateResume(id: string, patch: Partial<Resume>) {
    setState((s) => ({
      ...s,
      resumes: s.resumes.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r)),
    }));
  },
  addCandidate(candidate: Candidate) {
    setState((s) => ({
      ...s,
      candidates: [candidate, ...s.candidates],
      activity: [logActivity("candidate", `${candidate.name} added to the candidate pool`), ...s.activity],
    }));
  },
  logUploadBatch(count: number) {
    setState((s) => ({
      ...s,
      activity: [logActivity("resume", `${count} resume${count === 1 ? "" : "s"} uploaded`), ...s.activity],
    }));
  },
  saveJob(job: Job) {
    setState((s) => {
      const exists = s.jobs.some((j) => j.id === job.id);
      const jobs = exists ? s.jobs.map((j) => (j.id === job.id ? job : j)) : [job, ...s.jobs];
      const verb = exists ? "updated" : job.status === "ACTIVE" ? "created and activated" : "saved as draft";
      return { ...s, jobs, activity: [logActivity("job", `${job.title} ${verb}`), ...s.activity] };
    });
  },
  setJobStatus(id: string, status: JobStatus) {
    setState((s) => {
      const job = s.jobs.find((j) => j.id === id);
      return {
        ...s,
        jobs: s.jobs.map((j) => (j.id === id ? { ...j, status, updatedAt: nowIso() } : j)),
        activity: job ? [logActivity("job", `${job.title} marked ${status.toLowerCase()}`), ...s.activity] : s.activity,
      };
    });
  },
  deleteJob(id: string) {
    setState((s) => {
      const { [id]: _removed, ...evaluations } = s.evaluations;
      return { ...s, jobs: s.jobs.filter((j) => j.id !== id), evaluations };
    });
  },
  runEvaluation(jobId: string) {
    setState((s) => {
      const job = s.jobs.find((j) => j.id === jobId);
      if (!job) return s;
      const previous = s.evaluations[jobId]?.results ?? [];
      const evaluatedAt = nowIso();
      const results = s.candidates
        .map((c) => {
          const prev = previous.find((p) => p.candidateId === c.id);
          const r = evaluateCandidate(c, job, MOCK_NOW);
          return { ...r, evaluatedAt, status: prev?.status ?? r.status, notes: prev?.notes ?? "" };
        })
        .sort((a, b) => b.overallScore - a.overallScore);
      return {
        ...s,
        evaluations: { ...s.evaluations, [jobId]: { jobId, evaluatedAt, results } },
        activity: [logActivity("evaluation", `${results.length} candidates evaluated for ${job.title}`), ...s.activity],
      };
    });
  },
  updateMatch(jobId: string, candidateId: string, patch: Partial<Pick<MatchResult, "status" | "notes">>) {
    setState((s) => {
      const ev = s.evaluations[jobId];
      if (!ev) return s;
      return {
        ...s,
        evaluations: {
          ...s.evaluations,
          [jobId]: { ...ev, results: ev.results.map((r) => (r.candidateId === candidateId ? { ...r, ...patch } : r)) },
        },
      };
    });
  },
};
