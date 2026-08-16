import { Configuration } from "webpack";

export const webpackOverride = (config: Configuration) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "react": "react",
        "react-dom": "react-dom",
      },
    },
  };
};