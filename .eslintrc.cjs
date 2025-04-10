/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "next/core-web-vitals",
    "prettier", // Make sure prettier is last to override other configs
    "plugin:storybook/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    project: true,
  },
  plugins: ["react", "@typescript-eslint", "jsx-a11y", "import", "drizzle"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // Possible errors
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "warn",

    // Best practices
    eqeqeq: ["error", "always", { null: "ignore" }],
    "no-var": "error",
    "prefer-const": "warn",

    // TypeScript specific
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],

    // React specific
    "react/prop-types": "off", // Not needed with TypeScript
    "react/react-in-jsx-scope": "off", // Not needed in Next.js
    "react/display-name": "off",
    "react/jsx-curly-brace-presence": [
      "warn",
      { props: "never", children: "never" },
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Import rules
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],

    // JSX accessibility
    "jsx-a11y/anchor-is-valid": "warn",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/no-static-element-interactions": "warn",

    // Next.js specific
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off", // Use Image when needed but don't enforce

    // Drizzle rules
    "drizzle/enforce-delete-with-where": [
      "error",
      {
        drizzleObjectName: ["db", "ctx.db"],
      },
    ],
    "drizzle/enforce-update-with-where": [
      "error",
      {
        drizzleObjectName: ["db", "ctx.db"],
      },
    ],
  },
  overrides: [
    // Override for test files
    {
      files: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/tests/**/*",
        "**/__tests__/**/*",
      ],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
    // Override for Storybook files
    {
      files: ["**/*.stories.*"],
      rules: {
        "import/no-anonymous-default-export": "off",
      },
    },
  ],
};
