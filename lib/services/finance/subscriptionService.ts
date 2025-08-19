import { Alert, NativeModules, Platform } from 'react-native';
import {
  clearProductsIOS,
  clearTransactionIOS,
  endConnection,
  finishTransaction,
  getAvailablePurchases,
  getSubscriptions,
  initConnection,
  Purchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
  Subscription
} from 'react-native-iap';
import { t } from './i18n';
import { supabase } from './supabase';

// 訂閱方案類型
export interface SubscriptionPlan {
  id: string;
  productId: string;
  name: string;
  price: string;
  period: 'monthly' | 'yearly';
  features: string[];
}

// 訂閱狀態類型
export interface SubscriptionStatus {
  isActive: boolean;
  plan?: SubscriptionPlan;
  expirationDate?: Date;
  isTrialActive: boolean;
  trialEndDate?: Date;
  originalTransactionId?: string;
}

// 訂閱方案配置
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    productId: 'com.agenthub.konkon.premium.monthly',
    name: '月付方案',
    price: '$2.99',
    period: 'monthly',
    features: [
      '無限AI對話次數',
      '高級AI功能',
      '語音轉文字無限制',
      '照片識別無限制',
      '專屬客服支持',
      '無廣告體驗'
    ]
  },
  {
    id: 'yearly',
    productId: 'com.agenthub.konkon.premium.yearly',
    name: '年付方案',
    price: '$29.99',
    period: 'yearly',
    features: [
      '無限AI對話次數',
      '高級AI功能',
      '語音轉文字無限制',
      '照片識別無限制',
      '專屬客服支持',
      '無廣告體驗',
      '節省約2個月費用'
    ]
  }
];

// 全員限時會員大放送：至 2025-10-31 23:59:59 UTC
const PROMO_END_DATE = new Date('2025-10-31T23:59:59Z');

class SubscriptionService {
  private currentStatus: SubscriptionStatus = {
    isActive: false,
    isTrialActive: false
  };

  private statusListeners: ((status: SubscriptionStatus) => void)[] = [];
  private availableProducts: Subscription[] = [];
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private isInitialized = false;
  private isInitializing = false;

  /**
   * 檢查 IAP 原生模組是否可用（Expo Go/缺少原生模組時返回 false）
   */
  private isIapNativeAvailable(): boolean {
    const natives: any = NativeModules as any;
    return !!(natives?.RNIapIos || natives?.RNIapModule);
  }

  /**
   * 初始化訂閱服務
   */
  async initialize(): Promise<void> {
    // 防止重複初始化
    if (this.isInitialized || this.isInitializing) {
      console.log('📋 訂閱服務已初始化或正在初始化中');
      return;
    }

    this.isInitializing = true;

    try {
      if (Platform.OS === 'ios') {
        // 若 IAP 原生模組不可用（多發生於 Expo Go），直接跳過
        if (!this.isIapNativeAvailable()) {
          console.warn('⚠️ IAP 原生模組不可用（可能在 Expo Go 或未包含原生依賴），跳過初始化');
          this.isInitializing = false;
          return;
        }
        console.log('🚀 開始 iOS StoreKit 初始化...');
        
        // 檢查是否在 Expo Go 或開發環境
        const isExpoGo = __DEV__ && typeof expo !== 'undefined';
        if (isExpoGo) {
          console.log('🧪 在 Expo Go 環境中，跳過 StoreKit 初始化');
          this.isInitializing = false;
          return;
        }
        
        // 清理舊的產品和交易（僅在需要時）
        console.log('🧹 嘗試清理舊的產品和交易...');
        try {
          await clearProductsIOS();
          await clearTransactionIOS();
          console.log('✅ 舊產品和交易清理完成');
        } catch (clearError) {
          console.warn('⚠️ 清理步驟失敗，但繼續初始化:', clearError);
        }
        
        // 初始化連接 - 添加超時保護
        console.log('🔗 初始化 StoreKit 連接...');
        try {
          const connectionPromise = initConnection();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          );
          
          const connectionResult = await Promise.race([connectionPromise, timeoutPromise]);
          console.log('✅ StoreKit 連接結果:', connectionResult);
        } catch (connectionError) {
          console.warn('⚠️ StoreKit 連接失敗:', connectionError);
          // 在 TestFlight 中也可能出現連接問題，優雅降級
          this.isInitializing = false;
          return;
        }
        
        // 設置購買監聽器
        console.log('👂 設置購買監聽器...');
        this.setupPurchaseListeners();
        
        // 載入可用產品 - 添加錯誤處理
        console.log('📦 載入可用產品...');
        try {
          await this.loadAvailableProducts();
        } catch (productError) {
          console.warn('⚠️ 載入產品失敗:', productError);
          // 不阻止初始化完成
        }
        
        // 載入訂閱狀態 - 添加錯誤處理
        console.log('📊 載入訂閱狀態...');
        try {
          await this.loadSubscriptionStatus();
        } catch (statusError) {
          console.warn('⚠️ 載入訂閱狀態失敗:', statusError);
          // 不阻止初始化完成
        }
        
        this.isInitialized = true;
        console.log('🎉 StoreKit 訂閱服務已初始化');
      } else {
        console.log('⚠️ 非 iOS 平台，跳過 StoreKit 初始化');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ 訂閱服務初始化失敗:', error);
      if (error instanceof Error) {
        console.error('❌ 錯誤詳情:', error.message);
        console.error('❌ 錯誤堆棧:', error.stack);
      }
      // 不拋出錯誤，允許應用繼續運行
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * 設置購買監聽器
   */
  private setupPurchaseListeners(): void {
    this.purchaseUpdateSubscription = purchaseUpdatedListener((purchase: Purchase) => {
      console.log('Purchase updated:', purchase);
      this.handlePurchaseUpdate(purchase);
    });

    this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.error('Purchase error:', error);
      this.handlePurchaseError(error);
    });
  }

