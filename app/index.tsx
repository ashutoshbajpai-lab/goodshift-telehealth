import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useConsultationStore } from '../store/consultationStore';
import { colors } from '../theme/tokens';

export default function Index() {
  const router = useRouter();
  const currentRole = useConsultationStore((s) => s.currentRole);

  useEffect(() => {
    if (currentRole === 'doctor') {
      router.replace('/(doctor)');
    } else {
      router.replace('/(patient)');
    }
  }, [currentRole]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}
