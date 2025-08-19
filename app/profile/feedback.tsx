import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface Feedback {
  type: string;
  rating: number;
  title: string;
  description: string;
  email: string;
  includeUsageData: boolean;
}

export default function FeedbackScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [feedback, setFeedback] = useState<Feedback>({
    type: 'general',
    rating: 0,
    title: '',
    description: '',
    email: 'alex.chen@example.com',
    includeUsageData: true
  });

  const feedbackTypes = [
    { id: 'bug', name: '錯誤報告', icon: 'exclamationmark.triangle', color: '#FF3B30' },
    { id: 'feature', name: '功能建議', icon: 'lightbulb', color: '#FFD700' },
    { id: 'improvement', name: '改進建議', icon: 'arrow.up.circle', color: '#4CAF50' },
    { id: 'general', name: '一般反饋', icon: 'message', color: '#8B5A8C' },
    { id: 'praise', name: '表揚', icon: 'heart.fill', color: '#FF69B4' }
  ];

  const handleSubmit = () => {
    if (!feedback.title.trim() || !feedback.description.trim()) {
      Alert.alert('請填寫完整', '請提供反饋標題和詳細描述');
      return;
    }

    Alert.alert(
      '提交反饋',
      '感謝您的寶貴意見！我們會仔細審閱您的反饋並盡快回復。',
      [
        { text: '確定', onPress: () => {
          console.log('Submitting feedback:', feedback);
          router.back();
        }}
      ]
    );
  };

  const renderStarRating = () => (
    <View style={styles.ratingSection}>
      <Text style={styles.ratingLabel}>整體評分</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setFeedback(prev => ({ ...prev, rating: star }))}
            style={styles.starButton}
          >
            <IconSymbol
              name={star <= feedback.rating ? "star.fill" : "star"}
              size={28}
              color={star <= feedback.rating ? "#FFD700" : "rgba(255, 215, 0, 0.3)"}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingText}>
        {feedback.rating === 0 ? '請點擊星星評分' :
         feedback.rating <= 2 ? '我們會努力改進' :
         feedback.rating <= 3 ? '感謝您的反饋' :
         feedback.rating <= 4 ? '很高興您喜歡我們的應用' :
         '太棒了！感謝您的支持'}
      </Text>
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.typeSection}>
      <Text style={styles.typeLabel}>反饋類型</Text>
      <View style={styles.typeGrid}>
        {feedbackTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeOption,
              feedback.type === type.id && styles.typeOptionSelected
            ]}
            onPress={() => setFeedback(prev => ({ ...prev, type: type.id }))}
          >
            <LinearGradient
              colors={feedback.type === type.id ? 
                [type.color, `${type.color}CC`] : 
                ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']
              }
              style={styles.typeGradient}
            >
              <IconSymbol 
                name={type.icon as any} 
                size={24} 
                color={feedback.type === type.id ? 'white' : type.color} 
              />
              <Text style={[
                styles.typeText,
                feedback.type === type.id && styles.typeTextSelected
              ]}>
                {type.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
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
        <Text style={styles.headerTitle}>意見反饋</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.submitHeaderButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
            style={styles.submitHeaderGradient}
          >
            <Text style={styles.submitHeaderText}>提交</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.welcomeGradient}
            >
              <IconSymbol name="heart.fill" size={32} color="#8B5A8C" />
              <Text style={styles.welcomeTitle}>您的意見對我們很重要</Text>
              <Text style={styles.welcomeDescription}>
                幫助我們改進 Rebloom，為更多人提供更好的心理健康支持。每一條反饋都會被認真對待。
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <View style={styles.ratingCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.ratingGradient}
            >
              {renderStarRating()}
            </LinearGradient>
          </View>
        </View>

        {/* Feedback Type */}
        <View style={styles.section}>
          <View style={styles.typeCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.typeCardGradient}
            >
              {renderTypeSelector()}
            </LinearGradient>
          </View>
        </View>

        {/* Feedback Form */}
        <View style={styles.section}>
          <View style={styles.formCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.formGradient}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>標題</Text>
                <TextInput
                  style={styles.titleInput}
                  value={feedback.title}
                  onChangeText={(text) => setFeedback(prev => ({ ...prev, title: text }))}
                  placeholder="簡要描述您的反饋..."
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                  maxLength={100}
                />
                <Text style={styles.charCount}>{feedback.title.length}/100</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>詳細描述</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={feedback.description}
                  onChangeText={(text) => setFeedback(prev => ({ ...prev, description: text }))}
                  placeholder="請詳細描述您的想法、遇到的問題或建議..."
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={1000}
                />
                <Text style={styles.charCount}>{feedback.description.length}/1000</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>聯絡郵箱</Text>
                <TextInput
                  style={styles.emailInput}
                  value={feedback.email}
                  onChangeText={(text) => setFeedback(prev => ({ ...prev, email: text }))}
                  placeholder="您的郵箱地址"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                />
                <Text style={styles.emailNote}>
                  我們可能會通過此郵箱與您聯絡以獲取更多信息
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <LinearGradient
              colors={['#8B5A8C', '#B5739E']}
              style={styles.submitGradient}
            >
              <IconSymbol name="paperplane.fill" size={20} color="white" />
              <Text style={styles.submitText}>提交反饋</Text>
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
  submitHeaderButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  submitHeaderGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  submitHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  welcomeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2E',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  ratingCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  ratingGradient: {
    padding: 20,
  },
  ratingSection: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  typeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  typeCardGradient: {
    padding: 20,
  },
  typeSection: {
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  typeOption: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 100,
  },
  typeOptionSelected: {
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  typeGradient: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C2C2E',
    textAlign: 'center',
  },
  typeTextSelected: {
    color: 'white',
  },
  formCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  formGradient: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: 'rgba(139, 90, 140, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 90, 140, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2C2C2E',
    marginBottom: 4,
  },
  descriptionInput: {
    backgroundColor: 'rgba(139, 90, 140, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 90, 140, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2C2C2E',
    height: 120,
    marginBottom: 4,
  },
  emailInput: {
    backgroundColor: 'rgba(139, 90, 140, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 90, 140, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2C2C2E',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'right',
  },
  emailNote: {
    fontSize: 12,
    color: '#6B6B6B',
    lineHeight: 16,
  },
  submitSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
  },
});