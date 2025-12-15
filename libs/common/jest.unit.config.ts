import type { Config } from 'jest';

const unitTestConfigs: Config = {
  coveragePathIgnorePatterns: ['<rootDir>/src/enums/'],
  displayName: 'lib-common',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
};

export default unitTestConfigs;
