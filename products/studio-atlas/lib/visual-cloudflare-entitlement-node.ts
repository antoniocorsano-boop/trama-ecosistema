import { createHash } from "node:crypto";

type Env=Readonly<Record<string,string|undefined>>;
type Status="OBSERVED"|"NOT_CONFIGURED"|"ACCESS_DENIED"|"UNAVAILABLE"|"INVALID_RESPONSE";
type Result<T>={status:Status;value:T|null};
const API="https://api.cloudflare.com/client/v4";
const DAILY_FREE_NEURONS=10000;
const MAX_RESPONSE=1024*1024;
const QUERY="query VisualFactoryUsage($account:String!,$day:Date!){viewer{accounts(filter:{accountTag:$account}){accountTag aiInferenceAdaptiveGroups(limit:2,filter:{date:$day}){sum{totalNeurons}}}}}";
const sha=(value:string)=>createHash("sha256").update(value).digest("hex");
function record(value:unknown):value is Record<string,unknown>{return !!value&&typeof value==="object"&&!Array.isArray(value);}
function result<T>(status:Status,value:T|null=null):Result<T>{return {status,value};}
async function json(response:Response):Promise<unknown>{
 const reader=response.body?.getReader();
 if(!reader)throw Error("MISSING_RESPONSE");
 const parts:Uint8Array[]=[];let size=0;
 try{while(true){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>MAX_RESPONSE)throw Error("RESPONSE_TOO_LARGE");parts.push(next.value);}}
 finally{await reader.cancel().catch(()=>{});}
 return JSON.parse(Buffer.concat(parts).toString("utf8"));
}
async function request<T>(fetcher:typeof fetch,url:string,token:string,init:RequestInit,parse:(raw:unknown)=>T|null):Promise<Result<T>>{
 try{
  const response=await fetcher(url,{...init,headers:{authorization:"Bearer "+token,accept:"application/json",...(init.method==="POST"?{"content-type":"application/json"}:{})},redirect:"error",cache:"no-store",signal:AbortSignal.timeout(15000)});
  if(response.status===401||response.status===403)return result("ACCESS_DENIED");
  if(!response.ok)return result("UNAVAILABLE");
  let raw:unknown;try{raw=await json(response);}catch{return result("INVALID_RESPONSE");}
  const parsed=parse(raw);return parsed===null?result("INVALID_RESPONSE"):result("OBSERVED",parsed);
 }catch{return result("UNAVAILABLE");}
}
type Billing="WORKERS_PAID_PRESENT"|"WORKERS_FREE_EXPLICIT"|"WORKERS_PLAN_UNCONFIRMED";
function subscriptions(raw:unknown):Billing|null{
 if(!record(raw)||raw.success!==true||!Array.isArray(raw.result)||!Array.isArray(raw.errors)||raw.errors.length!==0)return null;
 if(raw.result_info!==undefined){
  if(!record(raw.result_info)||typeof raw.result_info.total_count!=="number"||raw.result_info.total_count!==raw.result.length)return null;
 }
 let free=0;
 for(const item of raw.result){
  if(!record(item)||!record(item.rate_plan)||typeof item.rate_plan.id!=="string"||typeof item.state!=="string")return null;
  const id=item.rate_plan.id.toUpperCase();
  if(id==="WORKERS_PAID")return "WORKERS_PAID_PRESENT";
  // Do not infer Free from an empty list or generic zone-level "free".
  if(id==="WORKERS_FREE"&&item.price===0&&item.rate_plan.scope==="account"&&item.state==="Provisioned")free++;
 }
 return free===1?"WORKERS_FREE_EXPLICIT":"WORKERS_PLAN_UNCONFIRMED";
}
function neurons(raw:unknown,account:string):number|null{
 if(!record(raw)|| (raw.errors!==undefined&&(!Array.isArray(raw.errors)||raw.errors.length!==0))||
    !record(raw.data)||!record(raw.data.viewer)||!Array.isArray(raw.data.viewer.accounts)||raw.data.viewer.accounts.length!==1)return null;
 const item=raw.data.viewer.accounts[0];
 if(!record(item)||item.accountTag!==account||!Array.isArray(item.aiInferenceAdaptiveGroups)||item.aiInferenceAdaptiveGroups.length!==1)return null;
 const group=item.aiInferenceAdaptiveGroups[0];
 if(!record(group)||!record(group.sum)||typeof group.sum.totalNeurons!=="number"||!Number.isFinite(group.sum.totalNeurons)||group.sum.totalNeurons<0||group.sum.totalNeurons>Number.MAX_SAFE_INTEGER)return null;
 return group.sum.totalNeurons;
}

/** Read-only evidence collector, never an attestation issuer or inference client.
 * GraphQL POST is a fixed query, not an inference or mutation. The sampled
 * observed usage is not an authoritative real-time remaining balance. */
export async function inspectCloudflareVisualEntitlement(env:Env,fetcher:typeof fetch=fetch,now=new Date()){
 const account=env.CLOUDFLARE_ACCOUNT_ID?.trim()??"";
 const executionToken=env.CLOUDFLARE_API_TOKEN?.trim()??"";
 const billingToken=env.CLOUDFLARE_BILLING_READ_TOKEN?.trim()||executionToken;
 const analyticsToken=env.CLOUDFLARE_ANALYTICS_READ_TOKEN?.trim()||executionToken;
 const day=now.toISOString().slice(0,10);
 let billing:Result<Billing>=result("NOT_CONFIGURED");
 let usage:Result<number>=result("NOT_CONFIGURED");
 if(/^[a-f0-9]{32}$/i.test(account)){
  if(billingToken)billing=await request(fetcher,API+"/accounts/"+account+"/subscriptions",billingToken,{method:"GET"},subscriptions);
  if(analyticsToken)usage=await request(fetcher,API+"/graphql",analyticsToken,{method:"POST",body:JSON.stringify({query:QUERY,variables:{account,day}})},raw=>neurons(raw,account));
 }
 const observed=usage.value;
 return {schemaVersion:"atlas.visual-cloudflare-entitlement-observation/v0.1",observedAt:now.toISOString(),utcDay:day,
  accountSha256:account&&/^[a-f0-9]{32}$/i.test(account)?sha(account):null,
  executionCredentialConfigured:!!executionToken,billing,usage,
  dailyFreeAllocation:DAILY_FREE_NEURONS,estimatedRemainingNeurons:observed===null?null:Math.max(0,DAILY_FREE_NEURONS-Math.ceil(observed)),
  usageSemantics:"ADAPTIVE_ANALYTICS_NOT_AUTHORITATIVE",hardPaidOverageBlocked:"NOT_ATTESTED",
  executionAuthorized:false,paidComputeAuthorized:false,publicationAuthorityGranted:false,
  decision:"WAITING_FOR_COMPUTE",inferenceCallCount:0};
}
