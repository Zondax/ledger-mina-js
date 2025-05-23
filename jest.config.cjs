module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/integration/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation)",
  ],
  projects: [
    {
      displayName: "Node",
      testEnvironment: "node",
      testMatch: ["**/tests/integration/node/**/*.test.ts"],
      transform: {
        "^.+\\.ts$": [
          "ts-jest",
          {
            tsconfig: "tsconfig.json",
            useESM: true,
          },
        ],
      },
    },
    {
      displayName: "Extension",
      testEnvironment: "./tests/integration/extension/environment.ts",
      testMatch: ["**/tests/integration/extension/**/*.test.ts"],
      transform: {
        "^.+\\.ts$": [
          "ts-jest",
          {
            tsconfig: "tsconfig.json",
            useESM: false,
          },
        ],
      },
    },
  ],
};
