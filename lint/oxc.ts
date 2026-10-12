import { defineConfig } from 'oxlint';
export default defineConfig({
  plugins: ['oxc'],
  rules: {
    'oxc/bad-array-method-on-arguments': 'error',
    'oxc/bad-char-at-comparison': 'error',
    'oxc/bad-comparison-sequence': 'error',
    'oxc/bad-match-all-arg': 'error',
    'oxc/bad-min-max-func': 'error',
    'oxc/bad-object-literal-comparison': 'error',
    'oxc/bad-replace-all-arg': 'error',
    'oxc/const-comparisons': 'error',
    'oxc/double-comparisons': 'error',
    'oxc/erasing-op': 'error',
    'oxc/missing-throw': 'error',
    'oxc/number-arg-out-of-range': 'error',
    'oxc/only-used-in-recursion': 'error',
    'oxc/uninvoked-array-callback': 'error',

    'oxc/approx-constant': 'error',
    'oxc/misrefactored-assign-op': 'error',
    'oxc/no-async-endpoint-handlers': 'off',
    'oxc/no-this-in-exported-function': 'error',

    'oxc/branches-sharing-code': 'warn',

    'oxc/no-accumulating-spread': 'error',
    'oxc/no-map-spread': 'warn',

    'oxc/bad-bitwise-operator': 'error',
    'oxc/no-async-await': 'off',
    'oxc/no-barrel-file': 'off',
    'oxc/no-const-enum': 'error',
    'oxc/no-optional-chaining': 'off',
    'oxc/no-rest-spread-properties': 'off',
  },
});
