import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { useConsultationStore } from '../../store/consultationStore';
import { mockDoctors } from '../../mock/doctors';
import { TopBar, DoctorCard } from '../../components';
import { Sparkles, ShieldCheck } from 'lucide-react-native';

export default function DoctorMatchedScreen() {
  const router = useRouter();
  const store = useConsultationStore();

  const doctor = store.activeDoctor || mockDoctors[0];
  const isPriority = store.isPriorityConnect;

  // Animation values
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate doctor card in
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        bounciness: 6,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-transition to in-call screen after 2.8 seconds
    const timer = setTimeout(() => {
      store.setCallState('inCall');
      router.replace('/(patient)/call');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <TopBar title="Doctor Matched" />

      <View style={styles.content}>
        {/* Priority Connect Banner if applicable */}
        {isPriority && (
          <View style={styles.priorityBanner}>
            <Sparkles size={18} color={colors.ink} />
            <Text style={[typography.smallBold, styles.priorityBannerText]}>
              Your scheduled consult • Priority connected
            </Text>
          </View>
        )}

        <Text style={[typography.h1, styles.title]}>
          Connecting you with your doctor
        </Text>
        <Text style={[typography.body, styles.subtitle]}>
          Your verified physician is joining the secure consultation room.
        </Text>

        {/* Animated Doctor Card */}
        <Animated.View
          style={[
            styles.animatedWrapper,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <DoctorCard doctor={doctor} />
        </Animated.View>

        {/* Connecting Spinner & Telemedicine Compliance Notice */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            store.setCallState('inCall');
            router.replace('/(patient)/call');
          }}
          style={styles.connectingBox}
        >
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[typography.bodyBold, styles.connectingText]}>
            Establishing encrypted video feed... (Enter Now)
          </Text>
        </TouchableOpacity>

        <View style={styles.complianceRow}>
          <ShieldCheck size={16} color={colors.success} />
          <Text style={[typography.caption, styles.complianceText]}>
            Compliant with Telemedicine Practice Guidelines, 2020 & DPDP Rules.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    padding: spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    marginBottom: 20,
  },
  priorityBannerText: {
    color: colors.ink,
    marginLeft: 8,
  },
  title: {
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.inkSecondary,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 24,
    lineHeight: 22,
  },
  animatedWrapper: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 28,
  },
  connectingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    marginBottom: 16,
  },
  connectingText: {
    color: colors.ink,
    marginLeft: 10,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  complianceText: {
    color: colors.inkSecondary,
    marginLeft: 6,
  },
});
