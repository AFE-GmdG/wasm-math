import { test, expect } from "vitest";
import { Quaternion, QuatX1 } from "./math";

// Quaternion ctor() overloads:
// constructor();
// constructor([x, y, z, w]: [number, number, number, number]);
// constructor(tmp: boolean);

// There are 4096 slots available for Quaternion instances.
// The first permanent Quaternion instance is at offset 0.
// The first temporary Quaternion instance is at offset 4095.

// Default ctor
test("Quaternion default ctor", () => {
  const statistics1 = Quaternion.getStatistics();
  expect(statistics1.freeSlots).toBe(4096);
  expect(statistics1.firstFreePermanentOffset).toBe(0);
  expect(statistics1.firstFreeTemporaryOffset).toBe(4095);

  // construct a default quaternion
  // With this ctor, permanent Quaternion instances are created
  expect(
    () => {
      using quat = new Quaternion();

      quat.print("Default", 1);

      const [x, y, z, w] = quat.get();
      expect(x).toBe(0);
      expect(y).toBe(0);
      expect(z).toBe(0);
      expect(w).toBe(1);

      const statistics2 = Quaternion.getStatistics();
      expect(statistics2.freeSlots).toBe(4095);
      expect(statistics2.firstFreePermanentOffset).toBe(0);
      expect(statistics2.firstFreeTemporaryOffset).toBe(4094);
    },
  ).not.toThrow();

  const statistics3 = Quaternion.getStatistics();
  expect(statistics3.freeSlots).toBe(4096);
  expect(statistics3.firstFreePermanentOffset).toBe(0);
  expect(statistics3.firstFreeTemporaryOffset).toBe(4095);
});

// ctor([x, y, z, w])
test.each<QuatX1>([
  { q: [0.1, 0.2, 0.3, 0.4] },
  { q: [0.2, -1.1, -0.9, 0.3] },
  { q: [0, 0, 0, 1] },
])(`Quaternion ctor($q)`, ({ q }) => {
  const statistics1 = Quaternion.getStatistics();
  expect(statistics1.freeSlots).toBe(4096);
  expect(statistics1.firstFreePermanentOffset).toBe(0);
  expect(statistics1.firstFreeTemporaryOffset).toBe(4095);

  // construct a quaternion with values
  // With this ctor, permanent Quaternion instances are created.
  expect(
    () => {
      using quat = new Quaternion(q);

      const [x, y, z, w] = quat.get();
      expect(x).closeTo(q[0], 0.0001);
      expect(y).closeTo(q[1], 0.0001);
      expect(z).closeTo(q[2], 0.0001);
      expect(w).closeTo(q[3], 0.0001);

      const statistics2 = Quaternion.getStatistics();
      expect(statistics2.freeSlots).toBe(4095);
      expect(statistics2.firstFreePermanentOffset).toBe(1);
      expect(statistics2.firstFreeTemporaryOffset).toBe(4095);
    },
  ).not.toThrow();

  const statistics3 = Quaternion.getStatistics();
  expect(statistics3.freeSlots).toBe(4096);
  expect(statistics3.firstFreePermanentOffset).toBe(0);
  expect(statistics3.firstFreeTemporaryOffset).toBe(4095);
});
