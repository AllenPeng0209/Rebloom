import { v4 as uuidv4 } from 'uuid'
import { AuditLogEntry, User } from '@/types'
import { logger } from '@/utils/logger'
import { supabase } from './supabaseService'
import { encryptionService } from './encryptionService'
import { complianceConfig } from '@/config'

interface AuditContext {
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  apiEndpoint?: string
  requestMethod?: string
  responseCode?: number
  duration?: number
}

interface PHIAccessEvent {
  userId: string
  affectedUserId?: string
  resourceType: string
  resourceId: string
  action: string
  purpose?: string
  context?: any
}

interface SecurityEvent {
  eventType: 'authentication' | 'authorization' | 'data_breach' | 'anomaly'
  userId?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  details: any
  ipAddress?: string
}

class AuditService {
  private readonly retentionPeriods = {
    hipaa: '7 years',
    gdpr: '6 years',
    security: '5 years',
    system: '1 year'
  }

  /**
   * Log PHI access event (HIPAA requirement)
   */
  async logPHIAccess(event: PHIAccessEvent, context: AuditContext): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        id: uuidv4(),
        eventType: 'data_access',
        eventCategory: 'privacy',
        severity: 'info',
        userId: context.userId,
        affectedUserId: event.affectedUserId || event.userId,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        phiAccessed: true,
        actionPerformed: event.action,
        eventDescription: `PHI access: ${event.action} on ${event.resourceType}`,
        eventOutcome: 'success',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        apiEndpoint: context.apiEndpoint,
        requestMethod: context.requestMethod,
        responseCode: context.responseCode,
        eventTimestamp: new Date(),
        durationMs: context.duration,
        riskLevel: this.assessPHIAccessRisk(event, context),
        hipaaRelevant: true,
        gdprRelevant: true,
        retentionPeriod: this.retentionPeriods.hipaa,
        createdAt: new Date()
      }

      await this.storeAuditLog(auditEntry)

      // Alert on high-risk PHI access
      if (auditEntry.riskLevel === 'high' || auditEntry.riskLevel === 'critical') {
        await this.alertSecurityTeam(auditEntry)
      }

    } catch (error) {
      logger.error('Failed to log PHI access', { error, event })
    }
  }

  /**
   * Log authentication events
   */
  async logAuthenticationEvent(
    eventType: 'login' | 'logout' | 'mfa_challenge' | 'password_reset',
    userId: string,
    success: boolean,
    context: AuditContext,
    details?: any
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        id: uuidv4(),
        eventType: eventType === 'login' || eventType === 'logout' ? eventType : 'login',
        eventCategory: 'security',
        severity: success ? 'info' : 'warning',
        userId,
        resourceType: 'user_session',
        resourceId: context.sessionId || uuidv4(),
        phiAccessed: false,
        actionPerformed: eventType,
        eventDescription: `${eventType} ${success ? 'successful' : 'failed'}`,
        eventOutcome: success ? 'success' : 'failure',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        eventTimestamp: new Date(),
        riskLevel: this.assessAuthenticationRisk(eventType, success, context, details),
        hipaaRelevant: true, // Authentication affects PHI access
        gdprRelevant: false,
        retentionPeriod: this.retentionPeriods.security,
        createdAt: new Date()
      }

      await this.storeAuditLog(auditEntry)

      // Track failed login attempts
      if (!success && eventType === 'login') {
        await this.trackFailedLogin(userId, context)
      }

    } catch (error) {
      logger.error('Failed to log authentication event', { error, eventType, userId })
    }
  }

  /**
   * Log data modification events
   */
  async logDataModification(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: 'create' | 'update' | 'delete',
    changes: any,
    context: AuditContext
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        id: uuidv4(),
        eventType: 'data_modification',
        eventCategory: 'clinical',
        severity: action === 'delete' ? 'warning' : 'info',
        userId,
        resourceType,
        resourceId,
        phiAccessed: this.isResourceTypePHI(resourceType),
        actionPerformed: `${action}_${resourceType}`,
        eventDescription: `Data ${action}: ${resourceType} ${resourceId}`,
        eventOutcome: 'success',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        apiEndpoint: context.apiEndpoint,
        requestMethod: context.requestMethod,
        responseCode: context.responseCode,
        eventTimestamp: new Date(),
        durationMs: context.duration,
        riskLevel: this.assessDataModificationRisk(action, resourceType, changes),
        hipaaRelevant: this.isResourceTypePHI(resourceType),
        gdprRelevant: true,
        retentionPeriod: this.isResourceTypePHI(resourceType) ? this.retentionPeriods.hipaa : this.retentionPeriods.gdpr,
        createdAt: new Date()
      }

      // Encrypt sensitive change data before storing
      if (changes && this.containsSensitiveData(changes)) {
        const encryptedChanges = await encryptionService.encryptData(
          JSON.stringify(changes),
          Buffer.from(process.env.AUDIT_ENCRYPTION_KEY || '', 'hex')
        )
        auditEntry.eventDescription += ' [changes encrypted]'
      }

      await this.storeAuditLog(auditEntry)

    } catch (error) {
      logger.error('Failed to log data modification', { error, userId, resourceType, action })
    }
  }

  /**
   * Log crisis detection events
   */
  async logCrisisDetection(
    userId: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    triggers: string[],
    confidence: number,
    messageId?: string,
    context?: AuditContext
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        id: uuidv4(),
        eventType: 'crisis_detection',
        eventCategory: 'clinical',
        severity: riskLevel === 'critical' ? 'critical' : riskLevel === 'high' ? 'error' : 'warning',
        userId,
        resourceType: 'crisis_assessment',
        resourceId: messageId || uuidv4(),
        phiAccessed: true, // Crisis detection involves PHI analysis
        actionPerformed: `crisis_detection_${riskLevel}`,
        eventDescription: `Crisis detected: ${riskLevel} risk (${confidence.toFixed(2)} confidence)`,
        eventOutcome: 'success',
        ipAddress: context?.ipAddress,
        sessionId: context?.sessionId,
        eventTimestamp: new Date(),
        riskLevel: riskLevel,
        anomalyScore: confidence,
        hipaaRelevant: true,
        gdprRelevant: true,
        retentionPeriod: this.retentionPeriods.hipaa,
        createdAt: new Date()
      }

      await this.storeAuditLog(auditEntry)

      // Immediate alert for critical events
      if (riskLevel === 'critical') {
        await this.alertCrisisTeam(auditEntry, triggers)
      }

    } catch (error) {
      logger.error('Failed to log crisis detection', { error, userId, riskLevel })
    }
  }

  /**
   * Log professional access to patient data
   */
  async logProfessionalAccess(
    professionalId: string,
    patientId: string,
    accessType: 'emergency' | 'authorized' | 'consultation',
    purpose: string,
    context: AuditContext
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        id: uuidv4(),
        eventType: 'professional_access',
        eventCategory: 'clinical',
        severity: accessType === 'emergency' ? 'warning' : 'info',
        userId: professionalId,
        affectedUserId: patientId,
        professionalId,
        resourceType: 'patient_data',
        resourceId: patientId,
        phiAccessed: true,
        actionPerformed: `professional_access_${accessType}`,
        eventDescription: `Professional access: ${accessType} - ${purpose}`,
        eventOutcome: 'success',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        eventTimestamp: new Date(),
        riskLevel: accessType === 'emergency' ? 'high' : 'medium',
        hipaaRelevant: true,
        gdprRelevant: true,
        retentionPeriod: this.retentionPeriods.hipaa,
        createdAt: new Date()
      }

      await this.storeAuditLog(auditEntry)

      // Alert on emergency access
      if (accessType === 'emergency') {
        await this.alertComplianceTeam(auditEntry)
      }

    } catch (error) {
      logger.error('Failed to log professional access', { error, professionalId, patientId })
    }
  }

  /**
   * Log security anomalies and potential breaches
   */
  async logSecurityAnomaly(
    userId: string,
    anomalyType: string,
    severity: 'info' | 'warning' | 'error' | 'critical',
    details: any,
    context?: AuditContext
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        id: uuidv4(),
        eventType: 'data_access', // Security anomalies often involve unauthorized access attempts
        eventCategory: 'security',
        severity,
        userId,
        resourceType: 'security_event',
        resourceId: uuidv4(),
        phiAccessed: details.phiInvolved || false,
        actionPerformed: `security_anomaly_${anomalyType}`,
        eventDescription: `Security anomaly detected: ${anomalyType}`,
        eventOutcome: 'blocked',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        sessionId: context?.sessionId,
        eventTimestamp: new Date(),
        riskLevel: this.mapSeverityToRiskLevel(severity),
        anomalyScore: details.score || 0.8,
        hipaaRelevant: details.phiInvolved || false,
        gdprRelevant: details.personalDataInvolved || false,
        retentionPeriod: this.retentionPeriods.security,
        createdAt: new Date()
      }

      await this.storeAuditLog(auditEntry)

      // Immediate response for critical security events
      if (severity === 'critical') {
        await this.triggerSecurityIncidentResponse(auditEntry, details)
      }

    } catch (error) {
      logger.error('Failed to log security anomaly', { error, userId, anomalyType })
    }
  }

  /**
   * Generate compliance reports
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    reportType: 'hipaa' | 'gdpr' | 'security' | 'full'
  ): Promise<any> {
    try {
      const query = supabase
        .from('audit_log')
        .select('*')
        .gte('event_timestamp', startDate.toISOString())
        .lte('event_timestamp', endDate.toISOString())

      // Filter by compliance type
      if (reportType === 'hipaa') {
        query.eq('hipaa_relevant', true)
      } else if (reportType === 'gdpr') {
        query.eq('gdpr_relevant', true)
      } else if (reportType === 'security') {
        query.eq('event_category', 'security')
      }

      const { data: auditLogs, error } = await query
      if (error) throw error

      // Aggregate data for reporting
      const report = {
        reportType,
        period: { startDate, endDate },
        generatedAt: new Date(),
        summary: {
          totalEvents: auditLogs.length,
          phiAccessEvents: auditLogs.filter(log => log.phi_accessed).length,
          securityEvents: auditLogs.filter(log => log.event_category === 'security').length,
          crisisEvents: auditLogs.filter(log => log.event_type === 'crisis_detection').length,
          failedAccessAttempts: auditLogs.filter(log => log.event_outcome === 'failure').length
        },
        riskDistribution: this.aggregateByRiskLevel(auditLogs),
        userActivity: this.aggregateByUser(auditLogs),
        timelineAnalysis: this.aggregateByTimeperiod(auditLogs),
        anomalies: auditLogs.filter(log => 
          log.risk_level === 'high' || log.risk_level === 'critical'
        ),
        complianceMetrics: {
          auditTrailCompleteness: this.calculateAuditCompleteness(auditLogs),
          dataRetentionCompliance: await this.checkDataRetentionCompliance(),
          accessControlCompliance: this.calculateAccessControlCompliance(auditLogs)
        }
      }

      // Store report for future reference
      await this.storeComplianceReport(report)

      return report

    } catch (error) {
      logger.error('Failed to generate compliance report', { error, reportType })
      throw error
    }
  }

  /**
   * Search audit logs with filters
   */
  async searchAuditLogs(filters: {
    userId?: string
    eventType?: string
    startDate?: Date
    endDate?: Date
    riskLevel?: string
    phiAccessed?: boolean
    limit?: number
    offset?: number
  }): Promise<{ logs: AuditLogEntry[], total: number }> {
    try {
      let query = supabase
        .from('audit_log')
        .select('*', { count: 'exact' })
        .order('event_timestamp', { ascending: false })

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType)
      }
      if (filters.startDate) {
        query = query.gte('event_timestamp', filters.startDate.toISOString())
      }
      if (filters.endDate) {
        query = query.lte('event_timestamp', filters.endDate.toISOString())
      }
      if (filters.riskLevel) {
        query = query.eq('risk_level', filters.riskLevel)
      }
      if (filters.phiAccessed !== undefined) {
        query = query.eq('phi_accessed', filters.phiAccessed)
      }

      const limit = Math.min(filters.limit || 100, 1000) // Cap at 1000
      const offset = filters.offset || 0

      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw error

      return {
        logs: data || [],
        total: count || 0
      }

    } catch (error) {
      logger.error('Failed to search audit logs', { error, filters })
      throw error
    }
  }

  /**
   * Private helper methods
   */
  private async storeAuditLog(auditEntry: AuditLogEntry): Promise<void> {
    // Encrypt sensitive audit data if required
    let encryptedEntry = { ...auditEntry }
    
    if (complianceConfig.auditLogEncryption && auditEntry.phiAccessed) {
      // Encrypt sensitive fields
      const sensitiveFields = ['eventDescription', 'resourceId']
      for (const field of sensitiveFields) {
        if (encryptedEntry[field as keyof AuditLogEntry]) {
          // Implementation would encrypt the field value
          // For now, just mark as encrypted
          encryptedEntry[field as keyof AuditLogEntry] = '[ENCRYPTED]' as any
        }
      }
    }

    const { error } = await supabase
      .from('audit_log')
      .insert({
        id: encryptedEntry.id,
        event_type: encryptedEntry.eventType,
        event_category: encryptedEntry.eventCategory,
        severity: encryptedEntry.severity,
        user_id: encryptedEntry.userId,
        affected_user_id: encryptedEntry.affectedUserId,
        professional_id: encryptedEntry.professionalId,
        resource_type: encryptedEntry.resourceType,
        resource_id: encryptedEntry.resourceId,
        phi_accessed: encryptedEntry.phiAccessed,
        action_performed: encryptedEntry.actionPerformed,
        event_description: encryptedEntry.eventDescription,
        event_outcome: encryptedEntry.eventOutcome,
        ip_address: encryptedEntry.ipAddress,
        user_agent: encryptedEntry.userAgent,
        session_id: encryptedEntry.sessionId,
        api_endpoint: encryptedEntry.apiEndpoint,
        request_method: encryptedEntry.requestMethod,
        response_code: encryptedEntry.responseCode,
        event_timestamp: encryptedEntry.eventTimestamp,
        duration_ms: encryptedEntry.durationMs,
        risk_level: encryptedEntry.riskLevel,
        anomaly_score: encryptedEntry.anomalyScore,
        hipaa_relevant: encryptedEntry.hipaaRelevant,
        gdpr_relevant: encryptedEntry.gdprRelevant,
        retention_period: encryptedEntry.retentionPeriod,
        created_at: encryptedEntry.createdAt
      })

    if (error) {
      logger.error('Failed to store audit log', { error })
      throw error
    }
  }

  private assessPHIAccessRisk(event: PHIAccessEvent, context: AuditContext): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0

    // Time-based risk
    const hour = new Date().getHours()
    if (hour < 6 || hour > 22) riskScore += 1 // Off-hours access

    // Access pattern risk
    if (event.resourceType === 'messages' && event.action === 'bulk_export') riskScore += 2
    if (event.affectedUserId && event.affectedUserId !== event.userId) riskScore += 1 // Cross-user access

    // IP-based risk (would need geolocation service)
    // if (context.ipAddress && isUnusualLocation(context.ipAddress)) riskScore += 1

    if (riskScore >= 3) return 'high'
    if (riskScore >= 2) return 'medium'
    return 'low'
  }

  private assessAuthenticationRisk(
    eventType: string,
    success: boolean,
    context: AuditContext,
    details?: any
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (success) return 'low'

    let riskScore = 1 // Base risk for failed authentication

    // Multiple failures
    if (details?.consecutiveFailures > 3) riskScore += 2
    if (details?.consecutiveFailures > 10) riskScore += 3

    // Time-based patterns
    if (details?.isRapidAttempt) riskScore += 1

    // IP-based patterns
    if (details?.isNewLocation) riskScore += 1
    if (details?.isKnownAttackerIP) riskScore += 3

    if (riskScore >= 5) return 'critical'
    if (riskScore >= 3) return 'high'
    if (riskScore >= 2) return 'medium'
    return 'low'
  }

  private assessDataModificationRisk(
    action: string,
    resourceType: string,
    changes: any
  ): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0

    // Deletion is always higher risk
    if (action === 'delete') riskScore += 2

    // PHI modifications are higher risk
    if (this.isResourceTypePHI(resourceType)) riskScore += 1

    // Bulk changes are higher risk
    if (changes && Array.isArray(changes) && changes.length > 10) riskScore += 1

    // Critical field modifications
    if (changes && typeof changes === 'object') {
      const criticalFields = ['encryption_key', 'role', 'permissions', 'subscription_tier']
      const modifiedCriticalFields = Object.keys(changes).filter(key => 
        criticalFields.includes(key)
      )
      riskScore += modifiedCriticalFields.length
    }

    if (riskScore >= 4) return 'critical'
    if (riskScore >= 3) return 'high'
    if (riskScore >= 2) return 'medium'
    return 'low'
  }

  private isResourceTypePHI(resourceType: string): boolean {
    const phiResourceTypes = [
      'messages', 'mood_entries', 'conversation_sessions', 
      'crisis_events', 'user_insights', 'voice_recordings'
    ]
    return phiResourceTypes.includes(resourceType)
  }

  private containsSensitiveData(data: any): boolean {
    if (typeof data !== 'object') return false
    
    const sensitiveFields = [
      'password', 'encryption_key', 'private_key', 'token', 
      'ssn', 'phone', 'address', 'content', 'notes'
    ]
    
    return Object.keys(data).some(key => 
      sensitiveFields.some(sensitive => 
        key.toLowerCase().includes(sensitive)
      )
    )
  }

  private mapSeverityToRiskLevel(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'critical': return 'critical'
      case 'error': return 'high'
      case 'warning': return 'medium'
      default: return 'low'
    }
  }

  private async trackFailedLogin(userId: string, context: AuditContext): Promise<void> {
    // Implementation for tracking failed login attempts
    // Could use Redis for rate limiting
    logger.warn('Failed login attempt tracked', { userId, ipAddress: context.ipAddress })
  }

  private async alertSecurityTeam(auditEntry: AuditLogEntry): Promise<void> {
    logger.error('Security team alert triggered', { 
      auditId: auditEntry.id,
      riskLevel: auditEntry.riskLevel,
      eventType: auditEntry.eventType
    })
    // Implementation for alerting security team
  }

  private async alertCrisisTeam(auditEntry: AuditLogEntry, triggers: string[]): Promise<void> {
    logger.error('Crisis team alert triggered', {
      auditId: auditEntry.id,
      userId: auditEntry.userId,
      triggers
    })
    // Implementation for alerting crisis response team
  }

  private async alertComplianceTeam(auditEntry: AuditLogEntry): Promise<void> {
    logger.warn('Compliance team alert triggered', {
      auditId: auditEntry.id,
      eventType: auditEntry.eventType
    })
    // Implementation for alerting compliance team
  }

  private async triggerSecurityIncidentResponse(auditEntry: AuditLogEntry, details: any): Promise<void> {
    logger.error('Security incident response triggered', {
      auditId: auditEntry.id,
      severity: auditEntry.severity,
      details
    })
    // Implementation for security incident response
  }

  private aggregateByRiskLevel(logs: any[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      acc[log.risk_level] = (acc[log.risk_level] || 0) + 1
      return acc
    }, {})
  }

  private aggregateByUser(logs: any[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      if (log.user_id) {
        acc[log.user_id] = (acc[log.user_id] || 0) + 1
      }
      return acc
    }, {})
  }

  private aggregateByTimeperiod(logs: any[]): any {
    // Implementation for timeline analysis
    return {}
  }

  private calculateAuditCompleteness(logs: any[]): number {
    // Implementation for calculating audit trail completeness
    return logs.length > 0 ? 0.95 : 0 // Placeholder
  }

  private async checkDataRetentionCompliance(): Promise<number> {
    // Implementation for checking data retention compliance
    return 0.98 // Placeholder
  }

  private calculateAccessControlCompliance(logs: any[]): number {
    const unauthorizedAccess = logs.filter(log => log.event_outcome === 'blocked').length
    const totalAccess = logs.length
    return totalAccess > 0 ? 1 - (unauthorizedAccess / totalAccess) : 1
  }

  private async storeComplianceReport(report: any): Promise<void> {
    // Implementation for storing compliance reports
    logger.info('Compliance report generated', { reportType: report.reportType })
  }
}

export const auditService = new AuditService()
export default auditService