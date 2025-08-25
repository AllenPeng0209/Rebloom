import { Message } from '@/types'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef, useState } from 'react'
import {
    Dimensions,
    Keyboard,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native'
import { ChatInput } from './ChatInput'
import { MessageBubble, TypingIndicator } from './MessageBubble'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ChatScreenProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isTyping?: boolean
  currentSession?: string
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  onSendMessage,
  isTyping = false,
  currentSession
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

  useEffect(() => {
    // Auto-scroll to bottom when input height changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [inputHeight])

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

      {/* Chat messages area */}
      <View style={[
        styles.messagesContainer,
        { 
          bottom: keyboardHeight + inputHeight + 30, // 增加间距，确保消息区域在输入框之上
          paddingBottom: keyboardHeight > 0 ? 20 : 0
        }
      ]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Dolphin branding */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>Dolphin</Text>
            <Text style={styles.subtitle}>AI-powered mental health support</Text>
          </View>

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
            <TypingIndicator 
              message="Dolphin is typing..."
              therapeuticMode={true}
            />
          )}

          {/* Bottom spacing for input */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      {/* Chat input */}
      <View style={[
        styles.inputContainer, 
        { 
          bottom: keyboardHeight + 10, // 向上移动10px
          paddingBottom: keyboardHeight > 0 ? 10 : Platform.OS === 'ios' ? 34 : 12 
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
    backgroundColor: '#FF9A56', // Fallback color
  },
  messagesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: SCREEN_HEIGHT - 200,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '400',
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  welcomeSubtext: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
})