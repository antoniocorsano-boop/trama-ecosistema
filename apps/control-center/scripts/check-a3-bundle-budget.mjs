import { readFileSync } from "node:fs";

const reportPath=process.argv[2] || "a3-bundle-report.json";
const report=JSON.parse(readFileSync(reportPath,"utf8"));
const jsFiles=(report.files || []).filter((file)=>file.file.endsWith(".js"));
const entry=jsFiles.find((file)=>/^assets\/index-.*\.js$/.test(file.file));

if(!entry) throw new Error("TRAMA_A3_ENTRY_JS_MISSING");

const initialJsGzip=Number(entry.gzipBytes || 0);
const limit=180*1024;

console.log(JSON.stringify({
  schemaVersion:"trama.control-center-a3-bundle-budget/v2",
  entryFile:entry.file,
  initialJsGzip,
  limitGzipBytes:limit,
  lazyChunksExcluded:true,
  status:initialJsGzip<=limit?"PASS":"FAIL",
},null,2));

if(initialJsGzip>limit) process.exit(1);
