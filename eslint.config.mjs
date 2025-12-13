import eslint from '@eslint/js';
import nx from '@nx/eslint-plugin';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import checkFilePlugin from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import tsEslint from 'typescript-eslint';

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...tsEslint.configs.recommended,
  eslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ['node_modules', '.nx', '**/dist'],
  },
  {
    files: ['**/*.test.ts'],
    languageOptions: {
      globals: jest.environments.globals.globals,
    },
    plugins: { jest },
  },
  {
    files: ['**/*.{js,jsx,cjs,mjs,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      'check-file': checkFilePlugin,
      import: importPlugin,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$', '^@[^/]+/'],
          depConstraints: [
            {
              onlyDependOnLibsWithTags: ['platform:mobile', 'platform:isomorphic'],
              sourceTag: 'platform:mobile',
            },
            {
              onlyDependOnLibsWithTags: ['platform:server', 'platform:isomorphic'],
              sourceTag: 'platform:server',
            },
          ],
          enforceBuildableLibDependency: true,
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description', 'ts-ignore': 'allow-with-description' },
      ],
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public',
          },
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            'public-static-field',
            'protected-static-field',
            'private-static-field',
            'public-constructor',
            'constructor',
            'public-instance-method',
            'private-instance-method',
          ],
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: ['PascalCase'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          selector: 'classMethod',
        },
        {
          custom: {
            match: false,
            regex: '^I[A-Z]',
          },
          format: ['PascalCase'],
          selector: 'interface',
        },
        {
          format: ['camelCase', 'PascalCase'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['private'],
          selector: 'memberLike',
        },
        {
          format: ['PascalCase'],
          selector: 'typeAlias',
        },
        {
          format: ['PascalCase'],
          prefix: ['T'],
          selector: 'typeParameter',
        },
        {
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          selector: 'variable',
        },
      ],
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-explicit-any': [
        'warn',
        {
          fixToUnknown: true,
          ignoreRestArgs: true,
        },
      ],
      '@typescript-eslint/no-namespace': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{jsx,tsx,ts,js}$': 'KEBAB_CASE',
        },
      ],
      'check-file/folder-naming-convention': ['error', { '*': 'KEBAB_CASE' }],
      complexity: ['error', 6],
      'import/order': [
        'error',
        {
          alphabetize: { caseInsensitive: true, order: 'asc' },
          groups: [['type'], ['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
        },
      ],
      'max-depth': ['error', 2],
      'no-console': 'warn',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-empty': 'error',
      'no-restricted-syntax': [
        'error',
        {
          message: "Use 'import type { ... }' instead of 'import { type ... }'.",
          selector: "ImportSpecifier[importKind='type']",
        },
      ],
      'sort-keys': ['error', 'asc', { caseSensitive: true }],
    },
  },
];
