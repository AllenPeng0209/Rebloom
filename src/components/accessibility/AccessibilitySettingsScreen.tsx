import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccessibility, AccessibilityTestIDs } from './AccessibilityProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => {
  const { getFontSize } = useAccessibility();
  
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { fontSize: getFontSize(18) }]}>
        {title}
      </Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

interface SettingRowProps {
  title: string;
  description?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  showChevron?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  testID?: string;
}

const SettingRow: React.FC<SettingRowProps> = ({
  title,
  description,
  value,
  onValueChange,
  onPress,
  showChevron = false,
  icon,
  testID,
}) => {
  const { getFontSize, getTouchTargetSize, settings } = useAccessibility();
  
  const handlePress = async () => {
    if (settings.hapticFeedback) {
      await Haptics.selectionAsync();
    }
    onPress?.();
  };

  const handleSwitchToggle = async (newValue: boolean) => {
    if (settings.hapticFeedback) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onValueChange?.(newValue);
  };

  return (
    <TouchableOpacity
      style={[
        styles.settingRow,
        {
          minHeight: getTouchTargetSize(56),
          backgroundColor: settings.highContrastMode ? '#ffffff' : '#f8f9fa',
          borderWidth: settings.highContrastMode ? 1 : 0,
          borderColor: settings.highContrastMode ? '#000000' : 'transparent',
        },
      ]}
      onPress={onPress ? handlePress : undefined}
      disabled={!onPress}
      accessible
      accessibilityRole={onValueChange ? 'switch' : 'button'}
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={value !== undefined ? { checked: value } : undefined}
      testID={testID}
    >
      {icon && (
        <View style={styles.settingIcon}>
          <Ionicons
            name={icon}
            size={24}
            color={settings.highContrastMode ? '#000000' : '#8B5A8C'}
          />
        </View>
      )}
      
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            {
              fontSize: getFontSize(16),
              color: settings.highContrastMode ? '#000000' : '#333333',
              fontWeight: settings.highContrastMode ? 'bold' : '500',
            },
          ]}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.settingDescription,
              {
                fontSize: getFontSize(14),
                color: settings.highContrastMode ? '#333333' : '#666666',
              },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      
      {onValueChange && (
        <Switch
          value={value}
          onValueChange={handleSwitchToggle}
          trackColor={{
            false: '#e0e0e0',
            true: '#8B5A8C',
          }}
          thumbColor={'#ffffff'}
          accessible={false} // Parent handles accessibility
        />
      )}
      
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={settings.highContrastMode ? '#000000' : '#999999'}
        />
      )}
    </TouchableOpacity>
  );
};

interface AccessibilitySettingsScreenProps {
  onClose?: () => void;
}

