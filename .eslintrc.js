module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'no-empty': 'off',
    'no-useless-escape': 'off',
    'semi': ['error', 'never'],
    'quotes': ['error', 'single'],
    '@typescript-eslint/semi': ['error', 'never'],
  },
};
