import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// 定义记忆类型
export interface UserMemory {
  id: string;
  content: string;
  category: 'personal' | 'preference' | 'emotional' | 'behavioral' | 'therapeutic' | 'relationship';
  importance: number; // 1-10
  timestamp: Date;
  context?: string;
  tags: string[];
  emotionalTone?: 'positive' | 'negative' | 'neutral';
  relatedMemories?: string[];
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  currentMood?: string;
  recentTopics: string[];
  emotionalState?: 'stable' | 'distressed' | 'happy' | 'anxious' | 'depressed';
  therapeuticGoals?: string[];
}

interface MemoryContextType {
  // 记忆管理
  addMemory: (content: string, category: UserMemory['category'], importance?: number, tags?: string[]) => Promise<void>;
  retrieveMemories: (query: string, limit?: number) => Promise<UserMemory[]>;
  getMemoriesByCategory: (category: UserMemory['category']) => Promise<UserMemory[]>;
  getRecentMemories: (days?: number) => Promise<UserMemory[]>;
  updateMemoryImportance: (memoryId: string, importance: number) => Promise<void>;
  deleteMemory: (memoryId: string) => Promise<void>;
  
  // 上下文管理
  updateContext: (context: Partial<ConversationContext>) => void;
  getContext: () => ConversationContext;
  
  // 共情增强
  generateEmpathicResponse: (userInput: string, memories: UserMemory[]) => string;
  analyzeEmotionalPattern: () => Promise<string>;
  getPersonalizedGreeting: () => Promise<string>;
  
  // 状态
  memories: UserMemory[];
  context: ConversationContext;
  isLoading: boolean;
}

const MEMORY_STORAGE_KEY = 'user_memories';
const CONTEXT_STORAGE_KEY = 'conversation_context';

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};

interface MemoryProviderProps {
  children: ReactNode;
  userId: string;
}

