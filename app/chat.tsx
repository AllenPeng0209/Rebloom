import { ChatScreenWithBackButton } from '@/components/chat/ChatScreenWithBackButton'
import { useLanguage } from '@/contexts/LanguageContext'
import { useUnifiedSettings } from '@/contexts/UnifiedSettingsContext'
import { Message } from '@/types'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    detectEmotion,
    extractKeyTopic,
    generateCounselorResponse,
    selectCounselorTechnique
} from '../src/utils/counselorTechniques'

export default function ChatFullScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const { t } = useLanguage()
  const { generateUnifiedPrompt } = useUnifiedSettings()

  useEffect(() => {
    // Initialize with Dolphin's greeting message
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

    // 添加思考延迟（1.5-3秒随机）
    const thinkingDelay = Math.random() * 1500 + 1500; // 1500-3000ms
    
    setTimeout(async () => {
      const response = getDolphinResponse(content);
      
      // 30%概率使用多气泡回复
      if (Math.random() < 0.3 && response.length > 10) {
        await handleMultipleBubbleResponseDemo(response);
      } else {
        const ashResponse: Message = {
          id: `msg_ash_${Date.now()}`,
          sessionId: 'demo_session',
          userId: 'ash_ai',
          senderType: 'ai',
          content: response,
          messageType: 'text',
          sentimentScore: 0.7,
          emotionalTags: ['supportive', 'empathetic'],
          riskLevel: 'low',
          createdAt: new Date()
        }
        
        setMessages(prev => [...prev, ashResponse])
        setIsTyping(false)
      }
    }, thinkingDelay)
  }

  // 处理多气泡回复（演示版）
  const handleMultipleBubbleResponseDemo = async (fullResponse: string) => {
    const bubbles = fullResponse.split('。').filter(b => b.trim().length > 0);
    
    for (let i = 0; i < bubbles.length; i++) {
      const bubble = bubbles[i] + (i < bubbles.length - 1 ? '。' : '');
      
      // 每个气泡之间的延迟
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 700 + 800));
      }
      
      const ashResponse: Message = {
        id: `msg_ash_${Date.now()}_${i}`,
        sessionId: 'demo_session',
        userId: 'ash_ai',
        senderType: 'ai',
        content: bubble.trim(),
        messageType: 'text',
        sentimentScore: 0.7,
        emotionalTags: ['supportive', 'empathetic'],
        riskLevel: 'low',
        createdAt: new Date()
      }

      setMessages(prev => [...prev, ashResponse])
    }
    
    setIsTyping(false)
  }

  const getDolphinResponse = (userMessage: string): string => {
    // Generate response based on AI settings and counselor techniques
    const unifiedPrompt = generateUnifiedPrompt()
    console.log('Using unified AI+Therapeutic settings for response:', unifiedPrompt)
    
    // 使用咨詢師技巧生成更自然的回應
    const detectedEmotion = detectEmotion(userMessage);
    const keyTopic = extractKeyTopic(userMessage);
    const counselorTechnique = selectCounselorTechnique(userMessage, {
      recentTopics: [],
      sessionLength: messages.length
    });
    
    // 生成咨詢師風格的回應
    const counselorResponse = generateCounselorResponse(userMessage, counselorTechnique, {
      detectedEmotion,
      keyTopic
    });
    
    console.log('Generated counselor response:', counselorResponse);
    
    // 如果生成了有效的咨詢師回應，使用它；否則使用預設回應
    if (counselorResponse && counselorResponse.length > 0) {
      return counselorResponse;
    }
    
    const responses = [
      '我聽到了。',
      '嗯。',
      '很累...',
      '我在聽。',
      '還有嗎？'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <ChatScreenWithBackButton
      messages={messages}
      onSendMessage={handleSendMessage}
      isTyping={isTyping}
      currentSession="demo_session"
      onBackPress={handleBack}
    />
  )
}