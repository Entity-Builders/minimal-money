const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch the shared packages directory
// Watch the shared packages directory
const workspaceRoot = path.resolve(__dirname, '../..');
config.watchFolders = [workspaceRoot];

// Ensure we resolve node_modules correctly
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.assetExts.push('riv');

module.exports = config;
