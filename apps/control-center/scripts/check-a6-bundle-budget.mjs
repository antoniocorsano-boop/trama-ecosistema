import { readFileSync, existsSync } from "node:fs";

const report=JSON.parse(readFileSync(process.argv[2]||"a6-bundle-report.json","utf8"));
const files=report.files||[];
const js=files.filter((file)=>file.file.endsWith(".js"));
const css=files.filter((file)=>file.file.endsWith(".css"));
const entry=js.find((file)=>/^assets\/index-.*\.js$/.test(file.file));
const graph=js.find((file)=>/EcosystemGraph-.*\.js$/.test(file.file));

if(!entry) throw new Error("TRAMA_A6_ENTRY_JS_MISSING");
if(!graph) throw new Error("TRAMA_A6_GRAPH_CHUNK_MISSING");
if(!existsSync("dist/sw.js")) throw new Error("TRAMA_A6_SERVICE_WORKER_MISSING");
if(!existsSync("dist/manifest.json")) throw new Error("TRAMA_A6_MANIFEST_MISSING");

const shellLimit=180*1024;
const graphLimit=250*1024;
const cssLimit=50*1024;
const cssGzip=css.reduce((sum,file)=>sum+Number(file.gzipBytes||0),0);
const result={
 schemaVersion:"trama.control-center-a6-bundle-budget/v1",
 entryJsGzip:Number(entry.gzipBytes||0),
 entryLimitGzipBytes:shellLimit,
 graphJsGzip:Number(graph.gzipBytes||0),
 graphLimitGzipBytes:graphLimit,
 cssGzip,
 cssLimitGzipBytes:cssLimit,
 pwaServiceWorker:true,
 manifest:true,
 status:Number(entry.gzipBytes)<=shellLimit&&Number(graph.gzipBytes)<=graphLimit&&cssGzip<=cssLimit?"PASS":"FAIL"
};
console.log(JSON.stringify(result,null,2));
if(result.status!=="PASS")process.exit(1);
