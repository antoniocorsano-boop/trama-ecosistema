import type { PathwayProject, PathwayScene } from "./model";

/** Lettura delle scene esistenti: non crea una seconda autorità di authoring. */
export function worldPlaces(project: PathwayProject) {
  const places = new Map<string, { id: string; label: string; detail: string }>();

  for (const scene of project.scenes) {
    for (const location of scene.stage?.locations ?? []) {
      if (!places.has(location.id)) {
        places.set(location.id, {
          id: location.id,
          label: location.label,
          detail: location.detail,
        });
      }
    }
    if (scene.world?.place.trim()) {
      const label = scene.world.place.trim();
      const id = `world:${label}`;
      if (!places.has(id)) {
        places.set(id, { id, label, detail: scene.world.status });
      }
    }
  }
  return Array.from(places.values());
}

/**
 * Una variazione osservabile esiste solo se una scelta ha un worldAfter.
 * Non sintetizzare stati a partire dal feedback né modificare la scena sorgente.
 */
export function compareSceneWorld(scene: PathwayScene, choiceId: string | null) {
  const choice = scene.choices.find(
    (candidate) => candidate.choiceId === choiceId && candidate.worldAfter,
  );
  return {
    original: scene.world ?? null,
    variation: choice?.worldAfter ?? null,
    choiceLabel: choice?.label ?? null,
    feedback: choice?.feedback ?? null,
  };
}
