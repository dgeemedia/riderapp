const createExpoWebpackConfig = require('@expo/webpack-config');

module.exports = function (env, argv) {
  const config = createExpoWebpackConfig(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@expo/vector-icons']
      }
    },
    argv
  );
  
  // Customize config here
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
    stream: false,
    path: false,
    fs: false
  };
  
  return config;
};