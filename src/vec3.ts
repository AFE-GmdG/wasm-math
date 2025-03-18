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
  vAngle,
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

  /**
   * Creates a new vector instance.
   * Without arguments, the instance is temporary and initialized with the zero vector.
   */
  constructor();
  /**
   * Creates a new vector instance.
   * The instance will be temporary if tmp is true, otherwise permanent.
   * The instance will be initialized with the zero vector.
   * @param tmp Whether the instance is temporary or not.
   */
  constructor(tmp: boolean);
  /**
   * Creates a new vector instance.
   * The instance will be permenent initialized to the data.
   * @param v The vector data.
   */
  constructor(v: Vector3Data);
  /**
   * Creates a new vector instance.
   * The instance will be temporary if tmp is true, otherwise permanent.
   * The instance will be initialized to the data.
   * @param v The vector data.
   * @param tmp Whether the instance is temporary or not.
   */
  constructor(v: Vector3Data, tmp: boolean);
  /**
   * Creates a new copy of the other Vector3 instance.
   * The instance will be temporary or permanent depending on the other instance.
   * The instance will be initialized to the data of the other instance.
   * @param other The vector instance to copy.
   */
  constructor(other: Vector3);
  /**
   * Creates a new copy of the other Vector3 instance.
   * The instance will be temporary if tmp is true, otherwise permanent.
   * The instance will be initialized to the data of the other instance.
   * @param other The vector instance to copy.
   * @param tmp Whether the instance is temporary or not.
   */
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

  /**
   * Disposes the vector instance.
   */
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
    // count occupied slots
    const occupiedSlots = privateOffsetArray.filter((v) => v !== null).length;
    // count permanent occupied slots
    const permanentOccupiedSlots = privateOffsetArray.slice(0, firstFreePermanentOffset).filter((v) => v !== null).length;
    // count temporary occupied slots
    const temporaryOccupiedSlots = privateOffsetArray.slice(firstFreeTemporaryOffset + 1).filter((v) => v !== null).length;
    // Test, if there are free permanent slots before the first free permanent slot
    // This should always be false.
    const hasInvalidPermanentSlots = privateOffsetArray.slice(0, firstFreePermanentOffset).some((v) => v === null);
    // Test, if there are free temporary slots after the first free temporary slot
    // This should always be false.
    const hasInvalidTemporarySlots = privateOffsetArray.slice(firstFreeTemporaryOffset + 1).some((v) => v === null);
    return {
      freeSlots,
      occupiedSlots,
      permanentOccupiedSlots,
      temporaryOccupiedSlots,
      hasInvalidPermanentSlots,
      hasInvalidTemporarySlots,
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
   * @param result (Optional) The result vector.
   */
  static add(a: Vector3, b: Vector3, result = new Vector3): Vector3 {
    vAdd(a.#offset, b.#offset, result.#offset);
    return result;
  }

  /**
   * Adds two vectors. (TypeScript version)
   * @param a The first vector.
   * @param b The second vector.
   * @param result (Optional) The result vector.
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
   * @param result (Optional) The result vector.
   */
  static sub(a: Vector3, b: Vector3, result = new Vector3()): Vector3 {
    vSub(a.#offset, b.#offset, result.#offset);
    return result;
  }

  /**
   * Subtracts two vectors. (TypeScript version)
   * @param a The first vector.
   * @param b The second vector.
   * @param result (Optional) The result vector.
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
   * @param result (Optional) The result vector.
   */
  static cross(a: Vector3, b: Vector3, result = new Vector3()): Vector3 {
    vCross(a.#offset, b.#offset, result.#offset);
    return result;
  }

  /**
   * Calculates the cross product of two vectors. (TypeScript version)
   * @param a The first vector.
   * @param b The second vector.
   * @param result (Optional) The result vector.
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
   *
   * @param vector The vector to calculate the length of.
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
   *
   * @param vector The vector to calculate the squared length of.
   */
  static lengthSquared_ts(vector: Vector3Data): number {
    const [x, y, z] = vector;
    return x * x + y * y + z * z;
  }

  /**
   * Normalizes the vector.
   *
   * @param vector The vector to normalize.
   * @param result (Optional) The result vector.
   */
  static normalize(vector: Vector3, result = new Vector3()): Vector3 {
    vNormalize(vector.#offset, result.#offset);
    return result;
  }

  /**
   * Normalizes the vector. (TypeScript version)
   *
   * @param vector The vector to normalize.
   * @param result (Optional) The result vector.
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

  /**
   * Scale a vector by a scalar.
   *
   * @param vector The vector to scale.
   * @param scalar The scalar to scale the vector with.
   * @param result (Optional) The result vector.
   */
  static scale(vector: Vector3, scalar: number, result?: Vector3): Vector3;
  /**
   * Scale a vector by another vector.
   *
   * @param vectorA The vector to scale.
   * @param vectorB The vector to scale vector A with.
   * @param result (Optional) The result vector.
   */
  static scale(vectorA: Vector3, vectorB: Vector3, result?: Vector3): Vector3;
  static scale(vectorA: Vector3, vectorB: Vector3 | number, result: Vector3 = new Vector3()): Vector3 {
    if (typeof vectorB === "number") {
      result.set([vectorB, vectorB, vectorB]);
      vScaleVector(vectorA.#offset, result.#offset, result.#offset);
    } else {
      vScaleVector(vectorA.#offset, vectorB.#offset, result.#offset);
    }
    return result;
  }

  /**
   * Scale a vector by a scalar.
   *
   * @param vector The vector to scale.
   * @param scalar The scalar to scale the vector with.
   * @param result (Optional) The result vector.
   */
  static scale_ts(vector: Vector3Data, scalar: number, result?: Vector3Data): Vector3Data;
  /**
   * Scale a vector by another vector.
   *
   * @param vectorA The vector to scale.
   * @param vectorB The vector to scale vector A with.
   * @param result (Optional) The result vector.
   */
  static scale_ts(vectorA: Vector3Data, vectorB: Vector3Data, result?: Vector3Data): Vector3Data;
  static scale_ts(vectorA: Vector3Data, vectorB: Vector3Data | number, result: Vector3Data = [0, 0, 0]): Vector3Data {
    const [xA, yA, zA] = vectorA;
    const [xB, yB, zB] = typeof vectorB === "number" ? [vectorB, vectorB, vectorB] : vectorB;
    result[0] = xA * xB;
    result[1] = yA * yB;
    result[2] = zA * zB;
    return result;
  }

  /**
   * Returns the angle between two vectors in radians.
   * The vectors should be normalized.
   *
   * @param vectorA First vector. Should be normalized.
   * @param vectorB Second vector. Should be normalized.
   */
  static angle(vectorA: Vector3, vectorB: Vector3): number {
    return vAngle(vectorA.#offset, vectorB.#offset);
  }

  /**
   * Returns the angle between two vectors in radians. (TypeScript version)
   * The vectors should be normalized.
   *
   * @param vectorA First vector. Should be normalized.
   * @param vectorB Second vector. Should be normalized.
   */
  static angle_ts(vectorA: Vector3Data, vectorB: Vector3Data): number {
    if (
      vectorA[0] === vectorB[0]
      && vectorA[1] === vectorB[1]
      && vectorA[2] === vectorB[2]
    ) {
      return 0;
    }
    const [x1, y1, z1] = vectorA;
    const [x2, y2, z2] = vectorB;
    const dotProduct = x1 * x2 + y1 * y2 + z1 * z2;
    return Math.acos(dotProduct);
  }

  /**
   * Pretty-prints the vector to the console.
   *
   * @param name The name of the vector. If empty, only "Vector3" will be printed.
   *             If provided, it will be prefixed to "Vector3".
   * @param precision The number of decimal places to print. Default is 3.
   *
   * @example
   * const vec = new Vector3([1.23456, 7.89012, 3.45678]);
   * vec.print("Test"); // Output: "Test Vector3 (1.235, 7.890, 3.457)"
   * vec.print("", 2);  // Output: "Vector3 (1.23, 7.89, 3.46)"
   * vec.print();       // Output: "Vector3 (1.235, 7.890, 3.457)"
   */
  print(
    name: string = "",
    precision: number = 3,
  ) {
    const [x, y, z] = this.get();

    const sx = x.toFixed(precision);
    const sy = y.toFixed(precision);
    const sz = z.toFixed(precision);

    const maxLength = Math.max(
      sx.length,
      sy.length,
      sz.length,
    );

    console.log(
      `${name.trim().length ? `${name} ` : ""}Vector3 (${sx.padStart(maxLength)}, ${sy.padStart(maxLength)}, ${sz.padStart(maxLength)})`,
    );
  }
}
