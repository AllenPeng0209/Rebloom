import { useLanguage } from '@/contexts/LanguageContext'
import { Ionicons } from '@expo/vector-icons'
import { addDays, endOfWeek, format, isSameDay, parseISO, startOfWeek, subDays } from 'date-fns'
import { enUS, ja, zhCN, zhTW } from 'date-fns/locale'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

interface CalendarDay {
  date: Date
  mood?: number
  hasConversation?: boolean
}

interface CalendarWidgetProps {
  onDateSelect: (date: Date) => void
  selectedDate?: Date
  moodData: Array<{ date: string; mood: number }>
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  onDateSelect,
  selectedDate = new Date(),
  moodData
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const { t, language } = useLanguage()
  
  const getLocale = () => {
    switch (language) {
      case 'zh-TW': return zhTW
      case 'zh-CN': return zhCN
      case 'ja': return ja
      case 'en': return enUS
      default: return zhTW
    }
  }

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday start
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })

  const weekDays = []
  for (let date = weekStart; date <= weekEnd; date = addDays(date, 1)) {
    const moodEntry = moodData.find(entry => 
      isSameDay(parseISO(entry.date), date)
    )
    
    weekDays.push({
      date,
      mood: moodEntry?.mood,
      hasConversation: !!moodEntry
    })
  }

  const getMoodColor = (mood?: number) => {
    if (!mood) return 'rgba(107, 107, 107, 0.2)'
    if (mood <= 3) return '#FF6B6B'      // Red for low mood
    if (mood <= 5) return '#FFB366'      // Orange for below average
    if (mood <= 7) return '#FFD93D'      // Yellow for neutral
    if (mood <= 8) return '#6BCF7F'      // Light green for good
    return '#4CAF50'                     // Green for excellent
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(direction === 'next' 
      ? addDays(currentWeek, 7) 
      : subDays(currentWeek, 7)
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigateWeek('prev')}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={20} color="#4A90E2" />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {format(currentWeek, 'MMMM yyyy', { locale: getLocale() })}
          </Text>
          
          <TouchableOpacity 
            onPress={() => navigateWeek('next')}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <View style={styles.weekContainer}>
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day.date, selectedDate)
            const isToday = isSameDay(day.date, new Date())
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayContainer,
                  isSelected && styles.dayContainerSelected,
                  isToday && styles.dayContainerToday,
                ]}
                onPress={() => onDateSelect(day.date)}
                activeOpacity={0.8}
              >
                {/* Day Label */}
                <Text style={styles.dayLabel}>
                  {format(day.date, 'EEE', { locale: getLocale() })}
                </Text>
                
                {/* Date Number */}
                <View style={[
                  styles.dateNumber,
                  isSelected && styles.dateNumberSelected,
                  isToday && styles.dateNumberToday,
                ]}>
                  <Text style={[
                    styles.dateText,
                    isSelected && styles.dateTextSelected,
                    isToday && styles.dateTextToday,
                  ]}>
                    {format(day.date, 'd')}
                  </Text>
                </View>

                {/* Mood Indicator */}
                {day.mood && (
                  <View style={[
                    styles.moodIndicator,
                    { backgroundColor: getMoodColor(day.mood) }
                  ]} />
                )}

                {/* Conversation Indicator */}
                {day.hasConversation && (
                  <View style={styles.conversationIndicator}>
                    <View style={styles.conversationDot} />
                  </View>
                )}


              </TouchableOpacity>
            )
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>{t('mood.goodDay')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFD93D' }]} />
            <Text style={styles.legendText}>{t('mood.neutral')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>{t('mood.toughDay')}</Text>
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 12,
    position: 'relative',
  },
  dayContainerSelected: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  dayContainerToday: {
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
  },
  dayLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateNumberSelected: {
    backgroundColor: '#4A90E2',
  },
  dateNumberToday: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  dateTextToday: {
    color: '#4A90E2',
  },
  moodIndicator: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
  },
  conversationIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  conversationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A90E2',
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '500',
  },
})