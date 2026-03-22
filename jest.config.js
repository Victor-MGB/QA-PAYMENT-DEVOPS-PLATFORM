module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/api/**/*.test.js'],
  collectCoverageFrom: ['tests/api/**/*.js', '!tests/api/server.js'],
  coverageDirectory: 'reports/coverage',
  verbose: true,
  testTimeout: 10000
};
