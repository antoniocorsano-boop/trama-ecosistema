import { writeFile } from "node:fs/promises";
import { inspectCloudflareVisualEntitlement } from "../lib/visual-cloudflare-entitlement-node";

async function main(){
 const args=process.argv.slice(2);
 if(args.length!==1||!args[0])throw Error("Usage: visual-factory:cloudflare-entitlement <new-private-report.json>");
 // Reserve the destination before any network operation; never overwrite evidence.
 await writeFile(args[0],JSON.stringify({status:"OBSERVATION_STARTED",executionAuthorized:false})+"\n",{flag:"wx",mode:0o600});
 const report=await inspectCloudflareVisualEntitlement(process.env);
 await writeFile(args[0],JSON.stringify(report,null,2)+"\n",{mode:0o600});
 console.log(JSON.stringify({billing:report.billing.status,usage:report.usage.status,decision:report.decision,inferenceCallCount:report.inferenceCallCount}));
}
main().catch(()=>{console.error("CLOUDFLARE_ENTITLEMENT_OBSERVATION_FAILED");process.exitCode=1;});