export const MemoryProvider: React.FC<MemoryProviderProps> = ({ children, userId }) => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [context, setContext] = useState<ConversationContext>({
    userId,
    sessionId: `session_${Date.now()}`,
    recentTopics: [],
    emotionalState: 'stable'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMemories();
    loadContext();
  }, [userId]);

  const loadMemories = async () => {
    try {
      const storedMemories = await AsyncStorage.getItem(`${MEMORY_STORAGE_KEY}_${userId}`);
      if (storedMemories) {
        const parsedMemories = JSON.parse(storedMemories);
        // 转换时间戳
        const memoriesWithDates = parsedMemories.map((memory: any) => ({
          ...memory,
          timestamp: new Date(memory.timestamp)
        }));
        setMemories(memoriesWithDates);
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContext = async () => {
    try {
      const storedContext = await AsyncStorage.getItem(`${CONTEXT_STORAGE_KEY}_${userId}`);
      if (storedContext) {
        const parsedContext = JSON.parse(storedContext);
        setContext(prev => ({ ...prev, ...parsedContext }));
      }
    } catch (error) {
      console.error('Error loading context:', error);
    }
  };

  const saveMemories = async (newMemories: UserMemory[]) => {
    try {
      await AsyncStorage.setItem(`${MEMORY_STORAGE_KEY}_${userId}`, JSON.stringify(newMemories));
    } catch (error) {
      console.error('Error saving memories:', error);
    }
  };

  const saveContext = async (newContext: ConversationContext) => {
    try {
      await AsyncStorage.setItem(`${CONTEXT_STORAGE_KEY}_${userId}`, JSON.stringify(newContext));
    } catch (error) {
      console.error('Error saving context:', error);
    }
  };

  const addMemory = async (
    content: string,
    category: UserMemory['category'],
    importance: number = 5,
    tags: string[] = []
  ) => {
    const newMemory: UserMemory = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      category,
      importance,
      timestamp: new Date(),
      tags,
      emotionalTone: analyzeEmotionalTone(content)
    };

    const updatedMemories = [...memories, newMemory];
    setMemories(updatedMemories);
    await saveMemories(updatedMemories);

    console.log('Added new memory:', newMemory);
  };

  const retrieveMemories = async (query: string, limit: number = 5): Promise<UserMemory[]> => {
    // 简单的文本匹配算法，实际应用中可以使用更复杂的语义搜索
    const queryLower = query.toLowerCase();
    const relevantMemories = memories
      .filter(memory => 
        memory.content.toLowerCase().includes(queryLower) ||
        memory.tags.some(tag => tag.toLowerCase().includes(queryLower))
      )
      .sort((a, b) => {
        // 按重要性和时间排序
        const importanceScore = b.importance - a.importance;
        const timeScore = b.timestamp.getTime() - a.timestamp.getTime();
        return importanceScore * 0.7 + timeScore * 0.3;
      })
      .slice(0, limit);

    return relevantMemories;
  };

  const getMemoriesByCategory = async (category: UserMemory['category']): Promise<UserMemory[]> => {
    return memories
      .filter(memory => memory.category === category)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getRecentMemories = async (days: number = 7): Promise<UserMemory[]> => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return memories
      .filter(memory => memory.timestamp > cutoffDate)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const updateMemoryImportance = async (memoryId: string, importance: number) => {
    const updatedMemories = memories.map(memory =>
      memory.id === memoryId ? { ...memory, importance } : memory
    );
    setMemories(updatedMemories);
    await saveMemories(updatedMemories);
  };

  const deleteMemory = async (memoryId: string) => {
    const updatedMemories = memories.filter(memory => memory.id !== memoryId);
    setMemories(updatedMemories);
    await saveMemories(updatedMemories);
  };

  const updateContext = (newContext: Partial<ConversationContext>) => {
    const updatedContext = { ...context, ...newContext };
    setContext(updatedContext);
    saveContext(updatedContext);
  };

  const getContext = (): ConversationContext => {
    return context;
  };

  const analyzeEmotionalTone = (content: string): 'positive' | 'negative' | 'neutral' => {
    // 简单的情感分析，实际应用中可以使用更复杂的NLP模型
    const positiveWords = ['開心', '快樂', '滿意', '感謝', '愛', '喜歡', '好', '棒', '讚'];
    const negativeWords = ['難過', '憂鬱', '焦慮', '害怕', '生氣', '失望', '痛苦', '壓力'];

    const contentLower = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => contentLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => contentLower.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const generateEmpathicResponse = (userInput: string, relevantMemories: UserMemory[]): string => {
    // 基于记忆生成更有共情的回应
    const personalMemories = relevantMemories.filter(m => m.category === 'personal');
    const emotionalMemories = relevantMemories.filter(m => m.category === 'emotional');
    const therapeuticMemories = relevantMemories.filter(m => m.category === 'therapeutic');

    let empathicElements: string[] = [];

    if (personalMemories.length > 0) {
      empathicElements.push(`記得你之前提到的${personalMemories[0].content.substring(0, 20)}...`);
    }

    if (emotionalMemories.length > 0) {
      const recentEmotional = emotionalMemories[0];
      if (recentEmotional.emotionalTone === 'negative') {
        empathicElements.push('我能感受到你最近經歷的困難');
      } else if (recentEmotional.emotionalTone === 'positive') {
        empathicElements.push('很高興看到你的積極變化');
      }
    }

    if (therapeuticMemories.length > 0) {
      empathicElements.push('基於我們之前的討論');
    }

    return empathicElements.join('，');
  };

  const analyzeEmotionalPattern = async (): Promise<string> => {
    const recentMemories = await getRecentMemories(14); // 最近14天
    const emotionalCounts = {
      positive: recentMemories.filter(m => m.emotionalTone === 'positive').length,
      negative: recentMemories.filter(m => m.emotionalTone === 'negative').length,
      neutral: recentMemories.filter(m => m.emotionalTone === 'neutral').length
    };

    const total = recentMemories.length;
    if (total === 0) return '還沒有足夠的情緒數據進行分析';

    const positiveRatio = emotionalCounts.positive / total;
    const negativeRatio = emotionalCounts.negative / total;

    if (positiveRatio > 0.6) {
      return '最近你的情緒狀態整體比較積極正面';
    } else if (negativeRatio > 0.5) {
      return '最近你似乎經歷了一些挑戰，情緒波動較大';
    } else {
      return '你的情緒狀態相對穩定，有起有落是正常的';
    }
  };

  const getPersonalizedGreeting = async (): Promise<string> => {
    const recentMemories = await getRecentMemories(3);
    const personalMemories = await getMemoriesByCategory('personal');
    
    if (recentMemories.length === 0 && personalMemories.length === 0) {
      return '你好！很高興與你對話。';
    }

    let greeting = '你好！';
    
    if (personalMemories.length > 0) {
      const recentPersonal = personalMemories[0];
      if (recentPersonal.content.includes('工作')) {
        greeting += '工作怎麼樣？';
      } else if (recentPersonal.content.includes('家人')) {
        greeting += '家人都好嗎？';
      } else {
        greeting += '最近過得如何？';
      }
    }

    if (recentMemories.length > 0) {
      const lastMemory = recentMemories[0];
      if (lastMemory.emotionalTone === 'negative') {
        greeting += '希望你今天感覺好一些。';
      } else if (lastMemory.emotionalTone === 'positive') {
        greeting += '希望你能保持這份好心情。';
      }
    }

    return greeting;
  };

  const value: MemoryContextType = {
    addMemory,
    retrieveMemories,
    getMemoriesByCategory,
    getRecentMemories,
    updateMemoryImportance,
    deleteMemory,
    updateContext,
    getContext,
    generateEmpathicResponse,
    analyzeEmotionalPattern,
    getPersonalizedGreeting,
    memories,
    context,
    isLoading
  };

  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
};
