import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
    {
        ignores: [
            'node_modules/**',
            'build/**',
            'dist/**',
            'backend/**',
            '**/__fixtures__/**',
        ],
    },
    { linterOptions: { reportUnusedDisableDirectives: 'off' } },
    js.configs.recommended,
    prettier,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: { ...globals.browser, ...globals.es2021 },
        },
        rules: {
            quotes: ['error', 'single', { avoidEscape: true }],
            semi: ['error', 'always'],
            'no-unused-vars': 'off',
            'no-prototype-builtins': 'off',
        },
    },
    {
        files: ['**/*.test.js', 'src/setupTests.js'],
        languageOptions: { globals: { ...globals.vitest, ...globals.node } },
    },
    {
        files: ['bin/**/*.js', '*.config.js'],
        languageOptions: { globals: { ...globals.node } },
    },
    {
        files: ['public/service-worker.js'],
        languageOptions: { globals: { ...globals.serviceworker } },
    },
];
