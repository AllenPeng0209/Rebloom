import { t } from '@/lib/constants/i18n';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleNotificationForEvent(event: { id: string, title: string, date: Date, startTime?: string | null }) {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      Alert.alert(t('common.error'), t('notifications.pushPermissionFailed') || 'Failed to get push token for push notification!');
      return;
    }
  }

  const { date, startTime, title, id } = event;
  const triggerDate = new Date(date);

  if (startTime) {
    const [hours, minutes] = startTime.split(':').map(Number);
    triggerDate.setHours(hours);
    triggerDate.setMinutes(minutes);
  } else {
    triggerDate.setHours(9);
    triggerDate.setMinutes(0);
  }
  
  // Schedule 10 minutes before the event
  const deltaMs = triggerDate.getTime() - Date.now() - 10 * 60 * 1000;

  if (deltaMs > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.eventReminderTitle') || 'Upcoming Event Reminder',
          body: t('notifications.eventReminderBody', { title }) || `${title} is starting in 10 minutes.`,
          data: { eventId: id },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.floor(deltaMs / 1000), repeats: false },
      });
      console.log(`Notification scheduled for event: ${title} in ${Math.floor(deltaMs / 1000)} seconds`);
  } else {
    console.log(`Event ${title} is in the past, not scheduling notification.`);
  }
}

export async function cancelNotificationForEvent(eventId: string) {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.eventId === eventId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      console.log(`Cancelled notification for eventId: ${eventId}`);
    }
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
        Alert.alert(t('common.error'), t('notifications.pushPermissionFailed') || 'Failed to get push token for push notification!');
        return;
    }
  }

  try {
    const pushToken = await Notifications.getExpoPushTokenAsync();
    token = pushToken.data;

  } catch (e) {
    console.error("Failed to get push token", e);
  }

  return token;
} 