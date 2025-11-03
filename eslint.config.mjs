import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
]);
