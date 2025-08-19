import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface TherapeuticSettings {
  primaryApproach: string;
  secondaryApproaches: string[];
  sessionLength: string;
  interventionStyle: string;
  culturalConsiderations: string[];
  conversationStyle: string;
  conversationDepth: string;
  responseLength: string;
  traumaInformed: boolean;
  genderPreference: string;
  languagePreference: string;
  religiousConsiderations: boolean;
  lgbtqAffirming: boolean;
  crisisProtocol: boolean;
  therapistReferrals: boolean;
}

export default function TherapeuticSettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [settings, setSettings] = useState<TherapeuticSettings>({
    primaryApproach: 'cbt',
    secondaryApproaches: ['mindfulness'],
    sessionLength: 'medium',
    interventionStyle: 'collaborative',
    culturalConsiderations: ['asian'],
    conversationStyle: 'supportive',
    conversationDepth: 'moderate',
    responseLength: 'medium',
    traumaInformed: true,
    genderPreference: 'no-preference',
    languagePreference: 'zh-TW',
    religiousConsiderations: false,
    lgbtqAffirming: true,
    crisisProtocol: true,
    therapistReferrals: true
  });

  const therapeuticApproaches = [
    {
      id: 'cbt',
      name: '認知行為療法 (CBT)',
      description: '關注思維模式與行為之間的關係，幫助識別和改變負面思維',
      icon: 'brain.head.profile',
      color: '#8B5A8C'
    },
    {
      id: 'dbt',
      name: '辯證行為療法 (DBT)',
      description: '專注於情緒調節、人際關係技能和痛苦耐受',
      icon: 'heart.text.square',
      color: '#4A90E2'
    },
    {
      id: 'act',
      name: '接受承諾療法 (ACT)',
      description: '強調接受困難情緒，專注於價值觀導向的行動',
      icon: 'leaf',
      color: '#4CAF50'
    },
    {
      id: 'humanistic',
      name: '人本主義療法',
      description: '以人為中心，強調自我實現和個人成長',
      icon: 'person.crop.circle.badge.plus',
      color: '#FF9500'
    },
    {
      id: 'psychodynamic',
      name: '心理動力療法',
      description: '探索無意識過程和早期經歷對當前行為的影響',
      icon: 'eye',
      color: '#9C27B0'
    },
    {
      id: 'mindfulness',
      name: '正念療法',
      description: '培養當下覺察，減少反芻思維和焦慮',
      icon: 'figure.mind.and.body',
      color: '#607D8B'
    }
  ];

  const interventionStyles = [
    { id: 'directive', name: '指導式', description: '治療師主導，提供明確指導和建議' },
    { id: 'collaborative', name: '合作式', description: '治療師與來訪者共同探索和解決問題' },
    { id: 'non-directive', name: '非指導式', description: '來訪者主導，治療師提供支持和反思' }
  ];

  const culturalOptions = [
    { id: 'asian', name: '亞洲文化', description: '理解集體主義價值觀和家庭關係' },
    { id: 'western', name: '西方文化', description: '強調個人主義和自我表達' },
    { id: 'indigenous', name: '原住民文化', description: '尊重傳統智慧和社群連結' },
    { id: 'multicultural', name: '多元文化', description: '融合多種文化背景的理解' }
  ];

  const conversationStyles = [
    { id: 'supportive', name: '支持式', description: '溫暖鼓勵，提供情感支持', icon: 'heart' },
    { id: 'analytical', name: '分析式', description: '深入分析問題根源和模式', icon: 'brain.head.profile' },
    { id: 'solution-focused', name: '解決導向', description: '專注於尋找實際解決方案', icon: 'lightbulb' },
    { id: 'exploratory', name: '探索式', description: '開放式對話，自由探索想法', icon: 'magnifyingglass' }
  ];

  const conversationDepths = [
    { id: 'surface', name: '淺層', description: '輕鬆對話，避免深入敏感話題' },
    { id: 'moderate', name: '中等', description: '平衡的深度，適度探索內心' },
    { id: 'deep', name: '深層', description: '深入探討核心問題和情感' }
  ];

  const responseLengths = [
    { id: 'brief', name: '簡潔', description: '簡短回應，重點明確' },
    { id: 'medium', name: '適中', description: '平衡的回應長度' },
    { id: 'detailed', name: '詳細', description: '深入詳細的回應和解釋' }
  ];

  const handleSave = () => {
    Alert.alert('設置已保存', '您的治療偏好設置已更新');
    router.back();
  };

  const toggleSecondaryApproach = (approach: string) => {
    setSettings(prev => ({
      ...prev,
      secondaryApproaches: prev.secondaryApproaches.includes(approach)
        ? prev.secondaryApproaches.filter(a => a !== approach)
        : [...prev.secondaryApproaches, approach]
    }));
  };

  const toggleCulturalConsideration = (culture: string) => {
    setSettings(prev => ({
      ...prev,
      culturalConsiderations: prev.culturalConsiderations.includes(culture)
        ? prev.culturalConsiderations.filter(c => c !== culture)
        : [...prev.culturalConsiderations, culture]
    }));
  };

  const renderApproachSelector = (
    title: string,
    approaches: typeof therapeuticApproaches,
    currentValue: string | string[],
    onSelect: (value: string) => void,
    multiSelect: boolean = false
  ) => (
    <View style={styles.approachSection}>
      <Text style={styles.approachTitle}>{title}</Text>
      <View style={styles.approachGrid}>
        {approaches.map((approach) => {
          const isSelected = multiSelect ? 
            (currentValue as string[]).includes(approach.id) :
            currentValue === approach.id;
          
          return (
            <TouchableOpacity
              key={approach.id}
              style={[
                styles.approachCard,
                isSelected && styles.approachCardSelected
              ]}
              onPress={() => onSelect(approach.id)}
            >
              <LinearGradient
                colors={isSelected ? 
                  [approach.color, `${approach.color}CC`] : 
                  ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']
                }
                style={styles.approachGradient}
              >
                <View style={[
                  styles.approachIcon,
                  { backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : `${approach.color}15` }
                ]}>
                  <IconSymbol 
                    name={approach.icon as any} 
                    size={24} 
                    color={isSelected ? 'white' : approach.color} 
                  />
                </View>
                <Text style={[
                  styles.approachName,
                  isSelected && styles.approachNameSelected
                ]}>
                  {approach.name}
                </Text>
                <Text style={[
                  styles.approachDescription,
                  isSelected && styles.approachDescriptionSelected
                ]}>
                  {approach.description}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
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
        <Text style={styles.headerTitle}>治療設置</Text>
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
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.introGradient}
            >
              <IconSymbol name="heart.text.square" size={32} color="#8B5A8C" />
              <Text style={styles.introTitle}>個性化治療體驗</Text>
              <Text style={styles.introDescription}>
                根據您的偏好和需求，我們會調整AI的治療方法和對話風格，為您提供最合適的心理健康支持。
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Primary Approach */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主要治療方法</Text>
          <View style={styles.primaryCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.primaryGradient}
            >
              {renderApproachSelector(
                '選擇一種主要的治療方法',
                therapeuticApproaches,
                settings.primaryApproach,
                (value) => setSettings(prev => ({ ...prev, primaryApproach: value }))
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Cultural Considerations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>文化考量</Text>
          <View style={styles.culturalCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.culturalGradient}
            >
              <Text style={styles.culturalDescription}>
                選擇與您文化背景相關的考量因素，幫助AI更好地理解您的價值觀和世界觀。
              </Text>
              <View style={styles.culturalOptions}>
                {culturalOptions.map((culture) => (
                  <TouchableOpacity
                    key={culture.id}
                    style={[
                      styles.culturalOption,
                      settings.culturalConsiderations.includes(culture.id) && styles.culturalOptionSelected
                    ]}
                    onPress={() => toggleCulturalConsideration(culture.id)}
                  >
                    <LinearGradient
                      colors={settings.culturalConsiderations.includes(culture.id) ? 
                        ['#8B5A8C', '#B5739E'] : 
                        ['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']
                      }
                      style={styles.culturalGradient}
                    >
                      <Text style={[
                        styles.culturalName,
                        settings.culturalConsiderations.includes(culture.id) && styles.culturalNameSelected
                      ]}>
                        {culture.name}
                      </Text>
                      <Text style={[
                        styles.culturalDesc,
                        settings.culturalConsiderations.includes(culture.id) && styles.culturalDescSelected
                      ]}>
                        {culture.description}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Conversation Style Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.conversationSettings')}</Text>
          
          <View style={styles.conversationCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.conversationGradient}
            >
              {/* Conversation Style */}
              <View style={styles.conversationSection}>
                <Text style={styles.conversationTitle}>{t('profile.conversationStyle')}</Text>
                <Text style={styles.conversationDescription}>
                  {t('profile.conversationStyle.description')}
                </Text>
                <View style={styles.styleGrid}>
                  {conversationStyles.map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.styleOption,
                        settings.conversationStyle === style.id && styles.styleOptionSelected
                      ]}
                      onPress={() => setSettings(prev => ({ ...prev, conversationStyle: style.id }))}
                    >
                      <LinearGradient
                        colors={settings.conversationStyle === style.id ? 
                          ['#8B5A8C', '#B5739E'] : 
                          ['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']
                        }
                        style={styles.styleGradient}
                      >
                        <IconSymbol 
                          name={style.icon as any} 
                          size={20} 
                          color={settings.conversationStyle === style.id ? 'white' : '#8B5A8C'} 
                        />
                        <Text style={[
                          styles.styleName,
                          settings.conversationStyle === style.id && styles.styleNameSelected
                        ]}>
                          {style.name}
                        </Text>
                        <Text style={[
                          styles.styleDesc,
                          settings.conversationStyle === style.id && styles.styleDescSelected
                        ]}>
                          {style.description}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.conversationSeparator} />

              {/* Conversation Depth */}
              <View style={styles.conversationSection}>
                <Text style={styles.conversationTitle}>{t('profile.conversationDepth')}</Text>
                <View style={styles.depthOptions}>
                  {conversationDepths.map((depth) => (
                    <TouchableOpacity
                      key={depth.id}
                      style={[
                        styles.depthOption,
                        settings.conversationDepth === depth.id && styles.depthOptionSelected
                      ]}
                      onPress={() => setSettings(prev => ({ ...prev, conversationDepth: depth.id }))}
                    >
                      <LinearGradient
                        colors={settings.conversationDepth === depth.id ? 
                          ['#8B5A8C', '#B5739E'] : 
                          ['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']
                        }
                        style={styles.depthGradient}
                      >
                        <Text style={[
                          styles.depthName,
                          settings.conversationDepth === depth.id && styles.depthNameSelected
                        ]}>
                          {depth.name}
                        </Text>
                        <Text style={[
                          styles.depthDesc,
                          settings.conversationDepth === depth.id && styles.depthDescSelected
                        ]}>
                          {depth.description}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.conversationSeparator} />

              {/* Response Length */}
              <View style={styles.conversationSection}>
                <Text style={styles.conversationTitle}>{t('profile.responseLength')}</Text>
                <View style={styles.lengthOptions}>
                  {responseLengths.map((length) => (
                    <TouchableOpacity
                      key={length.id}
                      style={[
                        styles.lengthOption,
                        settings.responseLength === length.id && styles.lengthOptionSelected
                      ]}
                      onPress={() => setSettings(prev => ({ ...prev, responseLength: length.id }))}
                    >
                      <LinearGradient
                        colors={settings.responseLength === length.id ? 
                          ['#8B5A8C', '#B5739E'] : 
                          ['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']
                        }
                        style={styles.lengthGradient}
                      >
                        <Text style={[
                          styles.lengthName,
                          settings.responseLength === length.id && styles.lengthNameSelected
                        ]}>
                          {length.name}
                        </Text>
                        <Text style={[
                          styles.lengthDesc,
                          settings.responseLength === length.id && styles.lengthDescSelected
                        ]}>
                          {length.description}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>高級設置</Text>
          
          <View style={styles.advancedCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.advancedGradient}
            >
              <View style={styles.toggleItem}>
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleTitle}>創傷知情療法</Text>
                  <Text style={styles.toggleDescription}>
                    使用創傷知情的方法，特別關注安全感和信任
                  </Text>
                </View>
                <Switch
                  value={settings.traumaInformed}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, traumaInformed: value }))}
                  trackColor={{ false: '#E5E5EA', true: '#8B5A8C' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleSeparator} />

              <View style={styles.toggleItem}>
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleTitle}>LGBTQ+ 友善</Text>
                  <Text style={styles.toggleDescription}>
                    確保治療環境對性別和性向多樣性友善
                  </Text>
                </View>
                <Switch
                  value={settings.lgbtqAffirming}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, lgbtqAffirming: value }))}
                  trackColor={{ false: '#E5E5EA', true: '#8B5A8C' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleSeparator} />

              <View style={styles.toggleItem}>
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleTitle}>宗教/靈性考量</Text>
                  <Text style={styles.toggleDescription}>
                    在治療中考慮您的宗教信仰和靈性需求
                  </Text>
                </View>
                <Switch
                  value={settings.religiousConsiderations}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, religiousConsiderations: value }))}
                  trackColor={{ false: '#E5E5EA', true: '#8B5A8C' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleSeparator} />

              <View style={styles.toggleItem}>
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleTitle}>專業治療師轉介</Text>
                  <Text style={styles.toggleDescription}>
                    在需要時推薦合適的專業治療師
                  </Text>
                </View>
                <Switch
                  value={settings.therapistReferrals}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, therapistReferrals: value }))}
                  trackColor={{ false: '#E5E5EA', true: '#8B5A8C' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Professional Support */}
        <View style={styles.professionalSection}>
          <Text style={styles.professionalTitle}>專業支持</Text>
          
          <View style={styles.professionalCard}>
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.9)', 'rgba(76, 175, 80, 0.8)']}
              style={styles.professionalGradient}
            >
              <IconSymbol name="person.2.badge.plus" size={32} color="white" />
              <Text style={styles.professionalCardTitle}>需要專業治療師？</Text>
              <Text style={styles.professionalDescription}>
                如果您需要更深入的專業支持，我們可以為您推薦經過認證的心理治療師。
              </Text>
              <TouchableOpacity style={styles.professionalButton}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
                  style={styles.professionalButtonGradient}
                >
                  <Text style={styles.professionalButtonText}>尋找治療師</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Reset Settings */}
        <View style={styles.resetSection}>
          <TouchableOpacity style={styles.resetButton}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.resetGradient}
            >
              <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
              <Text style={styles.resetText}>重置為推薦設置</Text>
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
  introSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  introCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  introGradient: {
    padding: 24,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2E',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  introDescription: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 22,
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
  primaryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryGradient: {
    padding: 20,
  },
  approachSection: {
    marginBottom: 20,
  },
  approachTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 12,
  },
  approachGrid: {
    gap: 12,
  },
  approachCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  approachCardSelected: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  approachGradient: {
    padding: 16,
    position: 'relative',
  },
  approachIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  approachName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 6,
  },
  approachNameSelected: {
    color: 'white',
  },
  approachDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 18,
  },
  approachDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  culturalCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  culturalGradient: {
    padding: 20,
  },
  culturalDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 16,
  },
  culturalOptions: {
    gap: 8,
  },
  culturalOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  culturalOptionSelected: {
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  culturalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5A8C',
    marginBottom: 4,
  },
  culturalNameSelected: {
    color: 'white',
  },
  culturalDesc: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  culturalDescSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  advancedCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  advancedGradient: {
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
  toggleContent: {
    flex: 1,
    marginRight: 16,
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
  professionalSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  professionalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  professionalCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  professionalGradient: {
    padding: 24,
    alignItems: 'center',
  },
  professionalCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  professionalDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  professionalButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  professionalButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  professionalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  resetSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  resetButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  resetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  conversationCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  conversationGradient: {
    padding: 20,
  },
  conversationSection: {
    marginBottom: 16,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  conversationDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 18,
    marginBottom: 16,
  },
  conversationSeparator: {
    height: 1,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    marginVertical: 16,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleOption: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  styleOptionSelected: {
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  styleGradient: {
    padding: 12,
    alignItems: 'center',
    minHeight: 80,
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
    marginTop: 6,
    marginBottom: 4,
    textAlign: 'center',
  },
  styleNameSelected: {
    color: 'white',
  },
  styleDesc: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 14,
  },
  styleDescSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  depthOptions: {
    gap: 8,
  },
  depthOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  depthOptionSelected: {
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  depthGradient: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  depthName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
    marginRight: 8,
    minWidth: 40,
  },
  depthNameSelected: {
    color: 'white',
  },
  depthDesc: {
    fontSize: 14,
    color: '#6B6B6B',
    flex: 1,
  },
  depthDescSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  lengthOptions: {
    gap: 8,
  },
  lengthOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  lengthOptionSelected: {
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lengthGradient: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lengthName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
    marginRight: 8,
    minWidth: 40,
  },
  lengthNameSelected: {
    color: 'white',
  },
  lengthDesc: {
    fontSize: 14,
    color: '#6B6B6B',
    flex: 1,
  },
  lengthDescSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});