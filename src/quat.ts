import {
  memory,
} from "./math";

// Array of Quaternion instances. The index * 16 + 65536 is the offset in the memory.
const privateOffsetArray: (Quaternion | null)[] = new Array(4096).fill(null);

// The first free index in the offset array for permanent Quaternion.
let firstFreePermanentOffset = 0;

// The first free index in the offset array for temporary Quaternion.
// Temporary Quaternion indices are calculated from the end of the memory page.
let firstFreeTemporaryOffset = 4095;

export type QuaternionData = [number, number, number, number];

export class Quaternion implements Disposable {
  #view: Float32Array;
  #index: number;
  #offset: number;
  #isTemporary: boolean;

  /**
   * Creates a new quaternion instance.
   * Without arguments, the instance is temporary and initialized with the identity quaternion.
   */
  constructor();
  /**
   * Creates a new quaternion instance.
   * The instance will be temporary if tmp is true, otherwise permanent.
   * The instance will be initialized with the identity quaternion.
   * @param tmp Whether the instance is temporary or not.
   */
  constructor(tmp: boolean);
  /**
   * Creates a new quaternion instance.
   * The instance will be permenent initialized to the data.
   * @param q The quaternion data.
   */
  constructor(q: QuaternionData);
  /**
   * Creates a new quaternion instance.
   * The instance will be temporary if tmp is true, otherwise permanent.
   * The instance will be initialized to the data.
   * @param q The quaternion data.
   * @param tmp Whether the instance is temporary or not.
   */
  constructor(q: QuaternionData, tmp: boolean);
  /**
   * Creates a new copy of the other Quaternion instance.
   * The instance will be temporary or permanent depending on the other instance.
   * The instance will be initialized to the data of the other instance.
   * @param other The quaternion instance to copy.
   */
  constructor(other: Quaternion);
  /**
   * Creates a new copy of the other Quaternion instance.
   * The instance will be temporary if tmp is true, otherwise permanent.
   * The instance will be initialized to the data of the other instance.
   * @param other The quaternion instance to copy.
   * @param tmp Whether the instance is temporary or not.
   */
  constructor(other: Quaternion, tmp: boolean);
  constructor(arg1?: QuaternionData | Quaternion | boolean, arg2?: boolean) {
    let data: QuaternionData = [0, 0, 0, 1];
    this.#isTemporary = false;
    if (arg1 === undefined) {
      // default constructor
      this.#isTemporary = true;
    } else if (arg1 instanceof Quaternion) {
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
        throw new Error("Quaternion: out of memory!");
      }
      this.#index = firstFreeTemporaryOffset;
      this.#offset = (this.#index << 4) + 65536;
      this.#view = new Float32Array(memory.buffer, this.#offset, 4);
      this.#view.set(data);
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

  get offset(): number { return this.#offset; }

  /**
   * Gets all four components of the quaternion as tuple.
   */
  get(): QuaternionData {
    return [this.#view[0], this.#view[1], this.#view[2], this.#view[3]];
  }

  /**
   * Sets all four components of the quaternion at once.
   * @param quat [x, y, z, w] Tuple with the new values for the quaternion.
   */
  set([x, y, z, w]: QuaternionData): void;
  /**
   * Sets all four components of the quaternion at once.
   * @param x The new x value for the quaternion.
   * @param y The new y value for the quaternion.
   * @param z The new z value for the quaternion.
   * @param w The new w value for the quaternion.
   */
  set(x: number, y: number, z: number, w: number): void;
  set(xOrQuat: QuaternionData | number, y?: number, z?: number, w?: number): void {
    if (typeof xOrQuat === "number") {
      this.#view.set([xOrQuat, y!, z!, w!]);
    } else {
      this.#view.set(xOrQuat);
    }
  }

  print(
    name: string = "",
    precision: number = 3,
    asColumnMajor: boolean = false,
  ) {
    const [x, y, z, w] = this.get();

    const sx = x.toFixed(precision);
    const sy = y.toFixed(precision);
    const sz = z.toFixed(precision);
    const sw = w.toFixed(precision);

    const maxLength = Math.max(
      sx.length,
      sy.length,
      sz.length,
      sw.length,
    );

    if (asColumnMajor) {
      console.log(
        `${name.trim().length ? `${name} ` : ""}Quaternion (\n` +
        `  ${sx.padStart(maxLength)}\n` +
        `  ${sy.padStart(maxLength)}\n` +
        `  ${sz.padStart(maxLength)}\n` +
        `  ${sw.padStart(maxLength)}\n` +
        ")",
      );
    } else {
      console.log(
        // eslint-disable-next-line max-len
        `${name.trim().length ? `${name} ` : ""}Quaternion (${sx.padStart(maxLength)}, ${sy.padStart(maxLength)}, ${sz.padStart(maxLength)}, ${sw.padStart(maxLength)})`,
      );
    }
  }
}
