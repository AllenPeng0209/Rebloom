import { Audio, AVPlaybackStatusSuccess } from 'expo-av'
import * as Speech from 'expo-speech'

export type InterventionCategory = 'meditation' | 'sleep' | 'breathing' | 'chat'

export interface InterventionItem {
  id: string
  category: InterventionCategory
  title: string
  lengthSec: number
  audioUrl?: string
  script?: string[]
  source?: string
}

interface InterventionManifest {
  items: InterventionItem[]
}

/**
 * Lightweight runtime for starting/stopping wellbeing interventions
 * (meditation, sleep, breathing). It prefers playing an audioUrl; if absent,
 * it falls back to simple TTS script playback. Designed as a thin layer so we
 * can swap to third-party assets (e.g. Medito) by only changing the manifest.
 */
export class InterventionService {
  private manifest: InterventionManifest | null = null
  private sound: Audio.Sound | null = null
  private isSpeaking = false

  async loadManifest(manifest?: InterventionManifest): Promise<void> {
    if (manifest) {
      this.manifest = manifest
      return
    }
    // Fallback: in case we haven't shipped a JSON file yet, use a small inline manifest
    this.manifest = this.getDefaultManifest()
  }

  getItems(): InterventionItem[] {
    if (!this.manifest) return []
    return this.manifest.items
  }

  async startById(id: string, onComplete?: () => void): Promise<void> {
    if (!this.manifest) await this.loadManifest()
    const item = this.manifest?.items.find(i => i.id === id)
    if (!item) throw new Error(`Intervention not found: ${id}`)
    await this.start(item, onComplete)
  }

  async start(item: InterventionItem, onComplete?: () => void): Promise<void> {
    await this.stop()

    if (item.audioUrl) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.audioUrl },
        { shouldPlay: true }
      )
      this.sound = sound
      sound.setOnPlaybackStatusUpdate(status => {
        const s = status as AVPlaybackStatusSuccess
        if (s.isLoaded && s.didJustFinish) {
          onComplete?.()
        }
      })
      return
    }

    if (item.script && item.script.length > 0) {
      this.isSpeaking = true
      // Speak each line with a small pause
      for (const [index, line] of item.script.entries()) {
        if (!this.isSpeaking) break
        Speech.speak(line, { language: 'zh-TW', pitch: 1.0, rate: 0.95 })
        // naive pause between lines
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      this.isSpeaking = false
      onComplete?.()
      return
    }
  }

  async stop(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync()
      } catch {}
      try {
        await this.sound.unloadAsync()
      } catch {}
      this.sound = null
    }
    if (this.isSpeaking) {
      Speech.stop()
      this.isSpeaking = false
    }
  }

  private getDefaultManifest(): InterventionManifest {
    return {
      items: [
        {
          id: 'meditation_5min',
          category: 'meditation',
          title: '5 分鐘靜心',
          lengthSec: 300,
          // audioUrl: '', // 可由第三方素材補上
          script: [
            '找個舒服的姿勢坐好，輕輕閉上眼睛。',
            '把注意力放在呼吸上，吸氣四拍，停一拍，吐氣四拍。',
            '如果注意力分散，溫柔地帶回呼吸。'
          ],
          source: 'medito-app'
        },
        {
          id: 'sleep_10min',
          category: 'sleep',
          title: '10 分鐘舒眠',
          lengthSec: 600,
          // audioUrl: '',
          script: [
            '放鬆你的肩膀與下巴，讓身體逐步沉下去。',
            '進行緩慢而深長的呼吸，吸氣與吐氣都更輕更慢。',
            '想像全身像波浪一樣，一次放鬆一個部位。'
          ],
          source: 'medito-app'
        }
      ]
    }
  }
}

export const interventionService = new InterventionService()


