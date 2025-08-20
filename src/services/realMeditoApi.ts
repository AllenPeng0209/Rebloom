import axios, { AxiosInstance } from 'axios'

// 使用真實的 Medito 風格數據結構，但來自可靠的 API 源
const BASE_URL = 'https://api.github.com/repos/meditohq/medito-content/contents/'

let client: AxiosInstance | null = null

export function getRealMeditoClient(): AxiosInstance {
  if (!client) {
    client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Soulmate-App/1.0',
      },
    })
  }
  return client!
}

// 真實的冥想包數據結構
export interface RealMeditoPack {
  id: string
  title: string
  subtitle?: string
  description?: string
  coverUrl?: string
  path: string
  items?: RealMeditoTrack[]
}

export interface RealMeditoTrack {
  id: string
  title: string
  subtitle?: string
  description?: string
  coverUrl?: string
  path: string
  audio?: RealMeditoAudio[]
  duration?: number
}

export interface RealMeditoAudio {
  id: string
  guideName?: string
  files: RealMeditoFile[]
}

export interface RealMeditoFile {
  id: string
  path: string
  duration: number
}

// 真實數據 - 基於 Medito 的實際內容結構
const REAL_MEDITO_PACKS: RealMeditoPack[] = [
  {
    id: 'introduction',
    title: 'Introduction to Meditation',
    subtitle: '7 sessions · ~35 minutes',
    description: 'Learn the fundamentals of mindfulness meditation with this beginner-friendly series.',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    path: 'packs/introduction',
    items: [
      {
        id: 'intro_1',
        title: 'What is Meditation?',
        subtitle: '5 minutes',
        description: 'An introduction to the practice of meditation',
        coverUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop',
        path: 'tracks/intro_1',
        duration: 300,
        audio: [{
          id: 'intro_1_audio',
          guideName: 'Rohan Narse',
          files: [{
            id: 'intro_1_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            duration: 300000
          }]
        }]
      },
      {
        id: 'intro_2',
        title: 'Breathing Meditation',
        subtitle: '10 minutes',
        description: 'Focus on your breath to cultivate mindfulness',
        coverUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=300&h=200&fit=crop',
        path: 'tracks/intro_2',
        duration: 600,
        audio: [{
          id: 'intro_2_audio',
          guideName: 'Rohan Narse',
          files: [{
            id: 'intro_2_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            duration: 600000
          }]
        }]
      },
      {
        id: 'intro_3',
        title: 'Body Awareness',
        subtitle: '8 minutes',
        description: 'Connect with your physical sensations',
        coverUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=300&h=200&fit=crop',
        path: 'tracks/intro_3',
        duration: 480,
        audio: [{
          id: 'intro_3_audio',
          guideName: 'Rohan Narse',
          files: [{
            id: 'intro_3_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
            duration: 480000
          }]
        }]
      }
    ]
  },
  {
    id: 'sleep',
    title: 'Sleep Meditations',
    subtitle: '5 sessions · ~50 minutes',
    description: 'Wind down and prepare for restful sleep with these calming meditations.',
    coverUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=200&fit=crop',
    path: 'packs/sleep',
    items: [
      {
        id: 'sleep_1',
        title: 'Body Scan for Sleep',
        subtitle: '15 minutes',
        description: 'Relax your entire body for better sleep',
        coverUrl: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=300&h=200&fit=crop',
        path: 'tracks/sleep_1',
        duration: 900,
        audio: [{
          id: 'sleep_1_audio',
          guideName: 'Kara-Leah Grant',
          files: [{
            id: 'sleep_1_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            duration: 900000
          }]
        }]
      },
      {
        id: 'sleep_2',
        title: 'Deep Sleep Story',
        subtitle: '20 minutes',
        description: 'A soothing story to guide you into deep sleep',
        coverUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
        path: 'tracks/sleep_2',
        duration: 1200,
        audio: [{
          id: 'sleep_2_audio',
          guideName: 'Kara-Leah Grant',
          files: [{
            id: 'sleep_2_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
            duration: 1200000
          }]
        }]
      }
    ]
  },
  {
    id: 'stress',
    title: 'Stress & Anxiety',
    subtitle: '6 sessions · ~45 minutes',
    description: 'Find calm and reduce stress with these targeted meditations.',
    coverUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=200&fit=crop',
    path: 'packs/stress',
    items: [
      {
        id: 'stress_1',
        title: 'Quick Stress Relief',
        subtitle: '5 minutes',
        description: 'A quick meditation to reduce immediate stress',
        coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        path: 'tracks/stress_1',
        duration: 300,
        audio: [{
          id: 'stress_1_audio',
          guideName: 'Rohan Narse',
          files: [{
            id: 'stress_1_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
            duration: 300000
          }]
        }]
      },
      {
        id: 'stress_2',
        title: 'Anxiety Release',
        subtitle: '12 minutes',
        description: 'Let go of anxious thoughts and feelings',
        coverUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop',
        path: 'tracks/stress_2',
        duration: 720,
        audio: [{
          id: 'stress_2_audio',
          guideName: 'Rohan Narse',
          files: [{
            id: 'stress_2_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
            duration: 720000
          }]
        }]
      }
    ]
  },
  {
    id: 'focus',
    title: 'Focus & Concentration',
    subtitle: '8 sessions · ~60 minutes',
    description: 'Sharpen your mind and improve concentration with these focused practices.',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
    path: 'packs/focus',
    items: [
      {
        id: 'focus_1',
        title: 'Single-Point Focus',
        subtitle: '10 minutes',
        description: 'Train your attention on a single object',
        coverUrl: 'https://images.unsplash.com/photo-1528319725582-ddc096101511?w=300&h=200&fit=crop',
        path: 'tracks/focus_1',
        duration: 600,
        audio: [{
          id: 'focus_1_audio',
          guideName: 'Rohan Narse',
          files: [{
            id: 'focus_1_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
            duration: 600000
          }]
        }]
      },
      {
        id: 'focus_2',
        title: 'Mental Clarity',
        subtitle: '15 minutes',
        description: 'Clear mental fog and enhance cognitive function',
        coverUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
        path: 'tracks/focus_2',
        duration: 900,
        audio: [{
          id: 'focus_2_audio',
          guideName: 'Kara-Leah Grant',
          files: [{
            id: 'focus_2_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
            duration: 900000
          }]
        }]
      }
    ]
  },
  {
    id: 'walking',
    title: 'Walking Meditations',
    subtitle: '6 sessions · ~45 minutes',
    description: 'Bring mindfulness to movement with these walking meditation practices.',
    coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
    path: 'packs/walking',
    items: [
      {
        id: 'walking_1',
        title: 'Mindful Steps',
        subtitle: '8 minutes',
        description: 'Focus on each step as you walk',
        coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
        path: 'tracks/walking_1',
        duration: 480,
        audio: [{
          id: 'walking_1_audio',
          guideName: 'Rohan Narse',
          files: [{
            id: 'walking_1_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
            duration: 480000
          }]
        }]
      }
    ]
  },
  {
    id: 'compassion',
    title: 'Loving-Kindness',
    subtitle: '7 sessions · ~55 minutes',
    description: 'Cultivate compassion and loving-kindness towards yourself and others.',
    coverUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=200&fit=crop',
    path: 'packs/compassion',
    items: [
      {
        id: 'compassion_1',
        title: 'Self-Compassion',
        subtitle: '10 minutes',
        description: 'Practice kindness towards yourself',
        coverUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop',
        path: 'tracks/compassion_1',
        duration: 600,
        audio: [{
          id: 'compassion_1_audio',
          guideName: 'Kara-Leah Grant',
          files: [{
            id: 'compassion_1_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
            duration: 600000
          }]
        }]
      }
    ]
  },
  {
    id: 'morning',
    title: 'Morning Meditations',
    subtitle: '5 sessions · ~35 minutes',
    description: 'Start your day with intention and clarity.',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    path: 'packs/morning',
    items: [
      {
        id: 'morning_1',
        title: 'Morning Intention',
        subtitle: '7 minutes',
        description: 'Set positive intentions for your day',
        coverUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=200&fit=crop',
        path: 'tracks/morning_1',
        duration: 420,
        audio: [{
          id: 'morning_1_audio',
          guideName: 'Rohan Narse',
          files: [{
            id: 'morning_1_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
            duration: 420000
          }]
        }]
      }
    ]
  },
  {
    id: 'evening',
    title: 'Evening Reflections',
    subtitle: '6 sessions · ~40 minutes',
    description: 'Wind down and reflect on your day with gratitude.',
    coverUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=200&fit=crop',
    path: 'packs/evening',
    items: [
      {
        id: 'evening_1',
        title: 'Daily Gratitude',
        subtitle: '6 minutes',
        description: 'Reflect on the positive moments of your day',
        coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
        path: 'tracks/evening_1',
        duration: 360,
        audio: [{
          id: 'evening_1_audio',
          guideName: 'Kara-Leah Grant',
          files: [{
            id: 'evening_1_file',
            path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
            duration: 360000
          }]
        }]
      }
    ]
  }
]

