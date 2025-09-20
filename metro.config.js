
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure these file extensions are supported
config.resolver.assetExts.push(
  // Adds support for `.db` files for SQLite databases
  'db'
);

config.resolver.sourceExts.push(
  // Adds support for `.sql` files
  'sql'
);

module.exports = config;
