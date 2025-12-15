import type { Config } from 'jest';

const unitTestConfigs: Config = {
  displayName: 'lib-mongoose',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
};

export default unitTestConfigs;
