import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useBiometricAuth } from '../privacy/BiometricAuth';
import { useAccessibility } from '../accessibility/AccessibilityProvider';

interface BiometricAuthScreenProps {
  onSuccess?: () => void;
  onSkip?: () => void;
  allowSkip?: boolean;
  title?: string;
  subtitle?: string;
}

const { width, height } = Dimensions.get('window');

export const BiometricAuthScreen: React.FC<BiometricAuthScreenProps> = ({
  onSuccess,
  onSkip,
  allowSkip = false,
  title = 'Welcome Back',
  subtitle = 'Unlock Rebloom with your biometric',
}) => {
  const router = useRouter();
  const { isEnabled, isSupported, authenticate } = useBiometricAuth();
  const { settings: accessibilitySettings } = useAccessibility();
  const [authState, setAuthState] = useState<{
    isAuthenticating: boolean;
    hasAttempted: boolean;
    failedAttempts: number;
    biometricType: LocalAuthentication.AuthenticationType[];
  }>({
    isAuthenticating: false,
    hasAttempted: false,
    failedAttempts: 0,
    biometricType: [],
  });
  
  const [animations] = useState({
    fadeAnim: new Animated.Value(0),
    scaleAnim: new Animated.Value(0.8),
    pulseAnim: new Animated.Value(1),
    shakeAnim: new Animated.Value(0),
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!authState.isAuthenticating) {
      startIntroAnimation();
    }
  }, [authState.isAuthenticating]);

  const initializeAuth = async () => {
    try {
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setAuthState(prev => ({ ...prev, biometricType: supportedTypes }));
      
      // Auto-attempt authentication if enabled and supported
      if (isEnabled && isSupported && !authState.hasAttempted) {
        setTimeout(() => {
          handleAuthenticate();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to initialize biometric auth:', error);
    }
  };

  const startIntroAnimation = () => {
    Animated.parallel([
      Animated.timing(animations.fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(animations.scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (!accessibilitySettings.reduceMotion) {
      startPulseAnimation();
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animations.pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(animations.pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(animations.shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animations.shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(animations.shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animations.shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleAuthenticate = async () => {
    if (authState.isAuthenticating) return;
    
    setAuthState(prev => ({
      ...prev,
      isAuthenticating: true,
      hasAttempted: true,
    }));

    try {
      if (accessibilitySettings.hapticFeedback) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const result = await authenticate();
      
      if (result) {
        if (accessibilitySettings.hapticFeedback) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Success animation
        Animated.spring(animations.scaleAnim, {
          toValue: 1.2,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }).start(() => {
          onSuccess?.();
        });
      } else {
        await handleAuthFailure();
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      await handleAuthFailure();
    }
  };

  const handleAuthFailure = async () => {
    const newFailedAttempts = authState.failedAttempts + 1;
    
    setAuthState(prev => ({
      ...prev,
      isAuthenticating: false,
      failedAttempts: newFailedAttempts,
    }));

    if (accessibilitySettings.hapticFeedback) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    startShakeAnimation();

    if (newFailedAttempts >= 3) {
      Alert.alert(
        'Authentication Failed',
        'Too many failed attempts. Please use an alternative method or try again later.',
        [
          {
            text: allowSkip ? 'Skip' : 'OK',
            onPress: allowSkip ? handleSkip : undefined,
          },
        ]
      );
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      router.replace('/(tabs)');
    }
  };

  const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
    if (authState.biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'scan';
    }
    if (authState.biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'finger-print';
    }
    return 'shield-checkmark';
  };

  const getBiometricLabel = (): string => {
    if (authState.biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (authState.biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
    return 'Biometric Authentication';
  };

  const getInstructionText = (): string => {
    if (authState.isAuthenticating) {
      return 'Authenticating...';
    }
    if (authState.failedAttempts > 0) {
      return `Authentication failed. ${3 - authState.failedAttempts} attempts remaining.`;
    }
    if (authState.biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Look at your device to continue';
    }
    if (authState.biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch the fingerprint sensor';
    }
    return 'Use your biometric to continue';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Animated Circles Background */}
      {!accessibilitySettings.reduceMotion && (
        <View style={styles.backgroundAnimation}>
          {[...Array(3)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.animatedCircle,
                {
                  top: `${20 + i * 25}%`,
                  left: `${10 + i * 30}%`,
                  transform: [
                    {
                      scale: animations.pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: [1 + i * 0.2, 1.1 + i * 0.2],
                      }),
                    },
                  ],
                  opacity: 0.1 - i * 0.02,
                },
              ]}
            />
          ))}
        </View>
      )}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: animations.fadeAnim,
            transform: [
              { scale: animations.scaleAnim },
              { translateX: animations.shakeAnim },
            ],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Biometric Icon */}
        <Animated.View
          style={[
            styles.biometricContainer,
            {
              transform: [{ scale: animations.pulseAnim }],
            },
          ]}
        >
          <BlurView intensity={20} style={styles.biometricBlur}>
            <TouchableOpacity
              style={[
                styles.biometricButton,
                authState.isAuthenticating && styles.authenticatingButton,
              ]}
              onPress={handleAuthenticate}
              disabled={authState.isAuthenticating}
              accessible
              accessibilityLabel={`${getBiometricLabel()} authentication`}
              accessibilityHint={getInstructionText()}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[
                  authState.failedAttempts > 0 ? '#ff4757' : '#8B5A8C',
                  authState.failedAttempts > 0 ? '#ff3742' : '#B5739E',
                ]}
                style={styles.biometricGradient}
              >
                <Ionicons
                  name={getBiometricIcon()}
                  size={48}
                  color="#ffffff"
                  style={[
                    authState.isAuthenticating && styles.authenticatingIcon,
                  ]}
                />
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.biometricType}>{getBiometricLabel()}</Text>
          <Text
            style={[
              styles.instructionText,
              authState.failedAttempts > 0 && styles.errorText,
            ]}
          >
            {getInstructionText()}
          </Text>
        </View>

        {/* Failure indicator */}
        {authState.failedAttempts > 0 && (
          <View style={styles.failureIndicator}>
            <Ionicons name="warning" size={16} color="#ff4757" />
            <Text style={styles.failureText}>
              {authState.failedAttempts === 1
                ? 'Authentication failed. Please try again.'
                : `${authState.failedAttempts} failed attempts`}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {allowSkip && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessible
            accessibilityLabel="Skip biometric authentication"
            accessibilityRole="button"
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.alternativeButton}
          onPress={() => {
            // Handle alternative authentication methods
            Alert.alert(
              'Alternative Authentication',
              'Use passcode or other authentication method?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Use Passcode', onPress: () => handleAuthenticate() },
              ]
            );
          }}
          accessible
          accessibilityLabel="Use alternative authentication method"
          accessibilityRole="button"
        >
          <Ionicons name="keypad" size={16} color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.alternativeButtonText}>Use Passcode</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundAnimation: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  animatedCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#8B5A8C',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  biometricContainer: {
    marginBottom: 40,
  },
  biometricBlur: {
    borderRadius: 80,
    overflow: 'hidden',
  },
  biometricButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
  },
  authenticatingButton: {
    opacity: 0.8,
  },
  biometricGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authenticatingIcon: {
    opacity: 0.7,
  },
  instructions: {
    alignItems: 'center',
    marginBottom: 20,
  },
  biometricType: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    color: '#ff8a80',
  },
  failureIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  failureText: {
    fontSize: 12,
    color: '#ff8a80',
    marginLeft: 6,
  },
  bottomActions: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  alternativeButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    fontWeight: '500',
  },
});
