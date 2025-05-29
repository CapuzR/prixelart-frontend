import js from "@eslint/js";
import react from "eslint-plugin-react";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import unicorn from "eslint-plugin-unicorn";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        allowJs: true,
      },
    },
    plugins: {
      react,
      "@typescript-eslint": typescript,
      unicorn,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            pascalCase: true,
            kebabCase: false,
          },
          ignore: ["\\.json$", "\\.config\\.js$"],
        },
      ],
    },
  },
];
