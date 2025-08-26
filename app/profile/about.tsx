import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const appInfo = {
    version: '1.0.0',
    buildNumber: '2024.08.18',
    lastUpdate: '2024年8月18日',
    developer: 'Rebloom Team',
    website: 'https://Rebloom.app',
    email: 'support@Rebloom.app',
    privacy: 'https://Rebloom.app/privacy',
    terms: 'https://Rebloom.app/terms'
  };

  const teamMembers = [
    {
      name: t('about.team.members.founder.name'),
      role: t('about.team.members.founder.role'),
      description: t('about.team.members.founder.description'),
      icon: 'brain.head.profile'
    },
    {
      name: t('about.team.members.cto.name'),
      role: t('about.team.members.cto.role'),
      description: t('about.team.members.cto.description'),
      icon: 'lightbulb'
    },
    {
      name: t('about.team.members.ai.name'),
      role: t('about.team.members.ai.role'),
      description: t('about.team.members.ai.description'),
      icon: 'cpu'
    },
    {
      name: t('about.team.members.security.name'),
      role: t('about.team.members.security.role'),
      description: t('about.team.members.security.description'),
      icon: 'lock.shield'
    }
  ];

  const achievements = [
    {
      title: t('about.stats.users.title'),
      description: t('about.stats.users.description'),
      icon: 'person.3.fill',
      color: '#4CAF50'
    },
    {
      title: t('about.stats.availability.title'),
      description: t('about.stats.availability.description'),
      icon: 'clock.badge.checkmark',
      color: '#2196F3'
    },
    {
      title: t('about.stats.privacy.title'),
      description: t('about.stats.privacy.description'),
      icon: 'shield.checkered',
      color: '#8B5A8C'
    },
    {
      title: t('about.stats.certification.title'),
      description: t('about.stats.certification.description'),
      icon: 'rosette',
      color: '#FF9500'
    }
  ];

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  const renderTeamMember = (member: typeof teamMembers[0]) => (
    <View key={member.name} style={styles.teamMemberCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.teamMemberGradient}
      >
        <View style={styles.memberIcon}>
          <IconSymbol name={member.icon as any} size={24} color="#8B5A8C" />
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberRole}>{member.role}</Text>
          <Text style={styles.memberDescription}>{member.description}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderAchievement = (achievement: typeof achievements[0]) => (
    <View key={achievement.title} style={styles.achievementCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.achievementGradient}
      >
        <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}15` }]}>
          <IconSymbol name={achievement.icon as any} size={24} color={achievement.color} />
        </View>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
      </LinearGradient>
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
        <Text style={styles.headerTitle}>{t('about.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Logo & Info */}
        <View style={styles.logoSection}>
          <View style={styles.logoCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.logoGradient}
            >
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#8B5A8C', '#B5739E']}
                  style={styles.logoBackground}
                >
                  <IconSymbol name="heart.fill" size={48} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.appName}>Rebloom</Text>
              <Text style={styles.appTagline}>{t('about.subtitle')}</Text>
              <Text style={styles.appVersion}>{t('about.version', { version: appInfo.version })} ({appInfo.buildNumber})</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Mission */}
        <View style={styles.missionSection}>
          <Text style={styles.sectionTitle}>{t('about.mission.title')}</Text>
          <View style={styles.missionCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.missionGradient}
            >
              <Text style={styles.missionText}>
                {t('about.mission.description')}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>{t('about.stats.title')}</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map(renderAchievement)}
          </View>
        </View>

        {/* Team */}
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>{t('about.team.title')}</Text>
          {teamMembers.map(renderTeamMember)}
        </View>

        {/* Contact & Links */}
        <View style={styles.linksSection}>
          <Text style={styles.sectionTitle}>{t('about.contact.title')}</Text>
          
          <View style={styles.linksCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.linksGradient}
            >
              <TouchableOpacity 
                style={styles.linkItem}
                onPress={() => handleLink(appInfo.website)}
              >
                <View style={styles.linkIcon}>
                  <IconSymbol name="globe" size={20} color="#8B5A8C" />
                </View>
                <Text style={styles.linkText}>{t('about.contact.website')}</Text>
                <IconSymbol name="chevron.right" size={16} color="rgba(139, 90, 140, 0.6)" />
              </TouchableOpacity>

              <View style={styles.linkSeparator} />

              <TouchableOpacity 
                style={styles.linkItem}
                onPress={() => handleLink(`mailto:${appInfo.email}`)}
              >
                <View style={styles.linkIcon}>
                  <IconSymbol name="envelope" size={20} color="#8B5A8C" />
                </View>
                <Text style={styles.linkText}>{t('about.contact.email')}</Text>
                <IconSymbol name="chevron.right" size={16} color="rgba(139, 90, 140, 0.6)" />
              </TouchableOpacity>

              <View style={styles.linkSeparator} />

              <TouchableOpacity 
                style={styles.linkItem}
                onPress={() => router.push('/profile/privacy-policy' as any)}
              >
                <View style={styles.linkIcon}>
                  <IconSymbol name="hand.raised" size={20} color="#8B5A8C" />
                </View>
                <Text style={styles.linkText}>{t('about.legal.privacy')}</Text>
                <IconSymbol name="chevron.right" size={16} color="rgba(139, 90, 140, 0.6)" />
              </TouchableOpacity>

              <View style={styles.linkSeparator} />

              <TouchableOpacity 
                style={styles.linkItem}
                onPress={() => router.push('/profile/terms' as any)}
              >
                <View style={styles.linkIcon}>
                  <IconSymbol name="doc.plaintext" size={20} color="#8B5A8C" />
                </View>
                <Text style={styles.linkText}>{t('about.legal.terms')}</Text>
                <IconSymbol name="chevron.right" size={16} color="rgba(139, 90, 140, 0.6)" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            {t('about.copyright')}
          </Text>
          <Text style={styles.copyrightSubtext}>
            {t('about.tagline')}
          </Text>
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
  logoSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  logoCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  logoGradient: {
    padding: 32,
    alignItems: 'center',
  },
  logoContainer: {
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoBackground: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 12,
    textAlign: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#8B5A8C',
    fontWeight: '600',
  },
  missionSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  missionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  missionGradient: {
    padding: 20,
  },
  missionText: {
    fontSize: 16,
    color: '#2C2C2E',
    lineHeight: 24,
    marginBottom: 16,
  },
  achievementsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48.5%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  achievementGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2C2E',
    textAlign: 'center',
    marginBottom: 6,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 16,
  },
  teamSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  teamMemberCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  teamMemberGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  memberIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
    marginBottom: 4,
  },
  memberDescription: {
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 16,
  },
  linksSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  linksCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  linksGradient: {
    padding: 0,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  linkSeparator: {
    height: 1,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    marginHorizontal: 16,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
  },
  copyrightSection: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 32,
  },
  copyrightText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  copyrightSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
});