export const AccessibilitySettingsScreen: React.FC<AccessibilitySettingsScreenProps> = ({
  onClose,
}) => {
  const { t } = useLanguage();
  const { settings, updateSettings, announceMessage, getFontSize } = useAccessibility();

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
    announceMessage(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  const handleFontSizeChange = () => {
    const sizes: Array<typeof settings.fontSize> = ['small', 'medium', 'large', 'extraLarge'];
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    
    updateSettings({ fontSize: newSize });
    announceMessage(`Font size changed to ${newSize}`);
  };

  const handleReminderFrequencyChange = () => {
    const frequencies: Array<typeof settings.reminderFrequency> = ['low', 'medium', 'high'];
    const currentIndex = frequencies.indexOf(settings.reminderFrequency);
    const nextIndex = (currentIndex + 1) % frequencies.length;
    const newFrequency = frequencies[nextIndex];
    
    updateSettings({ reminderFrequency: newFrequency });
    announceMessage(`Reminder frequency changed to ${newFrequency}`);
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Accessibility Settings',
      'Are you sure you want to reset all accessibility settings to their defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
              screenReaderEnabled: settings.screenReaderEnabled, // Keep system setting
              announceForAccessibility: true,
              highContrastMode: false,
              reduceMotion: settings.reduceMotion, // Keep system setting
              largeText: false,
              fontSize: 'medium' as const,
              largerTouchTargets: false,
              hapticFeedback: true,
              voiceNavigation: false,
              simplifiedInterface: false,
              extendedTimeouts: false,
              reminderFrequency: 'medium' as const,
            };
            updateSettings(defaultSettings);
            announceMessage('Accessibility settings reset to defaults');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: settings.highContrastMode ? '#ffffff' : '#f0f0f0',
        },
      ]}
      testID={AccessibilityTestIDs.accessibilitySettings}
    >
      <StatusBar
        barStyle={settings.highContrastMode ? 'dark-content' : 'light-content'}
        backgroundColor="#8B5A8C"
      />
      
      <LinearGradient
        colors={settings.highContrastMode ? ['#000000', '#333333'] : ['#8B5A8C', '#B5739E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { minHeight: settings.largerTouchTargets ? 56 : 44 },
            ]}
            onPress={onClose}
            accessible
            accessibilityLabel="Close accessibility settings"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text
            style={[
              styles.headerTitle,
              { fontSize: getFontSize(20) },
            ]}
          >
            Accessibility
          </Text>
          
          <TouchableOpacity
            style={[
              styles.headerButton,
              { minHeight: settings.largerTouchTargets ? 56 : 44 },
            ]}
            onPress={resetToDefaults}
            accessible
            accessibilityLabel="Reset accessibility settings"
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        accessible={false}
      >
        {/* Screen Reader Settings */}
        <SettingSection title="Screen Reader">
          <SettingRow
            title="Screen Reader Enabled"
            description="Detected automatically from system settings"
            value={settings.screenReaderEnabled}
            icon="reader"
            testID="screen-reader-setting"
          />
          
          <SettingRow
            title="Voice Announcements"
            description="Announce important updates and changes"
            value={settings.announceForAccessibility}
            onValueChange={(value) => handleSettingChange('announceForAccessibility', value)}
            icon="volume-high"
            testID="announcements-setting"
          />
          
          <SettingRow
            title="Voice Navigation"
            description="Navigate using voice commands"
            value={settings.voiceNavigation}
            onValueChange={(value) => handleSettingChange('voiceNavigation', value)}
            icon="mic"
            testID="voice-nav-setting"
          />
        </SettingSection>

        {/* Visual Settings */}
        <SettingSection title="Visual">
          <SettingRow
            title="High Contrast Mode"
            description="Increase contrast for better visibility"
            value={settings.highContrastMode}
            onValueChange={(value) => handleSettingChange('highContrastMode', value)}
            icon="contrast"
            testID="high-contrast-setting"
          />
          
          <SettingRow
            title="Reduce Motion"
            description={settings.reduceMotion ? 'Detected from system settings' : 'Enable to reduce animations'}
            value={settings.reduceMotion}
            onValueChange={(value) => handleSettingChange('reduceMotion', value)}
            icon="pause"
            testID="reduce-motion-setting"
          />
          
          <SettingRow
            title="Large Text"
            description="Increase text size beyond font setting"
            value={settings.largeText}
            onValueChange={(value) => handleSettingChange('largeText', value)}
            icon="text"
            testID="large-text-setting"
          />
          
          <SettingRow
            title={`Font Size: ${settings.fontSize.charAt(0).toUpperCase() + settings.fontSize.slice(1)}`}
            description="Tap to cycle through font sizes"
            onPress={handleFontSizeChange}
            showChevron
            icon="resize"
            testID="font-size-setting"
          />
        </SettingSection>

        {/* Motor Settings */}
        <SettingSection title="Motor & Touch">
          <SettingRow
            title="Larger Touch Targets"
            description="Make buttons and interactive elements larger"
            value={settings.largerTouchTargets}
            onValueChange={(value) => handleSettingChange('largerTouchTargets', value)}
            icon="finger-print"
            testID="larger-targets-setting"
          />
          
          <SettingRow
            title="Haptic Feedback"
            description="Feel vibrations when interacting"
            value={settings.hapticFeedback}
            onValueChange={(value) => handleSettingChange('hapticFeedback', value)}
            icon="phone-portrait"
            testID="haptic-feedback-setting"
          />
        </SettingSection>

        {/* Cognitive Settings */}
        <SettingSection title="Cognitive Support">
          <SettingRow
            title="Simplified Interface"
            description="Show only essential features and options"
            value={settings.simplifiedInterface}
            onValueChange={(value) => handleSettingChange('simplifiedInterface', value)}
            icon="layers"
            testID="simplified-interface-setting"
          />
          
          <SettingRow
            title="Extended Timeouts"
            description="Give more time for interactions and reading"
            value={settings.extendedTimeouts}
            onValueChange={(value) => handleSettingChange('extendedTimeouts', value)}
            icon="time"
            testID="extended-timeouts-setting"
          />
          
          <SettingRow
            title={`Reminder Frequency: ${settings.reminderFrequency.charAt(0).toUpperCase() + settings.reminderFrequency.slice(1)}`}
            description="How often to show helpful reminders"
            onPress={handleReminderFrequencyChange}
            showChevron
            icon="notifications"
            testID="reminder-frequency-setting"
          />
        </SettingSection>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text
            style={[
              styles.infoTitle,
              {
                fontSize: getFontSize(16),
                color: settings.highContrastMode ? '#000000' : '#666666',
              },
            ]}
          >
            About Accessibility
          </Text>
          <Text
            style={[
              styles.infoText,
              {
                fontSize: getFontSize(14),
                color: settings.highContrastMode ? '#333333' : '#666666',
              },
            ]}
          >
            These settings help make the app more accessible for users with different needs.
            Some settings are automatically detected from your device's system preferences.
          </Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
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
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  settingDescription: {
    color: '#666666',
    lineHeight: 18,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    lineHeight: 20,
  },
});
