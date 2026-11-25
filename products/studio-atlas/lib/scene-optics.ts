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
