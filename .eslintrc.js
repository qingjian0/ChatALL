module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    "plugin:vue/vue3-recommended"
  ],
  parserOptions: {
    parser: "espree"
  },
  rules: {
    "vue/no-unused-vars": "warn",
    "vue/no-unused-components": "warn",
    "no-console": "warn",
    "no-debugger": "warn"
  }
}
