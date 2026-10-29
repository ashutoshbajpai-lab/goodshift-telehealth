import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { useConsultationStore } from '../../store/consultationStore';
import {
  TopBar,
  ProgressBar,
  Button,
  Card,
  Toggle,
  Toast,
  BottomSheet,
} from '../../components';
import {
  Clock,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  Calendar,
  LogOut,
  HelpCircle,
  Quote,
  ShieldCheck,
  Hourglass,
  ArrowRight,
  Activity,
} from 'lucide-react-native';

const CAROUSEL_SLIDES = [
  {
    type: 'brand',
    title: 'Good Shift Precision Care',
    tagline: 'Doctor-guided medical weight management calibrated to your biology.',
    icon: <Sparkles size={28} color={colors.accent} />,
    bg: colors.surfaceTint,
  },
  {
    type: 'tip',
    title: 'Hydration Prevents Nausea',
    tagline: 'Sip 2.5 to 3.0 litres of water daily. Most GLP-1 GI symptoms resolve with steady hydration.',
    icon: <Clock size={28} color={colors.accent} />,
    bg: colors.bg,
  },
  {
    type: 'story',
    title: 'Patient Journey: Rahul M.',
    tagline: 'Lost 11.4 kg over 16 weeks on Semaglutide while normalizing his HbA1c from 6.6% to 5.6%.',
    icon: <Quote size={28} color={colors.accent} />,
    bg: colors.surfaceTint,
  },
  {
    type: 'faq',
    title: 'What will your doctor review today?',
    tagline: 'Your 12-week weight trajectory, tolerance to 0.5 mg dose, hydration logs, and next titration step.',
    icon: <HelpCircle size={28} color={colors.accent} />,
    bg: colors.bg,
  },
];

const REALTIME_COMMENTS = [
  {
    title: 'Matching Doctor',
    comment: 'Matching with an on-duty Good Shift physician (Hindi & English)...',
    pct: 28,
  },
  {
    title: 'Syncing Vitals',
    comment: 'Syncing your 12-week weight trajectory, dose logs and meal entries...',
    pct: 46,
  },
  {
    title: 'DPDP Security',
    comment: 'Encrypting your shared medical parameters with AES-256...',
    pct: 64,
  },
  {
    title: 'Symptom Triage',
    comment: 'Doctor reviewing reported nausea (2x) and low hydration status...',
    pct: 82,
  },
  {
    title: 'Video Calibration',
    comment: 'Calibrating high-definition audio and video bandwidth...',
    pct: 95,
  },
  {
    title: 'Ready to Connect',
    comment: "You're next in line! Dr. Ananya Sen is ready for your visit...",
    pct: 99,
  },
];

