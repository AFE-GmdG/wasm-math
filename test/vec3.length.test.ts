import { test, expect } from "vitest";
import { Vector3, VecX1RNumber } from "./math";

test.each<VecX1RNumber>([
  { v: [1, 2, 3], result: 3.7417 },
  { v: [0.2, -1.1, -0.9], result: 1.43527 },
  { v: [0, 0, 0], result: 0 },
])("Vector3-Length: |$v| = $result", ({ v, result }) => {
  using vec = new Vector3(v);

  const length = vec.length();

  expect(length).closeTo(result, 0.0001);
});

test.each<VecX1RNumber>([
  { v: [1, 2, 3], result: 3.7417 },
  { v: [0.2, -1.1, -0.9], result: 1.43527 },
  { v: [0, 0, 0], result: 0 },
])("Vector3-Length (TypeScript Version): |$v| = $result", ({ v, result }) => {
  const length = Vector3.length_ts(v);

  expect(length).closeTo(result, 0.0001);
});

test.each<VecX1RNumber>([
  { v: [1, 2, 3], result: 14 },
  { v: [0.2, -1.1, -0.9], result: 2.06 },
  { v: [0, 0, 0], result: 0 },
])("Vector3-Squared Length: |$v|² = $result", ({ v, result }) => {
  using vec = new Vector3(v);

  const lengthSquared = vec.lengthSquared();

  expect(lengthSquared).closeTo(result, 0.0001);
});

test.each<VecX1RNumber>([
  { v: [1, 2, 3], result: 14 },
  { v: [0.2, -1.1, -0.9], result: 2.06 },
  { v: [0, 0, 0], result: 0 },
])("Vector3-Squared Length (TypeScript Version): |$v|² = $result", ({ v, result }) => {
  const lengthSquared = Vector3.lengthSquared_ts (v);

  expect(lengthSquared).closeTo(result, 0.0001);
});
