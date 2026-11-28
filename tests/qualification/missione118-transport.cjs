// Test process only. No route, configuration switch or fallback in production code.
const fs=require("node:fs");
const path=process.env.STUDIO_QUALIFICATION_INTAKE_FIXTURE;
if(!path)throw Error("Qualification fixture missing");
const fixture=JSON.parse(fs.readFileSync(path,"utf8"));
if(fixture.sha!=="f0c29655632a7edc6d78c78d48d006aa8da020a2")throw Error("Qualification source mismatch");
const realFetch=globalThis.fetch;
globalThis.fetch=async function(input,init){
 const url=typeof input==="string"?input:input instanceof URL?input.href:input.url;
 if(Object.hasOwn(fixture.responses,url)){
  const bytes=Buffer.from(fixture.responses[url],"base64");
  return new Response(bytes,{status:200,headers:{"content-length":String(bytes.length),"content-type":url.startsWith("https://api.github.com/")?"application/json":"application/octet-stream"}});
 }
 if(/^https:\/\/(api\.github\.com|raw\.githubusercontent\.com)(\/|$)/.test(url))throw Error("Unexpected GitHub request in deterministic qualification");
 return realFetch(input,init);
};
