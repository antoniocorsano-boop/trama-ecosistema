// Only bounded, safe diagnostic fields are exposed. Never log upstream bodies or credentials.
type Phase="PR_METADATA"|"PR_FILES"|"MANIFEST"|"ASSET";
type Category="RATE_LIMIT"|"UPSTREAM_TEMPORARY"|"UPSTREAM_REJECTED"|"NETWORK";
export type IntakeDiagnostic={phase:Phase;category:Category;upstreamStatus:number|null;attempt:number;remaining:number|null;retryAfterSeconds:number|null};
export class IntakeTransportError extends Error{
 constructor(readonly diagnostic:IntakeDiagnostic){
  const d=diagnostic;
  super("Acquisizione GitHub non riuscita ("+d.phase+", "+d.category+(d.upstreamStatus===null?"":", HTTP "+d.upstreamStatus)+").");
  this.name="IntakeTransportError";
 }
}
function integerHeader(response:Response,name:string){
 const value=response.headers.get(name);
 if(value===null||!/^\d{1,10}$/.test(value))return null;
 const n=Number(value);return Number.isSafeInteger(n)?n:null;
}
function report(d: IntakeDiagnostic){
 console.warn("[activity-intake] "+JSON.stringify(d));
}
export async function fetchIntake(url:string,phase:Phase,timeout:number,headers?:HeadersInit,maxBytes?:number):Promise<Uint8Array>{
 for(let attempt=1;attempt<=2;attempt++){
  let response:Response;
  try{response=await fetch(url,{headers,cache:"no-store",signal:AbortSignal.timeout(timeout)});}
  catch{
   const d:IntakeDiagnostic={phase,category:"NETWORK",upstreamStatus:null,attempt,remaining:null,retryAfterSeconds:null};
   report(d);if(attempt===2)throw new IntakeTransportError(d);
   continue;
  }
  if(response.ok){
   // Keep body consumption inside the same attempt and its original abort signal.
   // Size, syntax, schema and integrity errors are not transport errors.
   const length=Number(response.headers.get("content-length")??"0");
   if(maxBytes!==undefined&&length>maxBytes){
    await response.body?.cancel().catch(()=>{});
    throw new Error("Risorsa troppo grande per l'importazione");
   }
   let data:Uint8Array;
   try{data=new Uint8Array(await response.arrayBuffer());}
   catch{
    const d:IntakeDiagnostic={phase,category:"NETWORK",upstreamStatus:response.status,attempt,remaining:integerHeader(response,"x-ratelimit-remaining"),retryAfterSeconds:integerHeader(response,"retry-after")};
    report(d);
    // Honor the same quota and retry-after constraints after successful headers.
    const hasRetry=response.headers.has("retry-after");
    const shortRetry=d.retryAfterSeconds!==null&&d.retryAfterSeconds<=2;
    if(attempt===2||d.remaining===0||(hasRetry&&!shortRetry))throw new IntakeTransportError(d);
    if(shortRetry)await new Promise(resolve=>setTimeout(resolve,(d.retryAfterSeconds??0)*1000+100));
    continue;
   }
   if(maxBytes!==undefined&&data.byteLength>maxBytes)throw new Error("Risorsa troppo grande per l'importazione");
   return data;
  }
  const remaining=integerHeader(response,"x-ratelimit-remaining"),retryAfterSeconds=integerHeader(response,"retry-after");
  const limited=response.status===429||(response.status===403&&(remaining===0||response.headers.has("retry-after")));
  const transient=[500,502,503,504].includes(response.status);
  const d:IntakeDiagnostic={phase,category:limited?"RATE_LIMIT":transient?"UPSTREAM_TEMPORARY":"UPSTREAM_REJECTED",upstreamStatus:response.status,attempt,remaining,retryAfterSeconds};
  report(d);
  // Never hammer a depleted quota, ignore a server retry-after instruction, or retry permanent rejections.
  const hasRetry=response.headers.has("retry-after");
  const shortRetry=retryAfterSeconds!==null&&retryAfterSeconds<=2;
  const canRetry=attempt===1&&remaining!==0&&(
   (transient&&(!hasRetry||shortRetry))||(limited&&shortRetry)
  );
  await response.body?.cancel().catch(()=>{});
  if(!canRetry)throw new IntakeTransportError(d);
  await new Promise(resolve=>setTimeout(resolve,(retryAfterSeconds??0)*1000+100));
 }
 throw Error("INTAKE_TRANSPORT_UNREACHABLE");
}
