import { readFileSync } from "node:fs";

const report=JSON.parse(readFileSync(process.argv[2] || "a4-bundle-report.json","utf8"));
const files=report.files || [];
const js=files.filter((file)=>file.file.endsWith(".js"));
const css=files.filter((file)=>file.file.endsWith(".css"));
const entry=js.find((file)=>/^assets\/index-.*\.js$/.test(file.file));
const graph=js.find((file)=>/EcosystemGraph-.*\.js$/.test(file.file));

if(!entry) throw new Error("TRAMA_A4_ENTRY_CHUNK_MISSING");
if(!graph) throw new Error("TRAMA_A4_GRAPH_LAZY_CHUNK_MISSING");

const shellLimit=180*1024;
const graphLimit=250*1024;
const cssLimit=50*1024;
const cssGzip=css.reduce((sum,file)=>sum+Number(file.gzipBytes || 0),0);

const result={
 schemaVersion:"trama.control-center-a4-bundle-budget/v1",
 entryJsGzip:Number(entry.gzipBytes || 0),
 entryLimitGzipBytes:shellLimit,
 graphJsGzip:Number(graph.gzipBytes || 0),
 graphLimitGzipBytes:graphLimit,
 cssGzip,
 cssLimitGzipBytes:cssLimit,
 graphLazy:true,
 status:Number(entry.gzipBytes)<=shellLimit && Number(graph.gzipBytes)<=graphLimit && cssGzip<=cssLimit ? "PASS":"FAIL",
};

console.log(JSON.stringify(result,null,2));
if(result.status!=="PASS") process.exit(1);
