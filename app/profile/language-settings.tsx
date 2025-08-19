import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/ui/IconSymbol';
import { Language, useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}

export default function LanguageSettingsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { language, setLanguage, t, resetLanguage } = useLanguage();

  const languageOptions: LanguageOption[] = [
    {
      code: 'zh-TW',
      name: 'Traditional Chinese',
      nativeName: '繁體中文',
      flag: '🇹🇼',
      description: '台灣繁體中文'
    },
    {
      code: 'zh-CN',
      name: 'Simplified Chinese',
      nativeName: '简体中文',
      flag: '🇨🇳',
      description: '中国简体中文'
    },
    {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      flag: '🇯🇵',
      description: '日本語'
    },
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      description: 'English (United States)'
    }
  ];

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      await setLanguage(newLanguage);
      Alert.alert(
        t('common.success'),
        t('language.saveSuccess'),
        [
          { text: t('common.confirm'), onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to save language settings');
    }
  };

  const renderLanguageOption = (option: LanguageOption) => (
    <TouchableOpacity
      key={option.code}
      style={[
        styles.languageOption,
        language === option.code && styles.languageOptionSelected
      ]}
      onPress={() => handleLanguageChange(option.code)}
    >
      <LinearGradient
        colors={language === option.code ? 
          ['rgba(139, 90, 140, 0.15)', 'rgba(181, 115, 158, 0.15)'] : 
          ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
        }
        style={styles.languageOptionGradient}
      >
        <View style={styles.languageOptionLeft}>
          <Text style={styles.languageFlag}>{option.flag}</Text>
          <View style={styles.languageInfo}>
            <ThemedText style={[
              styles.languageName,
              language === option.code && styles.languageNameSelected
            ]}>
              {option.nativeName}
            </ThemedText>
            <ThemedText style={styles.languageDescription}>
              {option.description}
            </ThemedText>
          </View>
        </View>
        
        {language === option.code && (
          <View style={styles.checkmarkContainer}>
            <IconSymbol name="checkmark.circle.fill" size={24} color="#8B5A8C" />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
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
        <Text style={styles.headerTitle}>{t('language.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Language Selection Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.infoGradient}
            >
              <IconSymbol name="globe" size={32} color="#8B5A8C" />
              <Text style={styles.infoTitle}>{t('language.select')}</Text>
              <Text style={styles.infoDescription}>
                選擇您偏好的語言。所有介面和AI對話都會切換到您選擇的語言。
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Language Options */}
        <View style={styles.languageSection}>
          {languageOptions.map(renderLanguageOption)}
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfoSection}>
          <View style={styles.additionalInfoCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']}
              style={styles.additionalInfoGradient}
            >
              <View style={styles.infoItem}>
                <IconSymbol name="brain.head.profile" size={20} color="#8B5A8C" />
                <Text style={styles.infoItemText}>
                  AI 對話會自動適應您選擇的語言和文化背景
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <IconSymbol name="shield.checkered" size={20} color="#8B5A8C" />
                <Text style={styles.infoItemText}>
                  所有語言版本都提供相同的隱私保護
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <IconSymbol name="heart.text.square" size={20} color="#8B5A8C" />
                <Text style={styles.infoItemText}>
                  治療內容經過專業心理學家本地化審核
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Reset Section */}
        <View style={styles.helpSection}>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={async () => {
              await resetLanguage();
              Alert.alert('已重置', '语言已重置为繁体中文');
            }}
          >
            <LinearGradient
              colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.1)']}
              style={styles.helpGradient}
            >
              <IconSymbol name="arrow.counterclockwise" size={20} color="#FFFFFF" />
              <Text style={styles.helpText}>重置语言设置</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => router.push('/profile/help' as any)}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.helpGradient}
            >
              <IconSymbol name="questionmark.circle" size={20} color="#FFFFFF" />
              <Text style={styles.helpText}>需要語言支持幫助？</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
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
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  infoGradient: {
    padding: 24,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
  },
  languageSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  languageOption: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  languageOptionSelected: {
    shadowColor: '#8B5A8C',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  languageOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  languageOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2C2C2E',
  },
  languageNameSelected: {
    color: '#8B5A8C',
  },
  languageDescription: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  checkmarkContainer: {
    marginLeft: 16,
  },
  additionalInfoSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  additionalInfoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  additionalInfoGradient: {
    padding: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItemText: {
    fontSize: 14,
    color: '#2C2C2E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  helpSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  helpButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  helpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  helpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
