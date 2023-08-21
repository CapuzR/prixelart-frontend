const { defaults } = require("jest-config");

const config = {
  moduleFileExtensions: ["js", "json", "es6", "jsx"],
  unmockedModulePathPatterns: ["/node_modules/react"],
};

module.exports = config;
