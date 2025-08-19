// 性能监控工具 - 用于检测和预防应用卡死
import { InteractionManager } from 'react-native';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  animationCount: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    animationCount: 0,
  };
  
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private renderStartTime = 0;
  private networkRequestCount = 0;
  private activeAnimations = new Set<string>();
  private slowRenderThreshold = 100; // 100ms
  private memoryThreshold = 500; // 500MB
  private networkThreshold = 10; // 10个并发请求
  private animationThreshold = 20; // 20个并发动画

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 开始监控
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 开始性能监控...');
    
    this.monitoringInterval = setInterval(() => {
      this.checkPerformance();
    }, 5000); // 每5秒检查一次
  }

  // 停止监控
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('🔍 停止性能监控');
  }

  // 记录渲染开始
  startRender(componentName: string) {
    this.renderStartTime = Date.now();
    console.log(`🎨 开始渲染: ${componentName}`);
  }

  // 记录渲染结束
  endRender(componentName: string) {
    const renderTime = Date.now() - this.renderStartTime;
    this.metrics.renderTime = renderTime;
    
    if (renderTime > this.slowRenderThreshold) {
      console.warn(`⚠️ 慢渲染警告: ${componentName} 耗时 ${renderTime}ms`);
    }
    
    console.log(`🎨 渲染完成: ${componentName} (${renderTime}ms)`);
  }

  // 记录网络请求
  trackNetworkRequest(url: string) {
    this.networkRequestCount++;
    this.metrics.networkRequests = this.networkRequestCount;
    
    console.log(`🌐 网络请求: ${url} (总计: ${this.networkRequestCount})`);
    
    // 延迟减少计数
    setTimeout(() => {
      this.networkRequestCount = Math.max(0, this.networkRequestCount - 1);
      this.metrics.networkRequests = this.networkRequestCount;
    }, 10000); // 10秒后减少计数
  }

  // 记录动画开始
  trackAnimation(animationId: string) {
    this.activeAnimations.add(animationId);
    this.metrics.animationCount = this.activeAnimations.size;
    
    console.log(`🎬 动画开始: ${animationId} (总计: ${this.activeAnimations.size})`);
  }

  // 记录动画结束
  untrackAnimation(animationId: string) {
    this.activeAnimations.delete(animationId);
    this.metrics.animationCount = this.activeAnimations.size;
    
    console.log(`🎬 动画结束: ${animationId} (剩余: ${this.activeAnimations.size})`);
  }

  // 检查性能指标
  private checkPerformance() {
    const warnings: string[] = [];
    
    // 检查渲染时间
    if (this.metrics.renderTime > this.slowRenderThreshold) {
      warnings.push(`渲染时间过长: ${this.metrics.renderTime}ms`);
    }
    
    // 检查网络请求数量
    if (this.metrics.networkRequests > this.networkThreshold) {
      warnings.push(`网络请求过多: ${this.metrics.networkRequests}个`);
    }
    
    // 检查动画数量
    if (this.metrics.animationCount > this.animationThreshold) {
      warnings.push(`动画数量过多: ${this.metrics.animationCount}个`);
    }
    
    if (warnings.length > 0) {
      console.warn('🚨 性能警告:', warnings.join(', '));
      this.suggestOptimizations(warnings);
    }
  }

  // 建议优化措施
  private suggestOptimizations(warnings: string[]) {
    const suggestions: string[] = [];
    
    if (warnings.some(w => w.includes('渲染时间'))) {
      suggestions.push('使用 React.memo 优化组件渲染');
      suggestions.push('使用 useMemo 和 useCallback 减少不必要的计算');
      suggestions.push('考虑使用 FlatList 替代 ScrollView');
    }
    
    if (warnings.some(w => w.includes('网络请求'))) {
      suggestions.push('实现请求去重和缓存机制');
      suggestions.push('使用防抖和节流控制请求频率');
      suggestions.push('考虑批量请求减少网络开销');
    }
    
    if (warnings.some(w => w.includes('动画'))) {
      suggestions.push('减少同时运行的动画数量');
      suggestions.push('使用 useNativeDriver 优化动画性能');
      suggestions.push('考虑使用 InteractionManager 延迟非关键动画');
    }
    
    console.log('💡 优化建议:', suggestions);
  }

  // 获取当前指标
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // 清理资源
  cleanup() {
    this.stopMonitoring();
    this.activeAnimations.clear();
    this.networkRequestCount = 0;
  }
}

// 性能优化工具函数
export const performanceUtils = {
  // 防抖函数
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // 节流函数
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // 延迟执行非关键任务
  deferTask(task: () => void) {
    InteractionManager.runAfterInteractions(() => {
      task();
    });
  },

  // 批量更新状态
  batchUpdate<T>(
    updates: (() => void)[],
    delay: number = 16 // 一帧的时间
  ) {
    updates.forEach((update, index) => {
      setTimeout(update, index * delay);
    });
  },

  // 检查组件是否应该重新渲染
  shouldComponentUpdate<T extends Record<string, any>>(
    prevProps: T,
    nextProps: T,
    keys: (keyof T)[]
  ): boolean {
    return keys.some(key => prevProps[key] !== nextProps[key]);
  }
};

// 导出单例
export const performanceMonitor = PerformanceMonitor.getInstance();

// 开发环境自动启动监控
if (__DEV__) {
  performanceMonitor.startMonitoring();
}
