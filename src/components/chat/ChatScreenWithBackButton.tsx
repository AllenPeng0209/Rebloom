import { Message } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { ChatInput } from './ChatInput'
import { MessageBubble, TypingIndicator } from './MessageBubble'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ChatScreenWithBackButtonProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isTyping?: boolean
  currentSession?: string
  onBackPress?: () => void
  onScroll?: (event: any) => void
  loadingMore?: boolean
  hasMore?: boolean
}

export const ChatScreenWithBackButton: React.FC<ChatScreenWithBackButtonProps> = ({
  messages,
  onSendMessage,
  isTyping = false,
  currentSession,
  onBackPress,
  onScroll,
  loadingMore = false,
  hasMore = true
}) => {
  const scrollViewRef = useRef<ScrollView>(null)
  const [inputHeight, setInputHeight] = useState(60)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height)
    })

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0)
    })

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [messages, isTyping])

  const renderMessages = () => {
    return messages.map((message, index) => {
      const isConsecutive = 
        index > 0 && 
        messages[index - 1].senderType === message.senderType &&
        new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() < 60000 // 1 minute

      // Check if this is the last message in a consecutive group
      const isLastInGroup = 
        index === messages.length - 1 || // Last message overall
        (index < messages.length - 1 && (
          messages[index + 1].senderType !== message.senderType || // Different sender
          new Date(messages[index + 1].createdAt).getTime() - new Date(message.createdAt).getTime() >= 60000 // Time gap
        ))

      return (
        <MessageBubble
          key={message.id}
          message={message}
          isConsecutive={isConsecutive}
          showTimestamp={isLastInGroup}
          animateEntry={index === messages.length - 1}
        />
      )
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Main gradient background matching Dolphin */}
      <LinearGradient
        colors={['#FF9A56', '#FFAD7A', '#FFC09F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          {onBackPress && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={onBackPress}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <View style={styles.headerCenter}>
            <Text style={styles.appTitle}>Dolphin</Text>
            <Text style={styles.subtitle}>AI-powered mental health support</Text>
          </View>
          
          <View style={styles.headerRight}>
            {/* Debug button removed */}
          </View>
        </View>
      </View>

      {/* Chat messages area */}
      <View style={[
        styles.messagesContainer,
        { 
          bottom: keyboardHeight + inputHeight , // 确保消息区域在输入框之上
          paddingBottom: keyboardHeight > 0 ? 20 : 0
        }
      ]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={onScroll}
          scrollEventThrottle={400}
        >
          {/* Loading more indicator at the top */}
          {loadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingMoreText}>加載更多消息...</Text>
            </View>
          )}

          {/* Welcome message if no messages yet */}
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Hi there! 👋</Text>
              <Text style={styles.welcomeText}>
                I'm Dolphin, your AI companion for mental health support. I'm here to listen, 
                understand, and help you work through whatever is on your mind.
              </Text>
              <Text style={styles.welcomeSubtext}>
                How are you feeling today?
              </Text>
            </View>
          )}

          {/* Render messages */}
          {renderMessages()}

          {/* Typing indicator */}
          {isTyping && (
            <TypingIndicator />
          )}

          {/* Bottom spacing for input */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      {/* Input area - 直接使用键盘高度调整位置 */}
      <View style={[
        styles.inputContainer,
        { 
          bottom: keyboardHeight + 10, // 向上移动10px
          paddingBottom: keyboardHeight > 0 ? 10 : Platform.OS === 'ios' ? 20 : 16
        }
      ]}>
        <ChatInput
          onSend={onSendMessage}
          onHeightChange={setInputHeight}
          placeholder="Type your message..."
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100, // 为固定头部留出空间
    left: 0,
    right: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 154, 86, 0.95)', // Semi-transparent background
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '400',
  },
  welcomeContainer: {
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
    fontWeight: '400',
  },
  welcomeSubtext: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
})