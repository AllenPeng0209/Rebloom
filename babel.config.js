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
            '@': './',
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/constants': './lib/constants',
            '@/lib': './lib',
            '@/utils': './lib/utils',
            '@/services': './lib/services',
            '@/types': './lib/types',
            '@/contexts': './src/contexts',
            '@/translations': './lib/translations',
            '@/ui': './src/components/ui',
          },
        },
      ],
    ],
  };
};
