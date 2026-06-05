import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules', 'uploads'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Args con _ (callbacks de Multer: _req, _file) son intencionales.
      // ignoreRestSiblings: permite `const { x, ...rest } = obj` para omitir `x`
      // (p.ej. quitar correct_option del payload del alumno).
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
    },
  },
];
