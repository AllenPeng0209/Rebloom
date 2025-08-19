import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationSettings {
  pushEnabled: boolean;
  moodReminders: boolean;
  moodReminderTime: string;
  wellnessChecks: boolean;
  wellnessCheckFrequency: string;
  goalReminders: boolean;
  insights: boolean;
  crisisAlerts: boolean;
  promotions: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    moodReminders: true,
    moodReminderTime: '20:00',
    wellnessChecks: true,
    wellnessCheckFrequency: 'weekly',
    goalReminders: true,
    insights: true,
    crisisAlerts: true,
    promotions: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  });

  const reminderTimes = [
    { id: '09:00', label: '上午 9:00' },
    { id: '12:00', label: '中午 12:00' },
    { id: '18:00', label: '下午 6:00' },
    { id: '20:00', label: '晚上 8:00' },
    { id: '21:00', label: '晚上 9:00' }
  ];

  const handleSave = () => {
    console.log('Saving notification settings:', settings);
    router.back();
  };

  const requestNotificationPermission = async () => {
    console.log('Requesting notification permission');
  };

  const renderToggleItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon?: string,
    critical?: boolean
  ) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleLeft}>
        {icon && (
          <View style={styles.iconContainer}>
            <IconSymbol name={icon as any} size={20} color="#8B5A8C" />
          </View>
        )}
        <View style={styles.toggleContent}>
          <Text style={styles.toggleTitle}>{title}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
          {critical && (
            <Text style={styles.criticalNote}>
              ⚠️ 強烈建議保持開啟以確保安全
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

  const renderTimeSelector = (
    title: string,
    options: Array<{ id: string; label: string }>,
    currentValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.timeSection}>
      <Text style={styles.timeSectionTitle}>{title}</Text>
      <View style={styles.timeOptionsCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.timeOptionsGradient}
        >
          <View style={styles.timeOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.timeOption,
                  currentValue === option.id && styles.timeOptionSelected
                ]}
                onPress={() => onSelect(option.id)}
              >
                <LinearGradient
                  colors={currentValue === option.id ? 
                    ['#8B5A8C', '#B5739E'] : 
                    ['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']
                  }
                  style={styles.timeOptionGradient}
                >
                  <Text style={[
                    styles.timeText,
                    currentValue === option.id && styles.timeTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
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
        <Text style={styles.headerTitle}>通知設置</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveText}>{t('common.save')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notification Permission */}
        {!settings.pushEnabled && (
          <View style={styles.permissionSection}>
            <View style={styles.permissionCard}>
              <LinearGradient
                colors={['rgba(255, 149, 0, 0.9)', 'rgba(255, 149, 0, 0.8)']}
                style={styles.permissionGradient}
              >
                <IconSymbol name="bell.slash" size={32} color="white" />
                <Text style={styles.permissionTitle}>通知已關閉</Text>
                <Text style={styles.permissionDescription}>
                  開啟通知以接收重要的心理健康提醒和支持
                </Text>
                <TouchableOpacity 
                  style={styles.enableButton}
                  onPress={requestNotificationPermission}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
                    style={styles.enableGradient}
                  >
                    <Text style={styles.enableText}>開啟通知</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Core Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>核心通知</Text>
          
          <View style={styles.toggleCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.toggleGradient}
            >
              {renderToggleItem(
                '推送通知',
                '接收應用的推送通知',
                settings.pushEnabled,
                (value) => setSettings(prev => ({ ...prev, pushEnabled: value })),
                'bell'
              )}

              <View style={styles.toggleSeparator} />

              {renderToggleItem(
                '危機警報',
                '緊急心理健康資源和支持通知',
                settings.crisisAlerts,
                (value) => setSettings(prev => ({ ...prev, crisisAlerts: value })),
                'exclamationmark.triangle',
                true
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Reminder Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>提醒通知</Text>
          
          <View style={styles.toggleCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.toggleGradient}
            >
              {renderToggleItem(
                '心情記錄提醒',
                '每日提醒您記錄心情狀態',
                settings.moodReminders,
                (value) => setSettings(prev => ({ ...prev, moodReminders: value })),
                'heart.circle'
              )}

              {settings.moodReminders && (
                <View style={styles.timeConfigSection}>
                  {renderTimeSelector(
                    '提醒時間',
                    reminderTimes,
                    settings.moodReminderTime,
                    (value) => setSettings(prev => ({ ...prev, moodReminderTime: value }))
                  )}
                </View>
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Test Notification */}
        <View style={styles.testSection}>
          <TouchableOpacity style={styles.testButton}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.testGradient}
            >
              <IconSymbol name="bell.badge" size={20} color="#FFFFFF" />
              <Text style={styles.testText}>發送測試通知</Text>
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
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  permissionSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  permissionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  permissionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  enableButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  enableGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  enableText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
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
    color: '#FF9500',
    marginTop: 4,
    fontWeight: '500',
  },
  timeSection: {
    marginTop: 16,
  },
  timeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 12,
  },
  timeOptionsCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  timeOptionsGradient: {
    padding: 16,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  timeOptionSelected: {
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timeOptionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
  },
  timeTextSelected: {
    color: 'white',
  },
  timeConfigSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 90, 140, 0.1)',
    paddingTop: 16,
    marginTop: 16,
  },
  testSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  testButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  testGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  testText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});