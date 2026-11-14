import type {ActivityDraft} from "./activity-drafts";
import type {ConversationRevision} from "./edutwin-conversation";
import type {PreviewIllustratedMedia,StudioAtlasPreviewSnapshot} from "./model";
import {buildStudioAtlasReviewPreviewSnapshot} from "./preview";
import {resolveOriginalImages} from "./edutwin-original-images";
import {DISPLAY_TOTAL_PIXELS,MEDIA_MAX_TOTAL_BYTES} from "./activity-media-limits";

// Created only by explicit local story-review action. Never import approval from a handoff.
export type LocalStoryReview={revisionDigest:string;decision:"PASS";reviewedAt:string};
function fail(code:string):never{throw new Error(code);}
// Must match the receiver's fixed order exactly. SHA-256 binds integrity, not identity.
export function mediaDigestInput(snapshot:StudioAtlasPreviewSnapshot,media:Omit<PreviewIllustratedMedia,"mediaDigest">){
 return JSON.stringify({snapshotId:snapshot.snapshotId,packageDigest:snapshot.packageDigest,pathwayId:snapshot.pathwayId,version:snapshot.version,title:snapshot.title,description:snapshot.description,
  scenes:snapshot.scenes,revisionDigest:media.revisionDigest,
  bindings:media.bindings.map(b=>[b.sceneId,b.assetId,b.alt,b.role]),
  images:media.images.map(i=>[i.assetId,i.sha256,i.pixelWidth,i.pixelHeight])});
}
async function sha(text:string){
 return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,"0")).join("");
}
export async function buildEduTwinIllustratedReviewSnapshot(revision:ConversationRevision,review:LocalStoryReview|undefined,drafts:readonly ActivityDraft[]):Promise<StudioAtlasPreviewSnapshot>{
 if(!review||review.decision!=="PASS"||review.revisionDigest!==revision.digest||!Number.isFinite(Date.parse(review.reviewedAt))||
  new Date(review.reviewedAt).toISOString()!==review.reviewedAt||review.reviewedAt<revision.project.updatedAt)
  return fail("STORY_REVIEW_REQUIRED");
 const bindings=structuredClone(revision.sceneIllustrations??[]);
 if(!bindings.length||revision.project.scenes[0]?.sceneId!=="edutwin-opening"||revision.project.scenes.some(s=>s.stage))
  return fail("ILLUSTRATED_PREVIEW_UNSUPPORTED");
 // Existing review-only builder stays authoritative. Local decision applies only
 // to this exact immutable candidate; the archived draft is never promoted.
 const project=structuredClone(revision.project);
 project.storyReview={decision:"PASS",reviewedAt:review.reviewedAt,evidenceRef:"edutwin-local-story:"+revision.digest};
 const snapshot=await buildStudioAtlasReviewPreviewSnapshot(project);
 const ids=[...new Set(bindings.map(b=>b.assetId))];
 if(ids.length>32||bindings.length>100)return fail("ILLUSTRATED_PREVIEW_LIMIT");
 const refs=ids.map(id=>{
  const ref=revision.assets.find(a=>a.id===id&&a.kind==="IMAGE");
  if(!ref)return fail("ILLUSTRATION_ASSET_UNKNOWN");return ref;
 });
 const matches=await resolveOriginalImages(refs,drafts);
 const images:PreviewIllustratedMedia["images"]=[];
 let total=0,pixels=0;
 for(const match of matches){
  if(match.state!=="VERIFIED_LOCAL"||!match.image)return fail("ORIGINAL_IMAGE_REQUIRED");
  const {base64,pixelWidth,pixelHeight}=match.image;
  total+=atob(base64).length;pixels+=pixelWidth*pixelHeight;
  if(total>MEDIA_MAX_TOTAL_BYTES||pixels>DISPLAY_TOTAL_PIXELS)return fail("ILLUSTRATED_PREVIEW_LIMIT");
  images.push({assetId:match.id,sha256:match.sha256,base64,pixelWidth,pixelHeight});
 }
 const media={revisionDigest:revision.digest,bindings,images};
 return {...snapshot,edutwinMedia:{...media,mediaDigest:await sha(mediaDigestInput(snapshot,media))}};
}
