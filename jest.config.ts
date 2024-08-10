// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Optionally, you can add more configurations here
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "./test-results" }]
  ]
};

export default config;
