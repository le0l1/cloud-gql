module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: "airbnb-base",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      legacyDecorators: true
    },
    sourceType: "module"
  },
  rules: {
    "import/prefer-default-export": "off",
    "import/no-cycle": "off"
  }
};
