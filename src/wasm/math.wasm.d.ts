interface MathWasm {
  memory: WebAssembly.Memory;

  /**
   * Adds two vectors.
   *
   * @param offsetA MemoryOffset of the first vector.
   * @param offsetB MemoryOffset of the second vector.
   * @param offsetResult MemoryOffset of the result vector.
   */
  vAdd(offsetA: number, offsetB: number, offsetResult: number): void;

  /**
   * Subtracts two vectors.
   *
   * @param offsetA MemoryOffset of the first vector.
   * @param offsetB MemoryOffset of the second vector.
   * @param offsetResult MemoryOffset of the result vector.
   */
  vSub(offsetA: number, offsetB: number, offsetResult: number): void;

  /**
   * Calculates the cross product of two vectors.
   *
   * @param offsetA MemoryOffset of the first vector.
   * @param offsetB MemoryOffset of the second vector.
   * @param offsetResult MemoryOffset of the result vector.
   */
  vCross(offsetA: number, offsetB: number, offsetResult: number): void;

  /**
   * Calculates the dot product of two vectors.
   *
   * @param offsetA MemoryOffset of the first vector.
   * @param offsetB MemoryOffset of the second vector.
   */
  vDot(offsetA: number, offsetB: number): number;

  /**
   * Calculates the length of a vector.
   *
   * @param offset MemoryOffset of the vector.
   */
  vLength(offset: number): number;

  /**
   * Calculates the squared length of a vector.
   *
   * @param offset MemoryOffset of the vector.
   */
  vLengthSquared(offset: number): number;

  /**
   * Normalizes a vector.
   *
   * @param offset MemoryOffset of the vector.
   * @param offsetResult MemoryOffset of the result vector.
   */
  vNormalize(offset: number, offsetResult: number): void;

  /**
   * Scales a vector by another vector.
   *
   * @param offset MemoryOffset of the vector.
   * @param offsetScale MemoryOffset of the scale vector.
   * @param offsetResult MemoryOffset of the result vector.
   */
  vScaleVector(offsetA: number, offsetB: number, offsetResult: number): void;

  /**
   * Returns the angle between two vectors in radians.
   *
   * Each vector is assumed to be normalized.
   *
   * @param offsetA MemoryOffset of the first vector. Should be normalized.
   * @param offsetB MemoryOffset of the second vector. Should be normalized.
   */
  vAngle(offsetA: number, offsetB: number): number;

  /**
   * Linear interpolation between two vectors.
   *
   * @param offsetA MemoryOffset of the first vector.
   * @param offsetB MemoryOffset of the second vector.
   * @param t Interpolation factor.
   * @param offsetResult MemoryOffset of the result vector.
   */
  vLerp(offsetA: number, offsetB: number, t: number, offsetResult: number): void;

  /**
   * Spherical linear interpolation between two vectors.
   *
   * Each vector is assumed to be normalized.
   *
   * @param offsetA MemoryOffset of the first vector. Should be normalized.
   * @param offsetB MemoryOffset of the second vector. Should be normalized.
   * @param t Interpolation factor.
   * @param offsetResult MemoryOffset of the result vector.
   */
  vSlerp(offsetA: number, offsetB: number, t: number, offsetResult: number): void;

  /**
   * Third-order bezier interpolation between two vectors.
   *
   * @param offsetA MemoryOffset of the first vector.
   * @param offsetB MemoryOffset of the second vector.
   * @param offsetC MemoryOffset of the first control point.
   * @param offsetD MemoryOffset of the second control point.
   * @param t Interpolation factor.
   * @param offsetResult MemoryOffset of the result vector.
   */
  vBezier(offsetA: number, offsetB: number, offsetC: number, offsetD: number, t: number, offsetResult: number): void;

  /**
   * Creates a rotation matrix from a quaternion.
   * The quaternion should be normalized.
   *
   * @param offsetQuat MemoryOffset of the rotation quaternion.
   * @param offsetResult MemoryOffset of the result matrix.
   */
  mCreateRotQuat(offsetQuat: number, offsetResult: number): void;

  /**
   * Creates a rotation matrix from quaternion data.
   * The quaternion should be normalized.
   *
   * @param x X value of the rotation quaternion.
   * @param y Y value of the rotation quaternion.
   * @param z Z value of the rotation quaternion.
   * @param w W value of the rotation quaternion.
   * @param offsetResult MemoryOffset of the result matrix.
   */
  mCreateRotQuatData(x: number, y: number, z: number, w: number, offsetResult: number): void;
}

export interface MathInstance {
  exports: MathWasm;
}

export default function init(): Promise<WebAssembly.Module>;
