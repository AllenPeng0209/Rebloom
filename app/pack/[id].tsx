import type { PackDetail } from '@/services/exploreService'
import { exploreService } from '@/services/exploreService'
import { interventionService } from '@/services/interventionService'
import { trackService } from '@/services/trackService'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function PackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [pack, setPack] = useState<PackDetail | null>(null)

  const loadPackDetail = async (packId: string) => {
    try {
      // 先嘗試從 API 獲取
      const apiPack = await exploreService.getPackDetailFromApi(packId)
      if (apiPack) {
        setPack(apiPack)
      } else {
        // 回退到本地數據
        const localPack = await exploreService.getPackDetail(packId)
        setPack(localPack)
      }
    } catch (error) {
      console.warn('Failed to load pack from API, using local data:', error)
      const localPack = await exploreService.getPackDetail(packId)
      setPack(localPack)
    }
  }

  useEffect(() => {
    if (id) {
      loadPackDetail(String(id))
    }
    return () => { interventionService.stop() }
  }, [id])

  if (!pack) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#333', padding: 20 }}>載入中…</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Image 
          source={{ uri: pack.coverUrl || 'https://via.placeholder.com/400x200/4CAF50/white?text=Medito+Course' }} 
          style={styles.cover} 
          contentFit="cover" 
          placeholder="https://via.placeholder.com/400x200/E0E0E0/666?text=Loading..."
        />
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Text style={styles.title}>{pack.title}</Text>
          <Text style={styles.subtitle}>{pack.subtitle}</Text>
          {!!pack.description && <Text style={styles.desc}>{pack.description}</Text>}
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
          {pack.tracks.map((t: any) => (
            <TouchableOpacity
              key={t.id}
              style={styles.trackRow}
              onPress={async () => {
                try {
                  // 先嘗試獲取完整的 track 詳情
                  const trackDetail = await trackService.getTrackDetail(t.id)
                  if (trackDetail && trackDetail.audio.length > 0) {
                    // 使用第一個音檔進行播放
                    const firstAudio = trackDetail.audio[0]
                    if (firstAudio.files.length > 0) {
                      const audioUrl = firstAudio.files[0].path
                      console.log('Playing track from API:', trackDetail.title, audioUrl)
                      // 導航到播放器頁面
                      router.push(`/player/${t.id}`)
                      return
                    }
                  }
                  // 回退到現有邏輯
                  await interventionService.start({ id: t.id, category: 'meditation', title: t.title, lengthSec: t.lengthSec, audioUrl: t.audioUrl })
                } catch (error) {
                  console.error('Failed to play track:', error)
                  // 回退到現有邏輯
                  try {
                    await interventionService.start({ id: t.id, category: 'meditation', title: t.title, lengthSec: t.lengthSec, audioUrl: t.audioUrl })
                  } catch (fallbackError) {
                    console.error('Fallback play also failed:', fallbackError)
                  }
                }
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.trackTitle}>{t.title}</Text>
                {!!t.subtitle && <Text style={styles.trackSubtitle}>{t.subtitle}</Text>}
              </View>
              <Text style={styles.play}>播放</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  cover: { width: '100%', height: 220 },
  title: { fontSize: 24, fontWeight: '800', color: '#222' },
  subtitle: { marginTop: 6, color: '#666', fontSize: 14 },
  desc: { marginTop: 10, color: '#555', lineHeight: 20 },
  trackRow: { backgroundColor: '#F7F8FA', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center' },
  trackTitle: { color: '#222', fontSize: 16, fontWeight: '700' },
  trackSubtitle: { color: '#777', fontSize: 12, marginTop: 2 },
  play: { color: '#2B6CB0', fontWeight: '700' },
})


