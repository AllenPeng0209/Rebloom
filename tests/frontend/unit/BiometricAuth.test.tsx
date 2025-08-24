import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import { Alert } from 'react-native'
import { BiometricAuthScreen } from '../../../src/components/auth/BiometricAuthScreen'
import { BiometricAuth } from '../../../src/components/privacy/BiometricAuth'

// Mock expo-local-authentication
const mockLocalAuthentication = {
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3
  },
  AuthenticationResult: {
    SUCCESS: 'success',
    CANCEL: 'cancel',
    LOCKOUT: 'lockout',
    SYSTEM_CANCEL: 'system_cancel',
    USER_CANCEL: 'user_cancel'
  }
}

jest.mock('expo-local-authentication', () => mockLocalAuthentication)

// Mock SecureStore
const mockSecureStore = {
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn().mockResolvedValue(true)
}

jest.mock('expo-secure-store', () => mockSecureStore)

// Mock platform APIs
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  return {
    ...RN,
    Alert: {
      alert: jest.fn()
    },
    Platform: {
      OS: 'ios',
      Version: '17.0'
    }
  }
})

// Mock biometric service
const mockBiometricService = {
  checkBiometricSupport: jest.fn(),
  enableBiometricAuth: jest.fn(),
  disableBiometricAuth: jest.fn(),
  authenticateWithBiometrics: jest.fn(),
  getBiometricSettings: jest.fn(),
  updateBiometricSettings: jest.fn()
}

jest.mock('../../../src/services/biometricService', () => ({
  biometricService: mockBiometricService
}))

