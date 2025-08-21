module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/constants': './lib/constants',
            '@/lib': './src/lib',
            '@/utils': './lib/utils',
            '@/services': './src/services',
            '@/types': './src/types',
            '@/contexts': './src/contexts',
            '@/translations': './lib/translations',
            '@/ui': './src/components/ui',
          },
        },
      ],
    ],
  };
};
