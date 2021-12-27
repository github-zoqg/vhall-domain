module.exports = {
    root: true,
    env: {
      node: true,
      browser: true
    },
    extends: [
      'eslint:recommended', // eslint的建议规则，参考：https://eslint.bootcss.com/docs/rules/
    ],
    parserOptions: {
      parser: 'babel-eslint'
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn'
    }
  };
  