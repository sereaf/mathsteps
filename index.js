const ChangeTypes = require('./lib/ChangeTypes');
const factor = require('./lib/factor');
const simplifyExpression = require('./lib/simplifyExpression');
const solveEquation = require('./lib/solveEquation');

// Caching system
const CACHE_ENABLED = true;
const CACHE_LOG_MISSING_ENABLED = false;
const CACHE_LOG_REUSED_ENABLED = false;

const CACHE_COMPARE = {};
const CACHE_TEXT_TO_TEX = {};
const CACHE_TEXT_TO_NODE = {};

// Preprocessor hooks
const ARRAY_OF_PREPROCESS_FUNCTIONS_BEFORE_PARSE = [];
const ARRAY_OF_PREPROCESS_FUNCTIONS_AFTER_PARSE = [];

/**
 * Register a preprocessor function to run before parsing
 * @param {Function} fn - Function that takes text and returns modified text
 */
function registerPreprocessorBeforeParse(fn) {
  ARRAY_OF_PREPROCESS_FUNCTIONS_BEFORE_PARSE.push(fn);
}

/**
 * Register a preprocessor function to run after parsing
 * @param {Function} fn - Function that takes node and returns modified node
 */
function registerPreprocessorAfterParse(fn) {
  ARRAY_OF_PREPROCESS_FUNCTIONS_AFTER_PARSE.push(fn);
}

/**
 * Clear all caches
 */
function clearCaches() {
  Object.keys(CACHE_COMPARE).forEach(key => delete CACHE_COMPARE[key]);
  Object.keys(CACHE_TEXT_TO_TEX).forEach(key => delete CACHE_TEXT_TO_TEX[key]);
  Object.keys(CACHE_TEXT_TO_NODE).forEach(key => delete CACHE_TEXT_TO_NODE[key]);
}

module.exports = {
  factor,
  simplifyExpression,
  solveEquation,
  ChangeTypes,
  registerPreprocessorBeforeParse,
  registerPreprocessorAfterParse,
  clearCaches,
  // Export cache objects for advanced users
  CACHE_COMPARE,
  CACHE_TEXT_TO_TEX,
  CACHE_TEXT_TO_NODE,
};