  /**
   * 載入可用產品
   */
  private async loadAvailableProducts(): Promise<void> {
    try {
      const productIds = SUBSCRIPTION_PLANS.map(plan => plan.productId);
      console.log('嘗試載入產品 IDs:', productIds);
      
      const products = await getSubscriptions({ skus: productIds });
      console.log('從 App Store 獲取的產品:', products);
      console.log('產品數量:', products.length);
      
      this.availableProducts = products;
      
      // 更新方案價格
      this.availableProducts.forEach(product => {
        const plan = SUBSCRIPTION_PLANS.find(p => p.productId === product.productId);
        if (plan) {
          plan.price = (product as any).localizedPrice || plan.price;
        }
      });
      
      console.log('可用產品已載入:', this.availableProducts.length);
    } catch (error) {
      console.warn('載入產品失敗 (可能是產品還未在 App Store Connect 中創建):', error);
      this.availableProducts = [];
      
      // 即使產品載入失敗，也要設置默認狀態
      console.log('使用默認產品配置');
    }
  }

  /**
   * 載入訂閱狀態
   */
  private async loadSubscriptionStatus(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 全員三個月試用：若未啟用或已過期，為當前用戶自動開啟
      await this.ensureGlobalTrialActive(user.id);

      // 檢查活躍購買
      const availablePurchases = await getAvailablePurchases();
      
      for (const purchase of availablePurchases) {
        if (this.isValidSubscriptionPurchase(purchase)) {
          await this.validateAndUpdateSubscription(purchase);
          break;
        }
      }

      // 檢查試用狀態
      await this.checkTrialStatus(user.id);

      this.notifyStatusChange();
    } catch (error) {
      console.error('載入訂閱狀態失敗:', error);
    }
  }

  /**
   * 全員三個月試用自動激活
   */
  private async ensureGlobalTrialActive(userId: string): Promise<void> {
    try {
      // 允許通過環境變量配置天數，默認 90 天
      const trialDaysRaw = (process.env.EXPO_PUBLIC_GLOBAL_TRIAL_DAYS as unknown as string) ?? '';
      const GLOBAL_TRIAL_DAYS = Number(trialDaysRaw) > 0 ? Number(trialDaysRaw) : 90;

      // 查詢當前狀態
      const { data, error } = await (supabase as any)
        .from('users')
        .select('is_trial_active, trial_end_date')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('讀取試用狀態失敗（忽略，將繼續）:', error);
        return;
      }

      const now = new Date();
      const endDate = new Date(now.getTime() + GLOBAL_TRIAL_DAYS * 24 * 60 * 60 * 1000);

      const isActive: boolean = !!data?.is_trial_active;
      const trialEnd = data?.trial_end_date ? new Date(data.trial_end_date) : null;

      // 未啟用或已過期 -> 啟用/續期試用
      if (!isActive || (trialEnd && trialEnd <= now)) {
        const { error: updateError } = await (supabase as any)
          .from('users')
          .update({
            is_trial_active: true,
            trial_end_date: endDate.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.warn('開啟全員試用失敗（忽略，應用繼續）:', updateError);
        } else {
          this.currentStatus.isTrialActive = true;
          this.currentStatus.trialEndDate = endDate;
        }
      }
    } catch (e) {
      console.warn('ensureGlobalTrialActive 例外（忽略）:', e);
    }
  }

  /**
   * 驗證並更新訂閱狀態
   */
  private async validateAndUpdateSubscription(purchase: Purchase): Promise<void> {
    try {
      if (Platform.OS === 'ios' && purchase.transactionReceipt) {
        const receiptBody = {
          'receipt-data': purchase.transactionReceipt
        };

        // 單次驗證：服務端自動處理生產->沙盒回退
        const isValid = await this.validateReceipt(receiptBody, false);

        if (isValid) {
          const plan = SUBSCRIPTION_PLANS.find(p => p.productId === purchase.productId);
          if (plan) {
            const expirationDate = new Date(purchase.transactionDate);
            if (plan.period === 'monthly') {
              expirationDate.setMonth(expirationDate.getMonth() + 1);
            } else {
              expirationDate.setFullYear(expirationDate.getFullYear() + 1);
            }

            this.currentStatus = {
              isActive: true,
              plan,
              expirationDate,
              isTrialActive: false,
              originalTransactionId: purchase.originalTransactionDateIOS?.toString()
            };

            // 更新數據庫
                         await this.updateUserSubscriptionInDatabase(
               true,
               plan.period,
               expirationDate,
               purchase.originalTransactionDateIOS?.toString() || ''
             );
          }
        }
      }
    } catch (error) {
      console.error('驗證訂閱失敗:', error);
    }
  }

  /**
   * 驗證收據
   */
  private async validateReceipt(receiptBody: any, isSandbox: boolean): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('iap-verify-receipt', {
        body: { receiptData: receiptBody['receipt-data'] }
      });

      if (error) {
        console.error('服務端收據驗證錯誤:', error);
        return false;
      }

      // Apple 返回 status === 0 表示驗證成功
      return !!data && data.status === 0;
    } catch (error) {
      console.error('收據驗證失敗:', error);
      return false;
    }
  }

  /**
   * 檢查試用狀態
   */
     private async checkTrialStatus(userId: string): Promise<void> {
    try {
      const { data, error } = await (supabase as any).from('users')
        .select('is_trial_active, trial_end_date, trial_used')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('檢查試用狀態失敗:', error);
        return;
      }

      if (data?.is_trial_active && data?.trial_end_date) {
        const trialEndDate = new Date(data.trial_end_date);
        const now = new Date();
        
        if (trialEndDate > now) {
          this.currentStatus.isTrialActive = true;
          this.currentStatus.trialEndDate = trialEndDate;
        }
      }
    } catch (error) {
      console.error('檢查試用狀態失敗:', error);
    }
  }

  /**
   * 開始訂閱流程
   */
  async startSubscription(planId: string): Promise<boolean> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error(t('subscription.errors.failed'));
      }

      // 會員大放送：在活動期間內，點擊任何方案直接開通高級到 PROMO_END_DATE
      const now = new Date();
      if (PROMO_END_DATE.getTime() > now.getTime()) {
        const promoEnd = PROMO_END_DATE;
        this.currentStatus = {
          isActive: true,
          plan: undefined,
          expirationDate: promoEnd,
          isTrialActive: false,
          originalTransactionId: 'PROMO_2025'
        };
        await this.updateUserSubscriptionInDatabase(true, undefined, promoEnd, 'PROMO_2025');
        Alert.alert(t('subscription.promo.title'), t('subscription.promo.message'));
        this.notifyStatusChange();
        return true;
      }

      if (Platform.OS !== 'ios') {
        Alert.alert(
          t('subscription.errors.unavailable'),
          t('subscription.errors.unavailableDetail', { productId: plan?.productId ?? '' })
        );
        return false;
      }

      if (!this.isIapNativeAvailable()) {
        Alert.alert(
          t('subscription.errors.unavailable'),
          t('subscription.errors.iapNotAvailable')
        );
        return false;
      }

      // 檢查產品是否可用；若為空則嘗試重新載入
      if (this.availableProducts.length === 0) {
        try {
          await this.loadAvailableProducts();
        } catch (_) {
          // 忽略，後續以條件分支處理
        }
      }

      // 僅當找到對應的 productId 才能繼續
      const matchedProduct = this.availableProducts.find(p => p.productId === plan.productId);
      if (!matchedProduct) {
        Alert.alert(
          t('subscription.errors.unavailable'),
          t('subscription.errors.unavailableDetail', { productId: plan.productId })
        );
        return false;
      }

      console.log('開始訂閱流程:', plan.name);

      // 發起訂閱請求 (iOS 格式)
      await requestSubscription({
        sku: plan.productId
      });

      return true;
    } catch (error) {
      console.error('訂閱失敗:', error);
      Alert.alert(t('subscription.errors.failed'), error instanceof Error ? error.message : '');
      return false;
    }
  }

  /**
   * 處理購買更新
   */
  private async handlePurchaseUpdate(purchase: Purchase): Promise<void> {
    try {
      console.log('處理購買更新:', purchase.productId);
      
      await this.validateAndUpdateSubscription(purchase);
      
      // 完成交易
      await finishTransaction({ purchase, isConsumable: false });
      
      // 成功後直接更新狀態，不彈出提示
      this.notifyStatusChange();
    } catch (error) {
      console.error('處理購買更新失敗:', error);
    }
  }

  /**
   * 處理購買錯誤
   */
  private handlePurchaseError(error: PurchaseError): void {
    console.error('購買錯誤:', error);
    
        let message = t('subscription.errors.failed');
    
    switch (error.code) {
      case 'E_USER_CANCELLED':
        return; // 用戶取消，不顯示錯誤
      case 'E_NETWORK_ERROR':
        message = t('common.networkError') || t('subscription.errors.failed');
        break;
      case 'E_SERVICE_ERROR':
        message = t('subscription.errors.unavailable');
        break;
      default:
        message = `${t('subscription.errors.failed')}: ${error.message || t('common.unknownError')}`;
    }
    
    Alert.alert(t('subscription.errors.failed'), message);
  }

  /**
   * 取消訂閱
   */
  async cancelSubscription(): Promise<boolean> {
    try {
      Alert.alert(
        '取消訂閱',
        '要取消訂閱，請前往 iPhone 設置 > Apple ID > 訂閱 中進行管理。',
        [
          {
            text: '確定',
            onPress: () => {
              // 可以打開設置應用
              // Linking.openURL('app-settings:');
            }
          }
        ]
      );
      return true;
    } catch (error) {
      console.error('取消訂閱失敗:', error);
      return false;
    }
  }

  /**
   * 恢復購買
   */
  async restorePurchases(): Promise<boolean> {
    try {
      console.log('恢復購買中...');
      
      const availablePurchases = await getAvailablePurchases();
      let restored = false;
      
      for (const purchase of availablePurchases) {
        if (this.isValidSubscriptionPurchase(purchase)) {
          await this.validateAndUpdateSubscription(purchase);
          restored = true;
        }
      }
      
      if (restored) {
        Alert.alert(t('subscription.restore.successTitle') || t('common.success'), t('subscription.restore.successMessage'));
        this.notifyStatusChange();
      } else {
        Alert.alert(t('subscription.restore.notFoundTitle') || t('common.error'), t('subscription.restore.notFoundMessage'));
      }
      
      return restored;
    } catch (error) {
      console.error('恢復購買失敗:', error);
      Alert.alert(t('subscription.restore.failedTitle') || t('common.error'), t('subscription.restore.failedMessage') || t('subscription.errors.failed'));
      return false;
    }
  }

  /**
   * 檢查是否為有效的訂閱購買
   */
  private isValidSubscriptionPurchase(purchase: Purchase): boolean {
    return SUBSCRIPTION_PLANS.some(plan => plan.productId === purchase.productId);
  }

  /**
   * 獲取當前訂閱狀態
   */
  getSubscriptionStatus(): SubscriptionStatus {
    return { ...this.currentStatus };
  }

  /**
   * 檢查是否為高級用戶
   */
  isPremiumUser(): boolean {
    const now = new Date();
    
    // 檢查付費訂閱
    if (this.currentStatus.isActive && this.currentStatus.expirationDate) {
      return this.currentStatus.expirationDate > now;
    }
    
    // 檢查試用期
    if (this.currentStatus.isTrialActive && this.currentStatus.trialEndDate) {
      return this.currentStatus.trialEndDate > now;
    }
    
    return false;
  }

  /**
   * 檢查是否在試用期
   */
  isTrialUser(): boolean {
    if (!this.currentStatus.isTrialActive || !this.currentStatus.trialEndDate) {
      return false;
    }
    return new Date() < this.currentStatus.trialEndDate;
  }

  /**
   * 獲取試用期剩餘天數
   */
  getRemainingTrialDays(): number {
    if (!this.isTrialUser() || !this.currentStatus.trialEndDate) {
      return 0;
    }
    
    const now = new Date();
    const trialEnd = this.currentStatus.trialEndDate;
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * 檢查是否在試用期內（兼容 useSubscription.ts）
   */
  isInTrialPeriod(): boolean {
    return this.isTrialUser();
  }

  /**
   * 獲取試用期剩餘天數（兼容 useSubscription.ts）
   */
  getTrialDaysRemaining(): number {
    return this.getRemainingTrialDays();
  }

  /**
   * 添加狀態監聽器
   */
  addStatusListener(listener: (status: SubscriptionStatus) => void): () => void {
    this.statusListeners.push(listener);
    
    // 返回取消監聽的函數
    return () => {
      const index = this.statusListeners.indexOf(listener);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  /**
   * 狀态變更監聽器（兼容 useSubscription.ts）
   */
  onStatusChange(listener: (status: SubscriptionStatus) => void): () => void {
    return this.addStatusListener(listener);
  }

  /**
   * 移除狀態監聽器
   */
  removeStatusListener(listener: (status: SubscriptionStatus) => void): void {
    const index = this.statusListeners.indexOf(listener);
    if (index > -1) {
      this.statusListeners.splice(index, 1);
    }
  }

  /**
   * 通知所有監聽器狀態變化
   */
  private notifyStatusChange(): void {
    this.statusListeners.forEach(listener => {
      try {
        listener(this.getSubscriptionStatus());
      } catch (error) {
        console.error('訂閱狀態監聽器錯誤:', error);
      }
    });
  }

  /**
   * 更新用戶訂閱狀態到數據庫
   */
  private async updateUserSubscriptionInDatabase(
    isPremium: boolean,
    subscriptionType?: 'monthly' | 'yearly',
    expiresAt?: Date,
    transactionId?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: any = {
        is_premium: isPremium,
        subscription_type: subscriptionType,
        subscription_expires_at: expiresAt?.toISOString(),
        updated_at: new Date().toISOString()
      };

      if (transactionId) {
        updateData.original_transaction_id = transactionId;
      }

      const { error } = await (supabase as any)
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('更新數據庫失敗:', error);
      } else {
        console.log('用戶訂閱狀態已更新到數據庫');
      }
    } catch (error) {
      console.error('更新訂閱狀態到數據庫失敗:', error);
    }
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
    
    if (Platform.OS === 'ios') {
      endConnection();
    }
  }
}

// 導出單例實例
export const subscriptionService = new SubscriptionService();

// 導出一些實用函數
export const getSubscriptionPlans = () => SUBSCRIPTION_PLANS;
export const findPlanById = (id: string) => SUBSCRIPTION_PLANS.find(plan => plan.id === id);
export const isPremiumFeature = (feature: string) => {
  return SUBSCRIPTION_PLANS.some(plan => 
    plan.features.includes(feature)
  );
}; 
