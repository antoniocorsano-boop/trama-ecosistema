import type { PathwayProject, PathwayScene } from "./model";

/** Lettura delle scene esistenti: non crea una seconda autorità di authoring. */
export function worldPlaces(project: PathwayProject) {
  const places = new Map<string, { id: string; label: string; detail: string }>();

  for (const scene of project.scenes) {
    for (const location of scene.stage?.locations ?? []) {
      // Gli identificativi dei luoghi sono locali alla scena.
      const id = JSON.stringify(["stage", scene.sceneId, location.id]);
      if (!places.has(id)) {
        places.set(id, {
          id,
          label: location.label,
          detail: location.detail,
        });
      }
    }
    if (scene.world?.place.trim()) {
      const label = scene.world.place.trim();
      const id = JSON.stringify(["world", label]);
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


/** Conserva una conseguenza semantica nella scena, senza cambiare l'originale. */
export function updateWorldChoiceStatus(
  scenes: PathwayScene[],
  sceneId: string,
  choiceId: string,
  proposedStatus: string,
): PathwayScene[] {
  const status = proposedStatus.trim();
  if (!status) throw new Error("EMPTY_SCENE_VARIATION");
  let found = false;
  const result = scenes.map((scene) => {
    if (scene.sceneId !== sceneId) return scene;
    return {
      ...scene,
      choices: scene.choices.map((choice) => {
        if (choice.choiceId !== choiceId || !choice.worldAfter) return choice;
        found = true;
        return { ...choice, worldAfter: { ...choice.worldAfter, status } };
      }),
    };
  });
  if (!found) throw new Error("SCENE_VARIATION_NOT_FOUND");
  return result;
}

/** Il fuoco della scena appartiene alla scena esistente, non a una nuova bozza. */
export function updateSceneFocus(scene: PathwayScene, locationId: string): PathwayScene {
  if (!scene.stage || !scene.stage.locations?.some(location => location.id === locationId)) {
    throw new Error("SCENE_FOCUS_LOCATION_NOT_FOUND");
  }
  if (scene.stage.focusLocationId === locationId) return scene;
  return { ...scene, stage: { ...scene.stage, focusLocationId: locationId } };
}
