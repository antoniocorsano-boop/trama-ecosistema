import type {PreviewIllustratedMedia,StudioAtlasPreviewSnapshot} from "./model";
// Fixed field order shared with Atlas. Integrity only, not authorization.
export function mediaDigestInput(snapshot:StudioAtlasPreviewSnapshot,media:Omit<PreviewIllustratedMedia,"mediaDigest">){
 return JSON.stringify({snapshotId:snapshot.snapshotId,packageDigest:snapshot.packageDigest,pathwayId:snapshot.pathwayId,version:snapshot.version,title:snapshot.title,description:snapshot.description,
  scenes:snapshot.scenes,revisionDigest:media.revisionDigest,
  bindings:media.bindings.map(b=>[b.sceneId,b.assetId,b.alt,b.role]),
  images:media.images.map(i=>[i.assetId,i.sha256,i.pixelWidth,i.pixelHeight])});
}
export async function shaBytes(bytes:Uint8Array<ArrayBuffer>){
 return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),b=>b.toString(16).padStart(2,"0")).join("");
}
export async function shaText(text:string){return shaBytes(new TextEncoder().encode(text));}
