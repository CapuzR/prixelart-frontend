// const { defaults } = require("jest-config");

module.exports = {
  testEnvironment: "jsdom",
  // moduleFileExtensions: ["js", "jsx", "json", "es6"],
  // moduleDirectories: ["node_modules", "src"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  // moduleNameMapper: {
  //   "\\.(css|less)$": "identity-obj-proxy",
  // },
  // setupFilesAfterEnv: ["./setupTests.js"],
};
