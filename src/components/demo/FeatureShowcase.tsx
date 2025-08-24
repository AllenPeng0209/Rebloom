import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import all the new components
import { EmergencyHelpButton } from '../crisis/EmergencyHelpButton';
import { CrisisResourceScreen } from '../crisis/CrisisResourceScreen';
import { SafetyPlanInterface } from '../crisis/SafetyPlanInterface';
import { MoodCheckInScreen } from '../mood/MoodCheckInScreen';
import { MoodVisualizationChart } from '../mood/MoodVisualizationChart';
import { QuickMoodWidget } from '../mood/QuickMoodWidget';
import { AccessibilityProvider } from '../accessibility/AccessibilityProvider';
import { AccessibilitySettingsScreen } from '../accessibility/AccessibilitySettingsScreen';
import { PrivacySettingsScreen } from '../privacy/PrivacySettingsScreen';
import { BiometricAuth } from '../privacy/BiometricAuth';
import { OfflineIndicator } from '../offline/OfflineIndicator';
import { SyncProvider, SyncStatus } from '../offline/SyncStatusManager';
import { NotificationProvider, NotificationSettingsScreen } from '../notifications/NotificationManager';
import { BiometricAuthScreen } from '../auth/BiometricAuthScreen';
import { MoodTrendsChart } from '../data-visualization/MoodTrendsChart';
import { ProgressInsightsWidget } from '../data-visualization/ProgressInsightsWidget';

// Mock data for demonstrations
const mockMoodData = [
  { date: '2024-01-15', mood: 4, emotions: ['happy', 'energetic'], notes: 'Good day!' },
  { date: '2024-01-16', mood: 3, emotions: ['tired', 'neutral'], notes: 'Average day' },
  { date: '2024-01-17', mood: 5, emotions: ['excited', 'grateful'], notes: 'Excellent day!' },
  { date: '2024-01-18', mood: 2, emotions: ['sad', 'anxious'], notes: 'Tough day' },
  { date: '2024-01-19', mood: 4, emotions: ['calm', 'hopeful'], notes: 'Better day' },
];

