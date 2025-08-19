import { ChatScreen } from '@/components/chat/ChatScreen'
import { Message } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'

export default function ChatFullScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    // Initialize with Ash's greeting message
    const initialMessage: Message = {
      id: 'initial_greeting',
      sessionId: 'demo_session',
      userId: 'ash_ai',
      senderType: 'ai',
      content: "Hi there! 👋\n\nI'm Ash, your AI companion for mental health support. I'm here to listen, understand, and help you work through whatever is on your mind.\n\nHow are you feeling today?",
      messageType: 'text',
      sentimentScore: 0.8,
      emotionalTags: ['supportive', 'welcoming'],
      riskLevel: 'low',
      createdAt: new Date()
    }
    setMessages([initialMessage])
  }, [])

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
      createdAt: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    // Simulate Ash's response
    setTimeout(() => {
      const ashResponse: Message = {
        id: `msg_ash_${Date.now()}`,
        sessionId: 'demo_session',
        userId: 'ash_ai',
        senderType: 'ai',
        content: getAshResponse(content),
        messageType: 'text',
        sentimentScore: 0.7,
        emotionalTags: ['supportive', 'empathetic'],
        riskLevel: 'low',
        createdAt: new Date()
      }
      
      setMessages(prev => [...prev, ashResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getAshResponse = (userMessage: string): string => {
    const responses = [
      "I hear you, and I want you to know that your feelings are completely valid. It takes courage to share what's on your mind. Can you tell me more about what's been weighing on you?",
      "Thank you for opening up to me. I'm here to listen without judgment. What you're experiencing matters, and I want to understand better so I can support you.",
      "It sounds like you're going through something challenging right now. I'm here with you in this moment. What would feel most helpful for you right now?",
      "I appreciate you sharing that with me. Your thoughts and feelings are important. Sometimes just having someone listen can make a difference. How are you taking care of yourself today?",
      "You're not alone in this. What you're feeling is part of being human, and I'm here to support you through it. What's one small thing that usually brings you comfort?"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient */}
      <LinearGradient
        colors={['#FF9A56', '#FFB280', '#FFC299']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Ash</Text>
            <Text style={styles.headerSubtitle}>AI-powered mental health support</Text>
          </View>
          
          <View style={styles.headerRight}>
            {/* Placeholder for potential future actions */}
          </View>
        </View>
      </SafeAreaView>

      {/* Chat Interface */}
      <ChatScreen
        messages={messages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        currentSession="demo_session"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
    height: 44,
  },
})