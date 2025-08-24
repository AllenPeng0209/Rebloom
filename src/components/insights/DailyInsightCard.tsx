import React, { useState } from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Colors } from '../../../lib/constants/Colors'
import { useLanguage } from '../../contexts/LanguageContext'
import { DailySummary } from '../../services/summaryService'

interface DailyInsightCardProps {
  summary: DailySummary
  onRefresh?: () => void
}

const { width } = Dimensions.get('window')

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({ 
  summary, 
  onRefresh 
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const { t } = useLanguage()

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getMoodTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#4CAF50'
      case 'stable': return '#2196F3'
      case 'declining': return '#FF9800'
      case 'mixed': return '#9C27B0'
      default: return '#757575'
    }
  }

  const getMoodTrendText = (trend: string) => {
    switch (trend) {
      case 'improving': return t('insightCard.trend.improving')
      case 'stable': return t('insightCard.trend.stable')
      case 'declining': return t('insightCard.trend.declining')
      case 'mixed': return t('insightCard.trend.mixed')
      default: return t('insightCard.trend.unknown')
    }
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return '#F44336'
      case 'medium': return '#FF9800'
      case 'low': return '#4CAF50'
      default: return '#757575'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const { language } = useLanguage()
    
    const localeMap = {
      'zh-TW': 'zh-TW',
      'zh-CN': 'zh-CN',
      'ja': 'ja-JP',
      'en': 'en-US'
    }
    
    return date.toLocaleDateString(localeMap[language] || 'zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const renderExpandableSection = (
    title: string,
    content: string,
    sectionKey: string,
    icon?: string
  ) => {
    const isExpanded = expandedSection === sectionKey
    
    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
        >
          <Text style={styles.sectionTitle}>
            {icon && <Text style={styles.sectionIcon}>{icon} </Text>}
            {title}
          </Text>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            <Text style={styles.contentText}>{content}</Text>
          </View>
        )}
      </View>
    )
  }

  const renderArraySection = (
    title: string,
    items: string[],
    sectionKey: string,
    icon?: string
  ) => {
    if (!items || items.length === 0) return null
    
    const isExpanded = expandedSection === sectionKey
    
    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
        >
          <Text style={styles.sectionTitle}>
            {icon && <Text style={styles.sectionIcon}>{icon} </Text>}
            {title} ({items.length})
          </Text>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {items.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>• {item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 標題和日期 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('insightCard.title')}</Text>
        <Text style={styles.date}>{formatDate(summary.summary_date)}</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshText}>{t('insightCard.refresh')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 統計概覽 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{summary.conversation_count}</Text>
          <Text style={styles.statLabel}>{t('insightCard.conversationCount')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{summary.total_messages}</Text>
          <Text style={styles.statLabel}>{t('insightCard.messageCount')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[
            styles.moodTrendText,
            { color: getMoodTrendColor(summary.mood_trend) }
          ]}>
            {getMoodTrendText(summary.mood_trend)}
          </Text>
          <Text style={styles.statLabel}>{t('insightCard.moodTrend')}</Text>
        </View>
      </View>

      {/* 情緒狀態 */}
      <View style={styles.emotionContainer}>
        <Text style={styles.sectionTitle}>{t('insightCard.mainEmotions')}</Text>
        <View style={styles.emotionTags}>
          {summary.dominant_emotions?.map((emotion, index) => (
            <View key={index} style={styles.emotionTag}>
              <Text style={styles.emotionText}>{emotion}</Text>
            </View>
          ))}
        </View>
        <View style={styles.intensityContainer}>
          <Text style={styles.intensityLabel}>{t('insightCard.emotionIntensity')}</Text>
          <View style={styles.intensityBar}>
            <View 
              style={[
                styles.intensityFill,
                { 
                  width: `${(summary.emotion_intensity_avg || 0) * 100}%`,
                  backgroundColor: summary.emotion_intensity_avg > 0.7 ? '#F44336' : 
                                 summary.emotion_intensity_avg > 0.4 ? '#FF9800' : '#4CAF50'
                }
              ]} 
            />
          </View>
          <Text style={styles.intensityValue}>
            {Math.round((summary.emotion_intensity_avg || 0) * 100)}%
          </Text>
        </View>
      </View>

      {/* 緊急程度指示器 */}
      {summary.urgency_level !== 'low' && (
        <View style={[
          styles.urgencyContainer,
          { backgroundColor: getUrgencyColor(summary.urgency_level) }
        ]}>
          <Text style={styles.urgencyText}>
            ⚠️ {t('insightCard.attentionLevel')}: {summary.urgency_level === 'high' ? t('insightCard.high') : t('insightCard.medium')}
          </Text>
        </View>
      )}

      {/* 危機警示 */}
      {summary.crisis_flags && (
        <View style={styles.crisisContainer}>
                  <Text style={styles.crisisText}>
          {t('insightCard.crisisWarning')}
        </Text>
        </View>
      )}

      {/* 心理洞察 */}
      {renderExpandableSection(
        t('insightCard.psychologicalInsights'),
        summary.psychological_insights,
        'insights',
        '🧠'
      )}

      {/* 個人化建議 */}
      {renderExpandableSection(
        t('insightCard.personalizedRecommendations'),
        summary.personalized_recommendations,
        'recommendations',
        '💡'
      )}

      {/* 治療觀察 */}
      {summary.therapeutic_observations && renderExpandableSection(
        '專業觀察',
        summary.therapeutic_observations,
        'therapeutic',
        '👩‍⚕️'
      )}

      {/* 行為模式 */}
      {summary.behavioral_patterns && renderExpandableSection(
        '行為模式',
        summary.behavioral_patterns,
        'patterns',
        '🔄'
      )}

      {/* 應對機制 */}
      {renderArraySection(
        '應對策略',
        summary.coping_mechanisms_used || [],
        'coping',
        '🛡️'
      )}

      {/* 建議活動 */}
      {renderArraySection(
        '推薦活動',
        summary.suggested_activities || [],
        'activities',
        '🎯'
      )}

      {/* 正念練習 */}
      {renderArraySection(
        '正念練習',
        summary.mindfulness_exercises || [],
        'mindfulness',
        '🧘‍♀️'
      )}

      {/* 目標和成就 */}
      {(summary.goals_mentioned?.length > 0 || summary.achievements?.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 目標與成就</Text>
          {renderArraySection('提及的目標', summary.goals_mentioned || [], 'goals')}
          {renderArraySection('獲得的成就', summary.achievements || [], 'achievements')}
        </View>
      )}

      {/* 挑戰 */}
      {renderArraySection(
        '面臨的挑戰',
        summary.challenges || [],
        'challenges',
        '⚡'
      )}

      {/* 風險指標 */}
      {summary.risk_indicators && summary.risk_indicators.length > 0 && (
        renderArraySection(
          '需要關注的方面',
          summary.risk_indicators,
          'risks',
          '⚠️'
        )
      )}

      {/* AI 信心分數 */}
      <View style={styles.footer}>
        <Text style={styles.confidenceText}>
          AI 分析信心度: {Math.round((summary.ai_confidence_score || 0) * 100)}%
        </Text>
        <Text style={styles.modelText}>
          模型: {summary.processing_model}
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  moodTrendText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emotionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emotionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
  },
  emotionTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  emotionText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  intensityContainer: {
    marginTop: 12,
  },
  intensityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  intensityBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 4,
  },
  intensityValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  urgencyContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  urgencyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  crisisContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    marginBottom: 16,
  },
  crisisText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  sectionIcon: {
    fontSize: 16,
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  listItem: {
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modelText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
})