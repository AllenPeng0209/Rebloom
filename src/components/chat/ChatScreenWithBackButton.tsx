import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { MessageBubble, TypingIndicator } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { Message } from '@/types'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ChatScreenWithBackButtonProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isTyping?: boolean
  currentSession?: string
  onBackPress?: () => void
}

export const ChatScreenWithBackButton: React.FC<ChatScreenWithBackButtonProps> = ({
  messages,
  onSendMessage,
  isTyping = false,
  currentSession,
  onBackPress
}) => {
  const scrollViewRef = useRef<ScrollView>(null)
  const [inputHeight, setInputHeight] = useState(60)

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
      
      {/* Main gradient background matching Ash */}
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
            <Text style={styles.appTitle}>Ash</Text>
            <Text style={styles.subtitle}>AI-powered mental health support</Text>
          </View>
          
          <View style={styles.headerRight}>
            {/* Placeholder for potential future actions */}
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        {/* Chat messages area */}
        <View style={styles.messagesContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* Welcome message if no messages yet */}
            {messages.length === 0 && (
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Hi there! 👋</Text>
                <Text style={styles.welcomeText}>
                  I'm Ash, your AI companion for mental health support. I'm here to listen, 
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
            <View style={{ height: inputHeight + 20 }} />
          </ScrollView>
        </View>

        {/* Input area */}
        <View style={styles.inputContainer}>
          <ChatInput
            onSend={onSendMessage}
            onHeightChange={setInputHeight}
            placeholder="Type your message..."
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 120 : 100, // Account for fixed header
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
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingTop: 12,
  },
})