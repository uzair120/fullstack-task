export default {
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js"],
  coverageDirectory: "./coverage",
  collectCoverageFrom: ["src/**/*.js"],
  setupFiles: ["./jest.setup.js"] // Path to setup file (for mocking fetch)
};

process.env.NODE_ENV = "test";
