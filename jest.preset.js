import nxPreset from '@nx/jest/preset.js';

/**
 * @type {import('jest').Config}
 */
export default {
  ...nxPreset,
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,ts}'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: {
    '^@libs/common/(.*)$': '<rootDir>/../../libs/common/src/$1',
  },
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  transformIgnorePatterns: ['node_modules/(?!(@faker-js)/)'],
};
