import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Slot, useRouter, usePathname } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, typography } from '../theme/tokens';
import { useConsultationStore } from '../store/consultationStore';
import { DevPanelModal } from '../components/DevPanelModal';
import { Toast } from '../components/Toast';
import { Wrench, User, Stethoscope, Smartphone, Maximize2 } from 'lucide-react-native';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const store = useConsultationStore();
  const { width, height } = useWindowDimensions();

  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [useDeviceFrame, setUseDeviceFrame] = useState(true);

  const isDesktop = Platform.OS === 'web' && width > 600;

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
                Patient (Mobile)
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
                Doctor (Tablet)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRight}>
            {isDesktop && (
              <TouchableOpacity
                onPress={() => setUseDeviceFrame(!useDeviceFrame)}
                accessibilityRole="button"
                accessibilityLabel="Toggle Device Frame"
                style={styles.frameToggleBtn}
              >
                {useDeviceFrame ? (
                  <Smartphone size={15} color={colors.ink} />
                ) : (
                  <Maximize2 size={15} color={colors.ink} />
                )}
                <Text style={styles.frameToggleText}>
                  {useDeviceFrame ? 'Frame: ON' : 'Fullscreen'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setDevPanelOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Open Developer Panel"
              style={styles.devBtn}
            >
              <Wrench size={16} color={colors.ink} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Area: Centered Mobile / Tablet Frame or Edge-to-Edge Native */}
        {isDesktop && useDeviceFrame ? (
          <View style={styles.desktopCanvas}>
            {store.currentRole === 'patient' ? (
              <View
                style={[
                  styles.phoneShell,
                  { height: Math.min(840, height - 76) },
                ]}
              >
                {/* Dynamic Island / Selfie Punchhole */}
                <View style={styles.phoneIsland}>
                  <View style={styles.islandCamera} />
                </View>
                <View style={styles.phoneScreen}>
                  <Slot />
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.tabletShell,
                  {
                    width: Math.min(1100, width - 40),
                    height: Math.min(720, height - 76),
                  },
                ]}
              >
                <View style={styles.tabletScreen}>
                  <Slot />
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.content}>
            <Slot />
          </View>
        )}

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
    zIndex: 100,
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
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  frameToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.bg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
  },
  frameToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
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
  desktopCanvas: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  phoneShell: {
    width: 412,
    maxWidth: '100%',
    backgroundColor: colors.bg,
    borderRadius: 44,
    borderWidth: 10,
    borderColor: '#1E293B',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.35,
    shadowRadius: 35,
    elevation: 25,
  },
  phoneIsland: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 110,
    height: 24,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  islandCamera: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  tabletShell: {
    backgroundColor: colors.bg,
    borderRadius: 32,
    borderWidth: 10,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.35,
    shadowRadius: 35,
    elevation: 25,
  },
  tabletScreen: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
});
