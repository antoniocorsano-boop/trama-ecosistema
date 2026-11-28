import {test} from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {sha256} from "./activity-intake";
import {webpDimensions,verifyArchivedGallery,enrichArchivedGallery,GALLERY_VERIFIED} from "./activity-gallery";
import type {ActivityDraft,ActivityFile} from "./activity-drafts";
async function image(w:number,h:number,lossless=true){
  return sharp({create:{width:w,height:h,channels:3,background:"#234567"}}).webp({lossless}).toBuffer();
}
function file(data:Buffer,path="media/image.webp"):ActivityFile {
  return {path,type:"IMAGE",format:"image/webp",sha256:sha256(data),base64:data.toString("base64")};
}
function draft(files:ActivityFile[]):ActivityDraft {
  return {key:"activity@0.1.0-draft#digest",activityId:"activity",version:"0.1.0-draft",manifestDigest:"digest",
    manifest:{title:"Legacy",kind:"TEST",assets:files.map((f,i)=>({id:"file"+i,path:f.path,type:f.type,sha256:f.sha256}))},
    files,source:{repository:"test/repo",pullRequest:1,commitSha:"source",manifestPath:"intake.json"},
    importedAt:"2026-01-01T00:00:00Z",status:"DRAFT_PENDING_HUMAN_REVIEW"};
}
test("old WebP lossless and lossy headers recovered without changing the original bytes",async()=>{
  const a=file(await image(640,960),"media/a.webp"),b=file(await image(768,1152,false),"media/b.webp");
  const old=draft([a,b]),out=enrichArchivedGallery(old,await verifyArchivedGallery(old));
  assert.equal(out.galleryValidation,GALLERY_VERIFIED);
  assert.deepEqual(out.files.map(f=>[f.pixelWidth,f.pixelHeight]),[[640,960],[768,1152]]);
  assert.deepEqual(out.files.map(({pixelWidth,pixelHeight,...f})=>f),old.files);
  assert.deepEqual(out.source,old.source);assert.equal(out.importedAt,old.importedAt);
  assert.equal(old.files[0].pixelWidth,undefined);
});
test("4K accepted, oversized and aggregate budgets rejected before decoding",async()=>{
  const good=await image(3840,2160),bad=await image(4096,4096);
  assert.equal(webpDimensions(good).pixelWidth,3840);
  assert.throws(()=>webpDimensions(bad));
  await assert.rejects(()=>verifyArchivedGallery(draft([file(good,"a.webp"),file(good,"b.webp"),file(good,"c.webp")])));
});
test("corrupt bytes and mismatched declarations cannot be migrated",async()=>{
  const b=await image(16,16),f=file(b),old=draft([f]),v=await verifyArchivedGallery(old);
  const corrupt={...old,files:[{...f,base64:Buffer.from("not webp").toString("base64")}]};
  await assert.rejects(()=>verifyArchivedGallery(corrupt));
  assert.throws(()=>enrichArchivedGallery(corrupt,v));
  await assert.rejects(()=>verifyArchivedGallery({...old,manifest:{...old.manifest,assets:[]}}));
  const altered=Buffer.from(b);altered[4]^=1;assert.throws(()=>webpDimensions(altered));
});
test("extended canvas must match the actual image; animation is not admitted",async()=>{
  const b=await image(16,16);
  const chunk=Buffer.alloc(18);chunk.write("VP8X");chunk.writeUInt32LE(10,4);chunk[12]=15;chunk[15]=15;
  const extended=Buffer.concat([b.subarray(0,12),chunk,b.subarray(12)]);extended.writeUInt32LE(extended.length-8,4);
  assert.deepEqual(webpDimensions(extended),{pixelWidth:16,pixelHeight:16});
  extended[24]=16;assert.throws(()=>webpDimensions(extended));
  extended[24]=15;extended[20]=2;assert.throws(()=>webpDimensions(extended));
});
