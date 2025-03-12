import { test, expect } from "vitest";
import { Matrix4, Matrix4Data, MatX1 } from "./math";

// define some usefule matrices
const identity: Matrix4Data = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];
const zero: Matrix4Data = [
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0,
];

// Matrix4 ctor() overloads:
// constructor();
// constructor(m: Matrix4Data);
// constructor(m: Matrix4Data, tmp: boolean);
// constructor(tmp: boolean);
// constructor(other: Matrix4);
// constructor(other: Matrix4, tmp: boolean);

// There are 4096 slots available for Matrix4 instances.
// The first permanent Matrix4 instance is at offset 0 counting up.
// The first temporary Matrix4 instance is at offset 4095 counting down.

// Default ctor
test("Matrix4 default ctor", () => {
  const statistics1 = Matrix4.getStatistics();
  expect(statistics1.freeSlots).toBe(4096);
  expect(statistics1.occupiedSlots).toBe(0);
  expect(statistics1.permanentOccupiedSlots).toBe(0);
  expect(statistics1.temporaryOccupiedSlots).toBe(0);
  expect(statistics1.firstFreePermanentOffset).toBe(0);
  expect(statistics1.firstFreeTemporaryOffset).toBe(4095);
  expect(statistics1.hasInvalidPermanentSlots).toBe(false);
  expect(statistics1.hasInvalidTemporarySlots).toBe(false);

  // construct a default matrix
  // Without arguments, the instance is temporary and initialized to the identity matrix.
  expect(
    () => {
      using mat = new Matrix4();

      mat.print("Default", 1);

      const [
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33,
      ] = mat.get();

      expect(m00).toBe(1); expect(m01).toBe(0); expect(m02).toBe(0); expect(m03).toBe(0);
      expect(m10).toBe(0); expect(m11).toBe(1); expect(m12).toBe(0); expect(m13).toBe(0);
      expect(m20).toBe(0); expect(m21).toBe(0); expect(m22).toBe(1); expect(m23).toBe(0);
      expect(m30).toBe(0); expect(m31).toBe(0); expect(m32).toBe(0); expect(m33).toBe(1);

      const statistics2 = Matrix4.getStatistics();
      expect(statistics2.freeSlots).toBe(4095);
      expect(statistics2.occupiedSlots).toBe(1);
      expect(statistics2.permanentOccupiedSlots).toBe(0);
      expect(statistics2.temporaryOccupiedSlots).toBe(1);
      expect(statistics2.firstFreePermanentOffset).toBe(0);
      expect(statistics2.firstFreeTemporaryOffset).toBe(4094);
      expect(statistics2.hasInvalidPermanentSlots).toBe(false);
      expect(statistics2.hasInvalidTemporarySlots).toBe(false);
    },
  ).not.toThrow();

  const statistics3 = Matrix4.getStatistics();
  expect(statistics3.freeSlots).toBe(4096);
  expect(statistics3.occupiedSlots).toBe(0);
  expect(statistics3.permanentOccupiedSlots).toBe(0);
  expect(statistics3.temporaryOccupiedSlots).toBe(0);
  expect(statistics3.firstFreePermanentOffset).toBe(0);
  expect(statistics3.firstFreeTemporaryOffset).toBe(4095);
  expect(statistics3.hasInvalidPermanentSlots).toBe(false);
  expect(statistics3.hasInvalidTemporarySlots).toBe(false);
});
