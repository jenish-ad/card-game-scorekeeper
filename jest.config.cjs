module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': '<rootDir>/tests/transform.cjs' },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/features/marriage/domain/**/*.ts',
    'src/i18n/calendar/**/*.ts',
  ],
  coverageThreshold: {
    './src/features/marriage/domain/': { lines: 90, branches: 90 },
    './src/i18n/calendar/': { lines: 90, branches: 90 },
  },
};
