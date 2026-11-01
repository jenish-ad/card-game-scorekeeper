module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': '<rootDir>/tests/transform.cjs' },
};
