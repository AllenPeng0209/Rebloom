import { v4 as uuidv4 } from 'uuid'
import { CrisisAssessment, Location } from '@/types'
import { logger, businessLogger } from '@/utils/logger'
import { crisisConfig } from '@/config'
import { supabase } from './supabaseService'
import { notificationService } from './notificationService'
import { auditService } from './auditService'

interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship: 'family' | 'friend' | 'professional' | 'primary_care' | 'therapist'
  priority: number
  verifiedAt?: Date
}

interface CrisisHotline {
  id: string
  name: string
  phone: string
  available24h: boolean
  languages: string[]
  specializations: string[]
  location: Location
  averageWaitTime: number
}

interface EmergencyService {
  id: string
  type: '911' | 'police' | 'fire' | 'ambulance' | 'mental_health_crisis'
  phone: string
  location: Location
  jurisdiction: string
}

interface EscalationResult {
  success: boolean
  contactedServices: string[]
  referenceNumber?: string
  estimatedResponseTime?: number
  error?: string
  alternatives?: any[]
}

interface InterventionProtocol {
  riskLevel: 'high' | 'critical'
  immediateActions: string[]
  contactSequence: string[]
  timeoutMinutes: number
  followUpRequired: boolean
}

class EmergencyService {
  private readonly protocols: Record<string, InterventionProtocol> = {
    'suicide_risk': {
      riskLevel: 'critical',
      immediateActions: ['provide_crisis_resources', 'activate_safety_plan', 'contact_emergency_contacts'],
      contactSequence: ['crisis_hotline', 'emergency_contacts', 'mental_health_services', '911'],
      timeoutMinutes: 5,
      followUpRequired: true
    },
    'self_harm': {
      riskLevel: 'high',
      immediateActions: ['provide_resources', 'safety_assessment', 'professional_consultation'],
      contactSequence: ['crisis_hotline', 'emergency_contacts', 'mental_health_services'],
      timeoutMinutes: 15,
      followUpRequired: true
    },
    'severe_distress': {
      riskLevel: 'high',
      immediateActions: ['emotional_support', 'coping_strategies', 'safety_check'],
      contactSequence: ['crisis_hotline', 'emergency_contacts'],
      timeoutMinutes: 30,
      followUpRequired: false
    }
  }

  /**
   * Main emergency response coordination
   */
  async handleCrisisEscalation(assessment: CrisisAssessment): Promise<EscalationResult> {
    try {
      businessLogger.logIntervention(
        assessment.userId,
        'crisis_escalation',
        `Risk level: ${assessment.riskLevel}, Confidence: ${assessment.confidence}`,
        true
      )

      // Determine intervention protocol
      const protocol = this.selectProtocol(assessment)
      
      // Get user location and emergency contacts
      const [userLocation, emergencyContacts] = await Promise.all([
        this.getUserLocation(assessment.userId),
        this.getEmergencyContacts(assessment.userId)
      ])

      // Execute immediate actions
      await this.executeImmediateActions(protocol.immediateActions, assessment, userLocation)

      // Execute contact sequence
      const contactResults = await this.executeContactSequence(
        protocol.contactSequence,
        assessment,
        userLocation,
        emergencyContacts
      )

      // Log the escalation
      await auditService.logCrisisDetection(
        assessment.userId,
        assessment.riskLevel,
        assessment.triggers,
        assessment.confidence,
        assessment.messageId,
        { ipAddress: undefined, sessionId: undefined }
      )

      // Create escalation record
      await this.createEscalationRecord(assessment, contactResults, protocol)

      return {
        success: true,
        contactedServices: contactResults.map(r => r.service),
        referenceNumber: uuidv4(),
        estimatedResponseTime: this.calculateEstimatedResponse(contactResults),
        alternatives: []
      }

    } catch (error) {
      logger.error('Crisis escalation failed', {
        assessmentId: assessment.id,
        userId: assessment.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        success: false,
        contactedServices: [],
        error: 'Escalation failed - manual intervention required',
        alternatives: await this.getAlternativeResources(assessment.userId)
      }
    }
  }

  /**
   * Contact emergency services (911, police, etc.)
   */
  async contactEmergencyServices(
    userId: string,
    emergencyType: 'suicide_attempt' | 'self_harm' | 'medical_emergency' | 'mental_health_crisis' = 'mental_health_crisis'
  ): Promise<EscalationResult> {
    try {
      // Get user location
      const userLocation = await this.getUserLocation(userId)
      
      if (!userLocation) {
        logger.error('Cannot contact emergency services - no location available', { userId })
        return {
          success: false,
          contactedServices: [],
          error: 'Location required for emergency services',
          alternatives: await this.getCrisisHotlines(undefined)
        }
      }

      // Find appropriate emergency service
      const emergencyServices = await this.findEmergencyServices(userLocation, emergencyType)
      
      if (emergencyServices.length === 0) {
        logger.error('No emergency services found for location', { userId, location: userLocation })
        return {
          success: false,
          contactedServices: [],
          error: 'No emergency services available',
          alternatives: await this.getCrisisHotlines(userLocation)
        }
      }

      // Contact emergency services via API (if available) or prepare manual contact
      const contactResults = await Promise.allSettled(
        emergencyServices.map(service => this.contactService(service, userId, emergencyType))
      )

      const successfulContacts = contactResults
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)

      // Log emergency services contact
      businessLogger.logIntervention(
        userId,
        'emergency_services_contact',
        `Type: ${emergencyType}, Services: ${successfulContacts.length}`,
        successfulContacts.length > 0
      )

      // Create emergency event record
      await this.createEmergencyEvent(userId, emergencyType, successfulContacts)

      return {
        success: successfulContacts.length > 0,
        contactedServices: successfulContacts.map(c => c.serviceName),
        referenceNumber: successfulContacts[0]?.referenceNumber,
        estimatedResponseTime: Math.min(...successfulContacts.map(c => c.estimatedResponse || 300)), // 5 min default
        alternatives: successfulContacts.length === 0 ? await this.getCrisisHotlines(userLocation) : []
      }

    } catch (error) {
      logger.error('Emergency services contact failed', { userId, emergencyType, error })
      return {
        success: false,
        contactedServices: [],
        error: 'Emergency services contact failed',
        alternatives: await this.getCrisisHotlines(undefined)
      }
    }
  }

