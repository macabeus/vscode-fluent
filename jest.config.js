
const tsPreset = require('ts-jest/jest-preset')

module.exports = {
  testEnvironment: 'node',
  ...tsPreset,
}
