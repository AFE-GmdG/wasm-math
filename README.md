[![Node.js CI](https://github.com/AFE-GmdG/wasm-math/workflows/Node.js%20CI/badge.svg)](https://github.com/AFE-GmdG/wasm-math/actions?query=workflow:"Node.js+CI")
[![GitHub tag](https://img.shields.io/github/tag/AFE-GmdG/wasm-math?include_prereleases=&sort=semver&color=blue)](https://github.com/AFE-GmdG/wasm-math/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

# wasm-math - WebAssembly Math Library

`wasm-math` is a powerful library for vector, quaternion, and matrix operations, developed with TypeScript and handwritten WebAssembly (\*.wat). It is specifically optimized for WebGPU-based games and web applications, utilizing the [SIMD (Single Instruction, Multiple Data)](https://github.com/WebAssembly/simd/blob/master/proposals/simd/SIMD.md) instruction extension of WebAssembly for maximum performance. It's tested against the latest Chrome and Firefox versions.

## Features
- **Vector Operations**:
  - addition and subtraction (WASM & TS)
  - cross and dot product (WASM & TS)
  - squared and normal vector length (WASM & TS)
  - normalization (WASM & TS)
  - scale (WASM & TS)
  - angle between two vectors (WASM & TS)
  - pretty print
- **Quaternion Operations**: *TODO*
  - pretty print
- **Matrix Operations**: *TODO*
  - createTranslation (TS only, wasm would be slower)
  - createRotationX, Y and Z (TS only, wasm would be slower)
  - createRotation (Quaternion) (WASM & TS, wasm is slightly slower becaue of imporing `Math.acos` from JavaScript)
  - *TODO*: createFromEuler with EulerOrder and a useful default
  - *TODO*: createScale
  - *TODO*: createInverse
  - *TODO*: createOrthographic
  - *TODO*: createPerspective
  - *TODO*: createLookAt
  - multiply (WASM & TS) (WASM is 4.22 times faster)
  - *TODO*: multiplyVector
  - pretty print
- **SIMD WebAssembly**: Handwritten SIMD operations ensure maximum performance. The assembly code is kept to an absolute minimum to optimize execution speed. Comparisons with `Emscripten` and `C` code showed significantly longer code, more frequent read and write accesses, and thus lower performance.
- **TypeScript**: The library is developed with TypeScript, providing a clean and easy-to-use API as well as type safety.

## Intended target platforms
- **WebGPU**: The library is specifically designed for use with WebGPU-based applications and games.
- **Chrome and Firefox**: The library is tested against Chrome version 134 and Firefox version 136.

## Installation
**npm**
```bash
npm install wasm-math
```
**yarn**
```bash
yarn add wasm-math
```

## Build from source
### Dependencies
- Node ^22.5.1
- Rollup
- TypeScript ^5.8.2

### Additional dependency
To build the **wasm** from the **wat** file, you need the `wat2wasm` tool.
- [WABT: The WebAssembly Binary Toolkit](https://github.com/WebAssembly/wabt) ^1.0.36 (external tool, contains `wat2wasm`)

## Usage
**TypeScript example**
```typescript
import { Vector3 } from 'wasm-math';

function main() {
    // Create two vectors with initial values
    using v1 = new Vector3(1, 2, 3);
    using v2 = new Vector3(4, 5, 6);

    // Create an additional vector for temporary storage
    // This is a hint. For more information, see
    // `Memory management insights and challenges` below.
    using result = new Vector3(); // temporary

    // Calculate the cross product of v1 and v2
    Vector3.cross(v1, v2, result);

    // Print the result
    console.log(result.print(3)); // Output: [3.000, -6.000, 3.000]

    // Get internal Vector3 statistics
    // There should be 3 Vector instances in total,
    // 2 long time and 1 for temporary purposes.
    console.log(Vector3.getStatistics());
}

main();

// Get internal Vector3 statistics
// This time, there should be no Vector instances left.
console.log(Vector3.getStatistics());
```

## Performance comparison example
To maximize speed, the library stores vector, quaternion, and matrix data directly in WebAssembly memory. This ensures that operations on these data in WebAssembly are extremely fast.

### Comparable TypeScript implementation of a cross product:
```ts
function cross_ts([x1, y1, z1]: number[], [x2, y2, z2]: number[]): number[] {
    return [
        y1 * z2 - z1 * y2,
        z1 * x2 - x1 * z2,
        x1 * y2 - y1 * x2
    ];
}
```
### Used WebAssembly code in this library:
```
  (func $vCross (export "vCross") (type $offsetX3) (param $offsetA i32) (param $offsetB i32) (param $offsetResult i32)
    (local $vecA v128)
    (local $vecB v128)

    local.get $offsetResult  ;; S offsetResult

    ;; Calculate (y1, z1, x1, 0) * (z2, x2, y2, 0) - (z1, x1, y1, 0) * (y2, z2, x2, 0)

    ;; Load vecA from memory offsetA
    local.get $offsetA       ;; S offsetResult, offsetA
    v128.load                ;; S offsetResult, A
    ;; Store vecA and let it on the stack
    local.tee $vecA          ;; S offsetResult, A

    ;; Swizzle A on Stack to (y1, z1, x1, _w1)
    v128.const i32x4 0x07060504 0x0b0a0908 0x03020100 0x0f0e0d0c ;; S offsetResult, A, swizzle params
    i8x16.swizzle            ;; S offsetResult, A (swizzled)

    ;; Load vecB from memory offsetB
    local.get $offsetB       ;; S offsetResult, A (swizzled), offsetB
    v128.load                ;; S offsetResult, A (swizzled), B
    ;; Store vecB and let it on the stack
    local.tee $vecB          ;; S offsetResult, A (swizzled), B

    ;; Swizzle B on Stack to (z2, x2, y2, _w2)
    v128.const i32x4 0x0b0a0908 0x03020100 0x07060504 0x0f0e0d0c ;; S offsetResult, A (swizzled), B, swizzle params
    i8x16.swizzle            ;; S offsetResult, A (swizzled), B (swizzled)

    ;; Calculate (y1 * z2, z1 * x2, x1 * y2, 0)
    f32x4.mul                ;; S offsetResult, (first multiply part)

    ;; Load vecA from stack
    local.get $vecA          ;; S offsetResult, (first multiply part), A
    ;; Swizzle A on Stack to (z1, x1, y1, _w1)
    v128.const i32x4 0x0b0a0908 0x03020100 0x07060504 0x0f0e0d0c ;; S offsetResult, (first multiply part), A, swizzle params
    i8x16.swizzle            ;; S offsetResult, (first multiply part), A (swizzled)

    ;; Load vecB from stack
    local.get $vecB          ;; S offsetResult, (first multiply part), A (swizzled), B
    ;; Swizzle B on Stack to (y2, z2, x2, _w2)
    v128.const i32x4 0x07060504 0x0b0a0908 0x03020100 0x0f0e0d0c ;; S offsetResult, (first multiply part), A (swizzled), B, swizzle params
    i8x16.swizzle            ;; S offsetResult, (first multiply part), A (swizzled), B (swizzled)

    ;; Calculate (z1 * y2, x1 * z2, y1 * x2, 0)
    f32x4.mul                ;; S offsetResult, (first multiply part), (second multiply part)

    ;; Subtract the two multiplied vectors
    f32x4.sub                ;; S offsetResult, result

    ;; store result in memory offsetResult
    v128.store               ;; S -
  )
```
### Performance comparison on my machine

AMD Ryzen 9 7900X3D, 64 GB RAM, Windows 11, Chrome 134

100 million cross products:

Engine      | Time         | Relative to JS | Relative to WASM
------------|--------------|------|-----
JavaScript  | 2.89 seconds | 100% | 301%
WebAssembly | 0.96 seconds |  33% | 100%

A comparison to an `Emscripten`-compiled C implementation will be added soon.

A cross product isn't that complex. However, if the performance gain is already 3x for this simple operation, the gain for more complex operations like matrix-matrix multiplication will be even higher.

### Update: Matrix-Matrix Multiplication
```ts
import { Matrix4, Matrix4Data } from "wasm-math";

(() => {
  const a: Matrix4Data = [
    -0.232, 0.123, 0.456, 0.789,
    0.321, 0.654, -0.987, 0.123,
    0.456, -0.789, 0.123, 0.456,
    0.654, 0.987, 0.123, -0.456,
  ];
  const b: Matrix4Data = [
    0.123, 0.456, 0.789, -0.232,
    0.654, -0.987, 0.123, 0.321,
    -0.789, 0.123, 0.456, 0.654,
    0.987, 0.123, -0.456, 0.987,
  ];

  using ma = new Matrix4(a);
  using mb = new Matrix4(b);
  using mr = new Matrix4();

  const t0 = performance.now();
  for (let i = 0; i < 100_000_000; ++i) {
    Matrix4.multiply(ma, mb, mr);
  }
  const t1 = performance.now();
  for (let i = 0; i < 100_000_000; ++i) {
    Matrix4.multiply_ts(ma, mb, mr);
  }
  const t2 = performance.now();

  console.log(`WASM Time: ${(t1 - t0).toFixed(3)}ms`);
  console.log(`TS Time: ${(t2 - t1).toFixed(3)}ms`);
  console.log(`Speedup: ${((t2 - t1) / (t1 - t0)).toFixed(2)}`);
})();
```
Output:
```
WASM Time: 2058.740ms
TS Time: 8691.420ms
Speedup: 4.22
```
The results are exceptional. The WebAssembly implementation is 4.22 times as fast as the TypeScript implementation!

## Memory management insights and challenges
Tests have shown that if the Vector3, Quaternion, and Matrix4 classes are not written with efficient memory management in mind from the start, any speed advantage gained by using WebAssembly is negated by the necessary marshaling between JavaScript and WebAssembly.

Therefore each class has a dedicated memory space within the WebAssembly memory. In this configuration there are 6 pages, each 64 KB in size. Each part could hold up to 4096 instances of the respective class.

WebAssembly Text: **math.wat**
```
(memory (export "memory") 6) ;; 6 pages each 64 KB in size, 384 KB total
;; Page   0: 0x00000 - 0x0FFFF  (64 KB): Vector3 storage
;; Page   1: 0x10000 - 0x1FFFF  (64 KB): Quaternion storage
;; Page 2-5: 0x20000 - 0x5FFFF (256 KB): Matrix4 storage
```
Instances meant for long-term storage are placed at the top of the storage space for each class. Temporary instances are placed at the bottom with an additional offset counter. This way, the "free space search" algorithm leads to less fragmentation and faster allocation.

### Disposable instances and the using keyword
You can create up to 4096 instances of each class. Classes cannot be automatically garbage collected because each JavaScript instance is married to a memory area in the WebAssembly. If you create a new instance, you must also dispose of it manually. The easiest way to do this, is to use the `using` keyword.

Example:
```ts
function calculateSomething() {
  using v1 = new Vector3(1, 2, 3);
  using v2 = new Vector3(4, 5, 6);
  using result = new Vector3(); // provided result instance

  Vector3.cross(v1, v2, result);
  console.log(result.print());
}
```
All functions, that produce a result of a Vector3, Quaternion, or Matrix4 instance, have an optional parameter for the result. This way you can reuse instances and avoid creating unnecessary temporary ones. But even then, you are responsible for deleting these instances.

Example:
```ts
function calculateSomething() {
  using v1 = new Vector3(1, 2, 3);
  using v2 = new Vector3(4, 5, 6);

  // An automatically created result instance is used.
  // This instance still needs to be cleaned up manually.
  using result = Vector3.cross(v1, v2);
  console.log(result.print());
}
```
You can't use the `using` keyword, if you want to return an instance from a function created inside the function itself. In this case you can either create a new instance before and pass it to the function or use `const` inside and `using` outside the function.

Example:
```ts
function calculateSomething() {
  using v1 = new Vector3(1, 2, 3);
  using v2 = new Vector3(4, 5, 6);

  return Vector3.cross(v1, v2);
}

function main() {
  using result = calculateSomething();
  console.log(result.print());
}
```
If you really have to, you can manually call the `Symbol.dispose` method of an instance. However you cannot use the instance afterwards.

Example:
```ts
const v1 = new Vector3(1, 2, 3);
// Do something with v1
v1[Symbol.dispose]();
// v1 is now unusable
```

## License
[MIT License](./LICENSE)
