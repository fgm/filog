module.exports = {
  globals: {
    "ts-jest": {
      diagnostics: {
        // Ignore noImplicitAny during tests (needed by browserProcessorTests).
        ignoreCodes: [7017],
      },
    },
  },
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
};
