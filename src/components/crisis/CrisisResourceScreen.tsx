import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/contexts/LanguageContext';
import { EmergencyHelpButton } from './EmergencyHelpButton';

interface CrisisResource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  website?: string;
  text?: string;
  available24?: boolean;
  category: 'hotline' | 'text' | 'chat' | 'emergency' | 'support';
  icon: keyof typeof Ionicons.glyphMap;
}

const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: '988',
    name: '988 Suicide & Crisis Lifeline',
    description: '24/7 free and confidential support for people in distress',
    phone: '988',
    website: 'https://988lifeline.org',
    available24: true,
    category: 'hotline',
    icon: 'call',
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741 for crisis support via text message',
    text: '741741',
    website: 'https://crisistextline.org',
    available24: true,
    category: 'text',
    icon: 'chatbubble',
  },
  {
    id: 'emergency',
    name: 'Emergency Services',
    description: 'Call 911 for immediate life-threatening emergencies',
    phone: '911',
    available24: true,
    category: 'emergency',
    icon: 'medical',
  },
  {
    id: 'nami',
    name: 'NAMI HelpLine',
    description: 'Information and support for mental health conditions',
    phone: '1-800-950-6264',
    website: 'https://nami.org/help',
    available24: false,
    category: 'support',
    icon: 'information-circle',
  },
  {
    id: 'samhsa',
    name: 'SAMHSA National Helpline',
    description: 'Treatment referral and information service',
    phone: '1-800-662-4357',
    website: 'https://samhsa.gov',
    available24: true,
    category: 'hotline',
    icon: 'help-circle',
  },
];

interface CrisisResourceScreenProps {
  onClose?: () => void;
}

export const CrisisResourceScreen: React.FC<CrisisResourceScreenProps> = ({
  onClose,
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'hotline', name: 'Hotlines', icon: 'call' },
    { id: 'text', name: 'Text', icon: 'chatbubble' },
    { id: 'emergency', name: 'Emergency', icon: 'medical' },
    { id: 'support', name: 'Support', icon: 'heart' },
  ];

  const filteredResources = selectedCategory === 'all' 
    ? CRISIS_RESOURCES 
    : CRISIS_RESOURCES.filter(resource => resource.category === selectedCategory);

  const handleResourcePress = async (resource: CrisisResource) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (resource.phone) {
      Linking.openURL(`tel:${resource.phone}`);
    } else if (resource.text) {
      if (Platform.OS === 'ios') {
        Linking.openURL(`sms:${resource.text}&body=HOME`);
      } else {
        Linking.openURL(`sms:${resource.text}?body=HOME`);
      }
    } else if (resource.website) {
      Linking.openURL(resource.website);
    }
  };

  const renderResource = (resource: CrisisResource) => {
    const isEmergency = resource.category === 'emergency';
    
    return (
      <TouchableOpacity
        key={resource.id}
        style={[
          styles.resourceCard,
          isEmergency && styles.emergencyCard,
        ]}
        onPress={() => handleResourcePress(resource)}
        accessible
        accessibilityLabel={`${resource.name}. ${resource.description}`}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={isEmergency ? ['#ff4757', '#ff3742'] : ['#ffffff', '#f8f9fa']}
          style={styles.resourceGradient}
        >
          <View style={styles.resourceHeader}>
            <View style={[
              styles.iconContainer,
              isEmergency && styles.emergencyIconContainer,
            ]}>
              <Ionicons
                name={resource.icon}
                size={24}
                color={isEmergency ? '#ffffff' : '#8B5A8C'}
              />
            </View>
            <View style={styles.resourceInfo}>
              <Text style={[
                styles.resourceName,
                isEmergency && styles.emergencyText,
              ]}>
                {resource.name}
              </Text>
              {resource.available24 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>24/7</Text>
                </View>
              )}
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isEmergency ? '#ffffff' : '#666'}
            />
          </View>
          <Text style={[
            styles.resourceDescription,
            isEmergency && styles.emergencyText,
          ]}>
            {resource.description}
          </Text>
          {(resource.phone || resource.text) && (
            <Text style={[
              styles.contactInfo,
              isEmergency && styles.emergencyContactInfo,
            ]}>
              {resource.phone ? `Call: ${resource.phone}` : `Text: ${resource.text}`}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5A8C" />
      
      <LinearGradient
        colors={['#8B5A8C', '#B5739E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessible
            accessibilityLabel="Close crisis resources"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crisis Resources</Text>
          <EmergencyHelpButton size="small" />
        </View>
        <Text style={styles.headerSubtitle}>
          24/7 support is available. You are not alone.
        </Text>
      </LinearGradient>

      {/* Category Filter */}
      <ScrollView
        horizontal
        style={styles.categoryContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.activeCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            accessible
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategory === category.id }}
          >
            <Ionicons
              name={category.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={selectedCategory === category.id ? '#ffffff' : '#8B5A8C'}
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.activeCategoryText,
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resources List */}
      <ScrollView
        style={styles.resourcesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resourcesContent}
      >
        {filteredResources.map(renderResource)}
        
        {/* Safety Tips */}
        <View style={styles.safetyTips}>
          <Text style={styles.safetyTitle}>Safety Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>
                Keep important numbers saved in your phone
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="people" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>
                Tell trusted friends or family about your mental health
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="time" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>
                Create a safety plan for difficult moments
              </Text>
            </View>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeCategoryButton: {
    backgroundColor: '#8B5A8C',
    borderColor: '#8B5A8C',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5A8C',
  },
  activeCategoryText: {
    color: '#ffffff',
  },
  resourcesList: {
    flex: 1,
  },
  resourcesContent: {
    padding: 20,
  },
  resourceCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyCard: {
    shadowColor: '#ff4757',
    shadowOpacity: 0.3,
    elevation: 6,
  },
  resourceGradient: {
    padding: 16,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  resourceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  emergencyText: {
    color: '#ffffff',
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5A8C',
  },
  emergencyContactInfo: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  safetyTips: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 12,
  },
});
