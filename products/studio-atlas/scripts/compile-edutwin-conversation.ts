import {readFile} from "node:fs/promises";
import {compileConversationRevision,type ConversationRevision} from "../lib/edutwin-conversation";

// Local developer entrypoint. Do not pass a raw conversation or student information.
// Parent digest must be supplied independently by the trusted caller.
async function main(){
 const args=process.argv.slice(2);
 if(args.length!==3&&args.length!==5)throw new Error("Usage: tsx scripts/compile-edutwin-conversation.ts <structured-input.json> <project-id> <ISO-time> [<parent.json> <expected-parent-digest>]");
 const [path,projectId,now,parentPath,parentDigest]=args;
 const input:unknown=JSON.parse(await readFile(path,"utf8"));
 const parent:ConversationRevision|undefined=parentPath?JSON.parse(await readFile(parentPath,"utf8")):undefined;
 const result=await compileConversationRevision(input,{projectId,now},parent,parentDigest);
 console.log(JSON.stringify(result,null,2));
}
main().catch(()=>{console.error("EDUTWIN_CONVERSATION_COMPILATION_FAILED");process.exitCode=1;});
