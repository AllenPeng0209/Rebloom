import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PermissionGuideProps {
  visible: boolean;
  onClose: () => void;
  onRetry: () => void;
  permissionType: 'microphone';
}

export const PermissionGuide: React.FC<PermissionGuideProps> = ({
  visible,
  onClose,
  onRetry,
  permissionType
}) => {
  const getPermissionInfo = () => {
    switch (permissionType) {
      case 'microphone':
        return {
          icon: 'mic' as const,
          title: '需要麦克风权限',
          description: '为了使用语音消息功能，应用需要访问您的麦克风。',
          steps: Platform.OS === 'ios' 
            ? [
                '1. 点击"去设置"按钮',
                '2. 在设置页面中找到"麦克风"选项',
                '3. 开启麦克风权限',
                '4. 返回应用重试'
              ]
            : [
                '1. 点击"去设置"按钮',
                '2. 在权限设置中找到"麦克风"',
                '3. 开启麦克风权限',
                '4. 返回应用重试'
              ]
        };
      default:
        return {
          icon: 'help-circle' as const,
          title: '需要权限',
          description: '应用需要特定权限才能正常工作。',
          steps: ['请在设置中开启相关权限']
        };
    }
  };

  const info = getPermissionInfo();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#FF9A56', '#FFAD7A']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name={info.icon} size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>{info.title}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>{info.description}</Text>

            {/* Steps */}
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsTitle}>设置步骤：</Text>
              {info.steps.map((step, index) => (
                <Text key={index} style={styles.step}>{step}</Text>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>稍后设置</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={onRetry}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFFFFF', 'rgba(255, 255, 255, 0.9)']}
                  style={styles.retryButtonGradient}
                >
                  <Text style={styles.retryButtonText}>重试</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  step: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    paddingLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    overflow: 'hidden',
  },
  retryButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FF9A56',
    fontSize: 16,
    fontWeight: '600',
  },
});
