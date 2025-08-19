import { useTheme } from '@/contexts/ThemeContext'
import { TherapeuticComponentProps } from '@/types'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native'

interface ButtonProps extends TherapeuticComponentProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'therapeutic' | 'ghost' | 'crisis'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  gradient?: boolean
  hapticFeedback?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = false,
  emotionalState,
  therapeuticMode = false,
  sensitivity = 'medium',
  hapticFeedback = true,
  style,
  testID,
  ...props
}) => {
  const { theme } = useTheme()

  const getButtonColors = () => {
    const baseColors = {
      primary: {
        background: theme.colors.primary,
        text: '#FFFFFF',
        border: theme.colors.primary
      },
      secondary: {
        background: theme.colors.secondary,
        text: '#FFFFFF',
        border: theme.colors.secondary
      },
      therapeutic: {
        background: therapeuticMode ? theme.colors.therapeutic.supportive : theme.colors.primary,
        text: '#FFFFFF',
        border: therapeuticMode ? theme.colors.therapeutic.supportive : theme.colors.primary
      },
      ghost: {
        background: 'transparent',
        text: theme.colors.primary,
        border: theme.colors.primary
      },
      crisis: {
        background: theme.colors.error,
        text: '#FFFFFF',
        border: theme.colors.error
      }
    }

    let colors = baseColors[variant]

    // Adapt colors based on emotional state
    if (emotionalState && therapeuticMode) {
      switch (emotionalState) {
        case 'calm':
          colors = {
            ...colors,
            background: theme.colors.therapeutic.calm,
            text: theme.colors.primary
          }
          break
        case 'anxious':
          colors = {
            ...colors,
            background: theme.colors.therapeutic.gentle,
            text: theme.colors.primary
          }
          break
        case 'sad':
          colors = {
            ...colors,
            background: theme.colors.therapeutic.warm,
            text: theme.colors.primary
          }
          break
        case 'overwhelmed':
          colors = {
            ...colors,
            background: theme.colors.therapeutic.supportive,
            text: '#FFFFFF'
          }
          break
      }
    }

    return colors
  }

  const getSizeStyles = () => {
    const sizeMap = {
      sm: {
        height: 32,
        paddingHorizontal: 12,
        fontSize: theme.typography.sizes.sm,
        borderRadius: theme.borderRadius.sm
      },
      md: {
        height: 44,
        paddingHorizontal: 16,
        fontSize: theme.typography.sizes.md,
        borderRadius: theme.borderRadius.md
      },
      lg: {
        height: 56,
        paddingHorizontal: 24,
        fontSize: theme.typography.sizes.lg,
        borderRadius: theme.borderRadius.lg
      }
    }

    return sizeMap[size]
  }

  const colors = getButtonColors()
  const sizeStyles = getSizeStyles()

  const containerStyle: ViewStyle = {
    height: sizeStyles.height,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    borderRadius: sizeStyles.borderRadius,
    borderWidth: variant === 'ghost' ? 1 : 0,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
    ...style
  }

  const textStyle: TextStyle = {
    color: colors.text,
    fontSize: sizeStyles.fontSize,
    fontWeight: (variant === 'primary' || variant === 'crisis' ? theme.typography.weights.semibold : theme.typography.weights.medium) as any,
    fontFamily: theme.typography.fontFamily,
    marginLeft: icon && iconPosition === 'left' ? theme.spacing.xs : 0,
    marginRight: icon && iconPosition === 'right' ? theme.spacing.xs : 0
  }

  const handlePress = () => {
    if (disabled || loading) return
    
    if (hapticFeedback) {
      // Haptic feedback would be implemented here
      // Expo.Haptics.impactAsync(Expo.Haptics.ImpactFeedbackStyle.Light)
    }
    
    onPress()
  }

  const renderContent = () => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={colors.text} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyle}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </View>
  )

  // Crisis buttons get special treatment with pulsing animation
  if (variant === 'crisis') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        testID={testID}
        style={({ pressed }) => [
          containerStyle,
          {
            backgroundColor: colors.background,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: theme.colors.error,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4
          }
        ]}
        {...props}
      >
        {renderContent()}
      </Pressable>
    )
  }

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        testID={testID}
        style={[containerStyle, { backgroundColor: 'transparent' }]}
        {...props}
      >
        <LinearGradient
          colors={[colors.background, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: sizeStyles.borderRadius
          }}
        />
        {renderContent()}
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
      style={[
        containerStyle,
        {
          backgroundColor: colors.background,
          // Gentle shadow for therapeutic mode
          ...(therapeuticMode && {
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2
          })
        }
      ]}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  )
}

// Specialized button variants for common therapeutic use cases
export const TherapeuticButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="therapeutic" therapeuticMode={true} {...props} />
)

export const CrisisButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="crisis" hapticFeedback={true} {...props} />
)

export const GentleButton: React.FC<ButtonProps> = (props) => (
  <Button 
    variant="ghost" 
    therapeuticMode={true}
    sensitivity="high"
    {...props} 
  />
)