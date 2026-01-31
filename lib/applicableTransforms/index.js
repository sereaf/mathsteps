const crypto = require('crypto');
const math = require('mathjs');

const Node = require('../node');
const print = require('../util/print');
const Status = require('../node/Status');

const arithmeticSearch = require('../simplifyExpression/arithmeticSearch');
const basicsSearch = require('../simplifyExpression/basicsSearch');
const breakUpNumeratorSearch = require('../simplifyExpression/breakUpNumeratorSearch');
const collectAndCombineSearch = require('../simplifyExpression/collectAndCombineSearch');
const distributeSearch = require('../simplifyExpression/distributeSearch');
const divisionSearch = require('../simplifyExpression/divisionSearch');
const fractionsSearch = require('../simplifyExpression/fractionsSearch');
const functionsSearch = require('../simplifyExpression/functionsSearch');
const multiplyFractionsSearch = require('../simplifyExpression/multiplyFractionsSearch');

const SEARCHERS = [
  {name: 'basicsSearch', search: basicsSearch},
  {name: 'divisionSearch', search: divisionSearch},
  {name: 'fractionsSearch', search: fractionsSearch},
  {name: 'collectAndCombineSearch', search: collectAndCombineSearch},
  {name: 'arithmeticSearch', search: arithmeticSearch},
  {name: 'breakUpNumeratorSearch', search: breakUpNumeratorSearch},
  {name: 'multiplyFractionsSearch', search: multiplyFractionsSearch},
  {name: 'distributeSearch', search: distributeSearch},
  {name: 'functionsSearch', search: functionsSearch},
];

function createError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeOptions(options) {
  const opts = options || {};
  return {
    domain: opts.domain || 'simplify',
    maxTransforms: opts.maxTransforms,
    dedupe: opts.dedupe || 'byNewNode',
    includeSubsteps: Boolean(opts.includeSubsteps),
  };
}

function normalizeExpressionString(expressionString) {
  let parsed;
  try {
    parsed = math.parse(expressionString);
  }
  // eslint-disable-next-line no-unused-vars
  catch (err) {
    throw createError('INVALID_EXPRESSION', 'Failed to parse expression');
  }
  return print.ascii(parsed);
}

function parseExpression(expressionString) {
  const normalized = normalizeExpressionString(expressionString);
  try {
    return math.parse(normalized);
  }
  // eslint-disable-next-line no-unused-vars
  catch (err) {
    throw createError('INVALID_EXPRESSION', 'Failed to parse expression');
  }
}

function resolvePath(rootNode, path) {
  if (!Array.isArray(path)) {
    throw createError('INVALID_PATH', 'Invalid selectionPath');
  }

  if (path.length === 0) {
    return {
      node: rootNode,
      parentNode: null,
      parentPath: null,
    };
  }

  let node = rootNode;
  let parentNode = null;
  let parentPath = null;
  const walked = [];

  for (let i = 0; i < path.length; ) {
    const step = path[i];
    if (step === 'args') {
      const index = path[i + 1];
      if (typeof index !== 'number') {
        throw createError('INVALID_PATH', 'Expected index after args');
      }
      if (!node.args || index < 0 || index >= node.args.length) {
        throw createError('INVALID_PATH', 'Invalid path to args');
      }
      parentNode = node;
      parentPath = walked.slice();
      walked.push('args', index);
      node = node.args[index];
      i += 2;
    }
    else if (step === 'content') {
      if (!node.content) {
        throw createError('INVALID_PATH', 'Invalid path to content');
      }
      parentNode = node;
      parentPath = walked.slice();
      walked.push('content');
      node = node.content;
      i += 1;
    }
    else {
      throw createError('INVALID_PATH', 'Invalid path step');
    }
  }

  return {node, parentNode, parentPath};
}

function getNodeAtPath(rootNode, path) {
  const resolved = resolvePath(rootNode, path);
  return resolved.node;
}

function wrapStatusAtPath(rootNode, path, childStatus) {
  if (path.length === 0) {
    return childStatus;
  }

  let node = rootNode;
  const stack = [];

  for (let i = 0; i < path.length; ) {
    const step = path[i];
    if (step === 'args') {
      const index = path[i + 1];
      if (typeof index !== 'number') {
        throw createError('INVALID_PATH', 'Expected index after args');
      }
      if (!node.args || index < 0 || index >= node.args.length) {
        throw createError('INVALID_PATH', 'Invalid path to args');
      }
      stack.push({node, type: 'args', index});
      node = node.args[index];
      i += 2;
    }
    else if (step === 'content') {
      if (!node.content) {
        throw createError('INVALID_PATH', 'Invalid path to content');
      }
      stack.push({node, type: 'content'});
      node = node.content;
      i += 1;
    }
    else {
      throw createError('INVALID_PATH', 'Invalid path step');
    }
  }

  let status = childStatus;
  for (let i = stack.length - 1; i >= 0; i--) {
    const frame = stack[i];
    if (frame.type === 'args') {
      status = Status.childChanged(frame.node, status, frame.index);
    }
    else {
      status = Status.childChanged(frame.node, status);
    }
  }

  return status;
}

