import dotenv from 'dotenv'
import { ServiceConfig } from '@/types'

dotenv.config()

export const config: ServiceConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8081', 'http://localhost:3000'],
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    encryptionKey: process.env.MASTER_ENCRYPTION_KEY || 'your-256-bit-encryption-key'
  },
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/rebloom',
    ssl: process.env.DATABASE_SSL === 'true',
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10)
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },
  
  ai: {
    bailianApiKey: process.env.BAILIAN_API_KEY || '',
    bailianEndpoint: process.env.BAILIAN_ENDPOINT || 'https://dashscope.aliyuncs.com',
    bailianWorkspaceId: process.env.BAILIAN_WORKSPACE_ID || ''
  },
  
  monitoring: {
    logLevel: process.env.LOG_LEVEL || 'info',
    sentryDsn: process.env.SENTRY_DSN
  }
}

// Supabase configuration
export const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

// Crisis management configuration
export const crisisConfig = {
  hotlineApiUrl: process.env.CRISIS_HOTLINE_API_URL || '',
  hotlineApiKey: process.env.CRISIS_HOTLINE_API_KEY || '',
  emergencyServicesApiUrl: process.env.EMERGENCY_SERVICES_API_URL || '',
  emergencyContactsWebhook: process.env.EMERGENCY_CONTACTS_WEBHOOK || ''
}

// Healthcare integration configuration
export const healthcareConfig = {
  ehrIntegrationEndpoint: process.env.EHR_INTEGRATION_ENDPOINT || '',
  insuranceVerificationApi: process.env.INSURANCE_VERIFICATION_API || '',
  fhirServerBaseUrl: process.env.FHIR_SERVER_BASE_URL || ''
}

// File storage configuration
export const storageConfig = {
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET || 'rebloom-storage'
}

// Compliance configuration
export const complianceConfig = {
  hipaaAuditRetentionDays: parseInt(process.env.HIPAA_AUDIT_RETENTION_DAYS || '2555', 10), // 7 years
  gdprDataRetentionDays: parseInt(process.env.GDPR_DATA_RETENTION_DAYS || '365', 10),
  auditLogEncryption: process.env.AUDIT_LOG_ENCRYPTION === 'true'
}

// Validation
export function validateConfig(): void {
  const required = [
    'JWT_SECRET',
    'DATABASE_URL',
    'BAILIAN_API_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  if (config.env === 'production') {
    const productionRequired = [
      'MASTER_ENCRYPTION_KEY',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    const missingProduction = productionRequired.filter(key => !process.env[key])
    
    if (missingProduction.length > 0) {
      throw new Error(`Missing required production environment variables: ${missingProduction.join(', ')}`)
    }
  }
}