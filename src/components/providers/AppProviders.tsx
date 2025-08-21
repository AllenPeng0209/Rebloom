import React, { ReactNode } from 'react';
import { AISettingsProvider } from '../../contexts/AISettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { MemoryProvider } from '../../contexts/MemoryContext';
import { TherapeuticSettingsProvider } from '../../contexts/TherapeuticSettingsContext';
import { UnifiedSettingsProvider } from '../../contexts/UnifiedSettingsContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const { user } = useAuth();
  
  // 如果用户未登录，提供基础的设置提供者（不包含记忆功能）
  if (!user) {
    return (
      <AISettingsProvider>
        <TherapeuticSettingsProvider>
          <UnifiedSettingsProvider>
            {children}
          </UnifiedSettingsProvider>
        </TherapeuticSettingsProvider>
      </AISettingsProvider>
    );
  }

  // 用户已登录，提供完整的功能包括记忆
  return (
    <AISettingsProvider>
      <TherapeuticSettingsProvider>
        <MemoryProvider userId={user.id}>
          <UnifiedSettingsProvider>
            {children}
          </UnifiedSettingsProvider>
        </MemoryProvider>
      </TherapeuticSettingsProvider>
    </AISettingsProvider>
  );
};
