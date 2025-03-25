import { EulerOrder } from "./eulerOrder";
import {
  memory,
  mCreateRotQuat,
  mCreateRotQuatData,
  mMulMat,
} from "./math";
import { Quaternion, QuaternionData } from "./quat";
import { Vector3, Vector3Data } from "./vec3";

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
   * The instance will be temporary if tmp is true, otherwise permanent.
   * The instance will be initialized to the identity matrix.
   * @param tmp Whether the instance is temporary or not.
   */
  constructor(tmp: boolean);
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
   * @param tmp Whether the instance is temporary or not.
   */
  constructor(m: Matrix4Data, tmp: boolean);
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
   * @param tmp Whether the instance is temporary or not.
   */
  constructor(other: Matrix4, tmp: boolean);
  constructor(arg1?: Matrix4Data | Matrix4 | boolean, arg2?: boolean) {
    let data: Matrix4Data = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
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
      if (firstFreePermanentOffset > firstFreeTemporaryOffset) {
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
  set m00(value: number) { this.#view[0] = value; }
  get m01(): number { return this.#view[1]; }
  set m01(value: number) { this.#view[1] = value; }
  get m02(): number { return this.#view[2]; }
  set m02(value: number) { this.#view[2] = value; }
  get m03(): number { return this.#view[3]; }
  set m03(value: number) { this.#view[3] = value; }

  get m10(): number { return this.#view[4]; }
  set m10(value: number) { this.#view[4] = value; }
  get m11(): number { return this.#view[5]; }
  set m11(value: number) { this.#view[5] = value; }
  get m12(): number { return this.#view[6]; }
  set m12(value: number) { this.#view[6] = value; }
  get m13(): number { return this.#view[7]; }
  set m13(value: number) { this.#view[7] = value; }

  get m20(): number { return this.#view[8]; }
  set m20(value: number) { this.#view[8] = value; }
  get m21(): number { return this.#view[9]; }
  set m21(value: number) { this.#view[9] = value; }
  get m22(): number { return this.#view[10]; }
  set m22(value: number) { this.#view[10] = value; }
  get m23(): number { return this.#view[11]; }
  set m23(value: number) { this.#view[11] = value; }

  get m30(): number { return this.#view[12]; }
  set m30(value: number) { this.#view[12] = value; }
  get m31(): number { return this.#view[13]; }
  set m31(value: number) { this.#view[13] = value; }
  get m32(): number { return this.#view[14]; }
  set m32(value: number) { this.#view[14] = value; }
  get m33(): number { return this.#view[15]; }
  set m33(value: number) { this.#view[15] = value; }

  /**
   * Gets all sixteen components of the matrix as tuple.
   */
  get(): Matrix4Data {
    return [
      this.#view[0], this.#view[1], this.#view[2], this.#view[3],
      this.#view[4], this.#view[5], this.#view[6], this.#view[7],
      this.#view[8], this.#view[9], this.#view[10], this.#view[11],
      this.#view[12], this.#view[13], this.#view[14], this.#view[15],
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
    m30?: number, m31?: number, m32?: number, m33?: number,
  ): void {
    if (typeof m00OrM === "number") {
      this.#view.set([
        m00OrM, m01!, m02!, m03!,
        m10!, m11!, m12!, m13!,
        m20!, m21!, m22!, m23!,
        m30!, m31!, m32!, m33!,
      ]);
    } else {
      this.#view.set(m00OrM);
    }
  }

  /**
   * Creates a new Matrix4 which is translated by the given vector.
   * (TypeScript only version: This method wouldn't be faster with WASM)
   *
   * @param translation The translation vector.
   * @param result (Optional) The matrix to store the result in.
   */
  static createTranslation(translation: Vector3, result?: Matrix4): Matrix4;
  /**
   * Creates a new Matrix4 which is translated by the given vector.
   * (TypeScript only version: This method wouldn't be faster with WASM)
   *
   * @param translation The translation vector.
   * @param result (Optional) The matrix to store the result in.
   */
  static createTranslation(translation: Vector3Data, result?: Matrix4): Matrix4;
  static createTranslation(translation: Vector3 | Vector3Data, result = new Matrix4()): Matrix4 {
    const [tx, ty, tz] = translation instanceof Vector3
      ? translation.get()
      : translation;

    result.set([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1,
    ]);

    return result;
  }

  /**
   * Creates a new Matrix4 which is rotated around the x-axis by the given angle.
   * (TypeScript only version: This method wouldn't be faster with WASM)
   *
   * @param radians The rotation angle in radians.
   * @param result (Optional) The matrix to store the result in.
   */
  static createRotationX(radians: number, result = new Matrix4()): Matrix4 {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    result.set([
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ]);

    return result;
  }

  /**
   * Creates a new Matrix4 which is rotated around the y-axis by the given angle.
   * (TypeScript only version: This method wouldn't be faster with WASM)
   *
   * @param radians The rotation angle in radians.
   * @param result (Optional) The matrix to store the result in.
   */
  static createRotationY(radians: number, result = new Matrix4()): Matrix4 {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    result.set([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ]);

    return result;
  }

  /**
   * Creates a new Matrix4 which is rotated around the z-axis by the given angle.
   * (TypeScript only version: This method wouldn't be faster with WASM)
   *
   * @param radians The rotation angle in radians.
   * @param result (Optional) The matrix to store the result in.
   */
  static createRotationZ(radians: number, result = new Matrix4()): Matrix4 {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    result.set([
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);

    return result;
  }

  /**
   * Creates a new Matrix4 which is rotated by the given quaternion.
   *
   * @param quaternion The quaternion to create the rotation matrix from.
   * @param result (Optional) The matrix to store the result in.
   */
  static createRotation(quaternion: Quaternion, result?: Matrix4): Matrix4;
  /**
   * Creates a new Matrix4 which is rotated by the given quaternion.
   *
   * @param quaternion The quaternion to create the rotation matrix from.
   * @param result (Optional) The matrix to store the result in.
   */
  static createRotation(quaternion: QuaternionData, result?: Matrix4): Matrix4;
  static createRotation(quaternion: Quaternion | QuaternionData, result = new Matrix4()): Matrix4 {
    if (quaternion instanceof Quaternion) {
      mCreateRotQuat(quaternion.offset, result.#offset);
    } else {
      const [x, y, z, w] = quaternion;
      mCreateRotQuatData(x, y, z, w, result.#offset);
    }

    return result;
  }

  /**
   * Creates a new Matrix4 which is rotated by the given quaternion.
   * (TypeScript version)
   *
   * @param quaternion The quaternion to create the rotation matrix from.
   * @param result (Optional) The matrix to store the result in.
   */
  static createRotation_ts(quaternion: Quaternion, result?: Matrix4): Matrix4;
  /**
   * Creates a new Matrix4 which is rotated by the given quaternion.
   * (TypeScript version)
   *
   * @param quaternion The quaternion to create the rotation matrix from.
   * @param result (Optional) The matrix to store the result in.
   */
  static createRotation_ts(quaternion: QuaternionData, result?: Matrix4): Matrix4;
  static createRotation_ts(quaternion: Quaternion | QuaternionData, result = new Matrix4()): Matrix4 {
    const [x, y, z, w] = quaternion instanceof Quaternion
      ? quaternion.get()
      : quaternion;

    const x2 = x + x; const y2 = y + y; const z2 = z + z;
    const xx = x * x2; const xy = x * y2; const xz = x * z2;
    const yy = y * y2; const yz = y * z2; const zz = z * z2;
    const wx = w * x2; const wy = w * y2; const wz = w * z2;

    result.set([
      1 - (yy + zz), xy + wz, xz - wy, 0,
      xy - wz, 1 - (xx + zz), yz + wx, 0,
      xz + wy, yz - wx, 1 - (xx + yy), 0,
      0, 0, 0, 1,
    ]);

    return result;
  }

  /**
   * TODO
   * Creates a new Matrix4 which is rotated by the given Euler angles.
   *
   * @param rotation The rotation vector.
   * @param eulerOrder The order of the Euler angles.
   * @param result (Optional) The matrix to store the result in.
   */
  static createFromEuler(rotation: Vector3, eulerOrder: EulerOrder, result?: Matrix4): Matrix4;
  /**
   * TODO
   * Creates a new Matrix4 which is rotated by the given Euler angles.
   *
   * @param rotation The rotation vector.
   * @param eulerOrder The order of the Euler angles.
   * @param result (Optional) The matrix to store the result in.
   */
  static createFromEuler(rotation: Vector3Data, eulerOrder: EulerOrder, result?: Matrix4): Matrix4;
  static createFromEuler(rotation: Vector3 | Vector3Data, eulerOrder: EulerOrder, result = new Matrix4()): Matrix4 {
    throw new Error(`Not implemented: rotation=${rotation}, eulerOrder=${eulerOrder}, result=${result}`);
  }

  /**
   * Creates a new Matrix4 which is rotated by the given Euler angles.
   * (TypeScript version)
   *
   * @param rotation The rotation vector.
   * @param eulerOrder The order of the Euler angles.
   * @param result (Optional) The matrix to store the result in.
   */
  static createFromEuler_ts(rotation: Vector3, eulerOrder: EulerOrder, result?: Matrix4): Matrix4;
  /**
   * Creates a new Matrix4 which is rotated by the given Euler angles.
   * (TypeScript version)
   *
   * @param rotation The rotation vector.
   * @param eulerOrder The order of the Euler angles.
   * @param result (Optional) The matrix to store the result in.
   */
  static createFromEuler_ts(rotation: Vector3Data, eulerOrder: EulerOrder, result?: Matrix4): Matrix4;
  static createFromEuler_ts(rotation: Vector3 | Vector3Data, eulerOrder: EulerOrder, result = new Matrix4()): Matrix4 {
    const [x, y, z] = rotation instanceof Vector3
      ? rotation.get()
      : rotation;

    const cx = Math.cos(x); const cy = Math.cos(y); const cz = Math.cos(z);
    const sx = Math.sin(x); const sy = Math.sin(y); const sz = Math.sin(z);

    switch (eulerOrder) {
      case EulerOrder.XYZ:
        result.set([
          cy * cz, -cy * sz, sy, 0,
          cx * sz + sx * sy * cz, cx * cz - sx * sy * sz, -sx * cy, 0,
          sx * sz - cx * sy * cz, sx * cz + cx * sy * sz, cx * cy, 0,
          0, 0, 0, 1,
        ]);
        break;
      case EulerOrder.XZY:
        result.set([
          cy * cz, -sz, cz * sy, 0,
          sx * sy + cx * cy * sz, cx * cz, -cy * sx + cx * sy * sz, 0,
          -cx * sy + cy * sx * sz, cz * sx, cx * cy + sx * sy * sz, 0,
          0, 0, 0, 1,
        ]);
        break;
      case EulerOrder.YXZ:
        result.set([
          cy * cz + sx * sy * sz, cz * sx * sy - cy * sz, cx * sy, 0,
          cx * sz, cx * cz, -sx, 0,
          cy * sx * sz - cz * sy, cy * cz * sx + sy * sz, cx * cy, 0,
          0, 0, 0, 1,
        ]);
        break;
      case EulerOrder.YZX:
        result.set([
          cy * cz, sx * sy - cx * cy * sz, cx * sy + cy * sx * sz, 0,
          sz, cx * cz, -cz * sx, 0,
          -cz * sy, cy * sx + cx * sy * sz, cx * cy - sx * sy * sz, 0,
          0, 0, 0, 1,
        ]);
        break;
      case EulerOrder.ZXY:
        result.set([
          cy * cz - sx * sy * sz, -cx * sz, cz * sy + cy * sx * sz, 0,
          cz * sx * sy + cy * sz, cx * cz, cy * cz * sx - sy * sz, 0,
          -cx * sy, sx, cx * cy, 0,
          0, 0, 0, 1,
        ]);
        break;
      case EulerOrder.ZYX:
        result.set([
          cy * cz, -sz, cz * sy, 0,
          cy * sz, cz, -sz * sy, 0,
          -sy, 0, cy, 0,
          0, 0, 0, 1,
        ]);
        break;
    }

    return result;
  }

  // TODO: createScale
  // TODO: createInverse
  // TODO: createOrthographic
  // TODO: createPerspective
  // TODO: createLookAt

  /**
   * Performs a matrix-matrix multiplication.
   *
   * @param a The first matrix to multiply.
   * @param b The second matrix to multiply.
   * @param result (Optional) The matrix to store the result in.
   */
  static multiply(a: Matrix4, b: Matrix4, result?: Matrix4): Matrix4;
  static multiply(a: Matrix4Data, b: Matrix4Data, result?: Matrix4): Matrix4;
  static multiply(a: Matrix4 | Matrix4Data, b: Matrix4 | Matrix4Data, result = new Matrix4()): Matrix4 {
    if (a instanceof Matrix4) {
      // Matrix4 * Matrix4
      mMulMat(a.#offset, (b as Matrix4).#offset, result.#offset);
      return result;
    }
    // Matrix4Data * Matrix4Data
    using ma = new Matrix4(a, true);
    using mb = new Matrix4((b as Matrix4Data), true);
    mMulMat(ma.#offset, mb.#offset, result.#offset);
    return result;
  }

  /**
   * Performs a matrix-matrix multiplication. (TypeScript version)
   *
   * @param a The first matrix to multiply.
   * @param b The second matrix to multiply.
   * @param result (Optional) The matrix to store the result in.
   */
  static multiply_ts(a: Matrix4, b: Matrix4, result?: Matrix4): Matrix4;
  static multiply_ts(a: Matrix4Data, b: Matrix4Data, result?: Matrix4): Matrix4;
  static multiply_ts(a: Matrix4 | Matrix4Data, b: Matrix4 | Matrix4Data, result = new Matrix4()): Matrix4 {
    const [
      a00, a01, a02, a03,
      a10, a11, a12, a13,
      a20, a21, a22, a23,
      a30, a31, a32, a33,
    ] = a instanceof Matrix4
      ? a.get()
      : a;

    const [
      b00, b01, b02, b03,
      b10, b11, b12, b13,
      b20, b21, b22, b23,
      b30, b31, b32, b33,
    ] = b instanceof Matrix4
      ? b.get()
      : b;

    result.set([
      a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
      a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
      a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
      a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,

      a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
      a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
      a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
      a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,

      a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
      a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
      a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
      a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,

      a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
      a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
      a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
      a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33,
    ]);

    return result;
  }

  // TODO: multiplyVector3
  // TODO: instance methods to translate, rotate, scale and invert the matrix in place

  /**
   * Pretty-prints the matrix to the console.
   *
   * @param name The name of the matrix. If empty, only "Matrix 4x4" will be printed.
   *             If provided, it will be prefixed to "Matrix 4x4".
   * @param precision The number of decimal places to print. Default is 3.
   * @param asColumnMajor If true, prints the matrix in column-major order. Default is false (row-major order).
   *                      "(Column Major) or "(Row Major)" will be appended to the name.
   */
  print(
    name: string = "",
    precision: number = 3,
    asColumnMajor: boolean = false,
  ) {
    const [
      xx, xy, xz, xw,
      yx, yy, yz, yw,
      zx, zy, zz, zw,
      wx, wy, wz, ww,
    ] = this.get();

    const sxx = xx.toFixed(precision); const sxy = xy.toFixed(precision); const sxz = xz.toFixed(precision); const sxw = xw.toFixed(precision);
    const syx = yx.toFixed(precision); const syy = yy.toFixed(precision); const syz = yz.toFixed(precision); const syw = yw.toFixed(precision);
    const szx = zx.toFixed(precision); const szy = zy.toFixed(precision); const szz = zz.toFixed(precision); const szw = zw.toFixed(precision);
    const swx = wx.toFixed(precision); const swy = wy.toFixed(precision); const swz = wz.toFixed(precision); const sww = ww.toFixed(precision);

    const maxLength = Math.max(
      sxx.length, sxy.length, sxz.length, sxw.length,
      syx.length, syy.length, syz.length, syw.length,
      szx.length, szy.length, szz.length, szw.length,
      swx.length, swy.length, swz.length, sww.length,
    );

    if (asColumnMajor) {
      console.log(
        `${name.trim().length ? `${name} ` : ""}Matrix 4x4 (Column Major):\n` +
        `| ${sxx.padStart(maxLength)} ${syx.padStart(maxLength)} ${szx.padStart(maxLength)} ${swx.padStart(maxLength)} |\n` +
        `| ${sxy.padStart(maxLength)} ${syy.padStart(maxLength)} ${szy.padStart(maxLength)} ${swy.padStart(maxLength)} |\n` +
        `| ${sxz.padStart(maxLength)} ${syz.padStart(maxLength)} ${szz.padStart(maxLength)} ${swz.padStart(maxLength)} |\n` +
        `| ${sxw.padStart(maxLength)} ${syw.padStart(maxLength)} ${szw.padStart(maxLength)} ${sww.padStart(maxLength)} |`,
      );
    } else {
      console.log(
        `${name.trim().length ? `${name} ` : ""}Matrix 4x4 (Row Major):\n` +
        `| ${sxx.padStart(maxLength)} ${sxy.padStart(maxLength)} ${sxz.padStart(maxLength)} ${sxw.padStart(maxLength)} |\n` +
        `| ${syx.padStart(maxLength)} ${syy.padStart(maxLength)} ${syz.padStart(maxLength)} ${syw.padStart(maxLength)} |\n` +
        `| ${szx.padStart(maxLength)} ${szy.padStart(maxLength)} ${szz.padStart(maxLength)} ${szw.padStart(maxLength)} |\n` +
        `| ${swx.padStart(maxLength)} ${swy.padStart(maxLength)} ${swz.padStart(maxLength)} ${sww.padStart(maxLength)} |`,
      );
    }
  }
}
