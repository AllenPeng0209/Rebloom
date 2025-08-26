import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function HelpScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: t('help.faq.gettingStarted.question'),
      answer: t('help.faq.gettingStarted.answer'),
      category: t('help.categories.gettingStarted')
    },
    {
      id: '2',
      question: t('help.faq.privacy.question'),
      answer: t('help.faq.privacy.answer'),
      category: t('help.categories.privacy')
    },
    {
      id: '3',
      question: t('help.faq.crisis.question'),
      answer: t('help.faq.crisis.answer'),
      category: t('help.categories.safety')
    },
    {
      id: '4',
      question: t('help.faq.subscription.question'),
      answer: t('help.faq.subscription.answer'),
      category: t('help.categories.subscription')
    },
    {
      id: '5',
      question: t('help.faq.personality.question'),
      answer: t('help.faq.personality.answer'),
      category: t('help.categories.personalization')
    },
    {
      id: '6',
      question: t('help.faq.dataExport.question'),
      answer: t('help.faq.dataExport.answer'),
      category: t('help.categories.data')
    }
  ];

  const categories = [
    t('help.categories.all'),
    t('help.categories.gettingStarted'),
    t('help.categories.privacy'),
    t('help.categories.safety'),
    t('help.categories.subscription'),
    t('help.categories.personalization'),
    t('help.categories.data')
  ];

  const [selectedCategory, setSelectedCategory] = useState(t('help.categories.all'));

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === t('help.categories.all') || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderFAQItem = (item: FAQItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.faqItem}
      onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.faqGradient}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <IconSymbol 
            name={expandedFAQ === item.id ? "chevron.up" : "chevron.down"} 
            size={16} 
            color="#8B5A8C" 
          />
        </View>
        
        {expandedFAQ === item.id && (
          <View style={styles.faqAnswerContainer}>
            <View style={styles.faqSeparator} />
            <Text style={styles.faqAnswer}>{item.answer}</Text>
            <View style={styles.faqCategory}>
              <Text style={styles.faqCategoryText}>{item.category}</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.quickActionsTitle}>快速操作</Text>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionItem}
          onPress={() => router.push('/profile/contact-support' as any)}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.quickActionGradient}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="envelope" size={24} color="#8B5A8C" />
            </View>
            <Text style={styles.quickActionText}>聯絡支持</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionItem}
          onPress={() => router.push('/profile/feedback' as any)}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.quickActionGradient}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="star" size={24} color="#8B5A8C" />
            </View>
            <Text style={styles.quickActionText}>提供反饋</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionItem}
          onPress={() => router.push('/profile/crisis-resources' as any)}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.quickActionGradient}
          >
            <View style={styles.quickActionIcon}>
              <IconSymbol name="cross.case" size={24} color="#FF3B30" />
            </View>
            <Text style={styles.quickActionText}>危機資源</Text>
          </LinearGradient>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{t('help.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.searchGradient}
            >
              <View style={styles.searchContainer}>
                <IconSymbol name="magnifyingglass" size={20} color="#8B5A8C" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="搜索常見問題..."
                  placeholderTextColor="rgba(44, 44, 46, 0.5)"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <IconSymbol name="xmark.circle.fill" size={20} color="#8B5A8C" />
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{t('help.categories.title')}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonSelected
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <LinearGradient
                  colors={selectedCategory === category ? 
                    ['#8B5A8C', '#B5739E'] : 
                    ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']
                  }
                  style={styles.categoryGradient}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextSelected
                  ]}>
                    {category}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ List */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>{t('help.faq.title')}</Text>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map(renderFAQItem)
          ) : (
            <View style={styles.noResultsCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.noResultsGradient}
              >
                <IconSymbol name="magnifyingglass" size={48} color="rgba(139, 90, 140, 0.5)" />
                <Text style={styles.noResultsTitle}>{t('help.noResults.title')}</Text>
                <Text style={styles.noResultsDescription}>
                  {t('help.noResults.description')}
                </Text>
              </LinearGradient>
            </View>
          )}
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
  searchSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  searchCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchGradient: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2E',
    paddingVertical: 8,
  },
  quickActionsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionItem: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2E',
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryButtonSelected: {
    shadowColor: '#8B5A8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoryTextSelected: {
    color: 'white',
  },
  faqSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  faqItem: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faqGradient: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    flex: 1,
    marginRight: 12,
  },
  faqAnswerContainer: {
    marginTop: 12,
  },
  faqSeparator: {
    height: 1,
    backgroundColor: 'rgba(139, 90, 140, 0.2)',
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#2C2C2E',
    lineHeight: 20,
    marginBottom: 12,
  },
  faqCategory: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  faqCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5A8C',
  },
  noResultsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  noResultsGradient: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
  },
});