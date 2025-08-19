import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 隱藏所有子頁面的標題欄
      }}
    >
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="ai-settings" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="crisis-resources" />
      <Stack.Screen name="help" />
      <Stack.Screen name="contact-support" />
      <Stack.Screen name="about" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="therapeutic-settings" />
      <Stack.Screen name="billing" />
      <Stack.Screen name="language-settings" />
    </Stack>
  );
}
