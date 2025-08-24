import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
} from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface MoodDataPoint {
  date: string;
  mood: number;
  emotions: string[];
  notes?: string;
}

interface MoodVisualizationChartProps {
  data: MoodDataPoint[];
  period: 'week' | 'month' | '3months';
  onPeriodChange?: (period: 'week' | 'month' | '3months') => void;
  style?: any;
}

type ChartType = 'line' | 'bar' | 'emotions' | 'progress';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;

const MOOD_COLORS = {
  1: '#ff4757', // Terrible
  2: '#ff6b7a', // Poor
  3: '#ffa502', // Fair
  4: '#7bed9f', // Good
  5: '#2ed573', // Excellent
};

const CHART_CONFIG = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(139, 90, 140, ${opacity})`,
  strokeWidth: 3,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#8B5A8C',
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#e3e3e3',
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 12,
    fontFamily: 'System',
  },
};

export const MoodVisualizationChart: React.FC<MoodVisualizationChartProps> = ({
  data,
  period,
  onPeriodChange,
  style,
}) => {
  const [activeChart, setActiveChart] = useState<ChartType>('line');
  const [selectedDataPoint, setSelectedDataPoint] = useState<MoodDataPoint | null>(null);

  const periods = [
    { key: 'week', label: '7 Days', icon: 'calendar' },
    { key: 'month', label: '30 Days', icon: 'calendar-outline' },
    { key: '3months', label: '3 Months', icon: 'calendar-clear' },
  ];

  const chartTypes = [
    { key: 'line', label: 'Trend', icon: 'trending-up' },
    { key: 'bar', label: 'Daily', icon: 'bar-chart' },
    { key: 'emotions', label: 'Emotions', icon: 'happy' },
    { key: 'progress', label: 'Progress', icon: 'pie-chart' },
  ];

  // Process data for different chart types
  const getLineChartData = () => {
    if (data.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{
          data: [0],
          color: () => MOOD_COLORS[3],
          strokeWidth: 2,
        }],
      };
    }

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      labels: sortedData.map(item => format(new Date(item.date), 'MM/dd')),
      datasets: [{
        data: sortedData.map(item => item.mood),
        color: (opacity = 1) => `rgba(139, 90, 140, ${opacity})`,
        strokeWidth: 3,
      }],
    };
  };

  const getBarChartData = () => {
    if (data.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{ data: [0] }],
      };
    }

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      labels: sortedData.map(item => format(new Date(item.date), 'MM/dd')),
      datasets: [{
        data: sortedData.map(item => item.mood),
      }],
    };
  };

  const getEmotionsPieData = () => {
    const emotionCounts: { [key: string]: number } = {};
    
    data.forEach(item => {
      item.emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    ];

    return Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([emotion, count], index) => ({
        name: emotion,
        population: count,
        color: colors[index % colors.length],
        legendFontColor: '#333',
        legendFontSize: 12,
      }));
  };

  const getProgressData = () => {
    if (data.length === 0) {
      return {
        data: [0, 0, 0, 0, 0],
      };
    }

    const moodCounts = [0, 0, 0, 0, 0]; // Initialize counts for moods 1-5
    data.forEach(item => {
      if (item.mood >= 1 && item.mood <= 5) {
        moodCounts[item.mood - 1]++;
      }
    });

    const total = data.length;
    return {
      data: moodCounts.map(count => count / total),
      colors: [
        '#ff4757', // Terrible
        '#ff6b7a', // Poor  
        '#ffa502', // Fair
        '#7bed9f', // Good
        '#2ed573', // Excellent
      ],
    };
  };

  const getAverageMood = () => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.mood, 0);
    return sum / data.length;
  };

  const getMoodTrend = () => {
    if (data.length < 2) return 'stable';
    
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
    
    const firstAvg = firstHalf.reduce((acc, item) => acc + item.mood, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, item) => acc + item.mood, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.3) return 'improving';
    if (difference < -0.3) return 'declining';
    return 'stable';
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'line':
        return (
          <LineChart
            data={getLineChartData()}
            width={chartWidth}
            height={220}
            chartConfig={CHART_CONFIG}
            bezier
            style={styles.chart}
            onDataPointClick={(data) => {
              // Handle data point click
            }}
          />
        );
        
      case 'bar':
        return (
          <BarChart
            data={getBarChartData()}
            width={chartWidth}
            height={220}
            chartConfig={CHART_CONFIG}
            style={styles.chart}
            yAxisSuffix=""
            showValuesOnTopOfBars
          />
        );
        
      case 'emotions':
        const emotionData = getEmotionsPieData();
        return emotionData.length > 0 ? (
          <PieChart
            data={emotionData}
            width={chartWidth}
            height={220}
            chartConfig={CHART_CONFIG}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="happy-outline" size={48} color="#ccc" />
            <Text style={styles.noDataText}>No emotion data available</Text>
          </View>
        );
        
      case 'progress':
        return (
          <ProgressChart
            data={getProgressData()}
            width={chartWidth}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              ...CHART_CONFIG,
              color: (opacity = 1) => `rgba(139, 90, 140, ${opacity})`,
            }}
            hideLegend={false}
            style={styles.chart}
          />
        );
        
      default:
        return null;
    }
  };

  const renderStats = () => {
    const avgMood = getAverageMood();
    const trend = getMoodTrend();
    const totalEntries = data.length;
    
    const getMoodLabel = (mood: number) => {
      if (mood >= 4.5) return 'Excellent';
      if (mood >= 3.5) return 'Good';
      if (mood >= 2.5) return 'Fair';
      if (mood >= 1.5) return 'Poor';
      return 'Needs attention';
    };

    const getTrendIcon = () => {
      switch (trend) {
        case 'improving': return 'trending-up';
        case 'declining': return 'trending-down';
        default: return 'remove';
      }
    };

    const getTrendColor = () => {
      switch (trend) {
        case 'improving': return '#4CAF50';
        case 'declining': return '#ff4757';
        default: return '#8B5A8C';
      }
    };

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{avgMood.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statSubLabel}>{getMoodLabel(avgMood)}</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.trendContainer}>
            <Ionicons
              name={getTrendIcon() as keyof typeof Ionicons.glyphMap}
              size={24}
              color={getTrendColor()}
            />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </Text>
          </View>
          <Text style={styles.statLabel}>Trend</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalEntries}</Text>
          <Text style={styles.statLabel}>Entries</Text>
          <Text style={styles.statSubLabel}>This {period}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Period Selector */}
      <ScrollView
        horizontal
        style={styles.periodSelector}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodContent}
      >
        {periods.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.periodButton,
              period === p.key && styles.activePeriodButton,
            ]}
            onPress={() => onPeriodChange?.(p.key as any)}
            accessible
            accessibilityRole="button"
            accessibilityState={{ selected: period === p.key }}
          >
            <Ionicons
              name={p.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={period === p.key ? '#ffffff' : '#8B5A8C'}
            />
            <Text style={[
              styles.periodButtonText,
              period === p.key && styles.activePeriodButtonText,
            ]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart Type Selector */}
      <ScrollView
        horizontal
        style={styles.chartTypeSelector}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartTypeContent}
      >
        {chartTypes.map(type => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.chartTypeButton,
              activeChart === type.key && styles.activeChartTypeButton,
            ]}
            onPress={() => setActiveChart(type.key as ChartType)}
            accessible
            accessibilityRole="button"
            accessibilityState={{ selected: activeChart === type.key }}
          >
            <Ionicons
              name={type.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={activeChart === type.key ? '#ffffff' : '#666'}
            />
            <Text style={[
              styles.chartTypeButtonText,
              activeChart === type.key && styles.activeChartTypeButtonText,
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats */}
      {renderStats()}

      {/* Chart */}
      <View style={styles.chartContainer}>
        {data.length > 0 ? (
          renderChart()
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="analytics-outline" size={48} color="#ccc" />
            <Text style={styles.noDataText}>No mood data available</Text>
            <Text style={styles.noDataSubText}>Start tracking your mood to see insights</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodSelector: {
    marginBottom: 16,
  },
  periodContent: {
    paddingHorizontal: 4,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B5A8C',
    backgroundColor: '#ffffff',
  },
  activePeriodButton: {
    backgroundColor: '#8B5A8C',
    borderColor: '#8B5A8C',
  },
  periodButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5A8C',
  },
  activePeriodButtonText: {
    color: '#ffffff',
  },
  chartTypeSelector: {
    marginBottom: 16,
  },
  chartTypeContent: {
    paddingHorizontal: 4,
  },
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeChartTypeButton: {
    backgroundColor: '#8B5A8C',
  },
  chartTypeButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  activeChartTypeButtonText: {
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5A8C',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  statSubLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  noDataSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
});
