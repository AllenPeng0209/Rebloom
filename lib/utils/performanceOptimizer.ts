import { EventWithShares } from '@/lib/types/database.types';

// 性能優化配置
const PERFORMANCE_CONFIG = {
  maxCachedMonths: 3, // 最多緩存3個月的數據
  eventBatchSize: 50, // 分批處理事件數量
  debounceDelay: 300, // 防抖延遲時間
  memoryThreshold: 100, // 內存使用閾值（MB）
};

/**
 * 防抖函數 - 用於優化頻繁的用戶操作
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = PERFORMANCE_CONFIG.debounceDelay
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 節流函數 - 用於限制函數執行頻率
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 1000
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 分批處理大量數據 - 避免阻塞UI
 */
export async function processBatches<T, R>(
  data: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = PERFORMANCE_CONFIG.eventBatchSize
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
    
    // 讓出控制權給UI線程
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
}

/**
 * 優化事件數據結構 - 移除不必要的屬性
 */
export function optimizeEventData(events: EventWithShares[]): EventWithShares[] {
  return events.map(event => {
    // 只保留必要的屬性，減少內存使用
    const optimizedEvent: EventWithShares = {
      id: event.id,
      title: event.title,
      description: event.description,
      start_ts: event.start_ts,
      end_ts: event.end_ts,
      location: event.location,
      color: event.color,
      creator_id: event.creator_id,
      family_id: event.family_id,
      type: event.type,
      is_shared: event.is_shared,
      shared_families: event.shared_families,
      attendees: event.attendees,
      recurrence_rule: event.recurrence_rule,
      parent_event_id: event.parent_event_id,
      created_at: event.created_at,
      updated_at: event.updated_at,
      image_urls: event.image_urls,
      recurrence_end_date: event.recurrence_end_date,
      recurrence_count: event.recurrence_count,
    };
    
    return optimizedEvent;
  });
}

/**
 * 檢查內存使用情況（僅在開發環境）
 */
export function checkMemoryUsage(): void {
  if (__DEV__) {
    // React Native 沒有直接的內存API，使用性能標記
    if (global.performance && global.performance.memory) {
      const memory = (global.performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      
      console.log(`[Performance] 內存使用: ${usedMB}MB / ${totalMB}MB`);
      
      if (usedMB > PERFORMANCE_CONFIG.memoryThreshold) {
        console.warn(`[Performance] 內存使用過高: ${usedMB}MB`);
      }
    }
  }
}

/**
 * 清理過期的緩存數據
 */
export function cleanupExpiredCache(
  cacheData: Map<string, { data: any; timestamp: number }>,
  maxAge: number = 5 * 60 * 1000 // 5分鐘
): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  cacheData.forEach((value, key) => {
    if (now - value.timestamp > maxAge) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    cacheData.delete(key);
  });
  
  if (keysToDelete.length > 0) {
    console.log(`[Performance] 清理了 ${keysToDelete.length} 個過期緩存項`);
  }
}

/**
 * 創建一個內存友好的LRU緩存
 */
export class LRUCache<T> {
  private cache = new Map<string, T>();
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }
  
  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 重新插入以更新LRU順序
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 刪除最舊的項目
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

/**
 * 事件數據預處理 - 優化渲染性能
 */
export function preprocessEventsForRendering(events: EventWithShares[]): EventWithShares[] {
  return events.map(event => ({
    ...event,
    // 預計算常用的顯示屬性
    displayTime: new Date(event.start_ts * 1000).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    displayDate: new Date(event.start_ts * 1000).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    }),
    isToday: isSameDay(new Date(event.start_ts * 1000), new Date()),
  }));
}

/**
 * 檢查兩個日期是否為同一天
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 創建性能監控器
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private startTimes = new Map<string, number>();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  start(label: string): void {
    this.startTimes.set(label, Date.now());
  }
  
  end(label: string): number {
    const startTime = this.startTimes.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.startTimes.delete(label);
      
      if (__DEV__) {
        console.log(`[Performance] ${label}: ${duration}ms`);
      }
      
      return duration;
    }
    return 0;
  }
  
  measure<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      const result = fn();
      return result;
    } finally {
      this.end(label);
    }
  }
  
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(label);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
