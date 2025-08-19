import {
    AIResponse,
    ApiResponse,
    AuthTokens,
    ConversationSession,
    Goal,
    Insight,
    LoginCredentials,
    Message,
    MoodEntry,
    RegisterData,
    User
} from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.Rebloom.app'
const API_VERSION = '/v1'

class ApiService {
  private client: AxiosInstance
  private refreshTokenPromise: Promise<string> | null = null

  constructor() {
    this.client = axios.create({
      baseURL: `${BASE_URL}${API_VERSION}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getStoredToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId()
        
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for token refresh and error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newToken = await this.refreshAccessToken()
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            await this.logout()
            throw refreshError
          }
        }

        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const { status, data } = error.response
      const message = (data as any)?.error?.message || `HTTP Error: ${status}`
      return new Error(message)
    } else if (error.request) {
      return new Error('Network error: Unable to reach server')
    } else {
      return new Error('Request error: ' + error.message)
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken')
    } catch {
      return null
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise
    }

    this.refreshTokenPromise = this._performTokenRefresh()
    
    try {
      const newToken = await this.refreshTokenPromise
      return newToken
    } finally {
      this.refreshTokenPromise = null
    }
  }

  private async _performTokenRefresh(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem('refreshToken')
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await axios.post(`${BASE_URL}${API_VERSION}/auth/refresh`, {
      refreshToken
    })

    const { accessToken, refreshToken: newRefreshToken } = response.data.data as AuthTokens
    
    await AsyncStorage.setItem('accessToken', accessToken)
    await AsyncStorage.setItem('refreshToken', newRefreshToken)
    
    return accessToken
  }

  // Authentication Methods
  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.client.post('/auth/register', data)
    
    if (response.data.success) {
      const { tokens } = response.data.data
      await this.storeTokens(tokens)
    }
    
    return response.data
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.client.post('/auth/login', credentials)
    
    if (response.data.success) {
      const { tokens } = response.data.data
      await this.storeTokens(tokens)
    }
    
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout')
    } catch {
      // Continue with local logout even if server request fails
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken'])
    }
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    const response = await this.client.post('/auth/forgot-password', { email })
    return response.data
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    await AsyncStorage.setItem('accessToken', tokens.accessToken)
    await AsyncStorage.setItem('refreshToken', tokens.refreshToken)
  }

  // User Profile Methods
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/users/me')
    return response.data
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.patch('/users/me', updates)
    return response.data
  }

  async updatePreferences(preferences: any): Promise<ApiResponse<void>> {
    const response = await this.client.put('/users/me/preferences', preferences)
    return response.data
  }

  async deleteAccount(): Promise<ApiResponse<void>> {
    const response = await this.client.delete('/users/me')
    await this.logout()
    return response.data
  }

  // Conversation Methods
  async startConversation(sessionType: string = 'general'): Promise<ApiResponse<ConversationSession>> {
    const response = await this.client.post('/conversations', { sessionType })
    return response.data
  }

  async sendMessage(sessionId: string, content: string, messageType: 'text' | 'voice' = 'text'): Promise<ApiResponse<{ userMessage: Message; aiResponse: AIResponse }>> {
    const response = await this.client.post(`/conversations/${sessionId}/messages`, {
      content,
      messageType
    })
    return response.data
  }

  async getConversationHistory(sessionId: string, page: number = 1, limit: number = 50): Promise<ApiResponse<Message[]>> {
    const response = await this.client.get(`/conversations/${sessionId}/messages`, {
      params: { page, limit }
    })
    return response.data
  }

  async getUserConversations(page: number = 1, limit: number = 20): Promise<ApiResponse<ConversationSession[]>> {
    const response = await this.client.get('/conversations', {
      params: { page, limit }
    })
    return response.data
  }

  async endConversation(sessionId: string, moodAfter?: number): Promise<ApiResponse<ConversationSession>> {
    const response = await this.client.patch(`/conversations/${sessionId}/end`, { moodAfter })
    return response.data
  }

  // Voice Message Methods
  async uploadVoiceMessage(sessionId: string, audioBlob: Blob): Promise<ApiResponse<{ userMessage: Message; aiResponse: AIResponse }>> {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'voice-message.wav')
    formData.append('sessionId', sessionId)

    const response = await this.client.post('/conversations/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    
    return response.data
  }

  // Mood Tracking Methods
  async recordMoodEntry(moodData: Omit<MoodEntry, 'id' | 'userId'>): Promise<ApiResponse<MoodEntry>> {
    const response = await this.client.post('/mood', moodData)
    return response.data
  }

  async getMoodHistory(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<MoodEntry[]>> {
    const response = await this.client.get('/mood', {
      params: { range: timeRange }
    })
    return response.data
  }

  async getMoodInsights(): Promise<ApiResponse<Insight[]>> {
    const response = await this.client.get('/mood/insights')
    return response.data
  }

  // Goals Methods
  async createGoal(goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Goal>> {
    const response = await this.client.post('/goals', goalData)
    return response.data
  }

  async getUserGoals(): Promise<ApiResponse<Goal[]>> {
    const response = await this.client.get('/goals')
    return response.data
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<ApiResponse<Goal>> {
    const response = await this.client.patch(`/goals/${goalId}`, updates)
    return response.data
  }

  async deleteGoal(goalId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/goals/${goalId}`)
    return response.data
  }

  async updateGoalProgress(goalId: string, progressPercentage: number): Promise<ApiResponse<Goal>> {
    const response = await this.client.patch(`/goals/${goalId}/progress`, { progressPercentage })
    return response.data
  }

  // Insights Methods
  async getUserInsights(type?: string): Promise<ApiResponse<Insight[]>> {
    const params = type ? { type } : {}
    const response = await this.client.get('/insights', { params })
    return response.data
  }

  async acknowledgeInsight(insightId: string): Promise<ApiResponse<void>> {
    const response = await this.client.patch(`/insights/${insightId}/acknowledge`)
    return response.data
  }

  async generateWeeklyReport(): Promise<ApiResponse<any>> {
    const response = await this.client.post('/insights/weekly-report')
    return response.data
  }

  // Crisis and Safety Methods
  async reportCrisis(details: {
    riskLevel: string
    description?: string
    immediateHelp: boolean
  }): Promise<ApiResponse<{ resources: any[]; supportContacts: any[] }>> {
    const response = await this.client.post('/safety/crisis', details)
    return response.data
  }

  async getCrisisResources(location?: { latitude: number; longitude: number }): Promise<ApiResponse<any[]>> {
    const response = await this.client.get('/safety/resources', {
      params: location ? { lat: location.latitude, lng: location.longitude } : {}
    })
    return response.data
  }

  async requestEmergencyContact(): Promise<ApiResponse<void>> {
    const response = await this.client.post('/safety/emergency-contact')
    return response.data
  }

  // Analytics Methods
  async getProgressMetrics(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<ApiResponse<any>> {
    const response = await this.client.get('/analytics/progress', {
      params: { range: timeRange }
    })
    return response.data
  }

  async getEngagementStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/analytics/engagement')
    return response.data
  }

  // Professional Integration Methods
  async shareWithTherapist(therapistEmail: string, dataTypes: string[]): Promise<ApiResponse<void>> {
    const response = await this.client.post('/professional/share', {
      therapistEmail,
      dataTypes
    })
    return response.data
  }

  async getSharedData(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/professional/shared-data')
    return response.data
  }

  async revokeTherapistAccess(accessId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/professional/access/${accessId}`)
    return response.data
  }

  // Export and Backup Methods
  async exportUserData(format: 'json' | 'csv' = 'json'): Promise<ApiResponse<{ downloadUrl: string }>> {
    const response = await this.client.post('/export/data', { format })
    return response.data
  }

  async requestDataDeletion(): Promise<ApiResponse<{ deletionId: string; scheduledDate: Date }>> {
    const response = await this.client.post('/export/delete-request')
    return response.data
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health')
      return response.status === 200
    } catch {
      return false
    }
  }
}

// Singleton instance
const apiService = new ApiService()

export default apiService

// Named exports for specific API functions
export {
    API_VERSION, ApiService,
    BASE_URL
}
