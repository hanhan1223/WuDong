import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/*.test.ts", "**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/setup\\.ts$"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/__tests__/**",
    "!src/**/*.d.ts",
    "!src/configuration.ts",
  ],
  coverageDirectory: "coverage",
};

export default config;
