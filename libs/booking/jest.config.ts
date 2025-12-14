import type { Config } from 'jest';

const testConfigs: Config = {
  coveragePathIgnorePatterns: ['<rootDir>/src/common/contracts/'],
  displayName: 'lib-booking',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
};

export default testConfigs;
