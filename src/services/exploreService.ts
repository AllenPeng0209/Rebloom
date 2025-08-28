export type ExplorePack = {
  id: string
  title: string
  subtitle: string
  coverUrl?: string
  path?: string
}

export type ExploreTrack = {
  id: string
  title: string
  subtitle: string
  coverUrl?: string
  path?: string
}

export type ExploreTrackDetail = {
  id: string
  title: string
  subtitle?: string
  lengthSec: number
  audioUrl?: string
}

export type PackDetail = {
  id: string
  title: string
  subtitle: string
  coverUrl?: string
  description?: string
  tracks: ExploreTrackDetail[]
}

import { getRealPackDetail, getRealPacks, searchRealTracks } from './realMeditoApi'

// 多语言数据映射
const TRANSLATIONS = {
  'introduction': {
    zh: {
      title: '冥想入门',
      subtitle: '7 个练习 · 约 35 分钟',
      description: '通过这个适合初学者的系列，学习正念冥想的基础知识。',
      tracks: {
        'intro_1': { title: '什么是冥想？', subtitle: '5 分钟' },
        'intro_2': { title: '呼吸冥想', subtitle: '10 分钟' },
        'intro_3': { title: '身体觉察', subtitle: '8 分钟' },
        'intro_4': { title: '专注力练习', subtitle: '12 分钟' },
        'intro_5': { title: '慈心冥想', subtitle: '15 分钟' },
        'intro_6': { title: '行走冥想', subtitle: '10 分钟' },
        'intro_7': { title: '整合练习', subtitle: '20 分钟' }
      }
    },
    en: {
      title: 'Introduction to Meditation',
      subtitle: '7 sessions · ~35 minutes',
      description: 'Learn the fundamentals of mindfulness meditation with this beginner-friendly series.',
      tracks: {
        'intro_1': { title: 'What is Meditation?', subtitle: '5 minutes' },
        'intro_2': { title: 'Breathing Meditation', subtitle: '10 minutes' },
        'intro_3': { title: 'Body Awareness', subtitle: '8 minutes' },
        'intro_4': { title: 'Focus Practice', subtitle: '12 minutes' },
        'intro_5': { title: 'Loving-Kindness', subtitle: '15 minutes' },
        'intro_6': { title: 'Walking Meditation', subtitle: '10 minutes' },
        'intro_7': { title: 'Integration Practice', subtitle: '20 minutes' }
      }
    },
    ja: {
      title: '瞑想入門',
      subtitle: '7 セッション · 約 35 分',
      description: '初心者向けのシリーズでマインドフルネス瞑想の基礎を学びます。',
      tracks: {
        'intro_1': { title: '瞑想とは？', subtitle: '5 分' },
        'intro_2': { title: '呼吸瞑想', subtitle: '10 分' },
        'intro_3': { title: '身体の気づき', subtitle: '8 分' },
        'intro_4': { title: '集中力の練習', subtitle: '12 分' },
        'intro_5': { title: '慈しみの瞑想', subtitle: '15 分' },
        'intro_6': { title: '歩行瞑想', subtitle: '10 分' },
        'intro_7': { title: '統合練習', subtitle: '20 分' }
      }
    }
  },
  'sleep': {
    zh: {
      title: '睡眠冥想',
      subtitle: '5 个练习 · 约 50 分钟',
      description: '通过这些平静的冥想来放松身心，为安稳的睡眠做准备。',
      tracks: {
        'sleep_1': { title: '睡眠身体扫描', subtitle: '15 分钟' },
        'sleep_2': { title: '深度睡眠故事', subtitle: '20 分钟' },
        'sleep_3': { title: '睡前呼吸', subtitle: '10 分钟' },
        'sleep_4': { title: '雨夜环境声', subtitle: '15 分钟' },
        'sleep_5': { title: '温和入睡', subtitle: '12 分钟' }
      }
    },
    en: {
      title: 'Sleep Meditations',
      subtitle: '5 sessions ~50 minutes',
      description: 'Wind down and prepare for restful sleep with these calming meditations.',
      tracks: {
        'sleep_1': { title: 'Body Scan for Sleep', subtitle: '15 minutes' },
        'sleep_2': { title: 'Deep Sleep Story', subtitle: '20 minutes' },
        'sleep_3': { title: 'Sleep Breathing', subtitle: '10 minutes' },
        'sleep_4': { title: 'Rain Night Sounds', subtitle: '15 minutes' },
        'sleep_5': { title: 'Gentle Sleep', subtitle: '12 minutes' }
      }
    },
    ja: {
      title: '睡眠瞑想',
      subtitle: '5 セッション · 約 50 分',
      description: 'これらの穏やかな瞑想で心身をリラックスさせ、安らかな睡眠の準備をします。',
      tracks: {
        'sleep_1': { title: '睡眠のためのボディスキャン', subtitle: '15 分' },
        'sleep_2': { title: '深い睡眠の物語', subtitle: '20 分' },
        'sleep_3': { title: '睡眠呼吸', subtitle: '10 分' },
        'sleep_4': { title: '雨の夜の音', subtitle: '15 分' },
        'sleep_5': { title: '優しい睡眠', subtitle: '12 分' }
      }
    }
  }
}

