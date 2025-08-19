import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface SupportTicket {
  type: string;
  priority: string;
  subject: string;
  description: string;
  email: string;
  attachments: string[];
}

export default function ContactSupportScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [ticket, setTicket] = useState<SupportTicket>({
    type: 'technical',
    priority: 'medium',
    subject: '',
    description: '',
    email: 'alex.chen@example.com',
    attachments: []
  });

  const supportTypes = [
    { id: 'technical', name: '技術問題', icon: 'gear', color: '#4A90E2' },
    { id: 'billing', name: '帳單問題', icon: 'creditcard', color: '#FF9500' },
    { id: 'account', name: '帳戶問題', icon: 'person.circle', color: '#8B5A8C' },
    { id: 'feature', name: '功能諮詢', icon: 'questionmark.circle', color: '#4CAF50' },
    { id: 'privacy', name: '隱私問題', icon: 'lock.shield', color: '#FF3B30' },
    { id: 'other', name: '其他', icon: 'ellipsis.circle', color: '#6B6B6B' }
  ];

  const priorityLevels = [
    { id: 'low', name: '低', color: '#4CAF50', description: '一般問題，3-5個工作日回復' },
    { id: 'medium', name: '中', color: '#FF9500', description: '重要問題，1-2個工作日回復' },
    { id: 'high', name: '高', color: '#FF3B30', description: '緊急問題，24小時內回復' }
  ];

  const handleSubmit = () => {
    if (!ticket.subject.trim() || !ticket.description.trim()) {
      Alert.alert('請填寫完整', '請提供問題標題和詳細描述');
      return;
    }

    Alert.alert(
      '提交成功',
      '您的支持請求已提交。我們會根據優先級盡快回復您。',
      [
        { text: '確定', onPress: () => router.back() }
      ]
    );
  };

  const renderTypeSelector = () => (
    <View style={styles.typeSection}>
      <Text style={styles.typeLabel}>問題類型</Text>
      <View style={styles.typeGrid}>
        {supportTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeOption,
              ticket.type === type.id && styles.typeOptionSelected
            ]}
            onPress={() => setTicket(prev => ({ ...prev, type: type.id }))}
          >
            <LinearGradient
              colors={ticket.type === type.id ? 
                [type.color, `${type.color}CC`] : 
                ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']
              }
              style={styles.typeGradient}
            >
              <IconSymbol 
                name={type.icon as any} 
                size={20} 
                color={ticket.type === type.id ? 'white' : type.color} 
              />
              <Text style={[
                styles.typeText,
                ticket.type === type.id && styles.typeTextSelected
              ]}>
                {type.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPrioritySelector = () => (
    <View style={styles.prioritySection}>
      <Text style={styles.priorityLabel}>優先級</Text>
      <View style={styles.priorityOptions}>
        {priorityLevels.map((priority) => (
          <TouchableOpacity
            key={priority.id}
            style={[
              styles.priorityOption,
              ticket.priority === priority.id && styles.priorityOptionSelected
            ]}
            onPress={() => setTicket(prev => ({ ...prev, priority: priority.id }))}
          >
            <LinearGradient
              colors={ticket.priority === priority.id ? 
                [priority.color, `${priority.color}CC`] : 
                ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']
              }
              style={styles.priorityGradient}
            >
              <Text style={[
                styles.priorityName,
                ticket.priority === priority.id && styles.priorityNameSelected
              ]}>
                {priority.name}
              </Text>
              <Text style={[
                styles.priorityDescription,
                ticket.priority === priority.id && styles.priorityDescriptionSelected
              ]}>
                {priority.description}
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
        <Text style={styles.headerTitle}>聯絡客服</Text>
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
        {/* Support Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.infoGradient}
            >
              <IconSymbol name="headphones" size={32} color="#8B5A8C" />
              <Text style={styles.infoTitle}>我們隨時為您服務</Text>
              <Text style={styles.infoDescription}>
                遇到任何問題或需要幫助？我們的支持團隊會盡快回復您。通常在24小時內回應。
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Support Form */}
        <View style={styles.formSection}>
          <View style={styles.formCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.formGradient}
            >
              {renderTypeSelector()}
              
              <View style={styles.formSeparator} />
              
              {renderPrioritySelector()}
              
              <View style={styles.formSeparator} />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>問題標題</Text>
                <TextInput
                  style={styles.subjectInput}
                  value={ticket.subject}
                  onChangeText={(text) => setTicket(prev => ({ ...prev, subject: text }))}
                  placeholder="簡要描述您的問題..."
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                  maxLength={100}
                />
                <Text style={styles.charCount}>{ticket.subject.length}/100</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>詳細描述</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={ticket.description}
                  onChangeText={(text) => setTicket(prev => ({ ...prev, description: text }))}
                  placeholder="請詳細描述您遇到的問題，包括：&#10;• 具體的錯誤信息&#10;• 發生問題的步驟&#10;• 您期望的結果&#10;• 其他相關信息"
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  maxLength={1000}
                />
                <Text style={styles.charCount}>{ticket.description.length}/1000</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>聯絡郵箱</Text>
                <TextInput
                  style={styles.emailInput}
                  value={ticket.email}
                  onChangeText={(text) => setTicket(prev => ({ ...prev, email: text }))}
                  placeholder="您的郵箱地址"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                />
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Alternative Contact */}
        <View style={styles.alternativeSection}>
          <Text style={styles.alternativeTitle}>其他聯絡方式</Text>
          
          <View style={styles.alternativeCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.alternativeGradient}
            >
              <TouchableOpacity style={styles.alternativeItem}>
                <View style={styles.alternativeIcon}>
                  <IconSymbol name="envelope" size={20} color="#8B5A8C" />
                </View>
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeText}>發送郵件</Text>
                  <Text style={styles.alternativeSubtext}>support@Rebloom.app</Text>
                </View>
                <IconSymbol name="chevron.right" size={16} color="rgba(139, 90, 140, 0.6)" />
              </TouchableOpacity>

              <View style={styles.alternativeSeparator} />

              <TouchableOpacity style={styles.alternativeItem}>
                <View style={styles.alternativeIcon}>
                  <IconSymbol name="questionmark.circle" size={20} color="#8B5A8C" />
                </View>
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeText}>查看 FAQ</Text>
                  <Text style={styles.alternativeSubtext}>常見問題解答</Text>
                </View>
                <IconSymbol name="chevron.right" size={16} color="rgba(139, 90, 140, 0.6)" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <LinearGradient
              colors={['#4A90E2', '#7FB3D3']}
              style={styles.submitGradient}
            >
              <IconSymbol name="paperplane.fill" size={20} color="white" />
              <Text style={styles.submitText}>提交支持請求</Text>
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
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  infoGradient: {
    padding: 24,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2E',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    marginHorizontal: 20,
    marginBottom: 24,
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
  typeSection: {
    marginBottom: 20,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: '30%',
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
  formSeparator: {
    height: 1,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    marginVertical: 20,
  },
  prioritySection: {
    marginBottom: 20,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 12,
  },
  priorityOptions: {
    gap: 8,
  },
  priorityOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  priorityOptionSelected: {
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  priorityGradient: {
    padding: 12,
  },
  priorityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 2,
  },
  priorityNameSelected: {
    color: 'white',
  },
  priorityDescription: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  priorityDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
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
  subjectInput: {
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2C2C2E',
    marginBottom: 4,
  },
  descriptionInput: {
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2C2C2E',
    height: 150,
    marginBottom: 4,
  },
  emailInput: {
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2C2C2E',
  },
  charCount: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'right',
  },
  alternativeSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  alternativeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  alternativeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  alternativeGradient: {
    padding: 0,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  alternativeSeparator: {
    height: 1,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    marginHorizontal: 16,
  },
  alternativeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alternativeContent: {
    flex: 1,
  },
  alternativeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 2,
  },
  alternativeSubtext: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  submitSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4A90E2',
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