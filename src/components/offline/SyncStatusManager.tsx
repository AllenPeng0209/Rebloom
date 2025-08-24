import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

interface SyncItem {
  id: string;
  type: 'message' | 'mood' | 'setting' | 'safety_plan';
  data: any;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  retryCount: number;
  error?: string;
}

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingItems: SyncItem[];
  lastSyncTime?: Date;
  syncProgress: number;
  autoSyncEnabled: boolean;
  syncInterval: number; // minutes
}

interface SyncContextType {
  syncState: SyncState;
  addToSyncQueue: (type: SyncItem['type'], data: any) => Promise<void>;
  syncNow: () => Promise<void>;
  toggleAutoSync: () => void;
  setSyncInterval: (minutes: number) => void;
  clearSyncQueue: () => void;
  retrySyncItem: (itemId: string) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | null>(null);

const DEFAULT_SYNC_STATE: SyncState = {
  isOnline: false,
  isSyncing: false,
  pendingItems: [],
  syncProgress: 0,
  autoSyncEnabled: true,
  syncInterval: 15, // 15 minutes
};

const MAX_RETRY_COUNT = 3;
const SYNC_STORAGE_KEY = '@sync_queue';
const SYNC_SETTINGS_KEY = '@sync_settings';

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [syncState, setSyncState] = useState<SyncState>(DEFAULT_SYNC_STATE);
  const [syncTimer, setSyncTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeSync();
    setupNetworkListener();
    
    return () => {
      if (syncTimer) {
        clearInterval(syncTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (syncState.autoSyncEnabled && syncState.isOnline) {
      setupAutoSync();
    } else {
      if (syncTimer) {
        clearInterval(syncTimer);
        setSyncTimer(null);
      }
    }
  }, [syncState.autoSyncEnabled, syncState.isOnline, syncState.syncInterval]);

  const initializeSync = async () => {
    try {
      // Load pending sync items
      const savedQueue = await AsyncStorage.getItem(SYNC_STORAGE_KEY);
      const savedSettings = await AsyncStorage.getItem(SYNC_SETTINGS_KEY);
      
      const pendingItems: SyncItem[] = savedQueue ? JSON.parse(savedQueue) : [];
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      
      setSyncState(prev => ({
        ...prev,
        pendingItems: pendingItems.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })),
        autoSyncEnabled: settings.autoSyncEnabled !== undefined ? settings.autoSyncEnabled : true,
        syncInterval: settings.syncInterval || 15,
        lastSyncTime: settings.lastSyncTime ? new Date(settings.lastSyncTime) : undefined,
      }));
    } catch (error) {
      console.error('Failed to initialize sync:', error);
    }
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable;
      
