module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    'eslint:recommended',
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/recommended',
    'plugin:prettier/recommended',
  ],
  // required to lint *.vue files
  plugins: ['vue', 'prettier'],
  // add your custom rules here
  rules: {
    'linebreak-style': 'off',

    'import/no-unresolved': 'off',

    'generator-star-spacing': 'off',

    'no-lonely-if': 'off',

    'dot-notation': 'off',

    'prefer-const': 'warn',

    'max-len': 'off',

    // Allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'no-unused-vars': 'off',

    'no-extra-parens': 'off',

    'no-extra-semi': 2,

    // Force curly braces for control flow,
    // including if blocks with a single statement
    curly: ['error', 'all'],

    // No async function without await
    'require-await': 'error',

    'no-var': 'error',

    // Force object shorthand where possible
    'object-shorthand': 'error',

    // No useless destructuring/importing/exporting renames
    'no-useless-rename': 'error',

    'object-curly-spacing': 'off',

    'arrow-parens': 'warn',

    'vue/attributes-order': 'off',

    'vue/singleline-html-element-content-newline': 'off',

    'vue/mustache-interpolation-spacing': 'off',

    'vue/max-attributes-per-line': 'off',

    'vue/html-closing-bracket-newline': 'off',

    'vue/html-closing-bracket-spacing': 'off',

    'vue/no-v-html': 'off',

    'vue/html-indent': 'off',

    'vue/require-default-prop': 'off',

    'vue/require-prop-types': 'off',

    // Disable template errors regarding invalid end tags
    'vue/no-parsing-error': [
      'error',
      {
        'x-invalid-end-tag': false,
      },
    ],

    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
  },
}
