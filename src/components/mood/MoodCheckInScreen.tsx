import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface MoodOption {
  id: number;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

interface EmotionTag {
  id: string;
  label: string;
  category: 'positive' | 'negative' | 'neutral';
  selected: boolean;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 1,
    label: 'Terrible',
    emoji: '😞',
    color: '#ff4757',
    description: 'Feeling very low, struggling significantly',
  },
  {
    id: 2,
    label: 'Poor',
    emoji: '😔',
    color: '#ff6b7a',
    description: 'Having a difficult day, feeling down',
  },
  {
    id: 3,
    label: 'Fair',
    emoji: '😐',
    color: '#ffa502',
    description: 'Neither good nor bad, just okay',
  },
  {
    id: 4,
    label: 'Good',
    emoji: '🙂',
    color: '#7bed9f',
    description: 'Feeling positive and content',
  },
  {
    id: 5,
    label: 'Excellent',
    emoji: '😄',
    color: '#2ed573',
    description: 'Feeling fantastic and energized',
  },
];

const EMOTION_TAGS: Omit<EmotionTag, 'selected'>[] = [
  { id: 'anxious', label: 'Anxious', category: 'negative' },
  { id: 'calm', label: 'Calm', category: 'positive' },
  { id: 'energetic', label: 'Energetic', category: 'positive' },
  { id: 'tired', label: 'Tired', category: 'neutral' },
  { id: 'stressed', label: 'Stressed', category: 'negative' },
  { id: 'hopeful', label: 'Hopeful', category: 'positive' },
  { id: 'sad', label: 'Sad', category: 'negative' },
  { id: 'grateful', label: 'Grateful', category: 'positive' },
  { id: 'overwhelmed', label: 'Overwhelmed', category: 'negative' },
  { id: 'peaceful', label: 'Peaceful', category: 'positive' },
  { id: 'frustrated', label: 'Frustrated', category: 'negative' },
  { id: 'motivated', label: 'Motivated', category: 'positive' },
];

