import AsyncStorage from '@react-native-async-storage/async-storage'
import { SummaryService } from './summaryService'

export interface ScheduledTask {
  id: string
  type: 'daily_summary'
  userId: string
  scheduledTime: string // HH:MM format
  lastRun?: string
  isActive: boolean
}

export class SchedulerService {
  private static readonly SCHEDULER_KEY = 'scheduled_tasks'
  private static readonly LAST_RUN_KEY = 'last_summary_run'
  private static intervalId: ReturnType<typeof setInterval> | null = null

  /**
   * 初始化調度服務
   */
  static async initialize(): Promise<void> {
    console.log('初始化調度服務...')
    
    // 清理現有的定時器
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    
    // 每分鐘檢查一次是否需要執行任務
    this.intervalId = setInterval(async () => {
      await this.checkAndExecuteTasks()
    }, 60 * 1000) // 每分鐘檢查一次
    
    console.log('調度服務已啟動')
  }

  /**
   * 停止調度服務
   */
  static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('調度服務已停止')
    }
  }

  /**
   * 為用戶設置每日總結任務
   */
  static async scheduleDailySummary(
    userId: string,
    time: string = '22:00' // 默認晚上10點
  ): Promise<void> {
    try {
      const tasks = await this.getTasks()
      
      // 檢查是否已存在該用戶的任務
      const existingTaskIndex = tasks.findIndex(
        task => task.userId === userId && task.type === 'daily_summary'
      )
      
      const newTask: ScheduledTask = {
        id: `daily_summary_${userId}`,
        type: 'daily_summary',
        userId,
        scheduledTime: time,
        isActive: true
      }
      
      if (existingTaskIndex >= 0) {
        // 更新現有任務
        tasks[existingTaskIndex] = newTask
      } else {
        // 添加新任務
        tasks.push(newTask)
      }
      
      await this.saveTasks(tasks)
      console.log(`已為用戶 ${userId} 設置每日總結任務，時間: ${time}`)
    } catch (error) {
      console.error('設置每日總結任務失敗:', error)
    }
  }

  /**
   * 取消用戶的每日總結任務
   */
  static async cancelDailySummary(userId: string): Promise<void> {
    try {
      const tasks = await this.getTasks()
      const filteredTasks = tasks.filter(
        task => !(task.userId === userId && task.type === 'daily_summary')
      )
      
      await this.saveTasks(filteredTasks)
      console.log(`已取消用戶 ${userId} 的每日總結任務`)
    } catch (error) {
      console.error('取消每日總結任務失敗:', error)
    }
  }

  /**
   * 檢查並執行到期的任務
   */
  private static async checkAndExecuteTasks(): Promise<void> {
    try {
      const tasks = await this.getTasks()
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      const today = now.toISOString().split('T')[0]
      
      for (const task of tasks) {
        if (!task.isActive) continue
        
        // 檢查是否到了執行時間
        if (task.scheduledTime === currentTime) {
          // 檢查今天是否已經執行過
          const lastRun = await this.getLastRunDate(task.id)
          
          if (lastRun !== today) {
            console.log(`執行任務: ${task.type} for user ${task.userId}`)
            await this.executeTask(task)
            await this.setLastRunDate(task.id, today)
          }
        }
      }
    } catch (error) {
      console.error('檢查任務執行失敗:', error)
    }
  }

  /**
   * 執行具體的任務
   */
  private static async executeTask(task: ScheduledTask): Promise<void> {
    try {
      switch (task.type) {
        case 'daily_summary':
          console.log(`開始為用戶 ${task.userId} 生成每日總結...`)
          const summary = await SummaryService.generateDailySummary(task.userId)
          
          if (summary) {
            console.log(`用戶 ${task.userId} 的每日總結生成成功`)
            
            // 這裡可以添加通知邏輯
            await this.sendSummaryNotification(task.userId, summary)
          } else {
            console.log(`用戶 ${task.userId} 的每日總結生成失敗`)
          }
          break
          
        default:
          console.warn(`未知的任務類型: ${task.type}`)
      }
    } catch (error) {
      console.error(`執行任務失敗 ${task.type} for user ${task.userId}:`, error)
    }
  }

  /**
   * 發送總結通知（預留接口）
   */
  private static async sendSummaryNotification(
    userId: string,
    summary: any
  ): Promise<void> {
    // 這裡可以實現推送通知邏輯
    // 例如：本地通知、郵件通知等
    console.log(`為用戶 ${userId} 發送總結通知`)
    
    // 示例：可以使用 Expo Notifications 發送本地通知
    // import * as Notifications from 'expo-notifications'
    // await Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: '每日心理總結已準備就緒',
    //     body: '查看您今日的心理洞察和建議',
    //   },
    //   trigger: null,
    // })
  }

  /**
   * 手動觸發用戶的每日總結
   */
  static async triggerDailySummary(userId: string): Promise<boolean> {
    try {
      console.log(`手動觸發用戶 ${userId} 的每日總結`)
      const summary = await SummaryService.generateDailySummary(userId)
      
      if (summary) {
        const today = new Date().toISOString().split('T')[0]
        await this.setLastRunDate(`daily_summary_${userId}`, today)
        return true
      }
      
      return false
    } catch (error) {
      console.error('手動觸發每日總結失敗:', error)
      return false
    }
  }

  /**
   * 獲取所有任務
   */
  private static async getTasks(): Promise<ScheduledTask[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(this.SCHEDULER_KEY)
      return tasksJson ? JSON.parse(tasksJson) : []
    } catch (error) {
      console.error('獲取任務列表失敗:', error)
      return []
    }
  }

  /**
   * 保存任務列表
   */
  private static async saveTasks(tasks: ScheduledTask[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SCHEDULER_KEY, JSON.stringify(tasks))
    } catch (error) {
      console.error('保存任務列表失敗:', error)
    }
  }

  /**
   * 獲取任務最後執行日期
   */
  private static async getLastRunDate(taskId: string): Promise<string | null> {
    try {
      const lastRunData = await AsyncStorage.getItem(`${this.LAST_RUN_KEY}_${taskId}`)
      return lastRunData
    } catch (error) {
      console.error('獲取最後執行日期失敗:', error)
      return null
    }
  }

  /**
   * 設置任務最後執行日期
   */
  private static async setLastRunDate(taskId: string, date: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.LAST_RUN_KEY}_${taskId}`, date)
    } catch (error) {
      console.error('設置最後執行日期失敗:', error)
    }
  }

  /**
   * 獲取用戶的任務狀態
   */
  static async getUserTaskStatus(userId: string): Promise<ScheduledTask | null> {
    try {
      const tasks = await this.getTasks()
      return tasks.find(
        task => task.userId === userId && task.type === 'daily_summary'
      ) || null
    } catch (error) {
      console.error('獲取用戶任務狀態失敗:', error)
      return null
    }
  }

  /**
   * 檢查今天是否已經執行過總結
   */
  static async hasTodaySummary(userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const lastRun = await this.getLastRunDate(`daily_summary_${userId}`)
      return lastRun === today
    } catch (error) {
      console.error('檢查今日總結狀態失敗:', error)
      return false
    }
  }
}
