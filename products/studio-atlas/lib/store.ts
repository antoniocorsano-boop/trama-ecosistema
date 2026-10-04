"use client";

import type { PathwayProject } from "./model";

const KEY = "studio-atlas.projects.v0.1";

function readAll(): PathwayProject[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as PathwayProject[];
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
    updated = {
      ...project,
      ...patch,
      projectId,
      createdAt: project.createdAt,
      updatedAt: new Date().toISOString(),
      revision: project.revision + 1,
    };
    return updated;
  });
  writeAll(projects);
  return updated;
}
