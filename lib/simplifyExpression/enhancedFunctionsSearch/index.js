const Node = require('../../node');
const TreeSearch = require('../../TreeSearch');

const trigRules = require('./trigonometricRules');
const powerRootRules = require('./powerRootRules');
const logRules = require('./logarithmRules');

// List of all enhancement rules to apply
const ENHANCED_RULES = [
  // Logarithm rules (apply early to avoid huge intermediate values)
  logRules.logXYFromOne,
  logRules.logXYFromBase,
  logRules.convertRootToPowerInLog,
  logRules.logXYFromPower,
  
  // Basic sqrt/root evaluations
  powerRootRules.sqrtFromZero,
  powerRootRules.sqrtFromOne,
  powerRootRules.nthRootFromZero,
  powerRootRules.nthRootFromOne,
  
  // Trigonometric function evaluations
  trigRules.evaluateTrigFunction,
  trigRules.cancelInverseFunction,
  trigRules.evenFunctionNegative,
  trigRules.oddFunctionNegative,
  trigRules.pythagoreanIdentity,
  
  // Power and root combinations
  powerRootRules.multiplySqrtsWithCommonRoot,
  powerRootRules.multiplySqrts,
  // powerRootRules.multiplyPowersWithCommonBase,
  powerRootRules.dividePowersWithCommonBase,
  powerRootRules.multiplyExponents,
  // powerRootRules.powerToMinusOne,
  // powerRootRules.powerToNegativeExponent,
  // powerRootRules.powerFraction,
];

// Searches through the tree, prioritizing deeper nodes, and applies
// enhanced function rules (trigonometry, logarithms, advanced power/root ops).
// Returns a Node.Status object.
const search = TreeSearch.postOrder(enhancedFunctions);

// Applies enhanced function rules. Returns a Node.Status object.
function enhancedFunctions(node) {
  for (let i = 0; i < ENHANCED_RULES.length; i++) {
    const nodeStatus = ENHANCED_RULES[i](node);
    if (nodeStatus.hasChanged()) {
      return nodeStatus;
    }
  }
  return Node.Status.noChange(node);
}

module.exports = search;
