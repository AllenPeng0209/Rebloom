import { v4 as uuidv4 } from 'uuid'
import { CrisisAssessment, CrisisEvent, Message, ConversationSession } from '@/types'
import { logger, securityLogger, businessLogger } from '@/utils/logger'
import { supabase } from './supabaseService'
import { bailianService } from './aiService'
import { emergencyService } from './emergencyService'
import { notificationService } from './notificationService'

interface CrisisKeywords {
  critical: string[]
  high: string[]
  medium: string[]
}

interface BehavioralPattern {
  userId: string
  recentMoodScores: number[]
  conversationFrequency: number
  sleepPatterns: number[]
  socialEngagement: number
  riskFactors: string[]
}

interface ConversationContext {
  userId: string
  sessionId: string
  messageHistory: Message[]
  currentMood?: number
  recentCrisisFlags: number
  lastCrisisAssessment?: Date
}

class CrisisDetectionService {
  private crisisKeywords: CrisisKeywords = {
    critical: [
      'suicide', 'kill myself', 'end it all', 'not worth living', 'want to die',
      'suicide plan', 'overdose', 'hanging', 'jumping', 'gun', 'razor',
      'goodbye forever', 'final message', 'no hope left', 'better off dead',
      'worthless', 'burden', 'cant go on', 'ending the pain'
    ],
    high: [
      'self harm', 'cut myself', 'hurt myself', 'punish myself',
      'hopeless', 'trapped', 'desperate', 'overwhelming pain',
      'no way out', 'cant cope', 'breaking point', 'give up',
      'isolated', 'alone forever', 'nobody cares', 'failed at everything'
    ],
    medium: [
      'depressed', 'anxious', 'stressed', 'overwhelmed', 'exhausted',
      'tired of life', 'struggling', 'difficult time', 'dark thoughts',
      'negative thoughts', 'worry', 'fear', 'sadness', 'grief'
    ]
  }

  private readonly confidenceThresholds = {
    critical: 0.85,
    high: 0.75,
    medium: 0.65,
    low: 0.5
  }

