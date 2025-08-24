import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  LineChart,
  BarChart,
  AreaChart,
  XAxis,
  YAxis,
  Grid,
} from 'react-native-svg-charts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient, Stop, Defs } from 'react-native-svg';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import * as shape from 'd3-shape';

interface MoodEntry {
  date: string;
  mood: number; // 1-5 scale
  emotions: string[];
  notes?: string;
  energy?: number;
  sleep?: number;
  stress?: number;
}

interface MoodTrendsChartProps {
  data: MoodEntry[];
  period: 'week' | 'month' | '3months' | '6months';
  onPeriodChange?: (period: string) => void;
  showComparison?: boolean;
  style?: any;
}

type ChartType = 'line' | 'area' | 'bar' | 'comparison';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;
const chartHeight = 200;

const MOOD_COLORS = {
  1: '#ff4757', // Very Low
  2: '#ff6b7a', // Low
  3: '#ffa502', // Neutral
  4: '#7bed9f', // Good
  5: '#2ed573', // Excellent
};

const GRADIENT_COLORS = {
  mood: ['#8B5A8C', '#B5739E'],
  energy: ['#4CAF50', '#81C784'],
  stress: ['#ff4757', '#ff7675'],
  sleep: ['#3498db', '#74b9ff'],
};

export const MoodTrendsChart: React.FC<MoodTrendsChartProps> = ({
  data,
  period,
  onPeriodChange,
  showComparison = false,
  style,
}) => {
  const [activeChart, setActiveChart] = useState<ChartType>('line');
  const [selectedMetric, setSelectedMetric] = useState<'mood' | 'energy' | 'stress' | 'sleep'>('mood');
  const [showGrid, setShowGrid] = useState(true);

  // Process data for the selected period
  const processedData = useMemo(() => {
    const days = {
      week: 7,
      month: 30,
      '3months': 90,
      '6months': 180,
    }[period];

    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = data.find(d => d.date === dateStr);
      
      return {
        date: dateStr,
        dayOfWeek: format(date, 'EEE'),
        dayOfMonth: format(date, 'd'),
        mood: entry?.mood || null,
        energy: entry?.energy || null,
        stress: entry?.stress || null,
        sleep: entry?.sleep || null,
        hasData: !!entry,
      };
    });
  }, [data, period]);

  // Chart data for different visualizations
  const getChartData = () => {
    return processedData.map(d => d[selectedMetric]).filter(v => v !== null);
  };

  const getXAxisData = () => {
    return processedData
      .filter(d => d[selectedMetric] !== null)
      .map(d => period === 'week' ? d.dayOfWeek : d.dayOfMonth);
  };

  // Statistics calculations
  const getStatistics = () => {
    const values = getChartData();
    if (values.length === 0) {
      return {
        average: 0,
        trend: 'stable',
        highest: 0,
        lowest: 0,
        totalEntries: 0,
      };
    }

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    
    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const trend = secondAvg > firstAvg + 0.2 ? 'improving' : 
                  secondAvg < firstAvg - 0.2 ? 'declining' : 'stable';

    return {
      average: Number(average.toFixed(1)),
      trend,
      highest,
      lowest,
      totalEntries: values.length,
    };
  };

  const stats = getStatistics();

  // Custom gradient definition
  const Gradient = ({ colors }: { colors: string[] }) => (
    <Defs key={selectedMetric}>
      <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
        <Stop offset={'0%'} stopColor={colors[0]} stopOpacity={0.8} />
        <Stop offset={'100%'} stopColor={colors[1]} stopOpacity={0.2} />
      </LinearGradient>
    </Defs>
  );

  const renderChart = () => {
    const chartData = getChartData();
    const xAxisData = getXAxisData();
    const colors = GRADIENT_COLORS[selectedMetric];

    if (chartData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
          <Text style={styles.emptyChartText}>No data available</Text>
          <Text style={styles.emptyChartSubtext}>
            Start tracking your {selectedMetric} to see trends
          </Text>
        </View>
      );
    }

    const commonProps = {
      style: { height: chartHeight, width: chartWidth },
      data: chartData,
      contentInset: { top: 20, bottom: 20, left: 20, right: 20 },
      svg: {
        stroke: colors[0],
        strokeWidth: 3,
      },
    };

    switch (activeChart) {
      case 'line':
        return (
          <View>
            <LineChart
              {...commonProps}
              curve={shape.curveCardinal}
              svg={{
                ...commonProps.svg,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
              }}
            >
              {showGrid && <Grid />}
            </LineChart>
            {renderXAxis(xAxisData)}
          </View>
        );

      case 'area':
        return (
          <View>
            <AreaChart
              {...commonProps}
              curve={shape.curveCardinal}
              svg={{
                fill: 'url(#gradient)',
                stroke: colors[0],
                strokeWidth: 2,
              }}
            >
              <Gradient colors={colors} />
              {showGrid && <Grid />}
            </AreaChart>
            {renderXAxis(xAxisData)}
          </View>
        );

      case 'bar':
        return (
          <View>
            <BarChart
              style={{ height: chartHeight, width: chartWidth }}
              data={chartData}
              svg={{ fill: colors[0] }}
              contentInset={{ top: 20, bottom: 20 }}
              spacingInner={0.3}
            >
              {showGrid && <Grid />}
            </BarChart>
            {renderXAxis(xAxisData)}
          </View>
        );

      case 'comparison':
        return renderComparisonChart();

      default:
        return null;
    }
  };

  const renderXAxis = (data: string[]) => (
    <XAxis
      style={{ marginTop: 10, height: 30 }}
      data={data}
      formatLabel={(index) => data[index]}
      contentInset={{ left: 40, right: 40 }}
      svg={{
        fontSize: 12,
        fill: '#666',
      }}
    />
  );

  const renderComparisonChart = () => {
    const moodData = processedData.map(d => d.mood).filter(v => v !== null);
    const energyData = processedData.map(d => d.energy).filter(v => v !== null);
    const xAxisData = getXAxisData();

    if (moodData.length === 0 && energyData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>No comparison data available</Text>
        </View>
      );
    }

    return (
      <View>
        <LineChart
          style={{ height: chartHeight, width: chartWidth }}
          data={[
            {
              data: moodData,
              svg: {
                stroke: GRADIENT_COLORS.mood[0],
                strokeWidth: 3,
                strokeDasharray: '0',
              },
            },
            {
              data: energyData,
              svg: {
                stroke: GRADIENT_COLORS.energy[0],
                strokeWidth: 3,
                strokeDasharray: '5,5',
              },
            },
          ]}
          contentInset={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          {showGrid && <Grid />}
        </LineChart>
        {renderXAxis(xAxisData)}
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: GRADIENT_COLORS.mood[0] }]} />
            <Text style={styles.legendText}>Mood</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: GRADIENT_COLORS.energy[0] }]} />
            <Text style={styles.legendText}>Energy</Text>
          </View>
        </View>
      </View>
    );
  };

  const periods = [
    { key: 'week', label: '7d' },
    { key: 'month', label: '30d' },
    { key: '3months', label: '3m' },
    { key: '6months', label: '6m' },
  ];

  const chartTypes = [
    { key: 'line', icon: 'trending-up', label: 'Line' },
    { key: 'area', icon: 'analytics', label: 'Area' },
    { key: 'bar', icon: 'bar-chart', label: 'Bar' },
    { key: 'comparison', icon: 'git-compare', label: 'Compare' },
  ];

  const metrics = [
    { key: 'mood', label: 'Mood', icon: 'heart', color: GRADIENT_COLORS.mood[0] },
    { key: 'energy', label: 'Energy', icon: 'flash', color: GRADIENT_COLORS.energy[0] },
    { key: 'stress', label: 'Stress', icon: 'warning', color: GRADIENT_COLORS.stress[0] },
    { key: 'sleep', label: 'Sleep', icon: 'bed', color: GRADIENT_COLORS.sleep[0] },
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Header Controls */}
      <View style={styles.header}>
        {/* Period Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.periodSelector}
          contentContainerStyle={styles.periodContent}
        >
          {periods.map(p => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.periodButton,
                period === p.key && styles.activePeriodButton,
              ]}
              onPress={() => onPeriodChange?.(p.key)}
            >
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
          showsHorizontalScrollIndicator={false}
          style={styles.chartTypeSelector}
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
            >
              <Ionicons
                name={type.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={activeChart === type.key ? '#ffffff' : '#666'}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Metric Selector */}
      {activeChart !== 'comparison' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.metricSelector}
          contentContainerStyle={styles.metricContent}
        >
          {metrics.map(metric => (
            <TouchableOpacity
              key={metric.key}
              style={[
                styles.metricButton,
                selectedMetric === metric.key && styles.activeMetricButton,
                { borderColor: metric.color },
              ]}
              onPress={() => setSelectedMetric(metric.key as any)}
            >
              <Ionicons
                name={metric.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={selectedMetric === metric.key ? '#ffffff' : metric.color}
              />
              <Text style={[
                styles.metricButtonText,
                selectedMetric === metric.key && styles.activeMetricButtonText,
                { color: selectedMetric === metric.key ? '#ffffff' : metric.color },
              ]}>
                {metric.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.average}</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons
            name={
              stats.trend === 'improving' ? 'trending-up' :
              stats.trend === 'declining' ? 'trending-down' :
              'remove'
            }
            size={20}
            color={
              stats.trend === 'improving' ? '#4CAF50' :
              stats.trend === 'declining' ? '#ff4757' :
              '#666'
            }
          />
          <Text style={styles.statLabel}>Trend</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalEntries}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statRange}>
            {stats.lowest}-{stats.highest}
          </Text>
          <Text style={styles.statLabel}>Range</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {/* Chart Options */}
      <View style={styles.chartOptions}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setShowGrid(!showGrid)}
        >
          <Ionicons
            name={showGrid ? 'grid' : 'grid-outline'}
            size={16}
            color={showGrid ? '#8B5A8C' : '#666'}
          />
          <Text style={[styles.optionText, showGrid && styles.activeOptionText]}>
            Grid
          </Text>
        </TouchableOpacity>
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
  header: {
    marginBottom: 16,
  },
  periodSelector: {
    marginBottom: 12,
  },
  periodContent: {
    paddingRight: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activePeriodButton: {
    backgroundColor: '#8B5A8C',
    borderColor: '#8B5A8C',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#ffffff',
  },
  chartTypeSelector: {
    marginBottom: 8,
  },
  chartTypeContent: {
    paddingRight: 16,
  },
  chartTypeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activeChartTypeButton: {
    backgroundColor: '#8B5A8C',
  },
  metricSelector: {
    marginBottom: 16,
  },
  metricContent: {
    paddingRight: 16,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
  },
  activeMetricButton: {
    backgroundColor: '#8B5A8C',
  },
  metricButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  activeMetricButtonText: {
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5A8C',
  },
  statRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyChart: {
    height: chartHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    width: chartWidth,
  },
  emptyChartText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  emptyChartSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  activeOptionText: {
    color: '#8B5A8C',
  },
});
