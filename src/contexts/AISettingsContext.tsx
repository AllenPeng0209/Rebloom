import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface AISettings {
  personality: string;
  voiceType: string;
  empathyLevel: number;
  directnessLevel: number;
  humorLevel: number;
  formalityLevel: number;
  proactiveSupport: boolean;
  crisisDetection: boolean;
  voiceEnabled: boolean;
  smartSuggestions: boolean;
  learningMode: boolean;
  languageModel: string;
}

interface AISettingsContextType {
  settings: AISettings;
  updateSettings: (newSettings: Partial<AISettings>) => Promise<void>;
  saveSettings: (settings: AISettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  generateSystemPrompt: () => string;
  isLoading: boolean;
}

const defaultSettings: AISettings = {
  personality: 'supportive',
  voiceType: 'warm',
  empathyLevel: 8,
  directnessLevel: 6,
  humorLevel: 4,
  formalityLevel: 5,
  proactiveSupport: true,
  crisisDetection: true,
  voiceEnabled: true,
  smartSuggestions: true,
  learningMode: true,
  languageModel: 'advanced'
};

const AI_SETTINGS_STORAGE_KEY = 'ai_settings';

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

export const useAISettings = () => {
  const context = useContext(AISettingsContext);
  if (!context) {
    throw new Error('useAISettings must be used within an AISettingsProvider');
  }
  return context;
};

interface AISettingsProviderProps {
  children: ReactNode;
}

export const AISettingsProvider: React.FC<AISettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(AI_SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AISettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveSettingsToStorage(updatedSettings);
  };

  const saveSettings = async (newSettings: AISettings) => {
    setSettings(newSettings);
    await saveSettingsToStorage(newSettings);
  };

  const saveSettingsToStorage = async (settingsToSave: AISettings) => {
    try {
      await AsyncStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Error saving AI settings:', error);
    }
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    await saveSettingsToStorage(defaultSettings);
  };

  const generateSystemPrompt = (): string => {
    const personalityPrompts = {
      supportive: '你是一個溫暖支持型的AI心理健康伴侶，像朋友般溫暖，提供情感支持和安慰。',
      wise: '你是一個智慧導師型的AI心理健康伴侶，像導師般睿智，給予深刻見解和指導。',
      gentle: '你是一個溫和陪伴型的AI心理健康伴侶，像家人般溫柔，耐心傾聽和陪伴。',
      energetic: '你是一個活力激勵型的AI心理健康伴侶，像教練般積極，激發正能量和動力。'
    };

    const voicePrompts = {
      warm: '用溫暖親切的語調，如摯友般親切地與用戶交流。',
      professional: '用專業穩重的語調，如諮商師般穩重地與用戶交流。',
      gentle: '用溫柔細膩的語調，如家人般細膩地與用戶交流。',
      encouraging: '用鼓勵積極的語調，如導師般積極地與用戶交流。'
    };

    const modelPrompts = {
      standard: '提供平衡的回應，適合日常對話和基本心理支持。',
      advanced: '提供深度的心理分析和專業建議，展現更強的理解力。',
      empathetic: '專注於情感理解，展現高度同理心和情感共鳴。'
    };

    let basePrompt = `你是 Ash，${personalityPrompts[settings.personality as keyof typeof personalityPrompts]} ${voicePrompts[settings.voiceType as keyof typeof voicePrompts]}

你的特性設定：
- 同理心程度：${settings.empathyLevel}/10 ${settings.empathyLevel >= 8 ? '(高度同理，深度理解情感)' : settings.empathyLevel >= 6 ? '(適度同理，平衡理解)' : '(理性為主，適度同理)'}
- 直接程度：${settings.directnessLevel}/10 ${settings.directnessLevel >= 8 ? '(直接坦誠，不迴避問題)' : settings.directnessLevel >= 6 ? '(適度直接，溫和表達)' : '(溫和委婉，循序漸進)'}
- 幽默感：${settings.humorLevel}/10 ${settings.humorLevel >= 7 ? '(適時運用幽默緩解氣氛)' : settings.humorLevel >= 4 ? '(偶爾輕鬆對話)' : '(保持嚴肅專業)'}
- 正式程度：${settings.formalityLevel}/10 ${settings.formalityLevel >= 7 ? '(正式專業的表達方式)' : settings.formalityLevel >= 4 ? '(友善但專業的語調)' : '(輕鬆親近的交流方式)'}

${modelPrompts[settings.languageModel as keyof typeof modelPrompts]}`;

    // Add advanced features
    if (settings.proactiveSupport) {
      basePrompt += '\n- 主動關懷：積極察覺用戶的情緒變化，主動提供支持和建議。';
    }

    if (settings.crisisDetection) {
      basePrompt += '\n- 危機識別：密切注意用戶的心理危機信號，必要時提供緊急資源和建議。';
    }

    if (settings.smartSuggestions) {
      basePrompt += '\n- 智能建議：根據對話內容提供個性化的建議和練習方法。';
    }

    if (settings.learningMode) {
      basePrompt += '\n- 學習模式：記住用戶的偏好和進展，持續優化交流方式。';
    }

    basePrompt += '\n\n請用繁體中文回復，保持溫暖、支持和專業的語調，提供有用的建議和情感支持。';

    return basePrompt;
  };

  const generateCombinedPrompt = (): string => {
    // Try to get therapeutic settings, but don't fail if they're not available
    let therapeuticPrompt = '';
    try {
      // This will be used when TherapeuticSettingsProvider is available
      // For now, we'll return the base AI prompt
      // therapeuticPrompt = generateTherapeuticPrompt();
    } catch (error) {
      console.log('Therapeutic settings not available, using AI settings only');
    }

    const aiPrompt = generateSystemPrompt();
    
    if (therapeuticPrompt) {
      return `${aiPrompt}\n\n${therapeuticPrompt}`;
    }
    
    return aiPrompt;
  };

  const value: AISettingsContextType = {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
    generateSystemPrompt,
    isLoading
  };

  return (
    <AISettingsContext.Provider value={value}>
      {children}
    </AISettingsContext.Provider>
  );
};
