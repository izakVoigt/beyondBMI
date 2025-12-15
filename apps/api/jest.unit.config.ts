import type { Config } from 'jest';

const testsConfig: Config = {
  coveragePathIgnorePatterns: [
    '<rootDir>/src/app/configs/databases/',
    '<rootDir>/src/app/configs/logger/',
    '<rootDir>/src/app/configs/server.ts',
    '<rootDir>/src/main.ts',
  ],
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
};

export default testsConfig;