  /**
   * Connect user to crisis hotline
   */
  async connectToCrisisHotline(
    userId: string,
    location?: Location,
    preferredLanguage: string = 'en'
  ): Promise<{
    success: boolean
    hotline?: CrisisHotline
    connectionDetails?: any
    error?: string
  }> {
    try {
      // Get available crisis hotlines
      const hotlines = await this.getCrisisHotlines(location)
      
      // Filter and prioritize hotlines
      const suitableHotlines = hotlines
        .filter(h => h.languages.includes(preferredLanguage) || h.languages.includes('en'))
        .sort((a, b) => {
          // Prioritize by availability and wait time
          if (a.available24h && !b.available24h) return -1
          if (!a.available24h && b.available24h) return 1
          return a.averageWaitTime - b.averageWaitTime
        })

      if (suitableHotlines.length === 0) {
        return {
          success: false,
          error: 'No suitable crisis hotlines available'
        }
      }

      const selectedHotline = suitableHotlines[0]

      // Log hotline connection
      businessLogger.logIntervention(
        userId,
        'crisis_hotline_connection',
        `Hotline: ${selectedHotline.name}`,
        true
      )

      // Create connection record
      await this.createHotlineConnectionRecord(userId, selectedHotline)

      return {
        success: true,
        hotline: selectedHotline,
        connectionDetails: {
          phone: selectedHotline.phone,
          name: selectedHotline.name,
          languages: selectedHotline.languages,
          estimatedWaitTime: selectedHotline.averageWaitTime
        }
      }

    } catch (error) {
      logger.error('Crisis hotline connection failed', { userId, error })
      return {
        success: false,
        error: 'Failed to connect to crisis hotline'
      }
    }
  }

  /**
   * Notify emergency contacts
   */
  async notifyEmergencyContacts(
    userId: string,
    message: string,
    urgency: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<{
    success: boolean
    contactedCount: number
    failedCount: number
    results: any[]
  }> {
    try {
      const emergencyContacts = await this.getEmergencyContacts(userId)
      
      if (emergencyContacts.length === 0) {
        logger.warn('No emergency contacts found for user', { userId })
        return {
          success: false,
          contactedCount: 0,
          failedCount: 0,
          results: []
        }
      }

      // Filter contacts based on urgency
      const contactsToNotify = this.filterContactsByUrgency(emergencyContacts, urgency)

      // Send notifications
      const notificationResults = await Promise.allSettled(
        contactsToNotify.map(contact => 
          this.notifyContact(contact, userId, message, urgency)
        )
      )

      const successfulNotifications = notificationResults
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)

      const failedNotifications = notificationResults.filter(result => result.status === 'rejected')

      // Log notification results
      businessLogger.logIntervention(
        userId,
        'emergency_contact_notification',
        `Contacted: ${successfulNotifications.length}/${contactsToNotify.length}`,
        successfulNotifications.length > 0
      )

      return {
        success: successfulNotifications.length > 0,
        contactedCount: successfulNotifications.length,
        failedCount: failedNotifications.length,
        results: notificationResults.map((result, index) => ({
          contact: contactsToNotify[index].name,
          success: result.status === 'fulfilled',
          error: result.status === 'rejected' ? result.reason : undefined
        }))
      }

    } catch (error) {
      logger.error('Emergency contact notification failed', { userId, error })
      return {
        success: false,
        contactedCount: 0,
        failedCount: 0,
        results: []
      }
    }
  }

