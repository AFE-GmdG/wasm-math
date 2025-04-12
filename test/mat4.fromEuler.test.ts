import { test, expect } from "vitest";
import {
  EulerOrder,
  Matrix4,
  Matrix4Data,
  Vector3,
} from "./math";

type TestData = {
  rx: number;
  ry: number;
  rz: number;
  eo: EulerOrder;
  m: Matrix4Data;
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

test.each<TestData>([
  {
    rx: 0, ry: 0, rz: 0, eo: EulerOrder.YXZ,
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
  },
])("Matrix4.createFromEuler (TS) (DEG-Version) ($rx, $ry, $rz) Euler Order: $eo", ({ rx, ry, rz, eo, m }) => {
  console.log(`Matrix4.createFromEuler (TS) (DEG-Version) (${rx}, ${ry}, ${rz}) Euler Order: ${eo}`);

  const vx = deg2rad(rx);
  const vy = deg2rad(ry);
  const vz = deg2rad(rz);

  using rotation = new Vector3([vx, vy, vz]);
  using result = new Matrix4();

  Matrix4.createFromEuler_ts(rotation, eo, result);

  result.print("Result", 3);

  const [
    r00, r01, r02, r03,
    r10, r11, r12, r13,
    r20, r21, r22, r23,
    r30, r31, r32, r33,
  ] = result.get();

  const [
    e00, e01, e02, e03,
    e10, e11, e12, e13,
    e20, e21, e22, e23,
    e30, e31, e32, e33,
  ] = m;

  expect(r00).closeTo(e00, 0.0001); expect(r01).closeTo(e01, 0.0001); expect(r02).closeTo(e02, 0.0001); expect(r03).closeTo(e03, 0.0001);
  expect(r10).closeTo(e10, 0.0001); expect(r11).closeTo(e11, 0.0001); expect(r12).closeTo(e12, 0.0001); expect(r13).closeTo(e13, 0.0001);
  expect(r20).closeTo(e20, 0.0001); expect(r21).closeTo(e21, 0.0001); expect(r22).closeTo(e22, 0.0001); expect(r23).closeTo(e23, 0.0001);
  expect(r30).closeTo(e30, 0.0001); expect(r31).closeTo(e31, 0.0001); expect(r32).closeTo(e32, 0.0001); expect(r33).closeTo(e33, 0.0001);
});
