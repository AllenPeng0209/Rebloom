import React, { useState, useEffect, useRef } from 'react'
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Animated,
    Dimensions,
    ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

const { width, height } = Dimensions.get('window')

interface AuthScreenProps {
  onAuthComplete?: () => void
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthComplete }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { signIn, signUp } = useAuth()
  const { t } = useLanguage()

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 15,
        useNativeDriver: true,
      }),
    ]).start()

    // Floating animation for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert(t('auth.error'), t('auth.fillAllFields'))
      return
    }

    if (password.length < 6) {
      Alert.alert(t('auth.error'), t('auth.passwordTooShort'))
      return
    }

    setLoading(true)
    
    try {
      let result
      if (isSignUp) {
        result = await signUp(email, password, displayName)
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        Alert.alert(t('auth.error'), result.error.message)
      } else {
        if (isSignUp) {
          Alert.alert(
            t('auth.success'),
            t('auth.checkEmail'),
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          )
        } else {
          onAuthComplete?.()
        }
      }
    } catch (error) {
      Alert.alert(t('auth.error'), t('auth.unexpectedError'))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setDisplayName('')
    setShowPassword(false)
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    resetForm()
    
    // Animation for mode switch
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 15,
        useNativeDriver: true,
      }),
    ]).start()
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#8B5A8C', '#B5739E', '#D48FB0', '#E8B4C8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Circles */}
      <Animated.View
        style={[
          styles.decorativeCircle1,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeCircle2,
          {
            transform: [{ translateY: Animated.multiply(floatAnim, -1) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeCircle3,
          {
            transform: [{ translateX: floatAnim }],
          },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.formWrapper,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {/* Logo/Icon Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="heart" size={45} color="#FFFFFF" />
              </View>
              <Text style={styles.appName}>Rebloom</Text>
              <Text style={styles.tagline}>
                {isSignUp ? t('auth.signUpTagline') : t('auth.signInTagline')}
              </Text>
            </View>

            {/* Glass Card Effect */}
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={styles.formContainer}>
                <Text style={styles.title}>
                  {isSignUp ? t('auth.signUp') : t('auth.signIn')}
                </Text>
                
                {isSignUp && (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="person-outline" size={20} color="#8B5A8C" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={t('auth.displayName')}
                        placeholderTextColor="rgba(139, 90, 140, 0.5)"
                        value={displayName}
                        onChangeText={setDisplayName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                )}
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#8B5A8C" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.email')}
                      placeholderTextColor="rgba(139, 90, 140, 0.5)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#8B5A8C" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder={t('auth.password')}
                      placeholderTextColor="rgba(139, 90, 140, 0.5)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#8B5A8C" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password Link (for Sign In) */}
                {!isSignUp && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
                  </TouchableOpacity>
                )}
                
                {/* Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleAuth}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading ? ['#ccc', '#aaa'] : ['#8B5A8C', '#B5739E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>
                        {isSignUp ? t('auth.signUp') : t('auth.signIn')}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Social Login Options */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>{t('auth.or')}</Text>
                  <View style={styles.divider} />
                </View>

                <View style={styles.socialContainer}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-apple" size={24} color="#000000" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-wechat" size={24} color="#07C160" />
                  </TouchableOpacity>
                </View>
                
                {/* Switch Mode Button */}
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={switchMode}
                  disabled={loading}
                >
                  <Text style={styles.switchButtonText}>
                    {isSignUp 
                      ? t('auth.alreadyHaveAccount')
                      : t('auth.dontHaveAccount')
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>

          {/* Terms and Privacy */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              {t('auth.agreeToTerms')}
            </Text>
            <View style={styles.termsLinks}>
              <TouchableOpacity>
                <Text style={styles.termsLink}>{t('auth.termsOfService')}</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}>{t('auth.and')}</Text>
              <TouchableOpacity>
                <Text style={styles.termsLink}>{t('auth.privacyPolicy')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  formContainer: {
    padding: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#8B5A8C',
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 90, 140, 0.1)',
    paddingHorizontal: 15,
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -10,
  },
  forgotPasswordText: {
    color: '#8B5A8C',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(139, 90, 140, 0.2)',
  },
  dividerText: {
    marginHorizontal: 15,
    color: 'rgba(139, 90, 140, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 90, 140, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  switchButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#8B5A8C',
    fontSize: 15,
    fontWeight: '600',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 100,
    left: -75,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: height * 0.4,
    right: -30,
  },
  termsContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  termsLinks: {
    flexDirection: 'row',
    marginTop: 5,
  },
  termsLink: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})