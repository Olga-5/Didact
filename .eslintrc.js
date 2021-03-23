module.exports = {
  parser: "babel-eslint",
  extends: ["airbnb", "prettier"],
  plugins: ["prettier", "react-hooks"],
  env: {
    browser: true,
  },
  settings: {
    "import/resolver": {
      node: {
        paths: ["src"],
      },
    },
  },
  rules: {
    "import/prefer-default-export": 0,
    "import/no-cycle": 0,
    "import/no-named-default": 0,
    "import/no-extraneous-dependencies": 0,
    "import/extensions": ["error", "never", { packages: "always" }],
    "react/jsx-filename-extension": ["error", { extensions: [".js", ".jsx"] }],
    "prettier/prettier": "error",
    "react/destructuring-assignment": 0,
    "react/jsx-one-expression-per-line": 2,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-use-before-define": "off",
    "no-underscore-dangle": "off",
    "react/jsx-curly-newline": 0,
    "react/jsx-props-no-spreading": 0,
    "no-return-assign": 0,
    "consistent-return": 0,
  },
};
