/** Closed manifest contract for the existing build-time educational renderer. */
export const DIAGRAM_ROOT = "/design/education-diagram/";
export const DIAGRAM_STEM = "eco02-p1-filiera-orticola";
export const DIAGRAM_VARIANTS = ["mobile-vertical","desktop-lim-horizontal"] as const;
export type DiagramVariant = typeof DIAGRAM_VARIANTS[number];
type Output = {id:string;variant:DiagramVariant;htmlSha256:string;svgSha256:string};
type Receipt = {sourceSha256:string;guideSha256:string;outputs:Output[]};
const hash = (value:unknown): value is string => typeof value==="string" && /^[0-9a-f]{64}$/.test(value);
function record(value:unknown): Record<string,unknown> {
  if (!value || typeof value!=="object" || Array.isArray(value)) throw Error("DIAGRAM_RECEIPT_INVALID");
  return value as Record<string,unknown>;
}
export function parseEducationReceipt(input:unknown): Receipt {
  const r=record(input);
  if(r.schema!=="trama.diagram-education-receipt/v0.1" || r.status!=="GENERATED_TEACHER_REVIEW_REQUIRED" ||
    r.runtimeAuthorized!==false || r.publicationAuthorized!==false || !hash(r.sourceSha256) ||
    !hash(r.guideSha256) || !hash(r.profilesSha256) || !Array.isArray(r.outputs) || r.outputs.length!==2) throw Error("DIAGRAM_RECEIPT_INVALID");
  const outputs=DIAGRAM_VARIANTS.map((variant,index)=>{
    const o=record((r.outputs as unknown[])[index]);
    const id=DIAGRAM_STEM+"-"+variant;
    if(o.id!==id || o.variant!==variant || o.diagram!==DIAGRAM_STEM || !hash(o.htmlSha256) || !hash(o.svgSha256)) throw Error("DIAGRAM_RECEIPT_INVALID");
    return {id,variant,htmlSha256:o.htmlSha256,svgSha256:o.svgSha256};
  });
  return {sourceSha256:r.sourceSha256,guideSha256:r.guideSha256,outputs};
}
export function educationFiles(receipt:Receipt): {name:string;sha256:string}[] {
  return [
    {name:"education-pilot-source.json",sha256:receipt.sourceSha256},
    {name:"guida-docente.md",sha256:receipt.guideSha256},
    ...receipt.outputs.flatMap(o=>[{name:o.id+".html",sha256:o.htmlSha256},{name:o.id+".svg",sha256:o.svgSha256}]),
  ];
}
export async function verifyEducationFile(bytes:ArrayBuffer,expected:string):Promise<void> {
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),b=>b.toString(16).padStart(2,"0")).join("");
  if(digest!==expected) throw Error("DIAGRAM_FILE_INTEGRITY");
}

export type DiagramNode = {id: string; label: string; detail: string};
export type DiagramEdge = [string, string];
export const AUTHORED_STEM = "diagramma-docente";
const SOURCE_METADATA = {
  schema: "trama.diagram-education-source/v0.1",
  id: AUTHORED_STEM,
  status: "TEACHER_REVIEW_REQUIRED",
  profile: "studio-atlas",
  runtimeAuthorized: false,
  publicationAuthorized: false,
} as const;

export function authoredSource(title = "", description = "", nodes: DiagramNode[] = [], edges: DiagramEdge[] = []) {
  return {...SOURCE_METADATA, title, description, nodes, edges};
}
export type AuthoredSource = ReturnType<typeof authoredSource>;

export function importAuthoredSource(value: unknown): AuthoredSource {
  const source = record(value);
  if (Object.keys(source).length !== 10 ||
      Object.entries(SOURCE_METADATA).some(([key, expected]) => source[key] !== expected) ||
      typeof source.title !== "string" || typeof source.description !== "string" ||
      !Array.isArray(source.nodes) || source.nodes.length > 4 || !Array.isArray(source.edges) || source.edges.length > 8) {
    throw Error("Struttura o autorizzazioni della fonte non valide.");
  }
  const nodes = source.nodes.map((value: unknown) => {
    const node = record(value);
    if (Object.keys(node).length !== 3 || typeof node.id !== "string" || !/^n[1-4]$/.test(node.id) ||
        typeof node.label !== "string" || typeof node.detail !== "string" ||
        Array.from(node.label).length > 16 || Array.from(node.detail).length > 22) {
      throw Error("Controlla identificativo, etichetta e dettaglio dei nodi.");
    }
    return {id: node.id, label: node.label, detail: node.detail};
  });
  const ids = new Set(nodes.map(node => node.id));
  if (ids.size !== nodes.length || Array.from(source.title).length > 26 || Array.from(source.description).length > 160) {
    throw Error("Controlla gli identificativi dei nodi e la lunghezza di titolo e finalità.");
  }
  const edges = source.edges.map((edge: unknown): DiagramEdge => {
    if (!Array.isArray(edge) || edge.length !== 2 || !ids.has(edge[0]) || !ids.has(edge[1]) || edge[0] === edge[1]) {
      throw Error("Ogni relazione deve collegare due nodi presenti e distinti.");
    }
    return [edge[0], edge[1]];
  });
  if (new Set(edges.map(edge => edge.join(":"))).size !== edges.length) throw Error("Relazione duplicata.");
  const forbidden = /[<>@\u0000-\u001f\u007f-\u009f]|(?:[a-z][a-z0-9+.-]*:\/\/|(?:https?|javascript|data|mailto|file|blob|vbscript)\s*:|www\.|\/\/|\b[\w-]+\.(?:it|com|org|net|edu|gov|io|dev)\b)/i;
  if ([source.title, source.description, ...nodes.flatMap(node => [node.label, node.detail])].some(text => forbidden.test(text))) {
    throw Error("Inserisci solo testo, senza markup o indirizzi.");
  }
  return authoredSource(source.title, source.description, nodes, edges);
}

export async function verifyAuthoredPackage(value: unknown) {
  const files = record(record(value).files);
  const receiptName = "education-receipt.json";
  const names = ["education-source.json", "guida-docente.md", ...DIAGRAM_VARIANTS.flatMap(variant =>
    ["html", "svg"].map(extension => `${AUTHORED_STEM}-${variant}.${extension}`))];
  if (Object.keys(files).length !== names.length + 1 || typeof files[receiptName] !== "string") throw Error("Pacchetto incompleto.");
  const receipt = record(JSON.parse(files[receiptName]));
  if (receipt.schema !== "trama.diagram-education-receipt/v0.2" || receipt.status !== "GENERATED_TEACHER_REVIEW_REQUIRED" ||
      receipt.runtimeAuthorized !== false || receipt.publicationAuthorized !== false || receipt.sourceOrigin !== "teacher-authored" ||
      !hash(receipt.profilesSha256) || !hash(receipt.rendererSha256)) throw Error("Ricevuta non valida.");
  const hashes = record(receipt.files);
  if (Object.keys(hashes).length !== names.length) throw Error("Ricevuta incompleta.");
  const artifacts = await Promise.all(names.map(async name => {
    const file = files[name];
    const expected = hashes[name];
    if (typeof file !== "string" || !hash(expected)) throw Error("Pacchetto incompleto.");
    await verifyEducationFile(new TextEncoder().encode(file).buffer, expected);
    return [name, file] as const;
  }));
  return Object.fromEntries([...artifacts, [receiptName, files[receiptName]]]);
}
