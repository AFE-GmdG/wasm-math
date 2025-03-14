import { test, expect } from "vitest";
import {
  Matrix4,
  NumberMatX1,
  Quaternion,
  QuatX1MatX1,
} from "./math";

test.each<NumberMatX1>([
  {
    n: 0,
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI / 2,
    m: [
      1, 0, 0, 0,
      0, 0, 1, 0,
      0, -1, 0, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI,
    m: [
      1, 0, 0, 0,
      0, -1, 0, 0,
      0, 0, -1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI * 1.5,
    m: [
      1, 0, 0, 0,
      0, 0, -1, 0,
      0, 1, 0, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI * 2,
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: -Math.PI / 2,
    m: [
      1, 0, 0, 0,
      0, 0, -1, 0,
      0, 1, 0, 0,
      0, 0, 0, 1,
    ],
  },
])("createRotationX Angle: $n, Expected Result: $m", ({ n, m }) => {
  using result = new Matrix4(true);
  Matrix4.createRotationX(n, result);

  const [
    r00, r01, r02, r03,
    r10, r11, r12, r13,
    r20, r21, r22, r23,
    r30, r31, r32, r33,
  ] = result.get();
  const [
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33,
  ] = m;

  expect(r00).closeTo(m00, 0.0001); expect(r01).closeTo(m01, 0.0001); expect(r02).closeTo(m02, 0.0001); expect(r03).closeTo(m03, 0.0001);
  expect(r10).closeTo(m10, 0.0001); expect(r11).closeTo(m11, 0.0001); expect(r12).closeTo(m12, 0.0001); expect(r13).closeTo(m13, 0.0001);
  expect(r20).closeTo(m20, 0.0001); expect(r21).closeTo(m21, 0.0001); expect(r22).closeTo(m22, 0.0001); expect(r23).closeTo(m23, 0.0001);
  expect(r30).closeTo(m30, 0.0001); expect(r31).closeTo(m31, 0.0001); expect(r32).closeTo(m32, 0.0001); expect(r33).closeTo(m33, 0.0001);
});

test.each<NumberMatX1>([
  {
    n: 0,
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI / 2,
    m: [
      0, 0, -1, 0,
      0, 1, 0, 0,
      1, 0, 0, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI,
    m: [
      -1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, -1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI * 1.5,
    m: [
      0, 0, 1, 0,
      0, 1, 0, 0,
      -1, 0, 0, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI * 2,
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: -Math.PI / 2,
    m: [
      0, 0, 1, 0,
      0, 1, 0, 0,
      -1, 0, 0, 0,
      0, 0, 0, 1,
    ],
  },
])("createRotationY Angle: $n, Expected Result: $m", ({ n, m }) => {
  using result = new Matrix4(true);
  Matrix4.createRotationY(n, result);

  const [
    r00, r01, r02, r03,
    r10, r11, r12, r13,
    r20, r21, r22, r23,
    r30, r31, r32, r33,
  ] = result.get();
  const [
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33,
  ] = m;

  expect(r00).closeTo(m00, 0.0001); expect(r01).closeTo(m01, 0.0001); expect(r02).closeTo(m02, 0.0001); expect(r03).closeTo(m03, 0.0001);
  expect(r10).closeTo(m10, 0.0001); expect(r11).closeTo(m11, 0.0001); expect(r12).closeTo(m12, 0.0001); expect(r13).closeTo(m13, 0.0001);
  expect(r20).closeTo(m20, 0.0001); expect(r21).closeTo(m21, 0.0001); expect(r22).closeTo(m22, 0.0001); expect(r23).closeTo(m23, 0.0001);
  expect(r30).closeTo(m30, 0.0001); expect(r31).closeTo(m31, 0.0001); expect(r32).closeTo(m32, 0.0001); expect(r33).closeTo(m33, 0.0001);
});

test.each<NumberMatX1>([
  {
    n: 0,
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI / 2,
    m: [
      0, 1, 0, 0,
      -1, 0, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI,
    m: [
      -1, 0, 0, 0,
      0, -1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI * 1.5,
    m: [
      0, -1, 0, 0,
      1, 0, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: Math.PI * 2,
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    n: -Math.PI / 2,
    m: [
      0, -1, 0, 0,
      1, 0, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
])("createRotationZ Angle: $n, Expected Result: $m", ({ n, m }) => {
  using result = new Matrix4(true);
  Matrix4.createRotationZ(n, result);

  const [
    r00, r01, r02, r03,
    r10, r11, r12, r13,
    r20, r21, r22, r23,
    r30, r31, r32, r33,
  ] = result.get();
  const [
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33,
  ] = m;

  expect(r00).closeTo(m00, 0.0001); expect(r01).closeTo(m01, 0.0001); expect(r02).closeTo(m02, 0.0001); expect(r03).closeTo(m03, 0.0001);
  expect(r10).closeTo(m10, 0.0001); expect(r11).closeTo(m11, 0.0001); expect(r12).closeTo(m12, 0.0001); expect(r13).closeTo(m13, 0.0001);
  expect(r20).closeTo(m20, 0.0001); expect(r21).closeTo(m21, 0.0001); expect(r22).closeTo(m22, 0.0001); expect(r23).closeTo(m23, 0.0001);
  expect(r30).closeTo(m30, 0.0001); expect(r31).closeTo(m31, 0.0001); expect(r32).closeTo(m32, 0.0001); expect(r33).closeTo(m33, 0.0001);
});

test.each<QuatX1MatX1>([
  {
    q: [0, 0, 0, 1],
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    q: [0, 0, 1, 0],
    m: [
      -1, 0, 0, 0,
      0, -1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    q: [0, 1, 0, 0],
    m: [
      -1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, -1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    q: [1, 0, 0, 0],
    m: [
      1, 0, 0, 0,
      0, -1, 0, 0,
      0, 0, -1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    q: [0.232229, -0.579435, 0.763634, 0.164888],
    m: [
      -0.837764, -0.017295, 0.545760, 0.000000,
      -0.520951, -0.274134, -0.808369, 0.000000,
      0.163592, -0.961536, 0.220650, 0.000000,
      0.000000, 0.000000, 0.000000, 1.000000,
    ],
  },
])("createRotation Quaternion: $q, Expected Result: $m", ({ q, m }) => {
  using quat = new Quaternion(q);
  using resultWASM = new Matrix4(true);
  using resultTS = new Matrix4(true);
  Matrix4.createRotation(quat, resultWASM);
  Matrix4.createRotation_ts(quat, resultTS);

  const [
    w00, w01, w02, w03,
    w10, w11, w12, w13,
    w20, w21, w22, w23,
    w30, w31, w32, w33,
  ] = resultWASM.get();
  const [
    t00, t01, t02, t03,
    t10, t11, t12, t13,
    t20, t21, t22, t23,
    t30, t31, t32, t33,
  ] = resultTS.get();
  const [
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33,
  ] = m;

  expect(w00).closeTo(m00, 0.0001); expect(w01).closeTo(m01, 0.0001); expect(w02).closeTo(m02, 0.0001); expect(w03).closeTo(m03, 0.0001);
  expect(w10).closeTo(m10, 0.0001); expect(w11).closeTo(m11, 0.0001); expect(w12).closeTo(m12, 0.0001); expect(w13).closeTo(m13, 0.0001);
  expect(w20).closeTo(m20, 0.0001); expect(w21).closeTo(m21, 0.0001); expect(w22).closeTo(m22, 0.0001); expect(w23).closeTo(m23, 0.0001);
  expect(w30).closeTo(m30, 0.0001); expect(w31).closeTo(m31, 0.0001); expect(w32).closeTo(m32, 0.0001); expect(w33).closeTo(m33, 0.0001);

  expect(t00).closeTo(m00, 0.0001); expect(t01).closeTo(m01, 0.0001); expect(t02).closeTo(m02, 0.0001); expect(t03).closeTo(m03, 0.0001);
  expect(t10).closeTo(m10, 0.0001); expect(t11).closeTo(m11, 0.0001); expect(t12).closeTo(m12, 0.0001); expect(t13).closeTo(m13, 0.0001);
  expect(t20).closeTo(m20, 0.0001); expect(t21).closeTo(m21, 0.0001); expect(t22).closeTo(m22, 0.0001); expect(t23).closeTo(m23, 0.0001);
  expect(t30).closeTo(m30, 0.0001); expect(t31).closeTo(m31, 0.0001); expect(t32).closeTo(m32, 0.0001); expect(t33).closeTo(m33, 0.0001);
});
