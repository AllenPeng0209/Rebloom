import React, { useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Colors } from '../../../lib/constants/Colors'
import { useAuth } from '../../contexts/AuthContext'
import { SchedulerService } from '../../services/schedulerService'
import { DailySummary, SummaryService } from '../../services/summaryService'

interface SummaryHistoryViewProps {
  onSummarySelect?: (summary: DailySummary) => void
}

export const SummaryHistoryView: React.FC<SummaryHistoryViewProps> = ({
  onSummarySelect
}) => {
  const [summaries, setSummaries] = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [generatingToday, setGeneratingToday] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadSummaries()
      checkTodaySummary()
    }
  }, [user])

  const loadSummaries = async () => {
    if (!user) return

    try {
      setLoading(true)
      const recentSummaries = await SummaryService.getRecentSummaries(user.id, 30)
      setSummaries(recentSummaries)
    } catch (error) {
      console.error('載入歷史總結失敗:', error)
      Alert.alert('錯誤', '載入歷史總結失敗')
    } finally {
      setLoading(false)
    }
  }

  const checkTodaySummary = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const todaySummary = await SummaryService.getDailySummary(user.id, today)
      
      if (!todaySummary) {
        // 檢查是否有今日對話
        const conversations = await SummaryService.getTodayConversations(user.id)
        if (conversations.length > 0) {
          // 有對話但沒有總結，提示用戶生成
          Alert.alert(
            '今日總結',
            '檢測到您今日有對話記錄，是否要生成今日的心理洞察？',
            [
              { text: '稍後', style: 'cancel' },
              { text: '生成', onPress: generateTodaySummary }
            ]
          )
        }
      }
    } catch (error) {
      console.error('檢查今日總結失敗:', error)
    }
  }

  const generateTodaySummary = async () => {
    if (!user) return

    try {
      setGeneratingToday(true)
      const success = await SchedulerService.triggerDailySummary(user.id)
      
      if (success) {
        Alert.alert('成功', '今日心理洞察已生成完成！')
        await loadSummaries() // 重新載入列表
      } else {
        Alert.alert('失敗', '生成今日總結時發生錯誤，請稍後再試')
      }
    } catch (error) {
      console.error('生成今日總結失敗:', error)
      Alert.alert('錯誤', '生成總結時發生錯誤')
    } finally {
      setGeneratingToday(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadSummaries()
    setRefreshing(false)
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
      case 'improving': return '上升'
      case 'stable': return '穩定'
      case 'declining': return '下降'
      case 'mixed': return '波動'
      default: return '未知'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    if (date.toDateString() === today.toDateString()) {
      return '今天'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天'
    } else {
      return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      })
    }
  }

  const renderSummaryItem = ({ item }: { item: DailySummary }) => {
    const isToday = item.summary_date === new Date().toISOString().split('T')[0]
    
    return (
      <TouchableOpacity
        style={[styles.summaryCard, isToday && styles.todayCard]}
        onPress={() => onSummarySelect?.(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.summary_date)}</Text>
            {isToday && <Text style={styles.todayBadge}>今日</Text>}
          </View>
          <View style={[
            styles.moodIndicator,
            { backgroundColor: getMoodTrendColor(item.mood_trend) }
          ]}>
            <Text style={styles.moodText}>
              {getMoodTrendText(item.mood_trend)}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.insightPreview} numberOfLines={2}>
            {item.psychological_insights}
          </Text>
          
          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              {item.conversation_count} 次對話
            </Text>
            <Text style={styles.statText}>
              {item.total_messages} 條消息
            </Text>
            {item.urgency_level !== 'low' && (
              <Text style={[
                styles.urgencyBadge,
                { 
                  backgroundColor: item.urgency_level === 'high' ? '#F44336' : '#FF9800'
                }
              ]}>
                {item.urgency_level === 'high' ? '高關注' : '需關注'}
              </Text>
            )}
          </View>

          {item.dominant_emotions && item.dominant_emotions.length > 0 && (
            <View style={styles.emotionRow}>
              {item.dominant_emotions.slice(0, 3).map((emotion, index) => (
                <Text key={index} style={styles.emotionTag}>
                  {emotion}
                </Text>
              ))}
            </View>
          )}
        </View>

        {item.crisis_flags && (
          <View style={styles.crisisFlag}>
            <Text style={styles.crisisText}>⚠️ 需要關注</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>還沒有心理洞察記錄</Text>
      <Text style={styles.emptySubtitle}>
        開始與 Ash 對話，系統會在每晚自動為您生成專業的心理分析
      </Text>
      <TouchableOpacity
        style={styles.generateButton}
        onPress={generateTodaySummary}
        disabled={generatingToday}
      >
        <Text style={styles.generateButtonText}>
          {generatingToday ? '正在生成...' : '立即生成今日總結'}
        </Text>
      </TouchableOpacity>
    </View>
  )

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>心理洞察歷史</Text>
      <Text style={styles.headerSubtitle}>
        專業心理師級別的每日分析和建議
      </Text>
      
      {summaries.length > 0 && (
        <TouchableOpacity
          style={styles.generateTodayButton}
          onPress={generateTodaySummary}
          disabled={generatingToday}
        >
          <Text style={styles.generateTodayText}>
            {generatingToday ? '生成中...' : '生成今日總結'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={summaries}
        renderItem={renderSummaryItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.tint}
          />
        }
        contentContainerStyle={summaries.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  generateTodayButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  generateTodayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  todayBadge: {
    backgroundColor: Colors.light.tint,
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  moodIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  moodText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  insightPreview: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginRight: 16,
  },
  urgencyBadge: {
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  emotionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emotionTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  crisisFlag: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffcdd2',
  },
  crisisText: {
    color: '#c62828',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
