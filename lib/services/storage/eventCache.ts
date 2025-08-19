import { EventWithShares } from '@/lib/types/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 緩存配置
const CACHE_CONFIG = {
  maxCachedEvents: 500, // 最多緩存500個事件
  cacheKeyPrefix: 'event_cache_', // 緩存key前綴
  cacheExpirationMs: 5 * 60 * 1000, // 緩存5分鐘過期
  preloadMonths: 2, // 預加載前後2個月的數據
};

export interface EventCache {
  spaceId: string;
  events: EventWithShares[];
  lastUpdated: number;
  year: number;
  month: number;
  expandedEvents?: EventWithShares[]; // 緩存已擴展的重複事件
}

/**
 * 生成緩存鍵
 */
function getCacheKey(spaceId: string, year?: number, month?: number): string {
  const timeKey = year && month ? `${year}_${month}` : 'all';
  return `${CACHE_CONFIG.cacheKeyPrefix}${spaceId}_${timeKey}`;
}

/**
 * 保存事件緩存
 */
export async function saveEventCache(
  spaceId: string, 
  events: EventWithShares[], 
  year?: number, 
  month?: number,
  expandedEvents?: EventWithShares[]
): Promise<void> {
  try {
    const cacheKey = getCacheKey(spaceId, year, month);
    
    // 限制緩存大小，只保留最新的事件
    const eventsToCache = events.slice(-CACHE_CONFIG.maxCachedEvents);
    
    const cache: EventCache = {
      spaceId,
      events: eventsToCache,
      lastUpdated: Date.now(),
      year: year || 0,
      month: month || 0,
      expandedEvents,
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cache));
    console.log(`[EventCache] 已緩存 ${eventsToCache.length} 個事件 for space ${spaceId}`);
  } catch (error) {
    console.error('[EventCache] 保存緩存失敗:', error);
  }
}

/**
 * 讀取事件緩存
 */
export async function loadEventCache(
  spaceId: string, 
  year?: number, 
  month?: number
): Promise<EventCache | null> {
  try {
    const cacheKey = getCacheKey(spaceId, year, month);
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (!cachedData) {
      console.log(`[EventCache] 沒有找到緩存 for space ${spaceId}`);
      return null;
    }
    
    const cache: EventCache = JSON.parse(cachedData);
    
    // 檢查緩存是否過期
    if (isCacheExpired(cache)) {
      console.log(`[EventCache] 緩存已過期 for space ${spaceId}`);
      await clearEventCache(spaceId, year, month);
      return null;
    }
    
    console.log(`[EventCache] 加載了 ${cache.events.length} 個緩存事件 for space ${spaceId}`);
    return cache;
  } catch (error) {
    console.error('[EventCache] 讀取緩存失敗:', error);
    return null;
  }
}

/**
 * 檢查緩存是否過期
 */
export function isCacheExpired(cache: EventCache): boolean {
  return Date.now() - cache.lastUpdated > CACHE_CONFIG.cacheExpirationMs;
}

/**
 * 清除指定空間的緩存
 */
export async function clearEventCache(spaceId: string, year?: number, month?: number): Promise<void> {
  try {
    const cacheKey = getCacheKey(spaceId, year, month);
    await AsyncStorage.removeItem(cacheKey);
    console.log(`[EventCache] 已清除緩存 for space ${spaceId}`);
  } catch (error) {
    console.error('[EventCache] 清除緩存失敗:', error);
  }
}

/**
 * 清除所有事件緩存
 */
export async function clearAllEventCaches(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_CONFIG.cacheKeyPrefix));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log(`[EventCache] 已清除所有緩存，共 ${cacheKeys.length} 個`);
  } catch (error) {
    console.error('[EventCache] 清除所有緩存失敗:', error);
  }
}

/**
 * 預加載相鄰月份的事件數據
 */
export async function preloadAdjacentMonths(
  spaceId: string, 
  currentYear: number, 
  currentMonth: number,
  fetchFunction: (year: number, month: number) => Promise<EventWithShares[]>
): Promise<void> {
  const monthsToPreload = [
    { year: currentMonth === 1 ? currentYear - 1 : currentYear, month: currentMonth === 1 ? 12 : currentMonth - 1 },
    { year: currentMonth === 12 ? currentYear + 1 : currentYear, month: currentMonth === 12 ? 1 : currentMonth + 1 },
  ];

  const preloadPromises = monthsToPreload.map(async ({ year, month }) => {
    const existingCache = await loadEventCache(spaceId, year, month);
    if (!existingCache) {
      try {
        console.log(`[EventCache] 預加載 ${year}-${month} 的事件數據`);
        const events = await fetchFunction(year, month);
        await saveEventCache(spaceId, events, year, month);
      } catch (error) {
        console.warn(`[EventCache] 預加載 ${year}-${month} 失敗:`, error);
      }
    }
  });

  await Promise.allSettled(preloadPromises);
}

/**
 * 獲取緩存配置
 */
export const getCacheConfig = () => CACHE_CONFIG;

/**
 * 批量更新緩存（用於事件創建/更新/刪除後）
 */
export async function invalidateEventCaches(spaceIds: string[]): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter(key => 
      key.startsWith(CACHE_CONFIG.cacheKeyPrefix) && 
      spaceIds.some(spaceId => key.includes(spaceId))
    );
    
    await AsyncStorage.multiRemove(keysToRemove);
    console.log(`[EventCache] 已使 ${keysToRemove.length} 個緩存失效`);
  } catch (error) {
    console.error('[EventCache] 使緩存失效失敗:', error);
  }
}
