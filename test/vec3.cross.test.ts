import { test, expect } from "vitest";
import { Vector3, VecX3 } from "./math";

test.each<VecX3>([
  { v1: [1, 2, 3], v2: [4, 5, 6], result: [-3, 6, -3] },
  { v1: [0.2, -1.1, -0.9], v2: [2.1, 2.2, 1.8], result: [0.0, -2.25, 2.75] },
  { v1: [0, 0, 0], v2: [0, 0, 0], result: [0, 0, 0] },
])("Vector3-Cross: $v1 cross $v2 = $result", ({ v1, v2, result }) => {
  using vec1 = new Vector3(v1);
  using vec2 = new Vector3(v2);
  using resultVec = new Vector3();

  Vector3.cross(vec1, vec2, resultVec);

  const [rx, ry, rz] = resultVec.get();
  expect(rx).closeTo(result[0], 0.0001);
  expect(ry).closeTo(result[1], 0.0001);
  expect(rz).closeTo(result[2], 0.0001);
});

test.each<VecX3>([
  { v1: [1, 2, 3], v2: [4, 5, 6], result: [-3, 6, -3] },
  { v1: [0.2, -1.1, -0.9], v2: [2.1, 2.2, 1.8], result: [0.0, -2.25, 2.75] },
  { v1: [0, 0, 0], v2: [0, 0, 0], result: [0, 0, 0] },
])("Vector3-Cross (TypeScript Version): $v1 cross $v2 = $result", ({ v1, v2, result }) => {
  Vector3.cross_ts(v1, v2, result);

  const [rx, ry, rz] = result;
  expect(rx).closeTo(result[0], 0.0001);
  expect(ry).closeTo(result[1], 0.0001);
  expect(rz).closeTo(result[2], 0.0001);
});

test.each<VecX3>([
  { v1: [1, 2, 3], v2: [4, 5, 6], result: [-3, 6, -3] },
  { v1: [0.2, -1.1, -0.9], v2: [2.1, 2.2, 1.8], result: [0.0, -2.25, 2.75] },
  { v1: [0, 0, 0], v2: [0, 0, 0], result: [0, 0, 0] },
])("Vector3-Cross with result is same as v1 or v2: $v1 cross $v2 = $result", ({ v1, v2, result }) => {
  const statistics1 = Vector3.getStatistics();
  expect(statistics1.freeSlots).toBe(4096);
  expect(statistics1.firstFreePermanentOffset).toBe(0);
  expect(statistics1.firstFreeTemporaryOffset).toBe(4095);

  using vec1 = new Vector3(v1);
  using vec2 = new Vector3(v2);
  using vec3 = new Vector3(v1);
  using vec4 = new Vector3(v2);

  const statistics2 = Vector3.getStatistics();
  expect(statistics2.freeSlots).toBe(4092);
  expect(statistics2.firstFreePermanentOffset).toBe(4);
  expect(statistics2.firstFreeTemporaryOffset).toBe(4095);

  // v1 cross v2 = result, result is same as v1
  const [x1, y1, z1] = vec1.get();
  expect(x1).closeTo(v1[0], 0.0001);
  expect(y1).closeTo(v1[1], 0.0001);
  expect(z1).closeTo(v1[2], 0.0001);

  const [x2, y2, z2] = vec2.get();
  expect(x2).closeTo(v2[0], 0.0001);
  expect(y2).closeTo(v2[1], 0.0001);
  expect(z2).closeTo(v2[2], 0.0001);

  Vector3.cross(vec1, vec2, vec1);

  const [rx1, ry1, rz1] = vec1.get();
  expect(rx1).closeTo(result[0], 0.0001);
  expect(ry1).closeTo(result[1], 0.0001);
  expect(rz1).closeTo(result[2], 0.0001);

  const statistics3 = Vector3.getStatistics();
  expect(statistics3.freeSlots).toBe(4092);
  expect(statistics3.firstFreePermanentOffset).toBe(4);
  expect(statistics3.firstFreeTemporaryOffset).toBe(4095);

  // v1 cross v2 = result, result is same as v2
  const [x3, y3, z3] = vec3.get();
  expect(x3).closeTo(v1[0], 0.0001);
  expect(y3).closeTo(v1[1], 0.0001);
  expect(z3).closeTo(v1[2], 0.0001);

  const [x4, y4, z4] = vec4.get();
  expect(x4).closeTo(v2[0], 0.0001);
  expect(y4).closeTo(v2[1], 0.0001);
  expect(z4).closeTo(v2[2], 0.0001);

  Vector3.cross(vec3, vec4, vec4);

  const [rx4, ry4, rz4] = vec4.get();
  expect(rx4).closeTo(result[0], 0.0001);
  expect(ry4).closeTo(result[1], 0.0001);
  expect(rz4).closeTo(result[2], 0.0001);

  const statistics4 = Vector3.getStatistics();
  expect(statistics4.freeSlots).toBe(4092);
  expect(statistics4.firstFreePermanentOffset).toBe(4);
  expect(statistics4.firstFreeTemporaryOffset).toBe(4095);
});
