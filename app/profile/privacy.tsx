import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface PrivacySettings {
  dataCollection: boolean;
  analyticsSharing: boolean;
  therapistSharing: boolean;
  researchParticipation: boolean;
  conversationStorage: boolean;
  biometricAuth: boolean;
  autoDeleteOldChats: boolean;
  deleteAfterDays: number;
  shareWithEmergencyContact: boolean;
  locationTracking: boolean;
  crashReporting: boolean;
}

export default function PrivacyScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [settings, setSettings] = useState<PrivacySettings>({
    dataCollection: true,
    analyticsSharing: false,
    therapistSharing: false,
    researchParticipation: false,
    conversationStorage: true,
    biometricAuth: true,
    autoDeleteOldChats: false,
    deleteAfterDays: 365,
    shareWithEmergencyContact: false,
    locationTracking: false,
    crashReporting: true
  });

  const deleteOptions = [
    { days: 30, label: t('privacy.dataRetention.options.30days') },
    { days: 90, label: t('privacy.dataRetention.options.90days') },
    { days: 180, label: t('privacy.dataRetention.options.6months') },
    { days: 365, label: t('privacy.dataRetention.options.1year') },
    { days: 730, label: t('privacy.dataRetention.options.2years') }
  ];

  const handleExportData = () => {
    Alert.alert(
      t('privacy.dataExport.confirm'),
      t('privacy.dataExport.confirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('privacy.dataExport.startExport'), onPress: () => {
          Alert.alert(t('privacy.dataExport.success'), t('privacy.dataExport.successMessage'));
        }}
      ]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      t('privacy.dataDelete.confirm'),
      t('privacy.dataDelete.confirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('privacy.dataDelete.confirmDelete'), style: 'destructive', onPress: () => {
          Alert.alert(
            t('privacy.dataDelete.finalConfirm'),
            t('privacy.dataDelete.finalConfirmMessage'),
            [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('privacy.dataDelete.permanentDelete'), style: 'destructive', onPress: () => {
                console.log('Deleting all user data');
              }}
            ]
          );
        }}
      ]
    );
  };

  const renderToggleItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon?: string,
    critical?: boolean,
    warning?: boolean
  ) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleLeft}>
        {icon && (
          <View style={[
            styles.iconContainer,
            { backgroundColor: warning ? 'rgba(255, 149, 0, 0.15)' : 'rgba(139, 90, 140, 0.1)' }
          ]}>
            <IconSymbol 
              name={icon as any} 
              size={20} 
              color={warning ? '#FF9500' : '#8B5A8C'} 
            />
          </View>
        )}
        <View style={styles.toggleContent}>
          <Text style={styles.toggleTitle}>{title}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
          {critical && (
            <Text style={styles.criticalNote}>
              🔒 推薦保持開啟以保護您的隱私
            </Text>
          )}
          {warning && (
            <Text style={styles.warningNote}>
              ⚠️ 關閉可能影響應用功能
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5EA', true: '#8B5A8C' }}
        thumbColor="#FFFFFF"
      />
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
        {/* Privacy Overview */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.9)', 'rgba(76, 175, 80, 0.8)']}
              style={styles.overviewGradient}
            >
              <IconSymbol name="lock.shield" size={32} color="white" />
              <Text style={styles.overviewTitle}>您的隱私受到保護</Text>
              <Text style={styles.overviewDescription}>
                所有對話都經過端到端加密，只有您可以訪問。我們承諾永遠不會在未經您同意的情況下分享您的個人信息。
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Data Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>數據收集</Text>
          
          <View style={styles.toggleCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.toggleGradient}
            >
              {renderToggleItem(
                '基本數據收集',
                '收集必要的使用數據以改善服務',
                settings.dataCollection,
                (value) => setSettings(prev => ({ ...prev, dataCollection: value })),
                'chart.pie',
                false,
                true
              )}

              <View style={styles.toggleSeparator} />

              {renderToggleItem(
                '匿名分析數據',
                '分享匿名使用統計以幫助改進應用',
                settings.analyticsSharing,
                (value) => setSettings(prev => ({ ...prev, analyticsSharing: value })),
                'chart.bar.xaxis'
              )}

              <View style={styles.toggleSeparator} />

              {renderToggleItem(
                '崩潰報告',
                '自動發送崩潰報告以修復錯誤',
                settings.crashReporting,
                (value) => setSettings(prev => ({ ...prev, crashReporting: value })),
                'exclamationmark.triangle'
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>數據管理</Text>
          
          <View style={styles.dataManagementCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.dataManagementGradient}
            >
              <TouchableOpacity 
                style={styles.dataActionButton}
                onPress={handleExportData}
              >
                <View style={styles.dataActionLeft}>
                  <View style={styles.dataActionIcon}>
                    <IconSymbol name="square.and.arrow.down" size={20} color="#4A90E2" />
                  </View>
                  <View style={styles.dataActionContent}>
                    <Text style={styles.dataActionTitle}>導出我的數據</Text>
                    <Text style={styles.dataActionDescription}>
                      下載您的所有數據副本
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={16} color="rgba(139, 90, 140, 0.6)" />
              </TouchableOpacity>

              <View style={styles.actionSeparator} />

              <TouchableOpacity 
                style={styles.dataActionButton}
                onPress={handleDeleteAllData}
              >
                <View style={styles.dataActionLeft}>
                  <View style={[styles.dataActionIcon, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                    <IconSymbol name="trash" size={20} color="#FF3B30" />
                  </View>
                  <View style={styles.dataActionContent}>
                    <Text style={styles.dangerActionTitle}>刪除所有數據</Text>
                    <Text style={styles.dangerActionDescription}>
                      永久刪除您的所有信息
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Contact Privacy Officer */}
        <View style={styles.contactSection}>
          <TouchableOpacity style={styles.contactButton}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.contactGradient}
            >
              <IconSymbol name="envelope" size={20} color="#FFFFFF" />
              <Text style={styles.contactText}>聯絡隱私保護官</Text>
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
  overviewSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  overviewCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  overviewGradient: {
    padding: 24,
    alignItems: 'center',
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  overviewDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  toggleCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  toggleGradient: {
    padding: 0,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleSeparator: {
    height: 1,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    marginHorizontal: 16,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleContent: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 18,
  },
  criticalNote: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '500',
  },
  warningNote: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 4,
    fontWeight: '500',
  },
  dataManagementCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dataManagementGradient: {
    padding: 0,
  },
  dataActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionSeparator: {
    height: 1,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    marginHorizontal: 16,
  },
  dataActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataActionContent: {
    flex: 1,
  },
  dataActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  dataActionDescription: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  dangerActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  dangerActionDescription: {
    fontSize: 14,
    color: '#FF3B30',
    opacity: 0.8,
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