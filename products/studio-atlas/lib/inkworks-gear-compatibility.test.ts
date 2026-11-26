/**
 * VF-SIMULATION-01 P1: isolated compatibility probe, NOT production runtime.
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
import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";

function gearGeometry(r: number, teeth: number, depth: number, hole = 0.18, toothH = 0.05) {
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

const near = (a: number, b: number) => Math.abs(a - b) < 1e-5;

test("VF-SIMULATION-01 retains the existing Three.js r128 runtime", () => {
  assert.equal(THREE.REVISION, "128");
});

for (const teeth of [12, 24, 36, 48]) {
  test(`VF-SIMULATION-01 Inkworks gearGeometry r128: ${teeth} teeth`, () => {
    const radius = teeth / 24;
    const depth = 0.2;
    const hole = 0.18;
    const toothH = 0.05;
    const g = gearGeometry(radius, teeth, depth, hole, toothH);
    try {
      assert.ok(g.isBufferGeometry);
      g.computeBoundingBox();
      const box = g.boundingBox;
      assert.ok(box);
      assert.ok(near(box.min.x, -depth / 2));
      assert.ok(near(box.max.x, depth / 2));
      const p = g.getAttribute("position");
      const n = g.getAttribute("normal");
      assert.ok(p.count > 0 && p.count % 3 === 0);
      assert.equal(p.count, n.count);
      assert.ok(Array.from(p.array).every(Number.isFinite));
      assert.ok(Array.from(n.array).every(Number.isFinite));
      const outerAngles = new Set<number>();
      let hasRoot = false;
      let hasHole = false;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i), z = p.getZ(i);
        const radial = Math.hypot(y, z);
        assert.ok(radial <= radius + 1e-5);
        if (near(radial, radius)) {
          const angle = (Math.atan2(y, -z) + 2 * Math.PI) % (2 * Math.PI);
          outerAngles.add(Math.round(angle / (2 * Math.PI) * teeth * 4) % (teeth * 4));
        }
        hasRoot ||= near(radial, radius - toothH);
        hasHole ||= near(radial, hole);
      }
      assert.equal(outerAngles.size, teeth * 2);
      assert.ok(hasRoot);
      assert.ok(hasHole);
    } finally {
      g.dispose();
    }
  });
}
