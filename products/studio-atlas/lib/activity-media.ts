import sharp from "sharp";
import type { IntakeAsset } from "./activity-intake";

export const DISPLAY_MAX_PIXELS=12_000_000; // includes a 4K 3840x2160 image
export const DISPLAY_TOTAL_PIXELS=24_000_000;
export const MASTER_MAX_PIXELS=48_000_000;
export const MASTER_TOTAL_PIXELS=96_000_000;

type Dimensions={pixelWidth:number;pixelHeight:number};
export function assetFormat(asset:IntakeAsset):string {
  return asset.format??(asset.type==="IMAGE"?"image/webp":"text/html");
}
export class MediaBudget {
  private display=0;
  private master=0;
  async inspect(data:Uint8Array,asset:IntakeAsset):Promise<Dimensions|undefined> {
    if(asset.type!=="IMAGE"&&asset.type!=="SOURCE_MASTER") return;
    const original=asset.type==="SOURCE_MASTER";
    const max=original?MASTER_MAX_PIXELS:DISPLAY_MAX_PIXELS;
    const format=assetFormat(asset);
    const expected=format==="image/webp"?"webp":format==="image/png"?"png":format==="image/jpeg"?"jpeg":null;
    if(!expected) throw new Error("Formato immagine non valido");
    let meta;
    try { meta=await sharp(Buffer.from(data),{limitInputPixels:max,failOn:"error",animated:false}).metadata(); }
    catch { throw new Error("Dimensione o formato immagine non valido: "+asset.path); }
    const w=meta.width,h=meta.height;
    if(meta.format!==expected || typeof w!=="number"||typeof h!=="number"||!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<=0||h<=0||
      w>16384||h>16384||w*h>max||(meta.pages??1)!==1) throw new Error("Dimensione o formato immagine non valido: "+asset.path);
    if(original) {
      this.master+=w*h;
      if(this.master>MASTER_TOTAL_PIXELS) throw new Error("Pacchetto troppo grande: budget pixel originali");
    } else {
      this.display+=w*h;
      if(this.display>DISPLAY_TOTAL_PIXELS) throw new Error("Pacchetto troppo grande: budget pixel fruizione");
    }
    return {pixelWidth:w,pixelHeight:h};
  }
}
