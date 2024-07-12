module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  plugins: ['security', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 'error',
    'func-names': 'off',
    'no-underscore-dangle': 'off',
    'consistent-return': 'off',
    'security/detect-object-injection': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-unused-private-class-members': 'off',
    'no-use-before-define': 'off',
  },
};
