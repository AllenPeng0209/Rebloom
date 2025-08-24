import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricAuthProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  fallbackTitle?: string;
  allowDeviceCredentials?: boolean;
}

interface AuthState {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  isAuthenticating: boolean;
  attemptCount: number;
}

const MAX_ATTEMPTS = 3;

export const BiometricAuth: React.FC<BiometricAuthProps> = ({
  visible,
  onSuccess,
  onCancel,
  title = 'Authenticate',
  subtitle = 'Use your biometric to unlock',
  fallbackTitle = 'Use Passcode',
  allowDeviceCredentials = true,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAvailable: false,
    isEnrolled: false,
    supportedTypes: [],
    isAuthenticating: false,
    attemptCount: 0,
  });
  const [pulseAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  useEffect(() => {
    if (visible && authState.isAvailable) {
      handleAuthenticate();
    }
  }, [visible, authState.isAvailable]);

  const checkBiometricSupport = async () => {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      setAuthState(prev => ({
        ...prev,
        isAvailable,
        isEnrolled,
        supportedTypes,
      }));

      if (!isAvailable) {
        Alert.alert(
          'Biometric Authentication Unavailable',
          'Your device does not support biometric authentication.'
        );
      } else if (!isEnrolled) {
        Alert.alert(
          'No Biometric Data',
          'Please set up biometric authentication in your device settings first.'
        );
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const handleAuthenticate = async () => {
    if (!authState.isAvailable || !authState.isEnrolled || authState.isAuthenticating) {
      return;
    }

    setAuthState(prev => ({ ...prev, isAuthenticating: true }));
    
    try {
      // Start pulse animation
      startPulseAnimation();
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: title,
        subPromptMessage: subtitle,
        fallbackLabel: fallbackTitle,
        disableDeviceFallback: !allowDeviceCredentials,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess();
      } else {
        await handleAuthenticationFailure(result.error);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      await handleAuthenticationFailure('Authentication failed');
    } finally {
      setAuthState(prev => ({ ...prev, isAuthenticating: false }));
      stopPulseAnimation();
    }
  };

  const handleAuthenticationFailure = async (error?: string) => {
    const newAttemptCount = authState.attemptCount + 1;
    
    setAuthState(prev => ({
      ...prev,
      attemptCount: newAttemptCount,
    }));

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    startShakeAnimation();

    if (newAttemptCount >= MAX_ATTEMPTS) {
      Alert.alert(
        'Authentication Failed',
        'Too many failed attempts. Please try again later.',
        [{ text: 'OK', onPress: onCancel }]
      );
    } else if (error && error !== 'UserCancel' && error !== 'SystemCancel') {
      Alert.alert(
        'Authentication Failed',
        `${error}. ${MAX_ATTEMPTS - newAttemptCount} attempts remaining.`,
        [
          { text: 'Cancel', onPress: onCancel },
          { text: 'Try Again', onPress: handleAuthenticate },
        ]
      );
    } else {
      onCancel?.();
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
    if (authState.supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'scan';
    }
    if (authState.supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'finger-print';
    }
    return 'shield-checkmark';
  };

  const getBiometricLabel = (): string => {
    if (authState.supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (authState.supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
    return 'Biometric Authentication';
  };

  if (!visible || !authState.isAvailable || !authState.isEnrolled) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { scale: pulseAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#8B5A8C', '#B5739E']}
            style={styles.gradient}
          >
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconCircle,
                  authState.isAuthenticating && styles.authenticatingCircle,
                ]}
              >
                <Ionicons
                  name={getBiometricIcon()}
                  size={48}
                  color="#ffffff"
                />
              </Animated.View>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <Text style={styles.biometricType}>{getBiometricLabel()}</Text>

            {authState.attemptCount > 0 && (
              <View style={styles.attemptsContainer}>
                <Ionicons name="warning" size={16} color="#ff9800" />
                <Text style={styles.attemptsText}>
                  {MAX_ATTEMPTS - authState.attemptCount} attempts remaining
                </Text>
              </View>
            )}

            <View style={styles.buttons}>
              {allowDeviceCredentials && (
                <TouchableOpacity
                  style={styles.fallbackButton}
                  onPress={handleAuthenticate}
                  disabled={authState.isAuthenticating}
                  accessible
                  accessibilityLabel={fallbackTitle}
                  accessibilityRole="button"
                >
                  <Ionicons name="keypad" size={20} color="#ffffff" />
                  <Text style={styles.fallbackButtonText}>{fallbackTitle}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={authState.isAuthenticating}
                accessible
                accessibilityLabel="Cancel authentication"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {authState.isAuthenticating && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>Authenticating...</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Hook for using biometric authentication throughout the app
export const useBiometricAuth = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    checkBiometricSettings();
  }, []);

  const checkBiometricSettings = async () => {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const settings = await AsyncStorage.getItem('@privacy_settings');
      
      setIsSupported(isAvailable && isEnrolled);
      
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setIsEnabled(parsedSettings.biometricAuth || false);
      }
    } catch (error) {
      console.error('Error checking biometric settings:', error);
    }
  };

  const authenticate = async (): Promise<boolean> => {
    if (!isEnabled || !isSupported) {
      return true; // Skip authentication if not enabled/supported
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Rebloom',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  return {
    isEnabled,
    isSupported,
    authenticate,
    refresh: checkBiometricSettings,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    marginHorizontal: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  authenticatingCircle: {
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    textAlign: 'center',
  },
  biometricType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    textAlign: 'center',
  },
  attemptsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  attemptsText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 6,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  fallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fallbackButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: 6,
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  statusContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
