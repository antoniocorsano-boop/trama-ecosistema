import test from "node:test";
import assert from "node:assert/strict";
import {sliderCrank,CRANK_RADII,ROD_LENGTHS} from "./simulation-slider-crank";
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test("VF-SIMULATION-01 P3a slider-crank: extreme positions, stroke and rod length",()=>{
  for(const r of CRANK_RADII)for(const l of ROD_LENGTHS){
    close(sliderCrank(r,l,0).sliderX,l+r);
    close(sliderCrank(r,l,180).sliderX,l-r);
    close(sliderCrank(r,l,360).sliderX,l+r);
    for(let angle=0;angle<360;angle+=5){
      const s=sliderCrank(r,l,angle);
      close(Math.hypot(s.sliderX-s.pinX,s.pinY),l);
      assert.ok(s.displacement>=-1e-8&&s.displacement<=s.stroke+1e-8);
      close(s.stroke,2*r);
    }
  }
});
test("VF-SIMULATION-01 P3a slider-crank: repeatability and invalid inputs",()=>{
  assert.deepEqual(sliderCrank(30,100,-90),sliderCrank(30,100,270));
  assert.deepEqual(sliderCrank(40,140,720),sliderCrank(40,140,0));
  for(const [r,l,a] of [[0,100,0],[20,20,0],[20,100,Infinity],[NaN,100,0]])assert.throws(()=>sliderCrank(r,l,a));
});
