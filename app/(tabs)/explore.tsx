import CourseCard from '@/components/explore/CourseCard'
import { useLanguage } from '@/contexts/LanguageContext'
import type { ExplorePack, ExploreTrack } from '@/services/exploreService'
import { exploreService } from '@/services/exploreService'
import { interventionService } from '@/services/interventionService'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Mock data for demo
const mockMoodData = [
  { day: 'Mon', mood: 6, date: '2025-08-12' },
  { day: 'Tue', mood: 7, date: '2025-08-13' },
  { day: 'Wed', mood: 5, date: '2025-08-14' },
  { day: 'Thu', mood: 8, date: '2025-08-15' },
  { day: 'Fri', mood: 7, date: '2025-08-16' },
  { day: 'Sat', mood: 9, date: '2025-08-17' },
  { day: 'Sun', mood: 8, date: '2025-08-18' },
]


interface InsightData {
  id: string
  type: 'pattern' | 'progress' | 'achievement' | 'recommendation'
  titleKey: string
  descriptionKey: string
  confidence: number
  icon: string
}

const mockInsights: InsightData[] = [
  {
    id: '1',
    type: 'pattern' as const,
    titleKey: 'weeklyInsight.moodImproves',
    descriptionKey: 'weeklyInsight.moodImprovesDesc',
    confidence: 85,
    icon: 'calendar-outline',
  },
  {
    id: '2', 
    type: 'progress' as const,
    titleKey: 'weeklyInsight.consistentImprovement',
    descriptionKey: 'weeklyInsight.consistentImprovementDesc',
    confidence: 78,
    icon: 'trending-up-outline',
  },
  {
    id: '3',
    type: 'achievement' as const,
    titleKey: 'weeklyInsight.checkinsCompleted',
    descriptionKey: 'weeklyInsight.checkinsCompletedDesc',
    confidence: 100,
    icon: 'checkmark-circle-outline',
  },
]

