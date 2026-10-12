const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind defaults rem to 14 on native; 16 keeps Tailwind spacing (h-11 = 44px) as written.
module.exports = withNativeWind(config, {
  input: './global.css',
  configPath: './tailwind.config.cjs',
  inlineRem: 16,
});
