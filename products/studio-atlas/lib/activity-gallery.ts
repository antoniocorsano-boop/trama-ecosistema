import type { ActivityDraft, ActivityFile } from "./activity-drafts";
import { DISPLAY_MAX_PIXELS, DISPLAY_TOTAL_PIXELS, MEDIA_MAX_EDGE, MEDIA_MAX_FILE_BYTES, MEDIA_MAX_TOTAL_BYTES } from "./activity-media-limits";

export const GALLERY_VERIFIED="WEBP_HEADER_V1" as const;
type Dimensions={pixelWidth:number;pixelHeight:number};
type VerifiedImage={file:ActivityFile;dimensions:Dimensions};
type VerifiedGallery={images:VerifiedImage[];manifestDigest:string;key:string};

function fail():never {throw new Error("Illustrazioni archiviate da verificare");}
function tag(bytes:Uint8Array,at:number) {
  return String.fromCharCode(bytes[at],bytes[at+1],bytes[at+2],bytes[at+3]);
}
export function webpDimensions(bytes:Uint8Array):Dimensions {
  if(bytes.length<20||bytes.length>MEDIA_MAX_FILE_BYTES||tag(bytes,0)!=="RIFF"||tag(bytes,8)!=="WEBP") fail();
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  if(v.getUint32(4,true)+8!==bytes.length) fail();
  let canvas:Dimensions|undefined, image:Dimensions|undefined;
  let offset=12,chunks=0;
  const u24=(i:number)=>bytes[i]+256*bytes[i+1]+65536*bytes[i+2];
  while(offset<bytes.length){
    if(++chunks>1024||offset+8>bytes.length) fail();
    const name=tag(bytes,offset),n=v.getUint32(offset+4,true),start=offset+8,end=start+n,next=end+(n%2);
    if(next>bytes.length) fail();
    if(name==="ANIM"||name==="ANMF") fail();
    if(name==="VP8X"){
      if(offset!==12||canvas||n!==10||(bytes[start]&0xc3)!==0||bytes[start+1]||bytes[start+2]||bytes[start+3]) fail();
      canvas={pixelWidth:u24(start+4)+1,pixelHeight:u24(start+7)+1};
    }
    if(name==="VP8 "||name==="VP8L"){
      if(image) fail();
      if(name==="VP8 "){
        if(n<10||(bytes[start]&1)!==0||bytes[start+3]!==0x9d||bytes[start+4]!==1||bytes[start+5]!==0x2a) fail();
        image={pixelWidth:v.getUint16(start+6,true)&0x3fff,pixelHeight:v.getUint16(start+8,true)&0x3fff};
      }else{
        if(n<5||bytes[start]!==0x2f) fail();
        const bits=v.getUint32(start+1,true);
        if((bits>>>29)!==0) fail();
        image={pixelWidth:(bits&0x3fff)+1,pixelHeight:((bits>>>14)&0x3fff)+1};
      }
    }
    offset=next;
  }
  if(!image||offset!==bytes.length||image.pixelWidth<1||image.pixelHeight<1||
    image.pixelWidth>MEDIA_MAX_EDGE||image.pixelHeight>MEDIA_MAX_EDGE||
    image.pixelWidth*image.pixelHeight>DISPLAY_MAX_PIXELS||
    (canvas&&(canvas.pixelWidth!==image.pixelWidth||canvas.pixelHeight!==image.pixelHeight))) fail();
  return image;
}
function galleryFiles(draft:ActivityDraft):ActivityFile[] {
  if(!Array.isArray(draft.manifest?.assets)||!Array.isArray(draft.files)||draft.files.length>100||draft.manifest.assets.length>100) fail();
  const declared=draft.manifest.assets.filter(a=>a?.type==="IMAGE");
  const files=draft.files.filter(f=>f?.type==="IMAGE");
  if(files.length!==declared.length||new Set(files.map(f=>f.path)).size!==files.length||
    new Set(declared.map(a=>a.path)).size!==declared.length) fail();
  for(const a of declared){
    const f=files.find(f=>f.path===a.path);
    if(!f||f.format!=="image/webp"||typeof f.sha256!=="string"||!/^[a-f0-9]{64}$/.test(f.sha256)||
      f.sha256!==a.sha256||typeof f.base64!=="string"||f.base64.length>4*Math.ceil(MEDIA_MAX_FILE_BYTES/3)) fail();
  }
  return files;
}
export async function verifyArchivedGallery(draft:ActivityDraft):Promise<VerifiedGallery>{
  const files=galleryFiles(draft);
  const images:VerifiedImage[]=[];
  let pixels=0,byteCount=0;
  for(const file of files){
    if(!globalThis.crypto?.subtle) fail();
    const bytes=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0));
    byteCount+=bytes.length;
    if(bytes.length>MEDIA_MAX_FILE_BYTES||byteCount>MEDIA_MAX_TOTAL_BYTES) fail();
    const dimensions=webpDimensions(bytes);
    pixels+=dimensions.pixelWidth*dimensions.pixelHeight;
    if(pixels>DISPLAY_TOTAL_PIXELS) fail();
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),b=>b.toString(16).padStart(2,"0")).join("");
    if(digest!==file.sha256) fail();
    images.push({file,dimensions});
  }
  return {images,key:draft.key,manifestDigest:draft.manifestDigest};
}
// Apply only to the exact same archived images and manifest; preserve all other current fields.
export function enrichArchivedGallery(current:ActivityDraft,verified:VerifiedGallery):ActivityDraft {
  if(current.key!==verified.key||current.manifestDigest!==verified.manifestDigest) fail();
  const files=galleryFiles(current);
  if(files.length!==verified.images.length) fail();
  for(const f of files){
    const checked=verified.images.find(x=>x.file.path===f.path)?.file;
    if(!checked||checked.sha256!==f.sha256||checked.base64!==f.base64||checked.format!==f.format) fail();
  }
  return {...current,galleryValidation:GALLERY_VERIFIED,files:current.files.map(f=>{
    const checked=verified.images.find(x=>x.file.path===f.path&&f.type==="IMAGE");
    return checked?{...f,...checked.dimensions}:f;
  })};
}