  /**
   * Main crisis detection entry point for analyzing messages
   */
  async analyzeMessage(
    message: string,
    userId: string,
    sessionId: string,
    messageId: string
  ): Promise<CrisisAssessment> {
    try {
      const startTime = Date.now()
      
      // Get conversation context
      const context = await this.getConversationContext(userId, sessionId)
      
      // Perform multi-layer analysis
      const [
        keywordRisk,
        sentimentRisk,
        patternRisk,
        aiRisk
      ] = await Promise.all([
        this.analyzeKeywords(message),
        this.analyzeSentiment(message, context),
        this.analyzeBehavioralPatterns(userId),
        this.analyzeWithAI(message, context)
      ])

      // Fuse risk assessments
      const overallRisk = await this.fuseRiskAssessments([
        keywordRisk,
        sentimentRisk,
        patternRisk,
        aiRisk
      ])

      // Create crisis assessment
      const assessment: CrisisAssessment = {
        id: uuidv4(),
        userId,
        messageId,
        riskLevel: overallRisk.level,
        confidence: overallRisk.confidence,
        triggers: overallRisk.triggers,
        recommendedActions: overallRisk.actions,
        timeToIntervention: this.calculateInterventionUrgency(overallRisk.level),
        assessment: overallRisk.reasoning,
        timestamp: new Date()
      }

      // Log the assessment
      securityLogger.logCrisisEvent(
        userId,
        assessment.riskLevel,
        assessment.triggers,
        assessment.confidence
      )

      // Store assessment in database
      await this.storeCrisisAssessment(assessment)

      // Trigger interventions if needed
      if (assessment.riskLevel === 'high' || assessment.riskLevel === 'critical') {
        await this.triggerCrisisProtocol(assessment)
      }

      const processingTime = Date.now() - startTime
      logger.info('Crisis analysis completed', {
        userId,
        messageId,
        riskLevel: assessment.riskLevel,
        confidence: assessment.confidence,
        processingTime
      })

      return assessment

    } catch (error) {
      logger.error('Crisis detection analysis failed', {
        userId,
        messageId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Return safe fallback assessment
      return {
        id: uuidv4(),
        userId,
        messageId,
        riskLevel: 'medium', // Conservative fallback
        confidence: 0.1,
        triggers: ['analysis_error'],
        recommendedActions: ['manual_review', 'provide_resources'],
        assessment: 'Analysis failed - manual review required',
        timestamp: new Date()
      }
    }
  }

  /**
   * Analyze keywords in the message for crisis indicators
   */
  private async analyzeKeywords(message: string): Promise<RiskAssessment> {
    const normalizedMessage = message.toLowerCase().trim()
    let maxRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let confidence = 0
    const triggers: string[] = []

    // Check critical keywords
    const criticalMatches = this.crisisKeywords.critical.filter(keyword => 
      normalizedMessage.includes(keyword.toLowerCase())
    )
    if (criticalMatches.length > 0) {
      maxRiskLevel = 'critical'
      confidence = Math.min(0.95, 0.7 + (criticalMatches.length * 0.05))
      triggers.push(...criticalMatches)
    }

    // Check high-risk keywords
    const highMatches = this.crisisKeywords.high.filter(keyword =>
      normalizedMessage.includes(keyword.toLowerCase())
    )
    if (highMatches.length > 0 && maxRiskLevel !== 'critical') {
      maxRiskLevel = 'high'
      confidence = Math.min(0.85, 0.6 + (highMatches.length * 0.05))
      triggers.push(...highMatches)
    }

    // Check medium-risk keywords
    const mediumMatches = this.crisisKeywords.medium.filter(keyword =>
      normalizedMessage.includes(keyword.toLowerCase())
    )
    if (mediumMatches.length > 0 && maxRiskLevel === 'low') {
      maxRiskLevel = 'medium'
      confidence = Math.min(0.75, 0.4 + (mediumMatches.length * 0.05))
      triggers.push(...mediumMatches)
    }

    return {
      level: maxRiskLevel,
      confidence,
      triggers,
      source: 'keyword_analysis',
      reasoning: `Found ${triggers.length} crisis indicators: ${triggers.slice(0, 3).join(', ')}`
    }
  }

  /**
   * Analyze sentiment and emotional state
   */
  private async analyzeSentiment(
    message: string, 
    context: ConversationContext
  ): Promise<RiskAssessment> {
    try {
      const sentimentAnalysis = await bailianService.analyzeSentiment(message)
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
      let confidence = 0.6
      const triggers: string[] = []

      // Analyze sentiment score (-1 to 1, where -1 is very negative)
      if (sentimentAnalysis.sentiment < -0.8) {
        riskLevel = 'high'
        confidence = 0.8
        triggers.push('severe_negative_sentiment')
      } else if (sentimentAnalysis.sentiment < -0.6) {
        riskLevel = 'medium'
        confidence = 0.7
        triggers.push('moderate_negative_sentiment')
      }

      // Analyze emotional indicators
      if (sentimentAnalysis.emotions) {
        const { fear, sadness, anger, disgust } = sentimentAnalysis.emotions
        
        if (fear > 0.8 || sadness > 0.8) {
          riskLevel = Math.max(riskLevel, 'high') as any
          triggers.push('extreme_negative_emotions')
        }
        
        if (anger > 0.7 && disgust > 0.7) {
          riskLevel = Math.max(riskLevel, 'medium') as any
          triggers.push('combined_negative_emotions')
        }
      }

      // Consider conversation context
      if (context.recentCrisisFlags > 2) {
        confidence += 0.1
        triggers.push('recent_crisis_history')
      }

      return {
        level: riskLevel,
        confidence: Math.min(confidence, 0.95),
        triggers,
        source: 'sentiment_analysis',
        reasoning: `Sentiment score: ${sentimentAnalysis.sentiment.toFixed(2)}, emotions indicate ${riskLevel} risk`
      }

    } catch (error) {
      logger.error('Sentiment analysis failed', { error })
      return {
        level: 'low',
        confidence: 0.1,
        triggers: ['sentiment_analysis_failed'],
        source: 'sentiment_analysis',
        reasoning: 'Could not analyze sentiment'
      }
    }
  }

  /**
   * Analyze behavioral patterns for risk assessment
   */
  private async analyzeBehavioralPatterns(userId: string): Promise<RiskAssessment> {
    try {
      const patterns = await this.getBehavioralPatterns(userId)
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
      let confidence = 0.6
      const triggers: string[] = []

      // Analyze mood trajectory
      if (patterns.recentMoodScores.length > 0) {
        const avgMood = patterns.recentMoodScores.reduce((a, b) => a + b, 0) / patterns.recentMoodScores.length
        const moodTrend = this.calculateTrend(patterns.recentMoodScores)
        
        if (avgMood < 3 && moodTrend < -0.5) {
          riskLevel = 'high'
          confidence = 0.85
          triggers.push('declining_mood_trajectory')
        } else if (avgMood < 4) {
          riskLevel = 'medium'
          confidence = 0.7
          triggers.push('low_mood_pattern')
        }
      }

      // Analyze conversation frequency
      if (patterns.conversationFrequency > 10) {
        // Increased seeking of support could indicate crisis
        confidence += 0.1
        triggers.push('increased_help_seeking')
      } else if (patterns.conversationFrequency === 0) {
        // Complete withdrawal could be concerning
        riskLevel = Math.max(riskLevel, 'medium') as any
        triggers.push('social_withdrawal')
      }

      // Analyze sleep patterns
      if (patterns.sleepPatterns.length > 0) {
        const avgSleep = patterns.sleepPatterns.reduce((a, b) => a + b, 0) / patterns.sleepPatterns.length
        if (avgSleep < 3) {
          riskLevel = Math.max(riskLevel, 'medium') as any
          triggers.push('severe_sleep_disruption')
        }
      }

      // Consider identified risk factors
      const highRiskFactors = ['previous_attempts', 'substance_abuse', 'social_isolation', 'recent_loss']
      const presentHighRiskFactors = patterns.riskFactors.filter(factor => 
        highRiskFactors.includes(factor)
      )
      
      if (presentHighRiskFactors.length > 0) {
        confidence += 0.1 * presentHighRiskFactors.length
        triggers.push(...presentHighRiskFactors)
      }

      return {
        level: riskLevel,
        confidence: Math.min(confidence, 0.9),
        triggers,
        source: 'behavioral_analysis',
        reasoning: `Pattern analysis indicates ${riskLevel} risk based on mood, activity, and risk factors`
      }

    } catch (error) {
      logger.error('Behavioral pattern analysis failed', { error })
      return {
        level: 'low',
        confidence: 0.1,
        triggers: ['pattern_analysis_failed'],
        source: 'behavioral_analysis',
        reasoning: 'Could not analyze behavioral patterns'
      }
    }
  }

  /**
   * Use AI for advanced crisis detection
   */
  private async analyzeWithAI(
    message: string,
    context: ConversationContext
  ): Promise<RiskAssessment> {
    try {
      const prompt = `
        Analyze the following message for signs of mental health crisis or suicide risk.
        Consider the conversation context and provide a detailed assessment.
        
        Message: "${message}"
        
        Context:
        - Recent crisis flags: ${context.recentCrisisFlags}
        - Current mood level: ${context.currentMood || 'unknown'}
        - Recent message count: ${context.messageHistory.length}
        
        Provide assessment in JSON format:
        {
          "riskLevel": "low|medium|high|critical",
          "confidence": 0.0-1.0,
          "indicators": ["list", "of", "risk", "indicators"],
          "reasoning": "detailed reasoning"
        }
      `

      const aiResponse = await bailianService.analyzeMessage(prompt)
      const analysis = JSON.parse(aiResponse.content)

      return {
        level: analysis.riskLevel,
        confidence: Math.min(analysis.confidence || 0.5, 0.95),
        triggers: analysis.indicators || [],
        source: 'ai_analysis',
        reasoning: analysis.reasoning || 'AI analysis completed'
      }

    } catch (error) {
      logger.error('AI crisis analysis failed', { error })
      return {
        level: 'low',
        confidence: 0.1,
        triggers: ['ai_analysis_failed'],
        source: 'ai_analysis',
        reasoning: 'AI analysis unavailable'
      }
    }
  }

  /**
   * Fuse multiple risk assessments into overall risk
   */
  private async fuseRiskAssessments(assessments: RiskAssessment[]): Promise<OverallRiskAssessment> {
    const riskLevelValues = { low: 1, medium: 2, high: 3, critical: 4 }
    
    // Weight different analysis sources
    const weights = {
      keyword_analysis: 0.4,
      ai_analysis: 0.3,
      sentiment_analysis: 0.2,
      behavioral_analysis: 0.1
    }

    let weightedRiskSum = 0
    let totalWeight = 0
    let confidenceSum = 0
    let allTriggers: string[] = []
    let reasoning: string[] = []

    for (const assessment of assessments) {
      const weight = weights[assessment.source as keyof typeof weights] || 0.1
      const riskValue = riskLevelValues[assessment.level]
      
      weightedRiskSum += riskValue * weight * assessment.confidence
      totalWeight += weight
      confidenceSum += assessment.confidence
      allTriggers.push(...assessment.triggers)
      reasoning.push(`${assessment.source}: ${assessment.reasoning}`)
    }

    const averageRisk = weightedRiskSum / totalWeight
    const averageConfidence = confidenceSum / assessments.length

    // Determine overall risk level
    let overallLevel: 'low' | 'medium' | 'high' | 'critical'
    if (averageRisk >= 3.5) {
      overallLevel = 'critical'
    } else if (averageRisk >= 2.5) {
      overallLevel = 'high'
    } else if (averageRisk >= 1.5) {
      overallLevel = 'medium'
    } else {
      overallLevel = 'low'
    }

    // If any assessment is critical with high confidence, escalate
    const criticalAssessment = assessments.find(a => 
      a.level === 'critical' && a.confidence > this.confidenceThresholds.critical
    )
    if (criticalAssessment) {
      overallLevel = 'critical'
    }

    return {
      level: overallLevel,
      confidence: Math.min(averageConfidence, 0.95),
      triggers: [...new Set(allTriggers)], // Remove duplicates
      actions: this.generateRecommendedActions(overallLevel, allTriggers),
      urgency: this.calculateInterventionUrgency(overallLevel),
      reasoning: reasoning.join('; ')
    }
  }

  /**
   * Trigger crisis intervention protocols
   */
  private async triggerCrisisProtocol(assessment: CrisisAssessment): Promise<void> {
    try {
      businessLogger.logIntervention(
        assessment.userId,
        'crisis_protocol',
        assessment.riskLevel,
        true
      )

      // Create crisis event record
      const crisisEvent = await this.createCrisisEvent(assessment)

      // Immediate user support
      await this.provideCrisisResources(assessment.userId, assessment.riskLevel)

      // Professional notification for high/critical risk
      if (assessment.riskLevel === 'critical' || assessment.confidence > 0.9) {
        await this.notifyProfessionals(assessment)
      }

      // Emergency services for imminent danger
      if (this.hasImminentDangerTriggers(assessment.triggers)) {
        await emergencyService.contactEmergencyServices(assessment.userId)
      }

      // Schedule follow-up
      await this.scheduleFollowUp(assessment)

    } catch (error) {
      logger.error('Crisis protocol execution failed', {
        assessmentId: assessment.id,
        userId: assessment.userId,
        error
      })
    }
  }

  /**
   * Helper methods
   */
  private async getConversationContext(userId: string, sessionId: string): Promise<ConversationContext> {
    // Get recent messages and session data
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: session } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    // Count recent crisis flags
    const { count: recentCrisisFlags } = await supabase
      .from('crisis_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    return {
      userId,
      sessionId,
      messageHistory: messages || [],
      currentMood: session?.mood_before,
      recentCrisisFlags: recentCrisisFlags || 0,
      lastCrisisAssessment: undefined // TODO: Implement
    }
  }

  private async getBehavioralPatterns(userId: string): Promise<BehavioralPattern> {
    // Get recent mood scores
    const { data: moodEntries } = await supabase
      .from('mood_entries')
      .select('mood_score, sleep_quality')
      .eq('user_id', userId)
      .gte('recorded_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false })

    // Get conversation frequency
    const { count: conversationCount } = await supabase
      .from('conversation_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    return {
      userId,
      recentMoodScores: moodEntries?.map(entry => entry.mood_score) || [],
      conversationFrequency: conversationCount || 0,
      sleepPatterns: moodEntries?.map(entry => entry.sleep_quality).filter(Boolean) || [],
      socialEngagement: 0, // TODO: Implement
      riskFactors: [] // TODO: Implement from user profile
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    
    let sum = 0
    for (let i = 1; i < values.length; i++) {
      sum += values[i] - values[i - 1]
    }
    return sum / (values.length - 1)
  }

  private calculateInterventionUrgency(riskLevel: string): number {
    const urgencyMap = {
      critical: 0, // Immediate
      high: 300, // 5 minutes
      medium: 1800, // 30 minutes
      low: 3600 // 1 hour
    }
    return urgencyMap[riskLevel as keyof typeof urgencyMap] || 3600
  }

  private generateRecommendedActions(riskLevel: string, triggers: string[]): string[] {
    const baseActions = {
      critical: ['immediate_intervention', 'emergency_contact', 'crisis_hotline', 'safety_plan'],
      high: ['professional_alert', 'crisis_resources', 'safety_check', 'follow_up_24h'],
      medium: ['provide_resources', 'mood_tracking', 'self_care_suggestions', 'follow_up_48h'],
      low: ['wellness_tips', 'routine_check_in']
    }

    let actions = baseActions[riskLevel as keyof typeof baseActions] || baseActions.low

    // Add specific actions based on triggers
    if (triggers.some(t => t.includes('isolation'))) {
      actions.push('social_connection_support')
    }
    if (triggers.some(t => t.includes('sleep'))) {
      actions.push('sleep_hygiene_guidance')
    }

    return actions
  }

  private async storeCrisisAssessment(assessment: CrisisAssessment): Promise<void> {
    await supabase
      .from('crisis_assessments')
      .insert({
        id: assessment.id,
        user_id: assessment.userId,
        message_id: assessment.messageId,
        risk_level: assessment.riskLevel,
        confidence: assessment.confidence,
        triggers: assessment.triggers,
        recommended_actions: assessment.recommendedActions,
        time_to_intervention: assessment.timeToIntervention,
        assessment: assessment.assessment,
        created_at: assessment.timestamp
      })
  }

  private async createCrisisEvent(assessment: CrisisAssessment): Promise<CrisisEvent> {
    const crisisEvent: CrisisEvent = {
      id: uuidv4(),
      userId: assessment.userId,
      messageId: assessment.messageId,
      sessionId: undefined, // TODO: Get from assessment
      riskLevel: assessment.riskLevel,
      triggerKeywords: assessment.triggers,
      confidenceScore: assessment.confidence,
      interventionTriggered: true,
      resourcesProvided: [],
      professionalNotified: false,
      emergencyServicesContacted: false,
      followUpRequired: true,
      detectedBy: 'ai_system',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await supabase
      .from('crisis_events')
      .insert({
        id: crisisEvent.id,
        user_id: crisisEvent.userId,
        message_id: crisisEvent.messageId,
        session_id: crisisEvent.sessionId,
        risk_level: crisisEvent.riskLevel,
        trigger_keywords: crisisEvent.triggerKeywords,
        confidence_score: crisisEvent.confidenceScore,
        intervention_triggered: crisisEvent.interventionTriggered,
        resources_provided: crisisEvent.resourcesProvided,
        professional_notified: crisisEvent.professionalNotified,
        emergency_services_contacted: crisisEvent.emergencyServicesContacted,
        follow_up_required: crisisEvent.followUpRequired,
        detected_by: crisisEvent.detectedBy,
        created_at: crisisEvent.createdAt,
        updated_at: crisisEvent.updatedAt
      })

    return crisisEvent
  }

  private async provideCrisisResources(userId: string, riskLevel: string): Promise<void> {
    // Implementation for providing immediate crisis resources
    await notificationService.sendCrisisResources(userId, riskLevel)
  }

  private async notifyProfessionals(assessment: CrisisAssessment): Promise<void> {
    // Implementation for professional notification
    await notificationService.alertProfessionals(assessment)
  }

  private async scheduleFollowUp(assessment: CrisisAssessment): Promise<void> {
    // Implementation for scheduling follow-up
    const followUpTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    // TODO: Schedule follow-up job
  }

  private hasImminentDangerTriggers(triggers: string[]): boolean {
    const imminentDangerKeywords = [
      'suicide plan', 'kill myself', 'end it all', 'overdose',
      'hanging', 'jumping', 'gun', 'razor'
    ]
    return triggers.some(trigger => imminentDangerKeywords.includes(trigger))
  }
}

// Types for internal use
interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  triggers: string[]
  source: string
  reasoning: string
}

interface OverallRiskAssessment extends RiskAssessment {
  actions: string[]
  urgency: number
}

export const crisisDetectionService = new CrisisDetectionService()
export default crisisDetectionService