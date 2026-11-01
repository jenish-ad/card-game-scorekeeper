const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Expo import rules need eslint-import-resolver-typescript to resolve TypeScript navigation exports.
module.exports = defineConfig([expoConfig, { ignores: ['dist/**'] }]);
