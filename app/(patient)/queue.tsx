import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
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
  Users,
  Upload,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  LogOut,
  HelpCircle,
  Quote,
} from 'lucide-react-native';

const CAROUSEL_SLIDES = [
  {
    type: 'brand',
    title: 'Precision GLP-1 Care',
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

export default function QueueScreen() {
  const router = useRouter();
  const store = useConsultationStore();

  const [activeSlide, setActiveSlide] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [leaveSheetOpen, setLeaveSheetOpen] = useState(false);

  // Monitor transition to 'matched'
  useEffect(() => {
    if (store.callState === 'matched' || store.callState === 'connecting' || store.callState === 'inCall') {
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

  return (
    <View style={styles.container}>
      <TopBar
        title="Waiting Room"
        onBack={() => setLeaveSheetOpen(true)}
      />
      <ProgressBar currentStep={4} totalSteps={4} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Live Queue Position & Wait Banner */}
        <Card variant="tint" style={styles.queueStatusCard}>
          <View style={styles.queueLiveRow}>
            <View style={styles.pulseDot} />
            <Text style={[typography.caption, styles.liveBadgeText]}>LIVE WAITING QUEUE</Text>
          </View>

          <Text style={[typography.display, styles.positionNumber]}>
            {store.queuePosition <= 1 ? "You're Next in Line!" : `You are number ${store.queuePosition}`}
          </Text>

          <View style={styles.waitDurationRow}>
            <Clock size={16} color={colors.ink} />
            <Text style={[typography.bodyBold, styles.waitDurationText]}>
              {store.queuePosition <= 1
                ? 'Doctor is preparing your consultation room...'
                : `Estimated wait: ~${Math.max(1, Math.ceil(store.queueWaitSeconds / 60))} minute${Math.ceil(store.queueWaitSeconds / 60) > 1 ? 's' : ''}`}
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
            style={{ marginTop: 14, width: '92%' }}
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
  queueStatusCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.accentSoft,
  },
  queueLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentStrong,
    marginRight: 6,
  },
  liveBadgeText: {
    color: colors.inkSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  positionNumber: {
    color: colors.ink,
    textAlign: 'center',
    marginVertical: 4,
  },
  waitDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  waitDurationText: {
    color: colors.ink,
    marginLeft: 6,
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
