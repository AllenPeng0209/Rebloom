import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface AISettings {
  personality: string;
  voiceType: string;
  empathyLevel: number;
  directnessLevel: number;
  humorLevel: number;
  formalityLevel: number;
  proactiveSupport: boolean;
  crisisDetection: boolean;
  voiceEnabled: boolean;
  smartSuggestions: boolean;
  learningMode: boolean;
  languageModel: string;
}

export default function AISettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [settings, setSettings] = useState<AISettings>({
    personality: 'supportive',
    voiceType: 'warm',
    empathyLevel: 8,
    directnessLevel: 6,
    humorLevel: 4,
    formalityLevel: 5,
    proactiveSupport: true,
    crisisDetection: true,
    voiceEnabled: true,
    smartSuggestions: true,
    learningMode: true,
    languageModel: 'advanced'
  });

  const personalityOptions = [
    { id: 'supportive', name: '溫暖支持型', description: '像朋友般溫暖，提供情感支持', icon: 'heart' },
    { id: 'wise', name: '智慧導師型', description: '像導師般睿智，給予深刻見解', icon: 'brain.head.profile' },
    { id: 'gentle', name: '溫和陪伴型', description: '像家人般溫柔，耐心傾聽', icon: 'leaf' },
    { id: 'energetic', name: '活力激勵型', description: '像教練般積極，激發正能量', icon: 'bolt' }
  ];

  const voiceTypes = [
    { id: 'warm', name: '溫暖親切', description: '溫暖的語調，如摯友般親切' },
    { id: 'professional', name: '專業穩重', description: '專業的語調，如諮商師般穩重' },
    { id: 'gentle', name: '溫柔細膩', description: '溫柔的語調，如家人般細膩' },
    { id: 'encouraging', name: '鼓勵積極', description: '鼓勵的語調，如導師般積極' }
  ];

  const languageModels = [
    { id: 'standard', name: '標準模式', description: '平衡的AI能力，適合日常對話' },
    { id: 'advanced', name: '進階模式', description: '更強的理解力，深度心理分析' },
    { id: 'empathetic', name: '同理模式', description: '專注情感理解，高度同理心' }
  ];

  const handleSave = () => {
    console.log('Saving AI settings:', settings);
    router.back();
  };

  const renderSlider = (
    label: string,
    value: number,
    onValueChange: (value: number) => void,
    min: number = 1,
    max: number = 10
  ) => (
    <View style={styles.sliderCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.sliderGradient}
      >
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>{label}</Text>
          <Text style={styles.sliderValue}>{value}/{max}</Text>
        </View>
        <View style={styles.sliderTrack}>
          <LinearGradient
            colors={['#8B5A8C', '#B5739E']}
            style={[styles.sliderFill, { width: `${(value / max) * 100}%` }]}
          />
          <TouchableOpacity
            style={[styles.sliderThumb, { left: `${(value / max) * 100 - 2}%` }]}
          >
            <LinearGradient
              colors={['#8B5A8C', '#B5739E']}
              style={styles.sliderThumbGradient}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderOptionSelector = (
    title: string,
    options: Array<{ id: string; name: string; description: string }>,
    currentValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.optionSection}>
      <Text style={styles.optionTitle}>{title}</Text>
      <View style={styles.optionsCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.optionsGradient}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                index < options.length - 1 && styles.optionItemBorder,
                currentValue === option.id && styles.optionItemSelected
              ]}
              onPress={() => onSelect(option.id)}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionName,
                  currentValue === option.id && styles.optionNameSelected
                ]}>
                  {option.name}
                </Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
              {currentValue === option.id && (
                <IconSymbol name="checkmark.circle.fill" size={20} color="#8B5A8C" />
              )}
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient */}
      <LinearGradient
        colors={['#4A90E2', '#7FB3D3', '#B4D6CD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 設定</Text>
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
              <IconSymbol name="brain.head.profile" size={32} color="#4A90E2" />
              <Text style={styles.introTitle}>{t('ai.personalizeTitle')}</Text>
              <Text style={styles.introDescription}>
                {t('ai.personalizeDescription')}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* AI Personality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ai.personality')}</Text>
          <View style={styles.personalityGrid}>
            {personalityOptions.map((personality) => (
              <TouchableOpacity
                key={personality.id}
                style={[
                  styles.personalityCard,
                  settings.personality === personality.id && styles.personalityCardSelected
                ]}
                onPress={() => setSettings(prev => ({ ...prev, personality: personality.id }))}
              >
                <LinearGradient
                  colors={settings.personality === personality.id ? 
                    ['#4A90E2', '#7FB3D3'] : 
                    ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
                  }
                  style={styles.personalityGradient}
                >
                  <View style={[
                    styles.personalityIcon,
                    { backgroundColor: settings.personality === personality.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(74, 144, 226, 0.1)' }
                  ]}>
                    <IconSymbol 
                      name={personality.icon as any} 
                      size={24} 
                      color={settings.personality === personality.id ? 'white' : '#4A90E2'} 
                    />
                  </View>
                  <Text style={[
                    styles.personalityName,
                    settings.personality === personality.id && styles.personalityNameSelected
                  ]}>
                    {personality.name}
                  </Text>
                  <Text style={[
                    styles.personalityDescription,
                    settings.personality === personality.id && styles.personalityDescriptionSelected
                  ]}>
                    {personality.description}
                  </Text>
                  {settings.personality === personality.id && (
                    <View style={styles.checkmark}>
                      <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Voice Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ai.voiceSettings')}</Text>
          
          <View style={styles.voiceCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.voiceGradient}
            >
              <Text style={styles.voiceTitle}>{t('ai.voiceType')}</Text>
              <View style={styles.voiceOptions}>
                {voiceTypes.map((voice) => (
                  <TouchableOpacity
                    key={voice.id}
                    style={[
                      styles.voiceOption,
                      settings.voiceType === voice.id && styles.voiceOptionSelected
                    ]}
                    onPress={() => setSettings(prev => ({ ...prev, voiceType: voice.id }))}
                  >
                    <LinearGradient
                      colors={settings.voiceType === voice.id ? 
                        ['#4A90E2', '#7FB3D3'] : 
                        ['rgba(74, 144, 226, 0.1)', 'rgba(127, 179, 211, 0.1)']
                      }
                      style={styles.voiceOptionGradient}
                    >
                      <Text style={[
                        styles.voiceName,
                        settings.voiceType === voice.id && styles.voiceNameSelected
                      ]}>
                        {voice.name}
                      </Text>
                      <Text style={[
                        styles.voiceDesc,
                        settings.voiceType === voice.id && styles.voiceDescSelected
                      ]}>
                        {voice.description}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Personality Sliders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ai.personalityTraits')}</Text>
          
          <View style={styles.slidersCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.slidersGradient}
            >
              {renderSlider(
                t('ai.empathyLevel'),
                settings.empathyLevel,
                (value) => setSettings(prev => ({ ...prev, empathyLevel: value }))
              )}

              {renderSlider(
                t('ai.directnessLevel'),
                settings.directnessLevel,
                (value) => setSettings(prev => ({ ...prev, directnessLevel: value }))
              )}

              {renderSlider(
                t('ai.humorLevel'),
                settings.humorLevel,
                (value) => setSettings(prev => ({ ...prev, humorLevel: value }))
              )}

              {renderSlider(
                t('ai.formalityLevel'),
                settings.formalityLevel,
                (value) => setSettings(prev => ({ ...prev, formalityLevel: value }))
              )}
            </LinearGradient>
          </View>
        </View>

        {/* AI Model Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ai.modelSettings')}</Text>
          
          <View style={styles.modelCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.modelGradient}
            >
              <Text style={styles.modelTitle}>{t('ai.languageModel')}</Text>
              <View style={styles.modelOptions}>
                {languageModels.map((model) => (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.modelOption,
                      settings.languageModel === model.id && styles.modelOptionSelected
                    ]}
                    onPress={() => setSettings(prev => ({ ...prev, languageModel: model.id }))}
                  >
                    <LinearGradient
                      colors={settings.languageModel === model.id ? 
                        ['#4A90E2', '#7FB3D3'] : 
                        ['rgba(74, 144, 226, 0.1)', 'rgba(127, 179, 211, 0.1)']
                      }
                      style={styles.modelOptionGradient}
                    >
                      <Text style={[
                        styles.modelName,
                        settings.languageModel === model.id && styles.modelNameSelected
                      ]}>
                        {model.name}
                      </Text>
                      <Text style={[
                        styles.modelDesc,
                        settings.languageModel === model.id && styles.modelDescSelected
                      ]}>
                        {model.description}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Advanced Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ai.advancedFeatures')}</Text>
          
          <View style={styles.toggleCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.toggleGradient}
            >
              <View style={styles.toggleItem}>
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleTitle}>{t('ai.proactiveSupport')}</Text>
                  <Text style={styles.toggleDescription}>
                    {t('ai.proactiveSupport.description')}
                  </Text>
                </View>
                <Switch
                  value={settings.proactiveSupport}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, proactiveSupport: value }))}
                  trackColor={{ false: '#E5E5EA', true: '#4A90E2' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleSeparator} />

              <View style={styles.toggleItem}>
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleTitle}>{t('ai.smartSuggestions')}</Text>
                  <Text style={styles.toggleDescription}>
                    {t('ai.smartSuggestions.description')}
                  </Text>
                </View>
                <Switch
                  value={settings.smartSuggestions}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, smartSuggestions: value }))}
                  trackColor={{ false: '#E5E5EA', true: '#4A90E2' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleSeparator} />

              <View style={styles.toggleItem}>
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleTitle}>{t('ai.learningMode')}</Text>
                  <Text style={styles.toggleDescription}>
                    {t('ai.learningMode.description')}
                  </Text>
                </View>
                <Switch
                  value={settings.learningMode}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, learningMode: value }))}
                  trackColor={{ false: '#E5E5EA', true: '#4A90E2' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleSeparator} />

              <View style={styles.toggleItem}>
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleTitle}>{t('ai.voiceEnabled')}</Text>
                  <Text style={styles.toggleDescription}>
                    {t('ai.voiceEnabled.description')}
                  </Text>
                </View>
                <Switch
                  value={settings.voiceEnabled}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, voiceEnabled: value }))}
                  trackColor={{ false: '#E5E5EA', true: '#4A90E2' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleSeparator} />

              <View style={styles.toggleItem}>
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleTitle}>{t('ai.crisisDetection')}</Text>
                  <Text style={styles.toggleDescription}>
                    {t('ai.crisisDetection.description')}
                  </Text>
                </View>
                <Switch
                  value={settings.crisisDetection}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, crisisDetection: value }))}
                  trackColor={{ false: '#E5E5EA', true: '#4A90E2' }}
                  thumbColor="#FFFFFF"
                />
              </View>
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
              <Text style={styles.resetText}>重置為默認設置</Text>
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
  optionSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  optionsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  optionsGradient: {
    padding: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 90, 140, 0.1)',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  optionNameSelected: {
    color: '#8B5A8C',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 18,
  },
  sliderCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  sliderGradient: {
    padding: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5A8C',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: 'rgba(139, 90, 140, 0.2)',
    borderRadius: 4,
    position: 'relative',
  },
  sliderFill: {
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderThumbGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  toggleItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 90, 140, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 90, 140, 0.1)',
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
  personalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  personalityCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  personalityCardSelected: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  personalityGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    position: 'relative',
  },
  personalityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  personalityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 6,
    textAlign: 'center',
  },
  personalityNameSelected: {
    color: 'white',
  },
  personalityDescription: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 16,
  },
  personalityDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  voiceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  voiceGradient: {
    padding: 20,
  },
  voiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 16,
  },
  voiceOptions: {
    gap: 8,
  },
  voiceOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  voiceOptionSelected: {
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceOptionGradient: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginRight: 8,
    minWidth: 80,
  },
  voiceNameSelected: {
    color: 'white',
  },
  voiceDesc: {
    fontSize: 14,
    color: '#6B6B6B',
    flex: 1,
  },
  voiceDescSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  slidersCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  slidersGradient: {
    padding: 20,
  },
  modelCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  modelGradient: {
    padding: 20,
  },
  modelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 16,
  },
  modelOptions: {
    gap: 8,
  },
  modelOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modelOptionSelected: {
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modelOptionGradient: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginRight: 8,
    minWidth: 80,
  },
  modelNameSelected: {
    color: 'white',
  },
  modelDesc: {
    fontSize: 14,
    color: '#6B6B6B',
    flex: 1,
  },
  modelDescSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  toggleSeparator: {
    height: 1,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    marginHorizontal: 0,
  },
});