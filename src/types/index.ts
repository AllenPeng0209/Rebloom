export type EmotionalState =
  | 'calm'
  | 'anxious'
  | 'sad'
  | 'happy'
  | 'angry'
  | 'excited'
  | 'neutral'
  | 'overwhelmed'

export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  error: string
  warning: string
  success: string
  therapeutic: {
    calm: string
    supportive: string
    gentle: string
    warm: string
  }
  mood: {
    veryLow: string
    low: string
    neutral: string
    good: string
    veryGood: string
  }
}

export interface AppTheme {
  colors: ThemeColors
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
  }
  typography: {
    fontFamily: string
    sizes: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
      xxl: number
    }
    weights: {
      light: string
      normal: string
      medium: string
      semibold: string
      bold: string
    }
  }
  borderRadius: {
    sm: number
    md: number
    lg: number
    xl: number
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
}

export type SenderType = 'user' | 'ai'
export type RiskLevel = 'low' | 'medium' | 'high' | 'moderate' | 'critical'
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'voice'

export interface Message {
  id: string
  sessionId: string
  userId: string
  senderType: SenderType
  content: string
  messageType: MessageType
  sentimentScore: number
  emotionalTags: string[]
  riskLevel: RiskLevel
  createdAt: Date | string
  aiConfidenceScore?: number
  therapeuticApproach?: string
}

export interface TherapeuticComponentProps {
  emotionalState?: EmotionalState
  therapeuticMode?: boolean
  sensitivity?: 'low' | 'medium' | 'high'
  style?: any
  testID?: string
}


