import { approveProjectSourceFile, inspectProjectSourceCandidate, readProjectSourceFile } from "../lib/visual-project-source-operator-node";

async function main() {
  const args=process.argv.slice(2);
  if(args[0]==="inspect"&&args.length===2) {
    const {summary}=await inspectProjectSourceCandidate(await readProjectSourceFile(args[1]));
    console.log(JSON.stringify(summary,null,2));
    return;
  }
  if(args[0]==="approve"&&args.length===5&&args[3]==="--reviewed-digest") {
    console.log(JSON.stringify(await approveProjectSourceFile(args[1],args[2],args[4]),null,2));
    return;
  }
  throw Error("Usage: inspect <candidate.json> | approve <candidate.json> <new-approval.json> --reviewed-digest <sha256>");
}
main().catch(error=>{console.error(error instanceof Error?error.message:"PROJECT_SOURCE_INVALID");process.exitCode=1;});
