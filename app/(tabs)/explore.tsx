import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { MoodTrendCard } from '@/components/insights/MoodTrendCard'
import { WeeklyInsight } from '@/components/insights/WeeklyInsight'
import { useLanguage } from '@/contexts/LanguageContext'

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

  const averageMood = mockMoodData.reduce((sum, day) => sum + day.mood, 0) / mockMoodData.length

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
        <Text style={styles.headerTitle}>{t('explore.title')}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.summaryGradient}
          >
            <Text style={styles.summaryTitle}>{t('explore.thisWeek')}</Text>
            <View style={styles.summaryStats}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{averageMood.toFixed(1)}</Text>
                <Text style={styles.statLabel}>{t('explore.averageMood')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{mockMoodData.length}</Text>
                <Text style={styles.statLabel}>{t('explore.daysTracked')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>{t('explore.insights')}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', '3months'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'week' ? t('explore.7days') : period === 'month' ? t('explore.30days') : t('explore.3months')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mood Trend Chart */}
        <MoodTrendCard data={mockMoodData} />

        {/* Progress Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>{t('explore.weeklyPatterns')}</Text>
          {mockInsights.map((insight) => (
            <WeeklyInsight
              key={insight.id}
              insight={{
                ...insight,
                title: t(insight.titleKey),
                description: t(insight.descriptionKey)
              }}
              onPress={() => {
                console.log('Insight pressed:', insight.id)
              }}
            />
          ))}
        </View>

        {/* Goals Progress */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>{t('explore.yourGoals')}</Text>
          <View style={styles.goalCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.goalGradient}
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{t('explore.dailyMoodCheckins')}</Text>
                <Text style={styles.goalProgress}>{t('explore.daysProgress', { current: '7', total: '7' })}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
              <Text style={styles.goalDescription}>
                {t('explore.moodTrackingSuccess')}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.goalCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.goalGradient}
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{t('explore.mindfulnessPractice')}</Text>
                <Text style={styles.goalProgress}>{t('explore.daysProgress', { current: '4', total: '7' })}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '57%' }]} />
              </View>
              <Text style={styles.goalDescription}>
                {t('explore.mindfulnessProgress')}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
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