class ExploreServiceImpl {
  private packs: ExplorePack[] = [
    { id: 'pack_relax_start', title: '放鬆入門', subtitle: '3 個練習 · 約 15 分鐘', coverUrl: 'https://via.placeholder.com/300x180/4CAF50/white?text=放鬆入門', path: 'packs/relax-start' },
    { id: 'pack_sleep_better', title: '舒眠計畫', subtitle: '4 個練習 · 約 40 分鐘', coverUrl: 'https://via.placeholder.com/300x180/2196F3/white?text=舒眠計畫', path: 'packs/sleep-better' },
    { id: 'pack_focus', title: '專注提升', subtitle: '3 個練習 · 約 12 分鐘', coverUrl: 'https://via.placeholder.com/300x180/FF9800/white?text=專注提升', path: 'packs/focus' },
    { id: 'pack_stress_release', title: '減壓快充', subtitle: '5 個練習 · 約 25 分鐘', coverUrl: 'https://via.placeholder.com/300x180/9C27B0/white?text=減壓快充', path: 'packs/stress-release' },
    { id: 'pack_beginner_mindful', title: '初心覺察', subtitle: '7 個練習 · 約 70 分鐘', coverUrl: 'https://via.placeholder.com/300x180/607D8B/white?text=初心覺察', path: 'packs/beginner-mindful' },
    { id: 'pack_good_night', title: '晚安冥想', subtitle: '6 個練習 · 約 60 分鐘', coverUrl: 'https://via.placeholder.com/300x180/3F51B5/white?text=晚安冥想', path: 'packs/good-night' },
  ]

  private tracks: ExploreTrack[] = [
    { id: 'track_breathe_3', title: '3 分鐘呼吸', subtitle: '快速穩定身心', coverUrl: 'https://via.placeholder.com/60x60/4CAF50/white?text=呼吸', path: 'tracks/breathe-3' },
    { id: 'track_sleep_rain', title: '雨夜舒眠', subtitle: '環境聲 20 分鐘', coverUrl: 'https://via.placeholder.com/60x60/2196F3/white?text=舒眠', path: 'tracks/sleep-rain' },
    { id: 'track_body_scan', title: '身體掃描', subtitle: '冥想 10 分鐘', coverUrl: 'https://via.placeholder.com/60x60/FF9800/white?text=掃描', path: 'tracks/body-scan' },
  ]

