import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { enUS, ja, zhCN, zhTW } from 'date-fns/locale'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import {
    LayoutAnimation,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { useLanguage } from '@/contexts/LanguageContext'

interface DailyInsight {
  id: string
  date: Date
  summary: string
  psychologicalSupport: string
  recommendation: string
  moodScore: number
  conversationCount: number
  keyTopics: string[]
  emotionalPattern: string
  positiveReframe: string
  actionSuggestion: string
  conversationAnalysis?: {
    totalMessages: number
    emotionalJourney: Array<{ time: string; emotion: string; intensity: number }>
    breakthroughs: string[]
    concerningPatterns: string[]
  }
}

interface DailyInsightCardProps {
  insight: DailyInsight
  onExpand?: () => void
}

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({
  insight,
  onExpand
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
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

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊'
    if (score >= 6) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 2) return '😔'
    return '😢'
  }

  const getMoodColor = (score: number) => {
    if (score >= 8) return '#4CAF50'
    if (score >= 6) return '#6BCF7F'
    if (score >= 4) return '#FFD93D'
    if (score >= 2) return '#FFB366'
    return '#FF6B6B'
  }

  const handleToggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsExpanded(!isExpanded)
    onExpand?.()
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.gradient}
      >
        {/* Header */}
        <TouchableOpacity 
          style={styles.header}
          onPress={handleToggleExpand}
          activeOpacity={0.8}
        >
          <View style={styles.dateSection}>
            <Text style={styles.dateText}>
              {format(insight.date, 'EEE, MMM d', { locale: getLocale() })}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{insight.conversationCount}</Text>
                <Text style={styles.statLabel}>{t('insight.sessions')}</Text>
              </View>
              <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(insight.moodScore) }]}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(insight.moodScore)}</Text>
              </View>
            </View>
          </View>
          
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#4A90E2"
            style={styles.expandIcon}
          />
        </TouchableOpacity>

        {/* Summary */}
        <Text style={styles.summary}>{insight.summary}</Text>

        {/* Psychological Support - Heart of the feature */}
        <View style={styles.supportSection}>
          <View style={styles.supportHeader}>
            <Ionicons name="heart" size={16} color="#FF6B6B" />
            <Text style={styles.supportTitle}>{t('insight.todaysAffirmation')}</Text>
          </View>
          <Text style={styles.supportText}>{insight.psychologicalSupport}</Text>
        </View>

        {/* Key Topics */}
        <View style={styles.topicsContainer}>
          {insight.keyTopics.map((topic, index) => (
            <View key={index} style={styles.topicTag}>
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
        </View>

        {/* Recommendation */}
        <View style={styles.recommendationSection}>
          <View style={styles.recommendationHeader}>
            <Ionicons name="bulb" size={16} color="#FFB366" />
            <Text style={styles.recommendationTitle}>{t('insight.tomorrowsFocus')}</Text>
          </View>
          <Text style={styles.recommendationText}>{insight.recommendation}</Text>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Emotional Pattern */}
            <View style={styles.patternSection}>
              <Text style={styles.sectionTitle}>{t('insight.emotionalJourney')}</Text>
              <Text style={styles.patternText}>{insight.emotionalPattern}</Text>
            </View>

            {/* Positive Reframe */}
            <View style={styles.reframeSection}>
              <View style={styles.reframeHeader}>
                <Ionicons name="color-palette" size={16} color="#6BCF7F" />
                <Text style={styles.reframeTitle}>{t('insight.positiveReframe')}</Text>
              </View>
              <Text style={styles.reframeText}>{insight.positiveReframe}</Text>
            </View>

            {/* Action Suggestion */}
            <View style={styles.actionSection}>
              <View style={styles.actionHeader}>
                <Ionicons name="arrow-forward-circle" size={16} color="#4A90E2" />
                <Text style={styles.actionTitle}>{t('insight.actionStep')}</Text>
              </View>
              <Text style={styles.actionText}>{insight.actionSuggestion}</Text>
            </View>

            {/* Conversation Analysis */}
            {insight.conversationAnalysis && (
              <View style={styles.analysisSection}>
                <Text style={styles.sectionTitle}>{t('insight.conversationAnalysis')}</Text>
                
                <View style={styles.analysisStats}>
                  <Text style={styles.analysisText}>
                    {t('insight.messagesShared', { count: insight.conversationAnalysis.totalMessages.toString() })}
                  </Text>
                </View>

                {/* Emotional Journey Timeline */}
                <View style={styles.emotionalTimeline}>
                  <Text style={styles.timelineTitle}>{t('insight.emotionalFlow')}</Text>
                  {insight.conversationAnalysis.emotionalJourney.map((point, index) => (
                    <View key={index} style={styles.timelineItem}>
                      <Text style={styles.timelineTime}>{point.time}</Text>
                      <View style={styles.timelineDot} />
                      <Text style={styles.timelineEmotion}>
                        {point.emotion} ({point.intensity}/10)
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Breakthroughs */}
                {insight.conversationAnalysis.breakthroughs.length > 0 && (
                  <View style={styles.breakthroughSection}>
                    <Text style={styles.breakthroughTitle}>{t('insight.breakthroughs')}</Text>
                    {insight.conversationAnalysis.breakthroughs.map((breakthrough, index) => (
                      <Text key={index} style={styles.breakthroughText}>
                        • {breakthrough}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Concerning Patterns */}
                {insight.conversationAnalysis.concerningPatterns.length > 0 && (
                  <View style={styles.concernSection}>
                    <Text style={styles.concernTitle}>{t('insight.areasToWatch')}</Text>
                    {insight.conversationAnalysis.concerningPatterns.map((pattern, index) => (
                      <Text key={index} style={styles.concernText}>
                        • {pattern}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bookmark" size={16} color="#4A90E2" />
            <Text style={styles.actionButtonText}>{t('insight.saveInsight')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share" size={16} color="#4A90E2" />
            <Text style={styles.actionButtonText}>{t('insight.shareProgress')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
    marginBottom: 12,
  },
  dateSection: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 12,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginRight: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  moodIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 16,
  },
  expandIcon: {
    marginLeft: 8,
  },
  summary: {
    fontSize: 15,
    color: '#2C2C2E',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },
  supportSection: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 6,
  },
  supportText: {
    fontSize: 15,
    color: '#2C2C2E',
    lineHeight: 22,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  topicTag: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  recommendationSection: {
    backgroundColor: 'rgba(255, 179, 102, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB366',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFB366',
    marginLeft: 6,
  },
  recommendationText: {
    fontSize: 14,
    color: '#2C2C2E',
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: 8,
  },
  patternSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  patternText: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
  },
  reframeSection: {
    backgroundColor: 'rgba(107, 207, 127, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6BCF7F',
  },
  reframeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reframeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6BCF7F',
    marginLeft: 6,
  },
  reframeText: {
    fontSize: 14,
    color: '#2C2C2E',
    lineHeight: 20,
    fontWeight: '500',
  },
  actionSection: {
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#2C2C2E',
    lineHeight: 20,
  },
  analysisSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 107, 107, 0.2)',
  },
  analysisStats: {
    marginBottom: 16,
  },
  analysisText: {
    fontSize: 14,
    color: '#6B6B6B',
    fontStyle: 'italic',
  },
  emotionalTimeline: {
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timelineTime: {
    fontSize: 12,
    color: '#6B6B6B',
    width: 50,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A90E2',
    marginHorizontal: 8,
  },
  timelineEmotion: {
    fontSize: 12,
    color: '#2C2C2E',
    flex: 1,
  },
  breakthroughSection: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  breakthroughTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 6,
  },
  breakthroughText: {
    fontSize: 13,
    color: '#2C2C2E',
    lineHeight: 18,
    marginBottom: 2,
  },
  concernSection: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  concernTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 6,
  },
  concernText: {
    fontSize: 13,
    color: '#2C2C2E',
    lineHeight: 18,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 107, 107, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 4,
  },
})