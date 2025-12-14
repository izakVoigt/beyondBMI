import type { Config } from 'jest';

const testsConfig: Config = {
  coveragePathIgnorePatterns: ['<rootDir>/src/app/configs/logger/'],
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
};

export default testsConfig;
