const assert = require('assert');
const crypto = require('crypto');

const ChangeTypes = require('../../lib/ChangeTypes');
const print = require('../../lib/util/print');
const applicableTransforms = require('../../lib/applicableTransforms');

const {
  listApplicableTransforms,
  applyTransform,
  normalizeExpressionString,
} = applicableTransforms;

function assertError(fn, code) {
  try {
    fn();
    assert.fail('Ожидалась ошибка');
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
  it('находит сбор подобных для 2x + 3x', function() {
    const transforms = listApplicableTransforms('2x + 3x', []);
    assert.ok(transforms.length > 0);
    const likeTerms = transforms.find(t => (
      t.changeType === ChangeTypes.COLLECT_AND_COMBINE_LIKE_TERMS ||
      t.changeType === ChangeTypes.ADD_POLYNOMIAL_TERMS
    ));
    assert.ok(likeTerms);
    assert.strictEqual(print.ascii(likeTerms.preview.newNode), '5x');
  });

  it('не возвращает нерелевантные шаги для подвыражения', function() {
    const transforms = listApplicableTransforms('2*(x+1)', ['args', 1]);
    const hasDistribute = transforms.some(t => t.changeType === ChangeTypes.DISTRIBUTE);
    assert.strictEqual(hasDistribute, false);
  });

  it('applyTransform детерминированно совпадает с preview', function() {
    const transforms = listApplicableTransforms('2x + 3x', []);
    const target = transforms[0];
    const applied = applyTransform('2x + 3x', [], target.id);
    assert.strictEqual(
      print.ascii(applied.newNode),
      print.ascii(target.preview.newNode));
  });

  it('changedPaths префиксируются selectionPath', function() {
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

  it('golden: 2+2 возвращает стабильный id и preview', function() {
    const transforms = listApplicableTransforms('2+2', []);
    assert.strictEqual(transforms.length, 1);
    const transform = transforms[0];
    const signature = print.ascii(transform.preview.newNode);
    const hash = crypto.createHash('sha1').update(signature).digest('hex');
    const expectedId = `arithmeticSearch:${ChangeTypes.SIMPLIFY_ARITHMETIC}:${hash}`;
    assert.strictEqual(transform.id, expectedId);
    assert.strictEqual(signature, '4');
  });

  it('normalizeExpressionString возвращает стабильную строку', function() {
    assert.strictEqual(normalizeExpressionString('2+2'), '2 + 2');
  });

  it('обрабатывает пустой путь как корень', function() {
    const transforms = listApplicableTransforms('2+2', []);
    assert.strictEqual(transforms.length, 1);
    assert.strictEqual(
      print.ascii(transforms[0].preview.newNode),
      '4');
  });

  it('обрабатывает путь до content', function() {
    const transforms = listApplicableTransforms('(2+2)+x', ['args', 0, 'content']);
    assert.ok(transforms.length > 0);
    const arithmetic = transforms.find(t => (
      t.changeType === ChangeTypes.SIMPLIFY_ARITHMETIC
    ));
    assert.ok(arithmetic);
    assert.strictEqual(print.ascii(arithmetic.preview.newNode), '(4) + x');
  });

  it('dedupe byId не удаляет разные преобразования', function() {
    const transforms = listApplicableTransforms('2+2', [], {dedupe: 'byId'});
    assert.strictEqual(transforms.length, 1);
  });

  it('maxTransforms ограничивает количество результатов', function() {
    const transforms = listApplicableTransforms('2+2+2', [], {maxTransforms: 1});
    assert.strictEqual(transforms.length, 1);
  });

  it('includeSubsteps выключает подшаги по умолчанию', function() {
    const transforms = listApplicableTransforms('2x + 3x', []);
    transforms.forEach(transform => {
      assert.strictEqual(transform.preview.substeps.length, 0);
    });
  });

  it('includeSubsteps включает подшаги при наличии', function() {
    const transforms = listApplicableTransforms(
      'x + x + x^2 + x^2',
      [],
      {includeSubsteps: true});
    const withSubsteps = transforms.filter(t => t.preview.substeps.length > 0);
    assert.ok(withSubsteps.length > 0);
  });

  it('parent-контекст не добавляет шаги, если выделенный узел не меняется', function() {
    const transforms = listApplicableTransforms('2+2+3', ['args', 1]);
    assert.strictEqual(transforms.length, 0);
  });

  it('ошибка normalizeExpressionString при неверном выражении', function() {
    assertError(
      () => normalizeExpressionString('2+*'),
      'INVALID_EXPRESSION');
  });

  it('ошибка при некорректном шаге пути', function() {
    assertError(
      () => listApplicableTransforms('2+2', ['bad-step']),
      'INVALID_PATH');
  });

  it('applyTransform учитывает опции dedupe/maxTransforms', function() {
    const options = {dedupe: 'byId', maxTransforms: 1};
    const transforms = listApplicableTransforms('2+2+2', [], options);
    assert.strictEqual(transforms.length, 1);
    const applied = applyTransform('2+2+2', [], transforms[0].id, options);
    assert.strictEqual(
      print.ascii(applied.newNode),
      print.ascii(transforms[0].preview.newNode));
  });

  it('changedPaths корректно префиксируются для глубокого пути', function() {
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

  it('валидирует ошибки', function() {
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
