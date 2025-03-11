import { test, expect } from "vitest";
import { Vector3, VecX2 } from "./math.js";

test.each<VecX2>([
  { v: [0, 0, 0], result: [0, 0, 0] },
  { v: [1, 0, 0], result: [1, 0, 0] },
  { v: [0, 1, 0], result: [0, 1, 0] },
  { v: [0, 0, 1], result: [0, 0, 1] },
  { v: [-1, 0, 0], result: [-1, 0, 0] },
  { v: [0, -1, 0], result: [0, -1, 0] },
  { v: [0, 0, -1], result: [0, 0, -1] },
  { v: [1, 1, 1], result: [0.57735, 0.57735, 0.57735] },
  { v: [1, 2, 3], result: [0.26726, 0.53452, 0.80178] },
  { v: [0.2, -1.1, -0.9], result: [0.13935, -0.76641, -0.6271] },
])(`Vector3-Normalization: normalize($v) = $result`, ({ v, result }) => {
  using vec = new Vector3(v);
  using resultVec = new Vector3(true);

  Vector3.normalize(vec, resultVec);

  const [rx, ry, rz] = resultVec.get();
  expect(rx).closeTo(result[0], 0.0001);
  expect(ry).closeTo(result[1], 0.0001);
  expect(rz).closeTo(result[2], 0.0001);
});

test.each<VecX2>([
  { v: [0, 0, 0], result: [0, 0, 0] },
  { v: [1, 0, 0], result: [1, 0, 0] },
  { v: [0, 1, 0], result: [0, 1, 0] },
  { v: [0, 0, 1], result: [0, 0, 1] },
  { v: [-1, 0, 0], result: [-1, 0, 0] },
  { v: [0, -1, 0], result: [0, -1, 0] },
  { v: [0, 0, -1], result: [0, 0, -1] },
  { v: [1, 1, 1], result: [0.57735, 0.57735, 0.57735] },
  { v: [1, 2, 3], result: [0.26726, 0.53452, 0.80178] },
  { v: [0.2, -1.1, -0.9], result: [0.13935, -0.76641, -0.6271] },
])(`Vector3-Normalization: (TypeScript Version) normalize($v) = $result`, ({ v, result }) => {
  Vector3.normalize_ts(v, result);

  const [rx, ry, rz] = result;
  expect(rx).closeTo(result[0], 0.0001);
  expect(ry).closeTo(result[1], 0.0001);
  expect(rz).closeTo(result[2], 0.0001);
});
