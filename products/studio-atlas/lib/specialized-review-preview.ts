// F1 candidate compiler; review only. Does not invoke the existing v0.1 bridge.
type RecordValue = Record<string, unknown>;
const record=(x:unknown):x is RecordValue=>!!x&&typeof x==="object"&&!Array.isArray(x);
const text=(x:unknown):x is string=>typeof x==="string"&&x.trim().length>0&&x.length<=4000;
const id=(x:unknown):x is string=>typeof x==="string"&&/^[a-z][a-z0-9-]{0,63}$/.test(x);
const fail=():never=>{throw Error("AXF_SPECIALIZED_PACKAGE_INVALID")};
const texts=(x:unknown):x is string[]=>Array.isArray(x)&&x.length>0&&x.length<=32&&x.every(text);
const sceneKeys=new Set(["sceneId","order","kind","purpose","learnerVisibleSituation","learnerActions","consequences","nextSceneRefs","interaction","specialized"]);
export async function compileSpecializedReviewSnapshot(value:unknown) {
  if(!record(value)||Object.keys(value).some(k=>!["schemaVersion","packageId","packageVersion","pathwayId","title","authoringState","sourceSeed","publicationCandidate","runtimeAuthorized","scenes"].includes(k))||value.schemaVersion!=="atlas.pathway-authoring-package/v0.2"||value.runtimeAuthorized!==false||
     value.authoringState!=="AUTHORING"||
     !record(value.publicationCandidate)||value.publicationCandidate.decision!=="DRAFT"||Object.keys(value.publicationCandidate).length!==1||
     !id(value.pathwayId)||!id(value.packageId)||!Number.isInteger(value.packageVersion)||Number(value.packageVersion)<1||!text(value.title)||
     !record(value.sourceSeed)||Object.keys(value.sourceSeed).length!==2||value.sourceSeed.minimised!==true||!["CURRICOLO_TARGET","PLAIN_IDEA","DOCENTE_OS_ACTIVITY","EXISTING_PATHWAY","EXISTING_STORY_WORLD","OTHER_GOVERNED_SOURCE"].includes(String(value.sourceSeed.kind))||
     !Array.isArray(value.scenes)||value.scenes.length<2||value.scenes.length>32) return fail();
  const scenes=value.scenes;
  const seen=new Set<string>();let specializedCount=0;
  const mapped=scenes.map((scene,i)=>{
    if(!record(scene)||Object.keys(scene).some(k=>!sceneKeys.has(k))||!id(scene.sceneId)||seen.has(scene.sceneId)||scene.order!==i+1||
       !text(scene.purpose)||!text(scene.learnerVisibleSituation)||!texts(scene.learnerActions)||!texts(scene.consequences)||
       !Array.isArray(scene.nextSceneRefs)||!["SUMMARY","SPECIALIZED"].includes(String(scene.interaction))||
       scene.kind!==(i===scenes.length-1?"TRANSFER":"SCENE"))return fail();
    seen.add(scene.sceneId);
    const next=scenes[i+1];
    if(next?(!record(next)||scene.nextSceneRefs.length!==1||scene.nextSceneRefs[0]!==next.sceneId):scene.nextSceneRefs.length!==0)return fail();
    const special=scene.interaction==="SPECIALIZED";
    if(special){
      specializedCount++;
      if(!next||!record(scene.specialized)||Object.keys(scene.specialized).length!==2||scene.specialized.rendererId!=="energy-lamp"||scene.specialized.version!==1)return fail();
    }else if(scene.specialized!==undefined)return fail();
    return {sceneId:scene.sceneId,kind:scene.kind,interaction:scene.interaction,title:scene.purpose,visibleSituation:scene.learnerVisibleSituation,
      learnerAction:scene.learnerActions.join("\n"),consequence:scene.consequences.join("\n"),nextSceneRefs:[...scene.nextSceneRefs],
      ...(special?{specialized:{rendererId:"energy-lamp",version:1}}:{})};
  });
  if(specializedCount!==1)return fail();
  const bytes=new TextEncoder().encode(JSON.stringify(value));
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),b=>b.toString(16).padStart(2,"0")).join("");
  return {schemaVersion:"studio-atlas.preview-snapshot/v0.2" as const,snapshotId:crypto.randomUUID(),packageDigest:digest,pathwayId:value.pathwayId,version:`0.2.0-review.${value.packageVersion}`,title:value.title,description:"Anteprima sperimentale non autorizzata agli studenti.",runtimeAuthorized:false as const,studentAuthorized:false as const,scenes:mapped};
}
