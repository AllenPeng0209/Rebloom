import { useTheme } from '@/contexts/ThemeContext'
import { Message, TherapeuticComponentProps } from '@/types'
import { format } from 'date-fns'
import React, { useEffect, useRef } from 'react'
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native'

interface MessageBubbleProps extends TherapeuticComponentProps {
  message: Message
  isConsecutive?: boolean
  onPress?: () => void
  onLongPress?: () => void
  showTimestamp?: boolean
  animateEntry?: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isConsecutive = false,
  onPress,
  onLongPress,
  showTimestamp = true,
  animateEntry = true,
  therapeuticMode = true,
  emotionalState,
  sensitivity = 'medium',
  style,
  testID,
}) => {
  const { theme } = useTheme()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const isUser = message.senderType === 'user'
  const isAI = message.senderType === 'ai'

  useEffect(() => {
    if (animateEntry) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      fadeAnim.setValue(1)
      slideAnim.setValue(0)
    }
  }, [animateEntry, fadeAnim, slideAnim])

  const getBubbleColors = () => {
    if (isUser) {
      return {
        background: '#FFFFFF',
        text: '#2C2C2E',
        accent: '#FF6B3D',
        shadow: 'rgba(0, 0, 0, 0.1)'
      }
    }

    // AI message colors - Dolphin-style with warm, supportive tones
    let colors = {
      background: '#FFFFFF',
      text: '#2C2C2E',
      accent: '#FF8F65',
      shadow: 'rgba(0, 0, 0, 0.08)'
    }

    // Risk level adaptations
    if (message.riskLevel && message.riskLevel !== 'low') {
      switch (message.riskLevel) {
        case 'moderate':
          colors = {
            background: '#FFF8F0',
            text: '#2C2C2E',
            accent: '#FF9500',
            shadow: 'rgba(255, 149, 0, 0.1)'
          }
          break
        case 'high':
          colors = {
            background: '#FFF5F5',
            text: '#2C2C2E',
            accent: '#FF3B30',
            shadow: 'rgba(255, 59, 48, 0.1)'
          }
          break
        case 'critical':
          colors = {
            background: '#FFE5E5',
            text: '#2C2C2E',
            accent: '#FF3B30',
            shadow: 'rgba(255, 59, 48, 0.15)'
          }
          break
      }
    }

    return colors
  }

  const colors = getBubbleColors()

  const bubbleStyle: ViewStyle = {
    maxWidth: '80%',
    marginBottom: theme.spacing.sm,
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    marginLeft: isUser ? theme.spacing.lg : theme.spacing.md,
    marginRight: isUser ? theme.spacing.md : theme.spacing.lg,
  }

  const contentStyle: ViewStyle = {
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    // 统一所有消息的圆角样式
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // Dolphin-style shadow
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    // Remove border accent for cleaner Dolphin look
  }

  const textStyle: TextStyle = {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'SF Pro Text', // iOS system font
    fontWeight: '400',
  }

  const timestampStyle: TextStyle = {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    alignSelf: isUser ? 'flex-end' : 'flex-start',
  }

  const riskIndicatorStyle: ViewStyle = {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: message.riskLevel === 'critical' ? theme.colors.error :
                    message.riskLevel === 'high' ? theme.colors.warning :
                    'transparent',
  }

  return (
    <Animated.View
      style={[
        bubbleStyle,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        testID={testID}
        style={({ pressed }) => [
          contentStyle,
          {
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {/* Risk level indicator */}
        {message.riskLevel && message.riskLevel !== 'low' && (
          <View style={riskIndicatorStyle} />
        )}

        <Text style={textStyle}>{message.content}</Text>

        {/* Therapeutic approach indicator for AI messages */}
        {isAI && message.therapeuticApproach && therapeuticMode && (
          <View style={styles.therapyIndicator}>
            <Text style={styles.therapyIndicatorText}>
              {message.therapeuticApproach.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Message type indicator */}
        {message.messageType === 'voice' && (
          <View style={styles.voiceIndicator}>
            <Text style={styles.voiceIndicatorText}>🎙️</Text>
          </View>
        )}

        {/* Emotional tags for user messages */}
        {isUser && message.emotionalTags.length > 0 && (
          <View style={styles.emotionalTags}>
            {message.emotionalTags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.emotionalTag}>
                <Text style={styles.emotionalTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>

      {/* Timestamp */}
      {showTimestamp && (
        <Text style={timestampStyle}>
          {format(new Date(message.createdAt), 'HH:mm')}
        </Text>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  therapyIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  therapyIndicatorText: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  voiceIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  voiceIndicatorText: {
    fontSize: 12,
  },
  emotionalTags: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  emotionalTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginTop: 2,
  },
  emotionalTagText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
})

// Typing indicator component for AI responses - Dolphin style
export const TypingIndicator: React.FC<{
  therapeuticMode?: boolean
  message?: string
}> = ({ 
  therapeuticMode = true, 
  message = 'Dolphin is typing...' 
}) => {
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dot3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animate = () => {
      const animation = Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])

      Animated.loop(animation).start()
    }

    animate()
  }, [dot1, dot2, dot3])

  return (
    <View style={{
      alignSelf: 'flex-start',
      backgroundColor: '#FFFFFF',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginBottom: 8,
      marginLeft: 16,
      marginRight: 32,
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      <View style={{ flexDirection: 'row', marginRight: 8 }}>
        {[dot1, dot2, dot3].map((dot, index) => (
          <Animated.View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#FF8F65',
              marginHorizontal: 2,
              opacity: dot,
            }}
          />
        ))}
      </View>
    </View>
  )
}