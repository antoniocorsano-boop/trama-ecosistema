import { createHash, createPublicKey, verify } from "node:crypto";
import { open, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { canonicalDigest } from "./visual-preflight";

type Env=Readonly<Record<string,string|undefined>>;
type Binding={accountId:string;token:string;scopedPlanDigest:string};
const MAX_AGE_MS=10*60*1000;
const HEX=/^[a-f0-9]{64}$/;
const MODEL="@cf/black-forest-labs/flux-2-klein-4b";
async function readBounded(path:string,max:number){
 const file=await open(path,constants.O_RDONLY|constants.O_NONBLOCK);
 try{
  const info=await file.stat();
  if(!info.isFile()||info.size<1||info.size>max)throw Error("FREE_PROOF_FILE_INVALID");
  const bytes=Buffer.alloc(info.size+1);
  let used=0;
  while(used<bytes.length){const result=await file.read(bytes,used,bytes.length-used,used);if(!result.bytesRead)break;used+=result.bytesRead;}
  if(used!==info.size)throw Error("FREE_PROOF_FILE_INVALID");
  return bytes.subarray(0,used);
 }finally{await file.close();}
}
const hash=(bytes:string|Buffer)=>createHash("sha256").update(bytes).digest("hex");
function record(value:unknown):value is Record<string,unknown>{return !!value&&typeof value==="object"&&!Array.isArray(value);}

/** A separate verifier inspects current provider-side billing, quota and hard
 * refusal of paid overage and signs the attestation. The executor has only
 * the pinned public key. A flag or self-issued unsigned record is insufficient.
 * No provider billing state is inferred from this local verification. */
export async function verifyProjectFreeExecution(env:Env,binding:Binding,now=Date.now()){
 try{
  const proofPath=env.VISUAL_FACTORY_FREE_PROOF_FILE;
  const sourcePath=env.VISUAL_FACTORY_FREE_PROOF_SOURCE_FILE;
  const keyPath=env.VISUAL_FACTORY_FREE_VERIFIER_PUBLIC_KEY_FILE;
  const pinned=env.VISUAL_FACTORY_FREE_VERIFIER_KEY_SHA256;
  const ledger=env.VISUAL_FACTORY_FREE_PROOF_LEDGER_DIR;
  if(!proofPath||!sourcePath||!keyPath||!pinned||!HEX.test(pinned)||!ledger)return null;
  const envelope:unknown=JSON.parse((await readBounded(proofPath,32*1024)).toString("utf8"));
  if(!record(envelope)||Object.keys(envelope).sort().join(",")!=="payload,signature"||
     !record(envelope.payload)||typeof envelope.signature!=="string"||
     !/^[A-Za-z0-9+/]{86}==$/.test(envelope.signature))return null;
  const payload=envelope.payload;
  if(Object.keys(payload).sort().join(",")!=="accountId,credentialSha256,expiresAt,hardPaidOverageBlocked,issuedAt,maxCalls,model,provider,remainingFreeUnits,requiredFreeUnits,schemaVersion,scopedPlanDigest,sourceSha256,verifiedPlan"||
     payload.schemaVersion!=="atlas.visual-free-execution-proof/v0.1"||
     payload.provider!=="CLOUDFLARE_WORKERS_AI"||payload.model!==MODEL||
     payload.accountId!==binding.accountId||payload.credentialSha256!==hash(binding.token)||
     payload.scopedPlanDigest!==binding.scopedPlanDigest||payload.verifiedPlan!=="FREE"||
     payload.hardPaidOverageBlocked!==true||payload.maxCalls!==1||
     typeof payload.remainingFreeUnits!=="number"||!Number.isSafeInteger(payload.remainingFreeUnits)||
     typeof payload.requiredFreeUnits!=="number"||!Number.isSafeInteger(payload.requiredFreeUnits)||
     payload.requiredFreeUnits<1||payload.remainingFreeUnits<payload.requiredFreeUnits||
     typeof payload.sourceSha256!=="string"||!HEX.test(payload.sourceSha256)||
     typeof payload.issuedAt!=="string"||typeof payload.expiresAt!=="string")return null;
  const issued=Date.parse(payload.issuedAt),expires=Date.parse(payload.expiresAt);
  if(!Number.isFinite(issued)||!Number.isFinite(expires)||issued>now||expires<=now||expires-issued>MAX_AGE_MS)return null;
  const key=createPublicKey(await readBounded(keyPath,16*1024));
  if(key.asymmetricKeyType!=="ed25519"||hash(key.export({type:"spki",format:"der"}))!==pinned)return null;
  const digest=canonicalDigest(payload);
  if(!verify(null,Buffer.from(digest,"utf8"),key,Buffer.from(envelope.signature,"base64")))return null;
  if(hash(await readBounded(sourcePath,4*1024*1024))!==payload.sourceSha256)return null;
  return {digest,sourceSha256:payload.sourceSha256,expires,ledger,keySha256:pinned};
 }catch{return null;}
}

/** Single-use claim in a separately protected, existing operator ledger.
 * Must happen before transport; a failed attempt is not refundable. */
export async function claimProjectFreeExecution(proof:NonNullable<Awaited<ReturnType<typeof verifyProjectFreeExecution>>>){
 if(Date.now()>=proof.expires) return false;
 try{await mkdir(join(proof.ledger,proof.digest),{mode:0o700});return Date.now()<proof.expires;}
 catch{return false;}
}
