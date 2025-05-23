module.exports = {
  preset: "ts-jest",
  testEnvironment: "./tests/integration/extension/environment.ts",
  testMatch: ["**/tests/integration/extension/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
};
