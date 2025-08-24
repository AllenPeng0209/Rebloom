import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addMinutes, addHours, addDays } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationSettings {
  enabled: boolean;
  moodReminders: {
    enabled: boolean;
    frequency: 'daily' | 'twiceDaily' | 'threeDaily' | 'custom';
    times: string[]; // 24-hour format: ['09:00', '21:00']
    customInterval: number; // hours for custom frequency
  };
  checkInReminders: {
    enabled: boolean;
    afterInactivity: number; // hours
  };
  crisisAlerts: {
    enabled: boolean;
    immediateAlert: boolean;
  };
  insightNotifications: {
    enabled: boolean;
    weeklyInsights: boolean;
    progressUpdates: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // 24-hour format
    end: string; // 24-hour format
  };
}

interface ScheduledNotification {
  id: string;
  type: 'mood_reminder' | 'check_in' | 'crisis_alert' | 'insight' | 'progress';
  title: string;
  body: string;
  scheduledTime: Date;
  recurring: boolean;
  data?: any;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  scheduleNotification: (notification: Omit<ScheduledNotification, 'id'>) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  getPermissionStatus: () => Promise<'granted' | 'denied' | 'undetermined'>;
  testNotification: () => Promise<void>;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  moodReminders: {
    enabled: true,
    frequency: 'daily',
    times: ['09:00', '21:00'],
    customInterval: 4,
  },
  checkInReminders: {
    enabled: true,
    afterInactivity: 24,
  },
  crisisAlerts: {
    enabled: true,
    immediateAlert: true,
  },
  insightNotifications: {
    enabled: true,
    weeklyInsights: true,
    progressUpdates: true,
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
  },
};

