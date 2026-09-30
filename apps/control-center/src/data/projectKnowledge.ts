import {
  parseProjectKnowledge,
  type ProjectKnowledgeState,
} from "../domain/projectKnowledge/model";

export async function loadProjectKnowledge(signal?: AbortSignal): Promise<ProjectKnowledgeState> {
  try {
    const response = await fetch("./data/context-packs/project-knowledge.json", {
      cache: "no-store",
      signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { status: "UNAVAILABLE", error: new Error(`PROJECT_KNOWLEDGE_HTTP_${response.status}`) };
    }

    const raw: unknown = await response.json();
    return { status: "READY", data: parseProjectKnowledge(raw) };
  } catch (error) {
    if (error instanceof Error && error.message === "TRAMA_PROJECT_KNOWLEDGE_INVALID") {
      return { status: "INVALID", error };
    }
    return {
      status: "UNAVAILABLE",
      error: error instanceof Error ? error : new Error("PROJECT_KNOWLEDGE_LOAD_FAILED"),
    };
  }
}
