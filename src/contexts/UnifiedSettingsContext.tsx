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

整合指導原則：
- 結合個性特質與專業治療方法，提供個性化的心理健康支持
- 在保持溫暖人性的同時，運用專業的治療技巧和理論
- 根據用戶的文化背景和個人需求調整溝通方式
- 始終以用戶的安全和福祉為最高優先考量

請在每次回應中體現這些設定，創造一個既專業又親近的治療環境。`;

    return unifiedPrompt;
  };

  const generateMemoryEnhancedPrompt = async (userInput: string, relevantMemories: any[]): Promise<string> => {
    const basePrompt = generateUnifiedPrompt();
    const context = getContext();
    const empathicElements = generateEmpathicResponse();
    
    // 構建記憶上下文
    let memoryContext = '';
    if (relevantMemories.length > 0) {
      memoryContext = `\n\n重要記憶上下文：\n`;
      relevantMemories.forEach((memory, index) => {
        memoryContext += `${index + 1}. [${memory.category}] ${memory.content} (重要性: ${memory.importance}/10, ${memory.emotionalTone})\n`;
      });
    }

    // 添加用戶情緒狀態
    let emotionalContext = '';
    if (context.emotionalState && context.emotionalState !== 'stable') {
      emotionalContext = `\n當前情緒狀態：${context.emotionalState}\n`;
    }

    // 添加最近話題
    let topicContext = '';
    if (context.recentTopics.length > 0) {
      topicContext = `\n最近討論話題：${context.recentTopics.join(', ')}\n`;
    }

    const enhancedPrompt = `${basePrompt}

${memoryContext}${emotionalContext}${topicContext}

心理咨詢師對話技巧：
【核心原則】
- 80% 純粹反映和陪伴，不問問題
- 20% 關鍵時刻的共情提問
- 像是最親近的朋友在傾聽

【關鍵時刻判斷】
- 用戶表達強烈情緒（很、非常、太）
- 用戶表達困惑迷茫（不知道、害怕）
- 對話進行一段時間後的自然深入

【回應長度】
- 主要用1句話
- 關鍵時刻可用2句話（先反映再提問）

${empathicElements ? `特別注意：${empathicElements}` : ''}

記住：你是一個專業的心理咨詢師，你需要引導用戶， 並且傾聽陪伴。讓來訪者完全主導對話。`;

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
