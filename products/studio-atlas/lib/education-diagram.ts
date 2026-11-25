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
