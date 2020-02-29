module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  rules: {
    "prettier/prettier": "error",
    "no-console": "off",
    "linebreak-style": 0,
    "no-underscore-dangle": "off",
    "class-methods-use-this": "off",
    "no-await-in-loop": "off",
    "import/no-unresolved": "off",
    "import/prefer-default-export": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "ts": "never"
      }
    ],
    "import/no-extraneous-dependencies": [
      "error", 
      {
        "devDependencies": [
          "**/*.spec.ts",
          "src/utils/tests/*.ts"
        ]
      }
    ]
  },
};
