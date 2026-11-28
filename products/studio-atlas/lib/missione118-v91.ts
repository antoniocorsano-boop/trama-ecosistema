// Exact identity of the private V9.1 teacher-preview candidate; not a publication grant.
import type {ActivityDraft} from "./activity-drafts";
import type {QualityCandidate} from "./content-quality-progress";
export const V91_ID:QualityCandidate={activityId:"trama-missione-118-2026",version:"0.4.2-draft",manifestDigest:"c9dc1c6b909d8496dfaf1bc9f7cc43e9ab7e5b2511c0f68e64050e51ed4b5aa4"};
export const V91_ARCHIVE="ecf9c51f03070bc5d70e2e2a0906026371fb0ea39f9d01c8f397377d1a16e95b";
export const V91_HTML={path:"experience.html",type:"INTERACTIVE_HTML",format:"text/html",bytes:1757481,sha256:"03c3a6e5136d73ef1595c785c1a37455a83785fa08e53f2cf67bee3856fc33f9"} as const;
export const V91_GUIDE={path:"teacher/guida_docente.html",type:"TEACHER_GUIDE",format:"text/html",bytes:3685,sha256:"2408113322162908c1eda5a491681c2211868317626e2f63d70a9ebc1c5d4029"} as const;
export const V91_RECEIPT="docs/capabilities/atlas-percorsi/production/CQP-07-MISSIONE-118-V91-TEACHER-PREVIEW.md";
export function matchesV91Draft(draft:ActivityDraft):boolean{
 const s=draft.source;
 return draft.status==="DRAFT_PENDING_HUMAN_REVIEW"&&draft.activityId===V91_ID.activityId&&draft.version===V91_ID.version&&draft.manifestDigest===V91_ID.manifestDigest&&
 s.kind==="LOCAL_ZIP"&&s.archiveDigest===V91_ARCHIVE&&s.manifestPath==="intake.json"&&draft.manifest.experience?.entrypoint===V91_HTML.path;
}
