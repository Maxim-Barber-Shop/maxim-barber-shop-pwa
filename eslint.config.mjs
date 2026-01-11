import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import pluginQuery from '@tanstack/eslint-plugin-query';

/** @type {import('eslint').FlatConfig[]} */
export default [
  {
    ignores: ['node_modules', '.next', 'out', 'dist', '**/*.config.js', '!eslint.config.mjs'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  ...pluginQuery.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': [
        'error',
        {
          printWidth: 120,
          tabWidth: 2,
          singleQuote: true,
          endOfLine: 'auto',
        },
      ],
    },
  },
];