function collectChangeGroups(node, prefix=[]) {
  const changed = [];

  if (node.changeGroup) {
    changed.push({path: prefix.slice(), groupId: node.changeGroup});
  }

  if (Node.Type.isParenthesis(node)) {
    changed.push(...collectChangeGroups(node.content, prefix.concat(['content'])));
  }
  else if (Node.Type.isUnaryMinus(node)) {
    changed.push(...collectChangeGroups(node.args[0], prefix.concat(['args', 0])));
  }
  else if (Node.Type.isOperator(node) || Node.Type.isFunction(node)) {
    for (let i = 0; i < node.args.length; i++) {
      changed.push(...collectChangeGroups(node.args[i], prefix.concat(['args', i])));
    }
  }

  return changed;
}

function prefixPaths(prefix, paths) {
  if (!prefix || prefix.length === 0) {
    return paths;
  }
  return paths.map(item => ({
    path: prefix.concat(item.path),
    groupId: item.groupId,
  }));
}

function buildTransform({
  rootNode,
  selectionPath,
  applyPath,
  childStatus,
  searcherName,
  includeSubsteps,
  selectionRelativePath,
}) {
  const previewStatus = wrapStatusAtPath(rootNode, applyPath, childStatus);
  if (!includeSubsteps) {
    previewStatus.substeps = [];
  }

  let localNodeForChanges = childStatus.newNode;
  if (selectionRelativePath && selectionRelativePath.length > 0) {
    try {
      localNodeForChanges = getNodeAtPath(childStatus.newNode, selectionRelativePath);
    }
    // eslint-disable-next-line no-unused-vars
    catch (err) {
      localNodeForChanges = null;
    }
  }

  let changedPaths = [];
  if (localNodeForChanges) {
    changedPaths = prefixPaths(
      selectionPath,
      collectChangeGroups(localNodeForChanges));
  }

  const signature = print.ascii(previewStatus.newNode);
  const hash = crypto.createHash('sha1').update(signature).digest('hex');
  const id = `${searcherName}:${childStatus.changeType}:${hash}`;

  return {
    id,
    title: childStatus.changeType,
    changeType: childStatus.changeType,
    searcher: searcherName,
    path: selectionPath,
    preview: previewStatus,
    changedPaths,
  };
}

function listApplicableTransforms(expressionString, selectionPath, options) {
  const opts = normalizeOptions(options);
  if (opts.domain !== 'simplify') {
    throw createError('INVALID_DOMAIN', 'Domain not supported');
  }

  const rootNode = parseExpression(expressionString);
  const resolved = resolvePath(rootNode, selectionPath);
  const selectedNode = resolved.node;
  const parentNode = resolved.parentNode;
  const parentPath = resolved.parentPath;

  const transforms = [];

  for (let i = 0; i < SEARCHERS.length; i++) {
    const searcher = SEARCHERS[i];

    const localStatus = searcher.search(selectedNode);
    if (localStatus.hasChanged()) {
      transforms.push(buildTransform({
        rootNode,
        selectionPath,
        applyPath: selectionPath,
        childStatus: localStatus,
        searcherName: searcher.name,
        includeSubsteps: opts.includeSubsteps,
        selectionRelativePath: [],
      }));
    }

    if (parentNode) {
      const parentStatus = searcher.search(parentNode);
      if (parentStatus.hasChanged()) {
        const selectionRelativePath = selectionPath.slice(parentPath.length);
        let oldSelected;
        let newSelected;
        try {
          oldSelected = getNodeAtPath(parentStatus.oldNode, selectionRelativePath);
          newSelected = getNodeAtPath(parentStatus.newNode, selectionRelativePath);
        }
        // eslint-disable-next-line no-unused-vars
        catch (err) {
          continue;
        }

        const oldSignature = print.ascii(oldSelected);
        const newSignature = print.ascii(newSelected);
        if (oldSignature === newSignature) {
          continue;
        }

        transforms.push(buildTransform({
          rootNode,
          selectionPath,
          applyPath: parentPath,
          childStatus: parentStatus,
          searcherName: searcher.name,
          includeSubsteps: opts.includeSubsteps,
          selectionRelativePath,
        }));
      }
    }
  }

  const dedupeKey = opts.dedupe === 'byId' ? 'id' : 'signature';
  const seen = new Set();
  const deduped = [];

  for (let i = 0; i < transforms.length; i++) {
    const transform = transforms[i];
    const signature = print.ascii(transform.preview.newNode);
    const key = dedupeKey === 'id' ? transform.id : signature;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(transform);
  }

  if (typeof opts.maxTransforms === 'number') {
    return deduped.slice(0, opts.maxTransforms);
  }

  return deduped;
}

function applyTransform(expressionString, selectionPath, transformId, options) {
  const transforms = listApplicableTransforms(expressionString, selectionPath, options);
  const match = transforms.find(transform => transform.id === transformId);
  if (!match) {
    throw createError('UNKNOWN_TRANSFORM', 'Unknown transformId');
  }
  return match.preview;
}

module.exports = {
  listApplicableTransforms,
  applyTransform,
  normalizeExpressionString,
};
