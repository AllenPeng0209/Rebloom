module.exports = {
  // Test environment for React Native
  preset: 'jest-expo',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/src/$1',
    '^~/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  
  // Test match patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.(js|jsx|ts|tsx)',
    '<rootDir>/tests/**/*.spec.(js|jsx|ts|tsx)',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'backend/src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!backend/src/**/*.d.ts',
    '!src/types/**/*',
    '!backend/src/types/**/*',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Test environment options
  testEnvironment: 'jsdom',
  
  // Transform ignore patterns for node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo-.*|@expo/.*|react-native-.*|@react-navigation|@supabase)/)',
  ],
  
  // Mock files
  moduleDirectories: ['node_modules', '<rootDir>/'],
  
  // Global setup
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
}