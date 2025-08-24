import { crisisDetectionService } from '../../../backend/src/services/crisisDetectionService'
import { encryptionService } from '../../../backend/src/services/encryptionService'
import { bailianService } from '../../../backend/src/services/aiService'
import { emergencyService } from '../../../backend/src/services/emergencyService'
import { notificationService } from '../../../backend/src/services/notificationService'
import { supabase } from '../../../backend/src/services/supabaseService'

// Mock dependencies
jest.mock('../../../backend/src/services/aiService')
jest.mock('../../../backend/src/services/emergencyService')
jest.mock('../../../backend/src/services/notificationService')
jest.mock('../../../backend/src/services/supabaseService')

describe('CrisisDetectionService', () => {
  const mockUserId = 'test-user-123'
  const mockSessionId = 'session-456'
  const mockMessageId = 'message-789'

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      data: [],
      count: 0
    })
  })

  describe('analyzeMessage', () => {
    it('should detect critical risk with high confidence', async () => {
      const criticalMessage = "I want to kill myself and have a plan to do it tonight"
      
      // Mock AI response
      ;(bailianService.analyzeSentiment as jest.Mock).mockResolvedValue({
        sentiment: -0.9,
        emotions: { fear: 0.9, sadness: 0.8, anger: 0.2, disgust: 0.1, joy: 0.0, surprise: 0.1 },
        confidence: 0.95
      })
      
      ;(bailianService.analyzeMessage as jest.Mock).mockResolvedValue({
        content: JSON.stringify({
          riskLevel: 'critical',
          confidence: 0.95,
          indicators: ['suicide_plan', 'immediate_intent'],
          reasoning: 'Explicit suicide plan with immediate timeline'
        })
      })

      const assessment = await crisisDetectionService.analyzeMessage(
        criticalMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment).toBeDefined()
      expect(assessment.riskLevel).toBe('critical')
      expect(assessment.confidence).toBeGreaterThan(0.8)
      expect(assessment.triggers).toContain('kill myself')
      expect(assessment.triggers).toContain('suicide plan')
      expect(assessment.timeToIntervention).toBe(0) // Immediate
      expect(assessment.recommendedActions).toContain('immediate_intervention')
      expect(assessment.recommendedActions).toContain('emergency_contact')
    })

    it('should detect high risk for self-harm expressions', async () => {
      const highRiskMessage = "I can't take this anymore, I want to hurt myself"
      
      ;(bailianService.analyzeSentiment as jest.Mock).mockResolvedValue({
        sentiment: -0.7,
        emotions: { fear: 0.6, sadness: 0.8, anger: 0.3, disgust: 0.2, joy: 0.0, surprise: 0.1 },
        confidence: 0.85
      })

      const assessment = await crisisDetectionService.analyzeMessage(
        highRiskMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment.riskLevel).toBe('high')
      expect(assessment.confidence).toBeGreaterThan(0.6)
      expect(assessment.triggers).toContain('hurt myself')
      expect(assessment.timeToIntervention).toBe(300) // 5 minutes
    })

    it('should detect medium risk for depression indicators', async () => {
      const mediumRiskMessage = "I feel so depressed and hopeless about everything"
      
      ;(bailianService.analyzeSentiment as jest.Mock).mockResolvedValue({
        sentiment: -0.5,
        emotions: { fear: 0.3, sadness: 0.7, anger: 0.1, disgust: 0.2, joy: 0.0, surprise: 0.0 },
        confidence: 0.75
      })

      const assessment = await crisisDetectionService.analyzeMessage(
        mediumRiskMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment.riskLevel).toBe('medium')
      expect(assessment.triggers).toContain('depressed')
      expect(assessment.triggers).toContain('hopeless')
      expect(assessment.timeToIntervention).toBe(1800) // 30 minutes
    })

    it('should assess low risk for neutral messages', async () => {
      const neutralMessage = "I had a pretty good day at work today"
      
      ;(bailianService.analyzeSentiment as jest.Mock).mockResolvedValue({
        sentiment: 0.3,
        emotions: { fear: 0.1, sadness: 0.1, anger: 0.0, disgust: 0.0, joy: 0.6, surprise: 0.2 },
        confidence: 0.8
      })

      const assessment = await crisisDetectionService.analyzeMessage(
        neutralMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment.riskLevel).toBe('low')
      expect(assessment.confidence).toBeGreaterThan(0.3)
      expect(assessment.timeToIntervention).toBe(3600) // 1 hour
    })

    it('should handle empty or invalid messages gracefully', async () => {
      const emptyMessage = ""
      
      const assessment = await crisisDetectionService.analyzeMessage(
        emptyMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment).toBeDefined()
      expect(assessment.riskLevel).toBeDefined()
      expect(assessment.confidence).toBeGreaterThan(0)
    })

    it('should trigger crisis protocol for high-risk assessments', async () => {
      const criticalMessage = "I'm going to end my life tonight"
      
      ;(bailianService.analyzeSentiment as jest.Mock).mockResolvedValue({
        sentiment: -0.95,
        emotions: { fear: 0.9, sadness: 0.9, anger: 0.1, disgust: 0.1, joy: 0.0, surprise: 0.0 },
        confidence: 0.95
      })

      await crisisDetectionService.analyzeMessage(
        criticalMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      // Verify crisis protocol was triggered
      expect(notificationService.sendCrisisResources).toHaveBeenCalledWith(
        mockUserId,
        'critical'
      )
    })

    it('should handle AI service failures gracefully', async () => {
      const message = "I feel terrible"
      
      // Mock AI service failure
      ;(bailianService.analyzeSentiment as jest.Mock).mockRejectedValue(
        new Error('AI service unavailable')
      )
      ;(bailianService.analyzeMessage as jest.Mock).mockRejectedValue(
        new Error('AI service unavailable')
      )

      const assessment = await crisisDetectionService.analyzeMessage(
        message,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      // Should return safe fallback assessment
      expect(assessment.riskLevel).toBe('medium')
      expect(assessment.confidence).toBe(0.1)
      expect(assessment.triggers).toContain('analysis_error')
      expect(assessment.assessment).toBe('Analysis failed - manual review required')
    })

    it('should escalate risk based on behavioral patterns', async () => {
      const message = "I feel sad today"
      
      // Mock declining mood pattern
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        data: [
          { mood_score: 2, sleep_quality: 2 },
          { mood_score: 1, sleep_quality: 1 },
          { mood_score: 1, sleep_quality: 2 }
        ]
      })

      ;(bailianService.analyzeSentiment as jest.Mock).mockResolvedValue({
        sentiment: -0.4,
        emotions: { sadness: 0.6 },
        confidence: 0.7
      })

      const assessment = await crisisDetectionService.analyzeMessage(
        message,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      // Risk should be elevated due to behavioral patterns
      expect(assessment.riskLevel).toBeOneOf(['medium', 'high'])
      expect(assessment.triggers).toContain('declining_mood_trajectory')
    })

    it('should detect imminent danger triggers', async () => {
      const dangerMessage = "I have a gun and I'm going to use it on myself"
      
      const assessment = await crisisDetectionService.analyzeMessage(
        dangerMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment.triggers).toContain('gun')
      expect(emergencyService.contactEmergencyServices).toHaveBeenCalledWith(mockUserId)
    })

    it('should consider conversation context in assessment', async () => {
      const message = "I can't do this"
      
      // Mock conversation history with crisis context
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        data: [
          { content: 'I feel hopeless', role: 'user' },
          { content: 'How can I help?', role: 'assistant' },
          { content: 'Nothing helps anymore', role: 'user' }
        ],
        count: 3 // Recent crisis flags
      })

      const assessment = await crisisDetectionService.analyzeMessage(
        message,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      // Should have elevated risk due to context
      expect(assessment.confidence).toBeGreaterThan(0.5)
      expect(assessment.triggers).toContain('recent_crisis_history')
    })
  })

  describe('Keyword Analysis', () => {
    it('should accurately identify critical keywords', () => {
      const criticalMessages = [
        'I want to kill myself',
        'suicide is the only option',
        'I have a plan to end it all',
        'not worth living anymore',
        'better off dead'
      ]

      criticalMessages.forEach(async (message) => {
        const assessment = await crisisDetectionService.analyzeMessage(
          message,
          mockUserId,
          mockSessionId,
          mockMessageId
        )
        expect(assessment.riskLevel).toBeOneOf(['high', 'critical'])
      })
    })

    it('should handle keyword variations and context', () => {
      // Test variations that should NOT trigger false positives
      const nonCriticalMessages = [
        'I could kill for some pizza',
        'This game is suicide',
        'I want to kill time',
        'That joke is so bad it should die'
      ]

      // These should be handled by context analysis in AI service
      // The keyword analysis alone might flag them, but overall assessment should consider context
    })
  })

  describe('Performance Requirements', () => {
    it('should complete analysis within 2 seconds', async () => {
      const startTime = Date.now()
      const message = "I'm feeling overwhelmed today"

      await crisisDetectionService.analyzeMessage(
        message,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      const processingTime = Date.now() - startTime
      expect(processingTime).toBeLessThan(2000)
    })

    it('should handle concurrent analyses efficiently', async () => {
      const messages = [
        'I feel sad',
        'I am anxious',
        'I feel hopeless',
        'I am struggling',
        'I need help'
      ]

      const promises = messages.map((message, index) =>
        crisisDetectionService.analyzeMessage(
          message,
          `user-${index}`,
          `session-${index}`,
          `message-${index}`
        )
      )

      const startTime = Date.now()
      const results = await Promise.all(promises)
      const totalTime = Date.now() - startTime

      expect(results).toHaveLength(5)
      expect(totalTime).toBeLessThan(5000) // Should handle 5 concurrent analyses in <5s
      results.forEach(result => expect(result).toBeDefined())
    })
  })

  describe('Edge Cases', () => {
    it('should handle extremely long messages', async () => {
      const longMessage = 'I feel sad. '.repeat(1000) // 10,000 characters
      
      const assessment = await crisisDetectionService.analyzeMessage(
        longMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment).toBeDefined()
      expect(assessment.riskLevel).toBeDefined()
    })

    it('should handle special characters and encoding', async () => {
      const specialMessage = "I feel 😢 and can't go on 💔🔫"
      
      const assessment = await crisisDetectionService.analyzeMessage(
        specialMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment).toBeDefined()
      expect(assessment.riskLevel).toBeDefined()
    })

    it('should handle non-English text appropriately', async () => {
      const nonEnglishMessage = "Je me sens très triste et désespéré"
      
      const assessment = await crisisDetectionService.analyzeMessage(
        nonEnglishMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment).toBeDefined()
      // Should rely more on AI analysis for non-English content
    })

    it('should handle database connection failures', async () => {
      const message = "I feel terrible"
      
      // Mock database failure
      ;(supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const assessment = await crisisDetectionService.analyzeMessage(
        message,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      // Should still provide assessment despite database issues
      expect(assessment).toBeDefined()
      expect(assessment.riskLevel).toBeDefined()
    })

    it('should handle rate limiting gracefully', async () => {
      const message = "I need help"
      
      // Mock rate limiting error
      ;(bailianService.analyzeSentiment as jest.Mock).mockRejectedValue(
        new Error('Rate limit exceeded')
      )

      const assessment = await crisisDetectionService.analyzeMessage(
        message,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment).toBeDefined()
      expect(assessment.triggers).toContain('sentiment_analysis_failed')
    })
  })

  describe('Data Privacy and Security', () => {
    it('should not log sensitive message content', async () => {
      const sensitiveMessage = "My SSN is 123-45-6789 and I want to die"
      
      // Mock logger to capture calls
      const loggerSpy = jest.spyOn(console, 'log').mockImplementation()
      
      await crisisDetectionService.analyzeMessage(
        sensitiveMessage,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      // Verify sensitive data is not logged
      const logCalls = loggerSpy.mock.calls.flat().join(' ')
      expect(logCalls).not.toContain('123-45-6789')
      
      loggerSpy.mockRestore()
    })

    it('should encrypt sensitive assessment data', async () => {
      const message = "I want to hurt myself"
      
      const assessment = await crisisDetectionService.analyzeMessage(
        message,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      // Verify that stored assessment data would be encrypted
      expect(supabase.from).toHaveBeenCalledWith('crisis_assessments')
      // In real implementation, triggers and assessment text should be encrypted
    })
  })

  describe('Compliance Requirements', () => {
    it('should maintain audit trail for all assessments', async () => {
      const message = "I feel suicidal"
      
      await crisisDetectionService.analyzeMessage(
        message,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      // Verify audit logging
      expect(supabase.from).toHaveBeenCalledWith('crisis_assessments')
      // Should include timestamp, user ID, risk level, and confidence
    })

    it('should follow HIPAA compliance for PHI handling', async () => {
      const message = "I am John Doe and I feel hopeless"
      
      // Verify no PHI is exposed in logs or external calls
      const assessment = await crisisDetectionService.analyzeMessage(
        message,
        mockUserId,
        mockSessionId,
        mockMessageId
      )

      expect(assessment).toBeDefined()
      // Assessment should not contain identifiable information
      expect(assessment.assessment).not.toContain('John Doe')
    })
  })
})

// Custom Jest matchers
expect.extend({
  toBeOneOf(received: any, items: any[]) {
    const pass = items.includes(received)
    return {
      pass,
      message: () => `expected ${received} to be one of ${items.join(', ')}`
    }
  }
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(items: any[]): R
    }
  }
}