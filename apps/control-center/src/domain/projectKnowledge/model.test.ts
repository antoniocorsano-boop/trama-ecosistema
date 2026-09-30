import currentKnowledge from "../../../../../control-center/data/context-packs/project-knowledge.json";
import { describe, expect, it } from "vitest";
import { parseProjectKnowledge, projectKnowledgeTone } from "./model";

describe("project knowledge consumer model", () => {
  it("accepts the current governed context pack", () => {
    const parsed = parseProjectKnowledge(currentKnowledge);
    expect(parsed.subject).toBe("project-knowledge");
    expect(parsed.activeInvariants.length).toBeGreaterThan(0);
  });

  it("treats PARTIAL as attention, not blocked", () => {
    expect(projectKnowledgeTone("PARTIAL")).toBe("attention");
  });

  it("fails closed on incomplete shapes", () => {
    expect(() => parseProjectKnowledge({ subject: "project-knowledge" })).toThrow("TRAMA_PROJECT_KNOWLEDGE_INVALID");
  });
});
