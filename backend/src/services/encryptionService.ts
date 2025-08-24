import crypto from 'crypto'
import { promisify } from 'util'
import { config } from '@/config'
import { EncryptedData, KeyPair } from '@/types'
import { logger, securityLogger } from '@/utils/logger'

const randomBytes = promisify(crypto.randomBytes)
const pbkdf2 = promisify(crypto.pbkdf2)

interface EncryptionOptions {
  algorithm?: string
  keyLength?: number
  ivLength?: number
  saltLength?: number
  iterations?: number
}

interface DecryptionResult {
  decrypted: string
  metadata: {
    algorithm: string
    version: string
    timestamp: number
  }
}

class EncryptionService {
  private readonly defaultOptions: Required<EncryptionOptions> = {
    algorithm: 'aes-256-gcm',
    keyLength: 32, // 256 bits
    ivLength: 16, // 128 bits
    saltLength: 32, // 256 bits
    iterations: 100000 // PBKDF2 iterations
  }

  /**
   * Generate a new encryption key pair for a user
   */
  async generateUserKeys(userId: string, password: string): Promise<{
    salt: string
    keyDerivationSalt: string
    encryptedPrivateKey: string
    publicKey: string
  }> {
    try {
      // Generate salts
      const salt = (await randomBytes(this.defaultOptions.saltLength)).toString('hex')
      const keyDerivationSalt = (await randomBytes(this.defaultOptions.saltLength)).toString('hex')

      // Generate RSA key pair for asymmetric operations
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      })

      // Derive encryption key from password
      const derivedKey = await this.deriveKeyFromPassword(password, keyDerivationSalt)

      // Encrypt the private key with derived key
      const encryptedPrivateKey = await this.encryptData(privateKey, derivedKey)

      securityLogger.logSecurityAnomaly(
        userId,
        'key_generation',
        'info',
        { operation: 'user_key_generation_success' }
      )

