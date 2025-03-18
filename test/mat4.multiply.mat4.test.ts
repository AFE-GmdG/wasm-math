import { test, expect } from "vitest";
import {
  Matrix4,
  MatX3,
} from "./math";

const TEST_CASES: MatX3[] = [
  {
    a: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
    b: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
    result: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    a: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
    b: [
      1, 2, 3, 4,
      5, 6, 7, 8,
      -8, -7, -6, -5,
      -4, -3, -2, -1,
    ],
    result: [
      1, 2, 3, 4,
      5, 6, 7, 8,
      -8, -7, -6, -5,
      -4, -3, -2, -1,
    ],
  },
  {
    a: [
      1, 2, 3, 4,
      5, 6, 7, 8,
      -8, -7, -6, -5,
      -4, -3, -2, -1,
    ],
    b: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
    result: [
      1, 2, 3, 4,
      5, 6, 7, 8,
      -8, -7, -6, -5,
      -4, -3, -2, -1,
    ],
  },
  {
    a: [
      -0.232, 0.123, 0.456, 0.789,
      0.321, 0.654, -0.987, 0.123,
      0.456, -0.789, 0.123, 0.456,
      0.654, 0.987, 0.123, -0.456,
    ],
    b: [
      0.123, 0.456, 0.789, -0.232,
      0.654, -0.987, 0.123, 0.321,
      -0.789, 0.123, 0.456, 0.654,
      0.987, 0.123, -0.456, 0.987,
    ],
    result: [
      0.4708650, -0.0740580, -0.3197670, 1.1702739,
      1.3673429, -0.6053939, -0.1724490, -0.3886350,
      -0.1068930, 1.0578960, 0.1108890, 0.1714530,
      0.1788210, -0.7169040, 0.9014310, -0.2045310,
    ],
  },
];

test.each(TEST_CASES)("Matrix4.multiply: $a * $b = $result", ({ a, b, result }) => {
  using ma = new Matrix4(a);
  using mb = new Matrix4(b);
  using mr = new Matrix4();

  Matrix4.multiply(ma, mb, mr);

  const [
    mr00, mr01, mr02, mr03,
    mr10, mr11, mr12, mr13,
    mr20, mr21, mr22, mr23,
    mr30, mr31, mr32, mr33,
  ] = mr.get();

  const [
    r00, r01, r02, r03,
    r10, r11, r12, r13,
    r20, r21, r22, r23,
    r30, r31, r32, r33,
  ] = result;

  expect(mr00).closeTo(r00, 0.00001); expect(mr01).closeTo(r01, 0.00001); expect(mr02).closeTo(r02, 0.00001); expect(mr03).closeTo(r03, 0.00001);
  expect(mr10).closeTo(r10, 0.00001); expect(mr11).closeTo(r11, 0.00001); expect(mr12).closeTo(r12, 0.00001); expect(mr13).closeTo(r13, 0.00001);
  expect(mr20).closeTo(r20, 0.00001); expect(mr21).closeTo(r21, 0.00001); expect(mr22).closeTo(r22, 0.00001); expect(mr23).closeTo(r23, 0.00001);
  expect(mr30).closeTo(r30, 0.00001); expect(mr31).closeTo(r31, 0.00001); expect(mr32).closeTo(r32, 0.00001); expect(mr33).closeTo(r33, 0.00001);
});

test.each(TEST_CASES)("Matrix4.multiply_ts: $a * $b = $result", ({ a, b, result }) => {
  using ma = new Matrix4(a);
  using mb = new Matrix4(b);
  using mr = new Matrix4();

  Matrix4.multiply_ts(ma, mb, mr);

  mr.print("Result", 7)

  const [
    mr00, mr01, mr02, mr03,
    mr10, mr11, mr12, mr13,
    mr20, mr21, mr22, mr23,
    mr30, mr31, mr32, mr33,
  ] = mr.get();

  const [
    r00, r01, r02, r03,
    r10, r11, r12, r13,
    r20, r21, r22, r23,
    r30, r31, r32, r33,
  ] = result;

  expect(mr00).closeTo(r00, 0.00001); expect(mr01).closeTo(r01, 0.00001); expect(mr02).closeTo(r02, 0.00001); expect(mr03).closeTo(r03, 0.00001);
  expect(mr10).closeTo(r10, 0.00001); expect(mr11).closeTo(r11, 0.00001); expect(mr12).closeTo(r12, 0.00001); expect(mr13).closeTo(r13, 0.00001);
  expect(mr20).closeTo(r20, 0.00001); expect(mr21).closeTo(r21, 0.00001); expect(mr22).closeTo(r22, 0.00001); expect(mr23).closeTo(r23, 0.00001);
  expect(mr30).closeTo(r30, 0.00001); expect(mr31).closeTo(r31, 0.00001); expect(mr32).closeTo(r32, 0.00001); expect(mr33).closeTo(r33, 0.00001);
});