export default function QueueScreen() {
  const router = useRouter();
  const store = useConsultationStore();

  const [activeSlide, setActiveSlide] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [leaveSheetOpen, setLeaveSheetOpen] = useState(false);

  // Realtime comments cycle index
  const [commentIndex, setCommentIndex] = useState(0);

  // Animated spinner rotation
  const spinValue = useRef(new Animated.Value(0)).current;

  // Comment fade animation
  const commentFade = useRef(new Animated.Value(1)).current;

  // Pulse animation for inner ring
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Run infinite smooth spinner rotation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 0.96, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Cycle realtime comments every 2.6 seconds with fade animation
  useEffect(() => {
    const commentInterval = setInterval(() => {
      Animated.timing(commentFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCommentIndex((prev) => (prev + 1) % REALTIME_COMMENTS.length);
        Animated.timing(commentFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 2800);

    return () => clearInterval(commentInterval);
  }, []);

  // Monitor transition to 'matched' or 'inCall'
  useEffect(() => {
    if (store.callState === 'inCall') {
      router.replace('/(patient)/call');
    } else if (store.callState === 'matched' || store.callState === 'connecting') {
      router.replace('/(patient)/matched');
    }
  }, [store.callState]);

  // Carousel auto-advance every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleRecording = (val: boolean) => {
    store.setIsRecordingOn(val, 'patient');
    if (!val) {
      setToastMessage("Recording is off. Your summary will come from the doctor's notes.");
    } else {
      setToastMessage('Recording is on. An automated transcript summary will be generated.');
    }
  };

  const handleSimulateUpload = () => {
    const mockFiles = [
      { title: 'Recent Blood Panel (Thyroid & Lipids).pdf', type: 'lab' as const },
      { title: 'Morning Breakfast Protein Bowl.jpg', type: 'photo' as const },
      { title: 'Smart Scale Body Composition Export.pdf', type: 'lab' as const },
    ];
    const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    store.addUploadedDoc({
      title: picked.title,
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&q=80',
      type: picked.type,
    });
    setToastMessage(`Uploaded "${picked.title}" for your doctor.`);
  };

  const handleConfirmLeaveQueue = () => {
    setLeaveSheetOpen(false);
    store.resetAllState();
    router.replace('/(patient)');
  };

  const currentSlide = CAROUSEL_SLIDES[activeSlide];
  const activeComment = REALTIME_COMMENTS[commentIndex];

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Circular progress math (radius = 58, circ = ~364.4)
  const radiusVal = 58;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radiusVal;
  const progressPercent = activeComment.pct;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <View style={styles.container}>
      <TopBar
        title="Waiting Room"
        onBack={() => setLeaveSheetOpen(true)}
      />
      <ProgressBar currentStep={4} totalSteps={4} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Realtime Progressive Circular Spinner Card (Hybrid Progress Indicator) */}
        <Card variant="tint" style={styles.spinnerCard}>
          {/* Header live badge */}
          <View style={styles.liveTagRow}>
            <View style={styles.pulseDot} />
            <Text style={[typography.caption, styles.liveTagText]}>
              REAL-TIME QUEUE ACTIVE
            </Text>
          </View>

          {/* Center Stage: Rotating Circular Progress Ring */}
          <View style={styles.circleStage}>
            <Animated.View
              style={[
                styles.spinnerRotator,
                { transform: [{ rotate: spin }] },
              ]}
            >
              <Svg width={148} height={148}>
                <Defs>
                  <LinearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={colors.accentSoft} />
                    <Stop offset="100%" stopColor={colors.accent} />
                  </LinearGradient>
                </Defs>

                {/* Background Track */}
                <Circle
                  cx="74"
                  cy="74"
                  r={radiusVal}
                  stroke={colors.line}
                  strokeWidth={strokeWidth}
                  fill="none"
                />

                {/* Animated Progress Ring */}
                <Circle
                  cx="74"
                  cy="74"
                  r={radiusVal}
                  stroke="url(#accentGrad)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  transform="rotate(-90 74 74)"
                />
              </Svg>
            </Animated.View>

            {/* Inner Content Inside the Circle */}
            <Animated.View
              style={[
                styles.circleCenterContent,
                { transform: [{ scale: pulseScale }] },
              ]}
            >
              <Text style={styles.circleNumber}>
                #{store.queuePosition}
              </Text>
              <Text style={styles.circleLabel}>
                {progressPercent}% Ready
              </Text>
            </Animated.View>
          </View>

          {/* Realtime Changing Text Comments Strip */}
          <View style={styles.commentStrip}>
            <View style={styles.commentHeaderRow}>
              <Activity size={14} color={colors.accent} />
              <Text style={styles.commentStepTag}>
                {activeComment.title.toUpperCase()}
              </Text>
            </View>

            <Animated.Text
              style={[
                typography.bodyBold,
                styles.commentText,
                { opacity: commentFade },
              ]}
            >
              {activeComment.comment}
            </Animated.Text>
          </View>

          {/* Estimated Wait Strip */}
          <View style={styles.waitDurationRow}>
            <Clock size={15} color={colors.ink} />
            <Text style={[typography.small, styles.waitDurationText]}>
              Estimated wait: ~{Math.max(1, Math.ceil(store.queueWaitSeconds / 60))} minute{Math.ceil(store.queueWaitSeconds / 60) > 1 ? 's' : ''} • Priority queue moving
            </Text>
          </View>

          {/* Quick Connect Trigger */}
          <Button
            title="Connect With Doctor Now"
            onPress={() => {
              store.setCallState('matched');
              router.replace('/(patient)/matched');
            }}
            variant="primary"
            size="normal"
            icon={<ArrowRight size={16} color={colors.ink} />}
            iconPosition="right"
            style={styles.connectNowBtn}
          />
        </Card>

        {/* Long Wait Fallback Offer */}
        {store.isLongWaitTriggered && (
          <Card style={styles.longWaitCard}>
            <View style={styles.longWaitHeader}>
              <AlertCircle size={20} color={colors.accentStrong} />
              <Text style={[typography.h2, styles.longWaitTitle]}>
                Long wait right now. Book a slot instead?
              </Text>
            </View>
            <Text style={[typography.small, styles.longWaitDesc]}>
              Next free priority slot: <Text style={typography.smallBold}>Today, 6:30 pm</Text>
            </Text>
            <View style={styles.longWaitButtons}>
              <Button
                title="Book this slot"
                onPress={() => router.push('/(patient)/schedule')}
                variant="primary"
                size="small"
                style={styles.longWaitBtn}
              />
              <Button
                title="Keep waiting"
                onPress={() => {}}
                variant="secondary"
                size="small"
                style={styles.longWaitBtn}
              />
            </View>
          </Card>
        )}

        {/* Brand Content Carousel (Auto-advancing every 8s + swipeable) */}
        <View style={styles.carouselContainer}>
          <Card
            style={[styles.carouselSlide, { backgroundColor: currentSlide.bg }]}
          >
            <View style={styles.slideHeader}>
              <View style={styles.slideIcon}>{currentSlide.icon}</View>
              <View style={styles.dotsRow}>
                {CAROUSEL_SLIDES.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      activeSlide === i ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            </View>

            <Text style={[typography.h2, styles.slideTitle]}>
              {currentSlide.title}
            </Text>
            <Text style={[typography.body, styles.slideTagline]}>
              {currentSlide.tagline}
            </Text>
          </Card>
        </View>

        {/* Recording and Scribe Notice Box (surfaceTint) */}
        <Card variant="tint" style={styles.recordingNoticeCard}>
          <View style={styles.recordingHeader}>
            <View style={styles.recTextCol}>
              <Text style={[typography.bodyBold, styles.recTitle]}>
                Recording and transcription
              </Text>
              <Text style={[typography.small, styles.recBody]}>
                Your consult will be recorded and transcribed so you receive a written summary. You can turn this off now or at any time during the call.
              </Text>
            </View>
            <Toggle
              value={store.isRecordingOn}
              onValueChange={handleToggleRecording}
              accessibilityLabel="Queue recording toggle"
            />
          </View>
        </Card>

        {/* Prepare Checklist & File Upload */}
        <Card style={styles.prepareCard}>
          <View style={styles.prepareHeader}>
            <View style={styles.prepareIconCircle}>
              <FileText size={18} color={colors.ink} />
            </View>
            <View style={styles.prepareTitleCol}>
              <Text style={[typography.bodyBold, styles.prepareTitle]}>
                Keep your reports ready
              </Text>
              <Text style={[typography.caption, styles.prepareSubtitle]}>
                Upload recent blood reports or dose photos for your doctor to see
              </Text>
            </View>
          </View>

          <Button
            title="Upload now"
            onPress={handleSimulateUpload}
            variant="surface"
            size="small"
            icon={<Upload size={14} color={colors.ink} />}
            style={styles.uploadBtn}
          />

          {/* Uploaded Documents List */}
          {store.uploadedDocs.length > 0 && (
            <View style={styles.uploadedList}>
              <Text style={[typography.caption, styles.uploadedHeader]}>
                Shared with doctor ({store.uploadedDocs.length}):
              </Text>
              {store.uploadedDocs.map((doc) => (
                <View key={doc.id} style={styles.docItemRow}>
                  <FileText size={16} color={colors.inkSecondary} />
                  <Text numberOfLines={1} style={[typography.small, styles.docTitle]}>
                    {doc.title}
                  </Text>
                  {doc.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Leave Queue Button */}
        <TouchableOpacity
          onPress={() => setLeaveSheetOpen(true)}
          style={styles.leaveQueueBtn}
          accessibilityRole="button"
          accessibilityLabel="Leave queue"
        >
          <LogOut size={16} color={colors.inkSecondary} />
          <Text style={[typography.smallBold, styles.leaveQueueText]}>
            Leave queue
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Leave Queue Confirmation Sheet */}
      <BottomSheet
        visible={leaveSheetOpen}
        onClose={() => setLeaveSheetOpen(false)}
        title="Leave Waiting Room?"
        subtitle={`You will lose your position (#${store.queuePosition}) in the live queue.`}
      >
        <View style={styles.leaveSheetContent}>
          <Button
            title="Stay in Queue"
            onPress={() => setLeaveSheetOpen(false)}
            variant="primary"
            size="large"
            style={styles.stayBtn}
          />

          <Button
            title="Yes, Leave Queue"
            onPress={handleConfirmLeaveQueue}
            variant="secondary"
            size="normal"
            style={styles.confirmLeaveBtn}
          />
        </View>
      </BottomSheet>

      {/* Floating Toast */}
      <Toast
        visible={!!toastMessage}
        message={toastMessage || ''}
        onDismiss={() => setToastMessage(null)}
      />
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
    paddingBottom: 40,
  },
  spinnerCard: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.accentSoft,
    backgroundColor: colors.surfaceTint,
  },
  liveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    marginBottom: 14,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentStrong,
    marginRight: 6,
  },
  liveTagText: {
    color: colors.ink,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  circleStage: {
    width: 148,
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 6,
  },
  spinnerRotator: {
    width: 148,
    height: 148,
    position: 'absolute',
  },
  circleCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: colors.line,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  circleNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
  },
  circleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 2,
  },
  commentStrip: {
    width: '100%',
    backgroundColor: colors.bg,
    borderRadius: radius.card,
    padding: 14,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentStepTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.inkSecondary,
    letterSpacing: 0.5,
    marginLeft: 5,
  },
  commentText: {
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 20,
    minHeight: 40,
  },
  waitDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  waitDurationText: {
    color: colors.inkSecondary,
    marginLeft: 6,
  },
  connectNowBtn: {
    width: '100%',
    marginTop: 4,
  },
  longWaitCard: {
    marginBottom: 16,
    backgroundColor: colors.surfaceTint,
    borderColor: colors.accentStrong,
  },
  longWaitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  longWaitTitle: {
    marginLeft: 8,
    color: colors.ink,
  },
  longWaitDesc: {
    color: colors.inkSecondary,
    marginVertical: 6,
  },
  longWaitButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  longWaitBtn: {
    marginRight: 8,
    minWidth: 120,
  },
  carouselContainer: {
    marginBottom: 16,
  },
  carouselSlide: {
    padding: 18,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slideIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 20,
  },
  dotInactive: {
    backgroundColor: colors.line,
  },
  slideTitle: {
    color: colors.ink,
    marginBottom: 6,
  },
  slideTagline: {
    color: colors.inkSecondary,
    lineHeight: 22,
  },
  recordingNoticeCard: {
    marginBottom: 16,
    borderColor: colors.accentSoft,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recTextCol: {
    flex: 1,
    marginRight: 12,
  },
  recTitle: {
    color: colors.ink,
    marginBottom: 4,
  },
  recBody: {
    color: colors.inkSecondary,
    lineHeight: 20,
  },
  prepareCard: {
    marginBottom: 20,
  },
  prepareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prepareIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prepareTitleCol: {
    flex: 1,
  },
  prepareTitle: {
    color: colors.ink,
  },
  prepareSubtitle: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  uploadBtn: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  uploadedList: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  uploadedHeader: {
    color: colors.inkSecondary,
    marginBottom: 6,
  },
  docItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  docTitle: {
    flex: 1,
    color: colors.ink,
    marginLeft: 8,
  },
  newBadge: {
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.accentStrong,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentStrong,
  },
  leaveQueueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  leaveQueueText: {
    color: colors.inkSecondary,
    marginLeft: 6,
  },
  leaveSheetContent: {
    paddingBottom: 20,
  },
  stayBtn: {
    marginBottom: 12,
  },
  confirmLeaveBtn: {
    borderColor: colors.line,
  },
});
