import type { Vector3Data, QuaternionData, Matrix4Data } from "../src/wasm-math";

export { Vector3, Quaternion, Matrix4, EulerOrder } from "../src/wasm-math";

export { Vector3Data, QuaternionData, Matrix4Data };

export type VecX1 = {
  v: Vector3Data;
};

export type VecX1RNumber = {
  v: Vector3Data;
  result: number;
};

export type VecX1NumberVec = {
  v: Vector3Data;
  n: number;
  result: Vector3Data;
};

export type VecX1MatX1 = {
  v: Vector3Data;
  m: Matrix4Data;
};

export type VecX2 = {
  v: Vector3Data;
  result: Vector3Data;
};

export type VecX2RNumber = {
  v1: Vector3Data;
  v2: Vector3Data;
  result: number;
};

export type VecX3 = {
  v1: Vector3Data;
  v2: Vector3Data;
  result: Vector3Data;
};

export type QuatX1 = {
  q: QuaternionData;
};

export type QuatX1MatX1 = {
  q: QuaternionData;
  m: Matrix4Data;
};

export type MatX1 = {
  m: Matrix4Data;
};

export type MatX1VecX2 = {
  m: Matrix4Data;
  v: Vector3Data;
  result: Vector3Data;
};

export type MatX3 = {
  a: Matrix4Data;
  b: Matrix4Data;
  result: Matrix4Data;
};

export type NumberMatX1 = {
  n: number;
  m: Matrix4Data;
};
