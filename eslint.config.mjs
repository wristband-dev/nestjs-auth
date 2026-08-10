import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginN from 'eslint-plugin-n';

export default tseslint.config(
  {
    ignores: ['node_modules', 'dist', 'coverage', '*.config.js'],
  },
  ...tseslint.configs.recommended,
  pluginN.configs['flat/recommended'],
  prettier,
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
    plugins: {
      prettier: pluginPrettier,
      import: pluginImport,
    },
    rules: {
      'consistent-return': 'warn',
      'no-console': 'off',
      'no-fallthrough': 'off',
      'no-process-exit': 'off',
      'n/no-missing-import': 'off',
      'n/no-process-exit': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prettier/prettier': 'error',
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
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['test/**', '**/*.spec.ts'] },
      ],
    },
  },
  {
    files: ['test/**/*.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'n/no-missing-import': 'off',
      'n/no-unpublished-import': 'off',
    },
  }
);
