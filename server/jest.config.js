/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000, // mongodb-memory-server needs time to start
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
  ],
  coverageThreshold: {
    global: {
      lines:      75,
      functions:  85,
      branches:   40,
      statements: 75,
    },
  },
};