describe('Biometric Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockLocalAuthentication.hasHardwareAsync.mockResolvedValue(true)
    mockLocalAuthentication.isEnrolledAsync.mockResolvedValue(true)
    mockLocalAuthentication.supportedAuthenticationTypesAsync.mockResolvedValue([1, 2]) // Fingerprint and Face
    mockLocalAuthentication.authenticateAsync.mockResolvedValue({
      success: true,
      error: null
    })
  })

  describe('BiometricAuthScreen', () => {
    const mockProps = {
      onAuthSuccess: jest.fn(),
      onAuthFailed: jest.fn(),
      onAuthCancel: jest.fn(),
      userId: 'test-user-123'
    }

    it('should detect biometric hardware availability', async () => {
      const { getByTestId } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        expect(mockLocalAuthentication.hasHardwareAsync).toHaveBeenCalled()
        expect(mockLocalAuthentication.supportedAuthenticationTypesAsync).toHaveBeenCalled()
        expect(getByTestId('biometric-available-indicator')).toBeTruthy()
      })
    })

    it('should show available biometric types', async () => {
      const { getByText } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        expect(getByText('Touch ID')).toBeTruthy()
        expect(getByText('Face ID')).toBeTruthy()
      })
    })

    it('should handle no biometric hardware', async () => {
      mockLocalAuthentication.hasHardwareAsync.mockResolvedValue(false)

      const { getByText } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        expect(getByText('Biometric authentication is not available on this device')).toBeTruthy()
      })
    })

    it('should handle no enrolled biometrics', async () => {
      mockLocalAuthentication.isEnrolledAsync.mockResolvedValue(false)

      const { getByText } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        expect(getByText('No biometrics enrolled')).toBeTruthy()
        expect(getByText('Please set up biometrics in device settings')).toBeTruthy()
      })
    })

    it('should perform biometric authentication successfully', async () => {
      const { getByTestId } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      expect(mockLocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Authenticate to access your mental health data',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        requireConfirmation: true
      })

      await waitFor(() => {
        expect(mockProps.onAuthSuccess).toHaveBeenCalled()
      })
    })

    it('should handle authentication failure', async () => {
      mockLocalAuthentication.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'Authentication failed'
      })

      const { getByTestId } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      await waitFor(() => {
        expect(mockProps.onAuthFailed).toHaveBeenCalledWith('Authentication failed')
      })
    })

    it('should handle authentication cancellation', async () => {
      mockLocalAuthentication.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'user_cancel'
      })

      const { getByTestId } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      await waitFor(() => {
        expect(mockProps.onAuthCancel).toHaveBeenCalled()
      })
    })

    it('should provide fallback authentication options', async () => {
      mockLocalAuthentication.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'lockout'
      })

      const { getByText, getByTestId } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      await waitFor(() => {
        expect(getByText('Too many failed attempts')).toBeTruthy()
        expect(getByTestId('fallback-auth-button')).toBeTruthy()
      })
    })

    it('should handle device-specific biometric types', async () => {
      // Test iOS Face ID
      mockLocalAuthentication.supportedAuthenticationTypesAsync.mockResolvedValue([2])

      const { getByText } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        expect(getByText('Face ID')).toBeTruthy()
        expect(getByText('Position your face in front of the camera')).toBeTruthy()
      })
    })

    it('should provide accessibility support', async () => {
      const { getByA11yLabel, getByA11yHint } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        expect(getByA11yLabel('Authenticate with biometrics')).toBeTruthy()
        expect(getByA11yHint('Double tap to start biometric authentication')).toBeTruthy()
      })
    })

    it('should show authentication prompt with appropriate messaging', async () => {
      const sensitiveProps = {
        ...mockProps,
        context: 'crisis_resources',
        promptMessage: 'Authenticate to access crisis support resources'
      }

      const { getByTestId } = render(
        <BiometricAuthScreen {...sensitiveProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      expect(mockLocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          promptMessage: 'Authenticate to access crisis support resources'
        })
      )
    })

    it('should handle rapid authentication attempts', async () => {
      const { getByTestId } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        
        // Rapid button presses
        fireEvent.press(authButton)
        fireEvent.press(authButton)
        fireEvent.press(authButton)
      })

      // Should only trigger authentication once
      expect(mockLocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1)
    })
  })

  describe('BiometricAuth Component', () => {
    const mockProps = {
      onEnableBiometrics: jest.fn(),
      onDisableBiometrics: jest.fn(),
      userId: 'test-user-123',
      currentSettings: {
        enabled: false,
        availableTypes: ['fingerprint', 'face'],
        preferredType: 'fingerprint'
      }
    }

    it('should render biometric settings interface', () => {
      const { getByText, getByTestId } = render(
        <BiometricAuth {...mockProps} />
      )

      expect(getByText('Biometric Authentication')).toBeTruthy()
      expect(getByTestId('biometric-toggle')).toBeTruthy()
      expect(getByTestId('biometric-type-selector')).toBeTruthy()
    })

    it('should enable biometric authentication', async () => {
      const { getByTestId } = render(
        <BiometricAuth {...mockProps} />
      )

      const toggle = getByTestId('biometric-toggle')
      fireEvent(toggle, 'onValueChange', true)

      await waitFor(() => {
        expect(mockProps.onEnableBiometrics).toHaveBeenCalledWith({
          types: ['fingerprint', 'face'],
          preferredType: 'fingerprint'
        })
      })
    })

    it('should disable biometric authentication', async () => {
      const enabledProps = {
        ...mockProps,
        currentSettings: { ...mockProps.currentSettings, enabled: true }
      }

      const { getByTestId } = render(
        <BiometricAuth {...enabledProps} />
      )

      const toggle = getByTestId('biometric-toggle')
      fireEvent(toggle, 'onValueChange', false)

      expect(Alert.alert).toHaveBeenCalledWith(
        'Disable Biometric Authentication',
        expect.stringContaining('disable'),
        expect.any(Array)
      )
    })

    it('should allow selecting preferred biometric type', async () => {
      const enabledProps = {
        ...mockProps,
        currentSettings: { ...mockProps.currentSettings, enabled: true }
      }

      const { getByTestId } = render(
        <BiometricAuth {...enabledProps} />
      )

      const typeSelector = getByTestId('biometric-type-face')
      fireEvent.press(typeSelector)

      await waitFor(() => {
        expect(mockBiometricService.updateBiometricSettings).toHaveBeenCalledWith(
          'test-user-123',
          expect.objectContaining({ preferredType: 'face' })
        )
      })
    })

    it('should test biometric authentication', async () => {
      const enabledProps = {
        ...mockProps,
        currentSettings: { ...mockProps.currentSettings, enabled: true }
      }

      const { getByTestId } = render(
        <BiometricAuth {...enabledProps} />
      )

      const testButton = getByTestId('test-biometric-button')
      fireEvent.press(testButton)

      expect(mockLocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Test biometric authentication',
        cancelLabel: 'Cancel'
      })
    })

    it('should show biometric enrollment guidance', () => {
      mockLocalAuthentication.isEnrolledAsync.mockResolvedValue(false)

      const { getByText, getByTestId } = render(
        <BiometricAuth {...mockProps} />
      )

      expect(getByText('Set up biometrics to enable this feature')).toBeTruthy()
      expect(getByTestId('enrollment-guide-button')).toBeTruthy()
    })

    it('should handle platform-specific settings', async () => {
      // Mock Android platform
      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        Platform: { OS: 'android' }
      }))

      const { getByText } = render(
        <BiometricAuth {...mockProps} />
      )

      expect(getByText('Fingerprint Scanner')).toBeTruthy()
    })

    it('should validate biometric security requirements', async () => {
      const { getByTestId, getByText } = render(
        <BiometricAuth {...mockProps} securityLevel="high" />
      )

      const toggle = getByTestId('biometric-toggle')
      fireEvent(toggle, 'onValueChange', true)

      await waitFor(() => {
        expect(getByText('Enhanced security mode requires additional verification')).toBeTruthy()
      })
    })

    it('should handle biometric authentication errors gracefully', async () => {
      mockLocalAuthentication.authenticateAsync.mockRejectedValue(
        new Error('Biometric hardware error')
      )

      const { getByTestId, getByText } = render(
        <BiometricAuth {...mockProps} />
      )

      const testButton = getByTestId('test-biometric-button')
      fireEvent.press(testButton)

      await waitFor(() => {
        expect(getByText('Biometric authentication error')).toBeTruthy()
        expect(getByText('Please try again or use alternative authentication')).toBeTruthy()
      })
    })

    it('should provide security information', () => {
      const { getByText, getByTestId } = render(
        <BiometricAuth {...mockProps} />
      )

      const infoButton = getByTestId('security-info-button')
      fireEvent.press(infoButton)

      expect(getByText('Your biometric data is stored securely on your device')).toBeTruthy()
      expect(getByText('It never leaves your device or gets sent to our servers')).toBeTruthy()
    })
  })

  describe('Biometric Security Tests', () => {
    it('should validate biometric data integrity', async () => {
      const mockIntegrityCheck = jest.fn().mockResolvedValue(true)
      mockBiometricService.validateBiometricIntegrity = mockIntegrityCheck

      const { getByTestId } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      expect(mockIntegrityCheck).toHaveBeenCalled()
    })

    it('should prevent biometric spoofing attempts', async () => {
      mockLocalAuthentication.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'biometric_not_recognized'
      })

      const { getByTestId, getByText } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      await waitFor(() => {
        expect(getByText('Biometric not recognized')).toBeTruthy()
      })
    })

    it('should implement proper retry limits', async () => {
      let attemptCount = 0
      mockLocalAuthentication.authenticateAsync.mockImplementation(() => {
        attemptCount++
        return Promise.resolve({
          success: false,
          error: 'authentication_failed'
        })
      })

      const { getByTestId } = render(
        <BiometricAuthScreen {...mockProps} maxRetries={3} />
      )

      // Attempt authentication multiple times
      for (let i = 0; i < 5; i++) {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
        await waitFor(() => {})
      }

      // Should not exceed max retries
      expect(attemptCount).toBeLessThanOrEqual(3)
    })

    it('should handle biometric template updates', async () => {
      const { getByTestId, getByText } = render(
        <BiometricAuth {...mockProps} />
      )

      // Simulate biometric enrollment change
      mockLocalAuthentication.isEnrolledAsync.mockResolvedValue(true)

      const refreshButton = getByTestId('refresh-biometrics-button')
      fireEvent.press(refreshButton)

      await waitFor(() => {
        expect(getByText('Biometric templates updated')).toBeTruthy()
      })
    })
  })

  describe('Privacy and Compliance', () => {
    it('should ensure biometric data never leaves the device', () => {
      const { getByText } = render(
        <BiometricAuth {...mockProps} />
      )

      expect(getByText('Your biometric data stays on your device')).toBeTruthy()
      expect(getByText('We never access or store your biometric information')).toBeTruthy()
    })

    it('should provide clear privacy controls', () => {
      const { getByTestId } = render(
        <BiometricAuth {...mockProps} />
      )

      expect(getByTestId('privacy-settings-button')).toBeTruthy()
      expect(getByTestId('data-deletion-button')).toBeTruthy()
    })

    it('should handle GDPR compliance for biometric data', () => {
      const { getByText, getByTestId } = render(
        <BiometricAuth {...mockProps} region="EU" />
      )

      expect(getByText('Biometric Data Processing')).toBeTruthy()
      expect(getByTestId('consent-checkbox')).toBeTruthy()
    })
  })

  describe('Error Recovery and Fallback', () => {
    it('should provide alternative authentication methods', async () => {
      mockLocalAuthentication.hasHardwareAsync.mockResolvedValue(false)

      const { getByText, getByTestId } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        expect(getByText('Use passcode instead')).toBeTruthy()
        expect(getByTestId('passcode-fallback-button')).toBeTruthy()
      })
    })

    it('should handle system biometric lockout', async () => {
      mockLocalAuthentication.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'lockout'
      })

      const { getByTestId, getByText } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      await waitFor(() => {
        expect(getByText('Biometric authentication temporarily disabled')).toBeTruthy()
        expect(getByText('Please wait and try again')).toBeTruthy()
      })
    })

    it('should recover from hardware errors', async () => {
      mockLocalAuthentication.authenticateAsync.mockRejectedValue(
        new Error('Hardware unavailable')
      )

      const { getByTestId, getByText } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      await waitFor(() => {
        expect(getByText('Biometric hardware is temporarily unavailable')).toBeTruthy()
        expect(getByTestId('retry-button')).toBeTruthy()
      })
    })
  })

  describe('User Experience', () => {
    it('should provide clear instructions for different biometric types', async () => {
      mockLocalAuthentication.supportedAuthenticationTypesAsync.mockResolvedValue([1]) // Fingerprint only

      const { getByText } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        expect(getByText('Place your finger on the sensor')).toBeTruthy()
      })
    })

    it('should show authentication progress', async () => {
      let resolveAuth: (value: any) => void
      mockLocalAuthentication.authenticateAsync.mockReturnValue(
        new Promise(resolve => { resolveAuth = resolve })
      )

      const { getByTestId } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      expect(getByTestId('auth-progress-indicator')).toBeTruthy()

      act(() => {
        resolveAuth!({ success: true })
      })
    })

    it('should provide haptic feedback', async () => {
      const mockHaptics = jest.fn()
      jest.doMock('expo-haptics', () => ({
        ImpactFeedbackStyle: { Medium: 'medium' },
        impactAsync: mockHaptics
      }))

      const { getByTestId } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      await waitFor(() => {
        expect(mockHaptics).toHaveBeenCalled()
      })
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle authentication timeouts', async () => {
      mockLocalAuthentication.authenticateAsync.mockReturnValue(
        new Promise(resolve => setTimeout(() => resolve({ success: false, error: 'timeout' }), 30000))
      )

      const { getByTestId, getByText } = render(
        <BiometricAuthScreen {...mockProps} timeout={5000} />
      )

      await waitFor(() => {
        const authButton = getByTestId('biometric-auth-button')
        fireEvent.press(authButton)
      })

      await waitFor(() => {
        expect(getByText('Authentication timed out')).toBeTruthy()
      }, { timeout: 6000 })
    })

    it('should optimize for battery usage', () => {
      const { getByTestId } = render(
        <BiometricAuth {...mockProps} powerOptimized={true} />
      )

      // Should disable intensive biometric scanning when not needed
      expect(getByTestId('power-save-mode-indicator')).toBeTruthy()
    })

    it('should cache biometric availability checks', async () => {
      const { rerender } = render(
        <BiometricAuthScreen {...mockProps} />
      )

      await waitFor(() => {
        expect(mockLocalAuthentication.hasHardwareAsync).toHaveBeenCalledTimes(1)
      })

      // Re-render should use cached result
      rerender(<BiometricAuthScreen {...mockProps} />)

      await waitFor(() => {
        expect(mockLocalAuthentication.hasHardwareAsync).toHaveBeenCalledTimes(1)
      })
    })
  })
})