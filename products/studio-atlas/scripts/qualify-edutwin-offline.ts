// Test-only offline qualification. Never served as an Atlas product route.
import {createRoot} from "react-dom/client";
import {createElement} from "react";
import {compileConversationRevision} from "../lib/edutwin-conversation";
import {parseHandoff} from "../lib/edutwin-archive";
import {buildEduTwinIllustratedReviewSnapshot} from "../lib/edutwin-illustrated-preview";
import {resolveOriginalImages} from "../lib/edutwin-original-images";
import type {ActivityDraft} from "../lib/activity-drafts";
import {studioAtlasSnapshotToExperience} from "../../../_atlas/src/features/pathways/studio-atlas-preview-adapter";
import {verifyPreviewIllustrations,verifyDecodedIllustrations} from "../../../_atlas/src/features/pathways/edutwin-preview-media";
import {ExperienceRuntime} from "../../../_atlas/src/features/experiences/experience-runtime";

const root=createRoot(document.getElementById("runtime")!);
const now="2026-11-14T00:00:00.000Z";
let used=false;
async function qualify(raw:string,drafts:ActivityDraft[]){
 if(used)throw new Error("FRESH_TEST_PAGE_REQUIRED");used=true;
 const handoff=parseHandoff(raw);
 if(handoff.expectedParentDigest!==null)throw new Error("INITIAL_CANDIDATE_REQUIRED");
 const revision=await compileConversationRevision(handoff.input,{projectId:handoff.projectId,now});
 const all=await resolveOriginalImages(revision.assets,drafts);
 const originals=all.filter(a=>a.state==="VERIFIED_LOCAL").length;
 // Assert the real gate before supplying a strictly test-local decision.
 let blocked=false;
 try{await buildEduTwinIllustratedReviewSnapshot(revision,undefined,drafts);}
 catch(e){blocked=e instanceof Error&&e.message==="STORY_REVIEW_REQUIRED";}
 if(!blocked)throw new Error("STORY_GATE_REGRESSION");
 const snapshot=await buildEduTwinIllustratedReviewSnapshot(revision,{revisionDigest:revision.digest,decision:"PASS",reviewedAt:now},drafts);
 if(revision.project.storyReview.decision!=="DRAFT"||snapshot.studentAuthorized!==false||snapshot.runtimeAuthorized!==false)throw new Error("AUTHORITY_REGRESSION");
 const definition=studioAtlasSnapshotToExperience(snapshot);
 const illustrations=await verifyPreviewIllustrations(snapshot);
 await verifyDecodedIllustrations(illustrations);
 root.render(createElement(ExperienceRuntime,{definition,verifiedIllustrations:illustrations}));
 return {revisionDigest:revision.digest,snapshotId:snapshot.snapshotId,scenes:snapshot.scenes.map(s=>({id:s.sceneId,title:s.title,interaction:s.interaction})),originals,illustratedScenes:illustrations.size,storyGateBlocked:blocked,review:"TEST_ONLY",studentAuthorized:false,runtimeAuthorized:false};
}
Object.assign(window,{__qualifyEduTwinLocal:qualify});
