import { test, expect } from "vitest";

import type { Matrix4Data } from "./math";
import {
  Matrix4,
  MatX1,
} from "./math";

const TEST_CASES: MatX1[] = [
  {
    m: [
      -0.232, 0.123, 0.456, 0.789,
      0.321, 0.654, -0.987, 0.123,
      0.456, -0.789, 0.123, 0.456,
      0.654, 0.987, 0.123, -0.456,
    ],
  },
  {
    m: [
      0.123, 0.456, 0.789, -0.232,
      0.654, -0.987, 0.123, 0.321,
      -0.789, 0.123, 0.456, 0.654,
      0.987, 0.123, -0.456, 0.987,
    ],
  },
  {
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
];

test.each(TEST_CASES)("Matrix4.createInverse mat={$m}", ({ m }) => {
  using ma = new Matrix4(m);
  using inv = new Matrix4(); // target for inverse
  using res = new Matrix4(); // target for multiplication result
  using id = new Matrix4(); // identity matrix

  // Calculate the inverse
  Matrix4.createInverse(ma, inv);

  ma.print("Original", 5);
  inv.print("Inverse", 5);

  // Multiply the original and the inverse
  Matrix4.multiply(ma, inv, res);

  res.print("Original * Inverse", 5);

  // Check, if the result is close to the identity matrix
  const [
    r00, r01, r02, r03,
    r10, r11, r12, r13,
    r20, r21, r22, r23,
    r30, r31, r32, r33,
  ] = res.get();
  const [
    i00, i01, i02, i03,
    i10, i11, i12, i13,
    i20, i21, i22, i23,
    i30, i31, i32, i33,
  ] = id.get();

  expect(r00).closeTo(i00, 0.00001); expect(r01).closeTo(i01, 0.00001); expect(r02).closeTo(i02, 0.00001); expect(r03).closeTo(i03, 0.00001);
  expect(r10).closeTo(i10, 0.00001); expect(r11).closeTo(i11, 0.00001); expect(r12).closeTo(i12, 0.00001); expect(r13).closeTo(i13, 0.00001);
  expect(r20).closeTo(i20, 0.00001); expect(r21).closeTo(i21, 0.00001); expect(r22).closeTo(i22, 0.00001); expect(r23).closeTo(i23, 0.00001);
  expect(r30).closeTo(i30, 0.00001); expect(r31).closeTo(i31, 0.00001); expect(r32).closeTo(i32, 0.00001); expect(r33).closeTo(i33, 0.00001);
});

test.each(TEST_CASES)("Matrix4.createInverse_ts mat={$m}", ({ m }) => {
  using ma = new Matrix4(m);
  using inv = new Matrix4(); // target for inverse
  using res = new Matrix4(); // target for multiplication result
  using id = new Matrix4(); // identity matrix

  // Calculate the inverse
  Matrix4.createInverse_ts(ma, inv);

  ma.print("Original", 5);
  inv.print("Inverse", 5);

  // Multiply the original and the inverse
  Matrix4.multiply(ma, inv, res);

  res.print("Original * Inverse", 5);

  // Check, if the result is close to the identity matrix
  const [
    r00, r01, r02, r03,
    r10, r11, r12, r13,
    r20, r21, r22, r23,
    r30, r31, r32, r33,
  ] = res.get();
  const [
    i00, i01, i02, i03,
    i10, i11, i12, i13,
    i20, i21, i22, i23,
    i30, i31, i32, i33,
  ] = id.get();

  expect(r00).closeTo(i00, 0.00001); expect(r01).closeTo(i01, 0.00001); expect(r02).closeTo(i02, 0.00001); expect(r03).closeTo(i03, 0.00001);
  expect(r10).closeTo(i10, 0.00001); expect(r11).closeTo(i11, 0.00001); expect(r12).closeTo(i12, 0.00001); expect(r13).closeTo(i13, 0.00001);
  expect(r20).closeTo(i20, 0.00001); expect(r21).closeTo(i21, 0.00001); expect(r22).closeTo(i22, 0.00001); expect(r23).closeTo(i23, 0.00001);
  expect(r30).closeTo(i30, 0.00001); expect(r31).closeTo(i31, 0.00001); expect(r32).closeTo(i32, 0.00001); expect(r33).closeTo(i33, 0.00001);
});

test("Matrix4.createInversee Performance Test", () => {
  const a: Matrix4Data = [
    -0.232, 0.123, 0.456, 0.789,
    0.321, 0.654, -0.987, 0.123,
    0.456, -0.789, 0.123, 0.456,
    0.654, 0.987, 0.123, -0.456,
  ];
  const b: Matrix4Data = [
    0.123, 0.456, 0.789, -0.232,
    0.654, -0.987, 0.123, 0.321,
    -0.789, 0.123, 0.456, 0.654,
    0.987, 0.123, -0.456, 0.987,
  ];

  using ma = new Matrix4(a);
  using mb = new Matrix4(b);
  using mr = new Matrix4();

  const t0 = performance.now();
  for (let i = 0; i < 50_000_000; ++i) {
    Matrix4.createInverse(ma, mr);
    Matrix4.createInverse(mb, mr);
  }
  const t1 = performance.now();
  for (let i = 0; i < 50_000_000; ++i) {
    Matrix4.createInverse_ts(ma, mr);
    Matrix4.createInverse_ts(mb, mr);
  }
  const t2 = performance.now();

  console.log(`WASM Time: ${(t1 - t0).toFixed(3)}ms`);
  console.log(`TS Time: ${(t2 - t1).toFixed(3)}ms`);
  console.log(`Speedup: ${((t2 - t1) / (t1 - t0)).toFixed(2)}`);

  expect(t1 - t0).lessThanOrEqual(t2 - t1);
});
