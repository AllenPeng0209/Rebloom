import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const lastUpdated = '2024年8月18日';

  const sections = [
    {
      title: t('terms.sections.acceptance.title'),
      content: [
        t('terms.sections.acceptance.content.0'),
        t('terms.sections.acceptance.content.1'),
        t('terms.sections.acceptance.content.2')
      ]
    },
    {
      title: t('terms.sections.services.title'),
      content: [
        t('terms.sections.services.content.0'),
        t('terms.sections.services.content.1'),
        t('terms.sections.services.content.2'),
        t('terms.sections.services.content.3'),
        t('terms.sections.services.content.4'),
        t('terms.sections.services.content.5')
      ]
    },
    {
      title: t('terms.sections.eligibility.title'),
      content: [
        t('terms.sections.eligibility.content.0'),
        t('terms.sections.eligibility.content.1'),
        t('terms.sections.eligibility.content.2'),
        t('terms.sections.eligibility.content.3')
      ]
    },
    {
      title: t('terms.sections.responsibilities.title'),
      content: [
        t('terms.sections.responsibilities.content.0'),
        t('terms.sections.responsibilities.content.1'),
        t('terms.sections.responsibilities.content.2'),
        t('terms.sections.responsibilities.content.3'),
        t('terms.sections.responsibilities.content.4'),
        t('terms.sections.responsibilities.content.5')
      ]
    },
    {
      title: t('terms.sections.availability.title'),
      content: [
        t('terms.sections.availability.content.0'),
        t('terms.sections.availability.content.1'),
        t('terms.sections.availability.content.2'),
        t('terms.sections.availability.content.3'),
        t('terms.sections.availability.content.4')
      ]
    },
    {
      title: t('terms.sections.dataPrivacy.title'),
      content: [
        t('terms.sections.dataPrivacy.content.0'),
        t('terms.sections.dataPrivacy.content.1'),
        t('terms.sections.dataPrivacy.content.2'),
        t('terms.sections.dataPrivacy.content.3')
      ]
    },
    {
      title: t('terms.sections.ownership.title'),
      content: [
        t('terms.sections.ownership.content.0'),
        t('terms.sections.ownership.content.1'),
        t('terms.sections.ownership.content.2'),
        t('terms.sections.ownership.content.3'),
        t('terms.sections.ownership.content.4')
      ]
    },
    {
      title: t('terms.sections.userContent.title'),
      content: [
        t('terms.sections.userContent.content.0'),
        t('terms.sections.userContent.content.1'),
        t('terms.sections.userContent.content.2'),
        t('terms.sections.userContent.content.3')
      ]
    },
    {
      title: t('terms.sections.disclaimer.title'),
      content: [
        t('terms.sections.disclaimer.content.0'),
        t('terms.sections.disclaimer.content.1'),
        t('terms.sections.disclaimer.content.2'),
        t('terms.sections.disclaimer.content.3')
      ]
    },
    {
      title: t('terms.sections.limitation.title'),
      content: [
        t('terms.sections.limitation.content.0'),
        t('terms.sections.limitation.content.1'),
        t('terms.sections.limitation.content.2')
      ]
    },
    {
      title: t('terms.sections.indemnification.title'),
      content: [
        t('terms.sections.indemnification.content.0'),
        t('terms.sections.indemnification.content.1')
      ]
    },
    {
      title: t('terms.sections.termination.title'),
      content: [
        t('terms.sections.termination.content.0'),
        t('terms.sections.termination.content.1'),
        t('terms.sections.termination.content.2'),
        t('terms.sections.termination.content.3'),
        t('terms.sections.termination.content.4')
      ]
    },
    {
      title: t('terms.sections.governingLaw.title'),
      content: [
        t('terms.sections.governingLaw.content.0'),
        t('terms.sections.governingLaw.content.1'),
        t('terms.sections.governingLaw.content.2')
      ]
    },
    {
      title: t('terms.sections.modifications.title'),
      content: [
        t('terms.sections.modifications.content.0'),
        t('terms.sections.modifications.content.1'),
        t('terms.sections.modifications.content.2')
      ]
    },
    {
      title: t('terms.sections.contact.title'),
      content: [
        t('terms.sections.contact.content.0'),
        t('terms.sections.contact.content.1'),
        t('terms.sections.contact.content.2'),
        t('terms.sections.contact.content.3')
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
        <Text style={styles.headerTitle}>{t('terms.title')}</Text>
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
                <IconSymbol name="doc.plaintext" size={24} color="#8B5A8C" />
              </View>
              <View style={styles.updatedInfo}>
                              <Text style={styles.updatedTitle}>{t('terms.title')}</Text>
              <Text style={styles.updatedDate}>{t('terms.lastUpdated', { date: lastUpdated })}</Text>
              <Text style={styles.updatedDescription}>
                {t('terms.description')}
              </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Table of Contents */}
        <View style={styles.tocSection}>
          <Text style={styles.tocTitle}>{t('terms.toc')}</Text>
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

        {/* Terms Content */}
        <View style={styles.termsSection}>
          <View style={styles.termsCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.termsGradient}
            >
              {sections.map(renderSection)}
            </LinearGradient>
          </View>
        </View>

        {/* Agreement Section */}
        <View style={styles.agreementSection}>
          <View style={styles.agreementCard}>
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.9)', 'rgba(76, 175, 80, 0.8)']}
              style={styles.agreementGradient}
            >
              <IconSymbol name="checkmark.seal" size={32} color="white" />
              <Text style={styles.agreementTitle}>{t('terms.agreement')}</Text>
              <Text style={styles.agreementText}>
                {t('terms.agreementText')}
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
              <Text style={styles.contactText}>{t('terms.contactLegal')}</Text>
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
  termsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  termsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  termsGradient: {
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
  agreementSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  agreementCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  agreementGradient: {
    padding: 24,
    alignItems: 'center',
  },
  agreementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  agreementText: {
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
