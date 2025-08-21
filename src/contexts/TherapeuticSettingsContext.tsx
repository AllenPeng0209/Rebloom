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
  languagePreference: 'zh-TW',
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
      cbt: '使用認知行為療法(CBT)方法，關注思維模式與行為之間的關係，幫助識別和改變負面思維模式。',
      dbt: '採用辯證行為療法(DBT)方法，專注於情緒調節、人際關係技能和痛苦耐受能力的培養。',
      act: '運用接受承諾療法(ACT)方法，強調接受困難情緒，專注於價值觀導向的行動。',
      humanistic: '採用人本主義療法方法，以人為中心，強調自我實現和個人成長。',
      psychodynamic: '使用心理動力療法方法，探索無意識過程和早期經歷對當前行為的影響。',
      mindfulness: '融入正念療法元素，培養當下覺察，減少反芻思維和焦慮。'
    };

    const interventionStyles = {
      directive: '適時提供明確引導，但避免過度指導，讓來訪者保持主導權。',
      collaborative: '與來訪者共同探索，通過提問和反映幫助其自我發現。',
      'non-directive': '以傾聽和陪伴為主，讓來訪者自由表達，適時給予回應。'
    };

    const conversationStyles = {
      supportive: '以溫暖的情感反映為主，"聽起來你感到..."，給予支持但不急於解決。',
      analytical: '通過開放式提問深入探索，"你能多說說...嗎？"，引導自我覺察。',
      'solution-focused': '引導來訪者自己發現解決方案，"什麼對你來說最重要？"。',
      exploratory: '營造安全空間讓其自由探索，"你想從哪裡開始說起？"。'
    };

    const depthLevels = {
      surface: '保持淺層對話深度，輕鬆對話，避免深入敏感話題。',
      moderate: '維持中等對話深度，平衡的深度，適度探索內心世界。',
      deep: '進行深層對話，深入探討核心問題和深層情感。'
    };

    const responseLengths = {
      brief: '1-2句簡潔回應，多用反映和提問，"聽起來...？"',
      medium: '2-3句適中回應，結合理解確認和溫和探索。',
      detailed: '適當時可稍長回應，但仍以引導和反映為主，避免說教。'
    };

    let therapeuticPrompt = `
治療方法設定：
主要方法：${approachPrompts[settings.primaryApproach as keyof typeof approachPrompts]}`;

    if (settings.secondaryApproaches.length > 0) {
      const secondaryMethods = settings.secondaryApproaches
        .map(approach => approachPrompts[approach as keyof typeof approachPrompts])
        .filter(Boolean)
        .join(' ');
      therapeuticPrompt += `
輔助方法：${secondaryMethods}`;
    }

    therapeuticPrompt += `

治療風格：
${interventionStyles[settings.interventionStyle as keyof typeof interventionStyles]}
${conversationStyles[settings.conversationStyle as keyof typeof conversationStyles]}

對話參數：
${depthLevels[settings.conversationDepth as keyof typeof depthLevels]}
${responseLengths[settings.responseLength as keyof typeof responseLengths]}`;

    // Add cultural considerations
    if (settings.culturalConsiderations.length > 0) {
      const culturalMap = {
        asian: '深度理解亞洲文化背景，重視集體主義價值觀和家庭關係的重要性。',
        western: '融入西方文化理解，強調個人主義和自我表達的價值。',
        indigenous: '尊重原住民文化傳統，重視傳統智慧和社群連結。',
        multicultural: '以多元文化視角理解，融合多種文化背景的智慧。'
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
      specialConsiderations.push('使用創傷知情的治療方法，特別關注安全感、信任建立和創傷敏感性。');
    }
    
    if (settings.lgbtqAffirming) {
      specialConsiderations.push('確保治療環境對LGBTQ+群體友善，尊重性別認同和性取向多樣性。');
    }
    
    if (settings.religiousConsiderations) {
      specialConsiderations.push('在治療過程中考慮宗教信仰和靈性需求，尊重信仰價值觀。');
    }
    
    if (settings.crisisProtocol) {
      specialConsiderations.push('具備危機識別和介入能力，在檢測到自殺風險或危機時提供適當支持。');
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
