import { readFileSync } from "node:fs";

const reportPath = process.argv[2] || "a2-bundle-report.json";
const report = JSON.parse(readFileSync(reportPath, "utf8"));
const jsFiles = (report.files || []).filter((file) => file.file.endsWith(".js"));

if (!jsFiles.length) {
  throw new Error("TRAMA_A2_BUNDLE_JS_MISSING");
}

const initialJsGzip = jsFiles.reduce((sum, file) => sum + Number(file.gzipBytes || 0), 0);
const limit = 180 * 1024;

console.log(JSON.stringify({
  schemaVersion: "trama.control-center-a2-bundle-budget/v1",
  initialJsGzip,
  limitGzipBytes: limit,
  status: initialJsGzip <= limit ? "PASS" : "FAIL",
}, null, 2));

if (initialJsGzip > limit) {
  process.exit(1);
}
