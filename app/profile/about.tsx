import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

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
      name: 'Dr. Sarah Chen',
      role: '心理學顧問',
      description: '臨床心理學博士，專精認知行為療法',
      icon: 'brain.head.profile'
    },
    {
      name: 'Alex Kim',
      role: '產品總監',
      description: '10年心理健康科技產品經驗',
      icon: 'lightbulb'
    },
    {
      name: 'Maya Patel',
      role: 'AI 研究員',
      description: '自然語言處理和情感計算專家',
      icon: 'cpu'
    },
    {
      name: 'David Liu',
      role: '隱私工程師',
      description: '數據安全和隱私保護專家',
      icon: 'lock.shield'
    }
  ];

  const achievements = [
    {
      title: '100萬+ 用戶信任',
      description: '全球超過一百萬用戶選擇 Rebloom',
      icon: 'person.3.fill',
      color: '#4CAF50'
    },
    {
      title: '24/7 可用性',
      description: '99.9% 的服務可用時間',
      icon: 'clock.badge.checkmark',
      color: '#2196F3'
    },
    {
      title: '隱私優先',
      description: '端到端加密，零數據洩露記錄',
      icon: 'shield.checkered',
      color: '#8B5A8C'
    },
    {
      title: '專業認證',
      description: '獲得心理健康專業機構認證',
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
        <Text style={styles.headerTitle}>關於 Rebloom</Text>
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
              <Text style={styles.appTagline}>您的AI心理健康伴侶</Text>
              <Text style={styles.appVersion}>版本 {appInfo.version} ({appInfo.buildNumber})</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Mission */}
        <View style={styles.missionSection}>
          <Text style={styles.sectionTitle}>我們的使命</Text>
          <View style={styles.missionCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.missionGradient}
            >
              <Text style={styles.missionText}>
                Rebloom 致力於讓每個人都能獲得高質量的心理健康支持。我們相信技術可以讓心理健康服務更加普及、便捷和有效。
              </Text>
              <Text style={styles.missionText}>
                通過AI技術和專業心理學知識的結合，我們為用戶提供24/7的情感支持和個性化的心理健康指導。
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>我們的成就</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map(renderAchievement)}
          </View>
        </View>

        {/* Team */}
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>核心團隊</Text>
          {teamMembers.map(renderTeamMember)}
        </View>

        {/* Contact & Links */}
        <View style={styles.linksSection}>
          <Text style={styles.sectionTitle}>聯絡我們</Text>
          
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
                <Text style={styles.linkText}>官方網站</Text>
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
                <Text style={styles.linkText}>客服郵箱</Text>
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
                <Text style={styles.linkText}>隱私政策</Text>
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
                <Text style={styles.linkText}>服務條款</Text>
                <IconSymbol name="chevron.right" size={16} color="rgba(139, 90, 140, 0.6)" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 Rebloom. 保留所有權利。
          </Text>
          <Text style={styles.copyrightSubtext}>
            用愛和技術，守護每一顆心靈
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
    gap: 12,
  },
  achievementCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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