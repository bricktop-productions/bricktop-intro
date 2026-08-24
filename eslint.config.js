import remotion from "@remotion/eslint-config";

export default [
  ...remotion,
  {
    ignores: ["out/", "public/bricktop-audio.wav", "node_modules/", ".git/", "dist/"],
  },
];