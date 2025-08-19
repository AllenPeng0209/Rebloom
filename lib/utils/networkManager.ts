// 网络请求管理器 - 防止请求堆积和阻塞
import { performanceMonitor } from './performanceMonitor';

interface RequestConfig {
  url: string;
  method?: string;
  timeout?: number;
  retries?: number;
}

interface RequestQueue {
  [key: string]: {
    promise: Promise<any>;
    timestamp: number;
    retries: number;
  };
}

class NetworkManager {
  private static instance: NetworkManager;
  private requestQueue: RequestQueue = {};
  private maxConcurrentRequests = 5;
  private activeRequests = 0;
  private requestTimeout = 10000; // 10秒超时
  private maxRetries = 3;

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  // 生成请求键
  private generateRequestKey(config: RequestConfig): string {
    return `${config.method || 'GET'}_${config.url}`;
  }

  // 检查是否有重复请求
  private hasDuplicateRequest(key: string): boolean {
    const existingRequest = this.requestQueue[key];
    if (!existingRequest) return false;
    
    // 如果请求在5秒内，认为是重复请求
    const timeDiff = Date.now() - existingRequest.timestamp;
    return timeDiff < 5000;
  }

  // 执行请求
  async executeRequest<T>(
    config: RequestConfig,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateRequestKey(config);
    
    // 检查重复请求
    if (this.hasDuplicateRequest(key)) {
      console.log(`🔄 检测到重复请求，返回缓存结果: ${config.url}`);
      return this.requestQueue[key].promise;
    }

    // 检查并发请求数量
    if (this.activeRequests >= this.maxConcurrentRequests) {
      console.warn(`⚠️ 并发请求过多，等待队列: ${config.url}`);
      await this.waitForSlot();
    }

    // 记录网络请求
    performanceMonitor.trackNetworkRequest(config.url);

    // 创建请求Promise
    const requestPromise = this.createRequestPromise(config, requestFn);
    
    // 添加到队列
    this.requestQueue[key] = {
      promise: requestPromise,
      timestamp: Date.now(),
      retries: 0,
    };

    this.activeRequests++;

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.activeRequests--;
      // 清理完成的请求
      delete this.requestQueue[key];
    }
  }

  // 创建请求Promise
  private async createRequestPromise<T>(
    config: RequestConfig,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const timeout = config.timeout || this.requestTimeout;
    const maxRetries = config.retries || this.maxRetries;

    return new Promise<T>((resolve, reject) => {
      let retryCount = 0;

      const attemptRequest = async () => {
        try {
          // 创建超时Promise
          const timeoutPromise = new Promise<never>((_, timeoutReject) => {
            setTimeout(() => {
              timeoutReject(new Error(`请求超时: ${config.url}`));
            }, timeout);
          });

          // 执行请求
          const result = await Promise.race([requestFn(), timeoutPromise]);
          resolve(result);
        } catch (error) {
          retryCount++;
          
          if (retryCount <= maxRetries) {
            console.log(`🔄 请求失败，重试 ${retryCount}/${maxRetries}: ${config.url}`);
            // 指数退避重试
            const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
            setTimeout(attemptRequest, delay);
          } else {
            console.error(`❌ 请求最终失败: ${config.url}`, error);
            reject(error);
          }
        }
      };

      attemptRequest();
    });
  }

  // 等待可用槽位
  private async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.activeRequests < this.maxConcurrentRequests) {
          resolve();
        } else {
          setTimeout(checkSlot, 100);
        }
      };
      checkSlot();
    });
  }

  // 取消所有请求
  cancelAllRequests(): void {
    console.log('🚫 取消所有网络请求');
    this.requestQueue = {};
    this.activeRequests = 0;
  }

  // 获取当前状态
  getStatus() {
    return {
      activeRequests: this.activeRequests,
      maxConcurrentRequests: this.maxConcurrentRequests,
      queueSize: Object.keys(this.requestQueue).length,
    };
  }

  // 设置最大并发请求数
  setMaxConcurrentRequests(max: number): void {
    this.maxConcurrentRequests = Math.max(1, Math.min(max, 10));
    console.log(`📊 设置最大并发请求数: ${this.maxConcurrentRequests}`);
  }

  // 设置请求超时时间
  setRequestTimeout(timeout: number): void {
    this.requestTimeout = timeout;
    console.log(`⏰ 设置请求超时时间: ${timeout}ms`);
  }
}

// 导出单例
export const networkManager = NetworkManager.getInstance();

// 创建优化的fetch函数
export const optimizedFetch = async <T>(
  url: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<T> => {
  return networkManager.executeRequest(
    { url, method: options.method || 'GET', timeout },
    async () => {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    }
  );
};

// 创建防抖的请求函数
export const debouncedRequest = <T>(
  requestFn: () => Promise<T>,
  delay: number = 300
): (() => Promise<T>) => {
  let timeoutId: NodeJS.Timeout;
  let lastPromise: Promise<T> | null = null;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise<T>((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          if (lastPromise) {
            // 如果有正在进行的请求，等待它完成
            const result = await lastPromise;
            resolve(result);
          } else {
            // 执行新请求
            lastPromise = requestFn();
            const result = await lastPromise;
            lastPromise = null;
            resolve(result);
          }
        } catch (error) {
          lastPromise = null;
          reject(error);
        }
      }, delay);
    });
  };
};
