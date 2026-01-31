const assert = require('assert');
const crypto = require('crypto');

const applicableTransforms = require('../../lib/applicableTransforms');
const ChangeTypes = require('../../lib/ChangeTypes');
const print = require('../../lib/util/print');

const {
  listApplicableTransforms,
  applyTransform,
  normalizeExpressionString,
} = applicableTransforms;

function assertError(fn, code) {
  try {
    fn();
    assert.fail('Expected error');
  }
  catch (err) {
    assert.strictEqual(err.code, code);
  }
}

function pathStartsWith(path, prefix) {
  if (prefix.length > path.length) {
    return false;
  }
  for (let i = 0; i < prefix.length; i++) {
    if (path[i] !== prefix[i]) {
      return false;
    }
  }
  return true;
}

describe('applicableTransforms API', function() {
  it('finds collecting like terms for 2x + 3x', function() {
    const transforms = listApplicableTransforms('2x + 3x', []);
    assert.ok(transforms.length > 0);
    const likeTerms = transforms.find(t => (
      t.changeType === ChangeTypes.COLLECT_AND_COMBINE_LIKE_TERMS ||
      t.changeType === ChangeTypes.ADD_POLYNOMIAL_TERMS
    ));
    assert.ok(likeTerms);
    assert.strictEqual(print.ascii(likeTerms.preview.newNode), '5x');
  });

  it('does not return irrelevant steps for subexpression', function() {
    const transforms = listApplicableTransforms('2*(x+1)', ['args', 1]);
    const hasDistribute = transforms.some(t => t.changeType === ChangeTypes.DISTRIBUTE);
    assert.strictEqual(hasDistribute, false);
  });

  it('applyTransform deterministically matches preview', function() {
    const transforms = listApplicableTransforms('2x + 3x', []);
    const target = transforms[0];
    const applied = applyTransform('2x + 3x', [], target.id);
    assert.strictEqual(
      print.ascii(applied.newNode),
      print.ascii(target.preview.newNode));
  });

  it('changedPaths are prefixed with selectionPath', function() {
    const selectionPath = ['args', 0];
    const transforms = listApplicableTransforms('(2+2)+x', selectionPath);
    const arithmetic = transforms.find(t => (
      t.changeType === ChangeTypes.SIMPLIFY_ARITHMETIC
    ));
    assert.ok(arithmetic);
    assert.ok(arithmetic.changedPaths.length > 0);
    arithmetic.changedPaths.forEach(item => {
      assert.ok(pathStartsWith(item.path, selectionPath));
      assert.strictEqual(typeof item.groupId, 'number');
    });
  });

  it('golden: 2+2 returns stable id and preview', function() {
    const transforms = listApplicableTransforms('2+2', []);
    assert.strictEqual(transforms.length, 1);
    const transform = transforms[0];
    const signature = print.ascii(transform.preview.newNode);
    const hash = crypto.createHash('sha1').update(signature).digest('hex');
    const expectedId = `arithmeticSearch:${ChangeTypes.SIMPLIFY_ARITHMETIC}:${hash}`;
    assert.strictEqual(transform.id, expectedId);
    assert.strictEqual(signature, '4');
  });

  it('normalizeExpressionString returns stable string', function() {
    assert.strictEqual(normalizeExpressionString('2+2'), '2 + 2');
  });

  it('handles empty path as root', function() {
    const transforms = listApplicableTransforms('2+2', []);
    assert.strictEqual(transforms.length, 1);
    assert.strictEqual(
      print.ascii(transforms[0].preview.newNode),
      '4');
  });

  it('handles path to content', function() {
    const transforms = listApplicableTransforms('(2+2)+x', ['args', 0, 'content']);
    assert.ok(transforms.length > 0);
    const arithmetic = transforms.find(t => (
      t.changeType === ChangeTypes.SIMPLIFY_ARITHMETIC
    ));
    assert.ok(arithmetic);
    assert.strictEqual(print.ascii(arithmetic.preview.newNode), '(4) + x');
  });

  it('dedupe byId does not remove different transforms', function() {
    const transforms = listApplicableTransforms('2+2', [], {dedupe: 'byId'});
    assert.strictEqual(transforms.length, 1);
  });

  it('maxTransforms limits number of results', function() {
    const transforms = listApplicableTransforms('2+2+2', [], {maxTransforms: 1});
    assert.strictEqual(transforms.length, 1);
  });

  it('includeSubsteps disables substeps by default', function() {
    const transforms = listApplicableTransforms('2x + 3x', []);
    transforms.forEach(transform => {
      assert.strictEqual(transform.preview.substeps.length, 0);
    });
  });

  it('includeSubsteps includes substeps when present', function() {
    const transforms = listApplicableTransforms(
      'x + x + x^2 + x^2',
      [],
      {includeSubsteps: true});
    const withSubsteps = transforms.filter(t => t.preview.substeps.length > 0);
    assert.ok(withSubsteps.length > 0);
  });

  it('parent context does not add steps if selected node does not change', function() {
    const transforms = listApplicableTransforms('2+2+3', ['args', 1]);
    assert.strictEqual(transforms.length, 0);
  });

  it('error normalizeExpressionString on invalid expression', function() {
    assertError(
      () => normalizeExpressionString('2+*'),
      'INVALID_EXPRESSION');
  });

  it('error on invalid path step', function() {
    assertError(
      () => listApplicableTransforms('2+2', ['bad-step']),
      'INVALID_PATH');
  });

  it('applyTransform respects dedupe/maxTransforms options', function() {
    const options = {dedupe: 'byId', maxTransforms: 1};
    const transforms = listApplicableTransforms('2+2+2', [], options);
    assert.strictEqual(transforms.length, 1);
    const applied = applyTransform('2+2+2', [], transforms[0].id, options);
    assert.strictEqual(
      print.ascii(applied.newNode),
      print.ascii(transforms[0].preview.newNode));
  });

  it('changedPaths correctly prefixed for deep path', function() {
    const selectionPath = ['content', 'content'];
    const transforms = listApplicableTransforms('((2+2))', selectionPath);
    const arithmetic = transforms.find(t => (
      t.changeType === ChangeTypes.SIMPLIFY_ARITHMETIC
    ));
    assert.ok(arithmetic);
    arithmetic.changedPaths.forEach(item => {
      assert.ok(pathStartsWith(item.path, selectionPath));
    });
  });

  it('validates errors', function() {
    assertError(
      () => listApplicableTransforms('2+*', []),
      'INVALID_EXPRESSION');
    assertError(
      () => listApplicableTransforms('2+2', ['args', 2]),
      'INVALID_PATH');
    assertError(
      () => listApplicableTransforms('2+2', [], {domain: 'equation'}),
      'INVALID_DOMAIN');
    assertError(
      () => applyTransform('2+2', [], 'missing-id'),
      'UNKNOWN_TRANSFORM');
  });
});
