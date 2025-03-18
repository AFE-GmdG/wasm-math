(module $math
  (type $importTrig (func (param f32) (result f32)))
  (type $offsetRf32 (func (param i32) (result f32)))
  (type $offsetX2 (func (param i32 i32)))
  (type $offsetX2Rf32 (func (param i32 i32) (result f32)))
  (type $offsetX3 (func (param i32 i32 i32)))
  (type $quatDataOffset (func (param f32 f32 f32 f32 i32)))

  (import "env" "sin" (func $sin (type $importTrig)))
  (import "env" "cos" (func $cos (type $importTrig)))
  (import "env" "acos" (func $acos (type $importTrig)))

  (memory (export "memory") 6 6) ;; 6 pages of 64 KB each. 384 KB total
  ;; Page   0: 0x00000 - 0x0FFFF  (64 KB): Vector3 storage
  ;; Page   1: 0x10000 - 0x1FFFF  (64 KB): Quaternion storage
  ;; Page 2-5: 0x20000 - 0x5FFFF (256 KB): Matrix4 storage

  (func $vAdd (export "vAdd") (type $offsetX3) (param $offsetA i32) (param $offsetB i32) (param $offsetResult i32)
    local.get $offsetResult ;; S offsetResult
    local.get $offsetA      ;; S offsetResult, offsetA
    v128.load               ;; S offsetResult, A
    local.get $offsetB      ;; S offsetResult, A, offsetB
    v128.load               ;; S offsetResult, A, B
    f32x4.add               ;; S offsetResult, Result
    v128.store              ;; S -
  )

  (func $vSub (export "vSub") (type $offsetX3) (param $offsetA i32) (param $offsetB i32) (param $offsetResult i32)
    local.get $offsetResult ;; S offsetResult
    local.get $offsetA      ;; S offsetResult, offsetA
    v128.load               ;; S offsetResult, A
    local.get $offsetB      ;; S offsetResult, A, offsetB
    v128.load               ;; S offsetResult, A, B
    f32x4.sub               ;; S offsetResult, Result
    v128.store              ;; S -
  )

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

  (func $vDot (export "vDot") (type $offsetX2Rf32) (param $offsetA i32) (param $offsetB i32) (result f32)
    (local $tmp v128)
    local.get $offsetA      ;; S offsetA
    v128.load               ;; S A
    local.get $offsetB      ;; S A, offsetB
    v128.load               ;; S A, B
    f32x4.mul               ;; S (A * B)
    local.tee $tmp          ;; S (A * B)
    f32x4.extract_lane 0    ;; S (A * B)[0]
    local.get $tmp          ;; S (A * B)[0], (A * B)
    f32x4.extract_lane 1    ;; S (A * B)[0], (A * B)[1]
    f32.add                 ;; S (A * B)[0] + (A * B)[1]
    local.get $tmp          ;; S (A * B)[0] + (A * B)[1], (A * B)
    f32x4.extract_lane 2    ;; S (A * B)[0] + (A * B)[1], (A * B)[2]
    f32.add                 ;; S dotProduct
  )

  (func $vLength (export "vLength") (type $offsetRf32) (param $offsetA i32) (result f32)
    local.get $offsetA      ;; S offsetA
    call $vLengthSquared    ;; S lengthSquared
    f32.sqrt                ;; S length
  )

  (func $vLengthSquared (export "vLengthSquared") (type $offsetRf32) (param $offsetA i32) (result f32)
    (local $tmp v128)
    local.get $offsetA      ;; S offsetA
    v128.load               ;; S A
    local.get $offsetA      ;; S offsetA
    v128.load               ;; S A, A
    f32x4.mul               ;; S (A * A)
    local.tee $tmp          ;; S (A * A)
    f32x4.extract_lane 0    ;; S (A * A)[0]
    local.get $tmp          ;; S (A * A)[0], (A * A)
    f32x4.extract_lane 1    ;; S (A * A)[0], (A * A)[1]
    f32.add                 ;; S (A * A)[0] + (A * A)[1]
    local.get $tmp          ;; S (A * A)[0] + (A * A)[1], (A * A)
    f32x4.extract_lane 2    ;; S (A * A)[0] + (A * A)[1], (A * A)[2]
    f32.add                 ;; S lengthSquared
  )

  (func $vLengthSquaredRounded (type $offsetRf32) (param $offsetA i32) (result f32)
    local.get $offsetA      ;; S offsetA
    call $vLengthSquared    ;; S lengthSquared
    ;; Round to 6 decimal places
    f32.const 1000000        ;; S lengthSquared, 1000000
    f32.mul                  ;; S lengthSquared * 1000000
    f32.nearest              ;; S lengthSquared * 1000000 (rounded)
    f32.const 1000000        ;; S lengthSquared * 1000000 (rounded), 1000000
    f32.div                  ;; S lengthSquared (rounded)
  )

  (func $vNormalize (export "vNormalize") (type $offsetX2) (param $offsetA i32) (param $offsetResult i32)
    (local $lengthSquared f32)

    ;; const lengthSquared = x * x + y * y + z * z;
    local.get $offsetA          ;; S offsetA
    call $vLengthSquaredRounded ;; S lengthSquared
    local.set $lengthSquared    ;; S -

    ;; if (lengthSquared === 0) {
    ;;   return new Vector3(0, 0, 0); // Using the offsetResult
    ;; }
    (block $lseq0
      local.get $lengthSquared  ;; S lengthSquared
      f32.const 0               ;; S lengthSquared, 0
      f32.gt                    ;; S lengthSquared > 0
      br_if $lseq0              ;; S -
      ;; lengthSquared is 0
      local.get $offsetResult   ;; S offsetResult
      v128.const f32x4 0 0 0 0  ;; S offsetResult, (0, 0, 0, 0)
      v128.store                ;; S -
      return
    )

    ;; if (lengthSquared === 1) {
    ;;   return new Vector3(vectorA); // Using the offsetResult
    ;; }
    (block $lseq1
      local.get $lengthSquared  ;; S lengthSquared
      f32.const 1               ;; S lengthSquared, 1
      f32.ne                    ;; S lengthSquared != 1
      br_if $lseq1              ;; S -
      local.get $offsetResult   ;; S offsetResult
      local.get $offsetA        ;; S offsetResult, offsetA
      v128.load                 ;; S offsetResult, A
      v128.store                ;; S -
      return
    )

    ;; load the result offset
    local.get $offsetResult     ;; S offsetResult

    ;; load the vector to normalize
    local.get $offsetA          ;; S offsetResult, offsetA
    v128.load                   ;; S offsetResult, A

    ;; const invLength = 1 / Math.sqrt(lengthSquared);
    f32.const 1                 ;; S offsetResult, A, 1
    local.get $lengthSquared    ;; S offsetResult, A, 1, lengthSquared
    f32.sqrt                    ;; S offsetResult, A, 1, sqrt(lengthSquared)
    f32.div                     ;; S offsetResult, A, invLength
    f32x4.splat                 ;; S offsetResult, A, (invLength, invLength, invLength, invLength)

    ;; v128 multiply
    f32x4.mul                   ;; S offsetResult, result
    v128.store                  ;; S -
  )

  (func $vScaleVector (export "vScaleVector") (type $offsetX3) (param $offsetA i32) (param $offsetB i32) (param $offsetResult i32)
    local.get $offsetResult ;; S offsetResult
    local.get $offsetA      ;; S offsetResult, offsetA
    v128.load               ;; S offsetResult, A
    local.get $offsetB      ;; S offsetResult, A, offsetB
    v128.load               ;; S offsetResult, A, B
    f32x4.mul               ;; S offsetResult, Result
    v128.store              ;; S -
  )

  (func $vAngle (export "vAngle") (type $offsetX2Rf32) (param $offsetA i32) (param $offsetB i32) (result f32)
    (local $tmp v128)

    ;; Return 0 if offsetA and offsetB are the same
    (block $eq1
      local.get $offsetA      ;; S offsetA
      local.get $offsetB      ;; S offsetA, offsetB
      i32.ne                  ;; S offsetA != offsetB
      br_if $eq1               ;; S -
      f32.const 0.0           ;; S 0.0
      return
    )

    ;; Return 0 if all components of offsetA and offsetB are the same
    (block $eq2
      local.get $offsetA      ;; S offsetA
      v128.load               ;; S A
      local.get $offsetB      ;; S A, offsetB
      v128.load               ;; S A, B
      f32x4.eq                ;; S (A[0] == B[0], A[1] == B[1], A[2] == B[2], A[3] == B[3])
      i32x4.all_true          ;; S A == B (all components)
      br_if $eq2              ;; S -

      ;; Assume, each vector is normalized. This may not be the case.
      ;; Calculate the dot product of the two vectors
      local.get $offsetA      ;; S offsetA
      v128.load               ;; S A
      local.get $offsetB      ;; S A, offsetB
      v128.load               ;; S A, B
      f32x4.mul               ;; S (A * B)
      local.tee $tmp          ;; S (A * B)
      f32x4.extract_lane 0    ;; S (A * B)[0]
      local.get $tmp          ;; S (A * B)[0], (A * B)
      f32x4.extract_lane 1    ;; S (A * B)[0], (A * B)[1]
      f32.add                 ;; S (A * B)[0] + (A * B)[1]
      local.get $tmp          ;; S (A * B)[0] + (A * B)[1], (A * B)
      f32x4.extract_lane 2    ;; S (A * B)[0] + (A * B)[1], (A * B)[2]
      f32.add                 ;; S dotProduct

      ;; acos(dotProduct) = angle
      call $acos              ;; S angle
      return
    )

    ;; All components are the same
    ;; Return 0
    f32.const 0.0
  )

  (func $mCreateRotQuat (export "mCreateRotQuat") (type $offsetX2) (param $offsetQuat i32) (param $offsetResult i32)
    ;; Create a rotation matrix from a quaternion.
    ;; This method reads the quaternion and uses the function $mCreateRotQuatData to create the matrix.

    ;; local quaternion variable
    (local $quat v128)

    ;; Load the quaternion
    local.get $offsetQuat       ;; S offsetQuat
    v128.load                   ;; S quat

    ;; set the quaternion to the local variable and keep it on the stack
    local.tee $quat             ;; S quat

    ;; put $quat.x on the stack
    f32x4.extract_lane 0        ;; S x

    ;; put $quat.y on the stack
    local.get $quat             ;; S x, quat
    f32x4.extract_lane 1        ;; S x, y

    ;; put $quat.z on the stack
    local.get $quat             ;; S x, y, quat
    f32x4.extract_lane 2        ;; S x, y, z

    ;; put $quat.w on the stack
    local.get $quat             ;; S x, y, z, quat
    f32x4.extract_lane 3        ;; S x, y, z, w

    ;; put the offsetResult on the stack
    local.get $offsetResult     ;; S x, y, z, w, offsetResult

    ;; call the function $mCreateRotQuatData
    call $mCreateRotQuatData    ;; S -
  )

  (func $mCreateRotQuatData (export "mCreateRotQuatData") (type $quatDataOffset) (param $x f32) (param $y f32) (param $z f32) (param $w f32) (param $offsetResult i32)
    ;; Create a rotation matrix from quaternion data.

    ;; column major order matrix
    ;; | 1 - 2(yy + zz)       2(xy - wz)       2(xz + wy)   0 |
    ;; |     2(xy + wz)   1 - 2(xx + zz)       2(yz - wx)   0 |
    ;; |     2(xz - wy)       2(yz + wx)   1 - 2(xx + yy)   0 |
    ;; |              0                0                0   1 |

    ;; The algorithm in Typescript is:

    ;; const x2 = x + x; const y2 = y + y; const z2 = z + z;

    ;; const xx = x * x2; const xy = x * y2; const xz = x * z2;
    ;; const yy = y * y2; const yz = y * z2; const zz = z * z2;
    ;; const wx = w * x2; const wy = w * y2; const wz = w * z2;

    ;; dst.set([
    ;;   1 - (yy + zz), xy + wz, xz - wy, 0,
    ;;   xy - wz, 1 - (xx + zz), yz + wx, 0,
    ;;   xz + wy, yz - wx, 1 - (xx + yy), 0,
    ;;   0, 0, 0, 1
    ;; ]);

    ;; According to the distributive law, 2(a±b) = 2a±2b
    ;; So, we can simplify some in between calculations to reduce
    ;; the number of operations.
    ;; For example, instead of calculating 1 - 2(yy + zz) we can
    ;; calculate 1 - (2y² + 2z²)
    ;; We precalculate all necessary value combinations to reduce
    ;; the number of operations.

    ;; Further in WebAssembly we can utilize the SIMD instructions
    ;; to perform the calculations in parallel.

    ;; local variables:
    (local $2x_2y_2z_unused v128) ;; to store 2x, 2y, 2z, (unused)
    (local $tmp v128)             ;; to store temporary values
    (local $xx f32)               ;; to store xx
    (local $xy f32)               ;; to store xy
    (local $xz f32)               ;; to store xz
    (local $yy f32)               ;; to store yy
    (local $yz f32)               ;; to store yz
    (local $zz f32)               ;; to store zz
    (local $wx f32)               ;; to store wx
    (local $wy f32)               ;; to store wy
    (local $wz f32)               ;; to store wz

    ;; const x2 = x + x; const y2 = y + y; const z2 = z + z;
    ;; construct 2x, 2y, 2z, 0
    f32.const 0.0                 ;; S 0.0
    f32x4.splat                   ;; S (0.0, 0.0, 0.0, 0.0)
    local.get $x                  ;; S (0.0, 0.0, 0.0, 0.0), x
    f32x4.replace_lane 0          ;; S (x, 0.0, 0.0, 0.0)
    local.get $y                  ;; S (x, 0.0, 0.0, 0.0), y
    f32x4.replace_lane 1          ;; S (x, y, 0.0, 0.0)
    local.get $z                  ;; S (x, y, 0.0, 0.0), z
    f32x4.replace_lane 2          ;; S (x, y, z, 0.0)

    local.tee $2x_2y_2z_unused    ;; S (x, y, z, 0)
    local.get $2x_2y_2z_unused    ;; S (x, y, z, 0), (x, y, z, 0)
    f32x4.add                     ;; S (2x, 2y, 2z, 0)
    ;; update the local variable with the result and keep it on the stack
    local.tee $2x_2y_2z_unused    ;; S (2x, 2y, 2z, 0)

    ;; const xx = x * x2; const xy = x * y2; const xz = x * z2;
    ;; construct (x, x, x, x) - The 4th lane (x) can be ignored, it will be multiplied with 0
    local.get $x                  ;; S (2x, 2y, 2z, 0), x
    f32x4.splat                   ;; S (2x, 2y, 2z, 0), (x, x, x, x)
    f32x4.mul                     ;; S (xx, xy, xz, 0)
    local.tee $tmp                ;; S (xx, xy, xz, 0)
    f32x4.extract_lane 0          ;; S xx
    local.set $xx                 ;; S -
    local.get $tmp                ;; S (xx, xy, xz, 0)
    f32x4.extract_lane 1          ;; S xy
    local.set $xy                 ;; S -
    local.get $tmp                ;; S (xx, xy, xz, 0)
    f32x4.extract_lane 2          ;; S xz
    local.set $xz                 ;; S -

    ;; const yy = y * y2; const yz = y * z2; const zz = z * z2;
    ;; construct (y2, z2, z2, 0)
    local.get $2x_2y_2z_unused    ;; S (2x, 2y, 2z, 0)
    ;; Swizzle on Stack to (y2, z2, z2, _w2)
    v128.const i32x4 0x07060504 0x0b0a0908 0x0b0a0908 0x0f0e0d0c ;; S (2x, 2y, 2z, 0), swizzle params
    i8x16.swizzle                 ;; S (y2, z2, z2, 0)

    ;; construct y, y, z, y
    ;; The 3rd lane (z) must be set with replace_lane 2
    ;; The 4th lane (y) can be ignored, it will be multiplied with 0
    local.get $y                  ;; S (y2, z2, z2, 0), y
    f32x4.splat                   ;; S (y2, z2, z2, 0), (y, y, y, y)
    local.get $z                  ;; S (y2, z2, z2, 0), (y, y, y, y), z
    f32x4.replace_lane 2          ;; S (y2, z2, z2, 0), (y, y, z, y)
    f32x4.mul                     ;; S (yy, yz, zz, 0)
    local.tee $tmp                ;; S (yy, yz, zz, 0)
    f32x4.extract_lane 0          ;; S yy
    local.set $yy                 ;; S -
    local.get $tmp                ;; S (yy, yz, zz, 0)
    f32x4.extract_lane 1          ;; S yz
    local.set $yz                 ;; S -
    local.get $tmp                ;; S (yy, yz, zz, 0)
    f32x4.extract_lane 2          ;; S zz
    local.set $zz                 ;; S -

    ;; const wx = w * x2; const wy = w * y2; const wz = w * z2;
    ;; construct (w, w, w, w) - The 4th lane (w) can be ignored, it will be multiplied with 0
    local.get $2x_2y_2z_unused    ;; S (2x, 2y, 2z, 0)
    local.get $w                  ;; S (2x, 2y, 2z, 0), w
    f32x4.splat                   ;; S (2x, 2y, 2z, 0), (w, w, w, w)
    f32x4.mul                     ;; S (wx, wy, wz, 0)
    local.tee $tmp                ;; S (wx, wy, wz, 0)
    f32x4.extract_lane 0          ;; S wx
    local.set $wx                 ;; S -
    local.get $tmp                ;; S (wx, wy, wz, 0)
    f32x4.extract_lane 1          ;; S wy
    local.set $wy                 ;; S -
    local.get $tmp                ;; S (wx, wy, wz, 0)
    f32x4.extract_lane 2          ;; S wz
    local.set $wz                 ;; S -

    ;; put the offset result addresses for the matrix on the stack
    ;; construct (offsetResult + 48), (offsetResult + 32), (offsetResult + 16), offsetResult
    ;; put the offsetResult on the stack and add 48
    local.get $offsetResult       ;; S offsetResult
    i32.const 48                  ;; S offsetResult, 48
    i32.add                       ;; S (offsetResult + 48)
    ;; put the offsetResult on the stack and add 32
    local.get $offsetResult       ;; S (offsetResult + 48), offsetResult
    i32.const 32                  ;; S (offsetResult + 48), offsetResult, 32
    i32.add                       ;; S (offsetResult + 48), (offsetResult + 32)
    ;; put the offsetResult on the stack and add 16
    local.get $offsetResult       ;; S (offsetResult + 48), (offsetResult + 32), offsetResult
    i32.const 16                  ;; S (offsetResult + 48), (offsetResult + 32), offsetResult, 16
    i32.add                       ;; S (offsetResult + 48), (offsetResult + 32), (offsetResult + 16)
    ;; put the offsetResult on the stack
    local.get $offsetResult       ;; S (offsetResult + 48), (offsetResult + 32), (offsetResult + 16), offsetResult

    ;; dst.set([
    ;;   1 - (yy + zz), xy + wz, xz - wy, 0,
    ;;   xy - wz, 1 - (xx + zz), yz + wx, 0,
    ;;   xz + wy, yz - wx, 1 - (xx + yy), 0,
    ;;   0, 0, 0, 1
    ;; ]);

    ;; construct (1 - (yy + zz), xy + wz, xz - wy, 0)
    ;; construct (0, 0, 0, 0)
    f32.const 0.0                 ;; S (offsetResults...), 0.0
    f32x4.splat                   ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0)
    ;; calculate 1 - (yy + zz)
    f32.const 1.0                 ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), 1.0
    local.get $yy                 ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), 1.0, yy
    local.get $zz                 ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), 1.0, yy, zz
    f32.add                       ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), 1.0, (yy + zz)
    f32.sub                       ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), (1 - (yy + zz))
    f32x4.replace_lane 0          ;; S (offsetResults...), (1 - (yy + zz), 0.0, 0.0, 0.0)

    ;; calculate xy + wz
    local.get $xy                 ;; S (offsetResults...), (1 - (yy + zz), 0.0, 0.0, 0.0), xy
    local.get $wz                 ;; S (offsetResults...), (1 - (yy + zz), 0.0, 0.0, 0.0), xy, wz
    f32.add                       ;; S (offsetResults...), (1 - (yy + zz), xy + wz, 0.0, 0.0), (xy + wz)
    f32x4.replace_lane 1          ;; S (offsetResults...), (1 - (yy + zz), xy + wz, 0.0, 0.0)

    ;; calculate xz - wy
    local.get $xz                 ;; S (offsetResults...), (1 - (yy + zz), xy + wz, 0.0, 0.0), xz
    local.get $wy                 ;; S (offsetResults...), (1 - (yy + zz), xy + wz, 0.0, 0.0), xz, wy
    f32.sub                       ;; S (offsetResults...), (1 - (yy + yz), xy + wz, 0.0, 0.0), (xz - wy)
    f32x4.replace_lane 2          ;; S (offsetResults...), (1 - (yy + yz), xy + wz, xz - wy, 0.0)

    ;; store the first column
    v128.store                    ;; S (offsetResult + 48), (offsetResult + 32), (offsetResult + 16)

    ;; construct (xy - wz, 1 - (xx + zz), yz + wx, 0)
    ;; construct (0, 0, 0, 0)
    f32.const 0.0                 ;; S (offsetResults...), 0.0
    f32x4.splat                   ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0)

    ;; calculate xy - wz
    local.get $xy                 ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), xy
    local.get $wz                 ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), xy, wz
    f32.sub                       ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), (xy - wz)
    f32x4.replace_lane 0          ;; S (offsetResults...), (xy - wz, 0.0, 0.0, 0.0)

    ;; calculate 1 - (xx + zz)
    f32.const 1.0                 ;; S (offsetResults...), (xy - wz, 0.0, 0.0, 0.0), 1.0
    local.get $xx                 ;; S (offsetResults...), (xy - wz, 0.0, 0.0, 0.0), 1.0, xx
    local.get $zz                 ;; S (offsetResults...), (xy - wz, 0.0, 0.0, 0.0), 1.0, xx, zz
    f32.add                       ;; S (offsetResults...), (xy - wz, 0.0, 0.0, 0.0), 1.0, (xx + zz)
    f32.sub                       ;; S (offsetResults...), (xy - wz, 0.0, 0.0, 0.0), (1 - (xx + zz))
    f32x4.replace_lane 1          ;; S (offsetResults...), (xy - wz, 1 - (xx + zz), 0.0, 0.0)

    ;; calculate yz + wx
    local.get $yz                 ;; S (offsetResults...), (xy - wz, 1 - (xx + zz), 0.0, 0.0), yz
    local.get $wx                 ;; S (offsetResults...), (xy - wz, 1 - (xx + zz), 0.0, 0.0), yz, wx
    f32.add                       ;; S (offsetResults...), (xy - wz, 1 - (xx + zz), yz + wx, 0.0), (yz + wx)
    f32x4.replace_lane 2          ;; S (offsetResults...), (xy - wz, 1 - (xx + zz), yz + wx, 0.0)

    ;; store the second column
    v128.store                    ;; S (offsetResult + 48), (offsetResult + 32)

    ;; construct (xz + wy, yz - wx, 1 - (xx + yy), 0)
    ;; construct (0, 0, 0, 0)
    f32.const 0.0                 ;; S (offsetResults...), 0.0
    f32x4.splat                   ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0)

    ;; calculate xz + wy
    local.get $xz                 ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), xz
    local.get $wy                 ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), xz, wy
    f32.add                       ;; S (offsetResults...), (0.0, 0.0, 0.0, 0.0), (xz + wy)
    f32x4.replace_lane 0          ;; S (offsetResults...), (xz + wy, 0.0, 0.0, 0.0)

    ;; calculate yz - wx
    local.get $yz                 ;; S (offsetResults...), (xz + wy, 0.0, 0.0, 0.0), yz
    local.get $wx                 ;; S (offsetResults...), (xz + wy, 0.0, 0.0, 0.0), yz, wx
    f32.sub                       ;; S (offsetResults...), (xz + wy, 0.0, 0.0, 0.0), (yz - wx)
    f32x4.replace_lane 1          ;; S (offsetResults...), (xz + wy, yz - wx, 0.0, 0.0)

    ;; calculate 1 - (xx + yy)
    f32.const 1.0                 ;; S (offsetResults...), (xz + wy, yz - wx, 0.0, 0.0), 1.0
    local.get $xx                 ;; S (offsetResults...), (xz + wy, yz - wx, 0.0, 0.0), 1.0, xx
    local.get $yy                 ;; S (offsetResults...), (xz + wy, yz - wx, 0.0, 0.0), 1.0, xx, yy
    f32.add                       ;; S (offsetResults...), (xz + wy, yz - wx, 0.0, 0.0), 1.0, (xx + yy)
    f32.sub                       ;; S (offsetResults...), (xz + wy, yz - wx, 0.0, 0.0), (1 - (xx + yy))
    f32x4.replace_lane 2          ;; S (offsetResults...), (xz + wy, yz - wx, 1 - (xx + yy), 0.0)

    ;; store the third column
    v128.store                    ;; S (offsetResult + 48)

    ;; construct (0, 0, 0, 1)
    f32.const 0.0                 ;; S 0.0
    f32x4.splat                   ;; S (0.0, 0.0, 0.0, 0.0)
    f32.const 1.0                 ;; S (0.0, 0.0, 0.0, 0.0), 1.0
    f32x4.replace_lane 3          ;; S (0.0, 0.0, 0.0, 1.0)

    ;; store the fourth column
    v128.store                    ;; S -
  )
)
