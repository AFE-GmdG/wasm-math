import math, { MathInstance } from "./wasm/math.wasm";

const mathModule = await math();

const mathInstance = await WebAssembly.instantiate(mathModule) as unknown as MathInstance;

export const {
  memory,

  vAdd,
  vSub,
  vCross,
  vDot,
  vLength,
  vLengthSquared,
  vNormalize,
  vScaleScalar,
  vScaleVector,
  vAngle,
  vLerp,
  vSlerp,
  vBezier,

  mCreateRotQuat,
  mCreateRotQuatData,
} = mathInstance.exports;
