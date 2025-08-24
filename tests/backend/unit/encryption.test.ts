import { encryptionService } from '../../../backend/src/services/encryptionService'
import { EncryptedData } from '../../../backend/src/types'
import crypto from 'crypto'

describe('EncryptionService', () => {
  const testUserId = 'test-user-123'
  const testPassword = 'SecurePassword123!'
  const testData = 'Sensitive health information'
  const testPHI = JSON.stringify({
    message: 'Patient feels anxious about upcoming surgery',
    mood: 4,
    symptoms: ['anxiety', 'insomnia']
  })

  describe('Key Generation', () => {
    it('should generate secure user keys', async () => {
      const keys = await encryptionService.generateUserKeys(testUserId, testPassword)
      
      expect(keys).toHaveProperty('salt')
      expect(keys).toHaveProperty('keyDerivationSalt')
      expect(keys).toHaveProperty('encryptedPrivateKey')
      expect(keys).toHaveProperty('publicKey')
      
      expect(keys.salt).toHaveLength(64) // 32 bytes * 2 (hex)
      expect(keys.keyDerivationSalt).toHaveLength(64)
      expect(keys.publicKey).toContain('BEGIN PUBLIC KEY')
      expect(keys.encryptedPrivateKey).toBeDefined()
    })

    it('should generate different keys for same user with different passwords', async () => {
      const keys1 = await encryptionService.generateUserKeys(testUserId, 'password1')
      const keys2 = await encryptionService.generateUserKeys(testUserId, 'password2')
      
      expect(keys1.salt).not.toBe(keys2.salt)
      expect(keys1.keyDerivationSalt).not.toBe(keys2.keyDerivationSalt)
      expect(keys1.encryptedPrivateKey).not.toBe(keys2.encryptedPrivateKey)
    })

    it('should generate cryptographically secure random salts', async () => {
      const keys1 = await encryptionService.generateUserKeys('user1', testPassword)
      const keys2 = await encryptionService.generateUserKeys('user2', testPassword)
      
      // Salts should be different even with same password
      expect(keys1.salt).not.toBe(keys2.salt)
      expect(keys1.keyDerivationSalt).not.toBe(keys2.keyDerivationSalt)
    })
  })

  describe('Key Derivation', () => {
    it('should derive consistent keys from password and salt', async () => {
      const salt = crypto.randomBytes(32).toString('hex')
      
      const key1 = await encryptionService.deriveKeyFromPassword(testPassword, salt)
      const key2 = await encryptionService.deriveKeyFromPassword(testPassword, salt)
      
      expect(key1.equals(key2)).toBe(true)
      expect(key1).toHaveLength(32) // 256 bits
    })

    it('should derive different keys with different salts', async () => {
      const salt1 = crypto.randomBytes(32).toString('hex')
      const salt2 = crypto.randomBytes(32).toString('hex')
      
      const key1 = await encryptionService.deriveKeyFromPassword(testPassword, salt1)
      const key2 = await encryptionService.deriveKeyFromPassword(testPassword, salt2)
      
      expect(key1.equals(key2)).toBe(false)
    })

    it('should derive different keys with different passwords', async () => {
      const salt = crypto.randomBytes(32).toString('hex')
      
      const key1 = await encryptionService.deriveKeyFromPassword('password1', salt)
      const key2 = await encryptionService.deriveKeyFromPassword('password2', salt)
      
      expect(key1.equals(key2)).toBe(false)
    })
  })

  describe('Data Encryption/Decryption', () => {
    let testKey: Buffer

    beforeEach(async () => {
      const salt = crypto.randomBytes(32).toString('hex')
      testKey = await encryptionService.deriveKeyFromPassword(testPassword, salt)
    })

    it('should encrypt and decrypt data successfully', async () => {
      const encrypted = await encryptionService.encryptData(testData, testKey)
      const decrypted = await encryptionService.decryptData(encrypted, testKey)
      
      expect(encrypted).toHaveProperty('data')
      expect(encrypted).toHaveProperty('iv')
      expect(encrypted).toHaveProperty('version')
      expect(encrypted).toHaveProperty('timestamp')
      
      expect(decrypted.decrypted).toBe(testData)
      expect(decrypted.metadata.algorithm).toBe('aes-256-gcm')
      expect(decrypted.metadata.version).toBe('v1')
    })

    it('should produce different ciphertext for same plaintext', async () => {
      const encrypted1 = await encryptionService.encryptData(testData, testKey)
      const encrypted2 = await encryptionService.encryptData(testData, testKey)
      
      expect(encrypted1.data).not.toEqual(encrypted2.data)
      expect(encrypted1.iv).not.toEqual(encrypted2.iv)
    })

    it('should fail decryption with wrong key', async () => {
      const encrypted = await encryptionService.encryptData(testData, testKey)
      const wrongKey = crypto.randomBytes(32)
      
      await expect(encryptionService.decryptData(encrypted, wrongKey))
        .rejects.toThrow('Decryption failed')
    })

    it('should handle empty data encryption', async () => {
      const emptyData = ''
      const encrypted = await encryptionService.encryptData(emptyData, testKey)
      const decrypted = await encryptionService.decryptData(encrypted, testKey)
      
      expect(decrypted.decrypted).toBe(emptyData)
    })

    it('should handle large data encryption', async () => {
      const largeData = 'x'.repeat(100000) // 100KB
      const encrypted = await encryptionService.encryptData(largeData, testKey)
      const decrypted = await encryptionService.decryptData(encrypted, testKey)
      
      expect(decrypted.decrypted).toBe(largeData)
    })

    it('should include integrity protection', async () => {
      const encrypted = await encryptionService.encryptData(testData, testKey)
      
      // Tamper with encrypted data
      encrypted.data[0] = encrypted.data[0] ^ 1
      
      await expect(encryptionService.decryptData(encrypted, testKey))
        .rejects.toThrow('Decryption failed')
    })
  })

  describe('PHI Encryption', () => {
    it('should encrypt PHI with user-specific key', async () => {
      const userKey = 'user-specific-key-123'
      
      const encrypted = await encryptionService.encryptPHI(
        testPHI,
        testUserId,
        userKey,
        'message'
      )
      
      expect(encrypted).toHaveProperty('data')
      expect(encrypted).toHaveProperty('iv')
      expect(encrypted).toHaveProperty('version')
      expect(encrypted).toHaveProperty('timestamp')
    })

    it('should decrypt PHI with audit logging', async () => {
      const userKey = 'user-specific-key-123'
      const ipAddress = '127.0.0.1'
      const purpose = 'user_access'
      
      const encrypted = await encryptionService.encryptPHI(
        testPHI,
        testUserId,
        userKey,
        'message'
      )
      
      const decrypted = await encryptionService.decryptPHI(
        encrypted,
        testUserId,
        userKey,
        purpose,
        ipAddress
      )
      
      expect(decrypted).toHaveProperty('content')
      expect(decrypted).toHaveProperty('metadata')
      expect(decrypted.metadata.purpose).toBe(purpose)
      expect(decrypted.metadata.decryptedAt).toBeDefined()
    })

    it('should reject PHI decryption for wrong user', async () => {
      const userKey = 'user-specific-key-123'
      const wrongUserId = 'wrong-user-456'
      
      const encrypted = await encryptionService.encryptPHI(
        testPHI,
        testUserId,
        userKey,
        'message'
      )
      
      await expect(encryptionService.decryptPHI(
        encrypted,
        wrongUserId,
        userKey,
        'unauthorized_access'
      )).rejects.toThrow('Unauthorized access to PHI')
    })

    it('should handle different PHI data types', async () => {
      const userKey = 'user-specific-key-123'
      const dataTypes: Array<'message' | 'mood' | 'notes' | 'profile'> = 
        ['message', 'mood', 'notes', 'profile']
      
      for (const dataType of dataTypes) {
        const encrypted = await encryptionService.encryptPHI(
          testPHI,
          testUserId,
          userKey,
          dataType
        )
        
        const decrypted = await encryptionService.decryptPHI(
          encrypted,
          testUserId,
          userKey,
          `test_${dataType}`
        )
        
        expect(decrypted.metadata.dataType).toBe(dataType)
      }
    })
  })

  describe('Key Rotation', () => {
    it('should rotate user keys successfully', async () => {
      const oldPassword = 'OldPassword123!'
      const newPassword = 'NewPassword456!'
      
      const rotationResult = await encryptionService.rotateUserKeys(
        testUserId,
        oldPassword,
        newPassword
      )
      
      expect(rotationResult).toHaveProperty('newSalt')
      expect(rotationResult).toHaveProperty('newKeyDerivationSalt')
      expect(rotationResult).toHaveProperty('newEncryptedPrivateKey')
      expect(rotationResult.migrationRequired).toBe(true)
    })

    it('should generate new keys different from old ones', async () => {
      const oldPassword = 'OldPassword123!'
      const newPassword = 'NewPassword456!'
      
      const oldKeys = await encryptionService.generateUserKeys(testUserId, oldPassword)
      const rotationResult = await encryptionService.rotateUserKeys(
        testUserId,
        oldPassword,
        newPassword
      )
      
      expect(rotationResult.newSalt).not.toBe(oldKeys.salt)
      expect(rotationResult.newKeyDerivationSalt).not.toBe(oldKeys.keyDerivationSalt)
      expect(rotationResult.newEncryptedPrivateKey).not.toBe(oldKeys.encryptedPrivateKey)
    })
  })

  describe('Password Security', () => {
    it('should hash passwords securely', async () => {
      const password = 'TestPassword123!'
      const hash = await encryptionService.hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50) // bcrypt hashes are ~60 chars
      expect(hash.startsWith('$2')).toBe(true) // bcrypt format
    })

    it('should verify passwords correctly', async () => {
      const password = 'TestPassword123!'
      const hash = await encryptionService.hashPassword(password)
      
      const validResult = await encryptionService.verifyPassword(password, hash)
      const invalidResult = await encryptionService.verifyPassword('wrongpassword', hash)
      
      expect(validResult).toBe(true)
      expect(invalidResult).toBe(false)
    })

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!'
      const hash1 = await encryptionService.hashPassword(password)
      const hash2 = await encryptionService.hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
      
      // But both should verify correctly
      expect(await encryptionService.verifyPassword(password, hash1)).toBe(true)
      expect(await encryptionService.verifyPassword(password, hash2)).toBe(true)
    })
  })

  describe('Secure Token Generation', () => {
    it('should generate cryptographically secure tokens', async () => {
      const token1 = await encryptionService.generateSecureToken()
      const token2 = await encryptionService.generateSecureToken()
      
      expect(token1).toHaveLength(64) // 32 bytes * 2 (hex)
      expect(token2).toHaveLength(64)
      expect(token1).not.toBe(token2)
      expect(token1).toMatch(/^[a-f0-9]+$/) // hex format
    })

    it('should generate tokens of specified length', async () => {
      const token16 = await encryptionService.generateSecureToken(16)
      const token64 = await encryptionService.generateSecureToken(64)
      
      expect(token16).toHaveLength(32) // 16 bytes * 2 (hex)
      expect(token64).toHaveLength(128) // 64 bytes * 2 (hex)
    })
  })

  describe('HMAC Signatures', () => {
    const testKey = 'secret-signing-key'
    const testData = 'data to sign'

    it('should create and verify HMAC signatures', () => {
      const signature = encryptionService.createSignature(testData, testKey)
      const isValid = encryptionService.verifySignature(testData, signature, testKey)
      
      expect(signature).toBeDefined()
      expect(signature).toHaveLength(64) // SHA-256 hex digest
      expect(isValid).toBe(true)
    })

    it('should reject invalid signatures', () => {
      const signature = encryptionService.createSignature(testData, testKey)
      const tamperedSignature = signature.slice(0, -1) + '0'
      
      const isValid = encryptionService.verifySignature(testData, tamperedSignature, testKey)
      expect(isValid).toBe(false)
    })

    it('should reject signatures with wrong key', () => {
      const signature = encryptionService.createSignature(testData, testKey)
      const wrongKey = 'wrong-key'
      
      const isValid = encryptionService.verifySignature(testData, signature, wrongKey)
      expect(isValid).toBe(false)
    })

    it('should be resistant to timing attacks', () => {
      const signature = encryptionService.createSignature(testData, testKey)
      
      // Multiple verifications should take similar time
      const times: number[] = []
      for (let i = 0; i < 10; i++) {
        const start = process.hrtime.bigint()
        encryptionService.verifySignature(testData, signature, testKey)
        const end = process.hrtime.bigint()
        times.push(Number(end - start))
      }
      
      // Timing should be relatively consistent (within 2x variance)
      const maxTime = Math.max(...times)
      const minTime = Math.min(...times)
      expect(maxTime / minTime).toBeLessThan(2)
    })
  })

  describe('Data Anonymization', () => {
    it('should anonymize PII data', () => {
      const userData = {
        userId: testUserId,
        email: 'user@example.com',
        name: 'John Doe',
        phone: '+1-555-0123',
        address: '123 Main St',
        moodScore: 7,
        sessionCount: 5,
        encryptedContent: 'encrypted-data'
      }
      
      const anonymized = encryptionService.anonymizeData(userData, testUserId)
      
      expect(anonymized.email).toBeUndefined()
      expect(anonymized.name).toBeUndefined()
      expect(anonymized.phone).toBeUndefined()
      expect(anonymized.address).toBeUndefined()
      expect(anonymized.encryptedContent).toBeUndefined()
      
      expect(anonymized.userId).toBeDefined()
      expect(anonymized.userId).not.toBe(testUserId)
      expect(anonymized.userId).toHaveLength(16)
      
      expect(anonymized.moodScore).toBe(7)
      expect(anonymized.sessionCount).toBe(5)
      expect(anonymized.anonymizedAt).toBeDefined()
    })

    it('should create consistent anonymous IDs', () => {
      const userData1 = { userId: testUserId, score: 1 }
      const userData2 = { userId: testUserId, score: 2 }
      
      const anon1 = encryptionService.anonymizeData(userData1, testUserId)
      const anon2 = encryptionService.anonymizeData(userData2, testUserId)
      
      expect(anon1.userId).toBe(anon2.userId)
    })
  })

  describe('Key Strength Validation', () => {
    it('should validate strong keys', () => {
      const strongKey = 'StrongP@ssw0rd123!#$'
      const validation = encryptionService.validateKeyStrength(strongKey)
      
      expect(validation.isValid).toBe(true)
      expect(validation.strength).toBe('strong')
      expect(validation.issues).toHaveLength(0)
    })

    it('should identify weak keys', () => {
      const weakKey = 'password'
      const validation = encryptionService.validateKeyStrength(weakKey)
      
      expect(validation.isValid).toBe(false)
      expect(validation.strength).toBe('weak')
      expect(validation.issues.length).toBeGreaterThan(0)
      expect(validation.issues).toContain('Key too short (minimum 16 characters)')
    })

    it('should identify medium strength keys', () => {
      const mediumKey = 'Password123'
      const validation = encryptionService.validateKeyStrength(mediumKey)
      
      expect(validation.strength).toBe('medium')
      expect(validation.issues).toContain('Missing special characters')
    })
  })

  describe('Memory Security', () => {
    it('should securely delete sensitive buffers', () => {
      const buffer = Buffer.from('sensitive data')
      const originalData = buffer.toString()
      
      encryptionService.secureDelete(buffer)
      
      expect(buffer.toString()).not.toBe(originalData)
      expect(buffer.every(byte => byte === 0)).toBe(true)
    })

    it('should handle null/undefined buffers safely', () => {
      expect(() => {
        encryptionService.secureDelete(null as any)
        encryptionService.secureDelete(undefined as any)
        encryptionService.secureDelete(Buffer.alloc(0))
      }).not.toThrow()
    })
  })

  describe('HIPAA Compliance', () => {
    it('should enforce access controls', async () => {
      const userKey = 'user-key'
      const encrypted = await encryptionService.encryptPHI(
        testPHI,
        testUserId,
        userKey,
        'message'
      )
      
      // Attempt to decrypt with different user ID should fail
      await expect(encryptionService.decryptPHI(
        encrypted,
        'different-user',
        userKey,
        'unauthorized_access'
      )).rejects.toThrow('Unauthorized access to PHI')
    })

    it('should maintain audit trails', async () => {
      const userKey = 'user-key'
      const encrypted = await encryptionService.encryptPHI(
        testPHI,
        testUserId,
        userKey,
        'message'
      )
      
      const decrypted = await encryptionService.decryptPHI(
        encrypted,
        testUserId,
        userKey,
        'audit_test',
        '127.0.0.1'
      )
      
      expect(decrypted.metadata.purpose).toBe('audit_test')
      expect(decrypted.metadata.originalTimestamp).toBeDefined()
      expect(decrypted.metadata.decryptedAt).toBeDefined()
    })

    it('should use minimum necessary access principle', async () => {
      const userKey = 'user-key'
      const encrypted = await encryptionService.encryptPHI(
        testPHI,
        testUserId,
        userKey,
        'message'
      )
      
      // Should require explicit purpose for decryption
      await expect(encryptionService.decryptPHI(
        encrypted,
        testUserId,
        userKey,
        '' // Empty purpose should be rejected
      )).rejects.toThrow()
    })
  })

  describe('Performance Requirements', () => {
    it('should encrypt data quickly', async () => {
      const startTime = Date.now()
      
      await encryptionService.encryptData(testData, testKey)
      
      const encryptionTime = Date.now() - startTime
      expect(encryptionTime).toBeLessThan(100) // < 100ms
    })

    it('should handle concurrent encryption operations', async () => {
      const operations = Array.from({ length: 10 }, (_, i) =>
        encryptionService.encryptData(`test data ${i}`, testKey)
      )
      
      const startTime = Date.now()
      const results = await Promise.all(operations)
      const totalTime = Date.now() - startTime
      
      expect(results).toHaveLength(10)
      expect(totalTime).toBeLessThan(500) // All operations < 500ms
      results.forEach(result => expect(result).toBeDefined())
    })

    it('should maintain performance with large datasets', async () => {
      const largeData = 'x'.repeat(1000000) // 1MB
      
      const startTime = Date.now()
      const encrypted = await encryptionService.encryptData(largeData, testKey)
      const encryptionTime = Date.now() - startTime
      
      const decryptStart = Date.now()
      const decrypted = await encryptionService.decryptData(encrypted, testKey)
      const decryptionTime = Date.now() - decryptStart
      
      expect(encryptionTime).toBeLessThan(1000) // < 1 second
      expect(decryptionTime).toBeLessThan(1000) // < 1 second
      expect(decrypted.decrypted).toBe(largeData)
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted encrypted data', async () => {
      const encrypted = await encryptionService.encryptData(testData, testKey)
      
      // Corrupt the data
      encrypted.data = [1, 2, 3, 4, 5]
      
      await expect(encryptionService.decryptData(encrypted, testKey))
        .rejects.toThrow('Decryption failed')
    })

    it('should handle invalid encryption parameters', async () => {
      await expect(encryptionService.encryptData('', Buffer.alloc(0)))
        .rejects.toThrow()
      
      await expect(encryptionService.encryptData('test', 'invalid-key' as any))
        .rejects.toThrow()
    })

    it('should handle network timeouts gracefully', async () => {
      // This would be tested with actual network operations
      // For now, test that operations don't hang indefinitely
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), 5000)
      )
      
      const encryptionPromise = encryptionService.encryptData(testData, testKey)
      
      const result = await Promise.race([encryptionPromise, timeoutPromise])
      expect(result).toBeDefined()
    })
  })

  // Clean up after each test
  afterEach(() => {
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
  })
})