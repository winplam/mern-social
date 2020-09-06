module.exports = {
  projects: [
    {
      displayName: 'dom',
      testEnvironment: 'jsdom',
      coveragePathIgnorePatterns: ['/node_modules/'],
      testMatch: ['**/__tests__/**/*.test.js?(x)'],
      // setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
      // moduleNameMapper: { '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'identity-obj-proxy' }
    },
    {
      displayName: 'node',
      testEnvironment: 'node',
      coveragePathIgnorePatterns: ['/node_modules/'],
      testMatch: ['**/__tests__/**/*.test.node.js?(x)']
    }
  ]
}
