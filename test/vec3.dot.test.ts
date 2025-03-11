import { test, expect } from "vitest";
import { Vector3, VecX2RNumber } from "./math";

test.each<VecX2RNumber>([
  { v1: [1, 2, 3], v2: [4, 5, 6], result: 32 },
  { v1: [0.2, -1.1, -0.9], v2: [2.1, 2.2, 1.8], result: -3.62 },
  { v1: [0, 0, 0], v2: [0, 0, 0], result: 0 },
])("Vector3-Skalar Product: $v1 dot $v2 = $result", ({ v1, v2, result }) => {
  using vec1 = new Vector3(v1);
  using vec2 = new Vector3(v2);

  const dot = Vector3.dot(vec1, vec2);

expect(dot).closeTo(result, 0.0001);
});

test.each<VecX2RNumber>([
  { v1: [1, 2, 3], v2: [4, 5, 6], result: 32 },
  { v1: [0.2, -1.1, -0.9], v2: [2.1, 2.2, 1.8], result: -3.62 },
  { v1: [0, 0, 0], v2: [0, 0, 0], result: 0 },
])("Vector3-Skalar Product: $v1 dot $v2 = $result", ({ v1, v2, result }) => {
  using vec1 = new Vector3(v1);
  using vec2 = new Vector3(v2);

  const dot = Vector3.dot(vec1, vec2);

  expect(dot).closeTo(result, 0.0001);
});
