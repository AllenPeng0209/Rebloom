// Global test setup for Rebloom
import 'react-native-gesture-handler/jestSetup'
import '@testing-library/jest-native/extend-expect'

// Mock AsyncStorage
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native')
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  }
})

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    manifest: {
      extra: {
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-anon-key',
      },
    },
  },
}))

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}))

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useGlobalSearchParams: () => ({}),
}));

// Mock Audio recording
jest.mock('expo-av', () => ({
  Audio: {
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn(),
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getURI: jest.fn(() => 'file://test-recording.m4a'),
    })),
    setAudioModeAsync: jest.fn(),
    RECORDING_OPTION_ANDROID_ENCODER_AAC: 'aac',
    RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4: 'mp4',
    RECORDING_OPTION_IOS_ENCODER_AAC: 'aac',
    RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC: 'mp4',
  },
}));

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  return {
    ...RN,
    Alert: {
      alert: jest.fn((title, message, buttons) => {
        if (buttons && buttons.length > 0) {
          buttons[0].onPress && buttons[0].onPress()
        }
      }),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((options) => options.ios || options.default),
    },
    Linking: {
      openURL: jest.fn(() => Promise.resolve()),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
    },
    Vibration: {
      vibrate: jest.fn(),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  }
})

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    })),
  })),
}));

// Mock OpenAI/AI services
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(() => Promise.resolve({
            choices: [{
              message: {
                content: 'This is a test AI response for mental health support.',
              },
            }],
            usage: {
              prompt_tokens: 50,
              completion_tokens: 20,
              total_tokens: 70,
            },
          })),
        },
      },
    })),
  }
})

// Mock crypto for Node.js environment
if (typeof global.crypto === 'undefined') {
  const crypto = require('crypto')
  global.crypto = {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
  }
}

// Mock TextEncoder/TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Setup fake timers
jest.useFakeTimers()

// Console warning suppression for tests
const originalWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalWarn.call(console, ...args)
}

// Global test helpers
global.testTimeout = 10000

// Environment variables for testing
process.env.NODE_ENV = 'test'
process.env.JEST = 'true'