  /**
   * Provide immediate crisis resources
   */
  async provideCrisisResources(
    userId: string,
    riskLevel: string,
    triggers: string[]
  ): Promise<void> {
    try {
      // Get user preferences and location
      const [userPreferences, userLocation] = await Promise.all([
        this.getUserPreferences(userId),
        this.getUserLocation(userId)
      ])

      // Select appropriate resources
      const resources = await this.selectCrisisResources(riskLevel, triggers, userPreferences, userLocation)

      // Send resources to user
      await notificationService.sendCrisisResources(userId, {
        riskLevel,
        triggers,
        resources,
        location: userLocation,
        timestamp: new Date()
      })

      // Log resource provision
      businessLogger.logIntervention(
        userId,
        'crisis_resources_provided',
        `Level: ${riskLevel}, Resources: ${resources.length}`,
        true
      )

    } catch (error) {
      logger.error('Crisis resource provision failed', { userId, error })
    }
  }

  /**
   * Create safety plan for user
   */
  async createSafetyPlan(
    userId: string,
    assessment: CrisisAssessment,
    existingPlan?: any
  ): Promise<any> {
    try {
      const safetyPlan = {
        id: uuidv4(),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        riskLevel: assessment.riskLevel,
        triggers: assessment.triggers,
        warningSignsPersonal: [],
        warningSignsEnvironmental: [],
        copingStrategies: this.suggestCopingStrategies(assessment.triggers),
        socialSupports: await this.getEmergencyContacts(userId),
        professionalContacts: await this.getProfessionalContacts(userId),
        environmentalSafety: this.suggestEnvironmentalSafety(assessment.triggers),
        crisisContacts: await this.getCrisisHotlines(await this.getUserLocation(userId)),
        followUpPlan: {
          immediateFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          professionalFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
          reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month
        }
      }

      // Store safety plan
      await this.storeSafetyPlan(safetyPlan)

      // Send safety plan to user
      await notificationService.sendSafetyPlan(userId, safetyPlan)

      businessLogger.logIntervention(
        userId,
        'safety_plan_created',
        `Risk level: ${assessment.riskLevel}`,
        true
      )

      return safetyPlan

    } catch (error) {
      logger.error('Safety plan creation failed', { userId, error })
      throw error
    }
  }

  /**
   * Private helper methods
   */
  private selectProtocol(assessment: CrisisAssessment): InterventionProtocol {
    // Select protocol based on triggers
    if (assessment.triggers.some(t => t.includes('suicide'))) {
      return this.protocols['suicide_risk']
    } else if (assessment.triggers.some(t => t.includes('self_harm'))) {
      return this.protocols['self_harm']
    } else {
      return this.protocols['severe_distress']
    }
  }

  private async getUserLocation(userId: string): Promise<Location | undefined> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('location_data')
        .eq('user_id', userId)
        .single()

