"use client";

import {
  EMPTY_EXPERIENCE,
  EMPTY_STORY,
  EMPTY_WORLD,
  type PathwayProject,
} from "./model";

const KEY = "studio-atlas.projects.v0.1";

function normalizeProject(raw: Partial<PathwayProject>): PathwayProject {
  const now = new Date().toISOString();
  return {
    projectId: raw.projectId ?? crypto.randomUUID(),
    title: raw.title ?? "Senza titolo",
    idea: raw.idea ?? "",
    ageBand: raw.ageBand ?? "lower-secondary",
    humanState: raw.humanState ?? "IDEA",
    productionState: raw.productionState ?? "NOT_REQUESTED",
    story: { ...EMPTY_STORY, ...(raw.story ?? {}) },
    storyReview: raw.storyReview ?? { decision: "DRAFT" },
    world: { ...EMPTY_WORLD, ...(raw.world ?? {}) },
    worldReview: raw.worldReview ?? { decision: "DRAFT" },
    experience: { ...EMPTY_EXPERIENCE, ...(raw.experience ?? {}) },
    scenes: Array.isArray(raw.scenes) ? raw.scenes : [],
    storyboardReady: raw.storyboardReady ?? false,
    lastProductionRequest: raw.lastProductionRequest,
    lastProductionReceipt: raw.lastProductionReceipt,
    archived: raw.archived ?? false,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
    revision: raw.revision ?? 1,
  };
}

function readAll(): PathwayProject[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Partial<PathwayProject>[];
    return parsed.map(normalizeProject);
  } catch {
    return [];
  }
}

function writeAll(projects: PathwayProject[]) {
  localStorage.setItem(KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event("studio-atlas:projects"));
}

export function listProjects(): PathwayProject[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getProject(projectId: string): PathwayProject | null {
  return readAll().find((project) => project.projectId === projectId) ?? null;
}

export function createProject(input: Pick<PathwayProject, "title" | "idea" | "ageBand">) {
  const now = new Date().toISOString();
  const project: PathwayProject = {
    projectId: crypto.randomUUID(),
    title: input.title.trim(),
    idea: input.idea.trim(),
    ageBand: input.ageBand,
    humanState: "IDEA",
    productionState: "NOT_REQUESTED",
    story: { ...EMPTY_STORY },
    storyReview: { decision: "DRAFT" },
    world: { ...EMPTY_WORLD },
    worldReview: { decision: "DRAFT" },
    experience: { ...EMPTY_EXPERIENCE },
    scenes: [],
    storyboardReady: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
    revision: 1,
  };
  writeAll([project, ...readAll()]);
  return project;
}

export function updateProject(
  projectId: string,
  patch: Partial<Omit<PathwayProject, "projectId" | "createdAt">>,
) {
  let updated: PathwayProject | null = null;
  const projects = readAll().map((project) => {
    if (project.projectId !== projectId) return project;
    updated = normalizeProject({
      ...project,
      ...patch,
      projectId,
      createdAt: project.createdAt,
      updatedAt: new Date().toISOString(),
      revision: project.revision + 1,
    });
    return updated;
  });
  writeAll(projects);
  return updated;
}
