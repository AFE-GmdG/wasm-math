import { test, expect } from "vitest";
import {
  Matrix4,
  Vector3,
  VecX1MatX1,
} from "./math";

test.each<VecX1MatX1>([
  {
    v: [0, 0, 0],
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
  {
    v: [1.25, 0.03, -7.76],
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      1.25, 0.03, -7.76, 1,
    ],
  },
])("createTranslation Trans: $v, Expected Result: $m", ({ v, m }) => {
  using translationVector = new Vector3(v);
  using resultFromVector3 = new Matrix4(true);
  using resultFromVector3Data = new Matrix4(true);

  // Test using Vector3 overload
  Matrix4.createTranslation(translationVector, resultFromVector3);
  // Test using Vector3Data overload
  Matrix4.createTranslation(v, resultFromVector3Data);

  const [
    rv00, rv01, rv02, rv03,
    rv10, rv11, rv12, rv13,
    rv20, rv21, rv22, rv23,
    rv30, rv31, rv32, rv33,
  ] = resultFromVector3.get();
  const [
    rd00, rd01, rd02, rd03,
    rd10, rd11, rd12, rd13,
    rd20, rd21, rd22, rd23,
    rd30, rd31, rd32, rd33,
  ] = resultFromVector3Data.get();
  const [
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33,
  ] = m;

  expect(rv00).closeTo(m00, 0.0001); expect(rv01).closeTo(m01, 0.0001); expect(rv02).closeTo(m02, 0.0001); expect(rv03).closeTo(m03, 0.0001);
  expect(rv10).closeTo(m10, 0.0001); expect(rv11).closeTo(m11, 0.0001); expect(rv12).closeTo(m12, 0.0001); expect(rv13).closeTo(m13, 0.0001);
  expect(rv20).closeTo(m20, 0.0001); expect(rv21).closeTo(m21, 0.0001); expect(rv22).closeTo(m22, 0.0001); expect(rv23).closeTo(m23, 0.0001);
  expect(rv30).closeTo(m30, 0.0001); expect(rv31).closeTo(m31, 0.0001); expect(rv32).closeTo(m32, 0.0001); expect(rv33).closeTo(m33, 0.0001);

  expect(rd00).closeTo(m00, 0.0001); expect(rd01).closeTo(m01, 0.0001); expect(rd02).closeTo(m02, 0.0001); expect(rd03).closeTo(m03, 0.0001);
  expect(rd10).closeTo(m10, 0.0001); expect(rd11).closeTo(m11, 0.0001); expect(rd12).closeTo(m12, 0.0001); expect(rd13).closeTo(m13, 0.0001);
  expect(rd20).closeTo(m20, 0.0001); expect(rd21).closeTo(m21, 0.0001); expect(rd22).closeTo(m22, 0.0001); expect(rd23).closeTo(m23, 0.0001);
  expect(rd30).closeTo(m30, 0.0001); expect(rd31).closeTo(m31, 0.0001); expect(rd32).closeTo(m32, 0.0001); expect(rd33).closeTo(m33, 0.0001);
});
