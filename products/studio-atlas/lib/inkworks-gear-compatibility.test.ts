import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";

import { gearGeometry, transmission } from "./inkworks-gear";

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

test("VF-SIMULATION-01 external gear kinematics: ratio, direction, angle, stop", () => {
  for (const [a,b] of [[12,24],[24,12],[24,24],[36,48]]) {
    const s=transmission(a,b,360,60);
    assert.equal(s.outputAngle,-360*a/b);
    assert.equal(s.outputRpm,-60*a/b);
    assert.equal(s.direction,"opposite");
  }
  assert.equal(transmission(12,24,0,0).outputRpm,0*-1);
  assert.throws(()=>transmission(0,24,0,60));
  assert.throws(()=>transmission(12,24,Infinity,60));
  assert.throws(()=>transmission(12,24,0,-1));
});
