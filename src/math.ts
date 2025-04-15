import math, { MathInstance } from "./wasm/math.wasm";

const imports: WebAssembly.Imports = {
  env: {
    sin: Math.sin,
    cos: Math.cos,
    acos: Math.acos,
  },
};

const mathModule = await math();

const mathInstance = await WebAssembly.instantiate(mathModule, imports) as unknown as MathInstance;

export const {
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
  vLerp,
  vSlerp,
  vBezier,

  mCreateRotQuat,
  mCreateRotQuatData,
  mCreateInverse,
  mMulMat,
  mMulVec,
} = mathInstance.exports;
