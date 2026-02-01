const math = require('mathjs');

const ChangeTypes = require('../../ChangeTypes');
const Node = require('../../node');
function sqrtFromZero(node) {
  if (!Node.Type.isFunction(node, 'sqrt')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 1) {
    return Node.Status.noChange(node);
  }
  
  const argNode = node.args[0];
  
  if (Node.Type.isConstant(argNode) && parseFloat(argNode.value) === 0) {
    const newNode = Node.Creator.constant(0);
    return Node.Status.nodeChanged(
      ChangeTypes.SQRT_FROM_ZERO,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// sqrt(1) -> 1
function sqrtFromOne(node) {
  if (!Node.Type.isFunction(node, 'sqrt')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 1) {
    return Node.Status.noChange(node);
  }
  
  const argNode = node.args[0];
  
  if (Node.Type.isConstant(argNode) && parseFloat(argNode.value) === 1) {
    const newNode = Node.Creator.constant(1);
    return Node.Status.nodeChanged(
      ChangeTypes.SQRT_FROM_ONE,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// nthRoot(0, n) -> 0
function nthRootFromZero(node) {
  if (!Node.Type.isFunction(node, 'nthRoot')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length < 1) {
    return Node.Status.noChange(node);
  }
  
  const argNode = node.args[0];
  
  if (Node.Type.isConstant(argNode) && parseFloat(argNode.value) === 0) {
    const newNode = Node.Creator.constant(0);
    return Node.Status.nodeChanged(
      ChangeTypes.SQRT_FROM_ZERO,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// nthRoot(1, n) -> 1
function nthRootFromOne(node) {
  if (!Node.Type.isFunction(node, 'nthRoot')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length < 1) {
    return Node.Status.noChange(node);
  }
  
  const argNode = node.args[0];
  
  if (Node.Type.isConstant(argNode) && parseFloat(argNode.value) === 1) {
    const newNode = Node.Creator.constant(1);
    return Node.Status.nodeChanged(
      ChangeTypes.SQRT_FROM_ONE,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// sqrt(x) * sqrt(x) -> x
function multiplySqrtsWithCommonRoot(node) {
  if (!Node.Type.isOperator(node, '*')) {
    return Node.Status.noChange(node);
  }
  
  // Find pairs of sqrt with same argument
  for (let i = 0; i < node.args.length; i++) {
    const arg1 = node.args[i];
    if (Node.Type.isFunction(arg1, 'sqrt') && arg1.args.length === 1) {
      for (let j = i + 1; j < node.args.length; j++) {
        const arg2 = node.args[j];
        if (Node.Type.isFunction(arg2, 'sqrt') && arg2.args.length === 1) {
          if (arg1.args[0].equals(arg2.args[0])) {
            // sqrt(x) * sqrt(x) -> x
            const newArgs = node.args.filter((_, idx) => idx !== i && idx !== j);
            newArgs.push(arg1.args[0]);
            
            let newNode;
            if (newArgs.length === 1) {
              newNode = newArgs[0];
            } else {
              newNode = Node.Creator.operator('*', newArgs);
            }
            
            return Node.Status.nodeChanged(
              ChangeTypes.MULTIPLY_SQRTS_WITH_COMMON_ROOT,
              node,
              newNode
            );
          }
        }
      }
    }
  }
  
  return Node.Status.noChange(node);
}

// sqrt(x) * sqrt(y) -> sqrt(x*y)
function multiplySqrts(node) {
  if (!Node.Type.isOperator(node, '*')) {
    return Node.Status.noChange(node);
  }
  
  // Find first pair of sqrts
  for (let i = 0; i < node.args.length; i++) {
    const arg1 = node.args[i];
    if (Node.Type.isFunction(arg1, 'sqrt') && arg1.args.length === 1) {
      for (let j = i + 1; j < node.args.length; j++) {
        const arg2 = node.args[j];
        if (Node.Type.isFunction(arg2, 'sqrt') && arg2.args.length === 1) {
          // sqrt(x) * sqrt(y) -> sqrt(x*y)
          const product = Node.Creator.operator('*', [arg1.args[0], arg2.args[0]]);
          // Create sqrt function node directly
          const sqrtSymbol = Node.Creator.symbol('sqrt');
          const newSqrt = new math.FunctionNode(sqrtSymbol, [product]);
          
          const newArgs = node.args.filter((_, idx) => idx !== i && idx !== j);
          newArgs.push(newSqrt);
          
          let newNode;
          if (newArgs.length === 1) {
            newNode = newArgs[0];
          } else {
            newNode = Node.Creator.operator('*', newArgs);
          }
          
          return Node.Status.nodeChanged(
            ChangeTypes.MULTIPLY_SQRTS,
            node,
            newNode
          );
        }
      }
    }
  }
  
  return Node.Status.noChange(node);
}

// x^a * x^b -> x^(a+b)
function multiplyPowersWithCommonBase(node) {
  if (!Node.Type.isOperator(node, '*')) {
    return Node.Status.noChange(node);
  }
  
  // Look for powers with the same base
  for (let i = 0; i < node.args.length; i++) {
    const arg1 = node.args[i];
    let base1, exp1;
    
    if (Node.Type.isOperator(arg1, '^')) {
      base1 = arg1.args[0];
      exp1 = arg1.args[1];
    } else {
      base1 = arg1;
      exp1 = Node.Creator.constant(1);
    }
    
    // Skip if base1 is a constant (avoid combining 0 * x -> 0x)
    if (Node.Type.isConstant(base1)) {
      continue;
    }
    
    for (let j = i + 1; j < node.args.length; j++) {
      const arg2 = node.args[j];
      let base2, exp2;
      
      if (Node.Type.isOperator(arg2, '^')) {
        base2 = arg2.args[0];
        exp2 = arg2.args[1];
      } else {
        base2 = arg2;
        exp2 = Node.Creator.constant(1);
      }
      
      // Skip if base2 is a constant
      if (Node.Type.isConstant(base2)) {
        continue;
      }
      
      if (base1.equals(base2)) {
        // x^a * x^b -> x^(a+b)
        const newExp = Node.Creator.operator('+', [exp1, exp2]);
        const newPower = Node.Creator.operator('^', [base1, newExp]);
        
        const newArgs = node.args.filter((_, idx) => idx !== i && idx !== j);
        newArgs.push(newPower);
        
        let newNode;
        if (newArgs.length === 1) {
          newNode = newArgs[0];
        } else {
          newNode = Node.Creator.operator('*', newArgs);
        }
        
        return Node.Status.nodeChanged(
          ChangeTypes.MULTIPLY_POWERS_WITH_COMMON_BASE,
          node,
          newNode
        );
      }
    }
  }
  
  return Node.Status.noChange(node);
}

// x^a / x^b -> x^(a-b)
function dividePowersWithCommonBase(node) {
  if (!Node.Type.isOperator(node, '/')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 2) {
    return Node.Status.noChange(node);
  }
  
  const numerator = node.args[0];
  const denominator = node.args[1];
  
  let base1, exp1;
  if (Node.Type.isOperator(numerator, '^')) {
    base1 = numerator.args[0];
    exp1 = numerator.args[1];
  } else {
    base1 = numerator;
    exp1 = Node.Creator.constant(1);
  }
  
  let base2, exp2;
  if (Node.Type.isOperator(denominator, '^')) {
    base2 = denominator.args[0];
    exp2 = denominator.args[1];
  } else {
    base2 = denominator;
    exp2 = Node.Creator.constant(1);
  }
  
  if (base1.equals(base2)) {
    // x^a / x^b -> x^(a-b)
    const newExp = Node.Creator.operator('-', [exp1, exp2]);
    const newNode = Node.Creator.operator('^', [base1, newExp]);
    
    return Node.Status.nodeChanged(
      ChangeTypes.DIVIDE_POWERS_WITH_COMMON_BASE,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// (x^a)^b -> x^(a*b)
function multiplyExponents(node) {
  if (!Node.Type.isOperator(node, '^')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 2) {
    return Node.Status.noChange(node);
  }
  
  const base = node.args[0];
  const exponent = node.args[1];
  
  if (Node.Type.isOperator(base, '^')) {
    // (x^a)^b -> x^(a*b)
    const innerBase = base.args[0];
    const innerExp = base.args[1];
    const newExp = Node.Creator.operator('*', [innerExp, exponent]);
    const newNode = Node.Creator.operator('^', [innerBase, newExp]);
    
    return Node.Status.nodeChanged(
      ChangeTypes.MULTIPLY_EXPONENTS,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// x^-1 -> 1/x
function powerToMinusOne(node) {
  if (!Node.Type.isOperator(node, '^')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 2) {
    return Node.Status.noChange(node);
  }
  
  const base = node.args[0];
  const exponent = node.args[1];
  
  if (Node.Type.isConstant(exponent) && parseFloat(exponent.value) === -1) {
    // x^-1 -> 1/x
    const one = Node.Creator.constant(1);
    const newNode = Node.Creator.operator('/', [one, base]);
    
    return Node.Status.nodeChanged(
      ChangeTypes.POWER_TO_MINUS_ONE,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// x^-n -> 1/x^n (for n != 1)
function powerToNegativeExponent(node) {
  if (!Node.Type.isOperator(node, '^')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 2) {
    return Node.Status.noChange(node);
  }
  
  const base = node.args[0];
  const exponent = node.args[1];
  
  // Check if exponent is negative (but not -1, handled separately)
  let isNegative = false;
  let positiveExp = null;
  
  if (Node.Type.isUnaryMinus(exponent)) {
    isNegative = true;
    positiveExp = exponent.args[0];
  } else if (Node.Type.isConstant(exponent)) {
    const value = parseFloat(exponent.value);
    if (value < 0 && value !== -1) {
      isNegative = true;
      positiveExp = Node.Creator.constant(-value);
    }
  }
  
  if (isNegative && positiveExp) {
    // x^-n -> 1/x^n
    const one = Node.Creator.constant(1);
    const positivePower = Node.Creator.operator('^', [base, positiveExp]);
    const newNode = Node.Creator.operator('/', [one, positivePower]);
    
    return Node.Status.nodeChanged(
      ChangeTypes.POWER_TO_NEGATIVE_EXPONENT,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// (a/b)^n -> a^n / b^n
function powerFraction(node) {
  if (!Node.Type.isOperator(node, '^')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 2) {
    return Node.Status.noChange(node);
  }
  
  const base = node.args[0];
  const exponent = node.args[1];
  
  if (Node.Type.isOperator(base, '/')) {
    // (a/b)^n -> a^n / b^n
    const numerator = base.args[0];
    const denominator = base.args[1];
    
    const numPower = Node.Creator.operator('^', [numerator, exponent]);
    const denPower = Node.Creator.operator('^', [denominator, exponent]);
    const newNode = Node.Creator.operator('/', [numPower, denPower]);
    
    return Node.Status.nodeChanged(
      ChangeTypes.POWER_FRACTION,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

module.exports = {
  sqrtFromZero,
  sqrtFromOne,
  nthRootFromZero,
  nthRootFromOne,
  multiplySqrtsWithCommonRoot,
  multiplySqrts,
  multiplyPowersWithCommonBase,
  dividePowersWithCommonBase,
  multiplyExponents,
  powerToMinusOne,
  powerToNegativeExponent,
  powerFraction,
};
