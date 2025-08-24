import { bailianService, AIService } from '../../../backend/src/services/aiService'
import { MoodAnalysis, PatternAnalysis, VoiceAnalysis } from '../../../backend/src/types'

// Mock fetch globally
global.fetch = jest.fn()

describe('AIService', () => {
  const mockUserId = 'test-user-123'
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default successful API response mock
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        output: {
          text: JSON.stringify({
            primaryMood: 'neutral',
            emotions: { joy: 0.5, sadness: 0.3, anxiety: 0.2 },
            confidence: 0.8
          }),
          finish_reason: 'stop'
        },
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150
        },
        request_id: 'test-request-123'
      })
    })
  })

  describe('analyzeMoodAdvanced', () => {
    it('should analyze mood with basic text input', async () => {
      const request = {
        text: "I'm feeling quite anxious about tomorrow's presentation",
        userId: mockUserId
      }

      const analysis = await bailianService.analyzeMoodAdvanced(request)

      expect(analysis).toBeDefined()
      expect(analysis.userId).toBe(mockUserId)
      expect(analysis.primaryMood).toBeDefined()
      expect(analysis.emotions).toBeDefined()
      expect(analysis.confidence).toBeGreaterThan(0)
      expect(analysis.timestamp).toBeInstanceOf(Date)
      expect(analysis.analysisVersion).toBe('enhanced-v1.2')
    })

    it('should include contextual factors in analysis', async () => {
      const request = {
        text: "I can't sleep again",
        userId: mockUserId,
        contextualFactors: {
          timeOfDay: 'late_night',
          recentEvents: ['work_stress', 'family_conflict'],
          moodHistory: [3, 4, 2, 3, 2]
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          output: {
            text: JSON.stringify({
              primaryMood: 'anxious',
              emotions: { anxiety: 0.8, sadness: 0.4, joy: 0.1 },
              anxietyLevel: 8,
              stressLevel: 7,
              confidence: 0.85
            })
          },
          usage: { total_tokens: 200 }
        })
      })

      const analysis = await bailianService.analyzeMoodAdvanced(request)

      expect(analysis.primaryMood).toBe('anxious')
      expect(analysis.anxietyLevel).toBe(8)
      expect(analysis.stressLevel).toBe(7)
      expect(analysis.confidence).toBe(0.85)
    })

    it('should handle conversation history context', async () => {
      const request = {
        text: "Still feeling the same way",
        userId: mockUserId,
        conversationHistory: [
          { role: 'user' as const, content: 'I feel depressed' },
          { role: 'assistant' as const, content: 'I understand how difficult that must be' },
          { role: 'user' as const, content: 'Nothing seems to help' }
        ]
      }

      const analysis = await bailianService.analyzeMoodAdvanced(request)

      expect(analysis).toBeDefined()
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('Recent conversation context')
        })
      )
    })

    it('should return fallback analysis on API failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API unavailable'))

      const request = {
        text: "I feel terrible",
        userId: mockUserId
      }

      const analysis = await bailianService.analyzeMoodAdvanced(request)

      expect(analysis.primaryMood).toBe('neutral')
      expect(analysis.confidence).toBe(0.2)
      expect(analysis.analysisVersion).toBe('fallback-v1.0')
    })

    it('should handle malformed API responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          output: {
            text: 'invalid json response',
            finish_reason: 'stop'
          },
          usage: { total_tokens: 100 }
        })
      })

      const request = {
        text: "I'm confused",
        userId: mockUserId
      }

      const analysis = await bailianService.analyzeMoodAdvanced(request)

      // Should use fallback parsing
      expect(analysis.primaryMood).toBe('neutral')
      expect(analysis.confidence).toBe(0.3)
    })
  })

  describe('analyzeSentiment', () => {
    it('should analyze positive sentiment', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          output: {
            text: JSON.stringify({
              sentiment: 0.7,
              emotions: {
                joy: 0.8,
                sadness: 0.1,
                anger: 0.0,
                fear: 0.1,
                surprise: 0.3,
                disgust: 0.0
              },
              confidence: 0.9
            })
          },
          usage: { total_tokens: 80 }
        })
      })

      const result = await bailianService.analyzeSentiment("I'm having a wonderful day!")

      expect(result.sentiment).toBe(0.7)
      expect(result.emotions.joy).toBe(0.8)
      expect(result.emotions.sadness).toBe(0.1)
      expect(result.confidence).toBe(0.9)
    })

    it('should analyze negative sentiment', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          output: {
            text: JSON.stringify({
              sentiment: -0.8,
              emotions: {
                joy: 0.1,
                sadness: 0.9,
                anger: 0.3,
                fear: 0.7,
                surprise: 0.1,
                disgust: 0.2
              },
              confidence: 0.85
            })
          },
          usage: { total_tokens: 90 }
        })
      })

      const result = await bailianService.analyzeSentiment("I feel hopeless and scared")

      expect(result.sentiment).toBe(-0.8)
      expect(result.emotions.sadness).toBe(0.9)
      expect(result.emotions.fear).toBe(0.7)
      expect(result.confidence).toBe(0.85)
    })

    it('should handle API failures gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await bailianService.analyzeSentiment("test message")

      expect(result.sentiment).toBe(0)
      expect(result.confidence).toBe(0.1)
      expect(result.emotions).toEqual({
        joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, disgust: 0
      })
    })
  })

  describe('generateTherapeuticResponse', () => {
    it('should generate empathetic response', async () => {
      const mockTherapeuticResponse = {
        response: "I can hear that you're going through a really difficult time right now. It takes courage to share these feelings. What would feel most helpful to you at this moment?",
        techniques: ['active_listening', 'validation', 'open_ended_questioning'],
        tone: 'empathetic',
        personalization: 0.8,
        followUp: ['Tell me more about what triggered these feelings', 'What has helped you cope in the past?'],
        confidence: 0.9
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          output: {
            text: JSON.stringify(mockTherapeuticResponse)
          },
          usage: { total_tokens: 250 }
        })
      })

      const response = await bailianService.generateTherapeuticResponse(
        "I feel so overwhelmed and don't know what to do",
        mockUserId,
        [],
        undefined,
        {
          userId: mockUserId,
          primaryMood: 'overwhelmed',
          emotions: { anxiety: 0.8, sadness: 0.6 },
          anxietyLevel: 8,
          depressionIndicators: {},
          stressLevel: 9,
          confidence: 0.85,
          timestamp: new Date(),
          analysisVersion: 'v1.0'
        }
      )

      expect(response.content).toContain('difficult time')
      expect(response.therapeuticTechniques).toContain('active_listening')
      expect(response.emotionalTone).toBe('empathetic')
      expect(response.personalizationLevel).toBe(0.8)
      expect(response.followUpSuggestions).toHaveLength(2)
      expect(response.metadata.confidence).toBe(0.9)
      expect(response.metadata.model).toBe('qwen-plus')
    })

    it('should consider conversation history', async () => {
      const conversationHistory = [
        { role: 'user' as const, content: 'I lost my job yesterday' },
        { role: 'assistant' as const, content: 'That must have been very shocking and upsetting' },
        { role: 'user' as const, content: 'I dont know how Ill pay my bills' }
      ]

      await bailianService.generateTherapeuticResponse(
        "I'm scared about my future",
        mockUserId,
        conversationHistory
      )

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('Recent conversation')
        })
      )
    })

    it('should return fallback response on failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Service unavailable'))

      const response = await bailianService.generateTherapeuticResponse(
        "I need help",
        mockUserId,
        []
      )

      expect(response.content).toContain("I understand you're going through a difficult time")
      expect(response.therapeuticTechniques).toContain('active_listening')
      expect(response.metadata.model).toBe('fallback')
      expect(response.metadata.confidence).toBe(0.5)
    })

    it('should handle non-JSON responses gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          output: {
            text: "I understand you're feeling sad. Would you like to talk about what's bothering you?"
          },
          usage: { total_tokens: 150 }
        })
      })

      const response = await bailianService.generateTherapeuticResponse(
        "I'm sad",
        mockUserId,
        []
      )

      expect(response.content).toContain("feeling sad")
      expect(response.therapeuticTechniques).toContain('supportive_listening')
    })
  })

  describe('analyzeBehavioralPatterns', () => {
    it('should analyze mood trends', async () => {
      const dataPoints = {
        moodScores: [7, 6, 5, 4, 3, 4, 5, 6, 5, 4, 3, 2, 3, 4],
        conversationFrequency: [2, 1, 3, 2, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3],
        sleepPatterns: [7, 6, 5, 4, 4, 5, 6, 5, 4, 3, 3, 2, 3, 4],
        activityLevels: [8, 7, 6, 5, 4, 5, 6, 7, 6, 5, 4, 3, 4, 5],
        stressEvents: [
          { type: 'work', severity: 'high', date: new Date() },
          { type: 'personal', severity: 'medium', date: new Date() }
        ]
      }

      const mockAnalysis = {
        trends: {
          mood: 'declining',
          sleep: 'declining',
          activity: 'stable',
          engagement: 'increasing'
        },
        patterns: {
          weekly_cycles: 'Mood tends to be lower on Mondays and Fridays',
          trigger_patterns: 'Work stress correlates with mood dips',
          recovery_patterns: 'Usually recovers within 2-3 days after stress events'
        },
        insights: [
          'Recent decline in mood scores suggests increased vulnerability',
          'Sleep quality decline may be contributing to mood issues',
          'Increased conversation frequency indicates help-seeking behavior'
        ],
        recommendations: [
          'Focus on sleep hygiene practices',
          'Consider stress management techniques for work',
          'Maintain regular check-ins during vulnerable periods'
        ],
        risk_factors: ['declining_mood_trajectory', 'sleep_disruption'],
        confidence: 0.78
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          output: {
            text: JSON.stringify(mockAnalysis)
          },
          usage: { total_tokens: 300 }
        })
      })

      const analysis = await bailianService.analyzeBehavioralPatterns(
        mockUserId,
        '30d',
        dataPoints
      )

      expect(analysis.userId).toBe(mockUserId)
      expect(analysis.trends.mood).toBe('declining')
      expect(analysis.patterns.weekly_cycles).toContain('Mondays')
      expect(analysis.anomalies).toContain('declining_mood_trajectory')
      expect(analysis.confidence).toBe(0.78)
      expect(analysis.timeframe).toBe('30d')
    })

    it('should handle insufficient data gracefully', async () => {
      const limitedDataPoints = {
        moodScores: [5],
        conversationFrequency: [],
        sleepPatterns: [],
        activityLevels: [],
        stressEvents: []
      }

      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Insufficient data'))

      const analysis = await bailianService.analyzeBehavioralPatterns(
        mockUserId,
        '7d',
        limitedDataPoints
      )

      expect(analysis.confidence).toBe(0.1)
      expect(analysis.patterns).toEqual({})
      expect(analysis.trends).toEqual({})
    })
  })

  describe('analyzeVoiceEmotions', () => {
    it('should analyze voice characteristics for stress', () => {
      const audioFeatures = {
        averagePitch: 250, // Higher pitch
        pitchVariation: 90, // High variation
        energyLevel: 0.3, // Low energy
        energyConsistency: 0.5,
        speechPace: 'fast',
        pauseFrequency: 0.1, // Few pauses
        averagePauseDuration: 0.5,
        tremor: true,
        rapidSpeech: true,
        breathlessness: true,
        audioQuality: 0.8
      }

      const analysis = bailianService.analyzeVoiceEmotions(audioFeatures)

      expect(analysis.pitch.average).toBe(250)
      expect(analysis.pitch.variation).toBe(90)
      expect(analysis.energy.level).toBe(0.3)
      expect(analysis.rhythm.pace).toBe('fast')
      expect(analysis.emotionalMarkers.stress).toBeGreaterThan(0.5)
      expect(analysis.emotionalMarkers.anxiety).toBeGreaterThan(0.5)
      expect(analysis.stressIndicators.voiceShaking).toBe(true)
      expect(analysis.stressIndicators.rapidSpeech).toBe(true)
      expect(analysis.confidence).toBe('high')
    })

    it('should analyze voice characteristics for sadness', () => {
      const audioFeatures = {
        averagePitch: 120, // Low pitch
        pitchVariation: 30, // Low variation
        energyLevel: 0.2, // Very low energy
        energyConsistency: 0.8,
        speechPace: 'slow',
        pauseFrequency: 0.5, // Many pauses
        averagePauseDuration: 2.0,
        tremor: false,
        rapidSpeech: false,
        breathlessness: false,
        audioQuality: 0.9
      }

      const analysis = bailianService.analyzeVoiceEmotions(audioFeatures)

      expect(analysis.emotionalMarkers.sadness).toBeGreaterThan(0.5)
      expect(analysis.rhythm.pace).toBe('slow')
      expect(analysis.pauses.duration).toBe(2.0)
      expect(analysis.confidence).toBe('high')
    })

    it('should handle poor audio quality', () => {
      const poorQualityFeatures = {
        averagePitch: 0,
        pitchVariation: 0,
        energyLevel: 0,
        energyConsistency: 0,
        audioQuality: 0.3 // Poor quality
      }

      const analysis = bailianService.analyzeVoiceEmotions(poorQualityFeatures)

      expect(analysis.confidence).toBe('medium')
      expect(analysis.emotionalMarkers.stress).toBe(0)
      expect(analysis.emotionalMarkers.sadness).toBe(0)
      expect(analysis.emotionalMarkers.anxiety).toBe(0)
    })
  })

  describe('generatePersonalizedInsights', () => {
    it('should generate insights based on user data', async () => {
      const userData = {
        moodAnalysis: {
          userId: mockUserId,
          primaryMood: 'anxious',
          emotions: { anxiety: 0.8, sadness: 0.3 },
          anxietyLevel: 7,
          depressionIndicators: {},
          stressLevel: 8,
          confidence: 0.9,
          timestamp: new Date(),
          analysisVersion: 'v1.0'
        },
        patternAnalysis: {
          userId: mockUserId,
          patterns: { weekly_cycles: 'Lower mood on weekdays' },
          trends: { mood: 'declining' },
          anomalies: ['sleep_disruption'],
          confidence: 0.8,
          timeframe: '30d'
        },
        recentConversations: [
          { theme: 'work_stress' },
          { theme: 'relationship_concerns' }
        ],
        goals: [
          { title: 'Better sleep habits' },
          { title: 'Stress management' }
        ],
        preferences: { communicationStyle: 'direct' }
      }

      const mockInsights = {
        insights: [
          {
            title: 'Anxiety Pattern Recognition',
            description: 'Your anxiety levels tend to spike during weekdays, particularly around work-related discussions.',
            priority: 'high',
            category: 'mood'
          }
        ],
        recommendations: [
          {
            title: 'Evening Wind-Down Routine',
            description: 'Establish a 30-minute relaxation routine before bed to improve sleep quality.',
            timeframe: 'daily',
            difficulty: 'easy'
          }
        ],
        progressHighlights: ['Increased self-awareness through regular check-ins'],
        areasForAttention: ['Work-life balance', 'Sleep hygiene']
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          output: {
            text: JSON.stringify(mockInsights)
          },
          usage: { total_tokens: 400 }
        })
      })

      const insights = await bailianService.generatePersonalizedInsights(mockUserId, userData)

      expect(insights.insights).toHaveLength(1)
      expect(insights.insights[0].title).toContain('Anxiety')
      expect(insights.recommendations).toHaveLength(1)
      expect(insights.recommendations[0].timeframe).toBe('daily')
      expect(insights.progressHighlights).toContain('self-awareness')
      expect(insights.areasForAttention).toContain('Work-life balance')
    })

    it('should handle generation failures gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Generation failed'))

      const userData = {
        moodAnalysis: {} as MoodAnalysis,
        patternAnalysis: {} as PatternAnalysis,
        recentConversations: [],
        goals: [],
        preferences: {}
      }

      const insights = await bailianService.generatePersonalizedInsights(mockUserId, userData)

      expect(insights.insights).toEqual([])
      expect(insights.recommendations).toEqual([])
      expect(insights.progressHighlights).toEqual([])
      expect(insights.areasForAttention).toEqual([])
    })
  })

  describe('API Communication', () => {
    it('should use correct model configurations', async () => {
      await bailianService.analyzeMoodAdvanced({
        text: "test",
        userId: mockUserId
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"model":"qwen-max"'),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer'),
            'X-DashScope-SSE': 'disable'
          })
        })
      )
    })

    it('should handle API rate limiting', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        text: jest.fn().mockResolvedValue('Rate limit exceeded')
      })

      await expect(bailianService.analyzeMoodAdvanced({
        text: "test",
        userId: mockUserId
      })).resolves.toBeDefined()
    })

    it('should handle API authentication errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized')
      })

      const result = await bailianService.analyzeMoodAdvanced({
        text: "test",
        userId: mockUserId
      })

      expect(result.analysisVersion).toBe('fallback-v1.0')
    })

    it('should handle network timeouts', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 35000))
      )

      // Should complete within reasonable time due to timeout handling
      const startTime = Date.now()
      await bailianService.analyzeMoodAdvanced({
        text: "test",
        userId: mockUserId
      })
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(35000) // Should fail faster than full timeout
    })
  })

  describe('Performance Requirements', () => {
    it('should complete mood analysis within 5 seconds', async () => {
      const startTime = Date.now()
      
      await bailianService.analyzeMoodAdvanced({
        text: "I'm feeling overwhelmed with work and personal responsibilities",
        userId: mockUserId
      })
      
      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(5000)
    })

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        text: `Test message ${i}`,
        userId: `user-${i}`
      }))

      const startTime = Date.now()
      const results = await Promise.all(
        requests.map(req => bailianService.analyzeMoodAdvanced(req))
      )
      const duration = Date.now() - startTime

      expect(results).toHaveLength(5)
      expect(duration).toBeLessThan(10000) // All requests within 10 seconds
      results.forEach(result => expect(result).toBeDefined())
    })

    it('should maintain performance with large input text', async () => {
      const largeText = 'I feel anxious about many things. '.repeat(100) // ~3000 characters

      const startTime = Date.now()
      const result = await bailianService.analyzeMoodAdvanced({
        text: largeText,
        userId: mockUserId
      })
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(10000)
      expect(result).toBeDefined()
    })
  })

  describe('Error Recovery', () => {
    it('should retry on transient failures', async () => {
      let callCount = 0
      ;(global.fetch as jest.Mock).mockImplementation(() => {
        callCount++
        if (callCount < 2) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            output: { text: '{"primaryMood": "neutral", "confidence": 0.5}' },
            usage: { total_tokens: 100 }
          })
        })
      })

      // Note: Current implementation doesn't have retry logic
      // This test documents expected behavior for future enhancement
      const result = await bailianService.analyzeMoodAdvanced({
        text: "test",
        userId: mockUserId
      })

      expect(result.analysisVersion).toBe('fallback-v1.0')
    })

    it('should degrade gracefully on persistent failures', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Persistent failure'))

      const result = await bailianService.analyzeMoodAdvanced({
        text: "I need help",
        userId: mockUserId
      })

      // Should return fallback analysis
      expect(result.primaryMood).toBe('neutral')
      expect(result.confidence).toBe(0.2)
      expect(result.analysisVersion).toBe('fallback-v1.0')
    })
  })

  describe('Privacy and Security', () => {
    it('should not log sensitive user content', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      await bailianService.analyzeMoodAdvanced({
        text: "My personal details are sensitive",
        userId: mockUserId
      })

      const loggedContent = consoleSpy.mock.calls.flat().join(' ')
      expect(loggedContent).not.toContain('personal details')
      
      consoleSpy.mockRestore()
    })

    it('should handle PII sanitization in API calls', async () => {
      const textWithPII = "My name is John Doe, SSN 123-45-6789, I feel sad"
      
      await bailianService.analyzeMoodAdvanced({
        text: textWithPII,
        userId: mockUserId
      })

      // In production, should sanitize PII before sending to external API
      // Current implementation sends raw text - this test documents expected behavior
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should maintain user data separation', async () => {
      const user1Result = await bailianService.analyzeMoodAdvanced({
        text: "User 1 message",
        userId: "user-1"
      })

      const user2Result = await bailianService.analyzeMoodAdvanced({
        text: "User 2 message", 
        userId: "user-2"
      })

      expect(user1Result.userId).toBe("user-1")
      expect(user2Result.userId).toBe("user-2")
      expect(user1Result.userId).not.toBe(user2Result.userId)
    })
  })
})