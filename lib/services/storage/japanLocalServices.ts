import { getCurrentLocation } from './location';

// 日本本地生活平台 API 接口定義
export interface Location {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: string;
  name: string;
  genre: string;
  address: string;
  rating: number;
  budget: string;
  openNow: boolean;
  distance: number;
  photos: string[];
  source: 'hotpepper' | 'gnavi' | 'tabelog';
  bookingUrl?: string;
  phone?: string;
}

export interface Activity {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  rating: number;
  photos: string[];
  availableDates: string[];
  source: 'asoview' | 'activityjapan' | 'sotoasobi';
  bookingUrl: string;
  isKidFriendly: boolean;
  isOutdoor: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  category: string;
  fee: number;
  capacity: number;
  attendeeCount: number;
  source: 'connpass' | 'doorkeeper' | 'peatix';
  registrationUrl: string;
  tags: string[];
}

export interface Accommodation {
  id: string;
  name: string;
  type: string;
  address: string;
  rating: number;
  pricePerNight: number;
  photos: string[];
  amenities: string[];
  source: 'jalan' | 'rakuten';
  bookingUrl: string;
  availability: boolean;
}

// Hot Pepper Gourmet API
export class HotPepperService {
  private apiKey: string;
  private baseUrl = 'http://webservice.recruit.co.jp/hotpepper/gourmet/v1/';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchRestaurants(params: {
    lat?: number;
    lng?: number;
    genre?: string;
    budget?: string;
    openNow?: boolean;
    radius?: number;
    count?: number;
  }): Promise<Restaurant[]> {
    try {
      const queryParams = new URLSearchParams({
        key: this.apiKey,
        format: 'json',
        count: (params.count || 20).toString(),
        ...(params.lat && { lat: params.lat.toString() }),
        ...(params.lng && { lng: params.lng.toString() }),
        ...(params.genre && { genre: params.genre }),
        ...(params.budget && { budget: params.budget }),
        ...(params.radius && { range: params.radius.toString() }),
      });

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      const data = await response.json();

      return data.results?.shop?.map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        genre: shop.genre.name,
        address: shop.address,
        rating: parseFloat(shop.rating || '0'),
        budget: shop.budget.name,
        openNow: shop.open === '1',
        distance: 0, // 需要計算
        photos: [shop.photo.pc.l],
        source: 'hotpepper' as const,
        bookingUrl: shop.urls.pc,
        phone: shop.tel,
      })) || [];
    } catch (error) {
      console.error('Hot Pepper API error:', error);
      return [];
    }
  }
}

// ぐるなび API
export class GnaviService {
  private apiKey: string;
  private baseUrl = 'https://api.gnavi.co.jp/RestSearchAPI/v3/';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchRestaurants(params: {
    lat?: number;
    lng?: number;
    freeword?: string;
    seatAvailable?: boolean;
    radius?: number;
    hit_per_page?: number;
  }): Promise<Restaurant[]> {
    try {
      const queryParams = new URLSearchParams({
        keyid: this.apiKey,
        format: 'json',
        hit_per_page: (params.hit_per_page || 20).toString(),
        ...(params.lat && { latitude: params.lat.toString() }),
        ...(params.lng && { longitude: params.lng.toString() }),
        ...(params.freeword && { freeword: params.freeword }),
        ...(params.radius && { range: params.radius.toString() }),
      });

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      const data = await response.json();

      return data.rest?.map((restaurant: any) => ({
        id: restaurant.id,
        name: restaurant.name,
        genre: restaurant.category,
        address: restaurant.address,
        rating: parseFloat(restaurant.rating || '0'),
        budget: restaurant.budget || 'N/A',
        openNow: true, // 需要檢查營業時間
        distance: 0,
        photos: [restaurant.image_url.shop_image1],
        source: 'gnavi' as const,
        bookingUrl: restaurant.url,
        phone: restaurant.tel,
      })) || [];
    } catch (error) {
      console.error('Gnavi API error:', error);
      return [];
    }
  }
}

// Yahoo! JAPAN YOLP 本地搜索
export class YolpService {
  private appId: string;
  private baseUrl = 'https://map.yahooapis.jp/search/local/V1/localSearch';

  constructor(appId: string) {
    this.appId = appId;
  }

  async localSearch(params: {
    lat: number;
    lng: number;
    query?: string;
    gc?: string; // 業種碼
    radius?: number;
    results?: number;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams({
        appid: this.appId,
        output: 'json',
        lat: params.lat.toString(),
        lon: params.lng.toString(),
        results: (params.results || 20).toString(),
        ...(params.query && { query: params.query }),
        ...(params.gc && { gc: params.gc }),
        ...(params.radius && { dist: params.radius.toString() }),
      });

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      const data = await response.json();

      return data.Feature || [];
    } catch (error) {
      console.error('YOLP API error:', error);
      return [];
    }
  }
}

// connpass API
export class ConnpassService {
  private baseUrl = 'https://connpass.com/api/v1/event/';

