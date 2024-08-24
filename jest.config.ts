import { createDefaultPreset, type JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  transform: {
    ...createDefaultPreset().transform,
  },
  moduleNameMapper: {
    "^@App/(.*)$": "<rootDir>/server/src/$1",
  },
  testMatch: ["**/test/*.test.ts"],
};

console.log(jestConfig);

export default jestConfig;
