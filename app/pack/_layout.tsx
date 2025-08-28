import { useLanguage } from '@/contexts/LanguageContext'
import { Stack } from 'expo-router'
import React from 'react'

export default function PackLayout() {
  const { t } = useLanguage()

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="[id]" 
        options={{ 
          headerShown: false,
          title: t('explore.packDetails')
        }} 
      />
    </Stack>
  )
}
