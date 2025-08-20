import { ChatScreenWithBackButton } from '@/components/chat/ChatScreenWithBackButton'
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNavigation } from '@/contexts/NavigationContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Message } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  StyleSheet,
  View
} from 'react-native'
import { AuthScreen } from '../../src/components/auth/AuthScreen'
import { useAuth } from '../../src/contexts/AuthContext'
import { BailianMessage, sendBailianMessage } from '../../src/lib/bailian'
import { ChatService } from '../../src/services/chatService'

const ONBOARDING_KEY = 'hasCompletedOnboarding'

export default function HomeScreen() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const { hideTabBar, showTabBar } = useNavigation()
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  // 随时进入首页（含 Onboarding/Chat）都隐藏底部 TabBar
  useFocusEffect(
    useCallback(() => {
      hideTabBar()
    }, [hideTabBar])
  )

  // Onboarding 状态变化时也保持隐藏
  useEffect(() => {
    hideTabBar()
  }, [hasCompletedOnboarding])

  // Initialize chat messages when user is authenticated and onboarding is complete
  useEffect(() => {
    if (user && hasCompletedOnboarding && !currentConversationId) {
      initializeConversation()
      setupDailySummarySchedule()
    }
  }, [user, hasCompletedOnboarding, currentConversationId])

  const setupDailySummarySchedule = async () => {
    if (!user) return
    
    try {
      // Import SchedulerService dynamically to avoid circular imports
      const { SchedulerService } = await import('../../src/services/schedulerService')
      await SchedulerService.scheduleDailySummary(user.id, '22:00')
      console.log('每日總結已設置為晚上10點自動執行')
    } catch (error) {
      console.error('設置每日總結失敗:', error)
    }
  }

  const initializeConversation = async () => {
    if (!user) return

    try {
      // Create a new conversation
      const { data: conversation, error } = await ChatService.createConversation(
        user.id,
        t('home.greeting')
      )

      if (error || !conversation) {
        console.error('Error creating conversation:', error)
        return
      }

      setCurrentConversationId(conversation.id)

      // Initialize with Ash's greeting message
      const initialMessage: Message = {
        id: 'initial_greeting',
        sessionId: conversation.id,
        userId: user.id,
        senderType: 'ai',
        content: t('home.greeting'),
        messageType: 'text',
        sentimentScore: 0.8,
        emotionalTags: ['supportive', 'welcoming'],
        riskLevel: 'low',
        createdAt: new Date()
      }
      
      setMessages([initialMessage])

      // Save the greeting message to database
      await ChatService.saveMessage(
        conversation.id,
        user.id,
        t('home.greeting'),
        'assistant'
      )
    } catch (error) {
      console.error('Error initializing conversation:', error)
    }
  }

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY)
      setHasCompletedOnboarding(completed === 'true')
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
      setHasCompletedOnboarding(true)
    } catch (error) {
      console.error('Error saving onboarding status:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!user || !currentConversationId) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      sessionId: currentConversationId,
      userId: user.id,
      senderType: 'user',
      content,
      messageType: 'text',
      sentimentScore: 0.5,
      emotionalTags: [],
      riskLevel: 'low',
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    // Save user message to database
    try {
      await ChatService.saveMessage(
        currentConversationId,
        user.id,
        content,
        'user'
      )
    } catch (error) {
      console.error('Error saving user message:', error)
    }

    // Get AI response from Bailian API
    try {
      // Prepare conversation history for Bailian API
      const conversationHistory: BailianMessage[] = [
        {
          role: 'system',
          content: '你是 Ash，一个专业的AI心理健康伴侣。你的任务是倾听、理解，并帮助用户处理心理健康问题。请用温暖、支持和专业的语调回应，提供有用的建议和情感支持。请用繁体中文回复。'
        },
        // Add recent conversation history (last 10 messages for context)
        ...messages.slice(-10).map(msg => ({
          role: msg.senderType === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        // Add current user message
        {
          role: 'user',
          content: content
        }
      ]

      const aiResponse = await sendBailianMessage(conversationHistory)
      
      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        sessionId: currentConversationId,
        userId: user.id,
        senderType: 'ai',
        content: aiResponse,
        messageType: 'text',
        sentimentScore: 0.8,
        emotionalTags: ['supportive', 'understanding'],
        riskLevel: 'low',
        aiConfidenceScore: 0.9,
        therapeuticApproach: 'cbt',
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)

      // Save AI message to database
      try {
        await ChatService.saveMessage(
          currentConversationId,
          user.id,
          aiResponse,
          'assistant'
        )
      } catch (error) {
        console.error('Error saving AI message:', error)
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      setIsTyping(false)
      
      // Fallback to predefined response if API fails
      const fallbackResponse = generateAIResponse(content)
      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        sessionId: currentConversationId,
        userId: user.id,
        senderType: 'ai',
        content: fallbackResponse,
        messageType: 'text',
        sentimentScore: 0.8,
        emotionalTags: ['supportive', 'understanding'],
        riskLevel: 'low',
        aiConfidenceScore: 0.9,
        therapeuticApproach: 'cbt',
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Save fallback message to database
      try {
        await ChatService.saveMessage(
          currentConversationId,
          user.id,
          fallbackResponse,
          'assistant'
        )
      } catch (error) {
        console.error('Error saving fallback message:', error)
      }
    }
  }

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      t('home.aiResponses.1'),
      t('home.aiResponses.2'),
      t('home.aiResponses.3'),
      t('home.aiResponses.4'),
      t('home.aiResponses.5'),
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  if (isLoading || authLoading) {
    return <View style={styles.container} />
  }

  // Show auth screen if user is not logged in
  if (!user) {
    return (
      <ThemeProvider>
        <View style={styles.container}>
          <AuthScreen onAuthComplete={() => {
            // Auth complete, user will be set automatically by AuthProvider
          }} />
        </View>
      </ThemeProvider>
    )
  }

  const handleBackToMood = () => {
    showTabBar()
    router.push('/mood')
  }

  return (
    <ThemeProvider>
      {!hasCompletedOnboarding ? (
        <View style={styles.container}>
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        </View>
      ) : (
        <ChatScreenWithBackButton
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          currentSession={currentConversationId || 'loading'}
          onBackPress={handleBackToMood}
        />
      )}
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
