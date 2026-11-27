import type { PathwayProject, STAGES } from "./model";
type Stage = (typeof STAGES)[number];

export const ENVIRONMENTS = [
  {id:"MUSEUM",title:"Museo e mostra",description:"Oggetti, reperti e indizi da osservare.",reason:"Permette di indagare fenomeni attraverso testimonianze e oggetti.",terms:["museo","mostra","reperti","patrimonio","indagine"]},
  {id:"LAB",title:"Laboratorio",description:"Esperimenti, misure e confronto di risultati.",reason:"Rende visibili relazioni tra variabili e sistemi.",terms:["laboratorio","esperimento","esperimenti","sensori","sensore","automazione","energia","variabili","circuiti"]},
  {id:"INDUSTRY",title:"Officina e industria",description:"Macchine, materiali e processi produttivi.",reason:"Consente di esplorare sequenze di lavoro e trasformazioni.",terms:["industria","fabbrica","officina","produzione","macchine","materiali","automazione"]},
  {id:"NATURE",title:"Ambiente naturale e rurale",description:"Paesaggi, ecosistemi, colture e risorse.",reason:"Aiuta a collegare elementi naturali, tecnici e ambientali.",terms:["agricoltura","fattoria","colture","ecosistema","ecosistemi","paesaggio","natura","allevamento"]},
  {id:"CITY",title:"Città e comunità",description:"Spazi, servizi, infrastrutture e vita quotidiana.",reason:"Collega i contenuti alla realtà sociale e alle scelte collettive.",terms:["citta","comunita","traffico","mobilita","servizi","urbanistica","cittadinanza"]},
  {id:"HISTORY",title:"Ricostruzione storica",description:"Luoghi, epoche e fonti da confrontare.",reason:"Consente di contestualizzare fatti e trasformazioni.",terms:["storia","storico","epoca","romani","medioevo","antichita","fonti"]},
  {id:"CUSTOM",title:"Ambiente personalizzato",description:"Un contesto da descrivere liberamente.",reason:"Lascia piena libertà di progettazione.",terms:[]},
] as const;
export type EnvironmentId = typeof ENVIRONMENTS[number]["id"];

type Tool = {id:string; title:string; description:string; stage:Stage; availability:"EDITOR"|"PLANNING"|"PILOT";};
export const AUTHORING_TOOLS = [
  {id:"STORY",title:"Storia e personaggi",description:"Definisci protagonisti, motivazioni e situazione iniziale.",stage:"Storia",availability:"EDITOR"},
  {id:"WORLD",title:"Ambienti e osservazioni",description:"Descrivi luoghi, oggetti osservabili e ruolo dello studente.",stage:"Mondo",availability:"EDITOR"},
  {id:"FORM",title:"Forma dell’esperienza",description:"Scegli e motiva l’attività educativa.",stage:"Esperienza",availability:"EDITOR"},
  {id:"SCENES",title:"Sequenza delle scene",description:"Componi situazione, azione, conseguenza e scoperta.",stage:"Scene",availability:"EDITOR"},
  {id:"CHOICES",title:"Scelte e conseguenze",description:"Nelle scene imposta una scelta e collega gli esiti.",stage:"Scene",availability:"EDITOR"},
  {id:"SIMULATION",title:"Simulazione e stati",description:"Progetta condizioni ed effetti; il generatore generale non è collegato.",stage:"Mondo",availability:"PLANNING"},
  {id:"HOTSPOTS",title:"Punti interattivi",description:"Importa un’immagine WebP e posiziona gli indizi delle scene.",stage:"Scene",availability:"EDITOR"},
  {id:"VISUAL",title:"Produzione di immagini",description:"Pianificazione locale del percorso; esecuzione automatica limitata al pilota Museo Zero.",stage:"Produzione",availability:"PILOT"},
  {id:"DIAGRAM",title:"Diagrammi statici",description:"Consulta ed esporta il materiale pilota generato dal laboratorio qualificato.",stage:"Produzione",availability:"PILOT"},
  {id:"PREVIEW",title:"Anteprima e verifica",description:"Apri la fase di prova; restano necessari i controlli previsti.",stage:"Prova",availability:"EDITOR"},
] as const satisfies readonly Tool[];
export type AuthoringToolId = typeof AUTHORING_TOOLS[number]["id"];
export type AuthoringSelection = {environment?:EnvironmentId; tools:AuthoringToolId[]};

