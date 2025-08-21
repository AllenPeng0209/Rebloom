import { useLanguage } from '@/contexts/LanguageContext';
import { useMemory, UserMemory } from '@/contexts/MemoryContext';
import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function MemoryManagementScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { 
    memories, 
    getMemoriesByCategory, 
    getRecentMemories, 
    deleteMemory, 
    updateMemoryImportance,
    analyzeEmotionalPattern 
  } = useMemory();
  
  const [categorizedMemories, setCategorizedMemories] = useState<{[key: string]: UserMemory[]}>({});
  const [emotionalAnalysis, setEmotionalAnalysis] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: '全部', icon: 'list.bullet', color: '#6B73FF' },
    { id: 'personal', name: '個人', icon: 'person.crop.circle', color: '#FF6B6B' },
    { id: 'emotional', name: '情感', icon: 'heart', color: '#4ECDC4' },
    { id: 'therapeutic', name: '治療', icon: 'cross.case', color: '#45B7D1' },
    { id: 'behavioral', name: '行為', icon: 'figure.walk', color: '#96CEB4' },
    { id: 'relationship', name: '關係', icon: 'person.2', color: '#FECA57' }
  ];

  useEffect(() => {
    loadMemories();
    loadEmotionalAnalysis();
  }, []);

  const loadMemories = async () => {
    try {
      const categorized: {[key: string]: UserMemory[]} = {};
      
      for (const category of categories) {
        if (category.id === 'all') {
          categorized[category.id] = memories;
        } else {
          categorized[category.id] = await getMemoriesByCategory(category.id as any);
        }
      }
      
      setCategorizedMemories(categorized);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const loadEmotionalAnalysis = async () => {
    try {
      const analysis = await analyzeEmotionalPattern();
      setEmotionalAnalysis(analysis);
    } catch (error) {
      console.error('Error loading emotional analysis:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMemories();
    await loadEmotionalAnalysis();
    setIsRefreshing(false);
  };

  const handleDeleteMemory = (memoryId: string) => {
    Alert.alert(
      '刪除記憶',
      '確定要刪除這個記憶嗎？此操作無法復原。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMemory(memoryId);
              await loadMemories();
            } catch (error) {
              console.error('Error deleting memory:', error);
              Alert.alert('錯誤', '刪除記憶時發生錯誤');
            }
          }
        }
      ]
    );
  };

  const handleUpdateImportance = (memoryId: string, currentImportance: number) => {
    Alert.alert(
      '調整重要性',
      '選擇新的重要性等級 (1-10)',
      [
        { text: '取消', style: 'cancel' },
        { text: '低 (3)', onPress: () => updateImportance(memoryId, 3) },
        { text: '中 (5)', onPress: () => updateImportance(memoryId, 5) },
        { text: '高 (8)', onPress: () => updateImportance(memoryId, 8) },
        { text: '極高 (10)', onPress: () => updateImportance(memoryId, 10) }
      ]
    );
  };

  const updateImportance = async (memoryId: string, importance: number) => {
    try {
      await updateMemoryImportance(memoryId, importance);
      await loadMemories();
    } catch (error) {
      console.error('Error updating memory importance:', error);
      Alert.alert('錯誤', '更新記憶重要性時發生錯誤');
    }
  };

  const renderMemoryItem = (memory: UserMemory) => {
    const category = categories.find(cat => cat.id === memory.category);
    const categoryColor = category?.color || '#6B73FF';

    return (
      <View key={memory.id} style={styles.memoryCard}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.memoryGradient}
        >
          <View style={styles.memoryHeader}>
            <View style={styles.memoryCategory}>
              <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
              <Text style={styles.categoryText}>{category?.name || memory.category}</Text>
            </View>
            <View style={styles.memoryActions}>
              <TouchableOpacity 
                onPress={() => handleUpdateImportance(memory.id, memory.importance)}
                style={styles.actionButton}
              >
                <Text style={styles.importanceText}>{memory.importance}/10</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteMemory(memory.id)}
                style={styles.deleteButton}
              >
                <IconSymbol name="trash" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.memoryContent}>{memory.content}</Text>

          <View style={styles.memoryFooter}>
            <Text style={styles.memoryDate}>
              {memory.timestamp.toLocaleDateString('zh-TW')}
            </Text>
            {memory.emotionalTone && (
              <View style={[
                styles.emotionalTag,
                { backgroundColor: 
                  memory.emotionalTone === 'positive' ? '#4ECDC4' : 
                  memory.emotionalTone === 'negative' ? '#FF6B6B' : '#95A5A6'
                }
              ]}>
                <Text style={styles.emotionalText}>
                  {memory.emotionalTone === 'positive' ? '積極' : 
                   memory.emotionalTone === 'negative' ? '消極' : '中性'}
                </Text>
              </View>
            )}
          </View>

          {memory.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {memory.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const currentMemories = categorizedMemories[selectedCategory] || [];

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
        <Text style={styles.headerTitle}>記憶管理</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Emotional Analysis */}
        {emotionalAnalysis && (
          <View style={styles.analysisSection}>
            <View style={styles.analysisCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.analysisGradient}
              >
                <IconSymbol name="brain.head.profile" size={24} color="#667eea" />
                <Text style={styles.analysisTitle}>情緒分析</Text>
                <Text style={styles.analysisText}>{emotionalAnalysis}</Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Category Filters */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryFilters}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryFilter,
                    selectedCategory === category.id && styles.categoryFilterSelected
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <LinearGradient
                    colors={selectedCategory === category.id ? 
                      [category.color, `${category.color}CC`] : 
                      ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']
                    }
                    style={styles.categoryFilterGradient}
                  >
                    <IconSymbol 
                      name={category.icon as any} 
                      size={16} 
                      color={selectedCategory === category.id ? 'white' : '#FFFFFF'} 
                    />
                    <Text style={[
                      styles.categoryFilterText,
                      selectedCategory === category.id && styles.categoryFilterTextSelected
                    ]}>
                      {category.name}
                    </Text>
                    <Text style={[
                      styles.categoryCount,
                      selectedCategory === category.id && styles.categoryCountSelected
                    ]}>
                      {categorizedMemories[category.id]?.length || 0}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Memories List */}
        <View style={styles.memoriesSection}>
          {currentMemories.length > 0 ? (
            currentMemories.map(renderMemoryItem)
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.emptyGradient}
              >
                <IconSymbol name="brain" size={48} color="#95A5A6" />
                <Text style={styles.emptyTitle}>暫無記憶</Text>
                <Text style={styles.emptyDescription}>
                  開始與AI對話，系統會自動記錄重要的對話內容
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  analysisSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  analysisCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisGradient: {
    padding: 16,
    alignItems: 'center',
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginTop: 8,
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryFilter: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryFilterSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryFilterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  categoryFilterTextSelected: {
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  categoryCountSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: 'white',
  },
  memoriesSection: {
    marginHorizontal: 20,
  },
  memoryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memoryGradient: {
    padding: 16,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memoryCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6B6B',
  },
  memoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(107, 115, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  importanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B73FF',
  },
  deleteButton: {
    padding: 4,
  },
  memoryContent: {
    fontSize: 14,
    color: '#2C2C2E',
    lineHeight: 20,
    marginBottom: 12,
  },
  memoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoryDate: {
    fontSize: 12,
    color: '#95A5A6',
  },
  emotionalTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emotionalText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(107, 115, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: '#6B73FF',
  },
  emptyState: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyGradient: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