      return {
        salt,
        keyDerivationSalt,
        encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
        publicKey
      }

    } catch (error) {
      securityLogger.logSecurityAnomaly(
        userId,
        'key_generation_failed',
        'high',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
      throw new Error('Failed to generate user keys')
    }
  }

  /**
   * Derive an encryption key from password and salt
   */
  async deriveKeyFromPassword(password: string, salt: string): Promise<Buffer> {
    const saltBuffer = Buffer.from(salt, 'hex')
    return await pbkdf2(password, saltBuffer, this.defaultOptions.iterations, this.defaultOptions.keyLength, 'sha512')
  }

  /**
   * Encrypt data with AES-256-GCM
   */
  async encryptData(
    data: string,
    key: Buffer | string,
    options?: EncryptionOptions
  ): Promise<EncryptedData> {
    try {
      const opts = { ...this.defaultOptions, ...options }
      const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'hex') : key

      // Generate random IV
      const iv = await randomBytes(opts.ivLength)

      // Create cipher
      const cipher = crypto.createCipher(opts.algorithm, keyBuffer)
      cipher.setAAD(Buffer.from('rebloom-phi-data'))

      // Encrypt data
      let encrypted = cipher.update(data, 'utf8')
      encrypted = Buffer.concat([encrypted, cipher.final()])

      // Get authentication tag
      const authTag = cipher.getAuthTag()

      const result: EncryptedData = {
        data: Array.from(encrypted),
        iv: Array.from(iv),
        version: 'v1',
        timestamp: Date.now()
      }

      // Add auth tag to data
      result.data = Array.from(Buffer.concat([encrypted, authTag]))

      return result

    } catch (error) {
      logger.error('Data encryption failed', { error })
      throw new Error('Encryption failed')
    }
  }

  /**
   * Decrypt data with AES-256-GCM
   */
  async decryptData(
    encryptedData: EncryptedData,
    key: Buffer | string
  ): Promise<DecryptionResult> {
    try {
      const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'hex') : key

      // Extract components
      const iv = Buffer.from(encryptedData.iv)
      const dataBuffer = Buffer.from(encryptedData.data)

      // Split encrypted data and auth tag (last 16 bytes)
      const encrypted = dataBuffer.slice(0, -16)
      const authTag = dataBuffer.slice(-16)

      // Create decipher
      const decipher = crypto.createDecipher(this.defaultOptions.algorithm, keyBuffer)
      decipher.setAuthTag(authTag)
      decipher.setAAD(Buffer.from('rebloom-phi-data'))

      // Decrypt data
      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')

      return {
        decrypted,
        metadata: {
          algorithm: this.defaultOptions.algorithm,
          version: encryptedData.version,
          timestamp: encryptedData.timestamp
        }
      }

    } catch (error) {
      logger.error('Data decryption failed', { error })
      throw new Error('Decryption failed')
    }
  }

  /**
   * Encrypt PHI (Protected Health Information) with additional safeguards
   */
  async encryptPHI(
    data: string,
    userId: string,
    userKey: string,
    dataType: 'message' | 'mood' | 'notes' | 'profile'
  ): Promise<EncryptedData> {
    try {
      // Add PHI-specific metadata
      const phiData = {
        content: data,
        userId,
        dataType,
        timestamp: Date.now(),
        version: 'phi-v1'
      }

      const serializedData = JSON.stringify(phiData)
      const keyBuffer = await this.deriveKeyFromPassword(userKey, userId)

      const encrypted = await this.encryptData(serializedData, keyBuffer)

      // Log PHI encryption event
      securityLogger.logPHIAccess(
        userId,
        dataType,
        'encrypted',
        'encrypt_phi'
      )

      return encrypted

    } catch (error) {
      securityLogger.logSecurityAnomaly(
        userId,
        'phi_encryption_failed',
        'high',
        { dataType, error: error instanceof Error ? error.message : 'Unknown error' }
      )
      throw new Error('PHI encryption failed')
    }
  }

  /**
   * Decrypt PHI with audit logging
   */
  async decryptPHI(
    encryptedData: EncryptedData,
    userId: string,
    userKey: string,
    purpose: string,
    ipAddress?: string
  ): Promise<any> {
    try {
      const keyBuffer = await this.deriveKeyFromPassword(userKey, userId)
      const decryptionResult = await this.decryptData(encryptedData, keyBuffer)

      const phiData = JSON.parse(decryptionResult.decrypted)

      // Verify data belongs to the requesting user
      if (phiData.userId !== userId) {
        securityLogger.logSecurityAnomaly(
          userId,
          'unauthorized_phi_access_attempt',
          'critical',
          { attemptedUserId: phiData.userId, ipAddress }
        )
        throw new Error('Unauthorized access to PHI')
      }

      // Log PHI access
      securityLogger.logPHIAccess(
        userId,
        phiData.dataType,
        'decrypted',
        `decrypt_phi_${purpose}`,
        ipAddress
      )

      return {
        content: phiData.content,
        metadata: {
          dataType: phiData.dataType,
          originalTimestamp: phiData.timestamp,
          decryptedAt: Date.now(),
          purpose
        }
      }

    } catch (error) {
      securityLogger.logSecurityAnomaly(
        userId,
        'phi_decryption_failed',
        'high',
        { purpose, error: error instanceof Error ? error.message : 'Unknown error' }
      )
      throw new Error('PHI decryption failed')
    }
  }

  /**
   * Rotate encryption keys for a user
   */
  async rotateUserKeys(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{
    newSalt: string
    newKeyDerivationSalt: string
    newEncryptedPrivateKey: string
    migrationRequired: boolean
  }> {
    try {
      // Generate new keys
      const newKeys = await this.generateUserKeys(userId, newPassword)

      securityLogger.logSecurityAnomaly(
        userId,
        'key_rotation',
        'info',
        { operation: 'key_rotation_initiated' }
      )

      return {
        newSalt: newKeys.salt,
        newKeyDerivationSalt: newKeys.keyDerivationSalt,
        newEncryptedPrivateKey: newKeys.encryptedPrivateKey,
        migrationRequired: true // Data needs to be re-encrypted with new keys
      }

    } catch (error) {
      securityLogger.logSecurityAnomaly(
        userId,
        'key_rotation_failed',
        'high',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
      throw new Error('Key rotation failed')
    }
  }

  /**
   * Generate secure hash for passwords
   */
  async hashPassword(password: string, rounds: number = 12): Promise<string> {
    const bcrypt = await import('bcrypt')
    return bcrypt.hash(password, rounds)
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcrypt')
    return bcrypt.compare(password, hash)
  }

  /**
   * Generate cryptographically secure random token
   */
  async generateSecureToken(length: number = 32): Promise<string> {
    const buffer = await randomBytes(length)
    return buffer.toString('hex')
  }

  /**
   * Hash data with SHA-256
   */
  hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * Create HMAC signature
   */
  createSignature(data: string, key: string): string {
    return crypto.createHmac('sha256', key).update(data).digest('hex')
  }

  /**
   * Verify HMAC signature
   */
  verifySignature(data: string, signature: string, key: string): boolean {
    const expectedSignature = this.createSignature(data, key)
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }

  /**
   * Anonymize data for analytics (irreversible)
   */
  anonymizeData(data: any, userId: string): any {
    // Create consistent anonymous ID from user ID
    const anonymousId = this.hashData(`${userId}:${config.security.encryptionKey}`)

    // Remove all PII fields
    const anonymized = { ...data }
    delete anonymized.email
    delete anonymized.name
    delete anonymized.phone
    delete anonymized.address
    delete anonymized.encryptedContent
    delete anonymized.encryptedNotes

    // Replace user ID with anonymous ID
    anonymized.userId = anonymousId.substring(0, 16) // Shorter for analytics
    anonymized.anonymizedAt = Date.now()
    anonymized.originalFields = Object.keys(data).filter(key => 
      !['userId', 'email', 'name', 'phone', 'address', 'encryptedContent', 'encryptedNotes'].includes(key)
    )

    return anonymized
  }

  /**
   * Secure deletion of sensitive data in memory
   */
  secureDelete(buffer: Buffer): void {
    if (buffer && buffer.length > 0) {
      // Overwrite with random data multiple times
      for (let i = 0; i < 3; i++) {
        crypto.randomFillSync(buffer)
      }
      // Finally zero out
      buffer.fill(0)
    }
  }

  /**
   * Validate encryption key strength
   */
  validateKeyStrength(key: string): {
    isValid: boolean
    strength: 'weak' | 'medium' | 'strong'
    issues: string[]
  } {
    const issues: string[] = []
    let strength: 'weak' | 'medium' | 'strong' = 'strong'

    if (key.length < 16) {
      issues.push('Key too short (minimum 16 characters)')
      strength = 'weak'
    } else if (key.length < 32) {
      strength = 'medium'
    }

    if (!/[A-Z]/.test(key)) {
      issues.push('Missing uppercase letters')
      strength = Math.min(strength, 'medium') as any
    }

    if (!/[a-z]/.test(key)) {
      issues.push('Missing lowercase letters')
      strength = Math.min(strength, 'medium') as any
    }

    if (!/[0-9]/.test(key)) {
      issues.push('Missing numbers')
      strength = Math.min(strength, 'medium') as any
    }

    if (!/[^A-Za-z0-9]/.test(key)) {
      issues.push('Missing special characters')
      strength = Math.min(strength, 'medium') as any
    }

    return {
      isValid: issues.length === 0,
      strength,
      issues
    }
  }
}

export const encryptionService = new EncryptionService()
export default encryptionService