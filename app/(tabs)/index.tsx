import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
    StyleSheet,
    View
} from 'react-native'
import { ChatScreenWithBackButton } from '@/components/chat/ChatScreenWithBackButton'
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNavigation } from '@/contexts/NavigationContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Message } from '@/types'

const ONBOARDING_KEY = 'hasCompletedOnboarding'

export default function HomeScreen() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const { hideTabBar, showTabBar } = useNavigation()
  const { t } = useLanguage()

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  // Hide tab bar whenever this screen is focused and onboarding is completed
  useFocusEffect(
    useCallback(() => {
      if (hasCompletedOnboarding) {
        hideTabBar()
      }
    }, [hasCompletedOnboarding, hideTabBar])
  )

  // Hide tab bar whenever we're in chat mode (onboarding completed)
  useEffect(() => {
    if (hasCompletedOnboarding) {
      hideTabBar()
    } else {
      showTabBar()
    }
  }, [hasCompletedOnboarding])

  // Initialize chat messages when onboarding is complete and no messages exist
  useEffect(() => {
    if (hasCompletedOnboarding && messages.length === 0) {
      // Initialize with Ash's greeting message
      const initialMessage: Message = {
        id: 'initial_greeting',
        sessionId: 'demo_session',
        userId: 'ash_ai',
        senderType: 'ai',
        content: t('home.greeting'),
        messageType: 'text',
        sentimentScore: 0.8,
        emotionalTags: ['supportive', 'welcoming'],
        riskLevel: 'low',
        createdAt: new Date()
      }
      
      setMessages([initialMessage])
    }
  }, [hasCompletedOnboarding, messages.length])

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
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      sessionId: 'demo_session',
      userId: 'demo_user',
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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        sessionId: 'demo_session',
        userId: 'demo_user',
        senderType: 'ai',
        content: generateAIResponse(content),
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
    }, 1500 + Math.random() * 1000) // Random delay for realism
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

  if (isLoading) {
    return <View style={styles.container} />
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
          currentSession="demo_session"
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
