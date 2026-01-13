const ChangeTypes = require('./lib/ChangeTypes');
const factor = require('./lib/factor');
const applicableTransforms = require('./lib/applicableTransforms');
const simplifyExpression = require('./lib/simplifyExpression');
const solveEquation = require('./lib/solveEquation');

module.exports = {
  factor,
  applicableTransforms,
  simplifyExpression,
  solveEquation,
  ChangeTypes,
};
