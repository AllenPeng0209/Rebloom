import { ChatScreen } from '@/components/chat/ChatScreen'
import { useLanguage } from '@/contexts/LanguageContext'
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
  const { t } = useLanguage()

  useEffect(() => {
    // Initialize with Ash's greeting message
    const initialMessage: Message = {
      id: 'initial_greeting',
      sessionId: 'demo_session',
      userId: 'ash_ai',
      senderType: 'ai',
      content: t('chat.greeting'),
      messageType: 'text',
      sentimentScore: 0.8,
      emotionalTags: ['supportive', 'welcoming'],
      riskLevel: 'low',
      createdAt: new Date()
    }
    setMessages([initialMessage])
  }, [t])

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
      t('chat.response1'),
      t('chat.response2'),
      t('chat.response3'),
      t('chat.response4'),
      t('chat.response5')
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
            <Text style={styles.headerTitle}>{t('chat.ashTitle')}</Text>
            <Text style={styles.headerSubtitle}>{t('chat.ashSubtitle')}</Text>
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