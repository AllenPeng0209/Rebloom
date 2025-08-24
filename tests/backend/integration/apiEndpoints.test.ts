import request from 'supertest'
import { Express } from 'express'
import { createApp } from '../../../backend/src/server'
import { supabase } from '../../../backend/src/services/supabaseService'
import { encryptionService } from '../../../backend/src/services/encryptionService'
import jwt from 'jsonwebtoken'

// Mock external services
jest.mock('../../../backend/src/services/supabaseService')
jest.mock('../../../backend/src/services/encryptionService')
jest.mock('../../../backend/src/services/aiService')

describe('API Endpoints Integration Tests', () => {
  let app: Express
  let authToken: string
  let testUserId: string

  beforeAll(async () => {
    // Initialize test app
    app = await createApp()
    testUserId = 'test-user-123'
    authToken = jwt.sign(
      { userId: testUserId, email: 'test@example.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default Supabase mocks
    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      data: null,
      error: null
    })
  })

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
          firstName: 'John',
          lastName: 'Doe'
        }

        // Mock successful user creation
        ;(supabase.from as jest.Mock).mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'new-user-id',
              email: userData.email,
              created_at: new Date().toISOString()
            },
            error: null
          })
        })

        ;(encryptionService.generateUserKeys as jest.Mock).mockResolvedValue({
          salt: 'mock-salt',
          keyDerivationSalt: 'mock-kd-salt',
          encryptedPrivateKey: 'mock-encrypted-key',
          publicKey: 'mock-public-key'
        })

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('token')
        expect(response.body).toHaveProperty('user')
        expect(response.body.user.email).toBe(userData.email)
        expect(response.body.user).not.toHaveProperty('password')
      })

      it('should reject registration with weak password', async () => {
        const userData = {
          email: 'user@example.com',
          password: '123',
          firstName: 'John',
          lastName: 'Doe'
        }

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)

        expect(response.status).toBe(400)
        expect(response.body.error).toContain('password')
      })

      it('should reject registration with duplicate email', async () => {
        // Mock user already exists
        ;(supabase.from as jest.Mock).mockReturnValue({
          insert: jest.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate key' }
          })
        })

        const userData = {
          email: 'existing@example.com',
          password: 'SecurePassword123!',
          firstName: 'John',
          lastName: 'Doe'
        }

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)

        expect(response.status).toBe(409)
        expect(response.body.error).toContain('already exists')
      })

      it('should validate required fields', async () => {
        const incompleteData = {
          email: 'user@example.com'
          // Missing password, firstName, lastName
        }

        const response = await request(app)
          .post('/api/auth/register')
          .send(incompleteData)

        expect(response.status).toBe(400)
        expect(response.body.error).toContain('required')
      })
    })

    describe('POST /api/auth/login', () => {
      it('should authenticate valid credentials', async () => {
        const credentials = {
          email: 'user@example.com',
          password: 'SecurePassword123!'
        }

        // Mock successful user lookup
        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: testUserId,
              email: credentials.email,
              password_hash: 'hashed-password',
              is_active: true,
              last_login: null
            },
            error: null
          })
        })

        ;(encryptionService.verifyPassword as jest.Mock).mockResolvedValue(true)

        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('token')
        expect(response.body).toHaveProperty('user')
        expect(response.body.user.email).toBe(credentials.email)
      })

      it('should reject invalid credentials', async () => {
        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116', message: 'No rows returned' }
          })
        })

        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'wrongpassword'
          })

        expect(response.status).toBe(401)
        expect(response.body.error).toContain('Invalid credentials')
      })

      it('should reject login for inactive users', async () => {
        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: testUserId,
              email: 'inactive@example.com',
              password_hash: 'hashed-password',
              is_active: false
            },
            error: null
          })
        })

        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'inactive@example.com',
            password: 'password'
          })

        expect(response.status).toBe(403)
        expect(response.body.error).toContain('Account deactivated')
      })

      it('should update last login timestamp', async () => {
        const updateMock = jest.fn().mockResolvedValue({ data: {}, error: null })
        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: testUserId,
              email: 'user@example.com',
              password_hash: 'hashed-password',
              is_active: true
            },
            error: null
          }),
          update: updateMock.mockReturnThis()
        })

        ;(encryptionService.verifyPassword as jest.Mock).mockResolvedValue(true)

        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'user@example.com',
            password: 'password'
          })

        expect(updateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            last_login: expect.any(String)
          })
        )
      })
    })

    describe('POST /api/auth/refresh', () => {
      it('should refresh valid token', async () => {
        const refreshToken = 'valid-refresh-token'
        
        // Mock token validation and user lookup
        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: testUserId,
              email: 'user@example.com',
              is_active: true
            },
            error: null
          })
        })

        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('token')
      })

      it('should reject invalid refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken: 'invalid-token' })

        expect(response.status).toBe(401)
        expect(response.body.error).toContain('Invalid refresh token')
      })
    })

    describe('POST /api/auth/logout', () => {
      it('should logout successfully', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
        expect(response.body.message).toContain('Logged out successfully')
      })
    })
  })

  describe('Crisis Detection Endpoints', () => {
    describe('POST /api/crisis/analyze', () => {
      it('should analyze message for crisis indicators', async () => {
        const analysisRequest = {
          message: "I'm feeling really overwhelmed and hopeless",
          sessionId: 'session-123',
          messageId: 'message-456'
        }

        // Mock crisis assessment storage
        ;(supabase.from as jest.Mock).mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          data: [{
            id: 'assessment-123',
            risk_level: 'medium',
            confidence: 0.75,
            triggers: ['overwhelmed', 'hopeless']
          }],
          error: null
        })

        const response = await request(app)
          .post('/api/crisis/analyze')
          .set('Authorization', `Bearer ${authToken}`)
          .send(analysisRequest)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('riskLevel')
        expect(response.body).toHaveProperty('confidence')
        expect(response.body).toHaveProperty('triggers')
        expect(response.body).toHaveProperty('recommendedActions')
      })

      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/crisis/analyze')
          .send({
            message: "test message",
            sessionId: 'session-123',
            messageId: 'message-456'
          })

        expect(response.status).toBe(401)
        expect(response.body.error).toContain('Authentication required')
      })

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/crisis/analyze')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            sessionId: 'session-123'
            // Missing message and messageId
          })

        expect(response.status).toBe(400)
        expect(response.body.error).toContain('required')
      })

      it('should handle high-risk scenarios appropriately', async () => {
        const highRiskRequest = {
          message: "I want to kill myself tonight",
          sessionId: 'session-123',
          messageId: 'message-789'
        }

        const response = await request(app)
          .post('/api/crisis/analyze')
          .set('Authorization', `Bearer ${authToken}`)
          .send(highRiskRequest)

        expect(response.status).toBe(200)
        expect(response.body.riskLevel).toBeOneOf(['high', 'critical'])
        expect(response.body.recommendedActions).toContain('immediate_intervention')
      })
    })

    describe('GET /api/crisis/history', () => {
      it('should return user crisis history', async () => {
        // Mock crisis history data
        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          data: [
            {
              id: 'assessment-1',
              risk_level: 'medium',
              created_at: new Date().toISOString(),
              triggers: ['sadness', 'isolation']
            },
            {
              id: 'assessment-2',
              risk_level: 'low',
              created_at: new Date().toISOString(),
              triggers: ['mild_anxiety']
            }
          ],
          error: null
        })

        const response = await request(app)
          .get('/api/crisis/history')
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
        expect(response.body.assessments).toHaveLength(2)
        expect(response.body.assessments[0]).toHaveProperty('riskLevel')
        expect(response.body.assessments[0]).toHaveProperty('timestamp')
      })

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/crisis/history?page=1&limit=10')
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('pagination')
      })

      it('should filter by date range', async () => {
        const startDate = '2024-01-01'
        const endDate = '2024-01-31'

        const response = await request(app)
          .get(`/api/crisis/history?startDate=${startDate}&endDate=${endDate}`)
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
        // Verify date filtering was applied in database query
      })
    })
  })

  describe('Mood Tracking Endpoints', () => {
    describe('POST /api/mood/entry', () => {
      it('should create mood entry successfully', async () => {
        const moodEntry = {
          moodScore: 7,
          energyLevel: 6,
          sleepQuality: 8,
          stressLevel: 4,
          notes: "Feeling much better today after good sleep",
          symptoms: ['anxiety'],
          activities: ['exercise', 'meditation']
        }

        ;(supabase.from as jest.Mock).mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'mood-entry-123',
              user_id: testUserId,
              ...moodEntry,
              recorded_at: new Date().toISOString()
            },
            error: null
          })
        })

        const response = await request(app)
          .post('/api/mood/entry')
          .set('Authorization', `Bearer ${authToken}`)
          .send(moodEntry)

        expect(response.status).toBe(201)
        expect(response.body.moodEntry).toHaveProperty('id')
        expect(response.body.moodEntry.moodScore).toBe(7)
        expect(response.body.moodEntry.notes).toBe(moodEntry.notes)
      })

      it('should validate mood score range', async () => {
        const invalidEntry = {
          moodScore: 15, // Invalid: should be 1-10
          energyLevel: 5
        }

        const response = await request(app)
          .post('/api/mood/entry')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidEntry)

        expect(response.status).toBe(400)
        expect(response.body.error).toContain('moodScore must be between 1 and 10')
      })

      it('should encrypt sensitive notes', async () => {
        const moodEntry = {
          moodScore: 5,
          notes: "Private thoughts about my therapy session"
        }

        ;(encryptionService.encryptPHI as jest.Mock).mockResolvedValue({
          data: [1, 2, 3, 4],
          iv: [5, 6, 7, 8],
          version: 'v1',
          timestamp: Date.now()
        })

        const response = await request(app)
          .post('/api/mood/entry')
          .set('Authorization', `Bearer ${authToken}`)
          .send(moodEntry)

        expect(encryptionService.encryptPHI).toHaveBeenCalledWith(
          moodEntry.notes,
          testUserId,
          expect.any(String),
          'mood'
        )
        expect(response.status).toBe(201)
      })

      it('should trigger mood analysis', async () => {
        const moodEntry = {
          moodScore: 2, // Low mood
          notes: "Feeling very down and hopeless"
        }

        const response = await request(app)
          .post('/api/mood/entry')
          .set('Authorization', `Bearer ${authToken}`)
          .send(moodEntry)

        expect(response.status).toBe(201)
        // Should trigger analysis for concerning mood entries
      })
    })

    describe('GET /api/mood/entries', () => {
      it('should return user mood entries', async () => {
        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          data: [
            {
              id: 'entry-1',
              mood_score: 7,
              energy_level: 6,
              recorded_at: new Date().toISOString(),
              encrypted_notes: 'encrypted-data'
            },
            {
              id: 'entry-2',
              mood_score: 5,
              energy_level: 4,
              recorded_at: new Date().toISOString(),
              encrypted_notes: null
            }
          ],
          error: null
        })

        ;(encryptionService.decryptPHI as jest.Mock).mockResolvedValue({
          content: 'Decrypted notes',
          metadata: { dataType: 'mood' }
        })

        const response = await request(app)
          .get('/api/mood/entries')
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
        expect(response.body.entries).toHaveLength(2)
        expect(response.body.entries[0]).toHaveProperty('moodScore')
        expect(response.body.entries[0]).toHaveProperty('recordedAt')
      })

      it('should support date filtering', async () => {
        const response = await request(app)
          .get('/api/mood/entries?startDate=2024-01-01&endDate=2024-01-31')
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
      })

      it('should support mood range filtering', async () => {
        const response = await request(app)
          .get('/api/mood/entries?minMood=1&maxMood=5')
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
      })
    })

    describe('GET /api/mood/analysis', () => {
      it('should return mood analysis and trends', async () => {
        // Mock mood data for analysis
        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          data: [
            { mood_score: 7, energy_level: 6, recorded_at: '2024-01-15' },
            { mood_score: 5, energy_level: 4, recorded_at: '2024-01-16' },
            { mood_score: 8, energy_level: 7, recorded_at: '2024-01-17' }
          ],
          error: null
        })

        const response = await request(app)
          .get('/api/mood/analysis')
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('averageMood')
        expect(response.body).toHaveProperty('moodTrend')
        expect(response.body).toHaveProperty('patterns')
        expect(response.body).toHaveProperty('insights')
      })

      it('should support custom timeframes', async () => {
        const response = await request(app)
          .get('/api/mood/analysis?timeframe=30d')
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
      })
    })
  })

  describe('Data Sync Endpoints', () => {
    describe('POST /api/sync/upload', () => {
      it('should accept offline data upload', async () => {
        const offlineData = {
          moodEntries: [
            {
              tempId: 'temp-1',
              moodScore: 6,
              recordedAt: new Date().toISOString(),
              syncStatus: 'pending'
            }
          ],
          messages: [
            {
              tempId: 'temp-msg-1',
              content: 'Offline message',
              timestamp: new Date().toISOString()
            }
          ],
          lastSyncTimestamp: new Date().toISOString()
        }

        const response = await request(app)
          .post('/api/sync/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .send(offlineData)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('syncedItems')
        expect(response.body).toHaveProperty('conflicts')
        expect(response.body).toHaveProperty('newSyncTimestamp')
      })

      it('should handle sync conflicts', async () => {
        // Mock conflict detection
        const conflictingData = {
          moodEntries: [
            {
              id: 'existing-entry-1',
              moodScore: 5,
              lastModified: '2024-01-01T10:00:00Z'
            }
          ]
        }

        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          data: [
            {
              id: 'existing-entry-1',
              mood_score: 7,
              updated_at: '2024-01-01T11:00:00Z' // Later timestamp
            }
          ],
          error: null
        })

        const response = await request(app)
          .post('/api/sync/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .send(conflictingData)

        expect(response.status).toBe(200)
        expect(response.body.conflicts).toHaveLength(1)
        expect(response.body.conflicts[0]).toHaveProperty('itemId')
        expect(response.body.conflicts[0]).toHaveProperty('resolution')
      })

      it('should validate data integrity', async () => {
        const invalidData = {
          moodEntries: [
            {
              moodScore: 'invalid', // Should be number
              recordedAt: 'invalid-date'
            }
          ]
        }

        const response = await request(app)
          .post('/api/sync/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)

        expect(response.status).toBe(400)
        expect(response.body.error).toContain('validation')
      })
    })

    describe('GET /api/sync/download', () => {
      it('should return data changes since last sync', async () => {
        const lastSyncTimestamp = '2024-01-01T00:00:00Z'

        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gt: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          data: [
            {
              id: 'entry-1',
              mood_score: 7,
              updated_at: '2024-01-02T12:00:00Z'
            }
          ],
          error: null
        })

        const response = await request(app)
          .get(`/api/sync/download?since=${lastSyncTimestamp}`)
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('moodEntries')
        expect(response.body).toHaveProperty('messages')
        expect(response.body).toHaveProperty('syncTimestamp')
        expect(response.body.moodEntries).toHaveLength(1)
      })

      it('should handle initial sync', async () => {
        const response = await request(app)
          .get('/api/sync/download') // No since parameter
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('isInitialSync', true)
      })
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limits on sensitive endpoints', async () => {
      const requests = []
      
      // Send multiple requests quickly
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .post('/api/crisis/analyze')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              message: `Test message ${i}`,
              sessionId: 'session-123',
              messageId: `message-${i}`
            })
        )
      }

      const responses = await Promise.all(requests)
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })

    it('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/mood/entries')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.headers).toHaveProperty('x-ratelimit-limit')
      expect(response.headers).toHaveProperty('x-ratelimit-remaining')
      expect(response.headers).toHaveProperty('x-ratelimit-reset')
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
      expect(response.body.error).toContain('Not found')
    })

    it('should handle database connection failures', async () => {
      // Mock database failure
      ;(supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const response = await request(app)
        .get('/api/mood/entries')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(500)
      expect(response.body.error).toContain('Internal server error')
    })

    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/mood/entry')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Invalid JSON')
    })

    it('should handle request timeout', async () => {
      // Mock slow operation
      ;(supabase.from as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 35000))
      )

      const response = await request(app)
        .get('/api/mood/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000)

      expect(response.status).toBe(408)
    })
  })

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/mood/entries')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.headers).toHaveProperty('x-frame-options')
      expect(response.headers).toHaveProperty('x-content-type-options')
      expect(response.headers).toHaveProperty('x-xss-protection')
      expect(response.headers).toHaveProperty('strict-transport-security')
    })

    it('should prevent SQL injection', async () => {
      const maliciousInput = {
        moodScore: "5; DROP TABLE mood_entries; --",
        notes: "'; DROP TABLE users; --"
      }

      const response = await request(app)
        .post('/api/mood/entry')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousInput)

      // Should handle gracefully without exposing database errors
      expect(response.status).toBeOneOf([400, 500])
      expect(response.body.error).not.toContain('DROP TABLE')
    })
  })

  describe('CORS Configuration', () => {
    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/mood/entry')
        .set('Origin', 'https://app.rebloom.com')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Authorization, Content-Type')

      expect(response.status).toBe(204)
      expect(response.headers).toHaveProperty('access-control-allow-origin')
      expect(response.headers).toHaveProperty('access-control-allow-methods')
    })

    it('should reject unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/mood/entries')
        .set('Origin', 'https://malicious-site.com')
        .set('Authorization', `Bearer ${authToken}`)

      // Should either reject or not include CORS headers
      expect(response.headers['access-control-allow-origin']).not.toBe('https://malicious-site.com')
    })
  })

  describe('Health Check Endpoints', () => {
    it('should return system health status', async () => {
      const response = await request(app)
        .get('/api/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('services')
    })

    it('should check database connectivity', async () => {
      const response = await request(app)
        .get('/api/health/detailed')

      expect(response.status).toBe(200)
      expect(response.body.services).toHaveProperty('database')
      expect(response.body.services).toHaveProperty('redis')
      expect(response.body.services).toHaveProperty('external_ai')
    })
  })
})

// Helper function to create custom matcher
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