  private packDetails: Record<string, PackDetail> = {
    pack_relax_start: {
      id: 'pack_relax_start',
      title: '放鬆入門',
      subtitle: '3 個練習 · 約 15 分鐘',
      coverUrl: 'https://via.placeholder.com/400x200/4CAF50/white?text=放鬆入門',
      description: '溫和地進入正念與放鬆的世界，適合忙碌的一天中快速復位。',
      tracks: [
        { id: 'relax_breathe', title: '穩定呼吸', subtitle: '3 分鐘', lengthSec: 180, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { id: 'relax_body_scan', title: '迷你身體掃描', subtitle: '5 分鐘', lengthSec: 300, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
        { id: 'relax_release', title: '釋放緊張', subtitle: '7 分鐘', lengthSec: 420, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      ],
    },
    pack_sleep_better: {
      id: 'pack_sleep_better',
      title: '舒眠計畫',
      subtitle: '4 個練習 · 約 40 分鐘',
      coverUrl: 'https://via.placeholder.com/400x200/2196F3/white?text=舒眠計畫',
      description: '在睡前放鬆身心，建立穩定且易入睡的節奏。',
      tracks: [
        { id: 'sleep_breath', title: '睡前呼吸', subtitle: '8 分鐘', lengthSec: 480, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
        { id: 'sleep_body', title: '身體沉降', subtitle: '10 分鐘', lengthSec: 600, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
        { id: 'sleep_story', title: '晚安引導', subtitle: '12 分鐘', lengthSec: 720, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
        { id: 'sleep_rain', title: '雨夜環境聲', subtitle: '10 分鐘', lengthSec: 600, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
      ],
    },
  }

  async getPacks(): Promise<ExplorePack[]> { return this.packs }
  async getTracks(): Promise<ExploreTrack[]> { return this.tracks }

  async getPacksFromApi(language: string = 'zh-CN'): Promise<ExplorePack[]> {
    try {
      const data = await getRealPacks()
      return data.map((p: any) => {
        let title = p.title
        let subtitle = p.subtitle || ''
        
        // 简单的翻译映射
        if (p.id === 'introduction') {
          if (language === 'zh-CN' || language === 'zh-TW') {
            title = '冥想入门'
            subtitle = '7 个练习 · 约 35 分钟'
          } else if (language === 'ja') {
            title = '瞑想入門'
            subtitle = '7 セッション · 約 35 分'
          }
        } else if (p.id === 'sleep') {
          if (language === 'zh-CN' || language === 'zh-TW') {
            title = '睡眠冥想'
            subtitle = '5 个练习 · 约 50 分钟'
          } else if (language === 'ja') {
            title = '睡眠瞑想'
            subtitle = '5 セッション · 約 50 分'
          }
        }
        
        return {
          id: p.id,
          title,
          subtitle,
          coverUrl: p.coverUrl || '',
          path: p.path || ''
        }
      })
    } catch (error) {
      console.warn('Failed to fetch packs from real API:', error)
      return []
    }
  }

  async getPackDetailFromApi(packId: string, language: string = 'zh-CN'): Promise<PackDetail | null> {
    try {
      console.log('getPackDetailFromApi called with packId:', packId, 'language:', language)
      const d = await getRealPackDetail(packId)
      if (!d) return null
      
      // 简单的翻译映射
      let title = d.title
      let subtitle = d.subtitle || ''
      let description = d.description || ''
      
      if (packId === 'introduction') {
        if (language === 'zh-CN' || language === 'zh-TW') {
          title = '冥想入门'
          subtitle = '7 个练习 · 约 35 分钟'
          description = '通过这个适合初学者的系列，学习正念冥想的基础知识。'
          console.log('Applied Chinese translation for introduction pack')
        } else if (language === 'ja') {
          title = '瞑想入門'
          subtitle = '7 セッション · 約 35 分'
          description = '初心者向けのシリーズでマインドフルネス瞑想の基礎を学びます。'
        }
      } else if (packId === 'sleep') {
        if (language === 'zh-CN' || language === 'zh-TW') {
          title = '睡眠冥想'
          subtitle = '5 个练习 · 约 50 分钟'
          description = '通过这些平静的冥想来放松身心，为安稳的睡眠做准备。'
          console.log('Applied Chinese translation for sleep pack')
        } else if (language === 'ja') {
          title = '睡眠瞑想'
          subtitle = '5 セッション · 約 50 分'
          description = 'これらの穏やかな瞑想で心身をリラックスさせ、安らかな睡眠の準備をします。'
        }
      }
      
      return {
        id: d.id,
        title,
        subtitle,
        coverUrl: d.coverUrl || '',
        description,
        tracks: (d.items || []).map((it: any) => {
          let trackTitle = it.title
          let trackSubtitle = it.subtitle || ''
          
          // 简单的轨道翻译
          if (packId === 'introduction') {
            if (language === 'zh-CN' || language === 'zh-TW') {
              if (it.id === 'intro_1') { trackTitle = '什么是冥想？'; trackSubtitle = '5 分钟' }
              else if (it.id === 'intro_2') { trackTitle = '呼吸冥想'; trackSubtitle = '10 分钟' }
              else if (it.id === 'intro_3') { trackTitle = '身体觉察'; trackSubtitle = '8 分钟' }
            } else if (language === 'ja') {
              if (it.id === 'intro_1') { trackTitle = '瞑想とは？'; trackSubtitle = '5 分' }
              else if (it.id === 'intro_2') { trackTitle = '呼吸瞑想'; trackSubtitle = '10 分' }
              else if (it.id === 'intro_3') { trackTitle = '身体の気づき'; trackSubtitle = '8 分' }
            }
          } else if (packId === 'sleep') {
            if (language === 'zh-CN' || language === 'zh-TW') {
              if (it.id === 'sleep_1') { trackTitle = '睡眠身体扫描'; trackSubtitle = '15 分钟' }
              else if (it.id === 'sleep_2') { trackTitle = '深度睡眠故事'; trackSubtitle = '20 分钟' }
              else if (it.id === 'sleep_3') { trackTitle = '睡前呼吸'; trackSubtitle = '10 分钟' }
              else if (it.id === 'sleep_4') { trackTitle = '雨夜环境声'; trackSubtitle = '15 分钟' }
              else if (it.id === 'sleep_5') { trackTitle = '温和入睡'; trackSubtitle = '12 分钟' }
            } else if (language === 'ja') {
              if (it.id === 'sleep_1') { trackTitle = '睡眠のためのボディスキャン'; trackSubtitle = '15 分' }
              else if (it.id === 'sleep_2') { trackTitle = '深い睡眠の物語'; trackSubtitle = '20 分' }
              else if (it.id === 'sleep_3') { trackTitle = '睡眠呼吸'; trackSubtitle = '10 分' }
              else if (it.id === 'sleep_4') { trackTitle = '雨の夜の音'; trackSubtitle = '15 分' }
              else if (it.id === 'sleep_5') { trackTitle = '優しい睡眠'; trackSubtitle = '12 分' }
            }
          }
          
          return {
            id: it.id,
            title: trackTitle,
            subtitle: trackSubtitle,
            lengthSec: it.duration || 0,
            audioUrl: it.audio?.[0]?.files?.[0]?.path || undefined,
          }
        })
      }
    } catch (error) {
      console.warn('Failed to fetch pack detail from real API:', error)
      return null
    }
  }

  async searchTracksFromApi(query: string): Promise<ExploreTrack[]> {
    try {
      const data = await searchRealTracks(query)
      return data.map((t: any) => ({
        id: t.id,
        title: t.title,
        subtitle: t.subtitle || '',
        coverUrl: t.coverUrl || '',
        path: t.path || '',
      }))
    } catch (error) {
      console.warn('Failed to search tracks from real API:', error)
      return []
    }
  }

  async search(query: string): Promise<{ packs: ExplorePack[]; tracks: ExploreTrack[] }> {
    const q = query.trim().toLowerCase()
    const packs = this.packs.filter(p => [p.title, p.subtitle].some(t => (t || '').toLowerCase().includes(q)))
    const tracks = this.tracks.filter(t => [t.title, t.subtitle].some(s => (s || '').toLowerCase().includes(q)))
    return { packs, tracks }
  }

  async getPackDetail(packId: string): Promise<PackDetail | null> {
    return this.packDetails[packId] ?? null
  }
}

export const exploreService = new ExploreServiceImpl()
export type { ExploreServiceImpl as ExploreService }


