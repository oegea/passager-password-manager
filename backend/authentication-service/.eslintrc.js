module.exports = {
    env: {
      browser: true,
      es2021: true
    },
    extends: 'standard-with-typescript',
    overrides: [
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: './tsconfig.json'
    },
    rules: {
      "@typescript-eslint/no-floating-promises": 0,
      "@typescript-eslint/strict-boolean-expressions": 0
    }
  }
  