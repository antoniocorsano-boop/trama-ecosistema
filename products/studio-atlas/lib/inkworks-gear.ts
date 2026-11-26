/**
 * VF-SIMULATION-01 P1: isolated teaching pilot; not authorized for student publication.
 * Source: https://github.com/Moh4696/inkworks-skill/blob/8769b7d4191088a94448294d7bd28ae84d34906c/skills/inkworks/kit/js/kit.js
 * Original blob: 67e6086991b325a6ee87772b01046d87cad77f0a. Extracted gearGeometry only;
 * parameter types added for the Studio Atlas TypeScript test environment.
 * The profile is illustrative, not an involute manufacturing model.
 *
 * MIT License
 * 
 * Copyright (c) 2026 exploraX
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import * as THREE from "three";

export function gearGeometry(r: number, teeth: number, depth: number, hole = 0.18, toothH = 0.05) {
    const s = new THREE.Shape();
    for (let k = 0; k <= teeth * 4; k++) {
      const a = (k / (teeth * 4)) * Math.PI * 2;
      const rr = (k % 4 < 2) ? r : r - toothH;
      k === 0 ? s.moveTo(rr * Math.cos(a), rr * Math.sin(a)) : s.lineTo(rr * Math.cos(a), rr * Math.sin(a));
    }
    if (hole) { const h = new THREE.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(h); }
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 16 });
    g.rotateY(Math.PI / 2);
    g.translate(-depth / 2, 0, 0);
    return g;
  }

export const TEETH = [12, 24, 36, 48] as const;
export function transmission(driver:number, driven:number, angle:number, rpm:number) {
  if (!TEETH.some(n=>n===driver)||!TEETH.some(n=>n===driven)||
      !Number.isFinite(angle)||!Number.isFinite(rpm)||rpm<0||rpm>120)
    throw Error("Invalid teaching parameters");
  const speedRatio=driver/driven;
  return {speedRatio, inputAngle:angle, outputAngle:-angle*speedRatio,
    inputRpm:rpm, outputRpm:-rpm*speedRatio, direction:"opposite" as const};
}
