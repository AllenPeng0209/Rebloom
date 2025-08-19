import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import {
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { useLanguage } from '@/contexts/LanguageContext'

interface MoodData {
  day: string
  mood: number
  date: string
}

interface MoodTrendCardProps {
  data: MoodData[]
}

export const MoodTrendCard: React.FC<MoodTrendCardProps> = ({ data }) => {
  const maxMood = Math.max(...data.map(d => d.mood))
  const minMood = Math.min(...data.map(d => d.mood))
  const { t } = useLanguage()

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return '#FF6B6B'      // Red for low mood
    if (mood <= 5) return '#FFB366'      // Orange for below average
    if (mood <= 7) return '#FFD93D'      // Yellow for neutral
    if (mood <= 8) return '#6BCF7F'      // Light green for good
    return '#4CAF50'                     // Green for excellent
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.gradient}
      >
        <Text style={styles.title}>{t('mood.moodThisWeek')}</Text>
        
        {/* Chart */}
        <View style={styles.chart}>
          {data.map((item, index) => {
            const height = ((item.mood - 1) / 9) * 120 // Scale to chart height
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: height,
                        backgroundColor: getMoodColor(item.mood)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.dayLabel}>{item.day}</Text>
              </View>
            )
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>{t('mood.low')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFD93D' }]} />
            <Text style={styles.legendText}>{t('mood.neutral')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>{t('mood.high')}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 20,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    marginBottom: 16,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barBackground: {
    width: 24,
    height: 120,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '500',
  },
})