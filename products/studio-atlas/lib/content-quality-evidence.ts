// Repository-curated evidence of two narrow technical checks on exact candidates.
import type {ActivityDraft} from "./activity-drafts";
import type {QualityCandidate,QualityEvidence} from "./content-quality-progress";
import {matchesV91Draft,V91_ID,V91_HTML,V91_GUIDE,V91_RECEIPT} from "./missione118-v91";

export type AssetPin={path:string;type:string;format:string;bytes:number;sha256:string};
const ID:QualityCandidate={activityId:"trama-missione-118-2026",version:"0.3.0-draft",manifestDigest:"407299aa62ac3a190ff6755ac35bf4874d786cab0255e1f8dee426415315f395"};
const ARCHIVE="b93b17206425ecb961c02942feb781f9162006d3bc096a7d6e47e3b4415cc787";
const PINS:readonly AssetPin[]=[
 ["media/ax.webp","IMAGE","image/webp",11564,"53a96a2536c874c518d7842ba56eaaf90c5d0ca1d73e3385ca8e175f05d56f7b"],
 ["media/city.webp","IMAGE","image/webp",132538,"c512666d1688fa76cfb34e31a204fb3a86c50d467a25c9189dc39619e0ef7da2"],
 ["media/cover.webp","IMAGE","image/webp",117782,"b579086d786446f7ed30642ae8ff5fc9d9c5b1b9acb607d932a4acc98c63564f"],
 ["media/end.webp","IMAGE","image/webp",123446,"ec63d1aef89af5189bc9e4e734a21c9c77df0657fb2b5d308aaf2b65caee6932"],
 ["media/lab.webp","IMAGE","image/webp",120884,"fe9696bc64c0a2d7d5f8b8a182984290d6230f18483b6f47167974ba872279b8"],
 ["media/nora.webp","IMAGE","image/webp",11342,"0b6018fbc6163b312917eb59b75703a9b8384e4f74d043dd3927cbf97548aa43"],
 ["media/teo.webp","IMAGE","image/webp",13334,"ac0e33d6698238e73deb075be2cf4aa4aeb294f683770746545ca37378f9807e"],
 ["media/traffic.webp","IMAGE","image/webp",67920,"f1baa863a22d4a7bc9d4b80ad82ead96d28b139f225214691d9a09e7b2c598b2"],
 ["experience.html","INTERACTIVE_HTML","text/html",826355,"6f6b8d3d525373fd5b91b58d3eec31af2d76778e9a3c006d20b80021983e3030"],
 ["teacher/guida_docente.html","TEACHER_GUIDE","text/html",5002,"9f1b1c4e8f204dd75942ba96b59335825d21e5309e57be1f3570196b02177578"]
].map(([path,type,format,bytes,sha256])=>({path:String(path),type:String(type),format:String(format),bytes:Number(bytes),sha256:String(sha256)}));
const RECEIPT="docs/capabilities/atlas-percorsi/production/CQP-02-MISSIONE-118-V7-TECHNICAL-EVIDENCE.md";
const V9_ID:QualityCandidate={activityId:ID.activityId,version:"0.4.1-draft",manifestDigest:"1b00cf15c4dc7a54e805489f631b4d7135a3f50e3fd8ec5ee2267d6fd849d990"};
const V9_ARCHIVE="ab2c5a6b48ccb2aa2196c1a91e9aa7452ea36390e98463f7f495c4d709af684e";
const V9_PINS:readonly AssetPin[]=[
 ...PINS.filter(p=>p.type==="IMAGE").map(p=>({...p,path:p.path.replace(/^media\//,"art/")})),
 {path:"experience.html",type:"INTERACTIVE_HTML",format:"text/html",bytes:1751538,sha256:"9ae45c2c54e39306f4b0a138d14ec98257205bd65ce50326175292548a60e4ba"},
 {path:"teacher/guida_docente.html",type:"TEACHER_GUIDE",format:"text/html",bytes:2454,sha256:"a6d8f907d44dcd4061cb3c1cd2ee8147de8bc510b0db5563c9a8fd878c7d2fb3"}
];
const V9_RECEIPT="docs/capabilities/atlas-percorsi/production/CQP-06-MISSIONE-118-V9-TEACHER-PREVIEW.md";
const V91_PINS:readonly AssetPin[]=[...V9_PINS.filter(p=>p.type==="IMAGE"),V91_HTML,V91_GUIDE];
// Never use a manifest-provided receipt or trust local gallery markers for evidence.
export async function verifyPinnedQualityAssets(draft:ActivityDraft,pins:readonly AssetPin[]):Promise<boolean>{
 try{
  if(!globalThis.crypto?.subtle||!Array.isArray(draft.files)||!Array.isArray(draft.manifest.assets)||draft.files.length!==pins.length||draft.manifest.assets.length!==pins.length) return false;
  if(new Set(pins.map(p=>p.path)).size!==pins.length) return false;
  for(const pin of pins){
   const found=draft.files.filter(f=>f.path===pin.path), declared=draft.manifest.assets.filter(a=>a.path===pin.path);
   if(found.length!==1||declared.length!==1) return false;
   const f=found[0],a=declared[0];
   if(f.type!==pin.type||f.format!==pin.format||f.sha256!==pin.sha256||a.type!==pin.type||a.sha256!==pin.sha256||
    typeof f.base64!=="string"||f.base64.length!==4*Math.ceil(pin.bytes/3))return false;
   const bytes=Uint8Array.from(atob(f.base64),c=>c.charCodeAt(0));
   if(bytes.length!==pin.bytes)return false;
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),b=>b.toString(16).padStart(2,"0")).join("");
   if(hash!==pin.sha256)return false;
  }
  return true;
 }catch{return false;}
}
export async function resolveActivityTechnicalEvidence(draft:ActivityDraft):Promise<QualityEvidence[]>{
 if(matchesV91Draft(draft)){
  if(!await verifyPinnedQualityAssets(draft,V91_PINS))return [];
  return [
   {...V91_ID,check:"ASSET_INTEGRITY",mode:"TECHNICAL",decision:"PASS",reference:V91_RECEIPT+"#integrita-risorse"},
   {...V91_ID,check:"BROWSER_SMOKE",mode:"TECHNICAL",decision:"PASS",reference:V91_RECEIPT+"#prove-browser-locali"}
  ];
 }
 if(draft.activityId===V9_ID.activityId&&draft.version===V9_ID.version&&draft.manifestDigest===V9_ID.manifestDigest&&
 draft.status==="DRAFT_PENDING_HUMAN_REVIEW"&&draft.source.kind==="LOCAL_ZIP"&&draft.source.archiveDigest===V9_ARCHIVE&&
 draft.source.manifestPath==="intake.json"&&draft.manifest.experience?.entrypoint==="experience.html"){
  if(!await verifyPinnedQualityAssets(draft,V9_PINS))return [];
  return [
   {...V9_ID,check:"ASSET_INTEGRITY",mode:"TECHNICAL",decision:"PASS",reference:V9_RECEIPT+"#integrita-risorse"},
   {...V9_ID,check:"BROWSER_SMOKE",mode:"TECHNICAL",decision:"PASS",reference:V9_RECEIPT+"#prove-browser-locali"}
  ];
 }
 if(draft.activityId!==ID.activityId||draft.version!==ID.version||draft.manifestDigest!==ID.manifestDigest||
 draft.status!=="DRAFT_PENDING_HUMAN_REVIEW"||draft.source.kind!=="LOCAL_ZIP"||draft.source.archiveDigest!==ARCHIVE||
 draft.source.manifestPath!=="content/staging/missione-118/intake.json"||draft.manifest.experience?.entrypoint!=="experience.html")return [];
 if(!await verifyPinnedQualityAssets(draft,PINS))return [];
 return [
 {...ID,check:"ASSET_INTEGRITY",mode:"TECHNICAL",decision:"PASS",reference:RECEIPT+"#integrita-risorse"},
 {...ID,check:"BROWSER_SMOKE",mode:"TECHNICAL",decision:"PASS",reference:RECEIPT+"#prove-browser-locali"}
 ];
}
