import { ChatScreenWithBackButton } from '@/components/chat/ChatScreenWithBackButton';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useUnifiedSettings } from '@/contexts/UnifiedSettingsContext';
import { Message } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import { AuthScreen } from '../../src/components/auth/AuthScreen';
import { useAuth } from '../../src/contexts/AuthContext';
import { BailianMessage, sendBailianMessage } from '../../src/lib/bailian';
import { ChatService } from '../../src/services/chatService';
import LocalChatStorage from '../../src/services/localChatStorage';
import {
  detectEmotion,
  extractKeyTopic,
  selectCounselorTechnique
} from '../../src/utils/counselorTechniques';
// 条件性导入记忆功能
let useMemory: any;
try {
  const memoryModule = require('../../src/contexts/MemoryContext');
  useMemory = memoryModule.useMemory;
} catch (error) {
  console.warn('Memory context module not available');
  useMemory = null;
}

const ONBOARDING_KEY = 'hasCompletedOnboarding'

// 处理多气泡回复的函数
const handleMultipleBubbleResponse = async (
  fullResponse: string,
  conversationId: string,
  userId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  ChatService: any,
  LocalChatStorage: any
) => {
  // 智能分割回复成多个气泡
  const bubbles = splitResponseIntoBubbles(fullResponse);
  
  for (let i = 0; i < bubbles.length; i++) {
    const bubble = bubbles[i];
    
    // 每个气泡之间的延迟（0.8-1.5秒）
    if (i > 0) {
      const bubbleDelay = Math.random() * 700 + 800; // 800-1500ms
      await new Promise(resolve => setTimeout(resolve, bubbleDelay));
    }
    
    const aiMessage: Message = {
      id: `msg_${Date.now()}_ai_${i}`,
      sessionId: conversationId,
      userId: userId,
      senderType: 'ai',
      content: bubble.trim(),
      messageType: 'text',
      sentimentScore: 0.8,
      emotionalTags: ['supportive', 'understanding'],
      riskLevel: 'low',
      aiConfidenceScore: 0.9,
      therapeuticApproach: 'cbt',
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);
    
    // 保存到本地存儲
    await LocalChatStorage.saveMessage(aiMessage);
    
    // 保存到数据库
    try {
      await ChatService.saveMessage(
        conversationId,
        userId,
        bubble.trim(),
        'assistant'
      );
    } catch (error) {
      console.error('Error saving AI bubble message:', error);
    }
  }
};

// 智能分割回复成自然的气泡
const splitResponseIntoBubbles = (response: string): string[] => {
  // 如果回复很短，不分割
  if (response.length < 15) {
    return [response];
  }
  
  // 按标点符号分割，但保持自然
  const sentences = response.split(/([。！？.!?])/);
  const bubbles: string[] = [];
  let currentBubble = '';
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const punctuation = sentences[i + 1] || '';
    
    if (!sentence || sentence.trim().length === 0) continue;
    
    const fullSentence = sentence + punctuation;
    
    // 如果当前气泡为空，或者加上新句子后仍然不太长
    if (currentBubble === '' || (currentBubble + fullSentence).length < 20) {
      currentBubble += fullSentence;
    } else {
      // 保存当前气泡，开始新气泡
      if (currentBubble.trim()) {
        bubbles.push(currentBubble.trim());
      }
      currentBubble = fullSentence;
    }
  }
  
  // 添加最后一个气泡
  if (currentBubble.trim()) {
    bubbles.push(currentBubble.trim());
  }
  
  // 如果只有一个气泡且很长，尝试按逗号分割
  if (bubbles.length === 1 && bubbles[0].length > 30) {
    const parts = bubbles[0].split('，');
    if (parts.length > 1) {
      return parts.map((part, index) => 
        index === parts.length - 1 ? part : part + '，'
      ).filter(part => part.trim().length > 0);
    }
  }
  
  return bubbles.length > 0 ? bubbles : [response];
};

