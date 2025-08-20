import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'

type Props = {
  title: string
  subtitle?: string
  coverUrl?: string
  iconName?: keyof typeof Ionicons.glyphMap
  width?: number | string
  height?: number
  coverHeight?: number
  onPress?: () => void
  style?: ViewStyle
}

export function CourseCard({
  title,
  subtitle,
  coverUrl,
  iconName,
  width = '100%',
  height = 180,
  coverHeight,
  onPress,
  style,
}: Props) {
  const outerStyle: ViewStyle = { width: width as number, minHeight: height }
  return (
    <TouchableOpacity style={[styles.card, outerStyle, style]} onPress={onPress} activeOpacity={0.9}>
      {coverUrl ? (
        <Image 
          source={{ uri: coverUrl }} 
          style={[styles.cover, coverHeight ? { height: coverHeight } : null]} 
          contentFit="cover" 
          placeholder="https://via.placeholder.com/200x120/E0E0E0/666?text=Loading..."
        />
      ) : (
        <View style={styles.iconWrap}>
          {iconName && <Ionicons name={iconName} size={22} color={'#2C2C2E'} />}
        </View>
      )}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {!!subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  cover: { width: '100%', height: 120, borderRadius: 10, marginBottom: 8 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74,144,226,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { color: '#2C2C2E', fontWeight: '700', fontSize: 16 },
  subtitle: { color: '#6B6B6B', fontSize: 12, marginTop: 2 },
})

export default CourseCard


