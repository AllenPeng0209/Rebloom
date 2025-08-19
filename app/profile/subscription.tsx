import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [currentPlan, setCurrentPlan] = useState('premium');

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: '免費版',
      price: '免費',
      period: '永久',
      features: [
        '每日基本對話',
        '心情追蹤',
        '基礎洞察',
        '社區支持'
      ],
      current: currentPlan === 'free'
    },
    {
      id: 'premium',
      name: '高級版',
      price: '¥68',
      period: '每月',
      features: [
        '無限制對話',
        '深度心理分析',
        '個性化治療建議',
        '24/7 危機支持',
        '專業心理師諮詢',
        '高級洞察報告',
        '語音對話功能',
        '優先客戶支持'
      ],
      popular: true,
      current: currentPlan === 'premium'
    },
    {
      id: 'family',
      name: '家庭版',
      price: '¥168',
      period: '每月',
      features: [
        '支持最多6個家庭成員',
        '所有高級版功能',
        '家庭心理健康儀表板',
        '家庭治療師諮詢',
        '緊急聯絡網絡',
        '家庭心理健康計劃'
      ],
      current: currentPlan === 'family'
    }
  ];

  const handleUpgrade = (planId: string) => {
    if (planId === currentPlan) return;
    
    Alert.alert(
      '升級訂閱',
      `您確定要升級到${plans.find(p => p.id === planId)?.name}嗎？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '確認升級', onPress: () => {
          setCurrentPlan(planId);
          Alert.alert('升級成功', '您的訂閱已升級！');
        }}
      ]
    );
  };

  const handleManageBilling = () => {
    router.push('/profile/billing' as any);
  };

  const renderPlan = (plan: SubscriptionPlan) => (
    <View 
      key={plan.id}
      style={[
        styles.planCard,
        plan.popular && styles.popularPlan,
        plan.current && styles.currentPlan
      ]}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.popularBadgeGradient}
          >
            <IconSymbol name="star.fill" size={12} color="white" />
            <Text style={styles.popularText}>最受歡迎</Text>
          </LinearGradient>
        </View>
      )}

      <LinearGradient
        colors={plan.current ? 
          ['rgba(139, 90, 140, 0.15)', 'rgba(181, 115, 158, 0.15)'] :
          ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
        }
        style={styles.planGradient}
      >
        <View style={styles.planHeader}>
          <Text style={[
            styles.planName,
            plan.current && styles.planNameCurrent
          ]}>
            {plan.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[
              styles.planPrice,
              plan.current && styles.planPriceCurrent
            ]}>
              {plan.price}
            </Text>
            <Text style={[
              styles.planPeriod,
              plan.current && styles.planPeriodCurrent
            ]}>
              {plan.period}
            </Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <IconSymbol 
                name="checkmark.circle.fill" 
                size={16} 
                color={plan.current ? "#8B5A8C" : "#4CAF50"} 
              />
              <Text style={[
                styles.featureText,
                plan.current && styles.featureTextCurrent
              ]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.planButton,
            plan.current && styles.currentPlanButton
          ]}
          onPress={() => plan.current ? handleManageBilling() : handleUpgrade(plan.id)}
          disabled={plan.current && plan.id === 'free'}
        >
          <LinearGradient
            colors={plan.current ? 
              ['rgba(139, 90, 140, 0.2)', 'rgba(181, 115, 158, 0.2)'] :
              ['#8B5A8C', '#B5739E']
            }
            style={styles.planButtonGradient}
          >
            <Text style={[
              styles.planButtonText,
              plan.current && styles.currentPlanButtonText
            ]}>
              {plan.current ? 
                (plan.id === 'free' ? '當前方案' : '管理訂閱') : 
                '選擇此方案'
              }
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>訂閱管理</Text>
        <TouchableOpacity onPress={handleManageBilling} style={styles.billingButton}>
          <IconSymbol name="creditcard" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.9)', 'rgba(76, 175, 80, 0.8)']}
              style={styles.statusGradient}
            >
              <IconSymbol name="crown.fill" size={32} color="white" />
              <Text style={styles.statusTitle}>高級會員</Text>
              <Text style={styles.statusDescription}>
                下次續費日期：2024年9月18日
              </Text>
              <Text style={styles.statusSubDescription}>
                感謝您選擇 Rebloom Premium！
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.plansTitle}>選擇訂閱方案</Text>
          {plans.map(renderPlan)}
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Premium 會員專享</Text>
          
          <View style={styles.benefitsCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.benefitsGradient}
            >
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <IconSymbol name="brain.head.profile" size={24} color="#8B5A8C" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>AI 深度分析</Text>
                  <Text style={styles.benefitDescription}>
                    獲得更深入的心理狀態分析和個性化建議
                  </Text>
                </View>
              </View>

              <View style={styles.benefitSeparator} />

              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <IconSymbol name="person.2.badge.plus" size={24} color="#8B5A8C" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>專業諮詢</Text>
                  <Text style={styles.benefitDescription}>
                    每月與真人心理師進行一對一諮詢
                  </Text>
                </View>
              </View>

              <View style={styles.benefitSeparator} />

              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <IconSymbol name="clock.badge.checkmark" size={24} color="#8B5A8C" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>24/7 支持</Text>
                  <Text style={styles.benefitDescription}>
                    全天候危機干預和緊急心理支持
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Manage Subscription */}
        <View style={styles.manageSection}>
          <TouchableOpacity 
            style={styles.manageButton}
            onPress={handleManageBilling}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.manageGradient}
            >
              <IconSymbol name="gearshape" size={20} color="#FFFFFF" />
              <Text style={styles.manageText}>管理訂閱設置</Text>
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
  billingButton: {
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
  statusSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statusCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statusGradient: {
    padding: 24,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  statusSubDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  plansSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  popularPlan: {
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  currentPlan: {
    shadowColor: '#8B5A8C',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  popularBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  planGradient: {
    padding: 20,
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  planNameCurrent: {
    color: '#8B5A8C',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2C2C2E',
  },
  planPriceCurrent: {
    color: '#8B5A8C',
  },
  planPeriod: {
    fontSize: 16,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  planPeriodCurrent: {
    color: '#B5739E',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#2C2C2E',
    flex: 1,
  },
  featureTextCurrent: {
    color: '#2C2C2E',
    fontWeight: '500',
  },
  planButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  currentPlanButton: {
    opacity: 0.8,
  },
  planButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  currentPlanButtonText: {
    color: '#8B5A8C',
  },
  benefitsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  benefitsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  benefitsGradient: {
    padding: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 18,
  },
  benefitSeparator: {
    height: 1,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    marginVertical: 16,
  },
  manageSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  manageButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  manageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  manageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});