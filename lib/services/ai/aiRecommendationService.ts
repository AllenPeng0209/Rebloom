import { sendBailianMessage } from './bailian';
import { japanLocalService } from './japanLocalServices';
import { simpleUserBehaviorService } from './simpleUserBehaviorService';

export interface AIRecommendationRequest {
  userId: string;
  userQuery: string;
  intent: 'restaurant' | 'activity' | 'event' | 'general';
  location?: { latitude: number; longitude: number };
  timeSlot?: 'morning' | 'afternoon' | 'evening';
}

export interface RecommendationItem {
  id: string;
  name: string;
  title: string;
  type: string;
  description: string;
  rating: number;
  price: string;
  location: string;
  distance: number;
  bookingUrl?: string;
  photos: string[];
  aiReason: string;
  reasons: string[];
}

export interface AIRecommendationResult {
  recommendations: RecommendationItem[];
  aiExplanation: string;
  searchKeywords: string[];
}

export class AIRecommendationService {
  private static instance: AIRecommendationService;

  static getInstance(): AIRecommendationService {
    if (!AIRecommendationService.instance) {
      AIRecommendationService.instance = new AIRecommendationService();
    }
    return AIRecommendationService.instance;
  }

  async getAIRecommendations(request: AIRecommendationRequest): Promise<AIRecommendationResult> {
    try {
      // 1. 獲取用戶行為總結
      const behaviorSummary = await simpleUserBehaviorService.generateBehaviorSummaryForAI(request.userId);
      
      // 2. 構建 AI Prompt
      const aiPrompt = this.buildAIPrompt(request, behaviorSummary);
      
      // 3. 調用大模型分析用戶需求
      const aiAnalysis = await this.getAIAnalysis(aiPrompt);
      
      // 4. 根據 AI 分析結果搜索相關服務
      const searchResults = await this.performSearch(aiAnalysis, request.location);
      
      // 5. 讓 AI 篩選和排序結果
      const finalRecommendations = await this.getAIFilteredRecommendations(
        request, 
        behaviorSummary, 
        searchResults
      );

      // 6. 記錄推薦行為
      await this.recordRecommendationBehavior(request.userId, request.userQuery, finalRecommendations);

      return finalRecommendations;
    } catch (error) {
      console.error('AI 推薦服務錯誤:', error);
      return {
        recommendations: [],
        aiExplanation: '抱歉，目前無法生成推薦。請稍後再試。',
        searchKeywords: []
      };
    }
  }

  private buildAIPrompt(request: AIRecommendationRequest, behaviorSummary: string): string {
    const locationInfo = request.location 
      ? `用戶位置：緯度 ${request.location.latitude}, 經度 ${request.location.longitude}`
      : '用戶位置未知';
    
    const timeInfo = request.timeSlot ? `時間偏好：${request.timeSlot}` : '';

    return `你是一個專業的日本本地生活推薦助手。請根據以下信息分析用戶需求並生成搜索策略：

【用戶查詢】
${request.userQuery}

【用戶行為歷史】
${behaviorSummary}

【上下文信息】
${locationInfo}
${timeInfo}
推薦意圖：${request.intent}

請分析用戶需求並返回 JSON 格式的搜索策略：
{
  "searchKeywords": ["關鍵詞1", "關鍵詞2"],
  "searchIntent": "restaurant|activity|event",
  "preferences": {
    "priceRange": "低|中|高",
    "distance": "近|中|遠",
    "rating": ">=4.0"
  },
  "explanation": "分析說明"
}`;
  }

  private async getAIAnalysis(prompt: string): Promise<any> {
    try {
      const response = await sendBailianMessage([
        { role: 'system', content: prompt },
        { role: 'user', content: '請分析並返回JSON格式的搜索策略' }
      ]);
      return JSON.parse(response);
    } catch (error) {
      console.error('AI 分析失敗:', error);
      return {
        searchKeywords: [],
        searchIntent: 'general',
        preferences: {},
        explanation: '無法分析用戶需求'
      };
    }
  }

  private async performSearch(aiAnalysis: any, location?: { latitude: number; longitude: number }): Promise<any[]> {
    try {
      const { searchKeywords, searchIntent } = aiAnalysis;
      const query = searchKeywords.join(' ');
      
      let results: any[] = [];

      switch (searchIntent) {
        case 'restaurant':
          results = await japanLocalService.searchRestaurants({
            location: location,
            query: query,
          });
          break;
        case 'event':
          results = await japanLocalService.searchEvents({
            keyword: query,
          });
          break;
        default:
          // 混合搜索
          const [restaurants, events] = await Promise.all([
            japanLocalService.searchRestaurants({
              location: location,
              query: query,
            }),
            japanLocalService.searchEvents({
              keyword: query,
            })
          ]);
          results = [...restaurants, ...events];
          break;
      }

      return results;
    } catch (error) {
      console.error('搜索失敗:', error);
      return [];
    }
  }

  private async getAIFilteredRecommendations(
    request: AIRecommendationRequest,
    behaviorSummary: string,
    searchResults: any[]
  ): Promise<AIRecommendationResult> {
    try {
      const filterPrompt = `根據用戶需求和搜索結果，請選擇最合適的推薦項目：

【用戶查詢】
${request.userQuery}

【用戶行為歷史】
${behaviorSummary}

【搜索結果】
${JSON.stringify(searchResults.slice(0, 10), null, 2)}

請返回 JSON 格式的最終推薦：
{
  "recommendations": [
    {
      "id": "結果ID",
      "name": "名稱",
      "type": "restaurant|activity|event",
      "description": "描述",
      "rating": 4.5,
      "price": "價格信息",
      "location": "地址",
      "bookingUrl": "預訂連結",
      "photos": ["圖片URL"],
      "aiReason": "推薦理由"
    }
  ],
  "aiExplanation": "整體推薦說明",
  "searchKeywords": ["使用的關鍵詞"]
}

請選擇 3-5 個最相關的推薦項目。`;

      const response = await sendBailianMessage([
        { role: 'system', content: filterPrompt },
        { role: 'user', content: '請返回JSON格式的最終推薦' }
      ]);
      return JSON.parse(response);
    } catch (error) {
      console.error('AI 篩選失敗:', error);
      return {
        recommendations: [],
        aiExplanation: '無法處理搜索結果，請稍後再試。',
        searchKeywords: []
      };
    }
  }

  private async recordRecommendationBehavior(
    userId: string, 
    query: string, 
    recommendations: AIRecommendationResult
  ): Promise<void> {
    try {
      await simpleUserBehaviorService.recordBehavior({
        user_id: userId,
        event_type: 'chat_query',
        event_data: {
          query,
          recommendation_count: recommendations.recommendations.length,
          keywords: recommendations.searchKeywords,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('記錄推薦行為失敗:', error);
    }
  }

  // 記錄用戶與推薦項目的互動
  async recordRecommendationInteraction(
    userId: string,
    recommendationId: string,
    action: 'click' | 'book' | 'rate',
    data?: any
  ): Promise<void> {
    try {
      let eventType: 'recommendation_click' | 'booking_success' | 'item_rating';
      
      switch (action) {
        case 'click':
          eventType = 'recommendation_click';
          break;
        case 'book':
          eventType = 'booking_success';
          break;
        case 'rate':
          eventType = 'item_rating';
          break;
      }

      await simpleUserBehaviorService.recordBehavior({
        user_id: userId,
        event_type: eventType,
        event_data: {
          recommendation_id: recommendationId,
          action,
          ...data,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('記錄推薦互動失敗:', error);
    }
  }
}

export const aiRecommendationService = AIRecommendationService.getInstance();