export function normalizeAuthoringSelection(value: unknown): AuthoringSelection | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  const environment = ENVIRONMENTS.find(item=>item.id===raw.environment)?.id;
  const tools = Array.isArray(raw.tools) ? AUTHORING_TOOLS.filter(item=>(raw.tools as unknown[]).includes(item.id)).map(item=>item.id) : [];
  return { ...(environment ? {environment}:{}), tools };
}
export function suggestEnvironments(idea:string) {
  const words = new Set(idea.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().match(/[a-z0-9]+/g)??[]);
  return ENVIRONMENTS.map((environment,order)=>({environment,order,matches:environment.terms.filter(word=>words.has(word))}))
    .filter(item=>item.matches.length>0).sort((a,b)=>b.matches.length-a.matches.length||a.order-b.order).slice(0,3);
}
export function suggestedTools(project: Pick<PathwayProject,"experience"|"authoringComplexity"|"scenes">) {
  const ids = new Set<AuthoringToolId>(["FORM","SCENES","PREVIEW"]);
  const grammar=project.experience.grammar;
  if(grammar==="VISUAL_NARRATIVE"||project.authoringComplexity==="ADVANCED")ids.add("STORY");
  if(grammar==="INQUIRY_EVIDENCE"||grammar==="ENVIRONMENTAL_STORYTELLING"||grammar==="SIMULATION_MICROWORLD")ids.add("WORLD");
  if(grammar==="BRANCHING_CONSEQUENCE"||project.scenes.some(scene=>scene.interaction==="CHOICE"))ids.add("CHOICES");
  if(grammar==="SIMULATION_MICROWORLD")ids.add("SIMULATION");
  if(grammar==="ENVIRONMENTAL_STORYTELLING"||grammar==="INQUIRY_EVIDENCE")ids.add("HOTSPOTS");
  return AUTHORING_TOOLS.filter(tool=>ids.has(tool.id));
}

type WorkMode = {
  id: string;
  title: string;
  description: string;
  entry: "DOCUMENT" | "IDEA" | "CURRICULUM" | "RESOURCE" | "PROJECT";
  intent: "ANALYZE" | "DESIGN" | "PRODUCE" | "COMPOSE" | "REVIEW";
  product: "RESOURCE" | "EXPERIENCE" | "WORLD";
} & ({ availability: "EDITOR"; stage: Stage } | { availability: "BLOCKED" });

export const WORK_MODES = [
  { id: "DOCUMENT", title: "Documento", description: "L’analisi di documenti disciplinari non è ancora integrata. Puoi importare un’attività in un formato supportato.", entry: "DOCUMENT", intent: "ANALYZE", product: "RESOURCE", availability: "BLOCKED" },
  { id: "IDEA", title: "Idea", description: "Imposta l’idea e scegli gli strumenti del progetto.", entry: "IDEA", intent: "DESIGN", product: "EXPERIENCE", availability: "EDITOR", stage: "Idea" },
  { id: "CURRICULUM", title: "Curricolo", description: "L’acquisizione di obiettivi verificati da Arena non è ancora integrata.", entry: "CURRICULUM", intent: "DESIGN", product: "EXPERIENCE", availability: "BLOCKED" },
  { id: "PRODUCTION", title: "Produzione", description: "Apri i banchi diagrammi e simulatori o prepara i materiali di una bozza.", entry: "RESOURCE", intent: "PRODUCE", product: "RESOURCE", availability: "EDITOR", stage: "Produzione" },
  { id: "COMPOSITION", title: "Composizione", description: "Componi la bozza didattica o apri le scene del Percorso.", entry: "PROJECT", intent: "COMPOSE", product: "EXPERIENCE", availability: "EDITOR", stage: "Esperienza" },
  { id: "REVIEW", title: "Revisione", description: "Rivedi il Percorso e accedi alle anteprime secondo i controlli previsti.", entry: "PROJECT", intent: "REVIEW", product: "EXPERIENCE", availability: "EDITOR", stage: "Revisione" },
] as const satisfies readonly WorkMode[];

export type WorkModeId = typeof WORK_MODES[number]["id"];

export function findWorkMode(value: unknown) {
  return WORK_MODES.find(mode => mode.id === value);
}

type WorkModeStorage = Pick<Storage, "getItem" | "setItem">;
const WORK_MODE_PREFIX = "studio-atlas.work-mode.v1:";
const workModeKey = (projectId: string) => WORK_MODE_PREFIX + projectId;

export function isWorkModeStorageKey(key: string | null) {
  return key?.startsWith(WORK_MODE_PREFIX) ?? false;
}

export function clearWorkMode(storage: Pick<Storage, "removeItem">, projectId: string) {
  storage.removeItem(workModeKey(projectId));
}

export function loadWorkMode(storage: WorkModeStorage, projectId: string) {
  return findWorkMode(storage.getItem(workModeKey(projectId)))?.id;
}

export function saveWorkMode(storage: WorkModeStorage, projectId: string, mode: WorkModeId) {
  storage.setItem(workModeKey(projectId), mode);
}
