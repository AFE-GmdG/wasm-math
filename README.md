# wasm-math - WebAssembly Math Library

`wasm-math` is a powerful library for vector, quaternion, and matrix operations, developed with TypeScript and handwritten WebAssembly (\*.wat). It is specifically optimized for WebGPU-based games and web applications, utilizing the [SIMD (Single Instruction, Multiple Data)](https://github.com/WebAssembly/simd/blob/master/proposals/simd/SIMD.md) instruction extension of WebAssembly for maximum performance. It's tested against the latest Chrome and Firefox versions.

## Features
- **Vector Operations**: Support for basic operations such as addition, subtraction, cross and dot product, squared and normal vector length, normalization and more.
- **Quaternion Operations**: *TODO*
- **Matrix Operations**: *TODO*
- **SIMD WebAssembly**: Handwritten SIMD operations for maximum performance. The individual assembly operations are reduced to the absolute minimum to maximize execution speed. Comparisons with `Emscripten` and `C` code showed significantly longer code, more frequent read and write accesses, and thus lower performance.
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
    using result = new Vector3(true); // true: temporary

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

An `Emscripten`-compiled C code comparison will be added soon.

A cross product isn't that complex. However, if the performance gain is already 3x for this simple operation, the gain for more complex operations like matrix-matrix multiplication will be even higher.

## Memory management insights and challenges
Tests have shown that if the Vector3, Quaternion, and Matrix4 classes are not written with memory management from the start, any speed advantage gained by using WebAssembly is negated by the necessary marshaling between JavaScript and WebAssembly.

Therefore each class has a dedicated memory space within the WebAssembly memory. In this configuration there are 6 Pages, each with 64KB. Each part could hold up to 4096 instances of the respective class.

WebAssembly Text: **math.wat**
```
(memory (export "memory") 6) ;; 6 pages of 64 KB each. 384 KB total
;; Page   0: 0x00000 - 0x0FFFF  (64 KB): Vector3 storage
;; Page   1: 0x10000 - 0x1FFFF  (64 KB): Quaternion storage
;; Page 2-5: 0x20000 - 0x5FFFF (256 KB): Matrix4 storage
```
Instances meant for long-term storage are placed at the top of the storage space for each class. Temporary instances are placed at the bottom with an additional offset counter. This way, the "free space search" algorithm leads to less fragmentation and faster allocation.

## License
[MIT License](./LICENSE)
