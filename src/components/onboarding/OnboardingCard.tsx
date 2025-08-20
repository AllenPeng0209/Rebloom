import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface OnboardingCardProps {
  title: string
  description: string
  features: string[]
  icon: string
  isActive: boolean
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  description,
  features,
  icon,
  isActive,
}) => {
  return (
    <View style={styles.container}>
      {/* Phone mockup container */}
      <View style={styles.phoneContainer}>
        <View style={styles.phoneMockup}>
          {/* Phone notch */}
          <View style={styles.notch} />
          
          {/* Phone content */}
          <View style={styles.phoneContent}>
            {/* Header */}
            <View style={styles.phoneHeader}>
              <Text style={styles.phoneHeaderText}>Ash</Text>
            </View>

            {/* Chat area based on feature */}
            {renderPhoneContent(title, features)}
          </View>

          {/* Home indicator */}
          <View style={styles.homeIndicator} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color="#FFFFFF" />
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {/* Features list */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const renderPhoneContent = (title: string, features: string[]) => {
  switch (title) {
    case 'Always on':
      return (
        <View style={styles.chatContent}>
          <View style={styles.messageUser}>
            <Text style={styles.messageUserText}>Hey, are you available to chat?</Text>
          </View>
          <View style={styles.messageAI}>
            <Text style={styles.messageAIText}>Of course! I'm always here when you need support. What's on your mind?</Text>
          </View>
          <View style={styles.messageUser}>
            <Text style={styles.messageUserText}>I'm feeling anxious about tomorrow</Text>
          </View>
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      )
    case 'Remembers you':
      return (
        <View style={styles.chatContent}>
          <View style={styles.messageAI}>
            <Text style={styles.messageAIText}>How did that job interview go that you were worried about last week?</Text>
          </View>
          <View style={styles.messageUser}>
            <Text style={styles.messageUserText}>It went really well! Thanks for helping me prepare</Text>
          </View>
          <View style={styles.messageAI}>
            <Text style={styles.messageAIText}>That's wonderful! I remember we practiced those breathing techniques together.</Text>
          </View>
        </View>
      )
    case 'Progress snapshot':
      return (
        <View style={styles.progressContent}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.moodChart}>
            <Text style={styles.chartLabel}>Mood this week</Text>
            <View style={styles.chartBars}>
              <View style={[styles.bar, { height: 20 }]} />
              <View style={[styles.bar, { height: 35 }]} />
              <View style={[styles.bar, { height: 45 }]} />
              <View style={[styles.bar, { height: 38 }]} />
              <View style={[styles.bar, { height: 50 }]} />
            </View>
          </View>
          <View style={styles.insight}>
            <Text style={styles.insightText}>💪 You've been more resilient this week</Text>
          </View>
        </View>
      )
    default:
      return null
  }
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 20,
  },
  phoneContainer: {
    flex: 0.5, // 进一步减少手机容器的占比
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // 增加底部间距确保与文字分离
    minHeight: 280, // 适当减少最小高度
    maxHeight: 400, // 添加最大高度限制
  },
  phoneMockup: {
    width: 220, // 进一步减小宽度
    height: 400, // 进一步减小高度
    backgroundColor: '#000000',
    borderRadius: 28, // 相应调整圆角
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  notch: {
    width: 120,
    height: 28,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  phoneContent: {
    flex: 1,
    backgroundColor: '#FF9A56',
    borderRadius: 25, // 相应调整内容区域圆角
    overflow: 'hidden',
  },
  phoneHeader: {
    paddingTop: 44,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  phoneHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  messageUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageUserText: {
    fontSize: 12,
    color: '#2C2C2E',
  },
  messageAI: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageAIText: {
    fontSize: 12,
    color: '#2C2C2E',
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF8F65',
    marginHorizontal: 1,
  },
  progressContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodChart: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 12,
    color: '#2C2C2E',
    marginBottom: 12,
    fontWeight: '500',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 50,
  },
  bar: {
    width: 24,
    backgroundColor: '#FF8F65',
    borderRadius: 2,
  },
  insight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
  },
  insightText: {
    fontSize: 12,
    color: '#2C2C2E',
    fontWeight: '500',
    textAlign: 'center',
  },
  homeIndicator: {
    width: 120,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 8,
  },
  contentContainer: {
    flex: 0.5, // 给内容区域更多空间，与手机容器平衡
    paddingBottom: 20,
    paddingTop: 10, // 添加顶部内边距
    justifyContent: 'flex-start', // 确保内容从顶部开始排列
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    fontWeight: '400',
  },
})