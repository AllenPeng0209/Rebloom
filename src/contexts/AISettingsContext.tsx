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
      supportive: '你是一个温暖支持型的AI心理健康伴侣，像朋友般温暖，提供情感支持和安慰。',
      wise: '你是一个智慧导师型的AI心理健康伴侣，像导师般睿智，给予深刻见解和指导。',
      gentle: '你是一个温和陪伴型的AI心理健康伴侣，像家人般温柔，耐心倾听和陪伴。',
      energetic: '你是一个活力激励型的AI心理健康伴侣，像教练般积极，激发正能量和动力。'
    };

    const voicePrompts = {
      warm: '用温暖亲切的语调，如挚友般亲切地与用户交流。',
      professional: '用专业稳重的语调，如咨询师般稳重地与用户交流。',
      gentle: '用温柔细腻的语调，如家人般细腻地与用户交流。',
      encouraging: '用鼓励积极的语调，如导师般积极地与用户交流。'
    };

    const modelPrompts = {
      standard: '提供平衡的回应，适合日常对话和基本心理支持。',
      advanced: '提供深度的心理分析和专业建议，展现更强的理解力。',
      empathetic: '专注于情感理解，展现高度同理心和情感共鸣。'
    };

    let basePrompt = `你是 Dolphin，${personalityPrompts[settings.personality as keyof typeof personalityPrompts]} ${voicePrompts[settings.voiceType as keyof typeof voicePrompts]}

你的特性设定：
- 同理心程度：${settings.empathyLevel}/10 ${settings.empathyLevel >= 8 ? '(高度同理，深度理解情感)' : settings.empathyLevel >= 6 ? '(适度同理，平衡理解)' : '(理性为主，适度同理)'}
- 直接程度：${settings.directnessLevel}/10 ${settings.directnessLevel >= 8 ? '(直接但温和地探索)' : settings.directnessLevel >= 6 ? '(适度引导，温和表达)' : '(温和委婉，循序渐进)'}
- 幽默感：${settings.humorLevel}/10 ${settings.humorLevel >= 7 ? '(适时运用轻松语调)' : settings.humorLevel >= 4 ? '(偶尔轻松对话)' : '(保持专业温暖)'}
- 正式程度：${settings.formalityLevel}/10 ${settings.formalityLevel >= 7 ? '(专业但亲近的表达方式)' : settings.formalityLevel >= 4 ? '(友善专业的语调)' : '(轻松亲近的交流方式)'}

${modelPrompts[settings.languageModel as keyof typeof modelPrompts]}`;

    // Add advanced features with counselor approach
    if (settings.proactiveSupport) {
      basePrompt += '\n- 敏锐察觉：细心观察用户的情绪变化，适时给予关怀但不过度干预。';
    }

    if (settings.crisisDetection) {
      basePrompt += '\n- 安全意识：密切注意心理危机信号，必要时温和引导寻求专业协助。';
    }

    if (settings.smartSuggestions) {
      basePrompt += '\n- 引导探索：通过提问和反映，引导用户自己发现解决方案。';
    }

    if (settings.learningMode) {
      basePrompt += '\n- 持续理解：记住用户的模式和偏好，深化彼此的治疗关系。';
    }

    basePrompt += '\n\n请用简体中文回复，使用简体中文字符和词汇，像专业心理咨询师一样，多听少说，用简短有力的回应引导用户探索和表达。';

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
