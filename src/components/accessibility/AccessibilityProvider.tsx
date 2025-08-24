import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AccessibilityInfo,
  Appearance,
  Platform,
  NativeModules,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilitySettings {
  // Screen reader
  screenReaderEnabled: boolean;
  announceForAccessibility: boolean;
  
  // Visual
  highContrastMode: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extraLarge';
  
  // Motor
  largerTouchTargets: boolean;
  hapticFeedback: boolean;
  voiceNavigation: boolean;
  
  // Cognitive
  simplifiedInterface: boolean;
  extendedTimeouts: boolean;
  reminderFrequency: 'low' | 'medium' | 'high';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  
  // Utility functions
  announceMessage: (message: string) => void;
  getFontSize: (baseSize: number) => number;
  getTouchTargetSize: (baseSize: number) => number;
  shouldReduceMotion: () => boolean;
  getTimeoutDuration: (baseDuration: number) => number;
}

const defaultSettings: AccessibilitySettings = {
  screenReaderEnabled: false,
  announceForAccessibility: true,
  highContrastMode: false,
  reduceMotion: false,
  largeText: false,
  fontSize: 'medium',
  largerTouchTargets: false,
  hapticFeedback: true,
  voiceNavigation: false,
  simplifiedInterface: false,
  extendedTimeouts: false,
  reminderFrequency: 'medium',
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAccessibilitySettings();
    detectSystemAccessibilitySettings();
  }, []);

  const initializeAccessibilitySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('@accessibility_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
      setIsInitialized(true);
    }
  };

  const detectSystemAccessibilitySettings = async () => {
    try {
      // Detect screen reader
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      // Detect reduced motion (iOS only)
      let reduceMotion = false;
      if (Platform.OS === 'ios') {
        reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      }

      // Update settings with system preferences
      setSettings(prev => ({
        ...prev,
        screenReaderEnabled,
        reduceMotion,
      }));

      // Listen for changes
      const screenReaderListener = AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        (enabled: boolean) => {
          setSettings(prev => ({ ...prev, screenReaderEnabled: enabled }));
        }
      );

      if (Platform.OS === 'ios') {
        const reduceMotionListener = AccessibilityInfo.addEventListener(
          'reduceMotionChanged',
          (enabled: boolean) => {
            setSettings(prev => ({ ...prev, reduceMotion: enabled }));
          }
        );

        return () => {
          screenReaderListener.remove();
          reduceMotionListener.remove();
        };
      }

      return () => {
        screenReaderListener.remove();
      };
    } catch (error) {
      console.error('Failed to detect system accessibility settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AccessibilitySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      await AsyncStorage.setItem(
        '@accessibility_settings',
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    }
  };

  const announceMessage = (message: string) => {
    if (settings.announceForAccessibility && settings.screenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const getFontSize = (baseSize: number): number => {
    const multipliers = {
      small: 0.85,
      medium: 1.0,
      large: 1.15,
      extraLarge: 1.3,
    };
    
    let multiplier = multipliers[settings.fontSize];
    
    // Additional scaling for large text setting
    if (settings.largeText) {
      multiplier *= 1.2;
    }
    
    return Math.round(baseSize * multiplier);
  };

  const getTouchTargetSize = (baseSize: number): number => {
    if (settings.largerTouchTargets) {
      return Math.max(baseSize * 1.3, 44); // Minimum 44pt for iOS guidelines
    }
    return Math.max(baseSize, 44);
  };

  const shouldReduceMotion = (): boolean => {
    return settings.reduceMotion;
  };

  const getTimeoutDuration = (baseDuration: number): number => {
    if (settings.extendedTimeouts) {
      return baseDuration * 2;
    }
    return baseDuration;
  };

  if (!isInitialized) {
    return null; // or loading component
  }

  const contextValue: AccessibilityContextType = {
    settings,
    updateSettings,
    announceMessage,
    getFontSize,
    getTouchTargetSize,
    shouldReduceMotion,
    getTimeoutDuration,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Helper hook for accessible components
export const useAccessibleStyles = () => {
  const { settings, getFontSize, getTouchTargetSize } = useAccessibility();
  
  return {
    getFontSize,
    getTouchTargetSize,
    getContainerStyle: (baseStyle: any) => {
      if (settings.highContrastMode) {
        return {
          ...baseStyle,
          borderWidth: baseStyle.borderWidth || 1,
          borderColor: baseStyle.borderColor || '#000000',
        };
      }
      return baseStyle;
    },
    getTextStyle: (baseStyle: any) => ({
      ...baseStyle,
      fontSize: getFontSize(baseStyle.fontSize || 16),
      fontWeight: settings.highContrastMode ? 'bold' : baseStyle.fontWeight,
      color: settings.highContrastMode ? '#000000' : baseStyle.color,
    }),
    getButtonStyle: (baseStyle: any) => ({
      ...baseStyle,
      minHeight: getTouchTargetSize(baseStyle.minHeight || 44),
      minWidth: getTouchTargetSize(baseStyle.minWidth || 44),
    }),
  };
};

// Accessibility testing helpers
export const AccessibilityTestIDs = {
  // Crisis support
  emergencyHelpButton: 'emergency-help-button',
  crisisResourcesList: 'crisis-resources-list',
  crisisResourceItem: 'crisis-resource-item',
  safetyPlanEditor: 'safety-plan-editor',
  
  // Mood tracking
  moodCheckInScreen: 'mood-check-in-screen',
  moodOption: 'mood-option',
  emotionTag: 'emotion-tag',
  moodChart: 'mood-chart',
  quickMoodWidget: 'quick-mood-widget',
  
  // Navigation
  tabBar: 'main-tab-bar',
  backButton: 'back-button',
  closeButton: 'close-button',
  menuButton: 'menu-button',
  
  // Settings
  accessibilitySettings: 'accessibility-settings',
  privacySettings: 'privacy-settings',
  notificationSettings: 'notification-settings',
};
