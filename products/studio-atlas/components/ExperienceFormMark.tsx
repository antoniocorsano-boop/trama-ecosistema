import type { ExperienceGrammar } from "../lib/model";

export function ExperienceFormMark({ grammar }: { grammar: ExperienceGrammar }) {
  const motif = {
    INQUIRY_EVIDENCE: <><circle cx="10" cy="10" r="6"/><path d="m14.5 14.5 6 6"/></>,
    BRANCHING_CONSEQUENCE: <><path d="M7 12 17 6M7 12l10 6"/><circle cx="5" cy="12" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="19" cy="19" r="3"/></>,
    WORKSHOP_CONSTRUCTION: <><path d="m4 20 12-12m-6-3 3-3 9 9-3 3zM5 4l15 16M3 2l5 3-3 3z"/></>,
    SIMULATION_MICROWORLD: <><path d="M9 3h6m-5 0v7L4 20q0 1 2 1h12q2 0 2-1l-6-10V3M7 15h10"/><circle cx="11" cy="17.5" r=".7"/></>,
    VISUAL_NARRATIVE: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="2"/><path d="m4 18 6-6 4 4 3-4 4 6"/></>,
    ENVIRONMENTAL_STORYTELLING: <><path d="m3 19 6-10 4 6 3-4 5 8z"/><circle cx="17" cy="6" r="2"/></>,
    "": null,
  }[grammar];
  return <svg className="experience-form-mark" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{motif}</svg>;
}
