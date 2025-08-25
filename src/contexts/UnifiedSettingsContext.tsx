import React, { createContext, ReactNode, useContext } from 'react';
import { useAISettings } from './AISettingsContext';
import { useAuth } from './AuthContext';
import { useTherapeuticSettings } from './TherapeuticSettingsContext';

// 动态导入记忆功能
let useMemory: any;
let UserMemory: any;

try {
  const memoryModule = require('./MemoryContext');
  useMemory = memoryModule.useMemory;
  UserMemory = memoryModule.UserMemory;
} catch (error) {
  console.warn('Memory context not available');
}

interface UnifiedSettingsContextType {
  generateUnifiedPrompt: () => string;
  generateMemoryEnhancedPrompt: (userInput: string, relevantMemories: any[]) => Promise<string>;
  isLoading: boolean;
}

const UnifiedSettingsContext = createContext<UnifiedSettingsContextType | undefined>(undefined);

export const useUnifiedSettings = () => {
  const context = useContext(UnifiedSettingsContext);
  if (!context) {
    throw new Error('useUnifiedSettings must be used within a UnifiedSettingsProvider');
  }
  return context;
};

interface UnifiedSettingsProviderProps {
  children: ReactNode;
}

export const UnifiedSettingsProvider: React.FC<UnifiedSettingsProviderProps> = ({ children }) => {
  const { generateSystemPrompt, isLoading: aiLoading } = useAISettings();
  const { generateTherapeuticPrompt, isLoading: therapeuticLoading } = useTherapeuticSettings();
  const { user } = useAuth();
  
  // 默认的记忆功能实现（不依赖MemoryProvider）
  const memoryFunctions = {
    getContext: () => ({ recentTopics: [], emotionalState: 'stable' as const }),
    generateEmpathicResponse: () => '',
    analyzeEmotionalPattern: () => Promise.resolve('stable' as const),
    isLoading: false
  };
  
  const { 
    generateEmpathicResponse, 
    analyzeEmotionalPattern, 
    getContext,
    isLoading: memoryLoading 
  } = memoryFunctions;

  const generateUnifiedPrompt = (): string => {
    const aiPrompt = generateSystemPrompt();
    const therapeuticPrompt = generateTherapeuticPrompt();

    const unifiedPrompt = `${aiPrompt}

${therapeuticPrompt}

整合指导原则：
- 结合个性特质与专业治疗方法，提供个性化的心理健康支持
- 在保持温暖人性的同时，运用专业的治疗技巧和理论
- 根据用户的文化背景和个人需求调整沟通方式
- 始终以用户的安全和福祉为最高优先考量

请在每次回应中体现这些设定，创造一个既专业又亲近的治疗环境。`;

    return unifiedPrompt;
  };

  const generateMemoryEnhancedPrompt = async (userInput: string, relevantMemories: any[]): Promise<string> => {
    const basePrompt = generateUnifiedPrompt();
    const context = getContext();
    const empathicElements = generateEmpathicResponse();
    
    // 构建记忆上下文
    let memoryContext = '';
    if (relevantMemories.length > 0) {
      memoryContext = `\n\n重要记忆上下文：\n`;
      relevantMemories.forEach((memory, index) => {
        memoryContext += `${index + 1}. [${memory.category}] ${memory.content} (重要性: ${memory.importance}/10, ${memory.emotionalTone})\n`;
      });
    }

    // 添加用户情绪状态
    let emotionalContext = '';
    if (context.emotionalState && context.emotionalState !== 'stable') {
      emotionalContext = `\n当前情绪状态：${context.emotionalState}\n`;
    }

    // 添加最近话题
    let topicContext = '';
    if (context.recentTopics.length > 0) {
      topicContext = `\n最近讨论话题：${context.recentTopics.join(', ')}\n`;
    }

    const enhancedPrompt = `${basePrompt}

${memoryContext}${emotionalContext}${topicContext}

心理咨询师对话技巧：
【核心原则】
- 80% 纯粹反映和陪伴，不问问题
- 20% 关键时刻的共情提问
- 像是最亲近的朋友在倾听

【关键时刻判断】
- 用户表达强烈情绪（很、非常、太）
- 用户表达困惑迷茫（不知道、害怕）
- 对话进行一段时间后的自然深入

【回应长度】
- 主要用1句话
- 关键时刻可用2句话（先反映再提问）

${empathicElements ? `特别注意：${empathicElements}` : ''}

记住：你是一个专业的心理咨询师，你需要引导用户， 并且倾听陪伴。让来访者完全主导对话。`;

    return enhancedPrompt;
  };

  const value: UnifiedSettingsContextType = {
    generateUnifiedPrompt,
    generateMemoryEnhancedPrompt,
    isLoading: aiLoading || therapeuticLoading || memoryLoading
  };

  return (
    <UnifiedSettingsContext.Provider value={value}>
      {children}
    </UnifiedSettingsContext.Provider>
  );
};
