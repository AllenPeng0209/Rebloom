import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserProfile {
  name: string;
  email: string;
  age: string;
  location: string;
  timezone: string;
  mentalHealthGoals: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    age: '25-34',
    location: '台北, 台灣',
    timezone: 'Asia/Taipei',
    mentalHealthGoals: ['管理焦慮', '改善睡眠', '建立自信'],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
  const goalOptions = [
    '管理焦慮', '處理憂鬱', '改善睡眠', '建立自信', 
    '人際關係', '工作壓力', '情緒調節', '創傷復原',
    '個人成長', '生活平衡'
  ];

  const handleSave = () => {
    Alert.alert('保存成功', '您的個人信息已更新');
    router.back();
  };

  const toggleGoal = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      mentalHealthGoals: prev.mentalHealthGoals.includes(goal)
        ? prev.mentalHealthGoals.filter(g => g !== goal)
        : [...prev.mentalHealthGoals, goal]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient */}
      <LinearGradient
        colors={['#8B5A8C', '#B5739E', '#D48FB0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>個人信息</Text>
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
        {/* Avatar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.avatar')}</Text>
          
          <View style={styles.avatarCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.avatarCardGradient}
            >
              <View style={styles.avatarSection}>
                <View style={styles.currentAvatarContainer}>
                  <LinearGradient
                    colors={['#8B5A8C', '#B5739E']}
                    style={styles.currentAvatarGradient}
                  >
                    <IconSymbol name="person.fill" size={48} color="white" />
                  </LinearGradient>
                </View>
                <View style={styles.avatarActions}>
                  <TouchableOpacity style={styles.avatarActionButton}>
                    <LinearGradient
                      colors={['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']}
                      style={styles.avatarActionGradient}
                    >
                      <IconSymbol name="camera" size={20} color="#8B5A8C" />
                      <Text style={styles.avatarActionText}>{t('profile.avatar.takePhoto')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.avatarActionButton}>
                    <LinearGradient
                      colors={['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']}
                      style={styles.avatarActionGradient}
                    >
                      <IconSymbol name="photo" size={20} color="#8B5A8C" />
                      <Text style={styles.avatarActionText}>{t('profile.avatar.choosePhoto')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.basicInfo')}</Text>
          
          <View style={styles.inputCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.inputCardGradient}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>姓名</Text>
                <TextInput
                  style={styles.textInput}
                  value={profile.name}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
                  placeholder="輸入您的姓名"
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>電子郵件</Text>
                <TextInput
                  style={styles.textInput}
                  value={profile.email}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                  placeholder="輸入您的電子郵件"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>位置</Text>
                <TextInput
                  style={styles.textInput}
                  value={profile.location}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, location: text }))}
                  placeholder="輸入您的位置"
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                />
              </View>
            </LinearGradient>
          </View>

          {/* Age Selection */}
          <View style={styles.ageCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.ageCardGradient}
            >
              <Text style={styles.ageLabel}>年齡範圍</Text>
              <View style={styles.ageSelector}>
                {ageRanges.map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.ageOption,
                      profile.age === range && styles.ageOptionSelected
                    ]}
                    onPress={() => setProfile(prev => ({ ...prev, age: range }))}
                  >
                    <LinearGradient
                      colors={profile.age === range ? 
                        ['#8B5A8C', '#B5739E'] : 
                        ['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']
                      }
                      style={styles.ageOptionGradient}
                    >
                      <Text style={[
                        styles.ageText,
                        profile.age === range && styles.ageTextSelected
                      ]}>
                        {range}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Mental Health Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>心理健康目標</Text>
          
          <View style={styles.goalsCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.goalsCardGradient}
            >
              <Text style={styles.goalsDescription}>
                選擇您希望改善的領域，這將幫助AI更好地支持您
              </Text>
              
              <View style={styles.goalsContainer}>
                {goalOptions.map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalOption,
                      profile.mentalHealthGoals.includes(goal) && styles.goalOptionSelected
                    ]}
                    onPress={() => toggleGoal(goal)}
                  >
                    <LinearGradient
                      colors={profile.mentalHealthGoals.includes(goal) ? 
                        ['#8B5A8C', '#B5739E'] : 
                        ['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']
                      }
                      style={styles.goalOptionGradient}
                    >
                      <Text style={[
                        styles.goalText,
                        profile.mentalHealthGoals.includes(goal) && styles.goalTextSelected
                      ]}>
                        {goal}
                      </Text>
                      {profile.mentalHealthGoals.includes(goal) && (
                        <IconSymbol name="checkmark" size={16} color="white" />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>緊急聯絡人</Text>
          
          <View style={styles.emergencyCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.emergencyCardGradient}
            >
              <Text style={styles.emergencyDescription}>
                在緊急情況下可以聯繫的人員信息
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>姓名</Text>
                <TextInput
                  style={styles.textInput}
                  value={profile.emergencyContact.name}
                  onChangeText={(text) => setProfile(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, name: text }
                  }))}
                  placeholder="緊急聯絡人姓名"
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>電話號碼</Text>
                <TextInput
                  style={styles.textInput}
                  value={profile.emergencyContact.phone}
                  onChangeText={(text) => setProfile(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, phone: text }
                  }))}
                  placeholder="聯絡電話"
                  keyboardType="phone-pad"
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>關係</Text>
                <TextInput
                  style={styles.textInput}
                  value={profile.emergencyContact.relationship}
                  onChangeText={(text) => setProfile(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, relationship: text }
                  }))}
                  placeholder="與您的關係（如：家人、朋友）"
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                />
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>帳戶操作</Text>
          
          <TouchableOpacity style={styles.dangerButton}>
            <LinearGradient
              colors={['rgba(255, 59, 48, 0.9)', 'rgba(255, 59, 48, 0.8)']}
              style={styles.dangerGradient}
            >
              <IconSymbol name="trash" size={20} color="white" />
              <Text style={styles.dangerText}>刪除帳戶</Text>
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
  inputCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  inputCardGradient: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(139, 90, 140, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 90, 140, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2C2C2E',
  },
  ageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 16,
  },
  ageCardGradient: {
    padding: 20,
  },
  ageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 12,
  },
  ageSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageOption: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  ageOptionSelected: {
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  ageOptionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
  },
  ageTextSelected: {
    color: 'white',
  },
  goalsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  goalsCardGradient: {
    padding: 20,
  },
  goalsDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 16,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalOption: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  goalOptionSelected: {
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  goalOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
  },
  goalTextSelected: {
    color: 'white',
  },
  emergencyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  emergencyCardGradient: {
    padding: 20,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 16,
  },
  dangerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dangerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  avatarCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarCardGradient: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
  },
  currentAvatarContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 20,
  },
  currentAvatarGradient: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
  },
  avatarActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  avatarActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
  },
});