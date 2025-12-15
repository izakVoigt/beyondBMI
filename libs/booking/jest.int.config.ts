import type { Config } from 'jest';

const intTestConfigs: Config = {
  coveragePathIgnorePatterns: ['<rootDir>/src/common/'],
  displayName: 'lib-booking',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
};

export default intTestConfigs;
