const math = require('mathjs');

const ChangeTypes = require('../../ChangeTypes');
const Node = require('../../node');

// Common trigonometric function values
const TRIG_VALUES = {
  sin: {
    '0': '0',
    'pi/6': '1/2',
    'pi/4': 'sqrt(2)/2',
    'pi/3': 'sqrt(3)/2',
    'pi/2': '1',
    'pi': '0',
  },
  cos: {
    '0': '1',
    'pi/6': 'sqrt(3)/2',
    'pi/4': 'sqrt(2)/2',
    'pi/3': '1/2',
    'pi/2': '0',
    'pi': '-1',
  },
  tan: {
    '0': '0',
    'pi/6': 'sqrt(3)/3',
    'pi/4': '1',
    'pi/3': 'sqrt(3)',
  },
  cot: {
    'pi/6': 'sqrt(3)',
    'pi/4': '1',
    'pi/3': 'sqrt(3)/3',
    'pi/2': '0',
  },
  asin: {
    '0': '0',
    '1/2': 'pi/6',
    'sqrt(2)/2': 'pi/4',
    'sqrt(3)/2': 'pi/3',
    '1': 'pi/2',
  },
  acos: {
    '1': '0',
    'sqrt(3)/2': 'pi/6',
    'sqrt(2)/2': 'pi/4',
    '1/2': 'pi/3',
    '0': 'pi/2',
    '-1': 'pi',
  },
  atan: {
    '0': '0',
    'sqrt(3)/3': 'pi/6',
    '1': 'pi/4',
    'sqrt(3)': 'pi/3',
  },
  acot: {
    'sqrt(3)': 'pi/6',
    '1': 'pi/4',
    'sqrt(3)/3': 'pi/3',
    '0': 'pi/2',
  },
};

// Helper function to parse common angle expressions
function parseAngleExpression(node) {
  // Check for 0
  if (Node.Type.isConstant(node) && parseFloat(node.value) === 0) {
    return '0';
  }
  
  // Check for pi related fractions
  if (Node.Type.isOperator(node, '/')) {
    const numerator = node.args[0];
    const denominator = node.args[1];
    
    // Check if numerator is pi symbol
    if (Node.Type.isSymbol(numerator) && numerator.name === 'pi') {
      if (Node.Type.isConstant(denominator)) {
        return `pi/${denominator.value}`;
      }
    }
  }
  
  // Check for plain pi symbol
  if (Node.Type.isSymbol(node) && node.name === 'pi') {
    return 'pi';
  }
  
  return null;
}

// Helper function to create result node from string
function createResultNode(resultStr) {
  if (resultStr.includes('/')) {
    const parts = resultStr.split('/');
    if (parts[0].includes('sqrt')) {
      // e.g., sqrt(2)/2
      const sqrtMatch = parts[0].match(/sqrt\((\d+)\)/);
      if (sqrtMatch) {
        const sqrtArg = Node.Creator.constant(parseInt(sqrtMatch[1]));
        const sqrtNode = Node.Creator.nthRoot(sqrtArg);
        const denominator = Node.Creator.constant(parseInt(parts[1]));
        return Node.Creator.operator('/', [sqrtNode, denominator]);
      }
    } else if (parts[0].includes('pi')) {
      // e.g., pi/6
      const piNode = Node.Creator.symbol('pi');
      const denominator = Node.Creator.constant(parseInt(parts[1]));
      return Node.Creator.operator('/', [piNode, denominator]);
    } else {
      // Simple fraction
      const numerator = Node.Creator.constant(parseInt(parts[0]));
      const denominator = Node.Creator.constant(parseInt(parts[1]));
      return Node.Creator.operator('/', [numerator, denominator]);
    }
  } else if (resultStr.includes('sqrt')) {
    // e.g., sqrt(3)
    const sqrtMatch = resultStr.match(/sqrt\((\d+)\)/);
    if (sqrtMatch) {
      const sqrtArg = Node.Creator.constant(parseInt(sqrtMatch[1]));
      return Node.Creator.nthRoot(sqrtArg);
    }
  } else if (resultStr.includes('pi')) {
    return Node.Creator.symbol('pi');
  } else if (resultStr.startsWith('-')) {
    // Negative number
    const value = parseInt(resultStr);
    return Node.Creator.constant(value);
  } else {
    // Simple constant
    const value = parseInt(resultStr);
    return Node.Creator.constant(value);
  }
  
  return null;
}

