module.exports = {
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node",
  ],
  "testPathIgnorePatterns": [
    "<rootDir>/lib",
    "<rootDir>/node_modules/"
  ],
  "testEnvironment": "node",
  // Accept anything called .(spec|test).[js]jx? in __tests__ or root (or /lib).
  testRegex: "(/__tests__/.*|(\\.|/)(spec|test))\\.(jsx?|tsx?)$",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  "verbose": true,
};
