import math, { MathInstance } from "./wasm/math.wasm";

const mathModule = await math();

const mathInstance = await WebAssembly.instantiate(mathModule) as unknown as MathInstance;

const {
  memory,
} = mathInstance.exports;

// Array of Matrix4 instances. The index * 64 + 131072 is the offset in the memory.
const privateOffsetArray: (Matrix4 | null)[] = new Array(4096).fill(null);

// The first free index in the offset array for permanent Matrix4.
let firstFreePermanentOffset = 0;

// The first free index in the offset array for temporary Matrix4.
// Temporary Matrix4 indices are calculated from the end of the memory page.
let firstFreeTemporaryOffset = 4095;

export type Matrix4Data = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export class Matrix4 implements Disposable {
  #view: Float32Array;
  #index: number;
  #offset: number;
  #isTemporary: boolean;

  /**
   * Creates a new Matrix4 instance.
   * Without arguments, the instance is temporary and initialized to the identity matrix.
   */
  constructor();
  /**
   * Creates a new Matrix4 instance.
   * The instance will be permanent and initialized to the data.
   * @param m The matrix data.
   */
  constructor(m: Matrix4Data);
  /**
   * Creates a new Matrix4 instance.
   * The instance will be temporary if tmp is true, otherwise permanent.
   * The instance will be initialized with the data.
   * @param m The matrix data.
   */
  constructor(m: Matrix4Data, tmp: boolean);
  /**
   * Creates a new Matrix4 instance.
   * The instance will be temporary if tmp is true, otherwise permanent.
   * The instance will be initialized to the identity matrix.
   * @param tmp Whether the instance is temporary
   */
  constructor(tmp: boolean);
  /**
   * Creates a new copy of the other Matrix4 instance.
   * The instance will be temporary or permanent depending on the other instance.
   * The instance will be initialized to the data of the other instance.
   * @param other The Matrix4 instance to copy.
   */
  constructor(other: Matrix4);
  /**
   * Creates a new copy of the other Matrix4 instance.
   * The instance will be temporary if tmp is true, otherwise permanent.
   * The instance will be initialized to the data of the other instance.
   * @param other The Matrix4 instance to copy.
   * @param tmp true if the instance should be temporary, false if permanent.
   */
  constructor(other: Matrix4, tmp: boolean);
  constructor(arg1?: Matrix4Data | Matrix4 | boolean, arg2?: boolean) {
    let data: Matrix4Data = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
    this.#isTemporary = false;
    if (arg1 === undefined) {
      this.#isTemporary = true;
    } else if (arg1 instanceof Matrix4) {
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
        throw new Error("Matrix4: out of memory!");
      }
      this.#index = firstFreeTemporaryOffset;
      this.#offset = (this.#index << 6) + 131072;
      this.#view = new Float32Array(memory.buffer, this.#offset, 16);
      this.#view.set(data);
      privateOffsetArray[this.#index] = this;
      firstFreeTemporaryOffset--;
      while (privateOffsetArray[firstFreeTemporaryOffset] !== null && firstFreeTemporaryOffset >= firstFreePermanentOffset) {
        firstFreeTemporaryOffset--;
      }
    } else {
      if ( firstFreePermanentOffset > firstFreeTemporaryOffset) {
        throw new Error("Matrix4: out of memory!");
      }
      this.#index = firstFreePermanentOffset;
      this.#offset = (this.#index << 6) + 131072;
      this.#view = new Float32Array(memory.buffer, this.#offset, 16);
      this.#view.set(data);
      privateOffsetArray[this.#index] = this;
      firstFreePermanentOffset++;
      while (privateOffsetArray[firstFreePermanentOffset] !== null && firstFreePermanentOffset <= firstFreeTemporaryOffset) {
        firstFreePermanentOffset++;
      }
    }
  }

  /**
   * Disposes the Matrix4 instance.
   */
  [Symbol.dispose](): void {
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
    // count free slots
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
      firstFreePermanentOffset,
      firstFreeTemporaryOffset,
      hasInvalidPermanentSlots,
      hasInvalidTemporarySlots,
    };
  }

  /* Properties */
  get m00(): number { return this.#view[0]; }
  get m01(): number { return this.#view[1]; }
  get m02(): number { return this.#view[2]; }
  get m03(): number { return this.#view[3]; }
  get m10(): number { return this.#view[4]; }
  get m11(): number { return this.#view[5]; }
  get m12(): number { return this.#view[6]; }
  get m13(): number { return this.#view[7]; }
  get m20(): number { return this.#view[8]; }
  get m21(): number { return this.#view[9]; }
  get m22(): number { return this.#view[10]; }
  get m23(): number { return this.#view[11]; }
  get m30(): number { return this.#view[12]; }
  get m31(): number { return this.#view[13]; }
  get m32(): number { return this.#view[14]; }
  get m33(): number { return this.#view[15]; }

  /**
   * Gets all sixteen components of the matrix as tuple.
   */
  get(): Matrix4Data {
    return [
      this.#view[0], this.#view[1], this.#view[2], this.#view[3],
      this.#view[4], this.#view[5], this.#view[6], this.#view[7],
      this.#view[8], this.#view[9], this.#view[10], this.#view[11],
      this.#view[12], this.#view[13], this.#view[14], this.#view[15]
    ];
  }

  /**
   * Sets all sixteen components of the matrix at once.
   * @param m The matrix data.
   */
  set(m: Matrix4Data): void;
  /**
   * Sets all sixteen components of the matrix at once.
   * @param m00 The new m00 value for the matrix.
   * @param m01 The new m01 value for the matrix.
   * @param m02 The new m02 value for the matrix.
   * @param m03 The new m03 value for the matrix.
   * @param m10 The new m10 value for the matrix.
   * @param m11 The new m11 value for the matrix.
   * @param m12 The new m12 value for the matrix.
   * @param m13 The new m13 value for the matrix.
   * @param m20 The new m20 value for the matrix.
   * @param m21 The new m21 value for the matrix.
   * @param m22 The new m22 value for the matrix.
   * @param m23 The new m23 value for the matrix.
   * @param m30 The new m30 value for the matrix.
   * @param m31 The new m31 value for the matrix.
   * @param m32 The new m32 value for the matrix.
   * @param m33 The new m33 value for the matrix.
   */
  set(
    m00: number, m01: number, m02: number, m03: number,
    m10: number, m11: number, m12: number, m13: number,
    m20: number, m21: number, m22: number, m23: number,
    m30: number, m31: number, m32: number, m33: number
  ): void;
  set(
    m00OrM: Matrix4Data | number, m01?: number, m02?: number, m03?: number,
    m10?: number, m11?: number, m12?: number, m13?: number,
    m20?: number, m21?: number, m22?: number, m23?: number,
    m30?: number, m31?: number, m32?: number, m33?: number
  ): void {
    if (typeof m00OrM === "number") {
      this.#view.set([
        m00OrM, m01!, m02!, m03!,
        m10!, m11!, m12!, m13!,
        m20!, m21!, m22!, m23!,
        m30!, m31!, m32!, m33!
      ]);
    } else {
      this.#view.set(m00OrM);
    }
  }
}
