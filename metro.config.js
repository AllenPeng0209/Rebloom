const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 強制清理緩存
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

// 添加路径别名解析（避免過於寬泛的 '@' 根映射導致誤解析）
config.resolver.alias = {
  '@/components': path.resolve(__dirname, 'src/components'),
  '@/hooks': path.resolve(__dirname, 'src/hooks'),
  '@/constants': path.resolve(__dirname, 'lib/constants'),
  '@/lib': path.resolve(__dirname, 'lib'),
  '@/utils': path.resolve(__dirname, 'lib/utils'),
  '@/services': path.resolve(__dirname, 'lib/services'),
  '@/types': path.resolve(__dirname, 'lib/types'),
  '@/contexts': path.resolve(__dirname, 'src/contexts'),
  '@/translations': path.resolve(__dirname, 'lib/translations'),
  '@/ui': path.resolve(__dirname, 'src/components/ui'),
};

// 強制重新解析模塊
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;