const NotificationContext = createContext<NotificationContextType | null>(null);
const SETTINGS_STORAGE_KEY = '@notification_settings';
const SCHEDULED_NOTIFICATIONS_KEY = '@scheduled_notifications';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  useEffect(() => {
    initializeNotifications();
  }, []);

  useEffect(() => {
    if (settings.enabled) {
      scheduleAllNotifications();
    } else {
      cancelAllNotifications();
    }
  }, [settings]);

  const initializeNotifications = async () => {
    try {
      // Load saved settings
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }

      // Load scheduled notifications
      const savedNotifications = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
      if (savedNotifications) {
        const notifications = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          scheduledTime: new Date(n.scheduledTime),
        }));
        setScheduledNotifications(notifications);
      }

      // Check permission status
      const status = await getPermissionStatus();
      setPermissionStatus(status);

      // Register for push notifications if on device
      if (Device.isDevice) {
        await registerForPushNotifications();
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notification Permission',
          'Enable notifications in Settings to receive mood reminders and important alerts.'
        );
        return;
      }

      setPermissionStatus('granted');
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8B5A8C',
        });
        
        // Create specific channels for different notification types
        await Notifications.setNotificationChannelAsync('mood_reminders', {
          name: 'Mood Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8B5A8C',
          sound: 'default',
        });
        
        await Notifications.setNotificationChannelAsync('crisis_alerts', {
          name: 'Crisis Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#ff4757',
          sound: 'default',
        });
      }
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  const scheduleNotification = async (
    notification: Omit<ScheduledNotification, 'id'>
  ): Promise<string> => {
    try {
      // Check if we're in quiet hours
      if (settings.quietHours.enabled && isInQuietHours(notification.scheduledTime)) {
        // Move to next available time outside quiet hours
        notification.scheduledTime = getNextAvailableTime(notification.scheduledTime);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
        },
        trigger: {
          date: notification.scheduledTime,
          repeats: notification.recurring,
        },
      });

      const scheduledNotification: ScheduledNotification = {
        ...notification,
        id: notificationId,
      };

      const updatedNotifications = [...scheduledNotifications, scheduledNotification];
      setScheduledNotifications(updatedNotifications);
      
      await AsyncStorage.setItem(
        SCHEDULED_NOTIFICATIONS_KEY,
        JSON.stringify(updatedNotifications)
      );

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  };

  const cancelNotification = async (id: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      
      const updatedNotifications = scheduledNotifications.filter(n => n.id !== id);
      setScheduledNotifications(updatedNotifications);
      
      await AsyncStorage.setItem(
        SCHEDULED_NOTIFICATIONS_KEY,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setScheduledNotifications([]);
      await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  };

  const scheduleAllNotifications = async () => {
    // Cancel existing notifications first
    await cancelAllNotifications();
    
    if (!settings.enabled) return;

    try {
      // Schedule mood reminders
      if (settings.moodReminders.enabled) {
        await scheduleMoodReminders();
      }

      // Schedule check-in reminders
      if (settings.checkInReminders.enabled) {
        await scheduleCheckInReminders();
      }

      // Schedule insight notifications
      if (settings.insightNotifications.enabled) {
        await scheduleInsightNotifications();
      }
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
    }
  };

  const scheduleMoodReminders = async () => {
    const { frequency, times, customInterval } = settings.moodReminders;
    
    if (frequency === 'custom') {
      // Schedule recurring notifications based on custom interval
      const nextTime = addHours(new Date(), customInterval);
      await scheduleNotification({
        type: 'mood_reminder',
        title: 'How are you feeling?',
        body: 'Take a moment to check in with yourself.',
        scheduledTime: nextTime,
        recurring: true,
        data: { type: 'mood_reminder' },
      });
    } else {
      // Schedule notifications for specific times
      for (const time of times) {
        const [hours, minutes] = time.split(':').map(Number);
        const nextTime = new Date();
        nextTime.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (nextTime <= new Date()) {
          nextTime.setDate(nextTime.getDate() + 1);
        }

        await scheduleNotification({
          type: 'mood_reminder',
          title: 'Mood Check-In',
          body: 'How has your day been going?',
          scheduledTime: nextTime,
          recurring: true,
          data: { type: 'mood_reminder', time },
        });
      }
    }
  };

  const scheduleCheckInReminders = async () => {
    // This would typically be triggered based on app inactivity
    // For now, schedule a daily check
    const nextTime = addHours(new Date(), settings.checkInReminders.afterInactivity);
    
    await scheduleNotification({
      type: 'check_in',
      title: 'We miss you!',
      body: 'It\'s been a while since your last check-in. How are you doing?',
      scheduledTime: nextTime,
      recurring: false,
      data: { type: 'check_in_reminder' },
    });
  };

  const scheduleInsightNotifications = async () => {
    if (settings.insightNotifications.weeklyInsights) {
      const nextWeek = addDays(new Date(), 7);
      nextWeek.setHours(10, 0, 0, 0); // 10 AM next week
      
      await scheduleNotification({
        type: 'insight',
        title: 'Weekly Insights Ready',
        body: 'Your weekly mood insights and trends are available.',
        scheduledTime: nextWeek,
        recurring: true,
        data: { type: 'weekly_insights' },
      });
    }
  };

  const isInQuietHours = (time: Date): boolean => {
    if (!settings.quietHours.enabled) return false;
    
    const [startHour, startMinute] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = settings.quietHours.end.split(':').map(Number);
    
    const timeHour = time.getHours();
    const timeMinute = time.getMinutes();
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const currentTime = timeHour * 60 + timeMinute;
    
    if (startTime > endTime) {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  };

  const getNextAvailableTime = (time: Date): Date => {
    const [endHour, endMinute] = settings.quietHours.end.split(':').map(Number);
    const nextTime = new Date(time);
    nextTime.setHours(endHour, endMinute, 0, 0);
    
    if (nextTime <= time) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    
    return nextTime;
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  };

  const getPermissionStatus = async (): Promise<'granted' | 'denied' | 'undetermined'> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
    } catch (error) {
      console.error('Failed to get permission status:', error);
      return 'undetermined';
    }
  };

  const testNotification = async () => {
    try {
      await scheduleNotification({
        type: 'mood_reminder',
        title: 'Test Notification',
        body: 'This is a test notification from Rebloom.',
        scheduledTime: addMinutes(new Date(), 1),
        recurring: false,
        data: { test: true },
      });
      
      Alert.alert('Test Scheduled', 'You should receive a test notification in 1 minute.');
    } catch (error) {
      Alert.alert('Test Failed', 'Failed to schedule test notification.');
    }
  };

  const contextValue: NotificationContextType = {
    settings,
    updateSettings,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    requestPermissions,
    getPermissionStatus,
    testNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification Settings Screen Component
interface NotificationSettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useLanguage();
  const {
    settings,
    updateSettings,
    requestPermissions,
    getPermissionStatus,
    testNotification,
  } = useNotifications();
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  useEffect(() => {
    if (visible) {
      checkPermissionStatus();
    }
  }, [visible]);

  const checkPermissionStatus = async () => {
    const status = await getPermissionStatus();
    setPermissionStatus(status);
  };

  const handlePermissionRequest = async () => {
    const granted = await requestPermissions();
    if (granted) {
      setPermissionStatus('granted');
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    const keys = key.split('.');
    let updatedSettings = { ...settings };
    
    if (keys.length === 1) {
      (updatedSettings as any)[keys[0]] = value;
    } else if (keys.length === 2) {
      (updatedSettings as any)[keys[0]][keys[1]] = value;
    }
    
    updateSettings(updatedSettings);
  };

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingRow: React.FC<{
    title: string;
    description?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    icon?: keyof typeof Ionicons.glyphMap;
  }> = ({ title, description, value, onValueChange, onPress, rightComponent, icon }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      accessible
      accessibilityRole={onValueChange ? 'switch' : 'button'}
      accessibilityLabel={title}
      accessibilityState={value !== undefined ? { checked: value } : undefined}
    >
      {icon && (
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={24} color="#8B5A8C" />
        </View>
      )}
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      
      {rightComponent || (
        onValueChange && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#e0e0e0', true: '#8B5A8C' }}
            thumbColor="#ffffff"
            accessible={false}
          />
        )
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient colors={['#8B5A8C', '#B5739E']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity onPress={testNotification}>
              <Ionicons name="send" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content}>
          {/* Permission Status */}
          {permissionStatus !== 'granted' && (
            <View style={styles.permissionBanner}>
              <Ionicons name="warning" size={24} color="#ff9800" />
              <View style={styles.permissionText}>
                <Text style={styles.permissionTitle}>
                  Notifications {permissionStatus === 'denied' ? 'Disabled' : 'Not Enabled'}
                </Text>
                <Text style={styles.permissionDescription}>
                  {permissionStatus === 'denied'
                    ? 'Enable notifications in Settings to receive reminders.'
                    : 'Allow notifications to receive mood reminders and updates.'}
                </Text>
              </View>
              {permissionStatus === 'undetermined' && (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={handlePermissionRequest}
                >
                  <Text style={styles.permissionButtonText}>Enable</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Main Settings */}
          <SettingSection title="General">
            <SettingRow
              title="Enable Notifications"
              description="Turn all notifications on or off"
              value={settings.enabled}
              onValueChange={(value) => handleSettingChange('enabled', value)}
              icon="notifications"
            />
          </SettingSection>

          {/* Mood Reminders */}
          <SettingSection title="Mood Reminders">
            <SettingRow
              title="Mood Check-ins"
              description="Get reminded to track your mood"
              value={settings.moodReminders.enabled}
              onValueChange={(value) => handleSettingChange('moodReminders.enabled', value)}
              icon="heart"
            />
            
            <SettingRow
              title="Reminder Times"
              description={`${settings.moodReminders.frequency} - ${settings.moodReminders.times.join(', ')}`}
              onPress={() => {/* Show time picker */}}
              rightComponent={
                <Ionicons name="chevron-forward" size={20} color="#999" />
              }
              icon="time"
            />
          </SettingSection>

          {/* Check-in Reminders */}
          <SettingSection title="Check-in Reminders">
            <SettingRow
              title="Inactivity Reminders"
              description={`Remind me after ${settings.checkInReminders.afterInactivity} hours of inactivity`}
              value={settings.checkInReminders.enabled}
              onValueChange={(value) => handleSettingChange('checkInReminders.enabled', value)}
              icon="person"
            />
          </SettingSection>

          {/* Crisis Alerts */}
          <SettingSection title="Crisis Support">
            <SettingRow
              title="Crisis Alerts"
              description="Important safety notifications"
              value={settings.crisisAlerts.enabled}
              onValueChange={(value) => handleSettingChange('crisisAlerts.enabled', value)}
              icon="medical"
            />
            
            <SettingRow
              title="Immediate Alerts"
              description="Show crisis alerts even during quiet hours"
              value={settings.crisisAlerts.immediateAlert}
              onValueChange={(value) => handleSettingChange('crisisAlerts.immediateAlert', value)}
              icon="warning"
            />
          </SettingSection>

          {/* Insights */}
          <SettingSection title="Insights & Progress">
            <SettingRow
              title="Weekly Insights"
              description="Get weekly mood and progress insights"
              value={settings.insightNotifications.weeklyInsights}
              onValueChange={(value) => handleSettingChange('insightNotifications.weeklyInsights', value)}
              icon="analytics"
            />
            
            <SettingRow
              title="Progress Updates"
              description="Celebrate milestones and achievements"
              value={settings.insightNotifications.progressUpdates}
              onValueChange={(value) => handleSettingChange('insightNotifications.progressUpdates', value)}
              icon="trophy"
            />
          </SettingSection>

          {/* Quiet Hours */}
          <SettingSection title="Quiet Hours">
            <SettingRow
              title="Enable Quiet Hours"
              description="Pause notifications during specified hours"
              value={settings.quietHours.enabled}
              onValueChange={(value) => handleSettingChange('quietHours.enabled', value)}
              icon="moon"
            />
            
            <SettingRow
              title="Quiet Time"
              description={`${settings.quietHours.start} - ${settings.quietHours.end}`}
              onPress={() => {/* Show time picker */}}
              rightComponent={
                <Ionicons name="chevron-forward" size={20} color="#999" />
              }
              icon="time"
            />
          </SettingSection>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: 20,
  },
  permissionText: {
    flex: 1,
    marginLeft: 12,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e65100',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#ef6c00',
    marginTop: 2,
  },
  permissionButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 56,
  },
  settingIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});
