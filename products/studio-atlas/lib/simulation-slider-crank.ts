// VF-SIMULATION-01 P3a: ideal inline slider-crank. No physical construction,
// forces, friction or motor control; only a geometric teaching model.
export const CRANK_RADII=[20,30,40] as const;
export const ROD_LENGTHS=[100,140] as const;
export function sliderCrank(radius:number,rod:number,angle:number){
  if(!CRANK_RADII.some(r=>r===radius)||!ROD_LENGTHS.some(l=>l===rod)||!Number.isFinite(angle))
    throw Error("Invalid slider-crank parameters");
  const theta=((angle%360+360)%360)*Math.PI/180;
  const pinX=radius*Math.cos(theta),pinY=radius*Math.sin(theta);
  const sliderX=pinX+Math.sqrt(rod*rod-pinY*pinY);
  return {radius,rod,angle:((angle%360+360)%360),pinX,pinY,sliderX,
    stroke:2*radius,displacement:rod+radius-sliderX};
}
