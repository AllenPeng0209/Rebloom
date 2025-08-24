import winston from 'winston'
import { config } from '@/config'

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

// Create logger instance
export const logger = winston.createLogger({
  level: config.monitoring.logLevel,
  format: logFormat,
  defaultMeta: {
    service: 'rebloom-backend',
    version: '1.0.0',
    environment: config.env
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

// Add file transports for production
if (config.env === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }))
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }))
}

// Security-focused logging functions
export const securityLogger = {
  logAuthenticationAttempt: (email: string, success: boolean, ipAddress?: string, reason?: string) => {
    logger.info('Authentication attempt', {
      type: 'auth_attempt',
      email,
      success,
      ipAddress,
      reason,
      severity: success ? 'info' : 'warning',
      hipaaRelevant: true
    })
  },
  
  logPHIAccess: (userId: string, resourceType: string, resourceId: string, action: string, ipAddress?: string) => {
    logger.info('PHI access', {
      type: 'phi_access',
      userId,
      resourceType,
      resourceId,
      action,
      ipAddress,
      severity: 'info',
      hipaaRelevant: true,
      timestamp: new Date().toISOString()
    })
  },
  
  logCrisisEvent: (userId: string, riskLevel: string, triggers: string[], confidence: number) => {
    logger.warn('Crisis event detected', {
      type: 'crisis_detection',
      userId,
      riskLevel,
      triggers,
      confidence,
      severity: riskLevel === 'critical' ? 'critical' : 'warning',
      hipaaRelevant: true,
      requiresImmediate: riskLevel === 'critical'
    })
  },
  
  logSecurityAnomaly: (userId: string, anomalyType: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any) => {
    logger.warn('Security anomaly detected', {
      type: 'security_anomaly',
      userId,
      anomalyType,
      severity,
      details,
      hipaaRelevant: true,
      requiresInvestigation: severity === 'high' || severity === 'critical'
    })
  },
  
  logDataModification: (userId: string, resourceType: string, resourceId: string, changes: any, ipAddress?: string) => {
    logger.info('Data modification', {
      type: 'data_modification',
      userId,
      resourceType,
      resourceId,
      changes,
      ipAddress,
      severity: 'info',
      hipaaRelevant: true
    })
  }
}

// Performance logging
export const performanceLogger = {
  logApiRequest: (method: string, endpoint: string, duration: number, statusCode: number, userId?: string) => {
    logger.info('API request', {
      type: 'api_request',
      method,
      endpoint,
      duration,
      statusCode,
      userId,
      severity: statusCode >= 400 ? 'warning' : 'info'
    })
  },
  
  logDatabaseQuery: (query: string, duration: number, success: boolean) => {
    logger.debug('Database query', {
      type: 'db_query',
      query: query.substring(0, 100), // Truncate for security
      duration,
      success,
      severity: success ? 'debug' : 'error'
    })
  },
  
  logExternalServiceCall: (serviceName: string, endpoint: string, duration: number, success: boolean, error?: string) => {
    logger.info('External service call', {
      type: 'external_service',
      serviceName,
      endpoint,
      duration,
      success,
      error,
      severity: success ? 'info' : 'warning'
    })
  }
}

// Business logic logging
export const businessLogger = {
  logConversationStart: (userId: string, sessionId: string, sessionType: string) => {
    logger.info('Conversation started', {
      type: 'conversation_start',
      userId,
      sessionId,
      sessionType,
      severity: 'info'
    })
  },
  
  logMoodEntry: (userId: string, moodScore: number, entryMethod: string) => {
    logger.info('Mood entry recorded', {
      type: 'mood_entry',
      userId,
      moodScore,
      entryMethod,
      severity: 'info'
    })
  },
  
  logAIResponse: (userId: string, model: string, processingTime: number, confidence?: number) => {
    logger.info('AI response generated', {
      type: 'ai_response',
      userId,
      model,
      processingTime,
      confidence,
      severity: 'info'
    })
  },
  
  logIntervention: (userId: string, interventionType: string, reason: string, success: boolean) => {
    logger.warn('Intervention triggered', {
      type: 'intervention',
      userId,
      interventionType,
      reason,
      success,
      severity: 'warning',
      requiresFollowUp: true
    })
  }
}

// Error logging with context
export const errorLogger = {
  logError: (error: Error, context?: any) => {
    logger.error('Application error', {
      type: 'application_error',
      message: error.message,
      stack: error.stack,
      context,
      severity: 'error'
    })
  },
  
  logCriticalError: (error: Error, context?: any) => {
    logger.error('Critical error', {
      type: 'critical_error',
      message: error.message,
      stack: error.stack,
      context,
      severity: 'critical',
      requiresImmediate: true
    })
  },
  
  logValidationError: (userId: string, validationErrors: any, endpoint: string) => {
    logger.warn('Validation error', {
      type: 'validation_error',
      userId,
      validationErrors,
      endpoint,
      severity: 'warning'
    })
  }
}

export default logger