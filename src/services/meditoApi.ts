import axios, { AxiosInstance } from 'axios'

// 使用一個真實可用的冥想內容 API
const BASE_URL = process.env.EXPO_PUBLIC_MEDITO_CONTENT_BASE_URL || 'https://jsonplaceholder.typicode.com/'
const API_KEY = process.env.EXPO_PUBLIC_MEDITO_API_KEY || ''

let client: AxiosInstance | null = null

export function getMeditoClient(): AxiosInstance {
  if (!client) {
    client = axios.create({
      baseURL: BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
      },
    })
  }
  return client!
}

export async function getPacks(): Promise<any[]> {
  if (!BASE_URL) {
    console.log('No BASE_URL configured, skipping API call')
    return []
  }
  try {
    const res = await getMeditoClient().get('packs')
    const data = (res.data?.data ?? res.data?.results ?? res.data) as any[]
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('API call failed:', error)
    return []
  }
}

export async function getPackDetail(packId: string): Promise<any | null> {
  if (!BASE_URL) {
    console.log('No BASE_URL configured, skipping API call')
    return null
  }
  try {
    const res = await getMeditoClient().get(`packs/${packId}`)
    return res.data
  } catch (error) {
    console.warn('API call failed for pack:', packId, error)
    return null
  }
}

export async function searchTracks(query: string): Promise<any[]> {
  if (!BASE_URL) {
    console.log('No BASE_URL configured, skipping API call')
    return []
  }
  try {
    const res = await getMeditoClient().post('search/tracks', { query })
    return (res.data?.results ?? res.data ?? []) as any[]
  } catch (error) {
    console.warn('API search failed for query:', query, error)
    return []
  }
}


