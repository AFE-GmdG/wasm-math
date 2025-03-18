# WebAssembly Challenges

## Trigonometric functions
Some of the calculations need trigonometric functions. These are not available in WebAssembly by default.

There are some ways to solve this problem:
1. **Import them from JavaScript**:
  This is the easiest way to solve the problem. However, it adds additional marshalling overhead. A test with `Vector3.angle` and `Vector3.angle_ts` shows that the pure TypeScript version is slightly faster than the WebAssembly version if the trigonometric functions are called from JavaScript.
2. **Implement them in WebAssembly (Taylor Approximation)**:
  Implement trigonometric functions in WebAssembly using the `Taylor Approximation`. A test with the `sin` function alone shows that a pure WebAssembly implementation ([see sin.wat](./sin.wat)) is about 6 to 8 times slower than calling the JavaScript `Math.sin` function. This may differ from browser to browser; however, a pure WebAssembly implementation seems always to be the slowest.
3. **Implement them in WebAssembly (Lookup Table)**:
  Using a lookup table might be faster than the Taylor approximation. However, a reliable test is still pending. The additional space for the lookup tables (`sin` and `cos` could share the same table, `acos` must have its own) is not a problem at all. The lookup table must be big enough to provide good accuracy. A version with fewer entries but a linear interpolation between the entries might be a good compromise between speed and accuracy. However, for a single function call, I have to do two lookups and a linear interpolation. This - again - might be slower than a JavaScript import.

## Conclusion
For now, I implement trigonometric calls via JavaScript imports. Since I provide most - if not all - functions in both WebAssembly and pure TypeScript, you can decide from case to case which version you want to use.
