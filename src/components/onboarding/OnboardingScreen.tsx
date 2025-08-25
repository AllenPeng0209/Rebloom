import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useRef, useState } from 'react'
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { OnboardingCard } from './OnboardingCard'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const onboardingData = [
  {
    id: 'always-on',
    title: 'Always on',
    description: '24/7 access to mental health support via text, call, ACT, and video response',
    features: [
      'Available whenever you need support',
      'Multiple communication methods',
      'Instant response to your needs',
      'No waiting lists or appointments'
    ],
    gradient: ['#FF9A56', '#FFAD7A'],
    icon: 'time-outline'
  },
  {
    id: 'remembers-you',
    title: 'Remembers you',
    description: 'Dolphin has a secure memory, so every conversation builds continuous therapeutic.',
    features: [
      'Secure conversation history',
      'Personalized therapeutic approach',
      'Builds on previous sessions',
      'Understands your progress'
    ],
    gradient: ['#A8E6CF', '#88D8A3'],
    icon: 'person-outline'
  },
  {
    id: 'progress-snapshot',
    title: 'Progress snapshot',
    description: 'Analyze your mood and patterns, wins and gains, insights and next steps.',
    features: [
      'Track mood patterns over time',
      'Celebrate your achievements',
      'Identify helpful strategies',
      'Plan your next steps forward'
    ],
    gradient: ['#FFD93D', '#6BCF7F'],
    icon: 'analytics-outline'
  }
]

interface OnboardingScreenProps {
  onComplete: () => void
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true
      })
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      scrollViewRef.current?.scrollTo({
        x: prevIndex * SCREEN_WIDTH,
        animated: true
      })
    }
  }

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x
    const newIndex = Math.round(scrollX / SCREEN_WIDTH)
    setCurrentIndex(newIndex)
  }

  const currentCard = onboardingData[currentIndex]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient */}
      <LinearGradient
        colors={currentCard.gradient as [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={currentIndex > 0 ? handlePrevious : undefined}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentIndex > 0 ? '#FFFFFF' : 'transparent'}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Dolphin</Text>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={onComplete}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Page indicators */}
      <View style={styles.indicators}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: currentIndex === index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                width: currentIndex === index ? 24 : 8,
              }
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {onboardingData.map((item, index) => (
          <OnboardingCard
            key={item.id}
            title={item.title}
            description={item.description}
            features={item.features}
            icon={item.icon as any}
            isActive={currentIndex === index}
          />
        ))}
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#2C2C2E"
              style={styles.continueButtonIcon}
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.learnMoreButton}
          onPress={() => {
            // Navigate to detailed features or help
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.learnMoreText}>Learn more about Dolphin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  scrollView: {
    flex: 1,
    minHeight: 0, // 确保scrollView不会过度拉伸
  },
  scrollContent: {
    alignItems: 'flex-start',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 34, // Account for home indicator
    paddingTop: 20,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  continueButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginRight: 8,
  },
  continueButtonIcon: {
    marginLeft: 4,
  },
  learnMoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  learnMoreText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
})