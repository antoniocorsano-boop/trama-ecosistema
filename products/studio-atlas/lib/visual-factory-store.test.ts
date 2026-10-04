import assert from "node:assert/strict";
import test from "node:test";
import {
  readVisualFactoryState,
  writeVisualFactoryState,
  type VisualFactoryStorage,
} from "./visual-factory-store";
import { createInitialVisualFactoryState } from "./visual-factory";

function memoryStorage(): VisualFactoryStorage {
  const values = new Map<string, string>();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

test("visual production state persists separately from pathway authoring state", () => {
  const storage = memoryStorage();
  const state = createInitialVisualFactoryState("a".repeat(64));

  writeVisualFactoryState("project-1", state, storage);

  assert.deepEqual(readVisualFactoryState("project-1", storage), state);
});

test("corrupt visual production state fails closed as missing", () => {
  const storage = memoryStorage();
  storage.setItem("studio-atlas.visual-factory.v0.2:project-1", "not-json");

  assert.equal(readVisualFactoryState("project-1", storage), null);
});
