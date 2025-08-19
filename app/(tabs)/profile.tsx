import { IconSymbol } from '@/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  route?: string;
  action?: () => void;
  showArrow?: boolean;
  badge?: string;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { t } = useLanguage();
  
  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirm'),
      t('profile.logoutMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.logout'), style: 'destructive', onPress: () => {
          // TODO: Implement logout logic
          console.log('Logout');
        }}
      ]
    );
  };

  const settingSections: Array<{
    title: string;
    items: SettingItem[];
  }> = [
    {
      title: t('profile.section.personal'),
      items: [
        {
          id: 'personal-info',
          title: t('profile.personalInfo'),
          subtitle: t('profile.personalInfo.subtitle'),
          icon: 'person.circle',
          route: '/profile/personal-info',
          showArrow: true
        }
      ]
    },
    {
      title: t('profile.section.subscription'),
      items: [
        {
          id: 'subscription',
          title: t('profile.subscription'),
          subtitle: t('profile.subscription.subtitle'),
          icon: 'crown',
          route: '/profile/subscription',
          showArrow: true,
          badge: 'Premium'
        },
        {
          id: 'billing',
          title: t('profile.billing'),
          subtitle: t('profile.billing.subtitle'),
          icon: 'doc.text',
          route: '/profile/billing',
          showArrow: true
        }
      ]
    },
    {
      title: t('profile.section.ai'),
      items: [
        {
          id: 'ai-personality',
          title: t('profile.aiPersonality'),
          subtitle: t('profile.aiPersonality.subtitle'),
          icon: 'brain.head.profile',
          route: '/profile/ai-settings',
          showArrow: true
        },
        {
          id: 'therapeutic-approach',
          title: t('profile.therapeuticApproach'),
          subtitle: t('profile.therapeuticApproach.subtitle'),
          icon: 'heart.text.square',
          route: '/profile/therapeutic-settings',
          showArrow: true
        }
      ]
    },
    {
      title: t('profile.section.notifications'),
      items: [
        {
          id: 'notifications',
          title: t('profile.notifications'),
          subtitle: t('profile.notifications.subtitle'),
          icon: 'bell',
          route: '/profile/notifications',
          showArrow: true
        },
        {
          id: 'mood-reminders',
          title: t('profile.moodReminders'),
          subtitle: t('profile.moodReminders.subtitle'),
          icon: 'clock.badge',
          route: '/profile/mood-reminders',
          showArrow: true
        },
        {
          id: 'wellness-check',
          title: t('profile.wellnessCheck'),
          subtitle: t('profile.wellnessCheck.subtitle'),
          icon: 'heart.circle',
          route: '/profile/wellness-reminders',
          showArrow: true
        }
      ]
    },
    {
      title: t('profile.section.privacy'),
      items: [
        {
          id: 'privacy-settings',
          title: t('profile.privacySettings'),
          subtitle: t('profile.privacySettings.subtitle'),
          icon: 'lock.shield',
          route: '/profile/privacy',
          showArrow: true
        },
        {
          id: 'data-export',
          title: t('profile.dataExport'),
          subtitle: t('profile.dataExport.subtitle'),
          icon: 'square.and.arrow.down',
          route: '/profile/data-export',
          showArrow: true
        },
        {
          id: 'emergency-contacts',
          title: t('profile.emergencyContacts'),
          subtitle: t('profile.emergencyContacts.subtitle'),
          icon: 'phone.badge.plus',
          route: '/profile/emergency-contacts',
          showArrow: true
        }
      ]
    },
    {
      title: t('profile.section.support'),
      items: [
        {
          id: 'crisis-resources',
          title: t('profile.crisisResources'),
          subtitle: t('profile.crisisResources.subtitle'),
          icon: 'cross.case',
          route: '/profile/crisis-resources',
          showArrow: true
        },
        {
          id: 'help-center',
          title: t('profile.helpCenter'),
          subtitle: t('profile.helpCenter.subtitle'),
          icon: 'questionmark.circle',
          route: '/profile/help',
          showArrow: true
        },
        {
          id: 'contact-support',
          title: t('profile.contactSupport'),
          subtitle: t('profile.contactSupport.subtitle'),
          icon: 'envelope',
          route: '/profile/contact-support',
          showArrow: true
        },
        {
          id: 'feedback',
          title: t('profile.feedback'),
          subtitle: t('profile.feedback.subtitle'),
          icon: 'star',
          route: '/profile/feedback',
          showArrow: true
        }
      ]
    },
    {
      title: t('profile.section.about'),
      items: [
        {
          id: 'language-settings',
          title: t('profile.languageSettings'),
          subtitle: t('profile.languageSettings.subtitle'),
          icon: 'globe',
          route: '/profile/language-settings',
          showArrow: true
        },
        {
          id: 'about',
          title: t('profile.about'),
          subtitle: t('profile.about.subtitle'),
          icon: 'info.circle',
          route: '/profile/about',
          showArrow: true
        },
        {
          id: 'terms',
          title: t('profile.terms'),
          subtitle: t('profile.terms.subtitle'),
          icon: 'doc.plaintext',
          route: '/profile/terms',
          showArrow: true
        },
        {
          id: 'privacy-policy',
          title: t('profile.privacyPolicy'),
          subtitle: t('profile.privacyPolicy.subtitle'),
          icon: 'hand.raised',
          route: '/profile/privacy-policy',
          showArrow: true
        }
      ]
    }
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={() => {
        if (item.action) {
          item.action();
        } else if (item.route) {
          router.push(item.route as any);
        }
      }}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.settingItemGradient}
      >
        <View style={styles.settingItemLeft}>
          <View style={styles.iconContainer}>
            <IconSymbol 
              name={item.icon as any} 
              size={20} 
              color="#8B5A8C" 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        <View style={styles.settingItemRight}>
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          {item.showArrow && (
            <IconSymbol 
              name="chevron.right" 
              size={16} 
              color="rgba(139, 90, 140, 0.6)" 
            />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient */}
      <LinearGradient
        colors={['#6B73FF', '#9B59B6', '#E74C3C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.profileHeaderGradient}
            >
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#8B5A8C', '#B5739E']}
                  style={styles.avatarGradient}
                >
                  <IconSymbol name="person.fill" size={32} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>Alex Chen</Text>
                <Text style={styles.userSubtitle}>{t('profile.userJoinedDays', { days: '15' })}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => router.push('/profile/personal-info' as any)}
              >
                <IconSymbol name="pencil" size={16} color="#8B5A8C" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={['rgba(255, 59, 48, 0.9)', 'rgba(255, 59, 48, 0.8)']}
              style={styles.logoutGradient}
            >
              <IconSymbol name="arrow.right.square" size={20} color="white" />
              <Text style={styles.logoutText}>{t('profile.logout')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t('profile.version', { version: '1.0.0' })}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  profileHeaderCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  profileHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionContent: {
    marginHorizontal: 20,
    gap: 8,
  },
  settingItem: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 16,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    marginRight: 8,
  },
  badgeText: {
    color: '#2C2C2E',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutSection: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
});
