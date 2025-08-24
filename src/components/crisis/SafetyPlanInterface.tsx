import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface SafetyPlanStep {
  id: string;
  title: string;
  description: string;
  content: string;
  isRequired: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

interface SafetyPlan {
  id: string;
  name: string;
  steps: SafetyPlanStep[];
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_SAFETY_PLAN_STEPS: Omit<SafetyPlanStep, 'content'>[] = [
  {
    id: 'warning-signs',
    title: 'Warning Signs',
    description: 'Personal signs that a crisis may be developing',
    isRequired: true,
    icon: 'warning',
  },
  {
    id: 'coping-strategies',
    title: 'Coping Strategies',
    description: 'Things I can do to help myself feel better',
    isRequired: true,
    icon: 'heart',
  },
  {
    id: 'social-contacts',
    title: 'Social Contacts',
    description: 'People I can reach out to for support',
    isRequired: true,
    icon: 'people',
  },
  {
    id: 'professional-contacts',
    title: 'Professional Contacts',
    description: 'Mental health professionals and crisis resources',
    isRequired: true,
    icon: 'medical',
  },
  {
    id: 'environment-safety',
    title: 'Safe Environment',
    description: 'Ways to make my environment safer',
    isRequired: false,
    icon: 'shield-checkmark',
  },
  {
    id: 'reasons-to-live',
    title: 'Reasons for Living',
    description: 'Important reasons to stay safe and keep going',
    isRequired: true,
    icon: 'star',
  },
];

interface SafetyPlanInterfaceProps {
  onClose?: () => void;
  planId?: string;
}

export const SafetyPlanInterface: React.FC<SafetyPlanInterfaceProps> = ({
  onClose,
  planId,
}) => {
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan | null>(null);
  const [activeStepId, setActiveStepId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    loadSafetyPlan();
  }, [planId]);

  const loadSafetyPlan = async () => {
    try {
      const savedPlans = await AsyncStorage.getItem('@safety_plans');
      const plans: SafetyPlan[] = savedPlans ? JSON.parse(savedPlans) : [];
      
      let plan: SafetyPlan;
      
      if (planId) {
        const existingPlan = plans.find(p => p.id === planId);
        if (existingPlan) {
          plan = existingPlan;
        } else {
          // Plan not found, create new one
          plan = createNewSafetyPlan();
        }
      } else {
        // Create new plan
        plan = createNewSafetyPlan();
      }
      
      setSafetyPlan(plan);
      if (plan.steps.length > 0) {
        setActiveStepId(plan.steps[0].id);
      }
    } catch (error) {
      console.error('Error loading safety plan:', error);
      Alert.alert('Error', 'Failed to load safety plan');
    }
  };

  const createNewSafetyPlan = (): SafetyPlan => {
    const steps: SafetyPlanStep[] = DEFAULT_SAFETY_PLAN_STEPS.map(step => ({
      ...step,
      content: '',
    }));

    return {
      id: Date.now().toString(),
      name: 'My Safety Plan',
      steps,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  const saveSafetyPlan = async () => {
    if (!safetyPlan) return;

    try {
      const savedPlans = await AsyncStorage.getItem('@safety_plans');
      let plans: SafetyPlan[] = savedPlans ? JSON.parse(savedPlans) : [];
      
      const updatedPlan = {
        ...safetyPlan,
        updatedAt: new Date(),
      };
      
      const existingIndex = plans.findIndex(p => p.id === safetyPlan.id);
      if (existingIndex >= 0) {
        plans[existingIndex] = updatedPlan;
      } else {
        plans.push(updatedPlan);
      }
      
      await AsyncStorage.setItem('@safety_plans', JSON.stringify(plans));
      setSafetyPlan(updatedPlan);
      setUnsavedChanges(false);
      setIsEditing(false);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Safety plan saved successfully');
    } catch (error) {
      console.error('Error saving safety plan:', error);
      Alert.alert('Error', 'Failed to save safety plan');
    }
  };

  const updateStepContent = (stepId: string, content: string) => {
    if (!safetyPlan) return;
    
    const updatedSteps = safetyPlan.steps.map(step =>
      step.id === stepId ? { ...step, content } : step
    );
    
    setSafetyPlan({ ...safetyPlan, steps: updatedSteps });
    setUnsavedChanges(true);
  };

  const handleStepPress = (stepId: string) => {
    setActiveStepId(stepId);
  };

  const getStepCompletionStatus = (step: SafetyPlanStep) => {
    if (step.isRequired) {
      return step.content.trim().length > 0 ? 'completed' : 'required';
    }
    return step.content.trim().length > 0 ? 'completed' : 'optional';
  };

  const getCompletedStepsCount = () => {
    if (!safetyPlan) return 0;
    return safetyPlan.steps.filter(step => step.content.trim().length > 0).length;
  };

  const handleClose = () => {
    if (unsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before closing?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => onClose?.(),
          },
          {
            text: 'Save & Close',
            onPress: async () => {
              await saveSafetyPlan();
              onClose?.();
            },
          },
          {
            text: 'Continue Editing',
            style: 'cancel',
          },
        ]
      );
    } else {
      onClose?.();
    }
  };

  if (!safetyPlan) {
    return (
      <View style={styles.container}>
        <Text>Loading safety plan...</Text>
      </View>
    );
  }

  const activeStep = safetyPlan.steps.find(step => step.id === activeStepId);
  const completedCount = getCompletedStepsCount();
  const totalSteps = safetyPlan.steps.length;
  const completionPercentage = (completedCount / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#8B5A8C', '#B5739E']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
            accessible
            accessibilityLabel="Close safety plan"
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety Plan</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsEditing(!isEditing)}
              accessible
              accessibilityLabel={isEditing ? 'View mode' : 'Edit mode'}
            >
              <Ionicons
                name={isEditing ? 'eye' : 'create'}
                size={24}
                color="#ffffff"
              />
            </TouchableOpacity>
            {unsavedChanges && (
              <TouchableOpacity
                style={[styles.headerButton, styles.saveButton]}
                onPress={saveSafetyPlan}
                accessible
                accessibilityLabel="Save safety plan"
              >
                <Ionicons name="save" size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${completionPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedCount} of {totalSteps} steps completed
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Step Navigation */}
        <ScrollView
          horizontal
          style={styles.stepsNavigation}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stepsContent}
        >
          {safetyPlan.steps.map((step, index) => {
            const status = getStepCompletionStatus(step);
            const isActive = step.id === activeStepId;
            
            return (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.stepButton,
                  isActive && styles.activeStepButton,
                ]}
                onPress={() => handleStepPress(step.id)}
                accessible
                accessibilityLabel={`Step ${index + 1}: ${step.title}`}
                accessibilityState={{ selected: isActive }}
              >
                <View style={[
                  styles.stepIcon,
                  status === 'completed' && styles.completedStepIcon,
                  status === 'required' && styles.requiredStepIcon,
                  isActive && styles.activeStepIcon,
                ]}>
                  <Ionicons
                    name={status === 'completed' ? 'checkmark' : step.icon}
                    size={16}
                    color={isActive || status === 'completed' ? '#ffffff' : '#8B5A8C'}
                  />
                </View>
                <Text style={[
                  styles.stepTitle,
                  isActive && styles.activeStepTitle,
                ]}>
                  {step.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Step Content */}
        {activeStep && (
          <ScrollView
            style={styles.stepContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepHeader}>
              <Ionicons
                name={activeStep.icon}
                size={32}
                color="#8B5A8C"
                style={styles.stepHeaderIcon}
              />
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepHeaderTitle}>{activeStep.title}</Text>
                <Text style={styles.stepHeaderDescription}>
                  {activeStep.description}
                </Text>
                {activeStep.isRequired && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredBadgeText}>Required</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.textInput,
                  !isEditing && styles.readOnlyInput,
                ]}
                value={activeStep.content}
                onChangeText={(text) => updateStepContent(activeStep.id, text)}
                placeholder={`Enter your ${activeStep.title.toLowerCase()}...`}
                multiline
                editable={isEditing}
                accessible
                accessibilityLabel={`${activeStep.title} input field`}
                accessibilityHint="Enter your personal information for this safety plan step"
              />
            </View>

            {/* Step-specific guidance */}
            {renderStepGuidance(activeStep)}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const renderStepGuidance = (step: SafetyPlanStep) => {
  const guidance: { [key: string]: string[] } = {
    'warning-signs': [
      'Physical signs (headaches, muscle tension, fatigue)',
      'Emotional signs (irritability, sadness, anxiety)',
      'Behavioral signs (isolation, sleep changes, appetite changes)',
      'Thoughts (negative self-talk, hopelessness)',
    ],
    'coping-strategies': [
      'Deep breathing exercises',
      'Physical activities (walking, yoga, exercise)',
      'Creative activities (drawing, music, writing)',
      'Relaxation techniques (meditation, progressive muscle relaxation)',
    ],
    'social-contacts': [
      'Trusted family members (name and phone)',
      'Close friends (name and phone)',
      'Support group members',
      'Neighbors or community members',
    ],
    'professional-contacts': [
      'Therapist or counselor (name and phone)',
      'Primary care doctor (name and phone)',
      'Crisis hotline: 988',
      'Local emergency services: 911',
    ],
  };

  const stepGuidance = guidance[step.id];
  
  if (!stepGuidance) return null;

  return (
    <View style={styles.guidanceContainer}>
      <Text style={styles.guidanceTitle}>Suggestions:</Text>
      {stepGuidance.map((item, index) => (
        <View key={index} style={styles.guidanceItem}>
          <Text style={styles.guidanceBullet}>•</Text>
          <Text style={styles.guidanceText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
  stepsNavigation: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stepsContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  stepButton: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  activeStepButton: {
    transform: [{ scale: 1.05 }],
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeStepIcon: {
    backgroundColor: '#8B5A8C',
    borderColor: '#8B5A8C',
  },
  completedStepIcon: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  requiredStepIcon: {
    borderColor: '#ff9800',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  activeStepTitle: {
    color: '#8B5A8C',
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepHeaderIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  stepHeaderText: {
    flex: 1,
  },
  stepHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stepHeaderDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  requiredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  readOnlyInput: {
    backgroundColor: '#f8f9fa',
    color: '#555',
  },
  guidanceContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  guidanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  guidanceItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  guidanceBullet: {
    fontSize: 16,
    color: '#8B5A8C',
    marginRight: 8,
    marginTop: 2,
  },
  guidanceText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
