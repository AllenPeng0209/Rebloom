import { BailianMessage, sendBailianMessage } from '../lib/bailian'
import { supabase } from '../lib/supabase'

export interface DailySummary {
  id: string
  user_id: string
  summary_date: string
  conversation_count: number
  total_messages: number
  dominant_emotions: string[]
  emotion_intensity_avg: number
  mood_trend: 'improving' | 'stable' | 'declining' | 'mixed'
  psychological_insights: string
  therapeutic_observations?: string
  behavioral_patterns?: string
  coping_mechanisms_used: string[]
  personalized_recommendations: string
  suggested_activities: string[]
  mindfulness_exercises: string[]
  risk_indicators: string[]
  crisis_flags: boolean
  urgency_level: 'low' | 'medium' | 'high'
  progress_notes?: string
  goals_mentioned: string[]
  achievements: string[]
  challenges: string[]
  ai_confidence_score: number
  processing_model: string
  generation_timestamp: string
  created_at: string
  updated_at: string
}

export interface ConversationData {
  conversation_id: string
  messages: {
    role: 'user' | 'assistant'
    content: string
    created_at: string
  }[]
}

export class SummaryService {
  /**
   * 獲取用戶當日的所有對話數據
   */
  static async getTodayConversations(userId: string): Promise<ConversationData[]> {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    try {
      // 獲取今日的對話
      const { data: conversations, error: convError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${tomorrow}T00:00:00.000Z`)
      
      if (convError) {
        console.error('Error fetching conversations:', convError)
        return []
      }
      
      if (!conversations || conversations.length === 0) {
        return []
      }
      
      // 獲取每個對話的消息
      const conversationData: ConversationData[] = []
      
      for (const conv of conversations) {
        const { data: messages, error: msgError } = await supabase
          .from('chat_messages')
          .select('role, content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true })
        
        if (msgError) {
          console.error('Error fetching messages for conversation:', conv.id, msgError)
          continue
        }
        
        if (messages && messages.length > 0) {
          conversationData.push({
            conversation_id: conv.id,
            messages: messages
          })
        }
      }
      
      return conversationData
    } catch (error) {
      console.error('Error getting today conversations:', error)
      return []
    }
  }

  /**
   * 使用 AI 分析對話並生成專業心理師級別的總結
   */
  static async generatePsychologicalSummary(
    conversations: ConversationData[]
  ): Promise<Partial<DailySummary>> {
    if (conversations.length === 0) {
      return {
        conversation_count: 0,
        total_messages: 0,
        psychological_insights: '今日沒有對話記錄。建議保持定期的心理健康檢查和自我關懷。',
        personalized_recommendations: '嘗試進行一些放鬆活動，如深呼吸練習或輕柔的音樂冥想。',
        dominant_emotions: ['neutral'],
        mood_trend: 'stable',
        urgency_level: 'low',
        ai_confidence_score: 1.0
      }
    }

    // 統計基本數據
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0)
    const conversationCount = conversations.length

    // 準備對話內容給 AI 分析
    let conversationText = ''
    conversations.forEach((conv, index) => {
      conversationText += `\n=== 對話 ${index + 1} ===\n`
      conv.messages.forEach(msg => {
        conversationText += `${msg.role === 'user' ? '用戶' : 'AI助手'}: ${msg.content}\n`
      })
    })

    // 構建專業心理分析提示
    const analysisPrompt = `
作為一名專業心理諮商師，請分析以下用戶今日的對話記錄，提供深入的心理洞察和專業建議。

對話記錄：
${conversationText}

請提供以下分析，使用繁體中文回答：

1. **心理洞察** (psychological_insights)：
   - 分析用戶的情緒狀態、思維模式和心理需求
   - 識別潛在的心理議題或關注點
   - 評估用戶的應對機制和心理資源

2. **治療觀察** (therapeutic_observations)：
   - 從專業角度觀察用戶的表達方式和溝通模式
   - 識別可能的防禦機制或情緒調節策略
   - 評估治療關係和互動品質

3. **行為模式** (behavioral_patterns)：
   - 識別重複出現的行為或思維模式
   - 分析適應性和非適應性行為
   - 評估行為改變的可能性和方向

4. **個人化建議** (personalized_recommendations)：
   - 基於分析提供具體、可行的建議
   - 考慮用戶的個人特質和當前狀況
   - 提供階段性的改善策略

5. **主要情緒** (dominant_emotions)：列出2-4個主要情緒關鍵詞
6. **情緒強度** (emotion_intensity_avg)：評分0-1之間
7. **心情趨勢** (mood_trend)：improving/stable/declining/mixed之一
8. **應對機制** (coping_mechanisms_used)：列出觀察到的應對策略
9. **建議活動** (suggested_activities)：推薦3-5個具體活動
10. **正念練習** (mindfulness_exercises)：推薦2-3個適合的練習
11. **風險指標** (risk_indicators)：如有潛在風險請列出
12. **危機標記** (crisis_flags)：true/false
13. **緊急程度** (urgency_level)：low/medium/high
14. **提及的目標** (goals_mentioned)：用戶提到的目標或願望
15. **成就** (achievements)：用戶分享的正面經歷或進步
16. **挑戰** (challenges)：用戶面臨的困難或障礙

請以 JSON 格式回答，確保每個欄位都有適當的內容。
`

    try {
      const messages: BailianMessage[] = [
        {
          role: 'system',
          content: '你是一名專業的心理諮商師，擁有豐富的臨床經驗。請基於對話內容提供深入、專業且富有同理心的分析。'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ]

      const aiResponse = await sendBailianMessage(messages)
      console.log('AI Analysis Response:', aiResponse)

      // 嘗試解析 JSON 回應
      try {
        const analysis = JSON.parse(aiResponse)
        
        return {
          conversation_count: conversationCount,
          total_messages: totalMessages,
          psychological_insights: analysis.psychological_insights || '需要更多對話數據來進行深入分析。',
          therapeutic_observations: analysis.therapeutic_observations,
          behavioral_patterns: analysis.behavioral_patterns,
          personalized_recommendations: analysis.personalized_recommendations || '建議繼續保持開放的溝通和自我反思。',
          dominant_emotions: Array.isArray(analysis.dominant_emotions) ? analysis.dominant_emotions : ['neutral'],
          emotion_intensity_avg: typeof analysis.emotion_intensity_avg === 'number' ? analysis.emotion_intensity_avg : 0.5,
          mood_trend: ['improving', 'stable', 'declining', 'mixed'].includes(analysis.mood_trend) ? analysis.mood_trend : 'stable',
          coping_mechanisms_used: Array.isArray(analysis.coping_mechanisms_used) ? analysis.coping_mechanisms_used : [],
          suggested_activities: Array.isArray(analysis.suggested_activities) ? analysis.suggested_activities : [],
          mindfulness_exercises: Array.isArray(analysis.mindfulness_exercises) ? analysis.mindfulness_exercises : [],
          risk_indicators: Array.isArray(analysis.risk_indicators) ? analysis.risk_indicators : [],
          crisis_flags: Boolean(analysis.crisis_flags),
          urgency_level: ['low', 'medium', 'high'].includes(analysis.urgency_level) ? analysis.urgency_level : 'low',
          goals_mentioned: Array.isArray(analysis.goals_mentioned) ? analysis.goals_mentioned : [],
          achievements: Array.isArray(analysis.achievements) ? analysis.achievements : [],
          challenges: Array.isArray(analysis.challenges) ? analysis.challenges : [],
          ai_confidence_score: 0.85,
          processing_model: 'qwen-turbo'
        }
      } catch (parseError) {
        console.error('Error parsing AI response as JSON:', parseError)
        
        // 如果 JSON 解析失敗，使用文本回應創建基本總結
        return {
          conversation_count: conversationCount,
          total_messages: totalMessages,
          psychological_insights: aiResponse.slice(0, 1000), // 截取前1000字符
          personalized_recommendations: '基於今日的對話，建議繼續保持積極的溝通和自我關懷。',
          dominant_emotions: ['mixed'],
          mood_trend: 'stable',
          urgency_level: 'low',
          ai_confidence_score: 0.6,
          processing_model: 'qwen-turbo'
        }
      }
    } catch (error) {
      console.error('Error generating AI summary:', error)
      
      // 如果 AI 分析失敗，提供基本總結
      return {
        conversation_count: conversationCount,
        total_messages: totalMessages,
        psychological_insights: `今日進行了 ${conversationCount} 次對話，共 ${totalMessages} 條消息。建議繼續保持定期的心理健康對話。`,
        personalized_recommendations: '繼續保持開放的溝通，關注自己的情緒變化，必要時尋求專業支持。',
        dominant_emotions: ['neutral'],
        mood_trend: 'stable',
        urgency_level: 'low',
        ai_confidence_score: 0.3,
        processing_model: 'fallback'
      }
    }
  }

  /**
   * 保存每日總結到數據庫
   */
  static async saveDailySummary(
    userId: string,
    summaryData: Partial<DailySummary>
  ): Promise<DailySummary | null> {
    const today = new Date().toISOString().split('T')[0]
    
    try {
      const { data, error } = await supabase
        .from('daily_summaries')
        .upsert({
          user_id: userId,
          summary_date: today,
          ...summaryData,
          generation_timestamp: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error saving daily summary:', error)
        return null
      }
      
      return data as DailySummary
    } catch (error) {
      console.error('Error in saveDailySummary:', error)
      return null
    }
  }

  /**
   * 獲取用戶的每日總結
   */
  static async getDailySummary(
    userId: string,
    date?: string
  ): Promise<DailySummary | null> {
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    try {
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', userId)
        .eq('summary_date', targetDate)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        console.error('Error fetching daily summary:', error)
        return null
      }
      
      return data as DailySummary
    } catch (error) {
      console.error('Error in getDailySummary:', error)
      return null
    }
  }

  /**
   * 獲取用戶最近的總結列表
   */
  static async getRecentSummaries(
    userId: string,
    limit: number = 7
  ): Promise<DailySummary[]> {
    try {
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', userId)
        .order('summary_date', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('Error fetching recent summaries:', error)
        return []
      }
      
      return data as DailySummary[]
    } catch (error) {
      console.error('Error in getRecentSummaries:', error)
      return []
    }
  }

  /**
   * 執行每日總結生成（主要功能）
   */
  static async generateDailySummary(userId: string): Promise<DailySummary | null> {
    console.log('開始生成每日總結 for user:', userId)
    
    try {
      // 1. 獲取今日對話數據
      const conversations = await this.getTodayConversations(userId)
      console.log('找到對話數量:', conversations.length)
      
      // 2. 使用 AI 分析生成總結
      const summaryData = await this.generatePsychologicalSummary(conversations)
      console.log('AI 分析完成')
      
      // 3. 保存到數據庫
      const savedSummary = await this.saveDailySummary(userId, summaryData)
      console.log('總結已保存到數據庫')
      
      return savedSummary
    } catch (error) {
      console.error('Error generating daily summary:', error)
      return null
    }
  }
}
