import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectCloudflareVisualEntitlement } from "./visual-cloudflare-entitlement-node";
const account="a".repeat(32),env={CLOUDFLARE_ACCOUNT_ID:account,CLOUDFLARE_API_TOKEN:"test-token"};
const now=new Date("2026-11-26T00:01:00Z");
const free={success:true,errors:[],result:[{rate_plan:{id:"WORKERS_FREE",scope:"account"},price:0,state:"Provisioned"}]};
const usage=(value:number)=>({data:{viewer:{accounts:[{accountTag:account,aiInferenceAdaptiveGroups:[{sum:{totalNeurons:value}}]}]}}});
test("F3.4a2 read-only account observations never grant execution or disclose token",async()=>{
 let count=0;
 const report=await inspectCloudflareVisualEntitlement(env,async(input,init)=>{
  count++;assert.equal(new Headers(init?.headers).get("authorization"),"Bearer test-token");assert.equal(init?.redirect,"error");
  if(count===1){assert.equal(String(input),"https://api.cloudflare.com/client/v4/accounts/"+account+"/subscriptions");assert.equal(init?.method,"GET");return Response.json(free);}
  assert.equal(String(input),"https://api.cloudflare.com/client/v4/graphql");assert.equal(init?.method,"POST");
  const body=JSON.parse(String(init?.body));assert.equal(body.variables.day,"2026-11-26");assert.equal(body.variables.account,account);assert.match(body.query,/^query /);return Response.json(usage(12.4));
 },now);
 assert.equal(count,2);assert.equal(report.billing.value,"WORKERS_FREE_EXPLICIT");assert.equal(report.estimatedRemainingNeurons,9987);
 assert.equal(report.decision,"WAITING_FOR_COMPUTE");assert.equal(report.executionAuthorized,false);assert.equal(report.inferenceCallCount,0);
 assert.ok(!JSON.stringify(report).includes("test-token"));assert.ok(!JSON.stringify(report).includes(account));
});
test("F3.4a2 absent config, denied permissions, empty/incomplete response and paid plan fail closed",async()=>{
 const absent=await inspectCloudflareVisualEntitlement({},async()=>{throw Error("unexpected");},now);assert.equal(absent.usage.status,"NOT_CONFIGURED");
 const denied=await inspectCloudflareVisualEntitlement(env,async()=>new Response(null,{status:403}),now);
 assert.equal(denied.billing.status,"ACCESS_DENIED");assert.equal(denied.estimatedRemainingNeurons,null);
 const cases=[
 [{success:true,errors:[],result:[]},{data:{viewer:{accounts:[]}}},"WORKERS_PLAN_UNCONFIRMED"],
 [{...free,result_info:{total_count:2}}, {data:{viewer:{accounts:[{accountTag:account,aiInferenceAdaptiveGroups:[]}]}}},null],
 [{success:true,errors:[],result:[{rate_plan:{id:"WORKERS_PAID"},state:"Paid"}]}, {errors:[{message:"denied"}],...usage(0)},"WORKERS_PAID_PRESENT"]
 ] as const;
 for(const [b,u,expected] of cases){
  const r=await inspectCloudflareVisualEntitlement(env,async(input)=>Response.json(String(input).endsWith("/subscriptions")?b:u),now);
  assert.equal(r.billing.value,expected);assert.equal(r.estimatedRemainingNeurons,null);assert.equal(r.executionAuthorized,false);
 }
});
