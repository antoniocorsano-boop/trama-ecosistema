import type {ActivityDraft} from "./activity-drafts";
import type {ConversationRevision} from "./edutwin-conversation";
import type {PreviewIllustratedMedia,StudioAtlasPreviewSnapshot} from "./model";
import {buildStudioAtlasReviewPreviewSnapshot} from "./preview";
import {resolveOriginalImages} from "./edutwin-original-images";
import {DISPLAY_TOTAL_PIXELS,MEDIA_MAX_TOTAL_BYTES} from "./activity-media-limits";

// Created only by explicit local story-review action. Never import approval from a handoff.
export type LocalStoryReview={revisionDigest:string;decision:"PASS";reviewedAt:string};
function fail(code:string):never{throw new Error(code);}
import {mediaDigestInput,shaText as sha} from "./preview-media-integrity";
export {mediaDigestInput} from "./preview-media-integrity";
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