export default function ExploreScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | '3months'>('week')
  const { t } = useLanguage()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [packs, setPacks] = useState<ExplorePack[]>([])
  const [tracks, setTracks] = useState<ExploreTrack[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      // 先嘗試從 API 獲取，失敗則使用本地數據
      const apiPacks = await exploreService.getPacksFromApi()
      if (apiPacks.length > 0) {
        setPacks(apiPacks)
      } else {
        const localPacks = await exploreService.getPacks()
        setPacks(localPacks)
      }
      
      const tracks = await exploreService.getTracks()
      setTracks(tracks)
    } catch (error) {
      console.warn('Failed to load from API, using local data:', error)
      const [localPacks, localTracks] = await Promise.all([
        exploreService.getPacks(),
        exploreService.getTracks()
      ])
      setPacks(localPacks)
      setTracks(localTracks)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 預載入 manifest（使用內建預設或外部檔）
    interventionService.loadManifest().catch(() => {})
    // 初次載入 explore 資料
    loadData()
    return () => {
      interventionService.stop()
    }
  }, [])

  const averageMood = mockMoodData.reduce((sum, day) => sum + day.mood, 0) / mockMoodData.length

  const onRefresh = async () => {
    if (!searchQuery) {
      await loadData()
    } else {
      setLoading(true)
      try {
        // 嘗試從 API 搜索，失敗則使用本地搜索
        try {
          const apiResults = await exploreService.searchTracksFromApi(searchQuery)
          setTracks(apiResults)
          // 搜索時不更新 packs，保持原有的 packs
        } catch (error) {
          console.warn('API search failed, using local search:', error)
          const { packs: ps, tracks: ts } = await exploreService.search(searchQuery)
          setPacks(ps)
          setTracks(ts)
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const onChangeSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const q = value.replace(/[^\x00-\x7F]/g, '')
      setSearchQuery(q)
      setLoading(true)
      try {
        if (!q) {
          const [p, t] = await Promise.all([exploreService.getPacks(), exploreService.getTracks()])
          setPacks(p)
          setTracks(t)
        } else {
          const { packs: ps, tracks: ts } = await exploreService.search(q)
          setPacks(ps)
          setTracks(ts)
        }
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  const showPacksHeader = useMemo(() => searchQuery.length > 0 && packs.length > 0, [searchQuery, packs])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient */}
      <LinearGradient
        colors={['#4A90E2', '#7FB3D3', '#B4D6CD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('explore.pageTitle')}</Text>
        <Text style={styles.headerSubtitle}>{t('explore.pageSubtitle')}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Today's Recommended Actions */}
        <View>
          <Text style={styles.sectionTitle}>{t('explore.todayRecommended')}</Text>
          <MasonryPacks packs={packs.slice(0, 2)} />
        </View>

        {/* Explore Packs / Tracks like Medito */}
        {searchQuery.length === 0 ? (
          <View>
            <Text style={styles.sectionTitle}>{t('explore.recommendedTopics')}</Text>
            <MasonryPacks packs={packs} />
          </View>
        ) : (
          <View>
            {showPacksHeader && <Text style={styles.sectionTitle}>{t('explore.topics')}</Text>}
            {showPacksHeader && <MasonryPacks packs={packs} />}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>{t('explore.episodes')}</Text>
            <View style={{ gap: 12 }}>
              {tracks.map((t) => (
                <TrackRow key={t.id} track={t} />
              ))}
            </View>
          </View>
        )}
        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function PackCard({ pack, coverHeight = 120 }: { pack: ExplorePack; coverHeight?: number }) {
  return (
    <Link href={{ pathname: '/pack/[id]', params: { id: pack.id } }} asChild>
      <CourseCard
        title={pack.title}
        subtitle={pack.subtitle}
        coverUrl={pack.coverUrl || '/assets/images/react-logo.png'}
        coverHeight={coverHeight}
      />
    </Link>
  )
}

function MasonryPacks({ packs }: { packs: ExplorePack[] }) {
  const columnGap = 16
  const colWidth = (SCREEN_WIDTH - 20 * 2 - columnGap) / 2

  type Item = { pack: ExplorePack; height: number }
  const estimateHeight = (p: ExplorePack): number => {
    const base = 110
    const variance = (p.title.length % 3) * 20
    return base + variance
  }

  const left: Item[] = []
  const right: Item[] = []
  let lh = 0
  let rh = 0
  packs.forEach((p) => {
    const h = estimateHeight(p)
    if (lh <= rh) {
      left.push({ pack: p, height: h })
      lh += h
    } else {
      right.push({ pack: p, height: h })
      rh += h
    }
  })

  return (
    <View style={styles.masonryRow}>
      <View style={{ width: colWidth }}>
        {left.map(({ pack, height }) => (
          <View key={pack.id} style={{ marginBottom: 16 }}>
            <PackCard pack={pack} coverHeight={height} />
          </View>
        ))}
      </View>
      <View style={{ width: colWidth, marginLeft: columnGap }}>
        {right.map(({ pack, height }) => (
          <View key={pack.id} style={{ marginBottom: 16 }}>
            <PackCard pack={pack} coverHeight={height} />
          </View>
        ))}
      </View>
    </View>
  )
}

function TrackRow({ track }: { track: ExploreTrack }) {
  return (
    <TouchableOpacity style={styles.trackRow} onPress={() => {}}>
      <Image 
        source={{ uri: track.coverUrl || 'https://via.placeholder.com/60x60/4CAF50/white?text=M' }} 
        style={styles.trackCover} 
        contentFit="cover" 
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.trackSubtitle} numberOfLines={1}>{track.subtitle}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  // 移除搜尋樣式
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  masonryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  packCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  packCover: { width: '100%', borderRadius: 10, marginBottom: 8 },
  packTitle: { color: '#2C2C2E', fontWeight: '700', fontSize: 16 },
  packSubtitle: { color: '#6B6B6B', fontSize: 12, marginTop: 2 },
  trackRow: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  trackCover: { width: 64, height: 64, borderRadius: 10, marginRight: 12 },
  trackTitle: { color: '#2C2C2E', fontWeight: '700', fontSize: 16 },
  trackSubtitle: { color: '#6B6B6B', fontSize: 12, marginTop: 2 },
  summaryCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryGradient: {
    padding: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 16,
    textAlign: 'center',
  },

  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(107, 107, 107, 0.3)',
    marginHorizontal: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  periodButtonTextActive: {
    color: '#2C2C2E',
  },
  insightsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  goalsSection: {
    marginBottom: 24,
  },
  goalCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalGradient: {
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    flex: 1,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
  },
})
