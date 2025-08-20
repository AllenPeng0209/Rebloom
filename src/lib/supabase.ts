import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ptmfiaysmkapqchpcpck.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bWZpYXlzbWthcHFjaHBjcGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODg0MzMsImV4cCI6MjA3MTE2NDQzM30.v6JPIgMHanyZKNXfEcSCsotkFQcSsHOYimAGxGTexw0'
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Database types
export interface UserProfile {
  id: string
  user_id: string
  email: string
  display_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface ChatConversation {
  id: string
  user_id: string
  title?: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  user_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

export interface DailySummary {
  id: string
  user_id: string
  summary_date: string
  conversation_count: number
  total_messages: number
  dominant_emotions: string[]
  emotion_intensity_avg: number
  mood_trend: 'improving' | 'stable' | 'declining' | 'mixed'
  psychological_insights: string
  therapeutic_observations?: string
  behavioral_patterns?: string
  coping_mechanisms_used: string[]
  personalized_recommendations: string
  suggested_activities: string[]
  mindfulness_exercises: string[]
  risk_indicators: string[]
  crisis_flags: boolean
  urgency_level: 'low' | 'medium' | 'high'
  progress_notes?: string
  goals_mentioned: string[]
  achievements: string[]
  challenges: string[]
  ai_confidence_score: number
  processing_model: string
  generation_timestamp: string
  created_at: string
  updated_at: string
}
