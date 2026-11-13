import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { MediaBudget, DISPLAY_MAX_PIXELS, DISPLAY_TOTAL_PIXELS } from "./activity-media";
import { sha256 } from "./activity-intake";
async function image(width:number,height:number) {
  return await sharp({create:{width,height,channels:3,background:"#234567"}}).webp({lossless:true}).toBuffer();
}
const asset=(b:Buffer,type="IMAGE")=>({id:"image",path:"media/image.webp",type,format:"image/webp",sha256:sha256(b)});
test("4K derivative remains valid and oversized original stays archive-only",async()=>{
  const b=await image(3840,2160), master=await image(4096,4096);
  const budget=new MediaBudget();
  assert.equal((await budget.inspect(b,asset(b)))?.pixelWidth,3840);
  assert.equal((await budget.inspect(master,asset(master,"SOURCE_MASTER")))?.pixelWidth,4096);
  await assert.rejects(()=>new MediaBudget().inspect(master,asset(master)),/Dimensione/);
});
test("aggregate decoded pixels are bounded independently of file bytes",async()=>{
  const b=await image(3840,2160), budget=new MediaBudget();
  assert.ok(3840*2160<DISPLAY_MAX_PIXELS);
  assert.ok(3*3840*2160>DISPLAY_TOTAL_PIXELS);
  await budget.inspect(b,asset(b));await budget.inspect(b,asset(b));
  await assert.rejects(()=>budget.inspect(b,asset(b)),/budget pixel/);
});
test("spoofed or mismatched image format rejected",async()=>{
  const b=Buffer.from("RIFFxxxxxxxxWEBP");
  await assert.rejects(()=>new MediaBudget().inspect(b,asset(b)));
  const good=await image(16,16);
  await assert.rejects(()=>new MediaBudget().inspect(good,{...asset(good),type:"SOURCE_MASTER",format:"image/png"}));
});
