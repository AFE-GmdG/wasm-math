import { test, expect } from "vitest";
import { Vector3, VecX3 } from "./math";

test.each<VecX3>([
  { v1: [1, 2, 3], v2: [4, 5, 6], result: [5, 7, 9] },
  { v1: [0.2, -1.1, -0.9], v2: [2.1, 2.2, 1.8], result: [2.3, 1.1, 0.9] },
  { v1: [0, 0, 0], v2: [0, 0, 0], result: [0, 0, 0] },
])("Vector3-Addition: $v1 + $v2 = $result", ({ v1, v2, result }) => {
  using vec1 = new Vector3(v1);
  using vec2 = new Vector3(v2);
  using resultVec = new Vector3(true);

  Vector3.add(vec1, vec2, resultVec);

  const [rx, ry, rz] = resultVec.get();
  expect(rx).closeTo(result[0], 0.0001);
  expect(ry).closeTo(result[1], 0.0001);
  expect(rz).closeTo(result[2], 0.0001);
});

test.each<VecX3>([
  { v1: [1, 2, 3], v2: [4, 5, 6], result: [5, 7, 9] },
  { v1: [0.2, -1.1, -0.9], v2: [2.1, 2.2, 1.8], result: [2.3, 1.1, 0.9] },
  { v1: [0, 0, 0], v2: [0, 0, 0], result: [0, 0, 0] },
])("Vector3-Addition (TypeScript Version): $v1 + $v2 = $result", ({ v1, v2, result }) => {
  Vector3.add_ts(v1, v2, result);

  const [rx, ry, rz] = result;
  expect(rx).closeTo(result[0], 0.0001);
  expect(ry).closeTo(result[1], 0.0001);
  expect(rz).closeTo(result[2], 0.0001);
});
