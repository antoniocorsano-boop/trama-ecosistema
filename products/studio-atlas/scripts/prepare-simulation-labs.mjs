// Build-time only. Reuse the qualified generator; serve inert JSON, never
// executable same-origin HTML from the public asset directory.
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {buildSimulationLab} from "./build-vf-simulation-labs.mjs";
import {SIMULATION_LABS} from "./vf-simulation-lab-registry.mjs";
const app=resolve(import.meta.dirname,".."), out=join(app,"public/design/simulation-labs");
mkdirSync(out,{recursive:true});
for(const id of Object.keys(SIMULATION_LABS)){
  const receipt=buildSimulationLab(id);
  const html=readFileSync(join(app,".artifacts","vf-simulation-"+id+".html"),"utf8");
  if(Buffer.byteLength(html)!==receipt.bytes||receipt.studentAuthorized||receipt.publicationAuthorized)throw Error("Invalid simulation candidate");
  writeFileSync(join(out,id+".json"),JSON.stringify({receipt,html}));
}
