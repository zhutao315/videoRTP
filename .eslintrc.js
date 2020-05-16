const __DEV__ = (process.env.NODE_ENV || 'development') === 'development'
module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  globals: {
    console: true,
  },
  extends: ['standard', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'eol-last': 0,
    'comma-dangle': 0,
    'prefer-promise-reject-errors': 0,
    'no-var': 1,
    'no-alert': 1,
    'no-unused-vars': __DEV__ ? 1 : 2,
    'no-debugger': __DEV__ ? 1 : 2,
    'no-console': [
      __DEV__ ? 1 : 2,
      {
        allow: ['info', 'warn', 'error'],
      },
    ],
  },
}
