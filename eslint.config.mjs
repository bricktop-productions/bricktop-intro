import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["out/**", "public/bricktop-audio.wav", "node_modules/**", ".git/**", "dist/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly",
        HTMLElement: "readonly",
        HTMLCanvasElement: "readonly",
        Audio: "readonly",
        Image: "readonly",
        fetch: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
    },
    settings: {
      react: {
        version: "18.3",
      },
    },
  }
);