      setSyncState(prev => {
        if (prev.isOnline !== isOnline) {
          if (isOnline && prev.pendingItems.length > 0 && prev.autoSyncEnabled) {
            // Sync when coming back online
            setTimeout(() => syncNow(), 1000);
          }
        }
        return { ...prev, isOnline: isOnline || false };
      });
    });

    return unsubscribe;
  };

  const setupAutoSync = () => {
    if (syncTimer) {
      clearInterval(syncTimer);
    }
    
    const timer = setInterval(async () => {
      if (syncState.pendingItems.length > 0 && !syncState.isSyncing) {
        await syncNow();
      }
    }, syncState.syncInterval * 60 * 1000);
    
    setSyncTimer(timer);
  };

  const addToSyncQueue = async (type: SyncItem['type'], data: any) => {
    const newItem: SyncItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
    };

    setSyncState(prev => ({
      ...prev,
      pendingItems: [...prev.pendingItems, newItem],
    }));

    await saveSyncQueue([...syncState.pendingItems, newItem]);

    // Auto-sync if online and enabled
    if (syncState.isOnline && syncState.autoSyncEnabled && !syncState.isSyncing) {
      setTimeout(() => syncNow(), 500); // Small delay to batch operations
    }
  };

  const syncNow = async (): Promise<void> => {
    if (!syncState.isOnline || syncState.isSyncing || syncState.pendingItems.length === 0) {
      return;
    }

    setSyncState(prev => ({ ...prev, isSyncing: true, syncProgress: 0 }));

    try {
      const itemsToSync = syncState.pendingItems.filter(
        item => item.status === 'pending' || item.status === 'error'
      );

      for (let i = 0; i < itemsToSync.length; i++) {
        const item = itemsToSync[i];
        
        setSyncState(prev => ({
          ...prev,
          syncProgress: (i / itemsToSync.length) * 100,
          pendingItems: prev.pendingItems.map(syncItem =>
            syncItem.id === item.id
              ? { ...syncItem, status: 'syncing' }
              : syncItem
          ),
        }));

        try {
          await syncSingleItem(item);
          
          setSyncState(prev => ({
            ...prev,
            pendingItems: prev.pendingItems.map(syncItem =>
              syncItem.id === item.id
                ? { ...syncItem, status: 'synced' }
                : syncItem
            ),
          }));
        } catch (error) {
          const newRetryCount = item.retryCount + 1;
          const shouldRetry = newRetryCount < MAX_RETRY_COUNT;
          
          setSyncState(prev => ({
            ...prev,
            pendingItems: prev.pendingItems.map(syncItem =>
              syncItem.id === item.id
                ? {
                    ...syncItem,
                    status: shouldRetry ? 'error' : 'pending',
                    retryCount: newRetryCount,
                    error: error instanceof Error ? error.message : 'Sync failed',
                  }
                : syncItem
            ),
          }));
        }
      }

      // Remove successfully synced items
      setSyncState(prev => {
        const updatedItems = prev.pendingItems.filter(item => item.status !== 'synced');
        return {
          ...prev,
          pendingItems: updatedItems,
          lastSyncTime: new Date(),
          syncProgress: 100,
        };
      });

      await saveSyncQueue(syncState.pendingItems.filter(item => item.status !== 'synced'));
      await saveSyncSettings();
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncState(prev => ({ ...prev, isSyncing: false, syncProgress: 0 }));
    }
  };

  const syncSingleItem = async (item: SyncItem): Promise<void> => {
    // Mock sync implementation - replace with actual API calls
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate network delay and possible failure
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, 1000 + Math.random() * 2000);
    });
  };

  const toggleAutoSync = async () => {
    const newAutoSyncEnabled = !syncState.autoSyncEnabled;
    setSyncState(prev => ({ ...prev, autoSyncEnabled: newAutoSyncEnabled }));
    await saveSyncSettings();
  };

  const setSyncInterval = async (minutes: number) => {
    setSyncState(prev => ({ ...prev, syncInterval: minutes }));
    await saveSyncSettings();
  };

  const clearSyncQueue = async () => {
    setSyncState(prev => ({ ...prev, pendingItems: [] }));
    await AsyncStorage.removeItem(SYNC_STORAGE_KEY);
  };

  const retrySyncItem = async (itemId: string) => {
    setSyncState(prev => ({
      ...prev,
      pendingItems: prev.pendingItems.map(item =>
        item.id === itemId
          ? { ...item, status: 'pending', error: undefined }
          : item
      ),
    }));

    if (syncState.isOnline && !syncState.isSyncing) {
      await syncNow();
    }
  };

  const saveSyncQueue = async (items: SyncItem[]) => {
    try {
      await AsyncStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  };

  const saveSyncSettings = async () => {
    try {
      const settings = {
        autoSyncEnabled: syncState.autoSyncEnabled,
        syncInterval: syncState.syncInterval,
        lastSyncTime: syncState.lastSyncTime?.toISOString(),
      };
      await AsyncStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save sync settings:', error);
    }
  };

  const contextValue: SyncContextType = {
    syncState,
    addToSyncQueue,
    syncNow,
    toggleAutoSync,
    setSyncInterval,
    clearSyncQueue,
    retrySyncItem,
  };

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

// Sync Status Component
interface SyncStatusProps {
  showDetailedView?: boolean;
  onPress?: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  showDetailedView = false,
  onPress,
}) => {
  const { syncState, syncNow } = useSync();
  const [showModal, setShowModal] = useState(false);

  const handlePress = async () => {
    await Haptics.selectionAsync();
    if (onPress) {
      onPress();
    } else {
      setShowModal(true);
    }
  };

  const getSyncStatusColor = () => {
    if (syncState.isSyncing) return '#2196F3';
    if (!syncState.isOnline) return '#ff9800';
    if (syncState.pendingItems.some(item => item.status === 'error')) return '#ff4757';
    if (syncState.pendingItems.length === 0) return '#4CAF50';
    return '#ff9800';
  };

  const getSyncStatusIcon = () => {
    if (syncState.isSyncing) return 'sync';
    if (!syncState.isOnline) return 'cloud-offline';
    if (syncState.pendingItems.some(item => item.status === 'error')) return 'warning';
    if (syncState.pendingItems.length === 0) return 'checkmark-circle';
    return 'time';
  };

  const getSyncStatusText = () => {
    if (syncState.isSyncing) return `Syncing... ${Math.round(syncState.syncProgress)}%`;
    if (!syncState.isOnline) return 'Offline';
    if (syncState.pendingItems.some(item => item.status === 'error')) return 'Sync errors';
    if (syncState.pendingItems.length === 0) return 'Up to date';
    return `${syncState.pendingItems.length} pending`;
  };

  if (!showDetailedView) {
    return (
      <TouchableOpacity
        style={styles.compactStatus}
        onPress={handlePress}
        accessible
        accessibilityLabel={`Sync status: ${getSyncStatusText()}`}
        accessibilityRole="button"
      >
        <Ionicons
          name={getSyncStatusIcon() as keyof typeof Ionicons.glyphMap}
          size={16}
          color={getSyncStatusColor()}
        />
        <Text style={[styles.compactStatusText, { color: getSyncStatusColor() }]}>
          {getSyncStatusText()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.detailedStatus}
        onPress={handlePress}
        accessible
        accessibilityLabel={`Sync status: ${getSyncStatusText()}`}
        accessibilityRole="button"
      >
        <View style={styles.statusHeader}>
          <Ionicons
            name={getSyncStatusIcon() as keyof typeof Ionicons.glyphMap}
            size={20}
            color={getSyncStatusColor()}
          />
          <Text style={[styles.statusText, { color: getSyncStatusColor() }]}>
            {getSyncStatusText()}
          </Text>
        </View>
        
        {syncState.lastSyncTime && (
          <Text style={styles.lastSyncText}>
            Last sync: {format(syncState.lastSyncTime, 'MMM d, HH:mm')}
          </Text>
        )}
        
        {syncState.isSyncing && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${syncState.syncProgress}%` },
                ]}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>

      <SyncDetailModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

// Detailed Sync Modal
interface SyncDetailModalProps {
  visible: boolean;
  onClose: () => void;
}

const SyncDetailModal: React.FC<SyncDetailModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    syncState,
    syncNow,
    toggleAutoSync,
    clearSyncQueue,
    retrySyncItem,
  } = useSync();

  const handleSyncNow = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await syncNow();
  };

  const handleClearQueue = () => {
    Alert.alert(
      'Clear Sync Queue',
      'This will remove all pending sync items. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearSyncQueue,
        },
      ]
    );
  };

  const renderSyncItem = (item: SyncItem) => {
    const getItemIcon = () => {
      switch (item.type) {
        case 'message': return 'chatbubble';
        case 'mood': return 'heart';
        case 'setting': return 'settings';
        case 'safety_plan': return 'shield-checkmark';
        default: return 'document';
      }
    };

    const getStatusColor = () => {
      switch (item.status) {
        case 'pending': return '#ff9800';
        case 'syncing': return '#2196F3';
        case 'synced': return '#4CAF50';
        case 'error': return '#ff4757';
        default: return '#999';
      }
    };

    return (
      <View key={item.id} style={styles.syncItem}>
        <Ionicons
          name={getItemIcon() as keyof typeof Ionicons.glyphMap}
          size={20}
          color="#8B5A8C"
        />
        
        <View style={styles.syncItemContent}>
          <Text style={styles.syncItemType}>{item.type}</Text>
          <Text style={styles.syncItemTime}>
            {format(item.timestamp, 'MMM d, HH:mm')}
          </Text>
          {item.error && (
            <Text style={styles.syncItemError}>{item.error}</Text>
          )}
        </View>
        
        <View style={styles.syncItemStatus}>
          <Text style={[styles.syncItemStatusText, { color: getStatusColor() }]}>
            {item.status}
          </Text>
          {item.status === 'error' && item.retryCount < MAX_RETRY_COUNT && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => retrySyncItem(item.id)}
            >
              <Ionicons name="refresh" size={16} color="#8B5A8C" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient colors={['#8B5A8C', '#B5739E']} style={styles.modalHeader}>
          <View style={styles.modalHeaderContent}>
            <Text style={styles.modalTitle}>Sync Status</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.modalContent}>
          {/* Sync Controls */}
          <View style={styles.syncControls}>
            <TouchableOpacity
              style={[
                styles.syncButton,
                syncState.isSyncing && styles.syncButtonDisabled,
              ]}
              onPress={handleSyncNow}
              disabled={syncState.isSyncing || !syncState.isOnline}
            >
              {syncState.isSyncing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="sync" size={20} color="#ffffff" />
              )}
              <Text style={styles.syncButtonText}>
                {syncState.isSyncing ? 'Syncing...' : 'Sync Now'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.autoSyncToggle}
              onPress={toggleAutoSync}
            >
              <Text style={styles.autoSyncText}>Auto Sync</Text>
              <Ionicons
                name={syncState.autoSyncEnabled ? 'toggle' : 'toggle-outline'}
                size={24}
                color={syncState.autoSyncEnabled ? '#4CAF50' : '#999'}
              />
            </TouchableOpacity>
          </View>

          {/* Sync Stats */}
          <View style={styles.syncStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{syncState.pendingItems.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {syncState.pendingItems.filter(item => item.status === 'error').length}
              </Text>
              <Text style={styles.statLabel}>Errors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {syncState.lastSyncTime ? format(syncState.lastSyncTime, 'HH:mm') : 'Never'}
              </Text>
              <Text style={styles.statLabel}>Last Sync</Text>
            </View>
          </View>

          {/* Pending Items */}
          {syncState.pendingItems.length > 0 && (
            <View style={styles.pendingSection}>
              <View style={styles.pendingSectionHeader}>
                <Text style={styles.pendingSectionTitle}>Pending Items</Text>
                <TouchableOpacity onPress={handleClearQueue}>
                  <Text style={styles.clearButton}>Clear All</Text>
                </TouchableOpacity>
              </View>
              
              {syncState.pendingItems.map(renderSyncItem)}
            </View>
          )}

          {syncState.pendingItems.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.emptyStateText}>All data is up to date</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  compactStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  detailedStatus: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  syncControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  syncButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5A8C',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  autoSyncToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  autoSyncText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  syncStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5A8C',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  pendingSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  pendingSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pendingSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    fontSize: 14,
    color: '#ff4757',
    fontWeight: '500',
  },
  syncItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  syncItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  syncItemType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textTransform: 'capitalize',
  },
  syncItemTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  syncItemError: {
    fontSize: 12,
    color: '#ff4757',
    marginTop: 2,
  },
  syncItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncItemStatusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  retryButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});
