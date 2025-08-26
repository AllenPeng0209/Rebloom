import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// 静态导入所有翻译文件
import enTranslations from '../locales/en.json';
import jaTranslations from '../locales/ja.json';
import zhCNTranslations from '../locales/zh-CN.json';
import zhTWTranslations from '../locales/zh-TW.json';

export type Language = 'zh-TW' | 'zh-CN' | 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  resetLanguage: () => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'app_language';

// 翻译文件映射
const translationMap = {
  'zh-TW': zhTWTranslations,
  'zh-CN': zhCNTranslations,
  'en': enTranslations,
  'ja': jaTranslations,
};

// 获取翻译文件的函数
const getTranslations = (language: Language) => {
  return translationMap[language] || zhCNTranslations;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh-CN');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 加载语言和翻译
  useEffect(() => {
    loadLanguage();
  }, []);

  // 当语言改变时加载新的翻译
  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && ['zh-TW', 'zh-CN', 'ja', 'en'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      } else {
        // 默认使用简体中文
        setLanguageState('zh-CN');
      }
    } catch (error) {
      console.error('Error loading language:', error);
      setLanguageState('zh-CN'); // 默认简体中文
    }
  };

  const loadTranslations = (lang: Language) => {
    setIsLoading(true);
    try {
      const translationData = getTranslations(lang);
      setTranslations(translationData);
    } catch (error) {
      console.error('Error loading translations:', error);
      // 回退到简体中文
      setTranslations(zhCNTranslations);
    } finally {
      setIsLoading(false);
    }
  };



  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const resetLanguage = async () => {
    try {
      await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
      setLanguageState('zh-CN'); // 默认简体中文
    } catch (error) {
      console.error('Error resetting language:', error);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    if (isLoading || !translations) {
      return key; // 加载中时返回key
    }

    // 获取翻译文本，支持嵌套对象访问
    const keys = key.split('.');
    let translation: any = translations;

    for (const k of keys) {
      translation = translation?.[k];
    }

    // 如果没有找到翻译，返回原始key
    const finalTranslation = typeof translation === 'string' ? translation : key;

    if (params) {
      return Object.entries(params).reduce(
        (text, [param, value]) => text.replace(`{{${param}}}`, value),
        finalTranslation
      );
    }

    return finalTranslation;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    resetLanguage,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};