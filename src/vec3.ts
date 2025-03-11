import math, { MathInstance } from "./wasm/math.wasm";

const mathModule = await math();

const mathInstance = await WebAssembly.instantiate(mathModule) as unknown as MathInstance;

const {
  memory,
  vAdd,
  vSub,
  vCross,
  vDot,
  vLength,
  vLengthSquared,
  vNormalize,
} = mathInstance.exports;

// Array of Vector3 instances. The index * 16 is the offset in the memory.
const privateOffsetArray: (Vector3 | null)[] = new Array(4096).fill(null);

// The first free index in the offset array for permanent Vector3.
let firstFreePermanentOffset = 0;

// The first free index in the offset array for temporary Vector3.
// Temporary Vector3 indices are calculated from the end of the memory page.
let firstFreeTemporaryOffset = 4095;

export class Vector3 implements Disposable {
  #view: Float32Array;
  #index: number;
  #offset: number;
  #isTemporary: boolean;

  constructor();
  constructor([x, y, z]: [number, number, number]);
  constructor(tmp: boolean);
  constructor(vecOrTmp?: [number, number, number] | boolean) {
    if (typeof vecOrTmp === "boolean") {
      if (firstFreeTemporaryOffset < firstFreePermanentOffset) {
        throw new Error("Vector3: out of memory!");
      }
      this.#isTemporary = vecOrTmp;
      this.#index = firstFreeTemporaryOffset;
      this.#offset = this.#index << 4;
      this.#view = new Float32Array(memory.buffer, this.#offset, 3);
      this.#view.fill(0);
      privateOffsetArray[this.#index] = this;
      firstFreeTemporaryOffset--;
      while (privateOffsetArray[firstFreeTemporaryOffset] !== null && firstFreeTemporaryOffset >= firstFreePermanentOffset) {
        firstFreeTemporaryOffset--;
      }
    } else {
      if (firstFreePermanentOffset > firstFreeTemporaryOffset) {
        throw new Error("Vector3: out of memory!");
      }
      this.#isTemporary = false;
      this.#index = firstFreePermanentOffset;
      this.#offset = this.#index << 4;
      this.#view = new Float32Array(memory.buffer, this.#offset, 3);
      if (vecOrTmp) {
        this.#view.set(vecOrTmp);
      } else {
        this.#view.fill(0);
      }
      privateOffsetArray[this.#index] = this;
      firstFreePermanentOffset++;
      while (privateOffsetArray[firstFreePermanentOffset] !== null && firstFreePermanentOffset <= firstFreeTemporaryOffset) {
        firstFreePermanentOffset++;
      }
    }
  }

  [Symbol.dispose]() {
    if (this.#isTemporary) {
      privateOffsetArray[this.#index] = null;
      this.#view = undefined!;
      if (firstFreeTemporaryOffset < this.#index) {
        firstFreeTemporaryOffset = this.#index;
      }
    } else {
      privateOffsetArray[this.#index] = null;
      this.#view = undefined!;
      if (firstFreePermanentOffset > this.#index) {
        firstFreePermanentOffset = this.#index;
      }
    }
  }

  /**
   * Calculates some statistics about the memory usage.
   */
  static getStatistics() {
    // count the free slots
    const freeSlots = privateOffsetArray.filter((v) => v === null).length;
    return {
      freeSlots,
      firstFreePermanentOffset,
      firstFreeTemporaryOffset,
    };
  }

  /* Properties */
  get x(): number { return this.#view[0]; }
  set x(value: number) { this.#view[0] = value; }
  get y(): number { return this.#view[1]; }
  set y(value: number) { this.#view[1] = value; }
  get z(): number { return this.#view[2]; }
  set z(value: number) { this.#view[2] = value; }

  /**
   * Gets all three components of the vector as tuple.
   */
  get(): [number, number, number] {
    return [this.#view[0], this.#view[1], this.#view[2]];
  }

  /**
   * Sets all three components of the vector at once.
   * @param vector [x, y, z] Tuple with the new values for the vector.
   */
  set([x, y, z]: [number, number, number]): void;
  /**
   * Sets all three components of the vector at once.
   * @param x The new x value.
   * @param y The new y value.
   * @param z The new z value.
   */
  set(x: number, y: number, z: number): void;
  set(x: [number, number, number] | number, y?: number, z?: number): void {
    if (typeof x === "number") {
      this.#view.set([x, y!, z!]);
    } else {
      this.#view.set(x);
    }
  }

  /**
   * Adds two vectors.
   * @param a The first vector.
   * @param b The second vector.
   * @param result The result vector.
   */
  static add(a: Vector3, b: Vector3, result: Vector3): Vector3 {
    vAdd(a.#offset, b.#offset, result.#offset);
    return result;
  }

  /**
   * Subtracts two vectors.
   * @param a The first vector.
   * @param b The second vector.
   * @param result The result vector.
   */
  static sub(a: Vector3, b: Vector3, result: Vector3): Vector3 {
    vSub(a.#offset, b.#offset, result.#offset);
    return result;
  }

  /**
   * Calculates the cross product of two vectors.
   * @param a The first vector.
   * @param b The second vector.
   * @param result The result vector.
   */
  static cross(a: Vector3, b: Vector3, result: Vector3): Vector3 {
    vCross(a.#offset, b.#offset, result.#offset);
    return result;
  }

  /**
   * Calculates the dot product of two vectors.
   * @param a The first vector.
   * @param b The second vector.
   */
  static dot(a: Vector3, b: Vector3): number {
    return vDot(a.#offset, b.#offset);
  }

  /**
   * Calculates the length of the vector.
   */
  length(): number {
    return vLength(this.#offset);
  }

  /**
   * Calculates the squared length of the vector.
   */
  lengthSquared(): number {
    return vLengthSquared(this.#offset);
  }

  /**
   * Normalizes the vector.
   */
  static normalize(vector: Vector3, result: Vector3): Vector3 {
    vNormalize(vector.#offset, result.#offset);
    return result;
  }
}
