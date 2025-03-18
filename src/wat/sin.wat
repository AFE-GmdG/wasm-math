(module $sin
  (type $trig (func (param f32) (result f32)))
  (type $mod (func (param f32 f32) (result f32)))

  (memory 1)

  (func $taylor (type $trig) (param $x f32) (result f32)
    (local $tmp f32)
    (local $vec v128)
    ;; My taylor series approximation of sin(x)
    ;; sin(x) = x * (1 - x^2 / 6 + x^4 / 120 - x^6 / 5040 + x^8 / 362880)
    ;; I want to calculate the four divisions via vector instructions

    local.get $x               ;; S x
    f32.const 1                ;; S x, 1

    ;; x^2, x^4, x^6, x^8
    local.get $x               ;; S x, 1, x
    local.get $x               ;; S x, 1, x, x
    f32.mul                    ;; S x, 1, x^2
    local.tee $tmp             ;; S x, 1, x^2
    f32x4.splat                ;; S x, 1, (x^2, x^2, x^2, x^2)
    local.get $tmp             ;; S x, 1, (x^2, x^2, x^2, x^2), x^2
    local.get $tmp             ;; S x, 1, (x^2, x^2, x^2, x^2), x^2, x^2
    f32.mul                    ;; S x, 1, (x^2, x^4, x^2, x^2), x^4
    local.tee $tmp             ;; S x, 1, (x^2, x^4, x^2, x^2), x^4
    f32x4.replace_lane 1       ;; S x, 1, (x^2, x^4, x^2, x^2)
    local.get $tmp             ;; S x, 1, (x^2, x^4, x^2, x^2), x^4
    local.get $x               ;; S x, 1, (x^2, x^4, x^2, x^2), x^4, x
    local.get $x               ;; S x, 1, (x^2, x^4, x^2, x^2), x^4, x, x
    f32.mul                    ;; S x, 1, (x^2, x^4, x^2, x^2), x^4, x^2
    f32.mul                    ;; S x, 1, (x^2, x^4, x^6, x^2), x^6
    f32x4.replace_lane 2       ;; S x, 1, (x^2, x^4, x^6, x^2)
    local.get $tmp             ;; S x, 1, (x^2, x^4, x^6, x^2), x^4
    local.get $tmp             ;; S x, 1, (x^2, x^4, x^6, x^2), x^4, x^4
    f32.mul                    ;; S x, 1, (x^2, x^4, x^6, x^2), x^8
    f32x4.replace_lane 3       ;; S x, 1, (x^2, x^4, x^6, x^8)

    ;; (6, 120, 5040, 362880)
    f32.const 6                ;; S x, 1, (x^2, x^4, x^6, x^8), 6
    f32x4.splat                ;; S x, 1, (x^2, x^4, x^6, x^8), (6, 6, 6, 6)
    f32.const 120              ;; S x, 1, (x^2, x^4, x^6, x^8), (6, 6, 6, 6), 120
    f32x4.replace_lane 1       ;; S x, 1, (x^2, x^4, x^6, x^8), (6, 120, 6, 6)
    f32.const 5040             ;; S x, 1, (x^2, x^4, x^6, x^8), (6, 120, 6, 6), 5040
    f32x4.replace_lane 2       ;; S x, 1, (x^2, x^4, x^6, x^8), (6, 120, 5040, 6)
    f32.const 362880           ;; S x, 1, (x^2, x^4, x^6, x^8), (6, 120, 5040, 6), 362880
    f32x4.replace_lane 3       ;; S x, 1, (x^2, x^4, x^6, x^8), (6, 120, 5040, 362880)

    ;; (x^2 / 6, x^4 / 120, x^6 / 5040, x^8 / 362880)
    f32x4.div                  ;; S x, 1, (x^2 / 6, x^4 / 120, x^6 / 5040, x^8 / 362880)
    local.tee $vec             ;; S x, 1, (x^2 / 6, x^4 / 120, x^6 / 5040, x^8 / 362880)

    ;; 1 - x^2 / 6 + x^4 / 120 - x^6 / 5040 + x^8 / 362880
    f32x4.extract_lane 0       ;; S x, 1, x^2 / 6
    f32.sub                    ;; S x, (1 - x^2 / 6)
    local.get $vec             ;; S x, (1 - x^2 / 6), (x^2 / 6, x^4 / 120, x^6 / 5040, x^8 / 362880)
    f32x4.extract_lane 1       ;; S x, (1 - x^2 / 6), x^4 / 120
    f32.add                    ;; S x, (1 - x^2 / 6 + x^4 / 120)
    local.get $vec             ;; S x, (1 - x^2 / 6 + x^4 / 120), (x^2 / 6, x^4 / 120, x^6 / 5040, x^8 / 362880)
    f32x4.extract_lane 2       ;; S x, (1 - x^2 / 6 + x^4 / 120), x^6 / 5040
    f32.sub                    ;; S x, (1 - x^2 / 6 + x^4 / 120 - x^6 / 5040)
    local.get $vec             ;; S x, (1 - x^2 / 6 + x^4 / 120 - x^6 / 5040), (x^2 / 6, x^4 / 120, x^6 / 5040, x^8 / 362880)
    f32x4.extract_lane 3       ;; S x, (1 - x^2 / 6 + x^4 / 120 - x^6 / 5040), x^8 / 362880
    f32.add                    ;; S x, (1 - x^2 / 6 + x^4 / 120 - x^6 / 5040 + x^8 / 362880)

    ;; x * (...)
    f32.mul                    ;; S (x * (...))
  )

  (func $mySin (export "mySin") (type $trig) (param $x f32) (result f32)
    ;; (local $tmp f32)
    ;; Use the modulo function to get the input x in the range of -π to π
    local.get $x                       ;; S x
    ;; put τ on stack
    f32.const 6.283185307179586        ;; S x, τ
    ;; x % τ
    call $mod                          ;; S (x % τ) => x'
    local.tee $x                       ;; S x'
    f32.const 3.1415926535897932       ;; S x', π
    f32.ge                             ;; S (x' >= π)
    ;; if x' >= π
    if
      ;; x' = x' - τ
      local.get $x                     ;; S x'
      f32.const 6.283185307179586      ;; S x', π, τ
      f32.sub                          ;; S (x' - τ)
      local.set $x                     ;; x' is now x in Range {-π, π}
    end
    ;; Reduction from {-π, π} to {-π/2, π/2}
    ;; Three cases:
    ;; 1) x' > π/2 => sin(x') = sin(π - x')
    ;; 2) x' < -π/2 => sin(x') = sin(-π - x')
    ;; 3) else => sin(x') = sin(x')

    ;; if x' > π/2
    local.get $x                       ;; S x'
    f32.const 1.5707963267948966       ;; S x', π/2
    f32.gt                             ;; S (x' > π/2)
    if
      ;; sin(x) = sin(π - x')
      f32.const 3.1415926535897932     ;; S π
      local.get $x                     ;; S π, x'
      f32.sub                          ;; S (π - x')
      call $taylor                     ;; S sin(π - x')
      return
    end

    ;; if x' < -π/2
    local.get $x                       ;; S x'
    f32.const -1.5707963267948966      ;; S x', -π/2
    f32.lt                             ;; S (x' < -π/2)
    if
      ;; sin(x) = sin(-π - x')
      f32.const -3.1415926535897932    ;; S -π
      local.get $x                     ;; S -π, x'
      f32.sub                          ;; S (-π - x')
      call $taylor                     ;; S sin(-π - x')
      return
    end

    ;; else sin(x) = sin(x')
    local.get $x                       ;; S x'
    call $taylor                       ;; S sin(x')
  )

  (func $mod (export "mod") (type $mod) (param $x f32) (param $y f32) (result f32)
    (local $tmp f32)
    local.get $x   ;; S x
    local.get $x   ;; S x, x
    local.get $y   ;; S x, x, y
    f32.div        ;; S x, (x / y)
    f32.trunc      ;; S x, (x / y) truncated
    local.get $y   ;; S x, floor(x / y), y
    f32.mul        ;; S x, (floor(x / y) * y)
    f32.sub        ;; S (x % y)
    local.tee $tmp ;; S (x % y)
    f32.const 0    ;; S (x % y), 0
    f32.lt         ;; S (x % y < 0)
    if
      local.get $tmp ;; S (x % y)
      local.get $y ;; S (x % y), y
      f32.add      ;; S (x % y + y)
      return
    end
    local.get $tmp ;; S (x % y)
  )
)
