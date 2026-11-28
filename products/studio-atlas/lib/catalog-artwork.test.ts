import {test} from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {join} from "node:path";
import {ENVIRONMENT_ART,TOOL_ART,PROFILE_ART} from "./catalog-artwork";
import {ENVIRONMENTS,AUTHORING_TOOLS} from "./authoring-catalog";
import {AUTHORING_PROFILES} from "./authoring-plan";
test("DESIGN-04 illustrated catalog is complete and assets are local",()=>{
  assert.deepEqual(Object.keys(ENVIRONMENT_ART).sort(),ENVIRONMENTS.map(item=>item.id).sort());
  assert.deepEqual(Object.keys(TOOL_ART).sort(),AUTHORING_TOOLS.map(item=>item.id).sort());
  assert.deepEqual(Object.keys(PROFILE_ART).sort(),AUTHORING_PROFILES.map(item=>item.id).sort());
  const assets=[...Object.values(ENVIRONMENT_ART),...Object.values(TOOL_ART),...Object.values(PROFILE_ART)];
  assert.equal(new Set(assets).size,19);
  for(const path of assets){assert.match(path,/^\/design\/atelier\//);assert.ok(existsSync(join(process.cwd(),"public",path.slice(1))),path);}
});
