import type { Config } from 'jest';

const testConfigs: Config = {
  displayName: 'lib-common',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
};

export default testConfigs;
