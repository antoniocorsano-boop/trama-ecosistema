import type { ExperienceGrammar } from "./model";

type Grammar = Exclude<ExperienceGrammar, "">;
type Form = { id: Grammar; title: string; description: string; reason: string; terms: readonly string[] };

// Existing grammar identifiers, not a second authoring model or runtime.
// Suggestions are lexical and explainable, not generated instructional approval.
export const EXPERIENCE_FORMS: readonly Form[] = [
  { id: "INQUIRY_EVIDENCE", title: "Indagine", description: "Raccogliere indizi e costruire una spiegazione.", reason: "Adatta a cercare cause, confrontare indizi e formulare ipotesi.", terms: ["indizi", "indagine", "cause", "causa", "guasto", "mistero", "ipotesi", "malfunzionamento"] },
  { id: "BRANCHING_CONSEQUENCE", title: "Conseguenze", description: "Fare scelte e osservare come cambia la situazione.", reason: "Adatta a confrontare decisioni e conseguenze.", terms: ["scelta", "scelte", "decisione", "decisioni", "conseguenze", "dilemma"] },
  { id: "WORKSHOP_CONSTRUCTION", title: "Officina", description: "Costruire, combinare o correggere qualcosa.", reason: "Adatta a progettare, costruire e verificare un prodotto.", terms: ["costruire", "progettare", "montare", "assemblare", "realizzare", "prototipo", "plastico"] },
  { id: "SIMULATION_MICROWORLD", title: "Laboratorio e simulazione", description: "Agire su un sistema e osservare le relazioni.", reason: "Adatta a osservare le relazioni tra variabili e gli effetti degli interventi.", terms: ["simulazione", "variabili", "parametri", "sensori", "sensore", "automazione", "circuito", "circuiti", "energia", "esperimento"] },
  { id: "VISUAL_NARRATIVE", title: "Narrazione visuale", description: "Attraversare una sequenza di immagini, azioni e racconti.", reason: "Adatta a dare significato a eventi attraverso una sequenza narrativa.", terms: ["storia", "racconto", "fumetto", "personaggi", "narrazione", "dialogo"] },
  { id: "ENVIRONMENTAL_STORYTELLING", title: "Esplorazione", description: "Comprendere un ambiente attraverso ciò che contiene.", reason: "Adatta a osservare luoghi, elementi e relazioni nello spazio.", terms: ["esplorare", "ambiente", "ambienti", "museo", "territorio", "paesaggio", "ecosistema", "citta", "fattoria"] },
];

export function suggestExperienceForms(idea: string) {
  const words = new Set(idea.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().match(/[a-z0-9]+/g) ?? []);
  return EXPERIENCE_FORMS.map((form, order) => ({
    form, order, matches: form.terms.filter(term => words.has(term)),
  })).filter(item => item.matches.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length || a.order - b.order)
    .slice(0, 3);
}
