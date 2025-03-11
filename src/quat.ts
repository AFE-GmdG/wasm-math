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
}
