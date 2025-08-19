import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { enUS, ja, zhCN, zhTW } from 'date-fns/locale'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { CalendarWidget } from '@/components/insights/CalendarWidget'
import { DailyInsightCard } from '@/components/insights/DailyInsightCard'
import { useLanguage } from '@/contexts/LanguageContext'

// Mock data for demo
// Case Study: Chinese International Student - Mood Journey (Monday-Saturday)
const mockMoodData = [
  { day: 'Mon', mood: 3, date: '2025-08-18' }, // Crisis Day - Language bullying incident
  { day: 'Tue', mood: 5, date: '2025-08-19' }, // Seeking Help - Meeting with counselor
  { day: 'Wed', mood: 6, date: '2025-08-20' }, // Small Victory - First friend connection
  { day: 'Thu', mood: 7, date: '2025-08-21' }, // Building Confidence - Academic success
  { day: 'Fri', mood: 5, date: '2025-08-22' }, // Facing Setback - PE class exclusion
  { day: 'Sat', mood: 8, date: '2025-08-23' }, // Integration and Growth - Study group belonging
]



export default function MoodScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date())
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

  // Case Study: Chinese International Student - Week Journey
  const getMockDailyInsights = () => [
    // Monday - Crisis Day
    {
      id: 'monday',
      date: new Date('2025-08-18'), // Monday
      summary: t('caseStudy.monday.summary'),
      psychologicalSupport: t('caseStudy.monday.support'),
      recommendation: t('caseStudy.monday.recommendation'),
      moodScore: 3,
      conversationCount: 5,
      keyTopics: [t('caseStudy.monday.topics.0'), t('caseStudy.monday.topics.1'), t('caseStudy.monday.topics.2')],
      emotionalPattern: t('caseStudy.monday.pattern'),
      positiveReframe: t('caseStudy.monday.reframe'),
      actionSuggestion: t('caseStudy.monday.action'),
      conversationAnalysis: {
        totalMessages: 38,
        emotionalJourney: [
          { time: '08:30', emotion: t('caseStudy.monday.emotions.0'), intensity: 6 },
          { time: '12:15', emotion: t('caseStudy.monday.emotions.1'), intensity: 9 },
          { time: '15:45', emotion: t('caseStudy.monday.emotions.2'), intensity: 8 },
          { time: '21:00', emotion: t('caseStudy.monday.emotions.3'), intensity: 9 }
        ],
        breakthroughs: [
          t('caseStudy.monday.breakthroughs.0'),
          t('caseStudy.monday.breakthroughs.1')
        ],
        concerningPatterns: [
          t('caseStudy.monday.concerns.0'),
          t('caseStudy.monday.concerns.1')
        ]
      }
    },
    // Tuesday - Seeking Help
    {
      id: 'tuesday',
      date: new Date('2025-08-19'), // Tuesday
      summary: t('caseStudy.tuesday.summary'),
      psychologicalSupport: t('caseStudy.tuesday.support'),
      recommendation: t('caseStudy.tuesday.recommendation'),
      moodScore: 5,
      conversationCount: 3,
      keyTopics: [t('caseStudy.tuesday.topics.0'), t('caseStudy.tuesday.topics.1'), t('caseStudy.tuesday.topics.2')],
      emotionalPattern: t('caseStudy.tuesday.pattern'),
      positiveReframe: t('caseStudy.tuesday.reframe'),
      actionSuggestion: t('caseStudy.tuesday.action'),
      conversationAnalysis: {
        totalMessages: 29,
        emotionalJourney: [
          { time: '09:00', emotion: t('caseStudy.tuesday.emotions.0'), intensity: 6 },
          { time: '13:30', emotion: t('caseStudy.tuesday.emotions.1'), intensity: 7 },
          { time: '16:20', emotion: t('caseStudy.tuesday.emotions.2'), intensity: 6 },
          { time: '20:15', emotion: t('caseStudy.tuesday.emotions.3'), intensity: 8 }
        ],
        breakthroughs: [
          t('caseStudy.tuesday.breakthroughs.0'),
          t('caseStudy.tuesday.breakthroughs.1'),
          t('caseStudy.tuesday.breakthroughs.2')
        ],
        concerningPatterns: []
      }
    },
    // Wednesday - Small Victory
    {
      id: 'wednesday',
      date: new Date('2025-08-20'), // Wednesday
      summary: t('caseStudy.wednesday.summary'),
      psychologicalSupport: t('caseStudy.wednesday.support'),
      recommendation: t('caseStudy.wednesday.recommendation'),
      moodScore: 6,
      conversationCount: 4,
      keyTopics: [t('caseStudy.wednesday.topics.0'), t('caseStudy.wednesday.topics.1'), t('caseStudy.wednesday.topics.2')],
      emotionalPattern: t('caseStudy.wednesday.pattern'),
      positiveReframe: t('caseStudy.wednesday.reframe'),
      actionSuggestion: t('caseStudy.wednesday.action'),
      conversationAnalysis: {
        totalMessages: 35,
        emotionalJourney: [
          { time: '10:15', emotion: t('caseStudy.wednesday.emotions.0'), intensity: 7 },
          { time: '14:30', emotion: t('caseStudy.wednesday.emotions.1'), intensity: 6 },
          { time: '17:00', emotion: t('caseStudy.wednesday.emotions.2'), intensity: 7 },
          { time: '19:45', emotion: t('caseStudy.wednesday.emotions.3'), intensity: 8 }
        ],
        breakthroughs: [
          t('caseStudy.wednesday.breakthroughs.0'),
          t('caseStudy.wednesday.breakthroughs.1'),
          t('caseStudy.wednesday.breakthroughs.2')
        ],
        concerningPatterns: []
      }
    },
    // Thursday - Building Confidence
    {
      id: 'thursday',
      date: new Date('2025-08-21'), // Thursday
      summary: t('caseStudy.thursday.summary'),
      psychologicalSupport: t('caseStudy.thursday.support'),
      recommendation: t('caseStudy.thursday.recommendation'),
      moodScore: 7,
      conversationCount: 3,
      keyTopics: [t('caseStudy.thursday.topics.0'), t('caseStudy.thursday.topics.1'), t('caseStudy.thursday.topics.2')],
      emotionalPattern: t('caseStudy.thursday.pattern'),
      positiveReframe: t('caseStudy.thursday.reframe'),
      actionSuggestion: t('caseStudy.thursday.action'),
      conversationAnalysis: {
        totalMessages: 24,
        emotionalJourney: [
          { time: '12:00', emotion: t('caseStudy.thursday.emotions.0'), intensity: 8 },
          { time: '14:15', emotion: t('caseStudy.thursday.emotions.1'), intensity: 8 },
          { time: '16:30', emotion: t('caseStudy.thursday.emotions.2'), intensity: 9 },
          { time: '20:00', emotion: t('caseStudy.thursday.emotions.3'), intensity: 8 }
        ],
        breakthroughs: [
          t('caseStudy.thursday.breakthroughs.0'),
          t('caseStudy.thursday.breakthroughs.1'),
          t('caseStudy.thursday.breakthroughs.2')
        ],
        concerningPatterns: []
      }
    },
    // Friday - Facing Setback
    {
      id: 'friday',
      date: new Date('2025-08-22'), // Friday
      summary: t('caseStudy.friday.summary'),
      psychologicalSupport: t('caseStudy.friday.support'),
      recommendation: t('caseStudy.friday.recommendation'),
      moodScore: 5,
      conversationCount: 4,
      keyTopics: [t('caseStudy.friday.topics.0'), t('caseStudy.friday.topics.1'), t('caseStudy.friday.topics.2')],
      emotionalPattern: t('caseStudy.friday.pattern'),
      positiveReframe: t('caseStudy.friday.reframe'),
      actionSuggestion: t('caseStudy.friday.action'),
      conversationAnalysis: {
        totalMessages: 41,
        emotionalJourney: [
          { time: '11:30', emotion: t('caseStudy.friday.emotions.0'), intensity: 7 },
          { time: '15:15', emotion: t('caseStudy.friday.emotions.1'), intensity: 6 },
          { time: '18:00', emotion: t('caseStudy.friday.emotions.2'), intensity: 7 },
          { time: '21:30', emotion: t('caseStudy.friday.emotions.3'), intensity: 7 }
        ],
        breakthroughs: [
          t('caseStudy.friday.breakthroughs.0'),
          t('caseStudy.friday.breakthroughs.1'),
          t('caseStudy.friday.breakthroughs.2')
        ],
        concerningPatterns: [
          t('caseStudy.friday.concerns.0')
        ]
      }
    },
    // Saturday - Integration and Growth
    {
      id: 'saturday',
      date: new Date('2025-08-23'), // Saturday
      summary: t('caseStudy.saturday.summary'),
      psychologicalSupport: t('caseStudy.saturday.support'),
      recommendation: t('caseStudy.saturday.recommendation'),
      moodScore: 8,
      conversationCount: 2,
      keyTopics: [t('caseStudy.saturday.topics.0'), t('caseStudy.saturday.topics.1'), t('caseStudy.saturday.topics.2')],
      emotionalPattern: t('caseStudy.saturday.pattern'),
      positiveReframe: t('caseStudy.saturday.reframe'),
      actionSuggestion: t('caseStudy.saturday.action'),
      conversationAnalysis: {
        totalMessages: 18,
        emotionalJourney: [
          { time: '10:00', emotion: t('caseStudy.saturday.emotions.0'), intensity: 6 },
          { time: '14:30', emotion: t('caseStudy.saturday.emotions.1'), intensity: 8 },
          { time: '17:45', emotion: t('caseStudy.saturday.emotions.2'), intensity: 9 },
          { time: '21:00', emotion: t('caseStudy.saturday.emotions.3'), intensity: 9 }
        ],
        breakthroughs: [
          t('caseStudy.saturday.breakthroughs.0'),
          t('caseStudy.saturday.breakthroughs.1'),
          t('caseStudy.saturday.breakthroughs.2')
        ],
        concerningPatterns: []
      }
    }
  ]

  const getSelectedDayInsight = () => {
    return getMockDailyInsights().find(insight => 
      insight.date.toDateString() === selectedDate.toDateString()
    )
  }

  const navigateToChat = () => {
    router.push('/chat')
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient */}
      <LinearGradient
        colors={['#8B5A8C', '#B5739E', '#D48FB0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="heart" size={28} color="#FFFFFF" />
          <Text style={styles.headerTitle}>{t('mood.title')}</Text>
        </View>
        <Text style={styles.headerSubtitle}>{t('mood.subtitle')}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calendar Widget - Main interface */}
        <CalendarWidget 
          moodData={mockMoodData}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Daily Insights - Show when date is selected */}
        <View style={styles.dailyInsightsSection}>
          <Text style={styles.sectionTitle}>
            {selectedDate.toDateString() === new Date().toDateString() 
              ? t('mood.todaysInsights')
              : t('mood.insightsFor', { 
                  date: format(selectedDate, 'EEEE, MMM d', { locale: getLocale() })
                })
            }
          </Text>
          
          {getSelectedDayInsight() ? (
            <DailyInsightCard 
              insight={getSelectedDayInsight()!} 
              onExpand={() => console.log('Expanding insight')}
            />
          ) : (
            <View style={styles.noInsightCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.noInsightGradient}
              >
                <Ionicons name="calendar-outline" size={48} color="#8B5A8C" style={styles.noInsightIcon} />
                <Text style={styles.noInsightTitle}>{t('mood.noConversations')}</Text>
                <Text style={styles.noInsightText}>
                  {t('mood.noConversationsText')}
                </Text>
                <TouchableOpacity 
                  style={styles.startConversationButton}
                  onPress={navigateToChat}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.startConversationText}>{t('mood.startConversation')}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dailyInsightsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  noInsightCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  noInsightGradient: {
    padding: 32,
    alignItems: 'center',
  },
  noInsightIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  noInsightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  noInsightText: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  startConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5A8C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  startConversationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
})