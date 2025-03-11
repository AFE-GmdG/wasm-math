(module $math
  (type $offsetRf32 (func (param i32) (result f32)))
  (type $offsetX2 (func (param i32 i32)))
  (type $offsetX2Rf32 (func (param i32 i32) (result f32)))
  (type $offsetX3 (func (param i32 i32 i32)))

  (memory (export "memory") 6) ;; 6 pages of 64 KB each. 384 KB total
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
)
