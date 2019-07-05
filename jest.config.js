module.exports = {
  globals: {
    "ts-jest": {
      diagnostics: {
        // Ignore noImplicitAny during tests (needed by browserProcessorTests).
        ignoreCodes: [7017, 7053],
      },
    },
  },
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
};
