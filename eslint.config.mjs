export default [
  {
    ignores: ["out/", "public/bricktop-audio.wav", "node_modules/", ".git/", "dist/"],
  },
  {
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
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
    },
    settings: {
      react: {
        version: "18.3",
      },
    },
  },
];