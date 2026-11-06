import { describe, expect, it } from "vitest";
import { evaluateSkillGroup } from "@/lib/matching";
import { buildSkillGroup, MOCK_CANDIDATES } from "@/lib/mock-data";
import { totalExperienceMonths } from "@/lib/talent-utils";
import type { Candidate } from "@/lib/types";

const base = MOCK_CANDIDATES[0]!;
const candidate: Candidate = {
  ...base,
  skills: ["React"],
  normalizedSkills: ["react"],
  experience: [],
  projects: [],
};

describe("skill group requirement types", () => {
  it("ANY is satisfied when at least one skill is found", () => {
    const g = buildSkillGroup("j", 1, "Frameworks", "ANY", ["Vue", "React", "Svelte"]);
    expect(evaluateSkillGroup(candidate, g).satisfied).toBe(true);
  });

  it("ALL is not satisfied when any skill is missing", () => {
    const g = buildSkillGroup("j", 1, "Core", "ALL", ["React", "TypeScript"]);
    const r = evaluateSkillGroup(candidate, g);
    expect(r.satisfied).toBe(false);
    expect(r.missing).toEqual(["TypeScript"]);
  });

  it("PREFERRED never blocks a candidate", () => {
    const g = buildSkillGroup("j", 1, "Bonus", "PREFERRED", ["GraphQL"]);
    expect(evaluateSkillGroup(candidate, g).satisfied).toBe(true);
  });
});

describe("derived total experience", () => {
  it("merges overlapping roles instead of double counting", () => {
    const months = totalExperienceMonths([
      { startDate: "2020-01-01T00:00:00.000Z", endDate: "2020-12-01T00:00:00.000Z" },
      { startDate: "2020-07-01T00:00:00.000Z", endDate: "2021-06-01T00:00:00.000Z" },
    ]);
    expect(months).toBe(18);
  });

  it("counts a current role up to the reference date", () => {
    const months = totalExperienceMonths(
      [{ startDate: "2026-01-01T00:00:00.000Z", endDate: null }],
      new Date("2026-06-15T00:00:00.000Z"),
    );
    expect(months).toBe(6);
  });
});
