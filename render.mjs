// bricktop-intro/render.mjs
// Direct render using @remotion/bundler + @remotion/renderer (bypasses CLI config issues)

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const entryPoint = path.resolve('./src/index.tsx');
const publicDir = path.resolve('./public');
const outputLocation = path.resolve('./out/bricktop-intro.mp4');

async function main() {
  console.log('Bundling...');
  const serveUrl = await bundle({
    entryPoint,
    publicDir,
    webpackOverride: (config) => {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve('./src'),
      };
      return config;
    },
  });

  console.log('Selecting composition...');
  const composition = await selectComposition({
    serveUrl,
    id: 'BricktopIntro',
    inputProps: {},
  });

  console.log(`Rendering ${composition.durationInFrames} frames @ ${composition.fps}fps...`);
  await renderMedia({
    serveUrl,
    composition,
    codec: 'h264',
    outputLocation,
    inputProps: {},
    concurrency: 4,
    onProgress: ({ progress }) => {
      process.stdout.write(`\rProgress: ${(progress * 100).toFixed(1)}%`);
    },
  });

  console.log(`\nDone! Output: ${outputLocation}`);
}

main().catch((err) => {
  console.error('Render failed:', err);
  process.exit(1);
});