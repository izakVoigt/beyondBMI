import type { Config } from 'jest';

const testsConfig: Config = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
};

export default testsConfig;
