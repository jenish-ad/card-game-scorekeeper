const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', '.expo/**', 'android/**', 'ios/**', 'coverage/**'] },
  {
    files: ['src/features/marriage/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/features/marriage',
              message:
                'Domain must not import the feature presentation barrel.',
            },
          ],
          patterns: [
            {
              group: [
                'react',
                'react/*',
                'react-native',
                'react-native/*',
                'expo',
                'expo-*',
                '@/app/**',
                '@/theme',
                '@/theme/**',
                '**/theme/**',
                '@/storage',
                '@/storage/**',
                '@/i18n',
                '@/i18n/**',
                '@/ui',
                '@/ui/**',
                '**/storage/**',
                '**/i18n/**',
                '**/ui/**',
                '@/features/marriage/data/**',
                '@/features/marriage/components/**',
                '@/features/marriage/screens/**',
                '../data/**',
                '../components/**',
                '../screens/**',
              ],
              message:
                'Domain modules must remain pure and independent of presentation and persistence.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features', '@/features/**', '**/features/**'],
              message: 'The design system must not depend on features.',
            },
          ],
        },
      ],
    },
  },
]);
