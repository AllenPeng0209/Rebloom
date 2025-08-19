import React, { useState, useRef } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface ChatInputProps {
  onSend: (message: string) => void
  onHeightChange?: (height: number) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onHeightChange,
  placeholder = "Type your message...",
  maxLength = 1000,
  disabled = false,
}) => {
  const [message, setMessage] = useState('')
  const [inputHeight, setInputHeight] = useState(40)
  const [isFocused, setIsFocused] = useState(false)
  const scaleAnim = useRef(new Animated.Value(1)).current
  const inputRef = useRef<TextInput>(null)

  const handleSend = async () => {
    if (message.trim() && !disabled) {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }

      // Send animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()

      onSend(message.trim())
      setMessage('')
      setInputHeight(40)
      inputRef.current?.blur()
    }
  }

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize
    const newHeight = Math.min(Math.max(height, 40), 120) // Min 40, Max 120
    setInputHeight(newHeight)
    onHeightChange?.(newHeight + 20) // Add padding
  }

  const canSend = message.trim().length > 0 && !disabled

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { height: inputHeight + 20 }]}>
        {/* Input background with glassmorphism effect */}
        <View style={styles.inputBackground}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.inputGradient}
          />
          
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { height: inputHeight }]}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            multiline
            textAlignVertical="center"
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onContentSizeChange={handleContentSizeChange}
            scrollEnabled={inputHeight >= 120}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            editable={!disabled}
          />
        </View>

        {/* Send button */}
        <Animated.View style={[styles.sendButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                opacity: canSend ? 1 : 0.5,
                backgroundColor: canSend ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
              }
            ]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canSend ? ['#FF6B3D', '#FF8F65'] : ['rgba(255, 107, 61, 0.5)', 'rgba(255, 143, 101, 0.5)']}
              style={styles.sendButtonGradient}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={canSend ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'}
                style={styles.sendIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Voice message button (for future implementation) */}
      <TouchableOpacity
        style={styles.voiceButton}
        onPress={() => {
          // Voice message implementation
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
          style={styles.voiceButtonGradient}
        >
          <Ionicons
            name="mic"
            size={24}
            color="rgba(255, 255, 255, 0.8)"
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 12,
  },
  inputBackground: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  textInput: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
    textAlignVertical: 'center',
  },
  sendButtonContainer: {
    marginLeft: 8,
    marginBottom: 2,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    marginTop: -1, // Fine-tune icon alignment
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: -4,
  },
  voiceButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
  },
})