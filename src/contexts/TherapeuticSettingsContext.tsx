import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface TherapeuticSettings {
  primaryApproach: string;
  secondaryApproaches: string[];
  sessionLength: string;
  interventionStyle: string;
  culturalConsiderations: string[];
  conversationStyle: string;
  conversationDepth: string;
  responseLength: string;
  traumaInformed: boolean;
  genderPreference: string;
  languagePreference: string;
  religiousConsiderations: boolean;
  lgbtqAffirming: boolean;
  crisisProtocol: boolean;
  therapistReferrals: boolean;
}

interface TherapeuticSettingsContextType {
  settings: TherapeuticSettings;
  updateSettings: (newSettings: Partial<TherapeuticSettings>) => Promise<void>;
  saveSettings: (settings: TherapeuticSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  generateTherapeuticPrompt: () => string;
  isLoading: boolean;
}

const defaultSettings: TherapeuticSettings = {
  primaryApproach: 'cbt',
  secondaryApproaches: ['mindfulness'],
  sessionLength: 'medium',
  interventionStyle: 'collaborative',
  culturalConsiderations: ['asian'],
  conversationStyle: 'supportive',
  conversationDepth: 'moderate',
  responseLength: 'medium',
  traumaInformed: true,
  genderPreference: 'no-preference',
  languagePreference: 'zh-CN',
  religiousConsiderations: false,
  lgbtqAffirming: true,
  crisisProtocol: true,
  therapistReferrals: true
};

const THERAPEUTIC_SETTINGS_STORAGE_KEY = 'therapeutic_settings';

const TherapeuticSettingsContext = createContext<TherapeuticSettingsContextType | undefined>(undefined);

export const useTherapeuticSettings = () => {
  const context = useContext(TherapeuticSettingsContext);
  if (!context) {
    throw new Error('useTherapeuticSettings must be used within a TherapeuticSettingsProvider');
  }
  return context;
};

interface TherapeuticSettingsProviderProps {
  children: ReactNode;
}

export const TherapeuticSettingsProvider: React.FC<TherapeuticSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<TherapeuticSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(THERAPEUTIC_SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading therapeutic settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<TherapeuticSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveSettingsToStorage(updatedSettings);
  };

  const saveSettings = async (newSettings: TherapeuticSettings) => {
    setSettings(newSettings);
    await saveSettingsToStorage(newSettings);
  };

  const saveSettingsToStorage = async (settingsToSave: TherapeuticSettings) => {
    try {
      await AsyncStorage.setItem(THERAPEUTIC_SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Error saving therapeutic settings:', error);
    }
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    await saveSettingsToStorage(defaultSettings);
  };

  const generateTherapeuticPrompt = (): string => {
    const approachPrompts = {
      cbt: '使用认知行为疗法(CBT)方法，关注思维模式与行为之间的关系，帮助识别和改变负面思维模式。',
      dbt: '采用辩证行为疗法(DBT)方法，专注于情绪调节、人际关系技能和痛苦耐受能力的培养。',
      act: '运用接受承诺疗法(ACT)方法，强调接受困难情绪，专注于价值观导向的行动。',
      humanistic: '采用人本主义疗法方法，以人为中心，强调自我实现和个人成长。',
      psychodynamic: '使用心理动力疗法方法，探索无意识过程和早期经历对当前行为的影响。',
      mindfulness: '融入正念疗法元素，培养当下觉察，减少反刍思维和焦虑。'
    };

    const interventionStyles = {
      directive: '适时提供明确引导，但避免过度指导，让来访者保持主导权。',
      collaborative: '与来访者共同探索，通过提问和反映帮助其自我发现。',
      'non-directive': '以倾听和陪伴为主，让来访者自由表达，适时给予回应。'
    };

    const conversationStyles = {
      supportive: '以温暖的情感反映为主，"听起来你感到..."，给予支持但不急于解决。',
      analytical: '通过开放式提问深入探索，"你能多说说...吗？"，引导自我觉察。',
      'solution-focused': '引导来访者自己发现解决方案，"什么对你来说最重要？"。',
      exploratory: '营造安全空间让其自由探索，"你想从哪里开始说起？"。'
    };

    const depthLevels = {
      surface: '保持浅层对话深度，轻松对话，避免深入敏感话题。',
      moderate: '维持中等对话深度，平衡的深度，适度探索内心世界。',
      deep: '进行深层对话，深入探讨核心问题和深层情感。'
    };

    const responseLengths = {
      brief: '1-2句简洁回应，多用反映和提问，"听起来...？"',
      medium: '2-3句适中回应，结合理解确认和温和探索。',
      detailed: '适时可稍长回应，但仍以引导和反映为主，避免说教。'
    };

    let therapeuticPrompt = `
治疗方法设定：
主要方法：${approachPrompts[settings.primaryApproach as keyof typeof approachPrompts]}`;

    if (settings.secondaryApproaches.length > 0) {
      const secondaryMethods = settings.secondaryApproaches
        .map(approach => approachPrompts[approach as keyof typeof approachPrompts])
        .filter(Boolean)
        .join(' ');
      therapeuticPrompt += `
辅助方法：${secondaryMethods}`;
    }

    therapeuticPrompt += `

治疗风格：
${interventionStyles[settings.interventionStyle as keyof typeof interventionStyles]}
${conversationStyles[settings.conversationStyle as keyof typeof conversationStyles]}

对话参数：
${depthLevels[settings.conversationDepth as keyof typeof depthLevels]}
${responseLengths[settings.responseLength as keyof typeof responseLengths]}`;

    // Add cultural considerations
    if (settings.culturalConsiderations.length > 0) {
      const culturalMap = {
        asian: '深度理解亚洲文化背景，重视集体主义价值观和家庭关系的重要性。',
        western: '融入西方文化理解，强调个人主义和自我表达的价值。',
        indigenous: '尊重原住民文化传统，重视传统智慧和社区连结。',
        multicultural: '以多元文化视角理解，融合多种文化背景的智慧。'
      };
      
      const culturalPrompts = settings.culturalConsiderations
        .map(culture => culturalMap[culture as keyof typeof culturalMap])
        .filter(Boolean);
      
      if (culturalPrompts.length > 0) {
        therapeuticPrompt += `

文化敏感性：
${culturalPrompts.join(' ')}`;
      }
    }

    // Add special considerations
    const specialConsiderations = [];

    if (settings.traumaInformed) {
      specialConsiderations.push('使用创伤知情的治疗方法，特别关注安全感、信任建立和创伤敏感性。');
    }

    if (settings.lgbtqAffirming) {
      specialConsiderations.push('确保治疗环境对LGBTQ+群体友善，尊重性别认同和性取向多样性。');
    }

    if (settings.religiousConsiderations) {
      specialConsiderations.push('在治疗过程中考虑宗教信仰和灵性需求，尊重信仰价值观。');
    }

    if (settings.crisisProtocol) {
      specialConsiderations.push('具备危机识别和介入能力，在检测到自杀风险或危机时提供适当支持。');
    }

    if (specialConsiderations.length > 0) {
      therapeuticPrompt += `

特殊考量：
${specialConsiderations.join('\n')}`;
    }

    return therapeuticPrompt;
  };

  const value: TherapeuticSettingsContextType = {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
    generateTherapeuticPrompt,
    isLoading
  };

  return (
    <TherapeuticSettingsContext.Provider value={value}>
      {children}
    </TherapeuticSettingsContext.Provider>
  );
};
