import { test, expect } from "vitest";
import { Vector3, VecX3 } from "./math.js";

test.each<VecX3>([
  { v1: [1, 2, 3], v2: [4, 5, 6], result: [-3, -3, -3] },
  { v1: [0.2, -1.1, -0.9], v2: [2.1, 2.2, 1.8], result: [-1.9, -3.3, -2.7] },
  { v1: [0, 0, 0], v2: [0, 0, 0], result: [0, 0, 0] },
])("Vector3-Subtraction: $v1 - $v2 = $result", ({ v1, v2, result }) => {
  using vec1 = new Vector3(v1);
  using vec2 = new Vector3(v2);
  using resultVec = new Vector3(true);

  Vector3.sub(vec1, vec2, resultVec);

  const [rx, ry, rz] = resultVec.get();
  expect(rx).closeTo(result[0], 0.0001);
  expect(ry).closeTo(result[1], 0.0001);
  expect(rz).closeTo(result[2], 0.0001);
});

test.each<VecX3>([
  { v1: [1, 2, 3], v2: [4, 5, 6], result: [-3, -3, -3] },
  { v1: [0.2, -1.1, -0.9], v2: [2.1, 2.2, 1.8], result: [-1.9, -3.3, -2.7] },
  { v1: [0, 0, 0], v2: [0, 0, 0], result: [0, 0, 0] },
])("Vector3-Subtraction (TypeScript Version): $v1 - $v2 = $result", ({ v1, v2, result }) => {
  Vector3.sub_ts(v1, v2, result);

  const [rx, ry, rz] = result;
  expect(rx).closeTo(result[0], 0.0001);
  expect(ry).closeTo(result[1], 0.0001);
  expect(rz).closeTo(result[2], 0.0001);
});
