import type { Config } from 'jest';

const testConfigs: Config = {
  coveragePathIgnorePatterns: ['<rootDir>/src/enums/'],
  displayName: 'lib-common',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
};

export default testConfigs;
