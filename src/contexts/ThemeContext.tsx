import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { AppTheme, ThemeColors, EmotionalState } from '@/types'

interface ThemeContextType {
  theme: AppTheme
  isDark: boolean
  toggleTheme: () => void
  adaptToEmotionalState: (state: EmotionalState) => void
  currentEmotionalState?: EmotionalState
}

const lightColors: ThemeColors = {
  primary: '#2E86AB',
  secondary: '#4CAF50',
  background: '#FFFFFF',
  surface: '#F7F8FA',
  text: '#2C2C2E',
  textSecondary: '#6D6D80',
  error: '#E57373',
  warning: '#FFB74D',
  success: '#4CAF50',
  therapeutic: {
    calm: '#B3E5FC',
    supportive: '#C8E6C9',
    gentle: '#F0F7FF',
    warm: '#FFCDD2'
  },
  mood: {
    veryLow: '#E57373',
    low: '#FFB74D',
    neutral: '#FFF176',
    good: '#81C784',
    veryGood: '#4CAF50'
  }
}

const darkColors: ThemeColors = {
  primary: '#4A9FC7',
  secondary: '#66BB6A',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  error: '#EF5350',
  warning: '#FFA726',
  success: '#66BB6A',
  therapeutic: {
    calm: '#1976D2',
    supportive: '#388E3C',
    gentle: '#263238',
    warm: '#D32F2F'
  },
  mood: {
    veryLow: '#EF5350',
    low: '#FFA726',
    neutral: '#FFEE58',
    good: '#66BB6A',
    veryGood: '#4CAF50'
  }
}

const createTheme = (colors: ThemeColors): AppTheme => ({
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)'
  }
})

const emotionalStateAdaptations: Record<EmotionalState, Partial<ThemeColors>> = {
  calm: {
    primary: '#2196F3',
    therapeutic: {
      calm: '#E3F2FD',
      supportive: '#BBDEFB',
      gentle: '#F3E5F5',
      warm: '#E8F5E8'
    }
  },
  anxious: {
    primary: '#4CAF50',
    therapeutic: {
      calm: '#E8F5E8',
      supportive: '#C8E6C9',
      gentle: '#F1F8E9',
      warm: '#E0F2F1'
    }
  },
  sad: {
    primary: '#7986CB',
    therapeutic: {
      calm: '#E8EAF6',
      supportive: '#C5CAE9',
      gentle: '#F3E5F5',
      warm: '#FCE4EC'
    }
  },
  happy: {
    primary: '#FFA726',
    therapeutic: {
      calm: '#FFF3E0',
      supportive: '#FFE0B2',
      gentle: '#FFFDE7',
      warm: '#FFF8E1'
    }
  },
  angry: {
    primary: '#EF5350',
    therapeutic: {
      calm: '#FFEBEE',
      supportive: '#FFCDD2',
      gentle: '#FFF8E1',
      warm: '#F3E5F5'
    }
  },
  excited: {
    primary: '#AB47BC',
    therapeutic: {
      calm: '#F3E5F5',
      supportive: '#E1BEE7',
      gentle: '#FFF3E0',
      warm: '#E8F5E8'
    }
  },
  neutral: {
    primary: '#607D8B',
    therapeutic: {
      calm: '#ECEFF1',
      supportive: '#CFD8DC',
      gentle: '#F5F5F5',
      warm: '#FAFAFA'
    }
  },
  overwhelmed: {
    primary: '#8BC34A',
    therapeutic: {
      calm: '#F1F8E9',
      supportive: '#DCEDC8',
      gentle: '#E8F5E8',
      warm: '#E0F2F1'
    }
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark')
  const [currentEmotionalState, setCurrentEmotionalState] = useState<EmotionalState>()
  
  useEffect(() => {
    setIsDark(systemColorScheme === 'dark')
  }, [systemColorScheme])

  const getAdaptedColors = (): ThemeColors => {
    const baseColors = isDark ? darkColors : lightColors
    
    if (currentEmotionalState && emotionalStateAdaptations[currentEmotionalState]) {
      return {
        ...baseColors,
        ...emotionalStateAdaptations[currentEmotionalState]
      }
    }
    
    return baseColors
  }

  const theme = createTheme(getAdaptedColors())

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const adaptToEmotionalState = (state: EmotionalState) => {
    setCurrentEmotionalState(state)
  }

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    adaptToEmotionalState,
    currentEmotionalState
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const useThemedStyles = () => {
  const { theme } = useTheme()
  
  const createStyles = <T extends Record<string, any>>(
    stylesFn: (theme: AppTheme) => T
  ): T => {
    return stylesFn(theme)
  }
  
  return { theme, createStyles }
}