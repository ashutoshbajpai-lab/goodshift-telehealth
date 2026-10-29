import React from 'react';
import { Stack } from 'expo-router';

export default function DoctorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    />
  );
}
