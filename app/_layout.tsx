import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Slot, useRouter, usePathname } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, typography } from '../theme/tokens';
import { useConsultationStore } from '../store/consultationStore';
import { DevPanelModal } from '../components/DevPanelModal';
import { Toast } from '../components/Toast';
import { Wrench, User, Stethoscope } from 'lucide-react-native';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const store = useConsultationStore();

  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    store.loadPersistedData();
  }, []);

  // Listen to dev red-flag trigger
  useEffect(() => {
    if (store.devRedFlagTriggered) {
      store.clearDevRedFlag();
      router.push('/(patient)/emergency');
    }
  }, [store.devRedFlagTriggered]);

  const handleRoleSwitch = (newRole: 'patient' | 'doctor') => {
    store.setCurrentRole(newRole);
    if (newRole === 'patient') {
      router.replace('/(patient)');
    } else {
      router.replace('/(doctor)');
    }
  };

  const isDoctorRoute = pathname.includes('/(doctor)') || store.currentRole === 'doctor';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />

        {/* Global Testing Bar: Role Switcher & Dev Panel Trigger */}
        <View style={styles.roleSwitcherBar}>
          <TouchableOpacity
            onLongPress={() => setDevPanelOpen(true)}
            delayLongPress={500}
            activeOpacity={0.8}
            style={styles.brandBadge}
            accessibilityLabel="Long press for developer panel"
          >
            <View style={styles.brandDot} />
            <Text style={styles.brandName}>Good Shift</Text>
            <Text style={styles.brandSub}>GLP-1</Text>
          </TouchableOpacity>

          <View style={styles.segmentContainer}>
            <TouchableOpacity
              onPress={() => handleRoleSwitch('patient')}
              accessibilityRole="button"
              accessibilityLabel="Switch to Patient App"
              style={[
                styles.segmentBtn,
                store.currentRole === 'patient' && styles.segmentBtnActive,
              ]}
            >
              <User
                size={14}
                color={store.currentRole === 'patient' ? colors.ink : colors.inkSecondary}
              />
              <Text
                style={[
                  typography.caption,
                  styles.segmentText,
                  store.currentRole === 'patient' && styles.segmentTextActive,
                ]}
              >
                Patient
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRoleSwitch('doctor')}
              accessibilityRole="button"
              accessibilityLabel="Switch to Doctor App"
              style={[
                styles.segmentBtn,
                store.currentRole === 'doctor' && styles.segmentBtnActive,
              ]}
            >
              <Stethoscope
                size={14}
                color={store.currentRole === 'doctor' ? colors.ink : colors.inkSecondary}
              />
              <Text
                style={[
                  typography.caption,
                  styles.segmentText,
                  store.currentRole === 'doctor' && styles.segmentTextActive,
                ]}
              >
                Doctor
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setDevPanelOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open Developer Panel"
            style={styles.devBtn}
          >
            <Wrench size={16} color={colors.ink} />
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={styles.content}>
          <Slot />
        </View>

        {/* Hidden Developer Panel */}
        <DevPanelModal
          visible={devPanelOpen}
          onClose={() => setDevPanelOpen(false)}
        />

        {/* Toast */}
        <Toast
          visible={!!toastMessage}
          message={toastMessage || ''}
          onDismiss={() => setToastMessage(null)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  roleSwitcherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surfaceTint,
    borderBottomWidth: 1,
    borderBottomColor: colors.accentSoft,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentStrong,
    marginRight: 6,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkSecondary,
    marginLeft: 3,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  segmentBtnActive: {
    backgroundColor: colors.accent,
  },
  segmentText: {
    color: colors.inkSecondary,
    marginLeft: 4,
  },
  segmentTextActive: {
    color: colors.ink,
    fontWeight: '700',
  },
  devBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
