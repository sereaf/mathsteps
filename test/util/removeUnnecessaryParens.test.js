const math = require('mathjs');

const print = require('../../lib/util/print');
const removeUnnecessaryParens = require('../../lib/util/removeUnnecessaryParens');

const TestUtil = require('../TestUtil');

function testRemoveUnnecessaryParens(exprStr, outputStr) {
  const input = removeUnnecessaryParens(math.parse(exprStr));
  TestUtil.testFunctionOutput(print.ascii, input, outputStr);
}

describe('removeUnnecessaryParens', function () {
  const tests = [
    ['(x+4) + 12', 'x + 4 + 12'],
    ['-(x+4x) + 12', '-(x + 4x) + 12'],
    ['x + (12)', 'x + 12'],
    ['x + (y)', 'x + y'],
    ['x + -(y)', 'x - y'],
    ['((3 - 5)) * x', '(3 - 5) * x'],
    ['((3 - 5)) * x', '(3 - 5) * x'],
    ['(((-5)))', '-5'],
    ['((4+5)) + ((2^3))', '(4 + 5) + 2^3'],
    ['(2x^6 + -50 x^2) - (x^4)', '2x^6 - 50x^2 - x^4'],
    ['(x+4) - (12 + x)', 'x + 4 - (12 + x)'],
    ['(2x)^2', '(2x)^2'],
    ['((4+x)-5)^(2)', '(4 + x - 5)^2'],
    // TODO: removeUnnecessaryParens does not always remove all unnecessary parens in a single pass
    // For example, the output below is acheived only by running the input through rUP at least twice
    // ['((3)/2) * x', '3/2 x']
    // This behavior was already the partial cause of one bug (which was fixed in a different way),
    // so if we notice it causing additional issues in the future we probably want to address.
  ];
  tests.forEach(t => testRemoveUnnecessaryParens(t[0], t[1]));
});
