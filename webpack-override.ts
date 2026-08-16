// bricktop-intro/webpack-override.ts
import type { Configuration } from 'webpack';
import path from 'path';

export function webpackOverride(config: Configuration) {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': path.resolve(__dirname, 'src'),
      },
    },
    externals: [
      ...(config.externals || []),
      /^https?:\/\//,
    ],
    module: {
      ...config.module,
      rules: [
        ...(config.module?.rules || []),
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac|m4a)$/,
          type: 'asset/resource',
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/,
          type: 'asset/resource',
        },
      ],
    },
  };
}