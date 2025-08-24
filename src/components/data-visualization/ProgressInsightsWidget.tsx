import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressChart, PieChart } from 'react-native-chart-kit';
import { format, subDays, differenceInDays } from 'date-fns';

interface MoodEntry {
  date: string;
  mood: number;
  emotions: string[];
  notes?: string;
}

interface ProgressInsightsWidgetProps {
  data: MoodEntry[];
  period: 'week' | 'month' | '3months';
  style?: any;
  onViewDetails?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 80;

const CHART_CONFIG = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(139, 90, 140, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
};

const EMOTION_COLORS = {
  positive: '#4CAF50',
  negative: '#ff4757',
  neutral: '#ff9800',
  mixed: '#8B5A8C',
};

const POSITIVE_EMOTIONS = [
  'happy', 'joyful', 'excited', 'grateful', 'peaceful', 'confident',
  'hopeful', 'calm', 'energetic', 'motivated', 'content', 'proud',
];

const NEGATIVE_EMOTIONS = [
  'sad', 'anxious', 'angry', 'frustrated', 'overwhelmed', 'stressed',
  'worried', 'lonely', 'disappointed', 'irritated', 'depressed', 'fearful',
];

export const ProgressInsightsWidget: React.FC<ProgressInsightsWidgetProps> = ({
  data,
  period,
  style,
  onViewDetails,
}) => {
  const insights = useMemo(() => {
    if (data.length === 0) {
      return {
        averageMood: 0,
        moodTrend: 'stable',
        streakDays: 0,
        totalEntries: 0,
        consistencyScore: 0,
        emotionalBalance: {
          positive: 0,
          negative: 0,
          neutral: 0,
        },
        topEmotions: [],
        improvementAreas: [],
        achievements: [],
      };
    }

    // Calculate average mood
    const averageMood = data.reduce((sum, entry) => sum + entry.mood, 0) / data.length;

    // Calculate mood trend
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.mood, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.mood, 0) / secondHalf.length;
    
    const moodTrend = secondAvg > firstAvg + 0.3 ? 'improving' :
                      secondAvg < firstAvg - 0.3 ? 'declining' : 'stable';

    // Calculate current streak (consecutive days with entries)
    const sortedDates = data.map(d => d.date).sort();
    let streakDays = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    for (let i = 0; i < 30; i++) {
      const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (sortedDates.includes(checkDate)) {
        streakDays++;
      } else {
        break;
      }
    }

    // Calculate consistency score (percentage of days with entries in the period)
    const periodDays = {
      week: 7,
      month: 30,
      '3months': 90,
    }[period];
    const consistencyScore = Math.round((data.length / periodDays) * 100);

    // Analyze emotional balance
    const emotionCounts = { positive: 0, negative: 0, neutral: 0 };
    const emotionFrequency: { [key: string]: number } = {};

    data.forEach(entry => {
      entry.emotions.forEach(emotion => {
        const emotionLower = emotion.toLowerCase();
        emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
        
        if (POSITIVE_EMOTIONS.includes(emotionLower)) {
          emotionCounts.positive++;
        } else if (NEGATIVE_EMOTIONS.includes(emotionLower)) {
          emotionCounts.negative++;
        } else {
          emotionCounts.neutral++;
        }
      });
    });

    const totalEmotions = emotionCounts.positive + emotionCounts.negative + emotionCounts.neutral;
    const emotionalBalance = {
      positive: totalEmotions > 0 ? Math.round((emotionCounts.positive / totalEmotions) * 100) : 0,
      negative: totalEmotions > 0 ? Math.round((emotionCounts.negative / totalEmotions) * 100) : 0,
      neutral: totalEmotions > 0 ? Math.round((emotionCounts.neutral / totalEmotions) * 100) : 0,
    };

    // Get top emotions
    const topEmotions = Object.entries(emotionFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    // Identify improvement areas
    const improvementAreas = [];
    if (averageMood < 3) improvementAreas.push('Overall mood');
    if (emotionalBalance.negative > 40) improvementAreas.push('Emotional regulation');
    if (consistencyScore < 50) improvementAreas.push('Tracking consistency');
    if (moodTrend === 'declining') improvementAreas.push('Mood stability');

    // Identify achievements
    const achievements = [];
    if (streakDays >= 7) achievements.push(`${streakDays}-day tracking streak`);
    if (averageMood >= 4) achievements.push('Great overall mood');
    if (emotionalBalance.positive > 60) achievements.push('Positive emotional balance');
    if (moodTrend === 'improving') achievements.push('Improving mood trend');
    if (consistencyScore >= 80) achievements.push('Excellent consistency');

    return {
      averageMood: Number(averageMood.toFixed(1)),
      moodTrend,
      streakDays,
      totalEntries: data.length,
      consistencyScore,
      emotionalBalance,
      topEmotions,
      improvementAreas,
      achievements,
    };
  }, [data, period]);

  const getProgressChartData = () => {
    const { consistencyScore, emotionalBalance } = insights;
    return {
      data: [
        consistencyScore / 100,
        emotionalBalance.positive / 100,
        insights.averageMood / 5,
      ],
      colors: ['#8B5A8C', '#4CAF50', '#ff9800'],
    };
  };

  const getEmotionalBalancePieData = () => {
    const { emotionalBalance } = insights;
    return [
      {
        name: 'Positive',
        count: emotionalBalance.positive,
        color: EMOTION_COLORS.positive,
        legendFontColor: '#333',
        legendFontSize: 12,
      },
      {
        name: 'Negative',
        count: emotionalBalance.negative,
        color: EMOTION_COLORS.negative,
        legendFontColor: '#333',
        legendFontSize: 12,
      },
      {
        name: 'Neutral',
        count: emotionalBalance.neutral,
        color: EMOTION_COLORS.neutral,
        legendFontColor: '#333',
        legendFontSize: 12,
      },
    ].filter(item => item.count > 0);
  };

  const getTrendIcon = () => {
    switch (insights.moodTrend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (insights.moodTrend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#ff4757';
      default: return '#ff9800';
    }
  };

  if (insights.totalEntries === 0) {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient colors={['#8B5A8C', '#B5739E']} style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="analytics" size={24} color="#ffffff" />
            <Text style={styles.headerTitle}>Progress Insights</Text>
            {onViewDetails && (
              <TouchableOpacity onPress={onViewDetails}>
                <Ionicons name="chevron-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
        
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No data available</Text>
          <Text style={styles.emptyStateSubtext}>
            Start tracking your mood to see insights
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient colors={['#8B5A8C', '#B5739E']} style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="analytics" size={24} color="#ffffff" />
          <Text style={styles.headerTitle}>Progress Insights</Text>
          {onViewDetails && (
            <TouchableOpacity onPress={onViewDetails}>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{insights.averageMood}</Text>
          <Text style={styles.metricLabel}>Avg Mood</Text>
        </View>
        
        <View style={styles.metricCard}>
          <View style={styles.trendContainer}>
            <Ionicons
              name={getTrendIcon() as keyof typeof Ionicons.glyphMap}
              size={20}
              color={getTrendColor()}
            />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {insights.moodTrend}
            </Text>
          </View>
          <Text style={styles.metricLabel}>Trend</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{insights.streakDays}</Text>
          <Text style={styles.metricLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{insights.consistencyScore}%</Text>
          <Text style={styles.metricLabel}>Consistency</Text>
        </View>
      </View>

      {/* Progress Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        <ProgressChart
          data={getProgressChartData()}
          width={chartWidth}
          height={120}
          strokeWidth={8}
          radius={24}
          chartConfig={CHART_CONFIG}
          hideLegend={false}
          style={styles.chart}
        />
        
        {/* Chart Labels */}
        <View style={styles.chartLabels}>
          <View style={styles.labelItem}>
            <View style={[styles.labelColor, { backgroundColor: '#8B5A8C' }]} />
            <Text style={styles.labelText}>Consistency</Text>
          </View>
          <View style={styles.labelItem}>
            <View style={[styles.labelColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.labelText}>Positivity</Text>
          </View>
          <View style={styles.labelItem}>
            <View style={[styles.labelColor, { backgroundColor: '#ff9800' }]} />
            <Text style={styles.labelText}>Mood Score</Text>
          </View>
        </View>
      </View>

      {/* Emotional Balance */}
      {getEmotionalBalancePieData().length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Emotional Balance</Text>
          <PieChart
            data={getEmotionalBalancePieData()}
            width={chartWidth}
            height={150}
            chartConfig={CHART_CONFIG}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            style={styles.chart}
          />
        </View>
      )}

      {/* Top Emotions */}
      {insights.topEmotions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Emotions</Text>
          <View style={styles.emotionsList}>
            {insights.topEmotions.slice(0, 3).map((emotion, index) => (
              <View key={emotion.emotion} style={styles.emotionItem}>
                <Text style={styles.emotionName}>{emotion.emotion}</Text>
                <View style={styles.emotionBar}>
                  <View
                    style={[
                      styles.emotionBarFill,
                      {
                        width: `${(emotion.count / insights.topEmotions[0].count) * 100}%`,
                        backgroundColor: index === 0 ? '#8B5A8C' : index === 1 ? '#B5739E' : '#D48FB0',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.emotionCount}>{emotion.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Achievements */}
      {insights.achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            {insights.achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <Ionicons name="trophy" size={16} color="#4CAF50" />
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Improvement Areas */}
      {insights.improvementAreas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas to Focus On</Text>
          <View style={styles.improvementsList}>
            {insights.improvementAreas.map((area, index) => (
              <View key={index} style={styles.improvementItem}>
                <Ionicons name="bulb" size={16} color="#ff9800" />
                <Text style={styles.improvementText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginLeft: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5A8C',
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
    textTransform: 'capitalize',
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  labelText: {
    fontSize: 11,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emotionsList: {
    gap: 8,
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionName: {
    fontSize: 14,
    color: '#333',
    width: 80,
    textTransform: 'capitalize',
  },
  emotionBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  emotionBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emotionCount: {
    fontSize: 12,
    color: '#666',
    width: 24,
    textAlign: 'right',
  },
  achievementsList: {
    gap: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  achievementText: {
    fontSize: 14,
    color: '#2e7d32',
    marginLeft: 8,
    flex: 1,
  },
  improvementsList: {
    gap: 8,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  improvementText: {
    fontSize: 14,
    color: '#e65100',
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
});