export default function HomeScreen() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [sessionLength, setSessionLength] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { hideTabBar, showTabBar } = useNavigation()
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuth()
  const { generateUnifiedPrompt, generateMemoryEnhancedPrompt } = useUnifiedSettings()
  
  // 条件性地使用记忆功能
  let memoryHooks;
  try {
    if (user) {
      memoryHooks = useMemory();
    } else {
      memoryHooks = null;
    }
  } catch (error) {
    console.warn('Memory context not available:', error);
    memoryHooks = null;
  }
  
  const { 
    addMemory, 
    retrieveMemories, 
    updateContext, 
    getContext,
    getPersonalizedGreeting,
    analyzeEmotionalPattern 
  } = memoryHooks || {
    addMemory: () => Promise.resolve(),
    retrieveMemories: () => Promise.resolve([]),
    updateContext: () => {},
    getContext: () => ({ recentTopics: [], emotionalState: 'stable' }),
    getPersonalizedGreeting: () => Promise.resolve('你好！我是 Ash，很高興見到你。'),
    analyzeEmotionalPattern: () => Promise.resolve('stable')
  }

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

  // Load previous conversation on app start
  useEffect(() => {
    if (user && hasCompletedOnboarding) {
      loadPreviousConversation()
    }
  }, [user, hasCompletedOnboarding])

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

  const loadPreviousConversation = async () => {
    if (!user) return

    try {
      // 嘗試獲取之前的會話ID
      const previousConversationId = await LocalChatStorage.getCurrentConversation()
      
      if (previousConversationId) {
        setCurrentConversationId(previousConversationId)
        
        // 加載之前的消息（使用分頁接口）
        const result = await LocalChatStorage.loadMessages(previousConversationId, 0)
        if (result.messages.length > 0) {
          setMessages(result.messages)
          setHasMore(result.hasMore)
          
          // 更新對話上下文給AI
          updateContext({
            sessionId: previousConversationId,
            recentTopics: extractTopicsFromMessages(result.messages.slice(-10))
          })
        }
      } else {
        // 沒有之前的會話，創建新的
        initializeConversation()
      }
      setIsInitialLoad(false)
    } catch (error) {
      console.error('Error loading previous conversation:', error)
      initializeConversation()
      setIsInitialLoad(false)
    }
  }

  const loadMoreMessages = async () => {
    if (!currentConversationId || loadingMore || !hasMore || messages.length === 0) return
    
    setLoadingMore(true)
    try {
      const oldestMessage = messages[0]
      const olderMessages = await LocalChatStorage.loadMoreMessages(
        currentConversationId,
        oldestMessage.id,
        20
      )
      
      if (olderMessages.length > 0) {
        setMessages(prev => [...olderMessages, ...prev])
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent
    
    // 當滾動到頂部附近時加載更多消息
    if (contentOffset.y <= 50 && !loadingMore && hasMore && !isInitialLoad) {
      loadMoreMessages()
    }
  }

  const extractTopicsFromMessages = (messages: Message[]): string[] => {
    const topics = new Set<string>()
    messages.forEach(msg => {
      if (msg.senderType === 'user') {
        const topic = extractKeyTopic(msg.content)
        if (topic) topics.add(topic)
      }
    })
    return Array.from(topics)
  }

  const initializeConversation = async () => {
    if (!user) return

    try {
      // Create a new conversation
      const { data: conversation, error } = await ChatService.createConversation(
        user.id,
        t('chat.greeting')
      )

      if (error || !conversation) {
        console.error('Error creating conversation:', error)
        return
      }

      setCurrentConversationId(conversation.id)
      
      // 保存當前會話ID到本地
      await LocalChatStorage.saveCurrentConversation(conversation.id)
      await LocalChatStorage.createConversation(conversation.id, t('chat.greeting'))

      // 更新对话上下文
      updateContext({
        sessionId: conversation.id,
        recentTopics: []
      })

      // 获取个性化问候语
      const personalizedGreeting = await getPersonalizedGreeting()

      // Initialize with personalized greeting message
      const initialMessage: Message = {
        id: 'initial_greeting',
        sessionId: conversation.id,
        userId: user.id,
        senderType: 'ai',
        content: personalizedGreeting,
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
        personalizedGreeting,
        'assistant'
      )

      // 分析情绪模式并记录
      try {
        const emotionalPattern = await analyzeEmotionalPattern()
        console.log('Current emotional pattern:', emotionalPattern)
      } catch (error) {
        console.log('Could not analyze emotional pattern:', error)
      }
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

    // Save user message to both database and local storage
    try {
      // 保存到Supabase
      await ChatService.saveMessage(
        currentConversationId,
        user.id,
        content,
        'user'
      )
      
      // 保存到本地存儲
      await LocalChatStorage.saveMessage(userMessage)
    } catch (error) {
      console.error('Error saving user message:', error)
      // 即使Supabase失敗，也確保保存到本地
      await LocalChatStorage.saveMessage(userMessage)
    }

    // 添加用户消息到记忆系统
    try {
      // 分析消息类型和重要性
      const isPersonalInfo = content.includes('我') || content.includes('家人') || content.includes('工作');
      const isEmotional = content.includes('感覺') || content.includes('情緒') || content.includes('心情');
      const isTherapeutic = content.includes('焦慮') || content.includes('憂鬱') || content.includes('壓力');
      
      let category: 'personal' | 'emotional' | 'therapeutic' | 'behavioral' = 'behavioral';
      let importance = 5;
      
      if (isTherapeutic) {
        category = 'therapeutic';
        importance = 8;
      } else if (isEmotional) {
        category = 'emotional';
        importance = 7;
      } else if (isPersonalInfo) {
        category = 'personal';
        importance = 6;
      }

      await addMemory(content, category, importance, ['conversation', 'user-input']);
      
      // 更新最近話題
      const topics = content.split(' ').filter(word => word.length > 2).slice(0, 3);
      updateContext({
        recentTopics: topics
      });
    } catch (error) {
      console.error('Error adding memory:', error);
    }

    // Get AI response from Bailian API with memory enhancement
    try {
      // 检索相关记忆
      const relevantMemories = await retrieveMemories(content, 3);
      
      // 分析用戶輸入以選擇咨詢師技巧
      const detectedEmotion = detectEmotion(content);
      const keyTopic = extractKeyTopic(content);
      const conversationContext = getContext();
      const counselorTechnique = selectCounselorTechnique(content, {
        recentTopics: conversationContext.recentTopics,
        emotionalState: conversationContext.emotionalState,
        sessionLength: sessionLength
      });
      
      // 生成增强的系统提示词，加入咨詢師技巧指導
      let enhancedPrompt = await generateMemoryEnhancedPrompt(content, relevantMemories);
      
      // 添加具體的回應技巧指導 (暂时注释掉，太死板)
      /*
      enhancedPrompt += `\n\n本次回應建議技巧：
技巧類型：${counselorTechnique.type}
建議模板：${counselorTechnique.template}
使用時機：${counselorTechnique.whenToUse}

檢測到的情緒：${detectedEmotion || '未明確'}
關鍵話題：${keyTopic || '待探索'}

請使用這個技巧，保持1-2句話的簡潔回應，重點是引導用戶繼續表達而非給建議。`;
      */
      
      // print enhancedPrompt
      console.log('enhancedPrompt', enhancedPrompt)
      // 從本地獲取更多歷史上下文（最多10條）
      const contextMessages = await LocalChatStorage.getContextMessages(currentConversationId, 10);
      
      // Prepare conversation history for Bailian API with memory-enhanced prompt
      const conversationHistory: BailianMessage[] = [
        {
          role: 'system',
          content: enhancedPrompt
        },
        // Add context from local storage if available
        ...(contextMessages.length > 0 ? contextMessages.slice(-6).map(msg => ({
          role: msg.senderType === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })) : 
        // Otherwise use current session messages
        messages.slice(-6).map(msg => ({
          role: msg.senderType === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }))),
        // Add current user message
        {
          role: 'user',
          content: content
        }
      ]

      // 添加思考延迟（1.5-3秒随机）
      const thinkingDelay = Math.random() * 1500 + 1500; // 1500-3000ms
      await new Promise(resolve => setTimeout(resolve, thinkingDelay));

      const aiResponse = await sendBailianMessage(conversationHistory)
      
      // 决定是否需要多气泡回复（30%概率）
      const shouldUseMultipleBubbles = Math.random() < 0.3;
      
      if (shouldUseMultipleBubbles && aiResponse.length > 10) {
        // 将回复分成多个气泡
        await handleMultipleBubbleResponse(aiResponse, currentConversationId, user.id, setMessages, ChatService, LocalChatStorage);
      } else {
        // 单个气泡回复
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
        
        // 保存到本地存儲
        await LocalChatStorage.saveMessage(aiMessage)
      }
      
      setIsTyping(false)
      setSessionLength(prev => prev + 1)

      // Save AI message to both database and local storage
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

      // 添加AI回复的重要信息到记忆
      try {
        if (aiResponse.includes('建議') || aiResponse.includes('練習') || aiResponse.includes('方法')) {
          await addMemory(
            `AI建議: ${aiResponse.substring(0, 100)}...`, 
            'therapeutic', 
            7, 
            ['ai-advice', 'therapeutic-suggestion']
          );
        }
      } catch (error) {
        console.error('Error adding AI response memory:', error);
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
      t('chat.response1'),
      t('chat.response2'),
      t('chat.response3'),
      t('chat.response4'),
      t('chat.response5'),
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
          onScroll={handleScroll}
          loadingMore={loadingMore}
          hasMore={hasMore}
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
