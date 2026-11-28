import {createHash} from "node:crypto";
import {createRequire} from "node:module";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {pathToFileURL} from "node:url";
import {SIMULATION_LABS} from "./vf-simulation-lab-registry.mjs";
const require=createRequire(import.meta.url),base=resolve(import.meta.dirname,"..");
const blob=b=>createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
const digest=b=>createHash("sha256").update(b).digest("hex");
const hash=b=>createHash("sha256").update(b).digest("base64");
export function buildSimulationLab(id){
  if(!Object.hasOwn(SIMULATION_LABS,id))throw Error("Unknown simulation lab");
  const p=SIMULATION_LABS[id], three=p.renderer==="three-r128";
  const engine=three?readFileSync(require.resolve("three/build/three.min.js")):null;
  if(engine&&blob(engine)!=="b14f47c0908bab15e890b468d53bb07db0be3a18")throw Error("Unexpected Three runtime");
  const source=readFileSync(join(base,"lib",p.module),"utf8"),ts=require("typescript");
  const emitted=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
  if(emitted.diagnostics?.some(d=>d.category===ts.DiagnosticCategory.Error)||/<\/script/i.test(emitted.outputText)||(engine&&/<\/script/i.test(engine.toString())))throw Error("Unsafe module");
  const allowed=three?'if(name==="three")return window.THREE;':"";
  const mod="(function(){var exports={};function require(name){"+allowed+"throw Error(\"Unexpected dependency\");}\n"+emitted.outputText+"\nreturn exports;})()";
  const sourceTemplate=readFileSync(join(base,"scripts",p.template),"utf8");
  let raw=sourceTemplate, configuration;
  if(three){
    const values=[12,24,36,48];
    const profile=p.teachingProfile?JSON.parse(readFileSync(join(base,"lib",p.teachingProfile),"utf8")):{driverTeeth:12,drivenTeeth:24};
    const {driverTeeth,drivenTeeth}=profile;
    if(p.teachingProfile)configuration={driverTeeth,drivenTeeth};
    if(Object.keys(profile).length!==2||!values.includes(driverTeeth)||!values.includes(drivenTeeth))throw Error("Invalid gear teaching profile");
    const options=selected=>values.map(teeth=>"<option"+(teeth===selected?" selected":"")+">"+teeth+"</option>").join("");
    const bindings={
      "__DRIVER_OPTIONS__":options(driverTeeth===values[0]?undefined:driverTeeth),
      "__DRIVEN_OPTIONS__":options(drivenTeeth),
      "__DRIVER_DEFAULT__":String(driverTeeth),
      "__DRIVEN_DEFAULT__":String(drivenTeeth),
      "__READOUT_ATTRIBUTES__":p.teachingProfile?' aria-live="polite" aria-atomic="true"':"",
      "__DISPLAY_RATIO__":p.teachingProfile?"(-s.speedRatio)":"s.speedRatio",
      "__RATIO_EXPLANATION__":p.teachingProfile
        ?"Il rapporto con segno è velocità del condotto / velocità del conduttore = − denti del conduttore / denti del condotto."
        :"Il rapporto delle velocità è denti del conduttore / denti del condotto.",
    };
    for(const [marker,value] of Object.entries(bindings)){
      if(raw.split(marker).length!==2)throw Error("Missing or duplicate gear template marker");
      raw=raw.replace(marker,()=>value);
    }
  }
  if(raw.split(p.placeholder).length!==2||raw.includes("__THREE_RUNTIME__")!==three||raw.includes("__ENGINE_HASH__")!==three)throw Error("Template contract mismatch");
  const template=raw.replace(p.placeholder,()=>mod),app=template.match(/<script>\n([\s\S]*?)<\/script><\/body>/)?.[1],css=template.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  if(!app||!css||/<script\s+src=/i.test(raw)||/<link\b/i.test(raw))throw Error("Invalid template");
  let html=template.replace("__APP_HASH__",hash("\n"+app)).replace("__CSS_HASH__",hash(css));
  if(engine)html=html.replace("__ENGINE_HASH__",hash(engine)).replace("__THREE_RUNTIME__",()=>engine.toString());
  if(/__(?:ENGINE_HASH|APP_HASH|CSS_HASH|THREE_RUNTIME|GEAR_MODULE|MECHANISM_MODULE)__/.test(html))throw Error("Unresolved placeholder");
  const dir=join(base,".artifacts");mkdirSync(dir,{recursive:true});
  const file=join(dir,"vf-simulation-"+id+".html");writeFileSync(file,html);
  const receipt={schema:configuration?"atlas.simulation-lab/v0.2":"atlas.simulation-lab/v0.1",...(configuration?{configuration}:{}),id,status:"TEACHER_REVIEW_REQUIRED",engine:p.renderer,objective:p.objective,question:p.question,sourceKind:p.sourceKind,sourceBlob:blob(Buffer.from(source)),templateBlob:blob(Buffer.from(configuration?sourceTemplate:raw)),engineBlob:engine?blob(engine):null,htmlSha256:digest(html),bytes:Buffer.byteLength(html),costPolicy:"FREE_ONLY",studentAuthorized:false,publicationAuthorized:false};
  writeFileSync(join(dir,"vf-simulation-"+id+"-receipt.json"),JSON.stringify(receipt,null,2));
  return receipt;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  for(const id of Object.keys(SIMULATION_LABS))console.log(JSON.stringify(buildSimulationLab(id)));
}
