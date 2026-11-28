import assert from "node:assert/strict";
import {test} from "node:test";
import {DEFAULT_RECIPE,parseVisualRecipe,updateSceneVisualRecipe,withoutVisualRecipe,MATERIAL_PRESETS} from "./scene-visual-recipe";
import type {PathwayScene} from "./model";
const scene=(id:string):PathwayScene=>({sceneId:id,kind:"SCENE",interaction:"SUMMARY",title:id,visibleSituation:"s",learnerAction:"a",consequence:"c",reveal:"r",choices:[]});
test("strict, bounded and canonical recipe",()=>{
 assert.deepEqual(parseVisualRecipe(DEFAULT_RECIPE),DEFAULT_RECIPE);
 for(const patch of [{orbit:Infinity},{orbit:.31},{material:"__proto__"},{media:"https://outside.invalid"},{runtimeAuthorized:true},{schema:"v2"},{motion:"auto"}])assert.equal(parseVisualRecipe({...DEFAULT_RECIPE,...patch}),undefined);
 assert.equal(MATERIAL_PRESETS.bronze.metalness,.78);
});
test("scene-local update preserves authored state and can remove the recipe",()=>{
 const a=scene("a"),b=scene("b"),recipe={...DEFAULT_RECIPE,material:"stone" as const,orbit:.12};
 const next=updateSceneVisualRecipe([a,b],"a",recipe);
 assert.deepEqual(next[0].visualRecipe,recipe);assert.equal(next[1],b);assert.deepEqual(withoutVisualRecipe(next[0]),a);
 assert.equal(a.visualRecipe,undefined);assert.equal(updateSceneVisualRecipe(next,"a",undefined)[0].visualRecipe,undefined);
 assert.throws(()=>updateSceneVisualRecipe(next,"missing",recipe),/VISUAL_RECIPE_SCENE_NOT_FOUND/);
 assert.throws(()=>updateSceneVisualRecipe(next,"a",{...recipe,orbit:1}),/INVALID_VISUAL_RECIPE/);
});
