module.exports = {
  preset: 'ts-jest',
  modulePaths: ['<rootDir>/src/'],
  testEnvironment: 'node',

  testPathIgnorePatterns: ['/node_modules/'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testRegex: '\\.integration.test\\.(js|ts)$',
  testTimeout: 30000,
};
