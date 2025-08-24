import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as FileSystem from 'expo-file-system';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAccessibility } from '../accessibility/AccessibilityProvider';

interface PrivacySettings {
  dataEncryption: boolean;
  biometricAuth: boolean;
  autoLock: boolean;
  autoLockTimeout: number; // minutes
  shareAnalytics: boolean;
  shareUsageData: boolean;
  localDataOnly: boolean;
  deleteAfterInactivity: boolean;
  inactivityDays: number;
  hideInAppSwitcher: boolean;
  requireAuthForCrisis: boolean;
}

interface DataManagementInfo {
  totalDataSize: number;
  messagesCount: number;
  moodEntriesCount: number;
  lastBackupDate?: Date;
  encryptionStatus: 'enabled' | 'disabled' | 'pending';
}

const defaultPrivacySettings: PrivacySettings = {
  dataEncryption: true,
  biometricAuth: false,
  autoLock: true,
  autoLockTimeout: 15,
  shareAnalytics: false,
  shareUsageData: false,
  localDataOnly: true,
  deleteAfterInactivity: false,
  inactivityDays: 90,
  hideInAppSwitcher: false,
  requireAuthForCrisis: false,
};

export const PrivacySettingsScreen: React.FC<{ onClose?: () => void }> = ({
  onClose,
}) => {
  const { t } = useLanguage();
  const { settings: accessibilitySettings } = useAccessibility();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [dataInfo, setDataInfo] = useState<DataManagementInfo>({
    totalDataSize: 0,
    messagesCount: 0,
    moodEntriesCount: 0,
    encryptionStatus: 'enabled',
  });
  const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType[]>([]);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
    checkBiometricAvailability();
    loadDataInfo();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('@privacy_settings');
      if (saved) {
        setPrivacySettings({ ...defaultPrivacySettings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };

  const savePrivacySettings = async (newSettings: PrivacySettings) => {
    try {
      await AsyncStorage.setItem('@privacy_settings', JSON.stringify(newSettings));
      setPrivacySettings(newSettings);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const available = await LocalAuthentication.hasHardwareAsync();
      if (available) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setBiometricType(types);
      }
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
    }
  };

  const loadDataInfo = async () => {
    try {
      // Mock data - replace with actual data calculation
      const mockDataInfo: DataManagementInfo = {
        totalDataSize: 25.4, // MB
        messagesCount: 342,
        moodEntriesCount: 28,
        lastBackupDate: new Date('2024-01-15'),
        encryptionStatus: privacySettings.dataEncryption ? 'enabled' : 'disabled',
      };
      setDataInfo(mockDataInfo);
    } catch (error) {
      console.error('Failed to load data info:', error);
    }
  };

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...privacySettings, [key]: value };
    savePrivacySettings(newSettings);
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity to enable biometric authentication',
          fallbackLabel: 'Use passcode',
        });
        
        if (result.success) {
          handleSettingChange('biometricAuth', true);
        } else {
          Alert.alert('Authentication Failed', 'Biometric authentication was not enabled.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to enable biometric authentication.');
      }
    } else {
      handleSettingChange('biometricAuth', false);
    }
  };

  const handleDataExport = async () => {
    setIsExporting(true);
    try {
      // Mock export process - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Export Complete',
        'Your data has been exported successfully. The file has been saved to your documents folder.',
        [{ text: 'OK', onPress: () => setShowDataExportModal(false) }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataDeletion = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your messages, mood entries, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mock deletion - replace with actual implementation
              await AsyncStorage.multiRemove([
                '@messages',
                '@mood_entries',
                '@user_settings',
              ]);
              Alert.alert('Data Deleted', 'All your data has been successfully deleted.');
              setShowDeleteDataModal(false);
            } catch (error) {
              Alert.alert('Deletion Failed', 'Failed to delete data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getBiometricIcon = () => {
    if (biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'scan';
    }
    if (biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'finger-print';
    }
    return 'shield-checkmark';
  };

  const getBiometricLabel = () => {
    if (biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (biometricType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
    return 'Biometric Authentication';
  };

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingRow: React.FC<{
    title: string;
    description?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
    showChevron?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    rightComponent?: React.ReactNode;
  }> = ({
    title,
    description,
    value,
    onValueChange,
    onPress,
    showChevron,
    icon,
    rightComponent,
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      accessible
      accessibilityRole={onValueChange ? 'switch' : 'button'}
      accessibilityLabel={title}
      accessibilityHint={description}
    >
      {icon && (
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={24} color="#8B5A8C" />
        </View>
      )}
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      
      {rightComponent || (
        <>
          {onValueChange && (
            <Switch
              value={value}
              onValueChange={onValueChange}
              trackColor={{ false: '#e0e0e0', true: '#8B5A8C' }}
              thumbColor="#ffffff"
              accessible={false}
            />
          )}
          
          {showChevron && (
            <Ionicons name="chevron-forward" size={20} color="#999" />
          )}
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5A8C" />
      
      <LinearGradient colors={['#8B5A8C', '#B5739E']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            accessible
            accessibilityLabel="Close privacy settings"
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          
          <View style={styles.headerButton} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Encryption & Authentication */}
        <SettingSection title="Security">
          <SettingRow
            title="Data Encryption"
            description="Encrypt all data stored on this device"
            value={privacySettings.dataEncryption}
            onValueChange={(value) => handleSettingChange('dataEncryption', value)}
            icon="lock-closed"
          />
          
          <SettingRow
            title={getBiometricLabel()}
            description="Use biometrics to unlock the app"
            value={privacySettings.biometricAuth}
            onValueChange={handleBiometricToggle}
            icon={getBiometricIcon() as keyof typeof Ionicons.glyphMap}
          />
          
          <SettingRow
            title="Auto-Lock"
            description={`Lock app after ${privacySettings.autoLockTimeout} minutes of inactivity`}
            value={privacySettings.autoLock}
            onValueChange={(value) => handleSettingChange('autoLock', value)}
            icon="time"
          />
          
          <SettingRow
            title="Hide in App Switcher"
            description="Blur app content when switching apps"
            value={privacySettings.hideInAppSwitcher}
            onValueChange={(value) => handleSettingChange('hideInAppSwitcher', value)}
            icon="eye-off"
          />
        </SettingSection>

        {/* Data Privacy */}
        <SettingSection title="Data Privacy">
          <SettingRow
            title="Local Data Only"
            description="Keep all data on this device only"
            value={privacySettings.localDataOnly}
            onValueChange={(value) => handleSettingChange('localDataOnly', value)}
            icon="phone-portrait"
          />
          
          <SettingRow
            title="Share Analytics"
            description="Help improve the app by sharing anonymous usage analytics"
            value={privacySettings.shareAnalytics}
            onValueChange={(value) => handleSettingChange('shareAnalytics', value)}
            icon="analytics"
          />
          
          <SettingRow
            title="Auto-Delete Inactive Data"
            description={`Delete data after ${privacySettings.inactivityDays} days of inactivity`}
            value={privacySettings.deleteAfterInactivity}
            onValueChange={(value) => handleSettingChange('deleteAfterInactivity', value)}
            icon="trash"
          />
        </SettingSection>

        {/* Crisis Settings */}
        <SettingSection title="Crisis Support">
          <SettingRow
            title="Require Auth for Crisis Support"
            description="Require authentication to access crisis resources"
            value={privacySettings.requireAuthForCrisis}
            onValueChange={(value) => handleSettingChange('requireAuthForCrisis', value)}
            icon="medical"
          />
        </SettingSection>

        {/* Data Management */}
        <SettingSection title="Data Management">
          <View style={styles.dataInfoCard}>
            <View style={styles.dataInfoHeader}>
              <Ionicons name="document-text" size={24} color="#8B5A8C" />
              <Text style={styles.dataInfoTitle}>Your Data</Text>
            </View>
            
            <View style={styles.dataStats}>
              <View style={styles.dataStat}>
                <Text style={styles.dataStatValue}>{dataInfo.totalDataSize} MB</Text>
                <Text style={styles.dataStatLabel}>Total Size</Text>
              </View>
              <View style={styles.dataStat}>
                <Text style={styles.dataStatValue}>{dataInfo.messagesCount}</Text>
                <Text style={styles.dataStatLabel}>Messages</Text>
              </View>
              <View style={styles.dataStat}>
                <Text style={styles.dataStatValue}>{dataInfo.moodEntriesCount}</Text>
                <Text style={styles.dataStatLabel}>Mood Entries</Text>
              </View>
            </View>
            
            <View style={styles.encryptionStatus}>
              <Ionicons
                name={dataInfo.encryptionStatus === 'enabled' ? 'shield-checkmark' : 'shield-outline'}
                size={16}
                color={dataInfo.encryptionStatus === 'enabled' ? '#4CAF50' : '#ff9800'}
              />
              <Text style={[
                styles.encryptionStatusText,
                {
                  color: dataInfo.encryptionStatus === 'enabled' ? '#4CAF50' : '#ff9800'
                }
              ]}>
                Encryption {dataInfo.encryptionStatus}
              </Text>
            </View>
          </View>
          
          <SettingRow
            title="Export Data"
            description="Download all your data as a secure file"
            onPress={() => setShowDataExportModal(true)}
            showChevron
            icon="download"
          />
          
          <SettingRow
            title="Delete All Data"
            description="Permanently delete all stored data"
            onPress={() => setShowDeleteDataModal(true)}
            showChevron
            icon="trash"
          />
        </SettingSection>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Export Modal */}
      <Modal
        visible={showDataExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDataExportModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Export Your Data</Text>
            <TouchableOpacity
              onPress={() => setShowDataExportModal(false)}
              disabled={isExporting}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.exportDescription}>
              This will create an encrypted file containing all your messages, mood entries,
              and settings. The file will be saved to your device's documents folder.
            </Text>
            
            <View style={styles.exportOptions}>
              <Text style={styles.exportOptionsTitle}>What will be included:</Text>
              <View style={styles.exportOption}>
                <Ionicons name="checkmark" size={16} color="#4CAF50" />
                <Text style={styles.exportOptionText}>All chat messages</Text>
              </View>
              <View style={styles.exportOption}>
                <Ionicons name="checkmark" size={16} color="#4CAF50" />
                <Text style={styles.exportOptionText}>Mood tracking data</Text>
              </View>
              <View style={styles.exportOption}>
                <Ionicons name="checkmark" size={16} color="#4CAF50" />
                <Text style={styles.exportOptionText}>App settings</Text>
              </View>
              <View style={styles.exportOption}>
                <Ionicons name="close" size={16} color="#ff4757" />
                <Text style={styles.exportOptionText}>Personal information (not included)</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.exportButton,
                isExporting && styles.exportButtonDisabled,
              ]}
              onPress={handleDataExport}
              disabled={isExporting}
            >
              <Text style={styles.exportButtonText}>
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Delete Data Modal */}
      <Modal
        visible={showDeleteDataModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDeleteDataModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="warning" size={48} color="#ff4757" />
              <Text style={styles.deleteModalTitle}>Delete All Data?</Text>
            </View>
            
            <Text style={styles.deleteModalDescription}>
              This action will permanently delete all your messages, mood entries,
              and settings. This cannot be undone.
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => setShowDeleteDataModal(false)}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteModalConfirmButton}
                onPress={handleDataDeletion}
              >
                <Text style={styles.deleteModalConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 56,
  },
  settingIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  dataInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 1,
  },
  dataInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dataInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  dataStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dataStat: {
    alignItems: 'center',
  },
  dataStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5A8C',
  },
  dataStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  encryptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  encryptionStatusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  exportDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },
  exportOptions: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  exportOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exportOptionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  exportButton: {
    backgroundColor: '#8B5A8C',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 40,
    maxWidth: 320,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  deleteModalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  deleteModalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ff4757',
    alignItems: 'center',
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});
