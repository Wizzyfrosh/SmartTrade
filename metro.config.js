// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for additional asset types including icon fonts
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

module.exports = config;
