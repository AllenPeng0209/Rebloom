// 内存管理工具 - 防止内存泄漏
import React from 'react';
import { performanceMonitor } from './performanceMonitor';

interface MemoryLeakDetector {
  [key: string]: {
    count: number;
    lastAccess: number;
    size: number;
  };
}

class MemoryManager {
  private static instance: MemoryManager;
  private leakDetector: MemoryLeakDetector = {};
  private cleanupIntervals: NodeJS.Timeout[] = [];
  private eventListeners: Map<string, () => void> = new Map();
  private animationRefs: Set<any> = new Set();
  private networkRequests: Set<AbortController> = new Set();

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // 跟踪组件实例
  trackComponent(componentName: string, instance: any): void {
    const key = `${componentName}_${Date.now()}_${Math.random()}`;
    
    if (!this.leakDetector[componentName]) {
      this.leakDetector[componentName] = {
        count: 0,
        lastAccess: Date.now(),
        size: 0,
      };
    }

    this.leakDetector[componentName].count++;
    this.leakDetector[componentName].lastAccess = Date.now();

    // 设置清理定时器
    const cleanupTimer = setTimeout(() => {
      this.cleanupComponent(componentName, instance);
    }, 30000); // 30秒后清理

    this.cleanupIntervals.push(cleanupTimer);

    console.log(`🔍 跟踪组件: ${componentName} (总计: ${this.leakDetector[componentName].count})`);
  }

  // 清理组件
  private cleanupComponent(componentName: string, instance: any): void {
    if (this.leakDetector[componentName]) {
      this.leakDetector[componentName].count = Math.max(0, this.leakDetector[componentName].count - 1);
      
      // 清理实例
      if (instance && typeof instance.cleanup === 'function') {
        instance.cleanup();
      }

      console.log(`🧹 清理组件: ${componentName} (剩余: ${this.leakDetector[componentName].count})`);
    }
  }

  // 跟踪事件监听器
  trackEventListener(eventName: string, listener: () => void): void {
    const key = `${eventName}_${Date.now()}`;
    this.eventListeners.set(key, listener);
    
    console.log(`👂 跟踪事件监听器: ${eventName} (总计: ${this.eventListeners.size})`);
  }

  // 清理事件监听器
  cleanupEventListeners(): void {
    this.eventListeners.forEach((listener, key) => {
      try {
        listener();
      } catch (error) {
        console.warn(`⚠️ 清理事件监听器失败: ${key}`, error);
      }
    });
    this.eventListeners.clear();
    
    console.log('🧹 清理所有事件监听器');
  }

  // 跟踪动画引用
  trackAnimation(animationRef: any): void {
    this.animationRefs.add(animationRef);
    
    console.log(`🎬 跟踪动画引用 (总计: ${this.animationRefs.size})`);
  }

  // 清理动画引用
  cleanupAnimations(): void {
    this.animationRefs.forEach(animationRef => {
      try {
        if (animationRef && typeof animationRef.stopAnimation === 'function') {
          animationRef.stopAnimation();
        }
      } catch (error) {
        console.warn('⚠️ 清理动画失败:', error);
      }
    });
    this.animationRefs.clear();
    
    console.log('🧹 清理所有动画引用');
  }

  // 跟踪网络请求
  trackNetworkRequest(abortController: AbortController): void {
    this.networkRequests.add(abortController);
    
    console.log(`🌐 跟踪网络请求 (总计: ${this.networkRequests.size})`);
  }

  // 清理网络请求
  cleanupNetworkRequests(): void {
    this.networkRequests.forEach(abortController => {
      try {
        abortController.abort();
      } catch (error) {
        console.warn('⚠️ 取消网络请求失败:', error);
      }
    });
    this.networkRequests.clear();
    
    console.log('🧹 清理所有网络请求');
  }

  // 清理定时器
  cleanupTimers(): void {
    this.cleanupIntervals.forEach(timer => {
      clearTimeout(timer);
    });
    this.cleanupIntervals = [];
    
    console.log('🧹 清理所有定时器');
  }

  // 全面清理
  performFullCleanup(): void {
    console.log('🚀 开始全面内存清理...');
    
    this.cleanupEventListeners();
    this.cleanupAnimations();
    this.cleanupNetworkRequests();
    this.cleanupTimers();
    
    // 清理组件跟踪
    Object.keys(this.leakDetector).forEach(componentName => {
      if (this.leakDetector[componentName].count > 0) {
        console.warn(`⚠️ 检测到可能的组件泄漏: ${componentName} (${this.leakDetector[componentName].count}个实例)`);
      }
    });

    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc();
      console.log('🗑️ 强制垃圾回收');
    }

    console.log('✅ 全面内存清理完成');
  }

  // 获取内存使用情况
  getMemoryUsage(): any {
    const usage = {
      components: Object.keys(this.leakDetector).length,
      eventListeners: this.eventListeners.size,
      animations: this.animationRefs.size,
      networkRequests: this.networkRequests.size,
      timers: this.cleanupIntervals.length,
    };

    console.log('📊 内存使用情况:', usage);
    return usage;
  }

  // 检查内存泄漏
  checkMemoryLeaks(): void {
    const warnings: string[] = [];
    
    Object.entries(this.leakDetector).forEach(([componentName, info]) => {
      if (info.count > 10) {
        warnings.push(`${componentName}: ${info.count}个实例`);
      }
    });

    if (this.eventListeners.size > 50) {
      warnings.push(`事件监听器过多: ${this.eventListeners.size}个`);
    }

    if (this.animationRefs.size > 20) {
      warnings.push(`动画引用过多: ${this.animationRefs.size}个`);
    }

    if (this.networkRequests.size > 10) {
      warnings.push(`网络请求过多: ${this.networkRequests.size}个`);
    }

    if (warnings.length > 0) {
      console.warn('🚨 检测到潜在内存泄漏:', warnings);
      this.performFullCleanup();
    }
  }

  // 定期检查
  startPeriodicCheck(interval: number = 30000): void {
    const checkInterval = setInterval(() => {
      this.checkMemoryLeaks();
    }, interval);

    this.cleanupIntervals.push(checkInterval);
    
    console.log(`⏰ 启动定期内存检查 (${interval}ms)`);
  }

  // 停止所有监控
  stop(): void {
    this.performFullCleanup();
    this.leakDetector = {};
    
    console.log('🛑 停止内存管理');
  }
}

// 导出单例
export const memoryManager = MemoryManager.getInstance();

// 开发环境自动启动监控
if (__DEV__) {
  memoryManager.startPeriodicCheck();
}

// 创建React组件包装器
export const withMemoryTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  const { useRef, useEffect } = React;
  
  return React.forwardRef<any, P>((props, ref) => {
    const componentRef = useRef<any>(null);

    useEffect(() => {
      if (componentRef.current) {
        memoryManager.trackComponent(componentName, componentRef.current);
      }

      return () => {
        if (componentRef.current) {
          memoryManager.cleanupComponent(componentName, componentRef.current);
        }
      };
    }, []);

    return (
      <WrappedComponent
        {...props}
        ref={(instance) => {
          componentRef.current = instance;
          if (typeof ref === 'function') {
            ref(instance);
          } else if (ref) {
            ref.current = instance;
          }
        }}
      />
    );
  });
};
