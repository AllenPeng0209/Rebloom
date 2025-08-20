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

  async getPacksFromApi(): Promise<ExplorePack[]> {
    try {
      const data = await getRealPacks()
      return data.map((p: any) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle || '',
        coverUrl: p.coverUrl || '',
        path: p.path || ''
      }))
    } catch (error) {
      console.warn('Failed to fetch packs from real API:', error)
      return []
    }
  }

  async getPackDetailFromApi(packId: string): Promise<PackDetail | null> {
    try {
      const d = await getRealPackDetail(packId)
      if (!d) return null
      return {
        id: d.id,
        title: d.title,
        subtitle: d.subtitle || '',
        coverUrl: d.coverUrl || '',
        description: d.description || '',
        tracks: (d.items || []).map((it: any) => ({
          id: it.id,
          title: it.title,
          subtitle: it.subtitle || '',
          lengthSec: it.duration || 0,
          audioUrl: it.audio?.[0]?.files?.[0]?.path || undefined,
        }))
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


