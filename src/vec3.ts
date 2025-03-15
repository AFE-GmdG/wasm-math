import {
  memory,

  vAdd,
  vSub,
  vCross,
  vDot,
  vLength,
  vLengthSquared,
  vNormalize,
  vScaleVector,
} from "./math";

// Array of Vector3 instances. The index * 16 is the offset in the memory.
const privateOffsetArray: (Vector3 | null)[] = new Array(4096).fill(null);

// The first free index in the offset array for permanent Vector3.
let firstFreePermanentOffset = 0;

// The first free index in the offset array for temporary Vector3.
// Temporary Vector3 indices are calculated from the end of the memory page.
let firstFreeTemporaryOffset = 4095;

export type Vector3Data = [number, number, number];

export class Vector3 implements Disposable {
  #view: Float32Array;
  #index: number;
  #offset: number;
  #isTemporary: boolean;

  constructor();
  constructor(tmp: boolean);
  constructor(v: Vector3Data);
  constructor(v: Vector3Data, tmp: boolean);
  constructor(other: Vector3);
  constructor(other: Vector3, tmp: boolean);
  constructor(arg1?: Vector3Data | Vector3 | boolean, arg2?: boolean) {
    let data: Vector3Data = [0, 0, 0];
    this.#isTemporary = false;
    if (arg1 === undefined) {
      // default constructor
      this.#isTemporary = true;
    } else if (arg1 instanceof Vector3) {
      data = arg1.get();
      this.#isTemporary = arg2 ?? arg1.#isTemporary;
    } else if (typeof arg1 === "boolean") {
      this.#isTemporary = arg1;
    } else {
      data = arg1;
      this.#isTemporary = arg2 ?? false;
    }

    if (this.#isTemporary) {
      if (firstFreeTemporaryOffset < firstFreePermanentOffset) {
        throw new Error("Vector3: Out of memory!");
      }
      this.#index = firstFreeTemporaryOffset;
      this.#offset = (this.#index << 4);
      this.#view = new Float32Array(memory.buffer, this.#offset, 3);
      this.#view.set(data);
      privateOffsetArray[this.#index] = this;
      firstFreeTemporaryOffset--;
      while (privateOffsetArray[firstFreeTemporaryOffset] !== null && firstFreeTemporaryOffset >= firstFreePermanentOffset) {
        firstFreeTemporaryOffset--;
      }
    } else {
      if (firstFreePermanentOffset > firstFreeTemporaryOffset) {
        throw new Error("Vector3: Out of memory!");
      }
      this.#index = firstFreePermanentOffset;
      this.#offset = (this.#index << 4);
      this.#view = new Float32Array(memory.buffer, this.#offset, 3);
      this.#view.set(data);
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
  get(): Vector3Data {
    return [this.#view[0], this.#view[1], this.#view[2]];
  }

  /**
   * Sets all three components of the vector at once.
   * @param vector [x, y, z] Tuple with the new values for the vector.
   */
  set([x, y, z]: Vector3Data): void;
  /**
   * Sets all three components of the vector at once.
   * @param x The new x value.
   * @param y The new y value.
   * @param z The new z value.
   */
  set(x: number, y: number, z: number): void;
  set(x: Vector3Data | number, y?: number, z?: number): void {
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
   * Adds two vectors. (TypeScript version)
   * @param a The first vector.
   * @param b The second vector.
   * @param result The result vector.
   */
  static add_ts(a: Vector3Data, b: Vector3Data, result: Vector3Data = [0, 0, 0]): Vector3Data {
    const [ax, ay, az] = a;
    const [bx, by, bz] = b;
    result[0] = ax + bx;
    result[1] = ay + by;
    result[2] = az + bz;
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
   * Subtracts two vectors. (TypeScript version)
   * @param a The first vector.
   * @param b The second vector.
   * @param result The result vector.
   */
  static sub_ts(a: Vector3Data, b: Vector3Data, result: Vector3Data = [0, 0, 0]): Vector3Data {
    const [ax, ay, az] = a;
    const [bx, by, bz] = b;
    result[0] = ax - bx;
    result[1] = ay - by;
    result[2] = az - bz;
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
   * Calculates the cross product of two vectors. (TypeScript version)
   * @param a The first vector.
   * @param b The second vector.
   * @param result The result vector.
   */
  static cross_ts(a: Vector3Data, b: Vector3Data, result: Vector3Data = [0, 0, 0]): Vector3Data {
    const [ax, ay, az] = a;
    const [bx, by, bz] = b;
    result[0] = ay * bz - az * by;
    result[1] = az * bx - ax * bz;
    result[2] = ax * by - ay * bx;
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
   * Calculates the dot product of two vectors. (TypeScript version)
   * @param a The first vector.
   * @param b The second vector.
   */
  static dot_ts(a: Vector3Data, b: Vector3Data): number {
    const [ax, ay, az] = a;
    const [bx, by, bz] = b;
    return ax * bx + ay * by + az * bz;
  }

  /**
   * Calculates the length of the vector.
   */
  length(): number {
    return vLength(this.#offset);
  }

  /**
   * Calculates the length of the vector. (TypeScript version)
   */
  static length_ts(vector: Vector3Data): number {
    const [x, y, z] = vector;
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Calculates the squared length of the vector.
   */
  lengthSquared(): number {
    return vLengthSquared(this.#offset);
  }

  /**
   * Calculates the squared length of the vector. (TypeScript version)
   */
  static lengthSquared_ts(vector: Vector3Data): number {
    const [x, y, z] = vector;
    return x * x + y * y + z * z;
  }

  /**
   * Normalizes the vector.
   */
  static normalize(vector: Vector3, result: Vector3): Vector3 {
    vNormalize(vector.#offset, result.#offset);
    return result;
  }

  /**
   * Normalizes the vector. (TypeScript version)
   */
  static normalize_ts(vector: Vector3Data, result: Vector3Data = [0, 0, 0]): Vector3Data {
    const [x, y, z] = vector;
    const lengthSquared = x * x + y * y + z * z;
    if (lengthSquared < 0.000001) {
      result[0] = 0;
      result[1] = 0;
      result[2] = 0;
      return result;
    }
    if (lengthSquared === 1) {
      result[0] = x;
      result[1] = y;
      result[2] = z;
      return result;
    }
    const invLength = 1 / Math.sqrt(lengthSquared);
    result[0] = x * invLength;
    result[1] = y * invLength;
    result[2] = z * invLength;
    return result;
  }

  // Scale
  static scale(vector: Vector3, scalar: number, result: Vector3): Vector3;
  static scale(vectorA: Vector3, vectorB: Vector3, result: Vector3): Vector3;
  static scale(vectorA: Vector3, vectorB: Vector3 | number, result: Vector3 = new Vector3()): Vector3 {
    if (typeof vectorB === "number") {
      result.set([vectorB, vectorB, vectorB]);
      vScaleVector(vectorA.#offset, result.#offset, result.#offset);
    } else {
      vScaleVector(vectorA.#offset, vectorB.#offset, result.#offset);
    }
    return result;
  }

  static scale_ts(vector: Vector3Data, scalar: number, result?: Vector3Data): Vector3Data;
  static scale_ts(vectorA: Vector3Data, vectorB: Vector3Data, result?: Vector3Data): Vector3Data;
  static scale_ts(vectorA: Vector3Data, vectorB: Vector3Data | number, result: Vector3Data = [0, 0, 0]): Vector3Data {
    const [xA, yA, zA] = vectorA;
    const [xB, yB, zB] = typeof vectorB === "number" ? [vectorB, vectorB, vectorB] : vectorB;
    result[0] = xA * xB;
    result[1] = yA * yB;
    result[2] = zA * zB;
    return result;
  }
}
