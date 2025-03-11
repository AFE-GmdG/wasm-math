import { test, expect } from "vitest";
import { Vector3, VecX1 } from "./math";

// Vector3 ctor() overloads:
// constructor();
// constructor([x, y, z]: [number, number, number]);
// constructor(tmp: boolean);

// There are 4096 slots available for Vector3 instances.
// The first permanent Vector3 instance is at offset 0.
// The first temporary Vector3 instance is at offset 4095.

test("Vector3 default ctor", () => {
  const statistics1 = Vector3.getStatistics();
  expect(statistics1.freeSlots).toBe(4096);
  expect(statistics1.firstFreePermanentOffset).toBe(0);
  expect(statistics1.firstFreeTemporaryOffset).toBe(4095);

  // construct a default vector
  // With this ctor, permanent Vector3 instances are created
  expect(
    () => {
      using vec = new Vector3();

      const [x, y, z] = vec.get();
      expect(x).toBe(0);
      expect(y).toBe(0);
      expect(z).toBe(0);

      const statistics2 = Vector3.getStatistics();
      expect(statistics2.freeSlots).toBe(4095);
      expect(statistics2.firstFreePermanentOffset).toBe(1);
      expect(statistics2.firstFreeTemporaryOffset).toBe(4095);
    },
  ).not.toThrow();

  const statistics3 = Vector3.getStatistics();
  expect(statistics3.freeSlots).toBe(4096);
  expect(statistics3.firstFreePermanentOffset).toBe(0);
  expect(statistics3.firstFreeTemporaryOffset).toBe(4095);
});

test.each<VecX1>([
  { v: [1, 2, 3] },
  { v: [0.2, -1.1, -0.9] },
  { v: [0, 0, 0] },
])("Vector3 ctor($v)", ({ v }) => {
  const statistics1 = Vector3.getStatistics();
  expect(statistics1.freeSlots).toBe(4096);
  expect(statistics1.firstFreePermanentOffset).toBe(0);
  expect(statistics1.firstFreeTemporaryOffset).toBe(4095);

  // construct a vector with values
  // With this ctor, permanent Vector3 instances are created.
  expect(
    () => {
      using vec = new Vector3(v);

      const [x, y, z] = vec.get();
      expect(x).closeTo(v[0], 0.0001);
      expect(y).closeTo(v[1], 0.0001);
      expect(z).closeTo(v[2], 0.0001);

      const statistics2 = Vector3.getStatistics();
      expect(statistics2.freeSlots).toBe(4095);
      expect(statistics2.firstFreePermanentOffset).toBe(1);
      expect(statistics2.firstFreeTemporaryOffset).toBe(4095);
    },
  ).not.toThrow();

  const statistics3 = Vector3.getStatistics();
  expect(statistics3.freeSlots).toBe(4096);
  expect(statistics3.firstFreePermanentOffset).toBe(0);
  expect(statistics3.firstFreeTemporaryOffset).toBe(4095);
});

test.each<boolean>([
  true,
  false,
])("Vector3 ctor($tmp)", (tmp) => {
  const statistics1 = Vector3.getStatistics();
  expect(statistics1.freeSlots).toBe(4096);
  expect(statistics1.firstFreePermanentOffset).toBe(0);
  expect(statistics1.firstFreeTemporaryOffset).toBe(4095);

  // construct a vector using the temporary hint
  // With this ctor, temporary Vector3 instances are created
  // if the hint is true, otherwise permanent Vector3 instances are created.
  expect(
    () => {
      using vec = new Vector3(tmp);

      const [x, y, z] = vec.get();
      expect(x).toBe(0);
      expect(y).toBe(0);
      expect(z).toBe(0);

      if (tmp) {
        const statistics2 = Vector3.getStatistics();
        expect(statistics2.freeSlots).toBe(4095);
        expect(statistics2.firstFreePermanentOffset).toBe(0);
        expect(statistics2.firstFreeTemporaryOffset).toBe(4094);
      } else {
        const statistics2 = Vector3.getStatistics();
        expect(statistics2.freeSlots).toBe(4095);
        expect(statistics2.firstFreePermanentOffset).toBe(1);
        expect(statistics2.firstFreeTemporaryOffset).toBe(4095);
      }
    },
  ).not.toThrow();

  const statistics3 = Vector3.getStatistics();
  expect(statistics3.freeSlots).toBe(4096);
  expect(statistics3.firstFreePermanentOffset).toBe(0);
  expect(statistics3.firstFreeTemporaryOffset).toBe(4095);
});

// Test case "Out of Memory"
// create 4096 permanent Vector3 instances
// then try to create one more
test("Vector3 Out of Memory", () => {
  const statistics1 = Vector3.getStatistics();
  expect(statistics1.freeSlots).toBe(4096);
  expect(statistics1.firstFreePermanentOffset).toBe(0);
  expect(statistics1.firstFreeTemporaryOffset).toBe(4095);

  expect(
    () => {
      const vecs: Vector3[] = [];
      for (let i = 0; i < 4096; i++) {
        vecs.push(new Vector3());
      }

      const statistics2 = Vector3.getStatistics();
      expect(statistics2.freeSlots).toBe(0);
      expect(statistics2.firstFreePermanentOffset).toBe(4096);
      expect(statistics2.firstFreeTemporaryOffset).toBe(4095);

      // try to create one more
      expect(
        () => {
          const vec = new Vector3();
          expect.unreachable();
        },
      ).toThrow();

      // manually free all vectors.
      // This is necessary, because I can't use the `using` keyword here,
      // it would create a new scope in each loop iteration.
      for (let i = 0; i < 4096; i++) {
        // @ts-ignore
        vecs[i][Symbol.dispose]();
      }
      vecs.length = 0;
    },
  ).not.toThrow();

  const statistics3 = Vector3.getStatistics();
  expect(statistics3.freeSlots).toBe(4096);
  expect(statistics3.firstFreePermanentOffset).toBe(0);
  expect(statistics3.firstFreeTemporaryOffset).toBe(4095);
});
