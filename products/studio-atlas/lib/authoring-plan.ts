import { STAGES, type AuthoringComplexity, type PathwayProject } from "./model";

type Stage = (typeof STAGES)[number];
type Input = Pick<PathwayProject, "authoringComplexity" | "experience" | "scenes" | "story" | "world">;

export const AUTHORING_PROFILES = [
  { id: "ESSENTIAL", title: "Essenziale", description: "Attività circoscritta, pochi contenuti e interazioni." },
  { id: "ARTICULATED", title: "Articolato", description: "Più scene, attività collegate, eventuale storia e ambienti." },
  { id: "ADVANCED", title: "Avanzato", description: "Progetto esteso, ramificazioni, simulazioni o ambienti complessi." },
] as const satisfies readonly { id: AuthoringComplexity; title: string; description: string }[];

export function parseAuthoringComplexity(value: unknown): AuthoringComplexity | undefined {
  return AUTHORING_PROFILES.find(profile => profile.id === value)?.id;
}

export function deriveAuthoringPlan(input: Input) {
  const grammar = input.experience.grammar;
  const hasBranching = grammar === "BRANCHING_CONSEQUENCE" ||
    input.scenes.some(scene => scene.interaction === "CHOICE" || scene.choices.length > 0);
  const hasState = grammar === "SIMULATION_MICROWORLD" ||
    input.scenes.some(scene => !!scene.world || scene.choices.some(choice => !!choice.worldAfter));
  const hasStory = grammar === "VISUAL_NARRATIVE" || Object.values(input.story).some(value => !!value.trim()) ||
    input.scenes.some(scene => !!scene.stage?.characterBeat);
  const hasWorld = grammar === "ENVIRONMENTAL_STORYTELLING" || Object.values(input.world).some(value => !!value.trim()) ||
    input.scenes.some(scene => !!scene.stage?.locations?.length);
  const suggested: AuthoringComplexity = hasBranching && hasState ? "ADVANCED"
    : hasBranching || hasState || hasStory || hasWorld || grammar === "INQUIRY_EVIDENCE" || input.scenes.length > 2
      ? "ARTICULATED" : "ESSENTIAL";

  // Unselected is a suggestion, never a persisted selection.
  const effective = input.authoringComplexity ?? suggested;
  const focus = new Set<Stage>(["Idea", "Esperienza", "Scene", "Prova", "Revisione"]);
  if (effective !== "ESSENTIAL" || hasStory) focus.add("Storia");
  if (effective !== "ESSENTIAL" || hasWorld || hasState) focus.add("Mondo");
  if (effective !== "ESSENTIAL") focus.add("Produzione");
  const checks = [
    "Obiettivi, destinatari, azione ed evidenza di apprendimento",
    "Accessibilità, diritti delle risorse, riservatezza e revisione",
    ...(hasStory ? ["Coerenza narrativa e motivazione dello studente"] : []),
    ...(hasBranching ? ["Scelte: destinazioni, conseguenze e chiusure"] : []),
    ...(hasState ? ["Sistema: condizioni iniziali, segnali ed effetti osservabili"] : []),
    ...(hasWorld ? ["Ambiente: luoghi, azioni e orientamento"] : []),
    ...(effective === "ADVANCED" ? ["Fattibilità delle risorse, alternative accessibili e prestazioni sui dispositivi"] : []),
  ];
  return {
    suggested, effective,
    focusStages: STAGES.filter(stage => focus.has(stage)),
    checks,
    // Planning cannot waive a current production or preview requirement.
    availableStages: STAGES,
  };
}
