import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    files: ['src/**/*.{ts}'],
    ignores: ['src/**/*.spec.ts'],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  { ignores: ['node_modules', 'dist', 'coverage', 'test/**', '*.config.js'] },
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'arrow-body-style': ['error', 'always'],
      'consistent-return': 'warn',
      'func-names': 'off',
      'no-console': 'off',
      'no-empty-function': 'off',
      'no-fallthrough': 'off',
      'no-process-exit': 'off',
      'no-unused-vars': 'warn',
      'object-curly-newline': 'off',
      'object-shorthand': 'off',
      'prefer-destructuring': 'off',
      'prettier/prettier': 'error',
      strict: ['error', 'global'],
      'max-len': [
        'error',
        {
          code: 120,
          ignoreComments: true,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      '@typescript-eslint/dot-notation': 'off',
      'import/prefer-default-export': 'off',
      'lines-between-class-members': 'off',
      '@typescript-eslint/lines-between-class-members': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
