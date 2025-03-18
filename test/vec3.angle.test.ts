import { test, expect } from "vitest";
import { Vector3, VecX2RNumber } from "./math";

const HALF_PI = Math.PI / 2;
const PI = Math.PI;

const TEST_CASES: VecX2RNumber[] = [
  { v1: [0, 0, 0], v2: [0, 0, 0], result: 0 },
  { v1: [1, 0, 0], v2: [1, 0, 0], result: 0 },
  { v1: [0, 1, 0], v2: [0, 1, 0], result: 0 },
  { v1: [0, 0, 1], v2: [0, 0, 1], result: 0 },
  { v1: [0, 0, 1], v2: [1, 0, 0], result: HALF_PI },
  { v1: [0, 0, 1], v2: [0, 1, 0], result: HALF_PI },
  { v1: [0, 0, 1], v2: [0, 0, -1], result: PI },
  { v1: [0.480192, -0.620248, 0.620248], v2: [-0.8124, 0.441304, -0.381126], result: 2.69107 },
  { v1: [-0.8124, 0.441304, -0.381126], v2: [0.190439, 0.882031, 0.430992], result: 1.50047 },
  { v1: [0.190439, 0.882031, 0.430992], v2: [0.738635, -0.309428, -0.598893], result: 1.97184 },
  { v1: [0.738635, -0.309428, -0.598893], v2: [-0.291373, -0.562651, 0.773645], result: 2.09954 },
  { v1: [-0.291373, -0.562651, 0.773645], v2: [0.738635, -0.309428, -0.598893], result: 2.09954 },
  { v1: [-0.8124, 0.441304, -0.381126], v2: [-0.8124, 0.441304, -0.381126], result: 0 },
];

test.each(TEST_CASES)("Vector3.angle: Angle between $v1 and $v2 = $result", ({ v1, v2, result }) => {
  using vec1 = new Vector3(v1);
  using vec2 = new Vector3(v2);

  const angle = Vector3.angle(vec1, vec2);
  expect(angle).closeTo(result, 0.00001);
});

test.each(TEST_CASES)("Vector3.angle_ts: Angle between $v1 and $v2 = $result", ({ v1, v2, result }) => {
  const angle_ts = Vector3.angle_ts(v1, v2);
  expect(angle_ts).closeTo(result, 0.00001);
});

test.each(TEST_CASES)("WASM and TS implementations match for $v1 and $v2", ({ v1, v2 }) => {
  using vec1 = new Vector3(v1);
  using vec2 = new Vector3(v2);

  const angle = Vector3.angle(vec1, vec2);
  const angle_ts = Vector3.angle_ts(v1, v2);

  expect(angle).closeTo(angle_ts, 0.00001);
});
