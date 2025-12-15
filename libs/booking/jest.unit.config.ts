import type { Config } from 'jest';

const unitTestConfigs: Config = {
  coveragePathIgnorePatterns: [
    '<rootDir>/src/common/constants/',
    '<rootDir>/src/common/contracts/',
    '<rootDir>/src/common/enums/',
  ],
  displayName: 'lib-booking',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
};

export default unitTestConfigs;
