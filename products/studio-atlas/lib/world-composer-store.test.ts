import assert from "node:assert/strict";
import { test } from "node:test";
import { createProject, getProject, updateProject } from "./store";

test("AWC S1: una revisione locale superata non sovrascrive il progetto", () => {
  const data = new Map<string, string>();
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { dispatchEvent: () => true },
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => { data.set(key, value); },
    },
  });

  try {
    const first = createProject({
      title: "Prima versione",
      idea: "Prova reversibile",
      ageBand: "lower-secondary",
    });
    const saved = updateProject(first.projectId, { title: "Versione salvata" }, first.revision);
    assert.equal(saved.revision, first.revision + 1);
    assert.throws(
      () => updateProject(first.projectId, { title: "Perdita dati" }, first.revision),
      /PROJECT_REVISION_CONFLICT/,
    );
    assert.equal(getProject(first.projectId)?.title, "Versione salvata");
    assert.throws(
      () => updateProject("progetto-assente", { title: "Errore" }),
      /PROJECT_NOT_FOUND/,
    );
    assert.equal(getProject(first.projectId)?.revision, saved.revision);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (previousStorage) Object.defineProperty(globalThis, "localStorage", previousStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