// Evaluate trigonometric function if possible
function evaluateTrigFunction(node) {
  if (!Node.Type.isFunction(node)) {
    return Node.Status.noChange(node);
  }
  
  const funcName = node.fn.name;
  const supportedFunctions = ['sin', 'cos', 'tan', 'cot', 'asin', 'acos', 'atan', 'acot'];
  
  if (!supportedFunctions.includes(funcName)) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 1) {
    return Node.Status.noChange(node);
  }
  
  const argNode = node.args[0];
  const angleKey = parseAngleExpression(argNode);
  
  if (angleKey && TRIG_VALUES[funcName] && TRIG_VALUES[funcName][angleKey]) {
    const resultStr = TRIG_VALUES[funcName][angleKey];
    const resultNode = createResultNode(resultStr);
    
    if (resultNode) {
      return Node.Status.nodeChanged(
        ChangeTypes.FUNCTION_VALUE,
        node,
        resultNode
      );
    }
  }
  
  return Node.Status.noChange(node);
}

// Handle negative angle for even functions (cos)
function evenFunctionNegative(node) {
  if (!Node.Type.isFunction(node, 'cos')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 1) {
    return Node.Status.noChange(node);
  }
  
  const argNode = node.args[0];
  
  // Check if argument is negative
  if (Node.Type.isUnaryMinus(argNode)) {
    // cos(-x) = cos(x)
    const newArg = argNode.args[0];
    const newNode = Node.Creator.function('cos', [newArg]);
    return Node.Status.nodeChanged(
      ChangeTypes.EVEN_FUNCTION_OF_NEGATIVE,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// Handle negative angle for odd functions (sin, tan, cot)
function oddFunctionNegative(node) {
  if (!Node.Type.isFunction(node)) {
    return Node.Status.noChange(node);
  }
  
  const funcName = node.fn.name;
  const oddFunctions = ['sin', 'tan', 'cot'];
  
  if (!oddFunctions.includes(funcName)) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 1) {
    return Node.Status.noChange(node);
  }
  
  const argNode = node.args[0];
  
  // Check if argument is negative
  if (Node.Type.isUnaryMinus(argNode)) {
    // sin(-x) = -sin(x), tan(-x) = -tan(x), cot(-x) = -cot(x)
    const newArg = argNode.args[0];
    const innerFunc = Node.Creator.function(funcName, [newArg]);
    const newNode = Node.Creator.unaryMinus(innerFunc);
    return Node.Status.nodeChanged(
      ChangeTypes.ODD_FUNCTION_OF_NEGATIVE,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// Cancel inverse functions: asin(sin(x)) = x, acos(cos(x)) = x, etc.
function cancelInverseFunction(node) {
  if (!Node.Type.isFunction(node)) {
    return Node.Status.noChange(node);
  }
  
  const funcName = node.fn.name;
  const inversePairs = {
    'asin': 'sin',
    'acos': 'cos',
    'atan': 'tan',
    'acot': 'cot',
  };
  
  if (!inversePairs[funcName]) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 1) {
    return Node.Status.noChange(node);
  }
  
  const argNode = node.args[0];
  
  // Check if inner function matches
  if (Node.Type.isFunction(argNode, inversePairs[funcName])) {
    if (argNode.args.length === 1) {
      // asin(sin(x)) = x
      const newNode = argNode.args[0];
      return Node.Status.nodeChanged(
        ChangeTypes.CANCEL_INVERSE_FUNCTION,
        node,
        newNode
      );
    }
  }
  
  return Node.Status.noChange(node);
}

// Pythagorean identity: sin^2(x) + cos^2(x) = 1
function pythagoreanIdentity(node) {
  if (!Node.Type.isOperator(node, '+')) {
    return Node.Status.noChange(node);
  }
  
  if (node.args.length !== 2) {
    return Node.Status.noChange(node);
  }
  
  const [arg1, arg2] = node.args;
  
  // Check if both are powers of 2
  let sinSquared = null;
  let cosSquared = null;
  
  for (const arg of [arg1, arg2]) {
    if (Node.Type.isOperator(arg, '^')) {
      const base = arg.args[0];
      const exponent = arg.args[1];
      
      if (Node.Type.isConstant(exponent) && parseFloat(exponent.value) === 2) {
        if (Node.Type.isFunction(base, 'sin')) {
          sinSquared = base;
        } else if (Node.Type.isFunction(base, 'cos')) {
          cosSquared = base;
        }
      }
    }
  }
  
  // Check if we have both sin^2 and cos^2 with same argument
  if (sinSquared && cosSquared) {
    if (sinSquared.args.length === 1 && cosSquared.args.length === 1) {
      const sinArg = sinSquared.args[0];
      const cosArg = cosSquared.args[0];
      
      if (sinArg.equals(cosArg)) {
        // sin^2(x) + cos^2(x) = 1
        const newNode = Node.Creator.constant(1);
        return Node.Status.nodeChanged(
          ChangeTypes.PYTHAGOREAN_IDENTITY,
          node,
          newNode
        );
      }
    }
  }
  
  return Node.Status.noChange(node);
}

module.exports = {
  evaluateTrigFunction,
  evenFunctionNegative,
  oddFunctionNegative,
  cancelInverseFunction,
  pythagoreanIdentity,
};
