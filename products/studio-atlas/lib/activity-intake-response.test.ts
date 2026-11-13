import {test} from "node:test";
import assert from "node:assert/strict";
import {intakeJsonResponse} from "./activity-intake-response";
test("JSON stream preserves Unicode including a surrogate pair at the chunk boundary",async()=>{
  const value={text:"x".repeat(65526)+"😀 — attività",files:[{base64:"a".repeat(4_800_000)}]};
  const response=intakeJsonResponse(value);
  assert.equal(response.headers.get("content-type"),"application/json; charset=utf-8");
  assert.equal(response.headers.get("content-length"),null);
  assert.deepEqual(await response.json(),value);
});
