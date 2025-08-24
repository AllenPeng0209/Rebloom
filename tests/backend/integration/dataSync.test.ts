import { offlineSyncService } from '../../../backend/src/services/offlineSyncService'
import { supabase } from '../../../backend/src/services/supabaseService'
import { encryptionService } from '../../../backend/src/services/encryptionService'

// Mock dependencies
jest.mock('../../../backend/src/services/supabaseService')
jest.mock('../../../backend/src/services/encryptionService')

describe('Data Sync and Offline Functionality', () => {
  const testUserId = 'test-user-123'
  const testDeviceId = 'device-456'

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default Supabase mocks
    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      data: [],
      error: null
    })
  })

  describe('Offline Data Storage', () => {
    it('should queue mood entries for later sync', async () => {
      const moodEntry = {
        tempId: 'temp-mood-1',
        moodScore: 7,
        energyLevel: 6,
        sleepQuality: 8,
        notes: 'Feeling good today',
        recordedAt: new Date().toISOString(),
        symptoms: ['anxiety'],
        activities: ['exercise']
      }

      const result = await offlineSyncService.queueMoodEntry(testUserId, moodEntry)

      expect(result).toBeDefined()
      expect(result.tempId).toBe(moodEntry.tempId)
      expect(result.syncStatus).toBe('pending')
      expect(result.queuedAt).toBeDefined()
    })

    it('should queue conversation messages for sync', async () => {
      const message = {
        tempId: 'temp-msg-1',
        content: 'I had a difficult day at work',
        role: 'user' as const,
        sessionId: 'session-123',
        timestamp: new Date().toISOString()
      }

      const result = await offlineSyncService.queueMessage(testUserId, message)

      expect(result.tempId).toBe(message.tempId)
      expect(result.syncStatus).toBe('pending')
    })

    it('should store crisis events offline', async () => {
      const crisisEvent = {
        tempId: 'temp-crisis-1',
        messageId: 'message-789',
        riskLevel: 'high' as const,
        triggers: ['hopeless', 'isolated'],
        confidence: 0.85,
        detectedAt: new Date().toISOString(),
        requiresImmediate: true
      }

      const result = await offlineSyncService.queueCrisisEvent(testUserId, crisisEvent)

      expect(result.requiresImmediate).toBe(true)
      expect(result.priority).toBe('high')
    })

    it('should handle offline storage limitations', async () => {
      const storageInfo = await offlineSyncService.getStorageInfo(testUserId)

      expect(storageInfo).toHaveProperty('usedSpace')
      expect(storageInfo).toHaveProperty('availableSpace')
      expect(storageInfo).toHaveProperty('itemCounts')
      expect(storageInfo.itemCounts).toHaveProperty('moodEntries')
      expect(storageInfo.itemCounts).toHaveProperty('messages')
      expect(storageInfo.itemCounts).toHaveProperty('crisisEvents')
    })

    it('should cleanup old offline data', async () => {
      const cleanupResult = await offlineSyncService.cleanupOldOfflineData(
        testUserId,
        { olderThanDays: 30 }
      )

      expect(cleanupResult).toHaveProperty('deletedItems')
      expect(cleanupResult).toHaveProperty('freedSpace')
      expect(cleanupResult.deletedItems).toHaveProperty('moodEntries')
      expect(cleanupResult.deletedItems).toHaveProperty('messages')
    })
  })

  describe('Data Synchronization', () => {
    it('should sync pending mood entries to server', async () => {
      const pendingEntries = [
        {
          tempId: 'temp-1',
          moodScore: 7,
          recordedAt: '2024-01-15T10:00:00Z',
          syncStatus: 'pending'
        },
        {
          tempId: 'temp-2', 
          moodScore: 5,
          recordedAt: '2024-01-15T14:00:00Z',
          syncStatus: 'pending'
        }
      ]

      // Mock successful server response
      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [
            { id: 'server-1', temp_id: 'temp-1', mood_score: 7 },
            { id: 'server-2', temp_id: 'temp-2', mood_score: 5 }
          ],
          error: null
        })
      })

      const syncResult = await offlineSyncService.syncMoodEntries(
        testUserId,
        pendingEntries
      )

      expect(syncResult.successful).toHaveLength(2)
      expect(syncResult.failed).toHaveLength(0)
      expect(syncResult.successful[0]).toHaveProperty('serverId', 'server-1')
      expect(syncResult.successful[0]).toHaveProperty('tempId', 'temp-1')
    })

    it('should handle sync conflicts with server data', async () => {
      const conflictingEntry = {
        id: 'existing-1',
        tempId: 'temp-1',
        moodScore: 6,
        lastModified: '2024-01-15T10:00:00Z'
      }

      // Mock server data with later modification
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'existing-1',
            mood_score: 8,
            updated_at: '2024-01-15T11:00:00Z' // Later timestamp
          },
          error: null
        })
      })

      const syncResult = await offlineSyncService.syncWithConflictResolution(
        testUserId,
        [conflictingEntry]
      )

      expect(syncResult.conflicts).toHaveLength(1)
      expect(syncResult.conflicts[0]).toHaveProperty('itemId', 'existing-1')
      expect(syncResult.conflicts[0]).toHaveProperty('resolution')
      expect(syncResult.conflicts[0].resolution).toBeOneOf(['server_wins', 'merge', 'user_choice'])
    })

    it('should prioritize critical data during sync', async () => {
      const mixedData = {
        crisisEvents: [
          { tempId: 'crisis-1', riskLevel: 'critical', requiresImmediate: true }
        ],
        moodEntries: [
          { tempId: 'mood-1', moodScore: 7 }
        ],
        messages: [
          { tempId: 'msg-1', content: 'regular message' }
        ]
      }

      const syncOrder = await offlineSyncService.determineSyncPriority(mixedData)

      expect(syncOrder[0]).toBe('crisisEvents')
      expect(syncOrder).toContain('moodEntries')
      expect(syncOrder).toContain('messages')
    })

    it('should handle partial sync failures gracefully', async () => {
      const entries = [
        { tempId: 'temp-1', moodScore: 7 },
        { tempId: 'temp-2', moodScore: 5 },
        { tempId: 'temp-3', moodScore: 8 }
      ]

      // Mock partial failure
      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: [
            { id: 'server-1', temp_id: 'temp-1' },
            { id: 'server-3', temp_id: 'temp-3' }
          ],
          error: {
            code: 'validation_failed',
            details: 'temp-2 validation failed'
          }
        })
      })

      const syncResult = await offlineSyncService.syncMoodEntries(
        testUserId,
        entries
      )

      expect(syncResult.successful).toHaveLength(2)
      expect(syncResult.failed).toHaveLength(1)
      expect(syncResult.failed[0]).toHaveProperty('tempId', 'temp-2')
      expect(syncResult.failed[0]).toHaveProperty('error')
    })

    it('should resume interrupted syncs', async () => {
      const interruptedSync = {
        syncId: 'sync-123',
        userId: testUserId,
        startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        status: 'interrupted',
        progress: {
          completed: 10,
          total: 25,
          currentBatch: 2
        },
        pendingItems: [
          { tempId: 'temp-11', type: 'moodEntry' },
          { tempId: 'temp-12', type: 'message' }
        ]
      }

      const resumeResult = await offlineSyncService.resumeSync(interruptedSync)

      expect(resumeResult.resumed).toBe(true)
      expect(resumeResult.syncId).toBe('sync-123')
      expect(resumeResult.resumedFrom).toHaveProperty('batch', 2)
    })

    it('should maintain data integrity during sync', async () => {
      const testData = {
        moodEntries: [
          { tempId: 'mood-1', moodScore: 7, checksum: 'abc123' }
        ]
      }

      const integrityCheck = await offlineSyncService.validateDataIntegrity(testData)

      expect(integrityCheck.isValid).toBe(true)
      expect(integrityCheck.issues).toHaveLength(0)
    })

    it('should handle corrupted offline data', async () => {
      const corruptedData = {
        moodEntries: [
          { tempId: 'mood-1', moodScore: 'invalid' } // Corrupted data
        ]
      }

      const integrityCheck = await offlineSyncService.validateDataIntegrity(corruptedData)

      expect(integrityCheck.isValid).toBe(false)
      expect(integrityCheck.issues).toHaveLength(1)
      expect(integrityCheck.issues[0]).toHaveProperty('type', 'data_corruption')
    })
  })

  describe('Conflict Resolution', () => {
    it('should implement last-write-wins for simple conflicts', async () => {
      const localEntry = {
        id: 'entry-1',
        moodScore: 6,
        lastModified: '2024-01-15T10:00:00Z'
      }

      const serverEntry = {
        id: 'entry-1',
        mood_score: 8,
        updated_at: '2024-01-15T11:00:00Z' // Later
      }

      const resolution = await offlineSyncService.resolveConflict(
        localEntry,
        serverEntry,
        { strategy: 'last_write_wins' }
      )

      expect(resolution.winner).toBe('server')
      expect(resolution.mergedData.moodScore).toBe(8)
      expect(resolution.metadata.strategy).toBe('last_write_wins')
    })

    it('should merge non-conflicting fields', async () => {
      const localEntry = {
        id: 'entry-1',
        moodScore: 6,
        notes: 'Local notes',
        lastModified: '2024-01-15T10:00:00Z'
      }

      const serverEntry = {
        id: 'entry-1',
        mood_score: 6, // Same
        energy_level: 7, // Only on server
        updated_at: '2024-01-15T11:00:00Z'
      }

      const resolution = await offlineSyncService.resolveConflict(
        localEntry,
        serverEntry,
        { strategy: 'merge' }
      )

      expect(resolution.mergedData).toHaveProperty('moodScore', 6)
      expect(resolution.mergedData).toHaveProperty('notes', 'Local notes')
      expect(resolution.mergedData).toHaveProperty('energyLevel', 7)
    })

    it('should flag conflicts requiring user decision', async () => {
      const localEntry = {
        id: 'entry-1',
        moodScore: 6,
        notes: 'Important local changes',
        lastModified: '2024-01-15T10:00:00Z'
      }

      const serverEntry = {
        id: 'entry-1',
        mood_score: 8, // Different
        encrypted_notes: 'encrypted-server-notes',
        updated_at: '2024-01-15T09:00:00Z' // Earlier but different content
      }

      const resolution = await offlineSyncService.resolveConflict(
        localEntry,
        serverEntry,
        { strategy: 'user_choice' }
      )

      expect(resolution.requiresUserInput).toBe(true)
      expect(resolution.conflictDetails).toHaveProperty('fields', ['moodScore', 'notes'])
      expect(resolution.options).toHaveLength(3) // local, server, merge
    })

    it('should preserve conflict history', async () => {
      const conflictHistory = await offlineSyncService.getConflictHistory(
        testUserId,
        { limit: 10 }
      )

      expect(conflictHistory).toBeInstanceOf(Array)
      // Each conflict record should have metadata
      if (conflictHistory.length > 0) {
        expect(conflictHistory[0]).toHaveProperty('conflictId')
        expect(conflictHistory[0]).toHaveProperty('itemType')
        expect(conflictHistory[0]).toHaveProperty('resolution')
        expect(conflictHistory[0]).toHaveProperty('resolvedAt')
      }
    })
  })

  describe('Network Connectivity Handling', () => {
    it('should detect network status changes', async () => {
      const networkStatus = await offlineSyncService.checkNetworkStatus()

      expect(networkStatus).toHaveProperty('isOnline')
      expect(networkStatus).toHaveProperty('connectionType')
      expect(networkStatus).toHaveProperty('quality')
    })

    it('should adapt sync strategy based on connection quality', async () => {
      const strategies = [
        { connection: 'wifi', quality: 'excellent', expectedStrategy: 'full_sync' },
        { connection: 'cellular', quality: 'good', expectedStrategy: 'priority_sync' },
        { connection: 'cellular', quality: 'poor', expectedStrategy: 'critical_only' }
      ]

      for (const { connection, quality, expectedStrategy } of strategies) {
        const strategy = await offlineSyncService.getSyncStrategy({
          connectionType: connection,
          quality: quality
        })

        expect(strategy.type).toBe(expectedStrategy)
      }
    })

    it('should queue data when offline', async () => {
      const moodEntry = {
        tempId: 'offline-mood-1',
        moodScore: 5,
        recordedAt: new Date().toISOString()
      }

      // Simulate offline state
      const result = await offlineSyncService.handleOfflineData(
        testUserId,
        'moodEntry',
        moodEntry,
        { isOnline: false }
      )

      expect(result.queued).toBe(true)
      expect(result.willSyncWhenOnline).toBe(true)
      expect(result.queuePosition).toBeGreaterThan(0)
    })

    it('should automatically sync when connection is restored', async () => {
      // Mock pending offline data
      const pendingData = [
        { tempId: 'offline-1', type: 'moodEntry', data: { moodScore: 6 } },
        { tempId: 'offline-2', type: 'message', data: { content: 'test' } }
      ]

      const autoSyncResult = await offlineSyncService.handleConnectionRestored(
        testUserId,
        pendingData
      )

      expect(autoSyncResult.triggered).toBe(true)
      expect(autoSyncResult.itemsToSync).toBe(2)
      expect(autoSyncResult.syncId).toBeDefined()
    })

    it('should handle intermittent connectivity', async () => {
      const unstableConnectionTest = async () => {
        // Simulate sync starting with good connection
        const syncStart = await offlineSyncService.startSync(testUserId)
        
        // Simulate connection loss mid-sync
        const interruption = await offlineSyncService.handleConnectionLoss(syncStart.syncId)
        
        expect(interruption.paused).toBe(true)
        expect(interruption.canResume).toBe(true)
        
        // Simulate connection restoration
        const resume = await offlineSyncService.resumeSync(interruption.syncState)
        
        expect(resume.resumed).toBe(true)
      }

      await expect(unstableConnectionTest()).resolves.not.toThrow()
    })
  })

  describe('Encryption in Sync', () => {
    it('should encrypt sensitive data before sync', async () => {
      const sensitiveData = {
        tempId: 'mood-with-notes',
        moodScore: 4,
        notes: 'Private thoughts about therapy session',
        symptoms: ['anxiety', 'depression']
      }

      ;(encryptionService.encryptPHI as jest.Mock).mockResolvedValue({
        data: [1, 2, 3, 4],
        iv: [5, 6, 7, 8],
        version: 'v1',
        timestamp: Date.now()
      })

      await offlineSyncService.prepareSensitiveDataForSync(testUserId, sensitiveData)

      expect(encryptionService.encryptPHI).toHaveBeenCalledWith(
        sensitiveData.notes,
        testUserId,
        expect.any(String),
        'mood'
      )
    })

    it('should maintain encryption during conflict resolution', async () => {
      const encryptedLocalData = {
        id: 'entry-1',
        moodScore: 6,
        encryptedNotes: { data: [1, 2, 3], iv: [4, 5, 6] }
      }

      const encryptedServerData = {
        id: 'entry-1',
        mood_score: 7,
        encrypted_notes: { data: [7, 8, 9], iv: [10, 11, 12] }
      }

      const resolution = await offlineSyncService.resolveEncryptedConflict(
        encryptedLocalData,
        encryptedServerData,
        testUserId
      )

      expect(resolution.requiresDecryption).toBe(true)
      expect(resolution.decryptionKeys).toBeDefined()
    })

    it('should verify encryption integrity after sync', async () => {
      const encryptedData = {
        data: [1, 2, 3, 4, 5],
        iv: [6, 7, 8, 9, 10],
        version: 'v1',
        checksum: 'abc123'
      }

      const integrityCheck = await offlineSyncService.verifyEncryptionIntegrity(
        encryptedData
      )

      expect(integrityCheck.isValid).toBe(true)
      expect(integrityCheck.checksumMatch).toBe(true)
    })
  })

  describe('Performance Optimization', () => {
    it('should batch sync operations efficiently', async () => {
      const largeDataSet = Array.from({ length: 100 }, (_, i) => ({
        tempId: `batch-item-${i}`,
        moodScore: Math.floor(Math.random() * 10) + 1,
        recordedAt: new Date().toISOString()
      }))

      const batchResult = await offlineSyncService.batchSync(
        testUserId,
        largeDataSet,
        { batchSize: 25 }
      )

      expect(batchResult.totalBatches).toBe(4)
      expect(batchResult.successful).toBeLessThanOrEqual(100)
      expect(batchResult.processingTime).toBeDefined()
    })

    it('should implement delta sync for efficiency', async () => {
      const lastSyncTimestamp = '2024-01-15T00:00:00Z'
      
      const deltaResult = await offlineSyncService.performDeltaSync(
        testUserId,
        lastSyncTimestamp
      )

      expect(deltaResult.changedItems).toBeDefined()
      expect(deltaResult.newSyncTimestamp).toBeDefined()
      expect(deltaResult.itemsSkipped).toBeGreaterThanOrEqual(0)
    })

    it('should compress data for large syncs', async () => {
      const largeMessage = {
        tempId: 'large-message',
        content: 'x'.repeat(10000), // 10KB message
        attachments: ['large-file-1', 'large-file-2']
      }

      const compressionResult = await offlineSyncService.compressForSync(largeMessage)

      expect(compressionResult.compressed).toBe(true)
      expect(compressionResult.originalSize).toBe(10000 + JSON.stringify(largeMessage.attachments).length)
      expect(compressionResult.compressedSize).toBeLessThan(compressionResult.originalSize)
      expect(compressionResult.compressionRatio).toBeGreaterThan(0)
    })

    it('should prioritize user-facing operations', async () => {
      const backgroundSync = offlineSyncService.startBackgroundSync(testUserId)
      
      // Simulate user-initiated action during background sync
      const userAction = offlineSyncService.handleUserAction(testUserId, {
        type: 'mood_entry',
        data: { moodScore: 8 },
        priority: 'immediate'
      })

      const [backgroundResult, userResult] = await Promise.all([
        backgroundSync,
        userAction
      ])

      // User action should complete first or with higher priority
      expect(userResult.priority).toBe('immediate')
      expect(userResult.processedAt).toBeDefined()
    })
  })

  describe('Error Recovery', () => {
    it('should retry failed sync operations', async () => {
      let attemptCount = 0
      ;(supabase.from as jest.Mock).mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network timeout'))
        }
        return {
          insert: jest.fn().mockResolvedValue({
            data: [{ id: 'success', temp_id: 'temp-1' }],
            error: null
          })
        }
      })

      const retryResult = await offlineSyncService.syncWithRetry(
        testUserId,
        [{ tempId: 'temp-1', moodScore: 7 }],
        { maxRetries: 3, backoffMs: 100 }
      )

      expect(attemptCount).toBe(3)
      expect(retryResult.successful).toHaveLength(1)
      expect(retryResult.attempts).toBe(3)
    })

    it('should implement exponential backoff', async () => {
      const backoffTimes: number[] = []
      
      const mockRetry = async (attempt: number) => {
        const backoff = await offlineSyncService.calculateBackoff(attempt)
        backoffTimes.push(backoff)
        return backoff
      }

      await mockRetry(1) // First retry
      await mockRetry(2) // Second retry
      await mockRetry(3) // Third retry

      expect(backoffTimes[1]).toBeGreaterThan(backoffTimes[0])
      expect(backoffTimes[2]).toBeGreaterThan(backoffTimes[1])
    })

    it('should handle sync service unavailability', async () => {
      ;(supabase.from as jest.Mock).mockRejectedValue(
        new Error('Service temporarily unavailable')
      )

      const serviceDownResult = await offlineSyncService.handleServiceUnavailable(
        testUserId,
        [{ tempId: 'temp-1', moodScore: 6 }]
      )

      expect(serviceDownResult.queued).toBe(true)
      expect(serviceDownResult.willRetryAt).toBeDefined()
      expect(serviceDownResult.retryStrategy).toBe('exponential_backoff')
    })

    it('should maintain data consistency after failures', async () => {
      const dataBeforeSync = await offlineSyncService.getOfflineData(testUserId)
      
      // Simulate sync failure
      ;(supabase.from as jest.Mock).mockRejectedValue(new Error('Sync failed'))

      try {
        await offlineSyncService.syncAllData(testUserId)
      } catch (error) {
        // Expected to fail
      }

      const dataAfterFailure = await offlineSyncService.getOfflineData(testUserId)
      
      // Data should remain intact
      expect(dataAfterFailure.moodEntries.length).toBe(dataBeforeSync.moodEntries.length)
      expect(dataAfterFailure.messages.length).toBe(dataBeforeSync.messages.length)
    })
  })

  describe('Multi-Device Sync', () => {
    it('should handle sync between multiple devices', async () => {
      const device1Data = {
        deviceId: 'device-1',
        moodEntries: [
          { tempId: 'device1-mood-1', moodScore: 7, recordedAt: '2024-01-15T10:00:00Z' }
        ]
      }

      const device2Data = {
        deviceId: 'device-2', 
        moodEntries: [
          { tempId: 'device2-mood-1', moodScore: 5, recordedAt: '2024-01-15T11:00:00Z' }
        ]
      }

      const multiDeviceSync = await offlineSyncService.syncMultipleDevices(
        testUserId,
        [device1Data, device2Data]
      )

      expect(multiDeviceSync.devicesProcessed).toBe(2)
      expect(multiDeviceSync.totalItemsSynced).toBe(2)
      expect(multiDeviceSync.conflicts).toBeDefined()
    })

    it('should resolve device timestamp conflicts', async () => {
      const conflictingTimestamp = '2024-01-15T10:00:00Z'
      
      const device1Entry = {
        tempId: 'same-time-1',
        moodScore: 7,
        recordedAt: conflictingTimestamp,
        deviceId: 'device-1'
      }

      const device2Entry = {
        tempId: 'same-time-2',
        moodScore: 5,
        recordedAt: conflictingTimestamp,
        deviceId: 'device-2'
      }

      const timestampResolution = await offlineSyncService.resolveTimestampConflict(
        [device1Entry, device2Entry]
      )

      expect(timestampResolution.resolved).toBe(true)
      expect(timestampResolution.entries).toHaveLength(2)
      // Should adjust one of the timestamps
      expect(timestampResolution.entries[0].recordedAt).not.toBe(
        timestampResolution.entries[1].recordedAt
      )
    })
  })
})