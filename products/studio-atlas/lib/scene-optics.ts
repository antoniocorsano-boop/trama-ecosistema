// VF-MOTION-05B1: source-locked transfer of the qualified Atlas procedural environment.
// Atlas (repository sorgente, PR #152) a2c89a8a8d5abaaebfe7f54d235b2a5f2384bc3c, optical-profile.mjs blob 7fb4435b4dc74ebec0406fdfa04a16920289c007.
// Only the floor receives the environment; Sala Zero has no oculus. No new geometry or network.
export function makeEnvironment(width=256,height=128): Uint8Array<ArrayBuffer>{
  if(width!==256||height!==128)throw Error("Optical texture budget exceeded");
  const data=new Uint8Array(new ArrayBuffer(width*height*4));
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const u=(x+.5)/width,v=(y+.5)/height;
    const zenith=Math.exp(-((v-.18)**2)/.026);
    const d=Math.min(Math.abs(u-.27),1-Math.abs(u-.27));
    const warm=Math.exp(-(d*d)/.008-((v-.30)**2)/.025);
    const horizon=Math.exp(-((v-.52)**2)/.014);
    const i=(y*width+x)*4;
    data[i]=Math.min(255,Math.round(17+64*zenith+151*warm+18*horizon));
    data[i+1]=Math.min(255,Math.round(22+91*zenith+111*warm+24*horizon));
    data[i+2]=Math.min(255,Math.round(32+128*zenith+64*warm+33*horizon));
    data[i+3]=255;
  }
  return data;
}

export const OPTICAL_ENV_INTENSITY = Object.freeze({original:0,stone:.48,bronze:.82,obsidian:.55,frame:.52});

// ART-R1: small deterministic color/height maps, authoring-only. No external assets.
export type SurfaceRole = Exclude<keyof typeof OPTICAL_ENV_INTENSITY,"original">;
export const SURFACE_MAP_SIZE=256;
export const SURFACE_RELIEF=Object.freeze({stone:.045,bronze:.008,obsidian:.012,frame:.006});
const PALETTES: Record<SurfaceRole,readonly [number,number,number]> = {
 stone:[164,153,134],bronze:[164,105,58],obsidian:[42,46,52],frame:[142,147,153],
};
function noise(x:number,y:number):number {
 let h=Math.imul(x+1,374761393)^Math.imul(y+1,668265263);
 h=Math.imul(h^(h>>>13),1274126177);
 return ((h^(h>>>16))>>>0)/4294967295;
}
function byte(n:number){return Math.round(Math.min(255,Math.max(0,n)));}
export function makeSurfaceMaps(role:SurfaceRole):{color:Uint8Array<ArrayBuffer>;height:Uint8Array<ArrayBuffer>} {
 if(!Object.hasOwn(PALETTES,role))throw Error("Invalid alternative surface");
 const size=SURFACE_MAP_SIZE, color=new Uint8Array(new ArrayBuffer(size*size*4)),height=new Uint8Array(new ArrayBuffer(size*size*4));
 const base=PALETTES[role];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,n=noise(x,y)-.5;
  const cloud=Math.sin(2*Math.PI*(3*u+v))*Math.cos(2*Math.PI*(2*v-u));
  let shade=0,relief=128;
  if(role==="stone"){
   const row=Math.floor(v*5),tileU=u*5+(row%2)*.5;
   const grout=Math.min(tileU%1,1-tileU%1,(v*5)%1,1-(v*5)%1)<.026;
   shade=grout?-52:cloud*10+n*18+(noise(Math.floor(tileU),row)-.5)*18;
   relief=grout?76:144+n*20;
  }else if(role==="bronze"){
   const brush=Math.sin(2*Math.PI*(55*v+.12*Math.sin(2*Math.PI*u)));
   shade=brush*5+cloud*6+n*5;relief=128+brush*9+n*3;
  }else if(role==="obsidian"){
   const vein=Math.pow(Math.max(0,Math.sin(2*Math.PI*(2*u+3*v+.15*Math.sin(2*Math.PI*3*v)))),28);
   shade=vein*22+cloud*5+n*4;relief=128+n*3;
  }else{
   const satin=Math.sin(2*Math.PI*(38*u+.06*Math.sin(2*Math.PI*v)));
   shade=satin*4+cloud*4+n*5;relief=128+satin*5+n*2;
  }
  const i=(y*size+x)*4;
  for(let k=0;k<3;k++){color[i+k]=byte(base[k]+shade);height[i+k]=byte(relief);}
  color[i+3]=height[i+3]=255;
 }
 return {color,height};
}
