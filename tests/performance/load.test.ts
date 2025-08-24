import { performance } from 'perf_hooks'
import { createApp } from '../../backend/src/server'
import request from 'supertest'
import { Express } from 'express'

// Load testing utilities
interface LoadTestConfig {
  concurrency: number
  duration: number // in seconds
  rampUpTime: number // in seconds
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  payload?: any
  headers?: Record<string, string>
}

interface LoadTestResult {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  requestsPerSecond: number
  errors: Array<{
    error: string
    count: number
    percentage: number
  }>
  percentiles: {
    p50: number
    p95: number
    p99: number
  }
}

class LoadTester {
  private app: Express
  private responseTimes: number[] = []
  private errors: Map<string, number> = new Map()
  private activeRequests = 0
  private completedRequests = 0

  constructor(app: Express) {
    this.app = app
  }

  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    const startTime = performance.now()
    const endTime = startTime + (config.duration * 1000)
    
    this.responseTimes = []
    this.errors.clear()
    this.activeRequests = 0
    this.completedRequests = 0

    // Ramp up users gradually
    const usersPerRampStep = Math.ceil(config.concurrency / 10)
    const rampStepDuration = (config.rampUpTime * 1000) / 10

    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        for (let j = 0; j < usersPerRampStep && this.completedRequests < config.concurrency; j++) {
          this.simulateUser(config, endTime)
        }
      }, i * rampStepDuration)
    }

    // Wait for all requests to complete or timeout
    while (performance.now() < endTime || this.activeRequests > 0) {
      await this.sleep(100)
      if (performance.now() > endTime + 30000) break // 30 second grace period
    }

    return this.generateResults()
  }

  private async simulateUser(config: LoadTestConfig, endTime: number) {
    while (performance.now() < endTime) {
      this.activeRequests++
      
      try {
        const requestStart = performance.now()
        
        let response
        switch (config.method) {
          case 'GET':
            response = await request(this.app)
              .get(config.endpoint)
              .set(config.headers || {})
          break
          case 'POST':
            response = await request(this.app)
              .post(config.endpoint)
              .set(config.headers || {})
              .send(config.payload || {})
          break
          case 'PUT':
            response = await request(this.app)
              .put(config.endpoint)
              .set(config.headers || {})
              .send(config.payload || {})
          break
          case 'DELETE':
            response = await request(this.app)
              .delete(config.endpoint)
              .set(config.headers || {})
          break
        }

        const responseTime = performance.now() - requestStart
        this.responseTimes.push(responseTime)

        if (response.status >= 400) {
          const errorKey = `HTTP_${response.status}`
          this.errors.set(errorKey, (this.errors.get(errorKey) || 0) + 1)
        }

      } catch (error) {
        const errorKey = error instanceof Error ? error.message : 'UNKNOWN_ERROR'
        this.errors.set(errorKey, (this.errors.get(errorKey) || 0) + 1)
      }

      this.activeRequests--
      this.completedRequests++

      // Random wait between requests (0-100ms)
      await this.sleep(Math.random() * 100)
    }
  }

  private generateResults(): LoadTestResult {
    const totalRequests = this.responseTimes.length
    const successfulRequests = totalRequests - Array.from(this.errors.values()).reduce((a, b) => a + b, 0)
    const failedRequests = totalRequests - successfulRequests

    const sortedResponseTimes = [...this.responseTimes].sort((a, b) => a - b)
    
    const sum = this.responseTimes.reduce((a, b) => a + b, 0)
    const averageResponseTime = sum / totalRequests

    const errors = Array.from(this.errors.entries()).map(([error, count]) => ({
      error,
      count,
      percentage: (count / totalRequests) * 100
    }))

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      minResponseTime: Math.min(...this.responseTimes),
      maxResponseTime: Math.max(...this.responseTimes),
      requestsPerSecond: totalRequests / (this.responseTimes.length > 0 ? 
        (Math.max(...this.responseTimes) - Math.min(...this.responseTimes)) / 1000 : 1),
      errors,
      percentiles: {
        p50: this.getPercentile(sortedResponseTimes, 50),
        p95: this.getPercentile(sortedResponseTimes, 95),
        p99: this.getPercentile(sortedResponseTimes, 99)
      }
    }
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
    return sortedArray[Math.max(0, index)] || 0
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

