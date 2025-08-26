import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface CrisisResource {
  id: string;
  name: string;
  description: string;
  phone: string;
  website?: string;
  available: string;
  region: string;
  type: 'hotline' | 'chat' | 'emergency' | 'support';
}

export default function CrisisResourcesScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const crisisResources: CrisisResource[] = [
    {
      id: '1',
      name: t('crisisResources.hotlines.suicide.name'),
      description: t('crisisResources.hotlines.suicide.description'),
      phone: t('crisisResources.hotlines.suicide.number'),
      website: 'https://www.life1995.org.tw',
      available: t('crisisResources.available24h'),
      region: t('crisisResources.region'),
      type: 'hotline'
    },
    {
      id: '2',
      name: t('crisisResources.hotlines.crisis.name'),
      description: t('crisisResources.hotlines.crisis.description'),
      phone: t('crisisResources.hotlines.crisis.number'),
      website: 'https://www.1980.org.tw',
      available: t('crisisResources.available24h'),
      region: t('crisisResources.region'),
      type: 'hotline'
    },
    {
      id: '3',
      name: t('crisisResources.hotlines.mental.name'),
      description: t('crisisResources.hotlines.mental.description'),
      phone: t('crisisResources.hotlines.mental.number'),
      available: t('crisisResources.available24h'),
      region: t('crisisResources.region'),
      type: 'hotline'
    },
    {
      id: '4',
      name: t('crisisResources.emergency.medical.name'),
      description: t('crisisResources.emergency.medical.description'),
      phone: t('crisisResources.emergency.medical.number'),
      available: t('crisisResources.available24h'),
      region: t('crisisResources.region'),
      type: 'emergency'
    },
    {
      id: '5',
      name: t('crisisResources.emergency.police.name'),
      description: t('crisisResources.emergency.police.description'),
      phone: t('crisisResources.emergency.police.number'),
      available: t('crisisResources.available24h'),
      region: t('crisisResources.region'),
      type: 'emergency'
    }
  ];

  const handleCall = (phone: string, name: string) => {
    Alert.alert(
      t('crisisResources.callConfirm'),
      t('crisisResources.callMessage', { number: phone }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('crisisResources.call'), onPress: () => {
          Linking.openURL(`tel:${phone}`);
        }}
      ]
    );
  };

  const handleWebsite = (website: string) => {
    if (website) {
      Linking.openURL(website);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'hotline': return 'phone.fill';
      case 'chat': return 'message.fill';
      case 'emergency': return 'exclamationmark.triangle.fill';
      case 'support': return 'heart.fill';
      default: return 'phone.fill';
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'emergency': return '#FF3B30';
      case 'hotline': return '#8B5A8C';
      case 'chat': return '#4A90E2';
      case 'support': return '#4CAF50';
      default: return '#8B5A8C';
    }
  };

  const renderResource = (resource: CrisisResource) => (
    <View key={resource.id} style={styles.resourceCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.resourceGradient}
      >
        <View style={styles.resourceHeader}>
          <View style={[
            styles.resourceIcon,
            { backgroundColor: `${getResourceColor(resource.type)}15` }
          ]}>
            <IconSymbol 
              name={getResourceIcon(resource.type) as any} 
              size={24} 
              color={getResourceColor(resource.type)} 
            />
          </View>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceName}>{resource.name}</Text>
            <Text style={styles.resourceRegion}>{resource.region} • {resource.available}</Text>
          </View>
          {resource.type === 'emergency' && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyText}>緊急</Text>
            </View>
          )}
        </View>

        <Text style={styles.resourceDescription}>{resource.description}</Text>

        <View style={styles.resourceActions}>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => handleCall(resource.phone, resource.name)}
          >
            <LinearGradient
              colors={[getResourceColor(resource.type), `${getResourceColor(resource.type)}CC`]}
              style={styles.callGradient}
            >
              <IconSymbol name="phone.fill" size={16} color="white" />
              <Text style={styles.callText}>{resource.phone}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {resource.website && (
            <TouchableOpacity 
              style={styles.websiteButton}
              onPress={() => handleWebsite(resource.website!)}
            >
              <LinearGradient
                colors={['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']}
                style={styles.websiteGradient}
              >
                <IconSymbol name="globe" size={16} color="#8B5A8C" />
                <Text style={styles.websiteText}>{t('crisisResources.website')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient */}
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53', '#FF6B9D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('crisisResources.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Emergency Notice */}
        <View style={styles.emergencyNotice}>
          <View style={styles.emergencyCard}>
            <LinearGradient
              colors={['rgba(255, 59, 48, 0.9)', 'rgba(255, 59, 48, 0.8)']}
              style={styles.emergencyGradient}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={32} color="white" />
              <Text style={styles.emergencyTitle}>{t('crisisResources.emergency.title')}</Text>
              <Text style={styles.emergencyDescription}>
                {t('crisisResources.emergency.description')}
              </Text>
              <TouchableOpacity 
                style={styles.emergencyCallButton}
                onPress={() => handleCall('119', t('crisisResources.emergency.medical.name'))}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
                  style={styles.emergencyCallGradient}
                >
                  <IconSymbol name="phone.fill" size={16} color="white" />
                  <Text style={styles.emergencyCallText}>{t('crisisResources.emergency.call119')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.resourcesTitle}>{t('crisisResources.resources.title')}</Text>
          <Text style={styles.resourcesSubtitle}>
            {t('crisisResources.resources.subtitle')}
          </Text>
          
          {crisisResources.map(renderResource)}
        </View>

        {/* Self-Care Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>{t('crisisResources.selfCare.title')}</Text>
          
          <View style={styles.tipsCard}>
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.9)', 'rgba(76, 175, 80, 0.8)']}
              style={styles.tipsGradient}
            >
              <View style={styles.tipItem}>
                <IconSymbol name="lungs" size={20} color="white" />
                <Text style={styles.tipText}>深呼吸：4秒吸氣，4秒屏息，4秒呼氣</Text>
              </View>
              
              <View style={styles.tipItem}>
                <IconSymbol name="drop" size={20} color="white" />
                <Text style={styles.tipText}>喝一杯水，讓身體慢慢平靜下來</Text>
              </View>
              
              <View style={styles.tipItem}>
                <IconSymbol name="figure.walk" size={20} color="white" />
                <Text style={styles.tipText}>到戶外走走，感受新鮮空氣</Text>
              </View>
              
              <View style={styles.tipItem}>
                <IconSymbol name="person.2" size={20} color="white" />
                <Text style={styles.tipText}>聯絡信任的朋友或家人</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Contact Rebloom Support */}
        <View style={styles.supportSection}>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => router.push('/profile/contact-support' as any)}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.supportGradient}
            >
              <IconSymbol name="heart.text.square" size={20} color="#FFFFFF" />
              <Text style={styles.supportText}>聯絡 Rebloom 支持團隊</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  emergencyNotice: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  emergencyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  emergencyGradient: {
    padding: 24,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 12,
  },
  emergencyDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  emergencyCallButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emergencyCallGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  emergencyCallText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  resourcesSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resourcesSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    marginBottom: 16,
  },
  resourceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resourceGradient: {
    padding: 16,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  resourceRegion: {
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  emergencyBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  emergencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#2C2C2E',
    lineHeight: 20,
    marginBottom: 16,
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  callGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  callText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  websiteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  websiteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  websiteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
  },
  tipsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tipsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tipsGradient: {
    padding: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  tipText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  supportSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  supportButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  supportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  supportText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});