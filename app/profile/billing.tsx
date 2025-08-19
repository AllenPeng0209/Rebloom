import { IconSymbol } from '@/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'paypal' | 'apple-pay';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  invoice?: string;
}

export default function BillingScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'transactions' | 'methods' | 'invoices'>('transactions');

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'credit',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true
    },
    {
      id: '2',
      type: 'apple-pay',
      last4: '8888',
      brand: 'Apple Pay',
      expiryMonth: 0,
      expiryYear: 0,
      isDefault: false
    }
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      date: new Date('2024-08-01'),
      amount: 68,
      currency: 'TWD',
      description: 'Rebloom Premium - 月度訂閱',
      status: 'completed',
      paymentMethod: 'Visa •••• 4242',
      invoice: 'INV-2024-08-001'
    },
    {
      id: '2',
      date: new Date('2024-07-01'),
      amount: 68,
      currency: 'TWD',
      description: 'Rebloom Premium - 月度訂閱',
      status: 'completed',
      paymentMethod: 'Visa •••• 4242',
      invoice: 'INV-2024-07-001'
    },
    {
      id: '3',
      date: new Date('2024-06-01'),
      amount: 68,
      currency: 'TWD',
      description: 'Rebloom Premium - 月度訂閱',
      status: 'completed',
      paymentMethod: 'Apple Pay',
      invoice: 'INV-2024-06-001'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9500';
      case 'failed': return '#FF3B30';
      case 'refunded': return '#6B6B6B';
      default: return '#6B6B6B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'pending': return '處理中';
      case 'failed': return '失敗';
      case 'refunded': return '已退款';
      default: return '未知';
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'credit':
      case 'debit':
        return 'creditcard';
      case 'paypal':
        return 'p.circle';
      case 'apple-pay':
        return 'applelogo';
      default:
        return 'creditcard';
    }
  };

  const renderTransaction = (transaction: Transaction) => (
    <View key={transaction.id} style={styles.transactionCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.transactionGradient}
      >
        <View style={styles.transactionHeader}>
          <View style={styles.transactionLeft}>
            <View style={styles.transactionIcon}>
              <IconSymbol name="creditcard" size={20} color="#8B5A8C" />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>
                {transaction.date.toLocaleDateString('zh-TW')} • {transaction.paymentMethod}
              </Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text style={styles.transactionAmount}>
              ${transaction.amount}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(transaction.status)}20` }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(transaction.status) }
              ]}>
                {getStatusText(transaction.status)}
              </Text>
            </View>
          </View>
        </View>
        
        {transaction.invoice && (
          <TouchableOpacity style={styles.invoiceButton}>
            <LinearGradient
              colors={['rgba(139, 90, 140, 0.1)', 'rgba(181, 115, 158, 0.1)']}
              style={styles.invoiceGradient}
            >
              <IconSymbol name="doc.text" size={16} color="#8B5A8C" />
              <Text style={styles.invoiceText}>下載發票</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.methodCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
        style={styles.methodGradient}
      >
        <View style={styles.methodHeader}>
          <View style={styles.methodLeft}>
            <View style={styles.methodIcon}>
              <IconSymbol name={getPaymentIcon(method.type) as any} size={24} color="#8B5A8C" />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodBrand}>
                {method.brand} •••• {method.last4}
              </Text>
              {method.type !== 'apple-pay' && (
                <Text style={styles.methodExpiry}>
                  到期：{method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.methodActions}>
            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>預設</Text>
              </View>
            )}
            <TouchableOpacity style={styles.methodActionButton}>
              <IconSymbol name="ellipsis" size={16} color="#8B5A8C" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderTabButton = (tab: 'transactions' | 'methods' | 'invoices', title: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.tabButtonActive
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <LinearGradient
        colors={activeTab === tab ? 
          ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)'] : 
          ['transparent', 'transparent']
        }
        style={styles.tabGradient}
      >
        <IconSymbol 
          name={icon as any} 
          size={16} 
          color={activeTab === tab ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'} 
        />
        <Text style={[
          styles.tabText,
          activeTab === tab && styles.tabTextActive
        ]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>帳單記錄</Text>
        <TouchableOpacity style={styles.downloadButton}>
          <IconSymbol name="square.and.arrow.down" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('transactions', '交易記錄', 'list.bullet')}
        {renderTabButton('methods', '付款方式', 'creditcard')}
        {renderTabButton('invoices', '發票', 'doc.text')}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Subscription Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.9)', 'rgba(76, 175, 80, 0.8)']}
              style={styles.statusGradient}
            >
              <IconSymbol name="crown.fill" size={28} color="white" />
              <Text style={styles.statusTitle}>Premium 會員</Text>
              <Text style={styles.statusDescription}>
                下次扣款：2024年9月1日 • $68 TWD
              </Text>
              <TouchableOpacity style={styles.manageButton}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
                  style={styles.manageGradient}
                >
                  <Text style={styles.manageText}>管理訂閱</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'transactions' && (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>交易記錄</Text>
            {transactions.map(renderTransaction)}
          </View>
        )}

        {activeTab === 'methods' && (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>付款方式</Text>
            {paymentMethods.map(renderPaymentMethod)}
            
            <TouchableOpacity style={styles.addMethodButton}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.addMethodGradient}
              >
                <IconSymbol name="plus.circle" size={20} color="#FFFFFF" />
                <Text style={styles.addMethodText}>添加付款方式</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'invoices' && (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>發票記錄</Text>
            <View style={styles.invoicesCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.invoicesGradient}
              >
                <IconSymbol name="doc.text" size={48} color="rgba(139, 90, 140, 0.5)" />
                <Text style={styles.invoicesTitle}>發票記錄</Text>
                <Text style={styles.invoicesDescription}>
                  您的所有發票都可以在交易記錄中下載
                </Text>
              </LinearGradient>
            </View>
          </View>
        )}

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
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabTextActive: {
    color: '#FFFFFF',
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
    marginTop: 8,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    textAlign: 'center',
  },
  manageButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  manageGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  manageText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  contentSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  transactionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionGradient: {
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    overflow: 'hidden',
  },
  invoiceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  invoiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5A8C',
  },
  methodCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  methodGradient: {
    padding: 16,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  methodExpiry: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  methodActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 90, 140, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMethodButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  addMethodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  invoicesCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  invoicesGradient: {
    padding: 32,
    alignItems: 'center',
  },
  invoicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginTop: 16,
    marginBottom: 8,
  },
  invoicesDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
  },
});