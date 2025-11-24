
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./src/valdi/_configs/eslint.tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'unused-imports', 'rxjs', 'prettier', '@snapchat/eslint-plugin-valdi'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: { 
    '@snapchat/valdi/attributed-text-no-array-assignment': 'error',
    '@snapchat/valdi/jsx-no-lambda': 'error',
    '@snapchat/valdi/assign-timer-id': 'error',
    '@snapchat/valdi/only-const-enum': 'off',
    '@snapchat/valdi/no-implicit-index-import': 'error',
    '@snapchat/valdi/mutate-state-without-set-state': 'error',
    '@snapchat/valdi/no-import-from-test-outside-test-dir': 'error',
    '@snapchat/valdi/no-declare-test-without-describe': 'error', 
  },
};
