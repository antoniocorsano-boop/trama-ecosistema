import { runApprovedProjectReference } from "../lib/visual-project-reference-operator-node";
async function main(){
  const [mode,approvalFile,reviewedPlanDigest,jobId,outputDir,...extra]=process.argv.slice(2);
  if(!["prepare","execute"].includes(mode)||!approvalFile||!reviewedPlanDigest||!jobId||!outputDir||extra.length)
    throw Error("Usage: prepare|execute <approval.json> <reviewed-plan-digest> <job-id> <new-output-dir>");
  const evidence=await runApprovedProjectReference({approvalFile,reviewedPlanDigest,jobId,outputDir,execute:mode==="execute"},process.env);
  console.log(JSON.stringify(evidence,null,2));
  if(evidence.status==="FAILED")process.exitCode=1;
}
main().catch(error=>{console.error(error instanceof Error?error.message:"PROJECT_EXECUTION_FAILED");process.exitCode=1;});
