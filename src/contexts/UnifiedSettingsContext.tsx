import React, { createContext, ReactNode, useContext } from 'react';
import { useAISettings } from './AISettingsContext';
import { useTherapeuticSettings } from './TherapeuticSettingsContext';

interface UnifiedSettingsContextType {
  generateUnifiedPrompt: () => string;
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

  const value: UnifiedSettingsContextType = {
    generateUnifiedPrompt,
    isLoading: aiLoading || therapeuticLoading
  };

  return (
    <UnifiedSettingsContext.Provider value={value}>
      {children}
    </UnifiedSettingsContext.Provider>
  );
};