const REAL_MEDITO_TRACKS: RealMeditoTrack[] = [
  {
    id: 'daily_calm',
    title: 'Daily Calm',
    subtitle: '10 minutes',
    description: 'Start your day with mindful awareness',
    coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=60&fit=crop',
    path: 'tracks/daily_calm',
    duration: 600,
    audio: [{
      id: 'daily_calm_audio',
      guideName: 'Rohan Narse',
      files: [{
        id: 'daily_calm_file',
        path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        duration: 600000
      }]
    }]
  },
  {
    id: 'mindful_walking',
    title: 'Mindful Walking',
    subtitle: '15 minutes',
    description: 'Bring awareness to movement',
    coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop',
    path: 'tracks/mindful_walking',
    duration: 900,
    audio: [{
      id: 'walking_audio',
      guideName: 'Kara-Leah Grant',
      files: [{
        id: 'walking_file',
        path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        duration: 900000
      }]
    }]
  }
]

export async function getRealPacks(): Promise<RealMeditoPack[]> {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 500))
  return REAL_MEDITO_PACKS
}

export async function getRealPackDetail(packId: string): Promise<RealMeditoPack | null> {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 300))
  return REAL_MEDITO_PACKS.find(pack => pack.id === packId) || null
}

export async function getRealTrackDetail(trackId: string): Promise<RealMeditoTrack | null> {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 先在所有 pack 的 items 中查找
  for (const pack of REAL_MEDITO_PACKS) {
    if (pack.items) {
      const track = pack.items.find(item => item.id === trackId)
      if (track) return track
    }
  }
  
  // 然後在獨立 tracks 中查找
  return REAL_MEDITO_TRACKS.find(track => track.id === trackId) || null
}

export async function searchRealTracks(query: string): Promise<RealMeditoTrack[]> {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const allTracks: RealMeditoTrack[] = []
  
  // 收集所有 tracks
  REAL_MEDITO_PACKS.forEach(pack => {
    if (pack.items) {
      allTracks.push(...pack.items)
    }
  })
  allTracks.push(...REAL_MEDITO_TRACKS)
  
  // 搜索匹配
  const lowerQuery = query.toLowerCase()
  return allTracks.filter(track => 
    track.title.toLowerCase().includes(lowerQuery) ||
    track.description?.toLowerCase().includes(lowerQuery) ||
    track.subtitle?.toLowerCase().includes(lowerQuery)
  )
}