      return profile?.location_data
    } catch (error) {
      logger.error('Failed to get user location', { userId, error })
      return undefined
    }
  }

  private async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    try {
      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: true })

      return contacts || []
    } catch (error) {
      logger.error('Failed to get emergency contacts', { userId, error })
      return []
    }
  }

  private async getCrisisHotlines(location?: Location): Promise<CrisisHotline[]> {
    // Default crisis hotlines (would be expanded based on location)
    const defaultHotlines: CrisisHotline[] = [
      {
        id: 'nsp',
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        available24h: true,
        languages: ['en', 'es'],
        specializations: ['suicide_prevention', 'crisis_support'],
        location: { latitude: 0, longitude: 0 }, // National
        averageWaitTime: 30 // seconds
      },
      {
        id: 'ctl',
        name: 'Crisis Text Line',
        phone: 'TEXT HOME to 741741',
        available24h: true,
        languages: ['en'],
        specializations: ['crisis_support', 'text_support'],
        location: { latitude: 0, longitude: 0 }, // National
        averageWaitTime: 60
      }
    ]

    // TODO: Add location-based hotline filtering
    return defaultHotlines
  }

  private async executeImmediateActions(
    actions: string[],
    assessment: CrisisAssessment,
    location?: Location
  ): Promise<void> {
    const actionPromises = actions.map(action => {
      switch (action) {
        case 'provide_crisis_resources':
          return this.provideCrisisResources(assessment.userId, assessment.riskLevel, assessment.triggers)
        case 'activate_safety_plan':
          return this.activateExistingSafetyPlan(assessment.userId)
        case 'contact_emergency_contacts':
          return this.notifyEmergencyContacts(
            assessment.userId,
            `Crisis detected - ${assessment.riskLevel} risk level`,
            assessment.riskLevel === 'critical' ? 'critical' : 'high'
          )
        case 'emotional_support':
          return this.provideEmotionalSupport(assessment.userId)
        case 'coping_strategies':
          return this.provideCopingStrategies(assessment.userId, assessment.triggers)
        case 'safety_check':
          return this.scheduleSafetyCheck(assessment.userId)
        default:
          return Promise.resolve()
      }
    })

    await Promise.allSettled(actionPromises)
  }

  private async executeContactSequence(
    sequence: string[],
    assessment: CrisisAssessment,
    location?: Location,
    emergencyContacts: EmergencyContact[] = []
  ): Promise<any[]> {
    const results = []

    for (const contactType of sequence) {
      try {
        let result
        switch (contactType) {
          case 'crisis_hotline':
            result = await this.connectToCrisisHotline(assessment.userId, location)
            break
          case 'emergency_contacts':
            result = await this.notifyEmergencyContacts(
              assessment.userId,
              `Crisis detected - immediate attention required`,
              'critical'
            )
            break
          case 'mental_health_services':
            result = await this.contactMentalHealthServices(assessment.userId, location)
            break
          case '911':
            result = await this.contactEmergencyServices(assessment.userId, 'mental_health_crisis')
            break
          default:
            continue
        }

        results.push({ service: contactType, result, success: result?.success || false })

        // If critical service contacted successfully, may not need to continue
        if (contactType === '911' && result?.success) {
          break
        }

      } catch (error) {
        results.push({ service: contactType, error, success: false })
      }
    }

    return results
  }

  private async findEmergencyServices(
    location: Location,
    emergencyType: string
  ): Promise<EmergencyService[]> {
    // TODO: Implement location-based emergency service lookup
    // This would integrate with emergency services APIs
    
    return [
      {
        id: '911',
        type: '911',
        phone: '911',
        location,
        jurisdiction: 'local'
      }
    ]
  }

  private async contactService(
    service: EmergencyService,
    userId: string,
    emergencyType: string
  ): Promise<any> {
    // TODO: Implement actual emergency service API integration
    // For now, return mock successful contact
    
    return {
      serviceName: service.type,
      referenceNumber: uuidv4(),
      estimatedResponse: 300, // 5 minutes
      contactedAt: new Date()
    }
  }

  private filterContactsByUrgency(
    contacts: EmergencyContact[],
    urgency: string
  ): EmergencyContact[] {
    if (urgency === 'critical') {
      return contacts.filter(c => c.priority <= 2) // Top 2 contacts
    } else if (urgency === 'high') {
      return contacts.filter(c => c.priority <= 3) // Top 3 contacts
    } else {
      return contacts.filter(c => c.priority <= 5) // Top 5 contacts
    }
  }

  private async notifyContact(
    contact: EmergencyContact,
    userId: string,
    message: string,
    urgency: string
  ): Promise<any> {
    // TODO: Implement actual contact notification (SMS, call, etc.)
    return {
      contactId: contact.id,
      success: true,
      method: 'sms',
      sentAt: new Date()
    }
  }

  private async getUserPreferences(userId: string): Promise<any> {
    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      return preferences || {}
    } catch (error) {
      return {}
    }
  }

  private async selectCrisisResources(
    riskLevel: string,
    triggers: string[],
    preferences: any,
    location?: Location
  ): Promise<any[]> {
    // TODO: Implement intelligent resource selection
    return [
      {
        type: 'crisis_hotline',
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        description: 'Free and confidential emotional support'
      },
      {
        type: 'safety_plan',
        name: 'Personal Safety Plan',
        description: 'Step-by-step plan for staying safe'
      },
      {
        type: 'coping_strategies',
        name: 'Immediate Coping Techniques',
        description: 'Breathing exercises and grounding techniques'
      }
    ]
  }

  private suggestCopingStrategies(triggers: string[]): string[] {
    const strategies = [
      'Deep breathing exercises (4-7-8 technique)',
      'Grounding technique (5-4-3-2-1 sensory method)',
      'Progressive muscle relaxation',
      'Mindfulness meditation',
      'Call a trusted friend or family member',
      'Engage in physical activity',
      'Listen to calming music',
      'Write in a journal'
    ]

    // TODO: Personalize based on triggers
    return strategies
  }

  private suggestEnvironmentalSafety(triggers: string[]): string[] {
    return [
      'Remove or secure potentially harmful items',
      'Stay in a safe, comfortable environment',
      'Avoid isolation - stay with trusted people',
      'Limit access to substances',
      'Create a calm, supportive space'
    ]
  }

  private async getProfessionalContacts(userId: string): Promise<any[]> {
    try {
      const { data: contacts } = await supabase
        .from('professional_contacts')
        .select('*')
        .eq('user_id', userId)

      return contacts || []
    } catch (error) {
      return []
    }
  }

  private async storeSafetyPlan(safetyPlan: any): Promise<void> {
    await supabase
      .from('safety_plans')
      .insert(safetyPlan)
  }

  private async activateExistingSafetyPlan(userId: string): Promise<void> {
    // TODO: Retrieve and activate existing safety plan
    logger.info('Activating existing safety plan', { userId })
  }

  private async provideEmotionalSupport(userId: string): Promise<void> {
    // TODO: Provide immediate emotional support messages
    await notificationService.sendEmotionalSupport(userId)
  }

  private async provideCopingStrategies(userId: string, triggers: string[]): Promise<void> {
    const strategies = this.suggestCopingStrategies(triggers)
    await notificationService.sendCopingStrategies(userId, strategies)
  }

  private async scheduleSafetyCheck(userId: string): Promise<void> {
    // TODO: Schedule follow-up safety check
    logger.info('Safety check scheduled', { userId })
  }

  private async contactMentalHealthServices(userId: string, location?: Location): Promise<any> {
    // TODO: Contact local mental health services
    return { success: true, service: 'mental_health_services' }
  }

  private calculateEstimatedResponse(contactResults: any[]): number {
    const successfulContacts = contactResults.filter(r => r.success)
    if (successfulContacts.length === 0) return 0
    
    const responseTimes = successfulContacts
      .map(c => c.result?.estimatedResponseTime)
      .filter(Boolean)
    
    return responseTimes.length > 0 ? Math.min(...responseTimes) : 300 // Default 5 minutes
  }

  private async createEscalationRecord(
    assessment: CrisisAssessment,
    contactResults: any[],
    protocol: InterventionProtocol
  ): Promise<void> {
    await supabase
      .from('crisis_escalations')
      .insert({
        id: uuidv4(),
        assessment_id: assessment.id,
        user_id: assessment.userId,
        protocol_used: JSON.stringify(protocol),
        contact_results: JSON.stringify(contactResults),
        created_at: new Date()
      })
  }

  private async createEmergencyEvent(
    userId: string,
    emergencyType: string,
    contactResults: any[]
  ): Promise<void> {
    await supabase
      .from('emergency_events')
      .insert({
        id: uuidv4(),
        user_id: userId,
        emergency_type: emergencyType,
        contact_results: JSON.stringify(contactResults),
        created_at: new Date()
      })
  }

  private async createHotlineConnectionRecord(
    userId: string,
    hotline: CrisisHotline
  ): Promise<void> {
    await supabase
      .from('hotline_connections')
      .insert({
        id: uuidv4(),
        user_id: userId,
        hotline_id: hotline.id,
        hotline_name: hotline.name,
        hotline_phone: hotline.phone,
        connected_at: new Date()
      })
  }

  private async getAlternativeResources(userId: string): Promise<any[]> {
    return [
      {
        type: 'text_support',
        name: 'Crisis Text Line',
        contact: 'Text HOME to 741741',
        available: '24/7'
      },
      {
        type: 'online_chat',
        name: 'National Suicide Prevention Chat',
        contact: 'suicidepreventionlifeline.org/chat',
        available: '24/7'
      }
    ]
  }
}

export const emergencyService = new EmergencyService()
export default emergencyService