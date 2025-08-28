import { useLanguage } from '@/contexts/LanguageContext';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const languages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' }
];

export default function MultilingualSubscriptionDemo() {
  const { t, setLanguage, currentLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setLanguage(languageCode);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>多语言订阅管理演示</Text>
        <Text style={styles.subtitle}>Multilingual Subscription Management Demo</Text>
      </View>

      {/* Language Selector */}
      <View style={styles.languageSection}>
        <Text style={styles.sectionTitle}>选择语言 / Select Language</Text>
        <View style={styles.languageGrid}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                selectedLanguage === lang.code && styles.languageButtonActive
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={[
                styles.languageText,
                selectedLanguage === lang.code && styles.languageTextActive
              ]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Subscription Management Demo */}
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>订阅管理功能演示</Text>
        
        {/* Title */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>页面标题:</Text>
          <Text style={styles.demoValue}>{t('subscription.title')}</Text>
        </View>

        {/* Plans */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>订阅方案:</Text>
          <Text style={styles.demoValue}>{t('subscription.freePlan')}</Text>
          <Text style={styles.demoValue}>{t('subscription.premiumPlan')}</Text>
          <Text style={styles.demoValue}>{t('subscription.familyPlan')}</Text>
        </View>

        {/* Features */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>免费版功能:</Text>
          <Text style={styles.demoValue}>• {t('subscription.freeFeatures.basicChat')}</Text>
          <Text style={styles.demoValue}>• {t('subscription.freeFeatures.moodTracking')}</Text>
          <Text style={styles.demoValue}>• {t('subscription.freeFeatures.basicInsights')}</Text>
        </View>

        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>高级版功能:</Text>
          <Text style={styles.demoValue}>• {t('subscription.premiumFeatures.unlimitedChat')}</Text>
          <Text style={styles.demoValue}>• {t('subscription.premiumFeatures.deepAnalysis')}</Text>
          <Text style={styles.demoValue}>• {t('subscription.premiumFeatures.crisisSupport')}</Text>
        </View>

        {/* Family Features */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>家庭版功能:</Text>
          <Text style={styles.demoValue}>• {t('subscription.familyFeatures.supportMembers')}</Text>
          <Text style={styles.demoValue}>• {t('subscription.familyFeatures.familyDashboard')}</Text>
          <Text style={styles.demoValue}>• {t('subscription.familyFeatures.emergencyNetwork')}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>会员专享:</Text>
          <Text style={styles.demoValue}>{t('subscription.premiumExclusive')}</Text>
          <Text style={styles.demoValue}>• {t('subscription.benefits.aiAnalysis.title')}</Text>
          <Text style={styles.demoValue}>• {t('subscription.benefits.professionalConsultation.title')}</Text>
          <Text style={styles.demoValue}>• {t('subscription.benefits.support247.title')}</Text>
        </View>

        {/* Actions */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>操作按钮:</Text>
          <Text style={styles.demoValue}>{t('subscription.selectThisPlan')}</Text>
          <Text style={styles.demoValue}>{t('subscription.manageSubscription')}</Text>
          <Text style={styles.demoValue}>{t('subscription.manageSubscriptionSettings')}</Text>
        </View>
      </View>

      {/* Billing Management Demo */}
      <View style={styles.demoSection}>
        <Text style={styles.sectionTitle}>账单管理功能演示</Text>
        
        {/* Title */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>页面标题:</Text>
          <Text style={styles.demoValue}>{t('billing.title')}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>标签页:</Text>
          <Text style={styles.demoValue}>{t('billing.transactions')}</Text>
          <Text style={styles.demoValue}>{t('billing.methods')}</Text>
          <Text style={styles.demoValue}>{t('billing.invoices')}</Text>
        </View>

        {/* Status */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>状态信息:</Text>
          <Text style={styles.demoValue}>{t('billing.premiumMember')}</Text>
          <Text style={styles.demoValue}>{t('billing.nextCharge')}</Text>
          <Text style={styles.demoValue}>{t('billing.manageSubscription')}</Text>
        </View>

        {/* Transaction Status */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>交易状态:</Text>
          <Text style={styles.demoValue}>{t('billing.status.completed')}</Text>
          <Text style={styles.demoValue}>{t('billing.status.pending')}</Text>
          <Text style={styles.demoValue}>{t('billing.status.failed')}</Text>
          <Text style={styles.demoValue}>{t('billing.status.refunded')}</Text>
        </View>

        {/* Actions */}
        <View style={styles.demoItem}>
          <Text style={styles.demoLabel}>操作按钮:</Text>
          <Text style={styles.demoValue}>{t('billing.addPaymentMethod')}</Text>
          <Text style={styles.demoValue}>{t('billing.downloadInvoiceText')}</Text>
          <Text style={styles.demoValue}>{t('billing.default')}</Text>
        </View>
      </View>

      {/* Current Language Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>当前语言信息</Text>
        <Text style={styles.infoText}>当前语言代码: {currentLanguage}</Text>
        <Text style={styles.infoText}>选择语言代码: {selectedLanguage}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  languageSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  languageButtonActive: {
    backgroundColor: '#8B5A8C',
    borderColor: '#8B5A8C',
  },
  languageText: {
    fontSize: 14,
    color: '#333',
  },
  languageTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  demoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoItem: {
    marginBottom: 16,
  },
  demoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  demoValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
    paddingLeft: 8,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
