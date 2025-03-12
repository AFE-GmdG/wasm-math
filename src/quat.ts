import math, { MathInstance } from "./wasm/math.wasm";

const mathModule = await math();

const mathInstance = await WebAssembly.instantiate(mathModule) as unknown as MathInstance;

const {
  memory,
} = mathInstance.exports;

// Array of Quaternion instances. The index * 16 + 65536 is the offset in the memory.
const privateOffsetArray: (Quaternion | null)[] = new Array(4096).fill(null);

// The first free index in the offset array for permanent Quaternion.
let firstFreePermanentOffset = 0;

// The first free index in the offset array for temporary Quaternion.
// Temporary Quaternion indices are calculated from the end of the memory page.
let firstFreeTemporaryOffset = 4095;

export class Quaternion implements Disposable {
  #view: Float32Array;
  #index: number;
  #offset: number;
  #isTemporary: boolean;

  constructor();
  constructor([x, y, z, w]: [number, number, number, number]);
  constructor(tmp: boolean);
  constructor(quatOrTmp?: [number, number, number, number] | boolean) {
    if (typeof quatOrTmp === "boolean") {
      this.#isTemporary = quatOrTmp;
      if (this.#isTemporary) {
        if (firstFreeTemporaryOffset < firstFreePermanentOffset) {
          throw new Error("Quaternion: out of memory!");
        }
        this.#index = firstFreeTemporaryOffset;
        this.#offset = (this.#index << 4) + 65536;
        this.#view = new Float32Array(memory.buffer, this.#offset, 4);
        this.#view.set([0, 0, 0, 1]);
        privateOffsetArray[this.#index] = this;
        firstFreeTemporaryOffset--;
        while (privateOffsetArray[firstFreeTemporaryOffset] !== null && firstFreeTemporaryOffset >= firstFreePermanentOffset) {
          firstFreeTemporaryOffset--;
        }
      } else {
        if (firstFreePermanentOffset > firstFreeTemporaryOffset) {
          throw new Error("Quaternion: out of memory!");
        }
        this.#index = firstFreePermanentOffset;
        this.#offset = (this.#index << 4) + 65536;
        this.#view = new Float32Array(memory.buffer, this.#offset, 4);
        this.#view.set([0, 0, 0, 1]);
        privateOffsetArray[this.#index] = this;
        firstFreePermanentOffset++;
        while (privateOffsetArray[firstFreePermanentOffset] !== null && firstFreePermanentOffset <= firstFreeTemporaryOffset) {
          firstFreePermanentOffset++;
        }
      }
    } else {
      if (firstFreePermanentOffset > firstFreeTemporaryOffset) {
        throw new Error("Quaternion: out of memory!");
      }
      this.#isTemporary = false;
      this.#index = firstFreePermanentOffset;
      this.#offset = (this.#index << 4) + 65536;
      this.#view = new Float32Array(memory.buffer, this.#offset, 4);
      if (quatOrTmp) {
        this.#view.set(quatOrTmp);
      } else {
        this.#view.set([0, 0, 0, 1]);
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
    // count free slots
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
  get w(): number { return this.#view[3]; }
  set w(value: number) { this.#view[3] = value; }

  /**
   * Gets all four components of the quaternion as tuple.
   */
  get(): [number, number, number, number] {
    return [this.#view[0], this.#view[1], this.#view[2], this.#view[3]];
  }

  /**
   * Sets all four components of the quaternion at once.
   * @param quat [x, y, z, w] Tuple with the new values for the quaternion.
   */
  set([x, y, z, w]: [number, number, number, number]): void;
  /**
   * Sets all four components of the quaternion at once.
   * @param x The new x value for the quaternion.
   * @param y The new y value for the quaternion.
   * @param z The new z value for the quaternion.
   * @param w The new w value for the quaternion.
   */
  set(x: number, y: number, z: number, w: number): void;
  set(xOrQuat: [number, number, number, number] | number, y?: number, z?: number, w?: number): void {
    if (typeof xOrQuat === "number") {
      this.#view.set([xOrQuat, y!, z!, w!]);
    } else {
      this.#view.set(xOrQuat);
    }
  }
}
