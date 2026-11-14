import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { compileEduTwinDraft, type EduTwinDraftInput } from "../lib/edutwin-draft";
import { missione118DraftInput } from "../lib/canonical/missione118-generator-pilot";
import { getProductionBlockers } from "../lib/production";

async function main(){
 const args=process.argv.slice(2);
 if(args.length!==1)throw new Error("Usage: tsx scripts/compile-edutwin-draft.ts --pilot | <trusted-authoring-input.json>");
 const input:EduTwinDraftInput=args[0]==="--pilot"?missione118DraftInput:JSON.parse(await readFile(args[0],"utf8"));
 const project=compileEduTwinDraft(input,{projectId:randomUUID(),now:new Date().toISOString()});
 // stdout only: no storage mutation, provider execution or publication.
 console.log(JSON.stringify({project,productionBlockers:getProductionBlockers(project),runtimeAuthorized:false,studentAuthorized:false},null,2));
}
main().catch((error:unknown)=>{console.error(error instanceof Error?error.message:"DRAFT_COMPILATION_FAILED");process.exitCode=1;});
