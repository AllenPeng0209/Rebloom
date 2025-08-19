import { useLanguage } from '@/contexts/LanguageContext'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

interface InsightData {
  id: string
  type: 'pattern' | 'progress' | 'achievement' | 'recommendation'
  title: string
  description: string
  confidence: number
  icon: string
}

interface WeeklyInsightProps {
  insight: InsightData
  onPress: () => void
}

export const WeeklyInsight: React.FC<WeeklyInsightProps> = ({
  insight,
  onPress,
}) => {
  const { t } = useLanguage()
  const getInsightColors = () => {
    switch (insight.type) {
      case 'pattern':
        return {
          primary: '#4A90E2',
          secondary: 'rgba(74, 144, 226, 0.1)',
          text: '#2C2C2E'
        }
      case 'progress':
        return {
          primary: '#4CAF50',
          secondary: 'rgba(76, 175, 80, 0.1)',
          text: '#2C2C2E'
        }
      case 'achievement':
        return {
          primary: '#FF9500',
          secondary: 'rgba(255, 149, 0, 0.1)',
          text: '#2C2C2E'
        }
      case 'recommendation':
        return {
          primary: '#9C27B0',
          secondary: 'rgba(156, 39, 176, 0.1)',
          text: '#2C2C2E'
        }
      default:
        return {
          primary: '#4A90E2',
          secondary: 'rgba(74, 144, 226, 0.1)',
          text: '#2C2C2E'
        }
    }
  }

  const colors = getInsightColors()

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 90) return t('weeklyInsight.veryHighConfidence')
    if (confidence >= 75) return t('weeklyInsight.highConfidence')
    if (confidence >= 60) return t('weeklyInsight.mediumConfidence')
    return t('weeklyInsight.lowConfidence')
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
            <Ionicons
              name={insight.icon as any}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>
              {insight.title}
            </Text>
            <Text style={styles.confidence}>
              {getConfidenceText(insight.confidence)}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#CCCCCC"
          />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          {insight.description}
        </Text>

        {/* Confidence Bar */}
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceProgress, 
                { 
                  width: `${insight.confidence}%`,
                  backgroundColor: colors.primary 
                }
              ]} 
            />
          </View>
          <Text style={styles.confidencePercentage}>
            {insight.confidence}%
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  confidence: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 16,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(107, 107, 107, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  confidenceProgress: {
    height: '100%',
    borderRadius: 3,
  },
  confidencePercentage: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
})