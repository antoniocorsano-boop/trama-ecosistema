// Real external adapter qualification. No fixture transport; failure remains a failed check.
import assert from "node:assert/strict";
import {POST} from "../app/api/attivita/importa/route";
import {sha256} from "../lib/activity-intake";
async function main(){
 const repo="antoniocorsano-boop/"+["Curri","culum-Atlas"].join("");
 const source="f0c29655632a7edc6d78c78d48d006aa8da020a2";
 const response=await POST(new Request("http://localhost/api/attivita/importa",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({url:"https://github.com/"+repo+"/pull/84"})}));
 const result=await response.json();
 if(!response.ok){
  console.error(JSON.stringify({qualification:"LIVE_GITHUB_INTAKE",result:"FAIL",httpStatus:response.status,diagnostic:result.diagnostic??null,error:result.error}));
  process.exitCode=1;return;
 }
 assert.equal(result.draft.source.commitSha,source);
 assert.equal(result.verified,10);assert.equal(result.draft.files.length,10);
 assert.equal(result.draft.status,"DRAFT_PENDING_HUMAN_REVIEW");
 for(const f of result.draft.files)assert.equal(sha256(Buffer.from(f.base64,"base64")),f.sha256);
 console.log(JSON.stringify({qualification:"LIVE_GITHUB_INTAKE",result:"PASS",source,resources:result.verified}));
}
main().catch(e=>{console.error(e instanceof Error?e.message:"Live qualification failed");process.exitCode=1;});
