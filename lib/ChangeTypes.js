// The text to identify rules for each possible step that can be taken

module.exports = {
  NO_CHANGE: 'NO_CHANGE',

  // ARITHMETIC

  // e.g. 2 + 2 -> 4 or 2 * 2 -> 4
  SIMPLIFY_ARITHMETIC: 'SIMPLIFY_ARITHMETIC',

  // BASICS

  // e.g. 2/-1 -> -2
  DIVISION_BY_NEGATIVE_ONE: 'DIVISION_BY_NEGATIVE_ONE',
  // e.g. 2/1 -> 2
  DIVISION_BY_ONE: 'DIVISION_BY_ONE',
  // e.g. x * 0 -> 0
  MULTIPLY_BY_ZERO: 'MULTIPLY_BY_ZERO',
  // e.g. x * 2 -> 2x
  REARRANGE_COEFF: 'REARRANGE_COEFF',
  // e.g. x ^ 0 -> 1
  REDUCE_EXPONENT_BY_ZERO: 'REDUCE_EXPONENT_BY_ZERO',
  // e.g. 0/1 -> 0
  REDUCE_ZERO_NUMERATOR: 'REDUCE_ZERO_NUMERATOR',
  // e.g. 2 + 0 -> 2
  REMOVE_ADDING_ZERO: 'REMOVE_ADDING_ZERO',
  // e.g. x ^ 1 -> x
  REMOVE_EXPONENT_BY_ONE: 'REMOVE_EXPONENT_BY_ONE',
  // e.g. 1 ^ x -> 1
  REMOVE_EXPONENT_BASE_ONE: 'REMOVE_EXPONENT_BASE_ONE',
  // e.g. x * -1 -> -x
  REMOVE_MULTIPLYING_BY_NEGATIVE_ONE: 'REMOVE_MULTIPLYING_BY_NEGATIVE_ONE',
  // e.g. x * 1 -> x
  REMOVE_MULTIPLYING_BY_ONE: 'REMOVE_MULTIPLYING_BY_ONE',
  // e.g. 2 - - 3 -> 2 + 3
  RESOLVE_DOUBLE_MINUS: 'RESOLVE_DOUBLE_MINUS',

  // COLLECT AND COMBINE AND BREAK UP

  // e.g. 2 + x + 3 + x -> 5 + 2x
  COLLECT_AND_COMBINE_LIKE_TERMS: 'COLLECT_AND_COMBINE_LIKE_TERMS',
  // e.g. x + 2 + x^2 + x + 4 -> x^2 + (x + x) + (4 + 2)
  COLLECT_LIKE_TERMS: 'COLLECT_LIKE_TERMS',

  // MULTIPLYING CONSTANT POWERS
  // e.g. 10^2 * 10^3 -> 10^(2+3)
  COLLECT_CONSTANT_EXPONENTS: 'COLLECT_CONSTANT_EXPONENTS',

  // ADDING POLYNOMIALS

  // e.g. 2x + x -> 2x + 1x
  ADD_COEFFICIENT_OF_ONE: 'ADD_COEFFICIENT_OF_ONE',
  // e.g. x^2 + x^2 -> 2x^2
  ADD_POLYNOMIAL_TERMS: 'ADD_POLYNOMIAL_TERMS',
  // e.g. 2x^2 + 3x^2 + 5x^2 -> (2+3+5)x^2
  GROUP_COEFFICIENTS: 'GROUP_COEFFICIENTS',
  // e.g. -x + 2x => -1*x + 2x
  UNARY_MINUS_TO_NEGATIVE_ONE: 'UNARY_MINUS_TO_NEGATIVE_ONE',

  // MULTIPLYING POLYNOMIALS

  // e.g. x^2 * x -> x^2 * x^1
  ADD_EXPONENT_OF_ONE: 'ADD_EXPONENT_OF_ONE',
  // e.g. x^2 * x^3 * x^1 -> x^(2 + 3 + 1)
  COLLECT_POLYNOMIAL_EXPONENTS: 'COLLECT_POLYNOMIAL_EXPONENTS',
  // e.g. 2x * 3x -> (2 * 3)(x * x)
  MULTIPLY_COEFFICIENTS: 'MULTIPLY_COEFFICIENTS',
  // e.g. 2x * x -> 2x ^ 2
  MULTIPLY_POLYNOMIAL_TERMS: 'MULTIPLY_POLYNOMIAL_TERMS',

  // FRACTIONS

  // e.g. (x + 2)/2 -> x/2 + 2/2
  BREAK_UP_FRACTION: 'BREAK_UP_FRACTION',
  // e.g. -2/-3 => 2/3
  CANCEL_MINUSES: 'CANCEL_MINUSES',
  // e.g. 2x/2 -> x
  CANCEL_TERMS: 'CANCEL_TERMS',
  // e.g. 2/6 -> 1/3
  SIMPLIFY_FRACTION: 'SIMPLIFY_FRACTION',
  // e.g. 2/-3 -> -2/3
  SIMPLIFY_SIGNS: 'SIMPLIFY_SIGNS',
  // e.g. 15/6 -> (5*3)/(2*3)
  FIND_GCD: 'FIND_GCD',
  // e.g. (5*3)/(2*3) -> 5/2
  CANCEL_GCD: 'CANCEL_GCD',
  // e.g. 1 2/3 -> 5/3
  CONVERT_MIXED_NUMBER_TO_IMPROPER_FRACTION: 'CONVERT_MIXED_NUMBER_TO_IMPROPER_FRACTION',
  // e.g. 1 2/3 -> ((1 * 3) + 2) / 3
  IMPROPER_FRACTION_NUMERATOR: 'IMPROPER_FRACTION_NUMERATOR',

  // ADDING FRACTIONS

  // e.g. 1/2 + 1/3 -> 5/6
  ADD_FRACTIONS: 'ADD_FRACTIONS',
  // e.g. (1 + 2)/3 -> 3/3
  ADD_NUMERATORS: 'ADD_NUMERATORS',
  // e.g. (2+1)/5
  COMBINE_NUMERATORS: 'COMBINE_NUMERATORS',
  // e.g. 2/6 + 1/4 -> (2*2)/(6*2) + (1*3)/(4*3)
  COMMON_DENOMINATOR: 'COMMON_DENOMINATOR',
  // e.g. 3 + 1/2 -> 6/2 + 1/2 (for addition)
  CONVERT_INTEGER_TO_FRACTION: 'CONVERT_INTEGER_TO_FRACTION',
  // e.g. 1.2 + 1/2 -> 1.2 + 0.5
  DIVIDE_FRACTION_FOR_ADDITION: 'DIVIDE_FRACTION_FOR_ADDITION',
  // e.g. (2*2)/(6*2) + (1*3)/(4*3) -> (2*2)/12 + (1*3)/12
  MULTIPLY_DENOMINATORS: 'MULTIPLY_DENOMINATORS',
  // e.g. (2*2)/12 + (1*3)/12 -> 4/12 + 3/12
  MULTIPLY_NUMERATORS: 'MULTIPLY_NUMERATORS',

  // MULTIPLYING FRACTIONS

  // e.g. 1/2 * 2/3 -> 2/6
  MULTIPLY_FRACTIONS: 'MULTIPLY_FRACTIONS',

  // DIVISION

  // e.g. 2/3/4 -> 2/(3*4)
  SIMPLIFY_DIVISION: 'SIMPLIFY_DIVISION',
  // e.g. x/(2/3) -> x * 3/2
  MULTIPLY_BY_INVERSE: 'MULTIPLY_BY_INVERSE',

  // DISTRIBUTION

  // e.g. 2(x + y) -> 2x + 2y
  DISTRIBUTE: 'DISTRIBUTE',
  // e.g. -(2 + x) -> -2 - x
  DISTRIBUTE_NEGATIVE_ONE: 'DISTRIBUTE_NEGATIVE_ONE',
  // e.g. 2 * 4x + 2*5 --> 8x + 10 (as part of distribution)
  SIMPLIFY_TERMS: 'SIMPLIFY_TERMS',
  // e.g. (nthRoot(x, 2))^2 -> nthRoot(x, 2) * nthRoot(x, 2)
  // e.g. (2x + 3)^2 -> (2x + 3) (2x + 3)
  EXPAND_EXPONENT: 'EXPAND_EXPONENT',

  // ABSOLUTE
  // e.g. |-3| -> 3
  ABSOLUTE_VALUE: 'ABSOLUTE_VALUE',

  // ROOTS
  // e.g. nthRoot(x ^ 2, 4) -> nthRoot(x, 2)
  CANCEL_EXPONENT: 'CANCEL_EXPONENT',
  // e.g. nthRoot(x ^ 2, 2) -> x
  CANCEL_EXPONENT_AND_ROOT: 'CANCEL_EXPONENT_AND_ROOT',
  // e.g. nthRoot(x ^ 4, 2) -> x ^ 2
  CANCEL_ROOT: 'CANCEL_ROOT',
  // e.g. nthRoot(2, 2) * nthRoot(3, 2) -> nthRoot(2 * 3, 2)
  COMBINE_UNDER_ROOT: 'COMBINE_UNDER_ROOT',
  // e.g. 2 * 2 * 2 -> 2 ^ 3
  CONVERT_MULTIPLICATION_TO_EXPONENT: 'CONVERT_MULTIPLICATION_TO_EXPONENT',
  // e.g. nthRoot(2 * x) -> nthRoot(2) * nthRoot(x)
  DISTRIBUTE_NTH_ROOT: 'DISTRIBUTE_NTH_ROOT',
  // e.g. nthRoot(4) * nthRoot(x^2) -> 2 * x
  EVALUATE_DISTRIBUTED_NTH_ROOT: 'EVALUATE_DISTRIBUTED_NTH_ROOT',
  // e.g. 12 -> 2 * 2 * 3
  FACTOR_INTO_PRIMES: 'FACTOR_INTO_PRIMES',
  // e.g. nthRoot(2 * 2 * 2, 2) -> nthRoot((2 * 2) * 2)
  GROUP_TERMS_BY_ROOT: 'GROUP_TERMS_BY_ROOT',
  // e.g. nthRoot(4) -> 2
  NTH_ROOT_VALUE: 'NTH_ROOT_VALUE',
  // e.g. nthRoot(4) + nthRoot(4) = 2*nthRoot(4)
  ADD_NTH_ROOTS: 'ADD_NTH_ROOTS',
  // e.g. nthRoot(x, 2) * nthRoot(x, 2) -> nthRoot(x^2, 2)
  MULTIPLY_NTH_ROOTS: 'MULTIPLY_NTH_ROOTS',

  // SOLVING FOR A VARIABLE

  // e.g. x - 3 = 2 -> x - 3 + 3 = 2 + 3
  ADD_TO_BOTH_SIDES: 'ADD_TO_BOTH_SIDES',
  // e.g. 2x = 1 -> (2x)/2 = 1/2
  DIVIDE_FROM_BOTH_SIDES: 'DIVIDE_FROM_BOTH_SIDES',
  // e.g. (2/3)x = 1 -> (2/3)x * (3/2) = 1 * (3/2)
  MULTIPLY_BOTH_SIDES_BY_INVERSE_FRACTION: 'MULTIPLY_BOTH_SIDES_BY_INVERSE_FRACTION',
  // e.g. -x = 2 -> -1 * -x = -1 * 2
  MULTIPLY_BOTH_SIDES_BY_NEGATIVE_ONE: 'MULTIPLY_BOTH_SIDES_BY_NEGATIVE_ONE',
  // e.g. x/2 = 1 -> (x/2) * 2 = 1 * 2
  MULTIPLY_TO_BOTH_SIDES: 'MULTIPLY_TO_BOTH_SIDES',
  // e.g. x + 2 - 1 = 3 -> x + 1 = 3
  SIMPLIFY_LEFT_SIDE: 'SIMPLIFY_LEFT_SIDE',
  // e.g. x = 3 - 1 -> x = 2
  SIMPLIFY_RIGHT_SIDE: 'SIMPLIFY_RIGHT_SIDE',
  // e.g. x + 3 = 2 -> x + 3 - 3 = 2 - 3
  SUBTRACT_FROM_BOTH_SIDES: 'SUBTRACT_FROM_BOTH_SIDES',
  // e.g. 2 = x -> x = 2
  SWAP_SIDES: 'SWAP_SIDES',
  // e.g. (x - 2) (x + 2) = 0 => x = [-2, 2]
  FIND_ROOTS: 'FIND_ROOTS',

  // CONSTANT EQUATION

  // e.g. 2 = 2
  STATEMENT_IS_TRUE: 'STATEMENT_IS_TRUE',
  // e.g. 2 = 3
  STATEMENT_IS_FALSE: 'STATEMENT_IS_FALSE',

  // FACTORING

  // e.g. x^2 - 4x -> x(x - 4)
  FACTOR_SYMBOL: 'FACTOR_SYMBOL',
  // e.g. x^2 - 4 -> (x - 2)(x + 2)
  FACTOR_DIFFERENCE_OF_SQUARES: 'FACTOR_DIFFERENCE_OF_SQUARES',
  // e.g. x^2 + 2x + 1 -> (x + 1)^2
  FACTOR_PERFECT_SQUARE: 'FACTOR_PERFECT_SQUARE',
  // e.g. x^2 + 3x + 2 -> (x + 1)(x + 2)
  FACTOR_SUM_PRODUCT_RULE: 'FACTOR_SUM_PRODUCT_RULE',
  // e.g. 2x^2 + 4x + 2 -> 2x^2 + 2x + 2x + 2
  BREAK_UP_TERM: 'BREAK_UP_TERM',

  // ENHANCED OPERATIONS

  // e.g. sqrt(x) * sqrt(y) -> sqrt(xy)
  MULTIPLY_SQRTS: 'MULTIPLY_SQRTS',
  // e.g. sqrt(x) * sqrt(x) -> x
  MULTIPLY_SQRTS_WITH_COMMON_ROOT: 'MULTIPLY_SQRTS_WITH_COMMON_ROOT',
  // e.g. x^2 * x^3 -> x^(2+3)
  MULTIPLY_POWERS_WITH_COMMON_BASE: 'MULTIPLY_POWERS_WITH_COMMON_BASE',
  // e.g. x^5 / x^2 -> x^(5-2)
  DIVIDE_POWERS_WITH_COMMON_BASE: 'DIVIDE_POWERS_WITH_COMMON_BASE',
  // e.g. nthRoot(x, 2) -> x^(1/2)
  CONVERT_ROOT_TO_POWER: 'CONVERT_ROOT_TO_POWER',
  // e.g. x^(1/2) -> nthRoot(x, 2)
  CONVERT_POWER_TO_ROOT: 'CONVERT_POWER_TO_ROOT',
  // e.g. (a*b)^n -> a^n * b^n
  POWER_FACTORS: 'POWER_FACTORS',
  // e.g. (a/b)^n -> a^n / b^n
  POWER_FRACTION: 'POWER_FRACTION',
  // e.g. (sqrt(x))^2 -> x
  POWER_SQRT: 'POWER_SQRT',
  // e.g. sqrt(0) -> 0
  SQRT_FROM_ZERO: 'SQRT_FROM_ZERO',
  // e.g. sqrt(1) -> 1
  SQRT_FROM_ONE: 'SQRT_FROM_ONE',
  // e.g. sqrt(x^2) -> x
  SQRT_FROM_POW: 'SQRT_FROM_POW',
  // e.g. sqrt(4) -> 2
  SQRT_FROM_CONST: 'SQRT_FROM_CONST',
  // e.g. nthRoot(8, 3) -> 2
  ROOT_FROM_CONST: 'ROOT_FROM_CONST',
  // e.g. nthRoot(a/b, n) -> nthRoot(a, n) / nthRoot(b, n)
  ROOT_FROM_FRACTION: 'ROOT_FROM_FRACTION',
  // e.g. x^-1 -> 1/x
  POWER_TO_MINUS_ONE: 'POWER_TO_MINUS_ONE',
  // e.g. x^-n -> 1/x^n
  POWER_TO_NEGATIVE_EXPONENT: 'POWER_TO_NEGATIVE_EXPONENT',
  // e.g. (x^a)^b -> x^(a*b)
  MULTIPLY_EXPONENTS: 'MULTIPLY_EXPONENTS',
  // e.g. (x) -> x
  REMOVE_UNNEEDED_PARENTHESIS: 'REMOVE_UNNEEDED_PARENTHESIS',
  // e.g. 1/x -> x (when numerator is 1)
  REMOVE_FRACTION_WITH_UNIT_NUMERATOR: 'REMOVE_FRACTION_WITH_UNIT_NUMERATOR',
  // e.g. (a/b)/c -> a/(b*c)
  REMOVE_DOUBLE_FRACTION: 'REMOVE_DOUBLE_FRACTION',
  // e.g. sqrt(2.5) -> numerical evaluation
  NUMERICAL_SQRT: 'NUMERICAL_SQRT',
  // e.g. 5/2 -> 2.5
  NUMERICAL_DIV: 'NUMERICAL_DIV',
  // e.g. sqrt(4*x^2) -> sqrt(4)*sqrt(x^2)
  FACTOR_EXPRESSION_UNDER_ROOT: 'FACTOR_EXPRESSION_UNDER_ROOT',
  // e.g. 0.5 -> 1/2
  DECIMAL_TO_FRACTION: 'DECIMAL_TO_FRACTION',

  // SHORT MULTIPLICATION

  // e.g. (a+b)^2 -> a^2 + 2ab + b^2
  SHORT_MULTIPLICATION_AB2_ADD: 'SHORT_MULTIPLICATION_AB2_ADD',
  // e.g. (a+b)^3 -> a^3 + 3a^2*b + 3a*b^2 + b^3
  SHORT_MULTIPLICATION_AB3_ADD: 'SHORT_MULTIPLICATION_AB3_ADD',
  // e.g. (a+b)^n -> binomial expansion
  SHORT_MULTIPLICATION_ABN_ADD: 'SHORT_MULTIPLICATION_ABN_ADD',
  // e.g. (a-b)^2 -> a^2 - 2ab + b^2
  SHORT_MULTIPLICATION_AB2_SUB: 'SHORT_MULTIPLICATION_AB2_SUB',
  // e.g. (a-b)^3 -> a^3 - 3a^2*b + 3a*b^2 - b^3
  SHORT_MULTIPLICATION_AB3_SUB: 'SHORT_MULTIPLICATION_AB3_SUB',
  // e.g. (a-b)^n -> binomial expansion
  SHORT_MULTIPLICATION_ABN_SUB: 'SHORT_MULTIPLICATION_ABN_SUB',

  // TRIGONOMETRIC FUNCTIONS

  // e.g. sin(0) -> 0, cos(pi/2) -> 0
  FUNCTION_VALUE: 'FUNCTION_VALUE',
  // e.g. sin^2(x) + cos^2(x) -> 1
  PYTHAGOREAN_IDENTITY: 'PYTHAGOREAN_IDENTITY',
  // e.g. cos(-x) -> cos(x)
  EVEN_FUNCTION_OF_NEGATIVE: 'EVEN_FUNCTION_OF_NEGATIVE',
  // e.g. sin(-x) -> -sin(x)
  ODD_FUNCTION_OF_NEGATIVE: 'ODD_FUNCTION_OF_NEGATIVE',
  // e.g. sin(x)/cos(x) -> tan(x)
  CONVERT_SIN_PER_COS_TO_TAN: 'CONVERT_SIN_PER_COS_TO_TAN',
  // e.g. cos(x)/sin(x) -> cot(x)
  CONVERT_COS_PER_SIN_TO_COT: 'CONVERT_COS_PER_SIN_TO_COT',
  // e.g. asin(sin(x)) -> x
  CANCEL_INVERSE_FUNCTION: 'CANCEL_INVERSE_FUNCTION',
  // e.g. a*(b+c) -> a*b + a*c
  DISTRIBUTE_MUL_OVER_ADD: 'DISTRIBUTE_MUL_OVER_ADD',

  // LOGARITHM FUNCTIONS

  // e.g. logXY(n, 1) -> 0
  LOG_XY_FROM_ONE: 'LOG_XY_FROM_ONE',
  // e.g. logXY(n, n) -> 1
  LOG_XY_FROM_BASE: 'LOG_XY_FROM_BASE',
  // e.g. logXY(n, x^k) -> k*logXY(n, x)
  LOG_XY_FROM_POWER: 'LOG_XY_FROM_POWER',

  // PERCENT OPERATIONS

  // e.g. x% + y%
  PERCENTS_ADD: 'PERCENTS_ADD',
  // e.g. x% - y%
  PERCENTS_SUB: 'PERCENTS_SUB',
  // e.g. x% -> x/100
  PERCENTS_CONVERT_TO_FRACTION: 'PERCENTS_CONVERT_TO_FRACTION',

  // ORIGINAL EXPRESSION

  // Marker for original expression
  ORIGINAL_EXPRESSION: 'ORIGINAL_EXPRESSION',
};
