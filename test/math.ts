export {
  Vector3,
  Quaternion,
  Matrix4,
  Matrix4Data,
} from "../dist/wasm-math.js";

export type Vector = [number, number, number];
export type Quat = [number, number, number, number];

export type VecX1 = {
  v: Vector;
};

export type VecX1RNumber = {
  v: Vector;
  result: number;
};

export type VecX2 = {
  v: Vector;
  result: Vector;
}

export type VecX2RNumber = {
  v1: Vector;
  v2: Vector;
  result: number;
};

export type VecX3 = {
  v1: Vector;
  v2: Vector;
  result: Vector;
};

export type QuatX1 = {
  q: Quat;
};

export type MatX1 = {
  m: Matrix4Data;
};
