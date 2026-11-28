// Qualification only. Read immutable original bytes from Git objects, never from a reconstructed activity.
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {writeFileSync} from "node:fs";
const [repo,out]=process.argv.slice(2);
if(!repo||!out)throw Error("Usage: prepare-missione118-intake.mjs git-repository output");
const sha="f0c29655632a7edc6d78c78d48d006aa8da020a2";
const root="content/staging/missione-118/";
const remote="antoniocorsano-boop/"+["Curri","culum-Atlas"].join("");
const api="https://api.github.com/repos/"+remote;
const raw="https://raw.githubusercontent.com/"+remote+"/"+sha+"/";
const git=(...args)=>execFileSync("git",["-C",repo,...args],{maxBuffer:20*1024*1024});
if(git("rev-parse",sha+"^{commit}").toString().trim()!==sha)throw Error("SOURCE_COMMIT");
const hash=b=>createHash("sha256").update(b).digest("hex");
const manifestBytes=git("show",sha+":"+root+"intake.json");
const manifest=JSON.parse(manifestBytes.toString("utf8"));
if(manifest.activityId!=="trama-missione-118-2026"||manifest.assets.length!==10)throw Error("SOURCE_MANIFEST");
const responses={
 [api+"/pulls/84"]:Buffer.from(JSON.stringify({state:"open",head:{sha,repo:{full_name:remote}}})).toString("base64"),
 [api+"/pulls/84/files?per_page=100&page=1"]:Buffer.from(JSON.stringify([{filename:root+"intake.json"}])).toString("base64"),
 [raw+root+"intake.json"]:manifestBytes.toString("base64")
};
const receipt=[];
for(const a of manifest.assets){
 if(typeof a.path!=="string"||!a.path.split("/").every(p=>/^[A-Za-z0-9._-]+$/.test(p)&&p!=="."&&p!==".."))throw Error("SOURCE_PATH");
 const bytes=git("show",sha+":"+root+a.path);
 const blob=git("rev-parse",sha+":"+root+a.path).toString().trim();
 if(hash(bytes)!==a.sha256||(a.bytes!==undefined&&bytes.length!==a.bytes)||(a.gitBlob&&blob!==a.gitBlob))throw Error("SOURCE_INTEGRITY:"+a.path);
 responses[raw+root+a.path]=bytes.toString("base64");
 receipt.push({path:a.path,sha256:a.sha256,bytes:bytes.length,gitBlob:blob});
}
writeFileSync(out,JSON.stringify({sha,responses}),{mode:0o600});
console.log(JSON.stringify({mode:"PINNED_ORIGINAL_TRANSPORT",sha,manifestDigest:hash(manifestBytes),assets:receipt}));
