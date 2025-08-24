import { Request } from 'express'

// User types
export interface User {
  id: string
  email: string
  createdAt: Date
  updatedAt: Date
  lastActive?: Date
  subscriptionTier: 'free' | 'basic' | 'premium' | 'professional'
  onboardingCompleted: boolean
  privacySettings: Record<string, any>
  encryptionKeySalt: string
  mfaEnabled: boolean
}

// Authentication types
export interface AuthenticatedRequest extends Request {
  user?: User
  sessionId?: string
}

export interface LoginCredentials {
  email: string
  password: string
  deviceFingerprint?: string
  ipAddress?: string
  location?: Location
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  refreshToken?: string
  mfaRequired?: boolean
  sessionId?: string
}

// Crisis detection types
export interface CrisisAssessment {
  id: string
  userId: string
  messageId?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  triggers: string[]
  recommendedActions: string[]
  timeToIntervention?: number
  assessment: string
  timestamp: Date
}

export interface CrisisEvent {
  id: string
  userId: string
  messageId?: string
  sessionId?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  triggerKeywords: string[]
  confidenceScore: number
  interventionTriggered: boolean
  interventionType?: 'resource_provision' | 'professional_alert' | 'emergency_contact' | 'crisis_chat'
  resourcesProvided: string[]
  professionalNotified: boolean
  emergencyServicesContacted: boolean
  resolvedAt?: Date
  resolutionNotes?: string
  followUpRequired: boolean
  detectedBy: string
  createdAt: Date
  updatedAt: Date
}

// Message and conversation types
export interface Message {
  id: string
  sessionId: string
  userId: string
  encryptedContent: string
  senderType: 'user' | 'ai' | 'system' | 'professional'
  messageType: 'text' | 'voice' | 'image' | 'system_message'
  contentLength: number
  languageDetected?: string
  sentimentScore?: number
  emotionalTags: string[]
  moodIndicators: Record<string, any>
  anxietyMarkers: Record<string, any>
  depressionMarkers: Record<string, any>
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  crisisKeywords: string[]
  riskConfidence?: number
  aiModelVersion?: string
  aiConfidenceScore?: number
  processingTimeMs?: number
  therapeuticThemes: string[]
  copingMechanismsMentioned: string[]
  progressIndicators: string[]
  encryptionVersion: string
  iv: Buffer
  syncStatus: 'pending' | 'syncing' | 'synced' | 'conflict' | 'error'
  lastSyncedAt: Date
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface ConversationSession {
  id: string
  userId: string
  encryptedTitle?: string
  sessionType: 'general' | 'crisis' | 'goal_setting' | 'mood_check' | 'therapeutic'
  startedAt: Date
  endedAt?: Date
  durationSeconds?: number
  messageCount: number
  moodBefore?: number
  moodAfter?: number
  anxietyLevelBefore?: number
  anxietyLevelAfter?: number
  engagementScore?: number
  therapeuticTechniquesUsed: string[]
  crisisFlagsRaised: number
  encryptionVersion: string
  syncStatus: 'pending' | 'syncing' | 'synced' | 'conflict' | 'error'
  lastSyncedAt: Date
  version: number
  createdAt: Date
  updatedAt: Date
}

// Mood and wellness types
export interface MoodEntry {
  id: string
  userId: string
  sessionId?: string
  moodScore: number
  anxietyLevel?: number
  depressionScore?: number
  stressLevel?: number
  energyLevel?: number
  sleepQuality?: number
  encryptedNotes?: string
  triggers: string[]
  copingStrategiesUsed: string[]
  activitiesCompleted: string[]
  weatherCondition?: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  locationContext: 'home' | 'work' | 'social' | 'transport' | 'healthcare' | 'other'
  socialContext: 'alone' | 'family' | 'friends' | 'colleagues' | 'strangers' | 'professional'
  entryMethod: 'manual' | 'prompted' | 'ai_suggested' | 'scheduled'
  confidenceLevel?: number
  recordedAt: Date
  createdAt: Date
}

// AI Analysis types
export interface MoodAnalysis {
  userId: string
  primaryMood: string
  emotions: Record<string, number>
  anxietyLevel: number
  depressionIndicators: Record<string, number>
  stressLevel: number
  confidence: number
  timestamp: Date
  analysisVersion: string
}

export interface VoiceAnalysis {
  pitch: any
  energy: any
  rhythm: any
  pauses: any
  emotionalMarkers: any
  stressIndicators: any
  confidence: 'high' | 'medium' | 'low'
}

export interface PatternAnalysis {
  userId: string
  patterns: Record<string, any>
  trends: Record<string, any>
  anomalies: string[]
  confidence: number
  timeframe: string
}

// Encryption types
export interface EncryptedData {
  data: number[]
  iv: number[]
  version: string
  timestamp: number
}

export interface KeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

// Healthcare integration types
export interface Provider {
  id: string
  name: string
  specialization: string[]
  location: Location
  acceptedInsurance: string[]
  availableSlots: AvailableSlot[]
  ehrSystem?: string
  preferredDataFormat?: string
}

export interface AvailableSlot {
  id: string
  startTime: Date
  endTime: Date
  appointmentType: string
  modality: 'in_person' | 'telehealth' | 'phone'
}

export interface AppointmentResult {
  success: boolean
  appointmentId?: string
  appointmentDetails?: any
  cost?: number
  confirmationCode?: string
  reason?: string
  alternatives?: any[]
}

// Location types
export interface Location {
  latitude: number
  longitude: number
  city?: string
  state?: string
  country?: string
  timezone?: string
}

// Audit and compliance types
export interface AuditLogEntry {
  id: string
  eventType: 'login' | 'logout' | 'data_access' | 'data_modification' | 'crisis_detection' | 'professional_access'
  eventCategory: 'security' | 'privacy' | 'clinical' | 'system' | 'compliance'
  severity: 'info' | 'warning' | 'error' | 'critical'
  userId?: string
  affectedUserId?: string
  professionalId?: string
  resourceType?: string
  resourceId?: string
  phiAccessed: boolean
  actionPerformed: string
  eventDescription?: string
  eventOutcome: 'success' | 'failure' | 'partial' | 'blocked'
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  apiEndpoint?: string
  requestMethod?: string
  responseCode?: number
  eventTimestamp: Date
  durationMs?: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  anomalyScore?: number
  hipaaRelevant: boolean
  gdprRelevant: boolean
  retentionPeriod: string
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: Date
  requestId: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Service configuration types
export interface ServiceConfig {
  port: number
  env: 'development' | 'staging' | 'production'
  apiVersion: string
  corsOrigins: string[]
  rateLimit: {
    windowMs: number
    maxRequests: number
  }
  security: {
    jwtSecret: string
    jwtExpiresIn: string
    bcryptRounds: number
    encryptionKey: string
  }
  database: {
    url: string
    ssl: boolean
    poolMin: number
    poolMax: number
  }
  redis: {
    url: string
    password?: string
    db: number
  }
  ai: {
    bailianApiKey: string
    bailianEndpoint: string
    bailianWorkspaceId: string
  }
  monitoring: {
    logLevel: string
    sentryDsn?: string
  }
}