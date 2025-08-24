import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface OfflineIndicatorProps {
  style?: any;
  showConnectionDetails?: boolean;
  onPress?: () => void;
}

interface ConnectionState {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
  strength?: number;
  details: {
    isConnectionExpensive: boolean;
    ssid?: string;
    bssid?: string;
    strength?: number;
    ipAddress?: string;
    subnet?: string;
  };
}

const { width: screenWidth } = Dimensions.get('window');

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  style,
  showConnectionDetails = false,
  onPress,
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    type: null,
    isInternetReachable: null,
    details: {
      isConnectionExpensive: false,
    },
  });
  const [slideAnim] = useState(new Animated.Value(-60));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      const newConnectionState: ConnectionState = {
        isConnected: state.isConnected || false,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        details: {
          isConnectionExpensive: state.details?.isConnectionExpensive || false,
          ssid: state.details?.ssid,
          bssid: state.details?.bssid,
          strength: state.details?.strength,
          ipAddress: state.details?.ipAddress,
          subnet: state.details?.subnet,
        },
      };

      setConnectionState(newConnectionState);
      
      // Show/hide indicator based on connection status
      if (!newConnectionState.isConnected) {
        showIndicator();
      } else {
        hideIndicator();
      }
    });

    // Initial network state check
    NetInfo.fetch().then(state => {
      const initialConnectionState: ConnectionState = {
        isConnected: state.isConnected || false,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        details: {
          isConnectionExpensive: state.details?.isConnectionExpensive || false,
          ssid: state.details?.ssid,
          bssid: state.details?.bssid,
          strength: state.details?.strength,
          ipAddress: state.details?.ipAddress,
          subnet: state.details?.subnet,
        },
      };
      
      setConnectionState(initialConnectionState);
      
      if (!initialConnectionState.isConnected) {
        showIndicator();
      }
    });

    return unsubscribe;
  }, []);

  const showIndicator = () => {
    setIsVisible(true);
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      // Pulse animation for attention
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ),
    ]).start();
    
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const hideIndicator = () => {
    Animated.timing(slideAnim, {
      toValue: -60,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
    
    pulseAnim.setValue(1);
  };

  const handlePress = async () => {
    await Haptics.selectionAsync();
    onPress?.();
  };

  const getConnectionIcon = () => {
    if (!connectionState.isConnected) {
      return 'cloud-offline';
    }
    
    switch (connectionState.type) {
      case 'wifi':
        return 'wifi';
      case 'cellular':
        return 'cellular';
      case 'ethernet':
        return 'globe';
      default:
        return 'cloud-done';
    }
  };

  const getConnectionText = () => {
    if (!connectionState.isConnected) {
      return 'You\'re offline';
    }
    
    if (connectionState.isInternetReachable === false) {
      return 'No internet access';
    }
    
    return `Connected via ${connectionState.type}`;
  };

  const getConnectionSubtext = () => {
    if (!connectionState.isConnected) {
      return 'Some features may be limited';
    }
    
    if (connectionState.details.isConnectionExpensive) {
      return 'Using cellular data';
    }
    
    if (connectionState.details.ssid) {
      return `Connected to ${connectionState.details.ssid}`;
    }
    
    return 'All features available';
  };

  const getIndicatorColor = () => {
    if (!connectionState.isConnected) {
      return ['#ff4757', '#ff3742'];
    }
    
    if (connectionState.isInternetReachable === false) {
      return ['#ff9800', '#ff8f00'];
    }
    
    return ['#4CAF50', '#45a049'];
  };

  if (!isVisible && connectionState.isConnected) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim },
          ],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.8}
        accessible
        accessibilityLabel={getConnectionText()}
        accessibilityHint={getConnectionSubtext()}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={getIndicatorColor()}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.content}>
            <Ionicons
              name={getConnectionIcon() as keyof typeof Ionicons.glyphMap}
              size={20}
              color="#ffffff"
            />
            
            <View style={styles.textContainer}>
              <Text style={styles.mainText}>
                {getConnectionText()}
              </Text>
              
              {showConnectionDetails && (
                <Text style={styles.subText}>
                  {getConnectionSubtext()}
                </Text>
              )}
            </View>
            
            {onPress && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color="rgba(255, 255, 255, 0.8)"
              />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Hook for using network status throughout the app
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState({
    isConnected: false,
    type: null as string | null,
    isInternetReachable: null as boolean | null,
    isExpensive: false,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected || false,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        isExpensive: state.details?.isConnectionExpensive || false,
      });
    });

    NetInfo.fetch().then(state => {
      setNetworkState({
        isConnected: state.isConnected || false,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        isExpensive: state.details?.isConnectionExpensive || false,
      });
    });

    return unsubscribe;
  }, []);

  return networkState;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  touchable: {
    width: '100%',
  },
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  mainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  subText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
