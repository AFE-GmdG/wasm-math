import { test, expect } from "vitest";
import { Vector3, VecX1NumberVec, VecX3 } from "./math";

test.each<VecX1NumberVec>([
  { v: [1, 2, 3], n: 2, result: [2, 4, 6] },
  { v: [0.2, -1.1, -0.9], n: 3, result: [0.6, -3.3, -2.7] },
  { v: [0, 0, 0], n: 0, result: [0, 0, 0] },
  { v: [0, 0, 0], n: 3.2, result: [0, 0, 0] },
  { v: [0.2, -1.1, -0.9], n: 0, result: [0, 0, 0] },
])("Vector3-Scale-Scalar: $v * $n = $result", ({ v, n, result }) => {
  using vec1 = new Vector3(v);
  using resultVec = new Vector3();

  Vector3.scale(vec1, n, resultVec);
  const resultVec_ts = Vector3.scale_ts(v, n);

  const [rx, ry, rz] = resultVec.get();
  expect(rx).closeTo(result[0], 0.0001);
  expect(ry).closeTo(result[1], 0.0001);
  expect(rz).closeTo(result[2], 0.0001);

  const [rx_ts, ry_ts, rz_ts] = resultVec_ts;
  expect(rx_ts).closeTo(result[0], 0.0001);
  expect(ry_ts).closeTo(result[1], 0.0001);
  expect(rz_ts).closeTo(result[2], 0.0001);
});

test.each<VecX3>([
  { v1: [1, 2, 3], v2: [0.2, -1.1, -0.9], result: [0.2, -2.2, -2.7] },
  { v1: [0, 0, 0], v2: [0, 0, 0], result: [0, 0, 0] },
  { v1: [0.2, -1.1, -0.9], v2: [0, 0, 0], result: [0, 0, 0] },
  { v1: [0, 0, 0], v2: [0.2, -1.1, -0.9], result: [0, 0, 0] },
])("Vector3-Scale-Vector3: $v1 * $v2 = $result", ({ v1, v2, result }) => {
  using vec1 = new Vector3(v1);
  using vec2 = new Vector3(v2);
  using resultVec = new Vector3();

  Vector3.scale(vec1, vec2, resultVec);
  const resultVec_ts = Vector3.scale_ts(v1, v2);

  const [rx, ry, rz] = resultVec.get();
  expect(rx).closeTo(result[0], 0.0001);
  expect(ry).closeTo(result[1], 0.0001);
  expect(rz).closeTo(result[2], 0.0001);

  const [rx_ts, ry_ts, rz_ts] = resultVec_ts;
  expect(rx_ts).closeTo(result[0], 0.0001);
  expect(ry_ts).closeTo(result[1], 0.0001);
  expect(rz_ts).closeTo(result[2], 0.0001);
});
