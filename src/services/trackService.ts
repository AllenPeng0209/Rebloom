import { getRealTrackDetail } from './realMeditoApi'

export interface TrackDetail {
  id: string
  title: string
  subtitle?: string
  description?: string
  coverUrl?: string
  audio: AudioFile[]
  artist?: {
    name: string
    path?: string
  }
  lengthSec: number
}

export interface AudioFile {
  id: string
  guideName?: string
  files: TrackFile[]
}

export interface TrackFile {
  id: string
  path: string
  duration: number
}

class TrackServiceImpl {
  async getTrackDetail(trackId: string): Promise<TrackDetail | null> {
    try {
      const data = await getRealTrackDetail(trackId)
      if (!data) {
        console.warn('Track not found:', trackId)
        return null
      }
      
      return {
        id: data.id,
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        coverUrl: data.coverUrl || '',
        audio: (data.audio || []).map((audio: any) => ({
          id: audio.id || '',
          guideName: audio.guideName || '',
          files: (audio.files || []).map((file: any) => ({
            id: file.id || '',
            path: file.path || '',
            duration: file.duration || 0,
          }))
        })),
        artist: data.audio?.[0]?.guideName ? {
          name: data.audio[0].guideName,
          path: '',
        } : undefined,
        lengthSec: data.duration || 0,
      }
    } catch (error) {
      console.warn('Failed to fetch track detail from real API:', error)
      return null
    }
  }
}

export const trackService = new TrackServiceImpl()