  async searchEvents(params: {
    keyword?: string;
    ym?: string; // YYYYMM
    area?: string;
    count?: number;
  }): Promise<Event[]> {
    try {
      const queryParams = new URLSearchParams({
        count: (params.count || 20).toString(),
        ...(params.keyword && { keyword: params.keyword }),
        ...(params.ym && { ym: params.ym }),
        ...(params.area && { area: params.area }),
      });

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      const data = await response.json();

      return data.events?.map((event: any) => ({
        id: event.event_id.toString(),
        title: event.title,
        description: event.description,
        startDate: event.started_at,
        endDate: event.ended_at,
        venue: event.place,
        category: event.series?.title || 'General',
        fee: event.fee || 0,
        capacity: event.limit,
        attendeeCount: event.accepted,
        source: 'connpass' as const,
        registrationUrl: event.event_url,
        tags: event.hash_tag ? [event.hash_tag] : [],
      })) || [];
    } catch (error) {
      console.error('Connpass API error:', error);
      return [];
    }
  }
}

// 統一的日本本地服務管理器
export class JapanLocalServiceManager {
  private hotPepper?: HotPepperService;
  private gnavi?: GnaviService;
  private yolp?: YolpService;
  private connpass: ConnpassService;

  constructor(config: {
    hotPepperKey?: string;
    gnaviKey?: string;
    yolpAppId?: string;
  }) {
    if (config.hotPepperKey) {
      this.hotPepper = new HotPepperService(config.hotPepperKey);
    }
    if (config.gnaviKey) {
      this.gnavi = new GnaviService(config.gnaviKey);
    }
    if (config.yolpAppId) {
      this.yolp = new YolpService(config.yolpAppId);
    }
    this.connpass = new ConnpassService();
  }

  // 綜合餐廳搜索
  async searchRestaurants(params: {
    location?: Location;
    query?: string;
    genre?: string;
    budget?: string;
    radius?: number;
  }): Promise<Restaurant[]> {
    const location = params.location || await getCurrentLocation();
    if (!location) return [];

    const results: Restaurant[] = [];

    // 並行查詢多個平台
    const promises: Promise<Restaurant[]>[] = [];

    if (this.hotPepper) {
      promises.push(this.hotPepper.searchRestaurants({
        lat: location.latitude,
        lng: location.longitude,
        genre: params.genre,
        budget: params.budget,
        radius: params.radius,
      }));
    }

    if (this.gnavi) {
      promises.push(this.gnavi.searchRestaurants({
        lat: location.latitude,
        lng: location.longitude,
        freeword: params.query,
        radius: params.radius,
      }));
    }

    try {
      const allResults = await Promise.all(promises);
      allResults.forEach(platformResults => {
        results.push(...platformResults);
      });

      // 去重和排序
      return this.deduplicateAndSort(results, location);
    } catch (error) {
      console.error('Restaurant search error:', error);
      return [];
    }
  }

  // 活動搜索
  async searchEvents(params: {
    keyword?: string;
    area?: string;
    month?: string;
  }): Promise<Event[]> {
    try {
      return await this.connpass.searchEvents({
        keyword: params.keyword,
        area: params.area,
        ym: params.month,
      });
    } catch (error) {
      console.error('Event search error:', error);
      return [];
    }
  }

  // 本地POI搜索
  async searchLocalPOI(params: {
    location?: Location;
    query: string;
    category?: string;
    radius?: number;
  }): Promise<any[]> {
    const location = params.location || await getCurrentLocation();
    if (!location || !this.yolp) return [];

    try {
      return await this.yolp.localSearch({
        lat: location.latitude,
        lng: location.longitude,
        query: params.query,
        gc: params.category,
        radius: params.radius,
      });
    } catch (error) {
      console.error('Local POI search error:', error);
      return [];
    }
  }

  // 去重和排序邏輯
  private deduplicateAndSort(results: Restaurant[], userLocation: Location): Restaurant[] {
    // 簡單去重邏輯（基於名稱和地址相似度）
    const uniqueResults = results.filter((restaurant, index, self) =>
      index === self.findIndex(r => 
        r.name === restaurant.name && 
        r.address.includes(restaurant.address.split(' ')[0])
      )
    );

    // 計算距離並排序
    return uniqueResults
      .map(restaurant => ({
        ...restaurant,
        distance: this.calculateDistance(userLocation, restaurant),
      }))
      .sort((a, b) => {
        // 綜合評分：距離 + 評分 + 是否營業
        const scoreA = (a.rating * 2) - (a.distance * 0.1) + (a.openNow ? 1 : 0);
        const scoreB = (b.rating * 2) - (b.distance * 0.1) + (b.openNow ? 1 : 0);
        return scoreB - scoreA;
      });
  }

  // 簡單距離計算（公里）
  private calculateDistance(location1: Location, restaurant: Restaurant): number {
    // 這裡需要實現距離計算邏輯
    // 暫時返回隨機值作為示例
    return Math.random() * 10;
  }
}

// 預設配置
export const japanLocalService = new JapanLocalServiceManager({
  // 這些 API Key 需要在環境變量中設置
  hotPepperKey: process.env.EXPO_PUBLIC_HOTPEPPER_API_KEY,
  gnaviKey: process.env.EXPO_PUBLIC_GNAVI_API_KEY,
  yolpAppId: process.env.EXPO_PUBLIC_YOLP_APP_ID,
});