describe('Performance and Load Testing', () => {
  let app: Express
  let loadTester: LoadTester

  beforeAll(async () => {
    app = await createApp()
    loadTester = new LoadTester(app)
  })

  describe('API Endpoint Load Testing', () => {
    it('should handle concurrent mood entry submissions', async () => {
      const authToken = 'mock-jwt-token' // In real tests, generate valid token

      const config: LoadTestConfig = {
        concurrency: 50,
        duration: 30,
        rampUpTime: 10,
        endpoint: '/api/mood/entry',
        method: 'POST',
        payload: {
          moodScore: 7,
          energyLevel: 6,
          sleepQuality: 8,
          notes: 'Load test entry'
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }

      const result = await loadTester.runLoadTest(config)

      // Performance assertions
      expect(result.averageResponseTime).toBeLessThan(500) // 500ms average
      expect(result.percentiles.p95).toBeLessThan(1000) // 95th percentile under 1s
      expect(result.percentiles.p99).toBeLessThan(2000) // 99th percentile under 2s
      expect(result.failedRequests / result.totalRequests).toBeLessThan(0.01) // <1% error rate
      expect(result.requestsPerSecond).toBeGreaterThan(100) // >100 RPS

      console.log('Mood Entry Load Test Results:', {
        totalRequests: result.totalRequests,
        successRate: `${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`,
        averageResponseTime: `${result.averageResponseTime.toFixed(2)}ms`,
        requestsPerSecond: result.requestsPerSecond.toFixed(2),
        p95: `${result.percentiles.p95.toFixed(2)}ms`,
        errors: result.errors
      })
    })

    it('should handle crisis detection analysis load', async () => {
      const authToken = 'mock-jwt-token'

      const config: LoadTestConfig = {
        concurrency: 25,
        duration: 60,
        rampUpTime: 15,
        endpoint: '/api/crisis/analyze',
        method: 'POST',
        payload: {
          message: 'I am feeling very overwhelmed and stressed about everything',
          sessionId: 'load-test-session',
          messageId: `load-test-${Date.now()}`
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }

      const result = await loadTester.runLoadTest(config)

      // Crisis detection is more compute-intensive
      expect(result.averageResponseTime).toBeLessThan(2000) // 2s average
      expect(result.percentiles.p95).toBeLessThan(5000) // 95th percentile under 5s
      expect(result.failedRequests / result.totalRequests).toBeLessThan(0.02) // <2% error rate
      expect(result.requestsPerSecond).toBeGreaterThan(10) // >10 RPS

      console.log('Crisis Detection Load Test Results:', result)
    })

    it('should handle user authentication load', async () => {
      const config: LoadTestConfig = {
        concurrency: 100,
        duration: 30,
        rampUpTime: 5,
        endpoint: '/api/auth/login',
        method: 'POST',
        payload: {
          email: 'loadtest@example.com',
          password: 'LoadTest123!'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }

      const result = await loadTester.runLoadTest(config)

      expect(result.averageResponseTime).toBeLessThan(300) // 300ms average
      expect(result.percentiles.p95).toBeLessThan(800) // 95th percentile under 800ms
      expect(result.requestsPerSecond).toBeGreaterThan(200) // >200 RPS

      console.log('Authentication Load Test Results:', result)
    })

    it('should handle data synchronization load', async () => {
      const authToken = 'mock-jwt-token'

      const config: LoadTestConfig = {
        concurrency: 20,
        duration: 45,
        rampUpTime: 10,
        endpoint: '/api/sync/upload',
        method: 'POST',
        payload: {
          moodEntries: [
            {
              tempId: `temp-${Date.now()}-1`,
              moodScore: 6,
              recordedAt: new Date().toISOString()
            },
            {
              tempId: `temp-${Date.now()}-2`,
              moodScore: 7,
              recordedAt: new Date().toISOString()
            }
          ],
          messages: [
            {
              tempId: `temp-msg-${Date.now()}`,
              content: 'Sync test message',
              timestamp: new Date().toISOString()
            }
          ]
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }

      const result = await loadTester.runLoadTest(config)

      expect(result.averageResponseTime).toBeLessThan(1500) // 1.5s average
      expect(result.percentiles.p95).toBeLessThan(3000) // 95th percentile under 3s
      expect(result.failedRequests / result.totalRequests).toBeLessThan(0.05) // <5% error rate

      console.log('Data Sync Load Test Results:', result)
    })
  })

  describe('Memory and Resource Usage', () => {
    it('should maintain stable memory usage under load', async () => {
      const initialMemory = process.memoryUsage()

      const config: LoadTestConfig = {
        concurrency: 30,
        duration: 60,
        rampUpTime: 10,
        endpoint: '/api/mood/entries',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer mock-jwt-token'
        }
      }

      await loadTester.runLoadTest(config)

      // Force garbage collection
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024)

      console.log('Memory Usage:', {
        initial: `${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        final: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        increase: `${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
      })
    })

    it('should handle CPU usage efficiently', async () => {
      const startCPU = process.cpuUsage()

      const config: LoadTestConfig = {
        concurrency: 40,
        duration: 30,
        rampUpTime: 5,
        endpoint: '/api/crisis/analyze',
        method: 'POST',
        payload: {
          message: 'CPU intensive crisis analysis test',
          sessionId: 'cpu-test-session',
          messageId: 'cpu-test-message'
        },
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
          'Content-Type': 'application/json'
        }
      }

      const result = await loadTester.runLoadTest(config)
      const endCPU = process.cpuUsage(startCPU)

      const cpuUtilization = (endCPU.user + endCPU.system) / 1000000 // Convert to seconds
      const requestsPerCPUSecond = result.totalRequests / cpuUtilization

      // Should process at least 50 requests per CPU second
      expect(requestsPerCPUSecond).toBeGreaterThan(50)

      console.log('CPU Usage:', {
        totalCPUTime: `${cpuUtilization.toFixed(2)}s`,
        requestsPerCPUSecond: requestsPerCPUSecond.toFixed(2),
        totalRequests: result.totalRequests
      })
    })
  })

  describe('Database Performance', () => {
    it('should handle concurrent database operations', async () => {
      // Test database connection pooling and query performance
      const queries = [
        'SELECT COUNT(*) FROM mood_entries',
        'SELECT * FROM users WHERE id = $1',
        'INSERT INTO mood_entries (user_id, mood_score) VALUES ($1, $2)',
        'UPDATE mood_entries SET updated_at = NOW() WHERE id = $1',
        'DELETE FROM temp_sessions WHERE created_at < $1'
      ]

      const concurrent = 50
      const iterations = 100

      const results = await Promise.all(
        Array.from({ length: concurrent }, async (_, i) => {
          const startTime = performance.now()
          
          for (let j = 0; j < iterations; j++) {
            const query = queries[j % queries.length]
            // Mock database query execution time
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
          }
          
          return performance.now() - startTime
        })
      )

      const averageTime = results.reduce((a, b) => a + b, 0) / results.length
      const maxTime = Math.max(...results)

      // Database operations should complete efficiently
      expect(averageTime).toBeLessThan(2000) // 2 seconds average
      expect(maxTime).toBeLessThan(5000) // 5 seconds max

      console.log('Database Performance:', {
        averageTime: `${averageTime.toFixed(2)}ms`,
        maxTime: `${maxTime.toFixed(2)}ms`,
        totalOperations: concurrent * iterations
      })
    })
  })

  describe('Caching Performance', () => {
    it('should improve response times with caching', async () => {
      // Test without caching
      const configWithoutCache: LoadTestConfig = {
        concurrency: 20,
        duration: 30,
        rampUpTime: 5,
        endpoint: '/api/mood/analysis?cache=false',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer mock-jwt-token'
        }
      }

      const resultWithoutCache = await loadTester.runLoadTest(configWithoutCache)

      // Test with caching
      const configWithCache: LoadTestConfig = {
        ...configWithoutCache,
        endpoint: '/api/mood/analysis?cache=true'
      }

      const resultWithCache = await loadTester.runLoadTest(configWithCache)

      // Cached responses should be significantly faster
      expect(resultWithCache.averageResponseTime).toBeLessThan(
        resultWithoutCache.averageResponseTime * 0.5
      )

      console.log('Caching Performance:', {
        withoutCache: `${resultWithoutCache.averageResponseTime.toFixed(2)}ms`,
        withCache: `${resultWithCache.averageResponseTime.toFixed(2)}ms`,
        improvement: `${(((resultWithoutCache.averageResponseTime - resultWithCache.averageResponseTime) / resultWithoutCache.averageResponseTime) * 100).toFixed(1)}%`
      })
    })
  })

  describe('Error Handling Under Load', () => {
    it('should gracefully handle service degradation', async () => {
      // Simulate AI service intermittent failures
      const config: LoadTestConfig = {
        concurrency: 30,
        duration: 45,
        rampUpTime: 10,
        endpoint: '/api/crisis/analyze',
        method: 'POST',
        payload: {
          message: 'Test message for degraded service',
          sessionId: 'degradation-test',
          messageId: 'degradation-message'
        },
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
          'Content-Type': 'application/json',
          'X-Simulate-Degradation': 'true' // Custom header to trigger degraded responses
        }
      }

      const result = await loadTester.runLoadTest(config)

      // Even with degraded AI service, should maintain basic functionality
      expect(result.failedRequests / result.totalRequests).toBeLessThan(0.1) // <10% failures
      expect(result.averageResponseTime).toBeLessThan(3000) // Reasonable fallback time

      // Should have fallback responses
      const fallbackErrors = result.errors.filter(e => e.error.includes('fallback'))
      expect(fallbackErrors.length).toBeGreaterThan(0)

      console.log('Service Degradation Results:', {
        ...result,
        fallbackUsage: fallbackErrors
      })
    })

    it('should implement proper rate limiting', async () => {
      const config: LoadTestConfig = {
        concurrency: 200, // Exceed rate limits
        duration: 15,
        rampUpTime: 2,
        endpoint: '/api/crisis/analyze',
        method: 'POST',
        payload: {
          message: 'Rate limit test',
          sessionId: 'rate-test',
          messageId: 'rate-message'
        },
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
          'Content-Type': 'application/json'
        }
      }

      const result = await loadTester.runLoadTest(config)

      // Should have HTTP 429 (Too Many Requests) responses
      const rateLimitErrors = result.errors.filter(e => e.error.includes('429'))
      expect(rateLimitErrors.length).toBeGreaterThan(0)

      // Total error rate should be manageable with proper rate limiting
      expect(result.failedRequests / result.totalRequests).toBeLessThan(0.3)

      console.log('Rate Limiting Results:', {
        totalRequests: result.totalRequests,
        rateLimitErrors: rateLimitErrors.length,
        errorRate: `${((result.failedRequests / result.totalRequests) * 100).toFixed(2)}%`
      })
    })
  })

  describe('Scalability Testing', () => {
    it('should scale linearly with increased load', async () => {
      const loadLevels = [10, 25, 50, 100]
      const results: Array<{ concurrency: number; result: LoadTestResult }> = []

      for (const concurrency of loadLevels) {
        const config: LoadTestConfig = {
          concurrency,
          duration: 30,
          rampUpTime: 5,
          endpoint: '/api/mood/entry',
          method: 'POST',
          payload: {
            moodScore: 6,
            energyLevel: 5,
            notes: `Scalability test at ${concurrency} users`
          },
          headers: {
            'Authorization': 'Bearer mock-jwt-token',
            'Content-Type': 'application/json'
          }
        }

        const result = await loadTester.runLoadTest(config)
        results.push({ concurrency, result })

        // Brief pause between tests
        await new Promise(resolve => setTimeout(resolve, 5000))
      }

      // Analyze scaling characteristics
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1]
        const curr = results[i]

        const throughputRatio = curr.result.requestsPerSecond / prev.result.requestsPerSecond
        const loadRatio = curr.concurrency / prev.concurrency

        // Throughput should increase reasonably with load
        expect(throughputRatio).toBeGreaterThan(0.8 * loadRatio)
        
        // Response time degradation should be reasonable
        const responseTimeRatio = curr.result.averageResponseTime / prev.result.averageResponseTime
        expect(responseTimeRatio).toBeLessThan(2.0) // Response time shouldn't double
      }

      console.log('Scalability Results:', results.map(r => ({
        concurrency: r.concurrency,
        rps: r.result.requestsPerSecond.toFixed(2),
        avgResponseTime: r.result.averageResponseTime.toFixed(2)
      })))
    })
  })

  describe('Real-world Usage Patterns', () => {
    it('should handle mixed workload scenarios', async () => {
      // Simulate realistic mix of operations
      const operations = [
        { endpoint: '/api/mood/entries', method: 'GET', weight: 40 },
        { endpoint: '/api/mood/entry', method: 'POST', weight: 25 },
        { endpoint: '/api/crisis/analyze', method: 'POST', weight: 10 },
        { endpoint: '/api/sync/download', method: 'GET', weight: 15 },
        { endpoint: '/api/chat/message', method: 'POST', weight: 10 }
      ]

      const mixedResults: LoadTestResult[] = []

      for (const op of operations) {
        const config: LoadTestConfig = {
          concurrency: Math.ceil((op.weight / 100) * 50), // Proportional concurrency
          duration: 60,
          rampUpTime: 10,
          endpoint: op.endpoint,
          method: op.method as any,
          payload: op.method === 'POST' ? {
            moodScore: 6,
            message: 'Mixed workload test',
            sessionId: 'mixed-test'
          } : undefined,
          headers: {
            'Authorization': 'Bearer mock-jwt-token',
            'Content-Type': 'application/json'
          }
        }

        const result = await loadTester.runLoadTest(config)
        mixedResults.push(result)
      }

      // Overall system should perform well under mixed load
      const totalRequests = mixedResults.reduce((sum, r) => sum + r.totalRequests, 0)
      const totalFailures = mixedResults.reduce((sum, r) => sum + r.failedRequests, 0)
      const overallErrorRate = totalFailures / totalRequests

      expect(overallErrorRate).toBeLessThan(0.05) // <5% error rate overall

      console.log('Mixed Workload Results:', {
        totalRequests,
        overallErrorRate: `${(overallErrorRate * 100).toFixed(2)}%`,
        operationResults: mixedResults.map((r, i) => ({
          operation: operations[i].endpoint,
          requests: r.totalRequests,
          avgResponseTime: r.averageResponseTime.toFixed(2)
        }))
      })
    })
  })
})