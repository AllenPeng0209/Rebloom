import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface EmergencyHelpButtonProps {
  style?: any;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  accessible?: boolean;
  testID?: string;
}

const EMERGENCY_NUMBERS = {
  US: {
    crisis: '988',
    emergency: '911',
  },
  // Add other countries as needed
};

export const EmergencyHelpButton: React.FC<EmergencyHelpButtonProps> = ({
  style,
  size = 'medium',
  onPress,
  accessible = true,
  testID = 'emergency-help-button',
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60, borderRadius: 30 };
      case 'large':
        return { width: 100, height: 100, borderRadius: 50 };
      default:
        return { width: 80, height: 80, borderRadius: 40 };
    }
  };

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'Emergency Help',
      'Do you need immediate help?',
      [
        {
          text: 'Crisis Hotline',
          onPress: () => Linking.openURL('tel:988'),
        },
        {
          text: 'Emergency Services',
          onPress: () => Linking.openURL('tel:911'),
          style: 'destructive',
        },
        {
          text: 'Resources',
          onPress: () => {/* Navigate to crisis resources */},
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getSizeStyles(),
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
      accessible={accessible}
      accessibilityLabel="Emergency help button"
      accessibilityHint="Tap for immediate crisis support options"
      accessibilityRole="button"
      testID={testID}
    >
      <TouchableOpacity
        style={[styles.button, getSizeStyles()]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ff4757', '#ff3742']}
          style={[styles.gradient, getSizeStyles()]}
        >
          <Ionicons
            name="medical"
            size={size === 'small' ? 24 : size === 'large' ? 36 : 30}
            color="#FFFFFF"
          />
          <Text
            style={[
              styles.text,
              {
                fontSize: size === 'small' ? 8 : size === 'large' ? 12 : 10,
              },
            ]}
          >
            HELP
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