interface FeatureShowcaseProps {
  onClose?: () => void;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
  onClose,
}) => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [moodPeriod, setMoodPeriod] = useState<'week' | 'month' | '3months'>('week');

  const features = [
    {
      id: 'crisis-support',
      title: 'Crisis Support',
      description: 'Emergency help button, crisis resources, and safety planning',
      icon: 'medical',
      color: '#ff4757',
      demos: [
        { id: 'emergency-button', title: 'Emergency Help Button' },
        { id: 'crisis-resources', title: 'Crisis Resources' },
        { id: 'safety-plan', title: 'Safety Plan' },
      ],
    },
    {
      id: 'mood-tracking',
      title: 'Enhanced Mood Tracking',
      description: 'Comprehensive mood check-ins, visualizations, and quick logging',
      icon: 'heart',
      color: '#8B5A8C',
      demos: [
        { id: 'mood-checkin', title: 'Mood Check-in' },
        { id: 'mood-chart', title: 'Mood Visualization' },
        { id: 'quick-mood', title: 'Quick Mood Widget' },
      ],
    },
    {
      id: 'accessibility',
      title: 'Accessibility Features',
      description: 'Screen reader support, high contrast, larger touch targets',
      icon: 'accessibility',
      color: '#4CAF50',
      demos: [
        { id: 'accessibility-settings', title: 'Accessibility Settings' },
      ],
    },
    {
      id: 'privacy-security',
      title: 'Privacy & Security',
      description: 'Biometric auth, data encryption, privacy controls',
      icon: 'shield-checkmark',
      color: '#2196F3',
      demos: [
        { id: 'privacy-settings', title: 'Privacy Settings' },
        { id: 'biometric-auth', title: 'Biometric Authentication' },
      ],
    },
    {
      id: 'offline-sync',
      title: 'Offline Functionality',
      description: 'Offline indicators, sync status, connection monitoring',
      icon: 'cloud-offline',
      color: '#ff9800',
      demos: [
        { id: 'offline-indicator', title: 'Offline Indicator' },
        { id: 'sync-status', title: 'Sync Status' },
      ],
    },
    {
      id: 'notifications',
      title: 'Notification System',
      description: 'Mood reminders, crisis alerts, customizable notifications',
      icon: 'notifications',
      color: '#9C27B0',
      demos: [
        { id: 'notification-settings', title: 'Notification Settings' },
      ],
    },
    {
      id: 'data-visualization',
      title: 'Data Visualization',
      description: 'Mood trends, progress insights, interactive charts',
      icon: 'analytics',
      color: '#00BCD4',
      demos: [
        { id: 'mood-trends', title: 'Mood Trends Chart' },
        { id: 'progress-insights', title: 'Progress Insights' },
      ],
    },
  ];

  const renderDemo = () => {
    switch (activeDemo) {
      case 'crisis-resources':
        return (
          <CrisisResourceScreen
            onClose={() => setActiveDemo(null)}
          />
        );
      
      case 'safety-plan':
        return (
          <SafetyPlanInterface
            onClose={() => setActiveDemo(null)}
          />
        );
      
      case 'mood-checkin':
        return (
          <MoodCheckInScreen
            onClose={() => setActiveDemo(null)}
            onSubmit={(data) => {
              Alert.alert('Mood Logged', `Mood: ${data.mood.label}`);
              setActiveDemo(null);
            }}
          />
        );
      
      case 'accessibility-settings':
        return (
          <AccessibilitySettingsScreen
            onClose={() => setActiveDemo(null)}
          />
        );
      
      case 'privacy-settings':
        return (
          <PrivacySettingsScreen
            onClose={() => setActiveDemo(null)}
          />
        );
      
      case 'biometric-auth':
        return (
          <BiometricAuthScreen
            onSuccess={() => {
              Alert.alert('Success', 'Biometric authentication successful!');
              setActiveDemo(null);
            }}
            onSkip={() => setActiveDemo(null)}
            allowSkip
          />
        );
      
      case 'notification-settings':
        return (
          <NotificationSettingsScreen
            visible={true}
            onClose={() => setActiveDemo(null)}
          />
        );
      
      default:
        return null;
    }
  };

  if (activeDemo && ['crisis-resources', 'safety-plan', 'mood-checkin', 'accessibility-settings', 'privacy-settings', 'biometric-auth', 'notification-settings'].includes(activeDemo)) {
    return renderDemo();
  }

  return (
    <AccessibilityProvider>
      <SyncProvider>
        <NotificationProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#8B5A8C" />
            
            {/* Offline Indicator */}
            <OfflineIndicator showConnectionDetails />
            
            <LinearGradient colors={['#8B5A8C', '#B5739E']} style={styles.header}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>Rebloom Features</Text>
                
                {/* Emergency Help Button */}
                <EmergencyHelpButton
                  size="small"
                  onPress={() => Alert.alert('Emergency', 'Emergency help activated!')}
                />
              </View>
              
              <Text style={styles.headerSubtitle}>
                Comprehensive mental health support features
              </Text>
              
              {/* Sync Status */}
              <SyncStatus showDetailedView={false} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Quick Mood Widget Demo */}
              <QuickMoodWidget
                onMoodSelect={(mood) => 
                  Alert.alert('Mood Selected', `You selected: ${mood.label}`)
                }
                style={styles.quickMoodDemo}
              />

              {/* Feature Categories */}
              {features.map(feature => (
                <View key={feature.id} style={styles.featureCard}>
                  <View style={styles.featureHeader}>
                    <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                      <Ionicons
                        name={feature.icon as keyof typeof Ionicons.glyphMap}
                        size={24}
                        color="#ffffff"
                      />
                    </View>
                    
                    <View style={styles.featureInfo}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.demosContainer}>
                    {feature.demos.map(demo => (
                      <TouchableOpacity
                        key={demo.id}
                        style={styles.demoButton}
                        onPress={() => setActiveDemo(demo.id)}
                      >
                        <Text style={styles.demoButtonText}>{demo.title}</Text>
                        <Ionicons name="chevron-forward" size={16} color="#8B5A8C" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              {/* Data Visualization Demos */}
              <View style={styles.visualizationSection}>
                <Text style={styles.sectionTitle}>Data Visualization</Text>
                
                {/* Mood Trends Chart */}
                <MoodTrendsChart
                  data={mockMoodData}
                  period={moodPeriod}
                  onPeriodChange={(period) => setMoodPeriod(period as any)}
                />
                
                {/* Progress Insights Widget */}
                <ProgressInsightsWidget
                  data={mockMoodData}
                  period={moodPeriod}
                  onViewDetails={() => Alert.alert('Insights', 'Detailed insights view')}
                />
              </View>
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </NotificationProvider>
      </SyncProvider>
    </AccessibilityProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  quickMoodDemo: {
    marginHorizontal: 0,
    marginTop: 0,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  demosContainer: {
    gap: 8,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  visualizationSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
