import { test, expect } from "vitest";
import type { MatX1VecX2 } from "./math";
import { Matrix4, Vector3 } from "./math";

const TEST_CASES: MatX1VecX2[] = [
  {
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
    v: [
      1, 2, 3,
    ],
    result: [
      1, 2, 3,
    ],
  },
  {
    m: [
      -0.232, 0.123, 0.456, 0.789,
      0.321, 0.654, -0.987, 0.123,
      0.456, -0.789, 0.123, 0.456,
      0.654, 0.987, 0.123, -0.456,
    ],
    v: [
      2.154, -1.096, 4.125,
    ],
    result: [
      2.035464, -3.973725, 2.810343,
    ],
  },
];

test.each(TEST_CASES)("Matrix4.multiplyVector: $m * $v = $result", ({ m, v, result }) => {
  using ma = new Matrix4(m);
  using va = new Vector3(v);
  using vr = new Vector3();

  Matrix4.multiplyVector(ma, va, vr);

  const [vrx, vry, vrz] = vr.get();
  const [rx, ry, rz] = result;

  expect(vrx).closeTo(rx, 0.00001);
  expect(vry).closeTo(ry, 0.00001);
  expect(vrz).closeTo(rz, 0.00001);
});

test.each(TEST_CASES)("Matrix4.multiplyVector_ts: $m * $v = $result", ({ m, v, result }) => {
  using ma = new Matrix4(m);
  using va = new Vector3(v);
  using vr = new Vector3();

  Matrix4.multiplyVector_ts(ma, va, vr);

  const [vrx, vry, vrz] = vr.get();
  const [rx, ry, rz] = result;

  expect(vrx).closeTo(rx, 0.00001);
  expect(vry).closeTo(ry, 0.00001);
  expect(vrz).closeTo(rz, 0.00001);
});

// test("Matrix4.multiplyVector Performance Test", () => {
//   using m = new Matrix4([
//     -0.232, 0.123, 0.456, 0.789,
//     0.321, 0.654, -0.987, 0.123,
//     0.456, -0.789, 0.123, 0.456,
//     0.654, 0.987, 0.123, -0.456,
//   ]);
//   using v = new Vector3([
//     2.154, -1.096, 4.125,
//   ]);
//   using r = new Vector3();

//   const t0 = performance.now();
//   for (let i = 0; i < 10_000_000; ++i) {
//     Matrix4.multiplyVector(m, v, r);
//   }
//   const t1 = performance.now();
//   for (let i = 0; i < 10_000_000; ++i) {
//     Matrix4.multiplyVector_ts(m, v, r);
//   }
//   const t2 = performance.now();

//   console.log(`WASM Time: ${(t1 - t0).toFixed(3)}ms`);
//   console.log(`TS Time: ${(t2 - t1).toFixed(3)}ms`);
//   console.log(`Speedup: ${((t2 - t1) / (t1 - t0)).toFixed(2)}`);

//   expect(t1 - t0).lessThanOrEqual(t2 - t1);
// });
