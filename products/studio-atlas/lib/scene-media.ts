import type {PathwayProject,PathwayScene,SceneIllustration,StudioAtlasPreviewSnapshot,PreviewIllustratedMedia} from "./model";
import {webpDimensions} from "./activity-gallery";
import {mediaDigestInput,shaBytes,shaText} from "./preview-media-integrity";

// Bounded first increment in the existing local project store. Original bytes are never silently recompressed.
export const SCENE_IMAGE_MAX_BYTES=256*1024;
export const PROJECT_IMAGE_MAX_BYTES=512*1024;
const MAX_TOTAL_PIXELS=24_000_000;
export function validHotspot(value:unknown):value is {x:number;y:number}{
 if(!value||typeof value!=="object"||Array.isArray(value)||Object.keys(value).length!==2)return false;
 const p=value as {x?:unknown;y?:unknown};
 return [p.x,p.y].every(v=>typeof v==="number"&&Number.isInteger(v)&&v>=0&&v<=100);
}
export function sceneImageBytes(image:SceneIllustration){
 if(typeof image.base64!=="string"||image.base64.length===0||image.base64.length>4*Math.ceil(SCENE_IMAGE_MAX_BYTES/3)||image.base64.length%4!==0||!/^[A-Za-z0-9+/]+={0,2}$/.test(image.base64))throw Error("IMAGE_FORMAT");
 const bytes=Uint8Array.from(atob(image.base64),c=>c.charCodeAt(0));
 if(bytes.length>SCENE_IMAGE_MAX_BYTES)throw Error("IMAGE_LIMIT");
 const dims=webpDimensions(bytes);
 if(dims.pixelWidth!==image.pixelWidth||dims.pixelHeight!==image.pixelHeight||!/^[0-9a-f]{64}$/.test(image.sha256))throw Error("IMAGE_INTEGRITY");
 return bytes;
}
export function sceneImageErrors(scene:PathwayScene):string[]{
 const points=scene.stage?.evidence?.filter(item=>item.hotspot!==undefined)??[];
 if(!scene.illustration)return points.length?["IMAGE_REQUIRED"]:[];
 const errors:string[]=[];
 if(!points.length||points.some(p=>!validHotspot(p.hotspot)))errors.push("POINTS");
 if(typeof scene.illustration.alt!=="string"||!scene.illustration.alt.trim()||scene.illustration.alt.length>300)errors.push("ALT");
 try{sceneImageBytes(scene.illustration)}catch{errors.push("IMAGE_INTEGRITY");}
 return errors;
}
export function projectImageErrors(scenes:readonly PathwayScene[]):string[]{
 const errors=scenes.flatMap(sceneImageErrors);
 let bytes=0,pixels=0,count=0;
 for(const scene of scenes)if(scene.illustration){
  try{bytes+=sceneImageBytes(scene.illustration).length;pixels+=scene.illustration.pixelWidth*scene.illustration.pixelHeight;count++}catch{errors.push("IMAGE_INTEGRITY")}
 }
 if(bytes>PROJECT_IMAGE_MAX_BYTES||pixels>MAX_TOTAL_PIXELS||count>32)errors.push("PROJECT_IMAGE_LIMIT");
 return [...new Set(errors)];
}
export async function makeSceneIllustration(bytes:Uint8Array<ArrayBuffer>):Promise<SceneIllustration>{
 if(!bytes.length||bytes.length>SCENE_IMAGE_MAX_BYTES)throw Error("IMAGE_LIMIT");
 const dimensions=webpDimensions(bytes);
 let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);
 return {...dimensions,base64:btoa(binary),sha256:await shaBytes(bytes),alt:""};
}
export async function attachSceneMedia(project:PathwayProject,snapshot:StudioAtlasPreviewSnapshot):Promise<StudioAtlasPreviewSnapshot>{
 if(projectImageErrors(project.scenes).length)throw Error("SCENE_MEDIA_INVALID");
 const bindings:PreviewIllustratedMedia["bindings"]=[],images:PreviewIllustratedMedia["images"]=[];
 for(const scene of project.scenes){
  const image=scene.illustration;
  if(!image)continue;
  if(await shaBytes(sceneImageBytes(image))!==image.sha256)throw Error("SCENE_MEDIA_HASH");
  const assetId="image-"+image.sha256;
  bindings.push({sceneId:scene.sceneId,assetId,alt:image.alt,role:"SCENE"});
  if(!images.some(i=>i.assetId===assetId)){
   const {alt,...rest}=image;void alt;
   images.push({assetId,...rest});
  }
 }
 if(!bindings.length)return snapshot;
 if(snapshot.scenes[0]?.sceneId==="edutwin-opening")throw Error("SCENE_MEDIA_RESERVED");
 const media={revisionDigest:snapshot.packageDigest,bindings,images};
 return {...snapshot,sceneMedia:{...media,mediaDigest:await shaText(mediaDigestInput(snapshot,media))}};
}
