module.exports = {
  "env": {
    "commonjs": true,
    "es6": true,
    "node": true,
    "mocha": true,
  },
  "extends": [
    "standard",
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly",
  },
  "parserOptions": {
    "ecmaVersion": 11,
  },
  "rules": {
    "func-call-spacing": "off",
    "space-before-function-paren": ["error", "never"],
    "no-unexpected-multiline": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "comma-dangle": ["error", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "exports": "always-multiline",
      "functions": "never",
    }],
    "quote-props": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "object-curly-spacing": ["error", "never"],
  },
};