interface MoodCheckInScreenProps {
  onClose?: () => void;
  onSubmit?: (moodData: any) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const MoodCheckInScreen: React.FC<MoodCheckInScreenProps> = ({
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [emotionTags, setEmotionTags] = useState<EmotionTag[]>(
    EMOTION_TAGS.map(tag => ({ ...tag, selected: false }))
  );
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(
    MOOD_OPTIONS.map(() => new Animated.Value(1))
  ).current;

  const steps = [
    { title: 'How are you feeling?', subtitle: 'Select your current mood' },
    { title: 'What emotions are present?', subtitle: 'Choose what resonates with you' },
    { title: 'Any additional thoughts?', subtitle: 'Optional notes about your day' },
  ];

  const handleMoodSelect = async (mood: MoodOption) => {
    setSelectedMood(mood);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate scale for selected mood
    const index = MOOD_OPTIONS.findIndex(m => m.id === mood.id);
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance to next step after selection
    setTimeout(() => {
      goToNextStep();
    }, 800);
  };

  const handleEmotionTagToggle = async (tagId: string) => {
    await Haptics.selectionAsync();
    setEmotionTags(prev =>
      prev.map(tag =>
        tag.id === tagId ? { ...tag, selected: !tag.selected } : tag
      )
    );
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -(currentStep + 1) * screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      Animated.timing(slideAnim, {
        toValue: -(currentStep - 1) * screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    const moodData = {
      mood: selectedMood,
      emotions: emotionTags.filter(tag => tag.selected),
      notes: notes.trim(),
      timestamp: new Date(),
      date: format(new Date(), 'yyyy-MM-dd'),
    };

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit?.(moodData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedMood !== null;
      case 1:
        return true; // Emotions are optional
      case 2:
        return true; // Notes are optional
      default:
        return false;
    }
  };

  const renderMoodStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.moodGrid}>
        {MOOD_OPTIONS.map((mood, index) => {
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
                onPress={() => handleMoodSelect(mood)}
                accessible
                accessibilityLabel={`${mood.label} mood - ${mood.description}`}
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
                  <Text
                    style={[
                      styles.moodDescription,
                      isSelected && styles.selectedMoodDescription,
                    ]}
                  >
                    {mood.description}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );

  const renderEmotionStep = () => {
    const groupedEmotions = {
      positive: emotionTags.filter(tag => tag.category === 'positive'),
      negative: emotionTags.filter(tag => tag.category === 'negative'),
      neutral: emotionTags.filter(tag => tag.category === 'neutral'),
    };

    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedEmotions).map(([category, tags]) => (
          <View key={category} style={styles.emotionCategory}>
            <Text style={styles.emotionCategoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)} Emotions
            </Text>
            <View style={styles.emotionTagsContainer}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.emotionTag,
                    tag.selected && styles.selectedEmotionTag,
                    tag.category === 'positive' && tag.selected && styles.positiveTag,
                    tag.category === 'negative' && tag.selected && styles.negativeTag,
                    tag.category === 'neutral' && tag.selected && styles.neutralTag,
                  ]}
                  onPress={() => handleEmotionTagToggle(tag.id)}
                  accessible
                  accessibilityLabel={`${tag.label} emotion`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: tag.selected }}
                >
                  <Text
                    style={[
                      styles.emotionTagText,
                      tag.selected && styles.selectedEmotionTagText,
                    ]}
                  >
                    {tag.label}
                  </Text>
                  {tag.selected && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#ffffff"
                      style={styles.emotionTagCheck}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderNotesStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.notesContainer}>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="How was your day? What's on your mind?"
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
          accessible
          accessibilityLabel="Mood notes input"
          accessibilityHint="Enter optional notes about your day or current feelings"
        />
        
        {selectedMood && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your Mood Summary</Text>
            <View style={styles.summaryMood}>
              <Text style={styles.summaryEmoji}>{selectedMood.emoji}</Text>
              <Text style={styles.summaryMoodText}>{selectedMood.label}</Text>
            </View>
            {emotionTags.some(tag => tag.selected) && (
              <View style={styles.summaryEmotions}>
                <Text style={styles.summaryEmotionsTitle}>Emotions:</Text>
                <Text style={styles.summaryEmotionsText}>
                  {emotionTags
                    .filter(tag => tag.selected)
                    .map(tag => tag.label)
                    .join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}
      </div>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5A8C" />
      
      <LinearGradient colors={['#8B5A8C', '#B5739E']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            accessible
            accessibilityLabel="Close mood check-in"
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{steps[currentStep].title}</Text>
            <Text style={styles.headerSubtitle}>{steps[currentStep].subtitle}</Text>
          </View>
          <View style={styles.headerButton} />
        </View>
        
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.activeProgressDot,
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      {/* Steps Content */}
      <Animated.View
        style={[
          styles.stepsContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={[styles.step, { width: screenWidth }]}>
          {renderMoodStep()}
        </View>
        <View style={[styles.step, { width: screenWidth }]}>
          {renderEmotionStep()}
        </View>
        <View style={[styles.step, { width: screenWidth }]}>
          {renderNotesStep()}
        </View>
      </Animated.View>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={goToPreviousStep}
            accessible
            accessibilityLabel="Go to previous step"
          >
            <Ionicons name="chevron-back" size={20} color="#8B5A8C" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.footerSpacer} />
        
        {currentStep < steps.length - 1 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed() && styles.disabledButton,
            ]}
            onPress={goToNextStep}
            disabled={!canProceed()}
            accessible
            accessibilityLabel="Go to next step"
            accessibilityState={{ disabled: !canProceed() }}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.submitButton,
              !canProceed() && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!canProceed()}
            accessible
            accessibilityLabel="Submit mood check-in"
            accessibilityState={{ disabled: !canProceed() }}
          >
            <Text style={styles.submitButtonText}>Complete</Text>
            <Ionicons name="checkmark" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {
    width: 40,
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeProgressDot: {
    backgroundColor: '#ffffff',
  },
  stepsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  step: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  moodGrid: {
    flex: 1,
    justifyContent: 'center',
  },
  moodOptionContainer: {
    marginBottom: 16,
  },
  moodOption: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMoodOption: {
    borderWidth: 3,
    shadowOpacity: 0.2,
    elevation: 6,
  },
  moodGradient: {
    padding: 20,
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedMoodLabel: {
    color: '#ffffff',
  },
  moodDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedMoodDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  emotionCategory: {
    marginBottom: 24,
  },
  emotionCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emotionTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  selectedEmotionTag: {
    borderColor: 'transparent',
  },
  positiveTag: {
    backgroundColor: '#4CAF50',
  },
  negativeTag: {
    backgroundColor: '#ff4757',
  },
  neutralTag: {
    backgroundColor: '#8B5A8C',
  },
  emotionTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedEmotionTagText: {
    color: '#ffffff',
  },
  emotionTagCheck: {
    marginLeft: 4,
  },
  notesContainer: {
    flex: 1,
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryMood: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  summaryMoodText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  summaryEmotions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  summaryEmotionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  summaryEmotionsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B5A8C',
    fontWeight: '500',
    marginLeft: 4,
  },
  footerSpacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#8B5A8C',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginRight: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginRight: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
