import { useLanguage } from '@/contexts/LanguageContext'
import { Stack } from 'expo-router'
import React from 'react'

export default function PlayerLayout() {
  const { t } = useLanguage()

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="[trackId]" 
        options={{ 
          headerShown: false,
          title: t('player.title')
        }} 
      />
    </Stack>
  )
}
