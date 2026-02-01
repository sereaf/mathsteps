const math = require('mathjs');

const ChangeTypes = require('../../ChangeTypes');
const Node = require('../../node');

// Helper to check if node is logXY function (log base X of Y)
// In mathjs, this might be represented as log(y, x) or similar
function isLogXY(node) {
  if (!Node.Type.isFunction(node)) {
    return false;
  }
  
  // Check for log function with 2 arguments
  const funcName = node.fn ? node.fn.name : (node.name || '');
  return funcName === 'log' && node.args && node.args.length === 2;
}

// logXY(n, 1) -> 0 (log of 1 in any base is 0)
function logXYFromOne(node) {
  if (!isLogXY(node)) {
    return Node.Status.noChange(node);
  }
  
  const base = node.args[0];
  const argument = node.args[1];
  
  if (Node.Type.isConstant(argument) && parseFloat(argument.value) === 1) {
    // log_n(1) = 0
    const newNode = Node.Creator.constant(0);
    return Node.Status.nodeChanged(
      ChangeTypes.LOG_XY_FROM_ONE,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// logXY(n, n) -> 1 (log base n of n is 1)
function logXYFromBase(node) {
  if (!isLogXY(node)) {
    return Node.Status.noChange(node);
  }
  
  const base = node.args[0];
  const argument = node.args[1];
  
  if (base.equals(argument)) {
    // log_n(n) = 1
    const newNode = Node.Creator.constant(1);
    return Node.Status.nodeChanged(
      ChangeTypes.LOG_XY_FROM_BASE,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// logXY(n, x^k) -> k * logXY(n, x)
function logXYFromPower(node) {
  if (!isLogXY(node)) {
    return Node.Status.noChange(node);
  }
  
  const base = node.args[0];
  const argument = node.args[1];
  
  if (Node.Type.isOperator(argument, '^')) {
    // log_n(x^k) -> k * log_n(x)
    const innerBase = argument.args[0];
    const exponent = argument.args[1];
    
    const newLog = Node.Creator.function('log', [base, innerBase]);
    const newNode = Node.Creator.operator('*', [exponent, newLog]);
    
    return Node.Status.nodeChanged(
      ChangeTypes.LOG_XY_FROM_POWER,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

// Convert sqrt/nthRoot to power under logarithm
// logXY(n, sqrt(x)) -> logXY(n, x^(1/2))
function convertRootToPowerInLog(node) {
  if (!isLogXY(node)) {
    return Node.Status.noChange(node);
  }
  
  const base = node.args[0];
  const argument = node.args[1];
  
  // Check for sqrt
  if (Node.Type.isFunction(argument, 'sqrt') && argument.args.length === 1) {
    const sqrtArg = argument.args[0];
    const half = Node.Creator.operator('/', [
      Node.Creator.constant(1),
      Node.Creator.constant(2)
    ]);
    const power = Node.Creator.operator('^', [sqrtArg, half]);
    const newNode = Node.Creator.function('log', [base, power]);
    
    return Node.Status.nodeChanged(
      ChangeTypes.CONVERT_ROOT_TO_POWER,
      node,
      newNode
    );
  }
  
  // Check for nthRoot
  if (Node.Type.isFunction(argument, 'nthRoot') && argument.args.length >= 1) {
    const rootArg = argument.args[0];
    const rootDegree = argument.args.length === 2 ? argument.args[1] : Node.Creator.constant(2);
    
    const exponent = Node.Creator.operator('/', [
      Node.Creator.constant(1),
      rootDegree
    ]);
    const power = Node.Creator.operator('^', [rootArg, exponent]);
    const newNode = Node.Creator.function('log', [base, power]);
    
    return Node.Status.nodeChanged(
      ChangeTypes.CONVERT_ROOT_TO_POWER,
      node,
      newNode
    );
  }
  
  return Node.Status.noChange(node);
}

module.exports = {
  logXYFromOne,
  logXYFromBase,
  logXYFromPower,
  convertRootToPowerInLog,
};
