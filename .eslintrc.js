module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    mocha: true
  },
  extends: [
    "standard"
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 11
  },
  rules: {
    "func-call-spacing": "off",
    "no-unexpected-multiline": "off",
    semi: ["error", "always"],
    quotes: ["error", "double"]
  }
};
