import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const lastUpdated = '2024年8月18日';

  const sections = [
    {
      title: t('privacy.sections.overview.title'),
      content: [
        t('privacy.sections.overview.content.0'),
        t('privacy.sections.overview.content.1'),
        t('privacy.sections.overview.content.2')
      ]
    },
    {
      title: t('privacy.sections.informationCollected.title'),
      content: [
        t('privacy.sections.informationCollected.content.0'),
        '',
        t('privacy.sections.informationCollected.content.1'),
        t('privacy.sections.informationCollected.content.2'),
        t('privacy.sections.informationCollected.content.3'),
        t('privacy.sections.informationCollected.content.4'),
        t('privacy.sections.informationCollected.content.5'),
        t('privacy.sections.informationCollected.content.6')
      ]
    },
    {
      title: t('privacy.sections.collectionMethods.title'),
      content: [
        t('privacy.sections.collectionMethods.content.0'),
        '',
        t('privacy.sections.collectionMethods.content.1'),
        t('privacy.sections.collectionMethods.content.2'),
        t('privacy.sections.collectionMethods.content.3'),
        t('privacy.sections.collectionMethods.content.4')
      ]
    },
    {
      title: t('privacy.sections.informationUse.title'),
      content: [
        t('privacy.sections.informationUse.content.0'),
        '',
        t('privacy.sections.informationUse.content.1'),
        t('privacy.sections.informationUse.content.2'),
        t('privacy.sections.informationUse.content.3'),
        t('privacy.sections.informationUse.content.4'),
        t('privacy.sections.informationUse.content.5'),
        t('privacy.sections.informationUse.content.6'),
        t('privacy.sections.informationUse.content.7')
      ]
    },
    {
      title: t('privacy.sections.informationSharing.title'),
      content: [
        t('privacy.sections.informationSharing.content.0'),
        '',
        t('privacy.sections.informationSharing.content.1'),
        t('privacy.sections.informationSharing.content.2'),
        t('privacy.sections.informationSharing.content.3'),
        t('privacy.sections.informationSharing.content.4'),
        t('privacy.sections.informationSharing.content.5'),
        t('privacy.sections.informationSharing.content.6')
      ]
    },
    {
      title: t('privacy.sections.dataSecurity.title'),
      content: [
        t('privacy.sections.dataSecurity.content.0'),
        '',
        t('privacy.sections.dataSecurity.content.1'),
        t('privacy.sections.dataSecurity.content.2'),
        t('privacy.sections.dataSecurity.content.3'),
        t('privacy.sections.dataSecurity.content.4'),
        t('privacy.sections.dataSecurity.content.5')
      ]
    },
    {
      title: t('privacy.sections.dataRetention.title'),
      content: [
        t('privacy.sections.dataRetention.content.0'),
        '',
        t('privacy.sections.dataRetention.content.1'),
        t('privacy.sections.dataRetention.content.2'),
        t('privacy.sections.dataRetention.content.3'),
        t('privacy.sections.dataRetention.content.4')
      ]
    },
    {
      title: t('privacy.sections.yourRights.title'),
      content: [
        t('privacy.sections.yourRights.content.0'),
        '',
        t('privacy.sections.yourRights.content.1'),
        t('privacy.sections.yourRights.content.2'),
        t('privacy.sections.yourRights.content.3'),
        t('privacy.sections.yourRights.content.4'),
        t('privacy.sections.yourRights.content.5'),
        t('privacy.sections.yourRights.content.6'),
        t('privacy.sections.yourRights.content.7')
      ]
    },
    {
      title: t('privacy.sections.cookiesTracking.title'),
      content: [
        t('privacy.sections.cookiesTracking.content.0'),
        '',
        t('privacy.sections.cookiesTracking.content.1'),
        t('privacy.sections.cookiesTracking.content.2'),
        t('privacy.sections.cookiesTracking.content.3'),
        t('privacy.sections.cookiesTracking.content.4')
      ]
    },
    {
      title: t('privacy.sections.childrenPrivacy.title'),
      content: [
        t('privacy.sections.childrenPrivacy.content.0'),
        t('privacy.sections.childrenPrivacy.content.1'),
        t('privacy.sections.childrenPrivacy.content.2'),
        t('privacy.sections.childrenPrivacy.content.3')
      ]
    },
    {
      title: t('privacy.sections.internationalTransfer.title'),
      content: [
        t('privacy.sections.internationalTransfer.content.0'),
        t('privacy.sections.internationalTransfer.content.1'),
        t('privacy.sections.internationalTransfer.content.2'),
        t('privacy.sections.internationalTransfer.content.3')
      ]
    },
    {
      title: t('privacy.sections.thirdPartyServices.title'),
      content: [
        t('privacy.sections.thirdPartyServices.content.0'),
        '',
        t('privacy.sections.thirdPartyServices.content.1'),
        t('privacy.sections.thirdPartyServices.content.2'),
        t('privacy.sections.thirdPartyServices.content.3'),
        t('privacy.sections.thirdPartyServices.content.4')
      ]
    },
    {
      title: t('privacy.sections.policyUpdates.title'),
      content: [
        t('privacy.sections.policyUpdates.content.0'),
        t('privacy.sections.policyUpdates.content.1'),
        t('privacy.sections.policyUpdates.content.2'),
        t('privacy.sections.policyUpdates.content.3')
      ]
    },
    {
      title: t('privacy.sections.contactUs.title'),
      content: [
        t('privacy.sections.contactUs.content.0'),
        '',
        t('privacy.sections.contactUs.content.1'),
        t('privacy.sections.contactUs.content.2'),
        t('privacy.sections.contactUs.content.3'),
        '',
        t('privacy.sections.contactUs.content.4')
      ]
    }
  ];

  const renderSection = (section: typeof sections[0], index: number) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.content.map((paragraph, pIndex) => (
          <Text key={pIndex} style={styles.sectionParagraph}>
            {paragraph}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacy.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.updatedSection}>
          <View style={styles.updatedCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.updatedGradient}
            >
              <View style={styles.updatedIcon}>
                <IconSymbol name="hand.raised" size={24} color="#8B5A8C" />
              </View>
              <View style={styles.updatedInfo}>
                <Text style={styles.updatedTitle}>{t('privacy.title')}</Text>
                <Text style={styles.updatedDate}>{t('privacy.lastUpdated', { date: lastUpdated })}</Text>
                <Text style={styles.updatedDescription}>
                  {t('privacy.description')}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Privacy Shield */}
        <View style={styles.shieldSection}>
          <View style={styles.shieldCard}>
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.9)', 'rgba(76, 175, 80, 0.8)']}
              style={styles.shieldGradient}
            >
              <IconSymbol name="lock.shield" size={32} color="white" />
              <Text style={styles.shieldTitle}>{t('privacy.shield.title')}</Text>
              <Text style={styles.shieldDescription}>
                {t('privacy.shield.description')}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Table of Contents */}
        <View style={styles.tocSection}>
          <Text style={styles.tocTitle}>{t('privacy.toc')}</Text>
          <View style={styles.tocCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.tocGradient}
            >
              {sections.map((section, index) => (
                <TouchableOpacity key={index} style={styles.tocItem}>
                  <Text style={styles.tocItemText}>{section.title}</Text>
                  <IconSymbol name="chevron.right" size={16} color="rgba(139, 90, 140, 0.6)" />
                </TouchableOpacity>
              ))}
            </LinearGradient>
          </View>
        </View>

        {/* Privacy Content */}
        <View style={styles.privacySection}>
          <View style={styles.privacyCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.privacyGradient}
            >
              {sections.map(renderSection)}
            </LinearGradient>
          </View>
        </View>

        {/* Rights Summary */}
        <View style={styles.rightsSection}>
          <Text style={styles.rightsTitle}>{t('privacy.rightsSummary.title')}</Text>
          <View style={styles.rightsCard}>
            <LinearGradient
              colors={['rgba(255, 152, 0, 0.9)', 'rgba(255, 152, 0, 0.8)']}
              style={styles.rightsGradient}
            >
              <IconSymbol name="person.badge.key" size={32} color="white" />
              <Text style={styles.rightsMainTitle}>{t('privacy.rightsSummary.dataControl')}</Text>
              <Text style={styles.rightsText}>
                {t('privacy.rightsSummary.description')}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <TouchableOpacity style={styles.contactButton}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.contactGradient}
            >
              <IconSymbol name="envelope" size={20} color="#FFFFFF" />
              <Text style={styles.contactText}>{t('privacy.contactPrivacyOfficer')}</Text>
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
  updatedSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  updatedCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  updatedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  updatedIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  updatedInfo: {
    flex: 1,
  },
  updatedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  updatedDate: {
    fontSize: 14,
    color: '#8B5A8C',
    fontWeight: '600',
    marginBottom: 8,
  },
  updatedDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 18,
  },
  shieldSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  shieldCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  shieldGradient: {
    padding: 24,
    alignItems: 'center',
  },
  shieldTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  shieldDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  tocSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tocCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tocGradient: {
    padding: 0,
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 90, 140, 0.1)',
  },
  tocItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
  },
  privacySection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  privacyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  privacyGradient: {
    padding: 0,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 90, 140, 0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 16,
  },
  sectionContent: {
    marginLeft: 8,
  },
  sectionParagraph: {
    fontSize: 16,
    color: '#2C2C2E',
    lineHeight: 24,
    marginBottom: 12,
  },
  rightsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  rightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  rightsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  rightsGradient: {
    padding: 24,
    alignItems: 'center',
  },
  rightsMainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  rightsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  contactSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  contactButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
