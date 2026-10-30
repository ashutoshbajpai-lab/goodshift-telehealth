import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { useConsultationStore } from '../../store/consultationStore';
import {
  TopBar,
  ProgressBar,
  Button,
  Chip,
  BottomSheet,
  InfoBox,
} from '../../components';
import {
  Camera,
  Mic,
  Volume2,
  Wifi,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCw,
  ShieldAlert,
} from 'lucide-react-native';

export default function DeviceCheckScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const store = useConsultationStore();
  const isScheduleMode = params.flow === 'schedule';

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraChecked, setCameraChecked] = useState(false);
  const [micChecked, setMicChecked] = useState(false);
  const [speakerChecked, setSpeakerChecked] = useState(false);
  const [networkChecked, setNetworkChecked] = useState(false);

  const [speakerTested, setSpeakerTested] = useState(false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Red-flag bottom sheet state
  const [redFlagSheetOpen, setRedFlagSheetOpen] = useState(false);
  const [selectedRedFlag, setSelectedRedFlag] = useState<string | null>(null);

  // Selected languages (multi select, preselected from profile)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Hindi']);

  // Animated mic meter
  const micAnim = useRef(new Animated.Value(0.4)).current;

  // Camera permission simulated denied override from dev panel
  const isPermissionDenied = store.devSimulatePermissionDenied || (!permission?.granted && permission?.canAskAgain === false);

  useEffect(() => {
    // Run mic level pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(micAnim, { toValue: 0.9, duration: 400, useNativeDriver: false }),
        Animated.timing(micAnim, { toValue: 0.3, duration: 300, useNativeDriver: false }),
        Animated.timing(micAnim, { toValue: 0.75, duration: 350, useNativeDriver: false }),
        Animated.timing(micAnim, { toValue: 0.2, duration: 250, useNativeDriver: false }),
      ])
    ).start();

    // Auto-verify camera & mic permissions
    if (permission?.granted && !store.devSimulatePermissionDenied) {
      setCameraChecked(true);
      setMicChecked(true);
    } else {
      requestPermission().then((res) => {
        if (res.granted && !store.devSimulatePermissionDenied) {
          setCameraChecked(true);
          setMicChecked(true);
        }
      });
    }

    // Auto-check network
    const netTimer = setTimeout(() => {
      setNetworkChecked(true);
    }, 1200);

    return () => clearTimeout(netTimer);
  }, [permission?.granted, store.devSimulatePermissionDenied]);

  const handleTestSpeaker = () => {
    setIsPlayingSound(true);
    setTimeout(() => {
      setIsPlayingSound(false);
      setSpeakerTested(true);
    }, 1500);
  };

  const handleConfirmSpeaker = (heard: boolean) => {
    if (heard) {
      setSpeakerChecked(true);
    } else {
      setSpeakerChecked(false);
      setSpeakerTested(false);
    }
  };

  // Determine if all checks passed
  const isNetworkBlocking = store.networkQuality === 'offline';
  const allChecksPassed =
    cameraChecked &&
    micChecked &&
    speakerChecked &&
    networkChecked &&
    !isNetworkBlocking &&
    !isPermissionDenied;

  const handleLiveNowPress = () => {
    // Open red-flag safety check before entering consent/queue
    setRedFlagSheetOpen(true);
  };

  const handleSchedulePress = () => {
    // Direct to consent with flow='schedule'
    router.push({
      pathname: '/(patient)/consent',
      params: { flow: 'schedule' },
    });
  };

  const handleRedFlagSubmit = () => {
    setRedFlagSheetOpen(false);
    if (!selectedRedFlag || selectedRedFlag === 'none') {
      // Safe to proceed to Screen 3 (Consent)
      router.push({
        pathname: '/(patient)/consent',
        params: { flow: 'live' },
      });
    } else {
      // Red flag symptom detected -> Emergency Screen
      router.push('/(patient)/emergency');
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const getNetworkStatusContent = () => {
    switch (store.networkQuality) {
      case 'good':
        return {
          title: 'Good connection',
          desc: 'High-definition video & clear audio ready',
          color: colors.success,
          icon: <CheckCircle2 size={18} color={colors.success} />,
        };
      case 'fair':
        return {
          title: 'Fair connection',
          desc: 'Video may be unstable at times',
          color: colors.accentSoft,
          icon: <AlertTriangle size={18} color={colors.ink} />,
        };
      case 'weak':
        return {
          title: 'Weak connection',
          desc: 'Audio mode is recommended for stability',
          color: colors.accent,
          icon: <AlertTriangle size={18} color={colors.accentStrong} />,
        };
      case 'offline':
      default:
        return {
          title: 'No connection',
          desc: 'Cannot continue. Please connect to Wi-Fi or mobile data.',
          color: colors.accentStrong,
          icon: <XCircle size={18} color={colors.accentStrong} />,
        };
    }
  };

  const netInfo = getNetworkStatusContent();

  return (
    <View style={styles.container}>
      <TopBar title="Device & Network Check" onBack={() => router.back()} />
      <ProgressBar currentStep={1} totalSteps={4} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permission Explanation */}
        <InfoBox
          message="We need camera and microphone access so your physician can examine and hear you clearly during your GLP-1 review."
          style={styles.infoBox}
        />

        {/* Real Camera Preview Box */}
        <View style={styles.previewContainer}>
          {permission?.granted && !store.devSimulatePermissionDenied ? (
            <CameraView
              style={styles.camera}
              facing={store.facingMode}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraLiveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Self Camera Preview</Text>
                </View>
                <TouchableOpacity
                  onPress={() => store.flipCamera()}
                  style={styles.flipBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Flip camera"
                >
                  <RotateCw size={18} color={colors.ink} />
                </TouchableOpacity>
              </View>
            </CameraView>
          ) : (
            <View style={styles.cameraFallback}>
              <Camera size={36} color={colors.inkSecondary} />
              <Text style={[typography.bodyBold, styles.fallbackTitle]}>
                Camera Access Needed
              </Text>
              <Text style={[typography.small, styles.fallbackDesc]}>
                {store.devSimulatePermissionDenied
                  ? 'Permission simulation is currently denied in Dev Panel.'
                  : 'Please allow camera permission in device settings.'}
              </Text>
              <Button
                title="Grant Permission"
                variant="secondary"
                size="small"
                onPress={() => {
                  store.setDevSimulatePermissionDenied(false);
                  requestPermission();
                }}
                style={styles.permissionBtn}
              />
            </View>
          )}

          {/* Microphone Live Level Visualizer */}
          <View style={styles.micLevelBar}>
            <Mic size={16} color={colors.ink} style={styles.micIcon} />
            <Text style={[typography.caption, styles.micLabel]}>Mic Input:</Text>
            <View style={styles.meterTrack}>
              <Animated.View
                style={[
                  styles.meterFill,
                  {
                    width: micAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['10%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Verification Checklist */}
        <View style={styles.checklistCard}>
          <Text style={[typography.h2, styles.sectionTitle]}>System Readiness</Text>

          {/* Camera Row */}
          <View style={styles.checkRow}>
            <View style={styles.checkLeft}>
              <Camera size={20} color={colors.ink} />
              <Text style={[typography.bodyBold, styles.checkLabel]}>Camera</Text>
            </View>
            {cameraChecked && !isPermissionDenied ? (
              <View style={styles.tickRow}>
                <CheckCircle2 size={20} color={colors.success} />
                <Text style={[typography.smallBold, styles.tickText]}>Working</Text>
              </View>
            ) : (
              <View style={styles.tickRow}>
                <XCircle size={20} color={colors.accentStrong} />
                <Text style={[typography.smallBold, styles.failText]}>Denied</Text>
              </View>
            )}
          </View>

          {/* Mic Row */}
          <View style={styles.checkRow}>
            <View style={styles.checkLeft}>
              <Mic size={20} color={colors.ink} />
              <Text style={[typography.bodyBold, styles.checkLabel]}>Microphone</Text>
            </View>
            {micChecked && !isPermissionDenied ? (
              <View style={styles.tickRow}>
                <CheckCircle2 size={20} color={colors.success} />
                <Text style={[typography.smallBold, styles.tickText]}>Detecting Audio</Text>
              </View>
            ) : (
              <View style={styles.tickRow}>
                <XCircle size={20} color={colors.accentStrong} />
                <Text style={[typography.smallBold, styles.failText]}>Unavailable</Text>
              </View>
            )}
          </View>

          {/* Speaker Row */}
          <View style={styles.checkRow}>
            <View style={styles.checkLeft}>
              <Volume2 size={20} color={colors.ink} />
              <Text style={[typography.bodyBold, styles.checkLabel]}>Speaker</Text>
            </View>
            {speakerChecked ? (
              <View style={styles.tickRow}>
                <CheckCircle2 size={20} color={colors.success} />
                <Text style={[typography.smallBold, styles.tickText]}>Verified</Text>
              </View>
            ) : !speakerTested ? (
              <Button
                title={isPlayingSound ? 'Playing...' : 'Play Test Tone'}
                size="small"
                variant="surface"
                icon={<Play size={14} color={colors.ink} />}
                onPress={handleTestSpeaker}
                disabled={isPlayingSound}
              />
            ) : (
              <View style={styles.speakerConfirmRow}>
                <Text style={[typography.caption, styles.hearPrompt]}>Did you hear it?</Text>
                <TouchableOpacity
                  onPress={() => handleConfirmSpeaker(true)}
                  style={styles.speakerChoiceBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="Yes, I heard the test tone"
                >
                  <Text style={styles.speakerChoiceYes}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleConfirmSpeaker(false)}
                  style={styles.speakerChoiceBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="No, I did not hear the test tone"
                >
                  <Text style={styles.speakerChoiceNo}>No</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Network Row */}
          <View style={[styles.checkRow, { borderBottomWidth: 0 }]}>
            <View style={styles.checkLeft}>
              <Wifi size={20} color={colors.ink} />
              <View>
                <Text style={[typography.bodyBold, styles.checkLabel]}>Network</Text>
                <Text style={[typography.caption, { color: colors.inkSecondary }]}>
                  {netInfo.desc}
                </Text>
              </View>
            </View>
            <View style={styles.tickRow}>
              {netInfo.icon}
              <Text style={[typography.smallBold, { color: netInfo.color, marginLeft: 6 }]}>
                {netInfo.title}
              </Text>
            </View>
          </View>
        </View>

        {/* Language Selection Chips */}
        <View style={styles.languageSection}>
          <Text style={[typography.h2, styles.sectionTitle]}>Consultation Language</Text>
          <Text style={[typography.small, styles.languageDesc]}>
            Matches you with physicians fluent in your preferred language:
          </Text>
          <View style={styles.languageRow}>
            {['English', 'Hindi', 'Bengali', 'Marathi'].map((lang) => (
              <Chip
                key={lang}
                label={lang}
                selected={selectedLanguages.includes(lang)}
                onPress={() => toggleLanguage(lang)}
              />
            ))}
          </View>
        </View>

        {/* Failed Check Helper if needed */}
        {(!cameraChecked || isPermissionDenied || isNetworkBlocking) && (
          <View style={styles.errorNoticeBox}>
            <AlertTriangle size={18} color={colors.accentStrong} />
            <Text style={[typography.small, styles.errorNoticeText]}>
              {isNetworkBlocking
                ? 'Offline. Please reconnect to mobile data or Wi-Fi to proceed.'
                : 'Camera or Mic is blocked. Please enable permissions in your device settings.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {isScheduleMode ? (
            <>
              <Button
                title="Proceed to Schedule"
                onPress={handleSchedulePress}
                disabled={!allChecksPassed}
                variant="primary"
                size="large"
                style={styles.footerBtn}
              />
              <Button
                title="Switch to Live now"
                onPress={handleLiveNowPress}
                disabled={!allChecksPassed}
                variant="secondary"
                size="large"
                style={styles.footerBtn}
              />
            </>
          ) : (
            <>
              <Button
                title="Live now (Wait ~6m)"
                onPress={handleLiveNowPress}
                disabled={!allChecksPassed}
                variant="primary"
                size="large"
                style={styles.footerBtn}
              />
              <Button
                title="Schedule Slot"
                onPress={handleSchedulePress}
                disabled={!allChecksPassed}
                variant="secondary"
                size="large"
                style={styles.footerBtn}
              />
            </>
          )}
        </View>
      </View>

      {/* Red-Flag Safety Sheet */}
      <BottomSheet
        visible={redFlagSheetOpen}
        onClose={() => setRedFlagSheetOpen(false)}
        title="Emergency Safety Check"
        subtitle="Do you have any of these severe symptoms right now?"
      >
        <View style={styles.redFlagList}>
          {[
            { id: 'chest_pain', label: 'Chest pain, tightness or pressure' },
            { id: 'fainting', label: 'Fainting, collapse or severe dizziness' },
            { id: 'pregnancy', label: 'Suspected or confirmed pregnancy' },
            { id: 'vomiting', label: 'Severe or repeated vomiting (unable to keep fluids)' },
            { id: 'none', label: 'None of these — I am safe for video consult' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => setSelectedRedFlag(item.id)}
              style={[
                styles.redFlagRow,
                selectedRedFlag === item.id && styles.redFlagRowSelected,
                item.id === 'none' && styles.noneRow,
              ]}
            >
              <View
                style={[
                  styles.radioDot,
                  selectedRedFlag === item.id && styles.radioDotSelected,
                ]}
              >
                {selectedRedFlag === item.id && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  typography.bodyBold,
                  styles.redFlagLabel,
                  item.id === 'none' && styles.noneLabel,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          <Button
            title="Confirm & Proceed"
            onPress={handleRedFlagSubmit}
            disabled={!selectedRedFlag}
            variant="primary"
            size="large"
            style={styles.redFlagConfirmBtn}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.base,
    paddingBottom: 120,
  },
  infoBox: {
    marginBottom: 16,
  },
  previewContainer: {
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  camera: {
    width: '100%',
    height: 220,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFill,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cameraLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 71, 79, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.chip,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  flipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFallback: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.surfaceTint,
  },
  fallbackTitle: {
    color: colors.ink,
    marginTop: 8,
  },
  fallbackDesc: {
    color: colors.inkSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  permissionBtn: {
    marginTop: 12,
  },
  micLevelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  micIcon: {
    marginRight: 6,
  },
  micLabel: {
    color: colors.ink,
    marginRight: 10,
  },
  meterTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.line,
    borderRadius: 4,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  checklistCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.ink,
    marginBottom: 12,
  },
  checkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  checkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkLabel: {
    color: colors.ink,
    marginLeft: 10,
  },
  tickRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickText: {
    color: colors.success,
    marginLeft: 6,
  },
  failText: {
    color: colors.accentStrong,
    marginLeft: 6,
  },
  speakerConfirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hearPrompt: {
    color: colors.inkSecondary,
    marginRight: 8,
  },
  speakerChoiceBtn: {
    paddingHorizontal: 14,
    minWidth: 48,
    minHeight: 44,
    borderRadius: radius.chip,
    backgroundColor: colors.surfaceTint,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerChoiceYes: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 12,
  },
  speakerChoiceNo: {
    color: colors.accentStrong,
    fontWeight: '700',
    fontSize: 12,
  },
  languageSection: {
    marginBottom: 20,
  },
  languageDesc: {
    color: colors.inkSecondary,
    marginBottom: 10,
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  errorNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    padding: 12,
    borderRadius: radius.card,
    marginBottom: 16,
  },
  errorNoticeText: {
    color: colors.accentStrong,
    marginLeft: 10,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.base,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  redFlagList: {
    paddingBottom: 24,
  },
  redFlagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginBottom: 10,
    backgroundColor: colors.bg,
  },
  redFlagRowSelected: {
    borderColor: colors.accentStrong,
    backgroundColor: colors.surfaceTint,
  },
  noneRow: {
    borderColor: colors.accentSoft,
    backgroundColor: colors.surfaceTint,
    marginTop: 6,
  },
  radioDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.inkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioDotSelected: {
    borderColor: colors.accentStrong,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accentStrong,
  },
  redFlagLabel: {
    color: colors.ink,
    flex: 1,
  },
  noneLabel: {
    color: colors.ink,
  },
  redFlagConfirmBtn: {
    marginTop: 16,
  },
});
