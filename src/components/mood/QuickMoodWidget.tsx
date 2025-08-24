import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface MoodOption {
  id: number;
  emoji: string;
  label: string;
  color: string;
}

interface QuickMoodWidgetProps {
  onMoodSelect?: (mood: MoodOption) => void;
  style?: any;
  compact?: boolean;
}

const QUICK_MOOD_OPTIONS: MoodOption[] = [
  { id: 1, emoji: '😞', label: 'Terrible', color: '#ff4757' },
  { id: 2, emoji: '😔', label: 'Poor', color: '#ff6b7a' },
  { id: 3, emoji: '😐', label: 'Okay', color: '#ffa502' },
  { id: 4, emoji: '🙂', label: 'Good', color: '#7bed9f' },
  { id: 5, emoji: '😄', label: 'Great', color: '#2ed573' },
];

const { width: screenWidth } = Dimensions.get('window');

export const QuickMoodWidget: React.FC<QuickMoodWidgetProps> = ({
  onMoodSelect,
  style,
  compact = false,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [scaleAnims] = useState(
    QUICK_MOOD_OPTIONS.map(() => new Animated.Value(1))
  );

  const handleMoodPress = async (mood: MoodOption, index: number) => {
    setSelectedMood(mood);
    onMoodSelect?.(mood);
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Reset selection after animation
    setTimeout(() => {
      setSelectedMood(null);
    }, 1500);
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <Text style={styles.compactTitle}>Quick Mood Check</Text>
        <View style={styles.compactMoodRow}>
          {QUICK_MOOD_OPTIONS.map((mood, index) => {
            const isSelected = selectedMood?.id === mood.id;
            
            return (
              <Animated.View
                key={mood.id}
                style={[
                  styles.compactMoodOption,
                  { transform: [{ scale: scaleAnims[index] }] },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.compactMoodButton,
                    isSelected && { backgroundColor: mood.color },
                  ]}
                  onPress={() => handleMoodPress(mood, index)}
                  accessible
                  accessibilityLabel={`${mood.label} mood`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.compactMoodEmoji,
                      isSelected && styles.selectedMoodEmoji,
                    ]}
                  >
                    {mood.emoji}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
        {selectedMood && (
          <Text style={styles.selectedMoodText}>
            Feeling {selectedMood.label} today
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#8B5A8C', '#B5739E']}
        style={styles.header}
      >
        <Ionicons name="heart" size={24} color="#ffffff" />
        <Text style={styles.headerText}>How are you feeling?</Text>
      </LinearGradient>
      
      <View style={styles.moodOptions}>
        {QUICK_MOOD_OPTIONS.map((mood, index) => {
          const isSelected = selectedMood?.id === mood.id;
          
          return (
            <Animated.View
              key={mood.id}
              style={[
                styles.moodOptionContainer,
                { transform: [{ scale: scaleAnims[index] }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.moodOption,
                  isSelected && styles.selectedMoodOption,
                  { borderColor: mood.color },
                ]}
                onPress={() => handleMoodPress(mood, index)}
                accessible
                accessibilityLabel={`${mood.label} mood`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <LinearGradient
                  colors={[
                    isSelected ? mood.color : '#ffffff',
                    isSelected ? mood.color : '#f8f9fa',
                  ]}
                  style={styles.moodGradient}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      isSelected && styles.selectedMoodLabel,
                    ]}
                  >
                    {mood.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      
      {selectedMood && (
        <Animated.View 
          style={styles.feedbackContainer}
          entering={{
            opacity: {
              from: 0,
              to: 1,
              duration: 300,
            },
            transform: [
              {
                scale: {
                  from: 0.8,
                  to: 1,
                  duration: 300,
                },
              },
            ],
          }}
        >
          <View style={styles.feedbackCard}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.feedbackText}>
              Thanks for sharing! Your mood has been logged.
            </Text>
          </View>
        </Animated.View>
      )}
      
      <TouchableOpacity
        style={styles.detailedButton}
        accessible
        accessibilityLabel="Open detailed mood check-in"
        accessibilityRole="button"
      >
        <Text style={styles.detailedButtonText}>Detailed Check-in</Text>
        <Ionicons name="chevron-forward" size={16} color="#8B5A8C" />
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  moodOptionContainer: {
    flex: 1,
    marginHorizontal: 2,
  },
  moodOption: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    aspectRatio: 1,
  },
  selectedMoodOption: {
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  moodGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  selectedMoodLabel: {
    color: '#ffffff',
  },
  feedbackContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  feedbackText: {
    fontSize: 14,
    color: '#2e7d32',
    marginLeft: 8,
    flex: 1,
  },
  detailedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailedButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5A8C',
    marginRight: 4,
  },
  
  // Compact styles
  compactContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  compactMoodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  compactMoodOption: {
    flex: 1,
    marginHorizontal: 2,
  },
  compactMoodButton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  compactMoodEmoji: {
    fontSize: 20,
  },
  selectedMoodEmoji: {
    transform: [{ scale: 1.1 }],
  },
  selectedMoodText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
