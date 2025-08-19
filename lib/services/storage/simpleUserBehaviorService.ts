import { Json } from './database.types';
import { supabase } from './supabase';

export interface UserBehaviorRecord {
  id?: string;
  user_id: string;
  event_type: 'chat_query' | 'recommendation_click' | 'booking_success' | 'item_rating' | 'preference_update';
  event_data: Json;
  timestamp?: string;
}

export class SimpleUserBehaviorService {
  private static instance: SimpleUserBehaviorService;

  static getInstance(): SimpleUserBehaviorService {
    if (!SimpleUserBehaviorService.instance) {
      SimpleUserBehaviorService.instance = new SimpleUserBehaviorService();
    }
    return SimpleUserBehaviorService.instance;
  }

  async recordBehavior(record: Omit<UserBehaviorRecord, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_behavior_summary')
        .insert({
          user_id: record.user_id,
          event_type: record.event_type,
          event_data: record.event_data,
        });

      if (error) {
        console.error('記錄用戶行為失敗:', error);
      }
    } catch (error) {
      console.error('記錄用戶行為錯誤:', error);
    }
  }

  async getUserBehaviorSummary(userId: string, limit: number = 100): Promise<UserBehaviorRecord[]> {
    try {
      const { data, error } = await supabase
        .from('user_behavior_summary')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('獲取用戶行為摘要失敗:', error);
        return [];
      }
      return (data as any[])?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        event_type: item.event_type,
        event_data: item.event_data,
        timestamp: item.timestamp
      })) || [];
    } catch (error) {
      console.error('獲取用戶行為摘要錯誤:', error);
      return [];
    }
  }

  async getPreferenceKeywords(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_behavior_summary')
        .select('event_data')
        .eq('user_id', userId)
        .eq('event_type', 'preference_update');

      if (error) {
        console.error('獲取偏好關鍵詞失敗:', error);
        return [];
      }

      const keywords = (data as any[])?.map(record => {
        const eventData = record.event_data as any;
        return eventData?.preference_keywords || [];
      }).flat() || [];
      
      return [...new Set(keywords)];
    } catch (error) {
      console.error('獲取偏好關鍵詞錯誤:', error);
      return [];
    }
  }

  async getBookingHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_behavior_summary')
        .select('event_data')
        .eq('user_id', userId)
        .eq('event_type', 'booking_success');

      if (error) {
        console.error('獲取預訂歷史失敗:', error);
        return [];
      }

      return (data as any[])?.map(record => {
        const eventData = record.event_data as any;
        return eventData?.booking_details || {};
      }) || [];
    } catch (error) {
      console.error('獲取預訂歷史錯誤:', error);
      return [];
    }
  }

  async getRatingHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_behavior_summary')
        .select('event_data')
        .eq('user_id', userId)
        .eq('event_type', 'item_rating');

      if (error) {
        console.error('獲取評分歷史失敗:', error);
        return [];
      }

      return (data as any[])?.map(record => {
        const eventData = record.event_data as any;
        return {
          item_id: eventData?.item_id,
          rating: eventData?.rating,
          item_type: eventData?.item_type,
        };
      }).filter(item => item.item_id) || [];
    } catch (error) {
      console.error('獲取評分歷史錯誤:', error);
      return [];
    }
  }

  async getRecentQueries(userId: string, limit: number = 10): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_behavior_summary')
        .select('event_data')
        .eq('user_id', userId)
        .eq('event_type', 'chat_query')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('獲取最近查詢失敗:', error);
        return [];
      }

      return (data as any[])?.map(record => {
        const eventData = record.event_data as any;
        return eventData?.query || '';
      }).filter(query => query) || [];
    } catch (error) {
      console.error('獲取最近查詢錯誤:', error);
      return [];
    }
  }

  // 生成給 AI 的行為摘要
  async generateBehaviorSummaryForAI(userId: string): Promise<string> {
    try {
      const [preferences, bookings, ratings, queries] = await Promise.all([
        this.getPreferenceKeywords(userId),
        this.getBookingHistory(userId),
        this.getRatingHistory(userId),
        this.getRecentQueries(userId, 5)
      ]);

      let summary = '用戶行為摘要：\n';
      
      if (preferences.length > 0) {
        summary += `偏好關鍵詞：${preferences.join(', ')}\n`;
      }
      
      if (bookings.length > 0) {
        summary += `最近預訂：${bookings.slice(0, 3).map(b => b.name || b.title).join(', ')}\n`;
      }
      
      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;
        summary += `平均評分：${avgRating.toFixed(1)}/5\n`;
      }
      
      if (queries.length > 0) {
        summary += `最近查詢：${queries.slice(0, 3).join(', ')}\n`;
      }

      return summary || '無歷史行為記錄。';
    } catch (error) {
      console.error('生成 AI 行為摘要錯誤:', error);
      return '無法獲取用戶行為摘要。';
    }
  }
}

export const simpleUserBehaviorService = SimpleUserBehaviorService.getInstance();