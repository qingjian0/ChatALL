{
  "root": true,
  "env": {
    "node": true,
    "browser": true
  },
  "extends": [
    "plugin:vue/vue3-recommended",
    "@vue/eslint-config-prettier"
  ],
  "parserOptions": {
    "parser": "babel-eslint"
  },
  "rules": {
    "vue/no-unused-vars": "warn",
    "vue/no-unused-components": "warn",
    "prettier/prettier": "warn",
    "no-console": "warn",
    "no-debugger": "warn"
  }
}