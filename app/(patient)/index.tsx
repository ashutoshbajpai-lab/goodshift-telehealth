import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { useConsultationStore } from '../../store/consultationStore';
import { TopBar, Button, Card, CountdownTimer, BottomSheet } from '../../components';
import {
  Video,
  Calendar,
  Clock,
  History,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const store = useConsultationStore();
  const { patient, scheduledBooking } = store;

  // Track if scheduled call window is open
  const [forceWindowOpen, setForceWindowOpen] = useState(true);

  // Bottom sheet modal for picking "Immediate" vs "Schedule a Slot"
  const [consultTypeSheetOpen, setConsultTypeSheetOpen] = useState(false);

  const hasBooking = !!scheduledBooking;
  const isJoinWindowActive = hasBooking && forceWindowOpen;

  const handleStartConsultNow = () => {
    // Open choice sheet for user: Immediate vs Preferred Slot
    setConsultTypeSheetOpen(true);
  };

  const handleChooseImmediate = () => {
    setConsultTypeSheetOpen(false);
    store.startLiveCallProcess(false);
    router.push({
      pathname: '/(patient)/check',
      params: { flow: 'live' },
    });
  };

  const handleChooseSchedule = () => {
    setConsultTypeSheetOpen(false);
    store.startLiveCallProcess(false);
    router.push({
      pathname: '/(patient)/check',
      params: { flow: 'schedule' },
    });
  };

  const handleJoinScheduled = () => {
    store.startLiveCallProcess(true);
    // Scheduled patients do quick recheck then priority connect skipping queue
    router.push('/(patient)/check');
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Scheduled Consult',
      'Are you sure you want to cancel your scheduled appointment with ' + (scheduledBooking?.doctorName || 'the doctor') + '?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => store.cancelSchedule(),
        },
      ]
    );
  };

  const handleReschedule = () => {
    router.push('/(patient)/schedule');
  };

  return (
    <View style={styles.container}>
      {/* Mobile Top Bar with History Button at Top Right Corner */}
      <TopBar
        title="Good Shift Care"
        rightElement={
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/(patient)/history')}
            style={styles.historyTopBtn}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Open consultation history"
          >
            <History size={16} color={colors.ink} />
            <Text style={[typography.caption, styles.historyTopText]}>History</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Greeting Header */}
        <View style={styles.greetingHeader}>
          <Text style={[typography.display, styles.greeting]}>
            Hello, {patient.firstName}
          </Text>
          <Text style={[typography.body, styles.programBadge]}>
            Good Shift Care • Personal Weight Health
          </Text>
        </View>

        {/* Free follow-up card */}
        <Card variant="tint" style={styles.followUpCard}>
          <View style={styles.followUpRow}>
            <View style={styles.followUpIcon}>
              <Sparkles size={20} color={colors.ink} />
            </View>
            <View style={styles.followUpTextCol}>
              <Text style={[typography.bodyBold, styles.followUpTitle]}>
                Free follow-up: 4 days left
              </Text>
              <Text style={[typography.small, styles.followUpSubtitle]}>
                Included with your visit from Dr. Ananya Sen (25 Oct)
              </Text>
            </View>
          </View>
        </Card>

        {/* Scheduled Call Card (shown if booking exists) */}
        {hasBooking && scheduledBooking && (
          <Card style={styles.scheduledCard}>
            <View style={styles.scheduledBadgeRow}>
              <View style={styles.scheduledPill}>
                <Calendar size={13} color={colors.ink} />
                <Text style={styles.scheduledPillText}>Upcoming Consult</Text>
              </View>
              <CountdownTimer initialSeconds={540} prefix="Starts in" />
            </View>

            <View style={styles.doctorSnippet}>
              <Image
                source={{ uri: scheduledBooking.doctorAvatar }}
                style={styles.doctorSnippetAvatar}
              />
              <View style={styles.doctorSnippetCol}>
                <Text style={[typography.h2, styles.doctorSnippetName]}>
                  {scheduledBooking.doctorName}
                </Text>
                <Text style={[typography.small, styles.doctorSnippetQual]}>
                  {scheduledBooking.doctorQualification}
                </Text>
                <View style={styles.slotRow}>
                  <Clock size={13} color={colors.inkSecondary} />
                  <Text style={[typography.caption, styles.slotText]}>
                    {scheduledBooking.dateStr} at {scheduledBooking.timeSlot} ({scheduledBooking.language})
                  </Text>
                </View>
              </View>
            </View>

            {/* Join scheduled call button */}
            <View style={styles.scheduledActionContainer}>
              <Button
                title={isJoinWindowActive ? 'Join scheduled call' : 'Opens 10 minutes before'}
                onPress={handleJoinScheduled}
                disabled={!isJoinWindowActive}
                variant="primary"
                size="large"
                icon={<Video size={20} color={colors.ink} />}
              />
              {!isJoinWindowActive && (
                <Text style={[typography.caption, styles.windowHelperText]}>
                  Window opens 10 minutes before your slot time
                </Text>
              )}
            </View>

            {/* Reschedule and cancel secondary links */}
            <View style={styles.bookingLinksRow}>
              <TouchableOpacity
                onPress={handleReschedule}
                style={styles.linkButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Reschedule appointment"
              >
                <Text style={[typography.smallBold, styles.linkText]}>Reschedule</Text>
              </TouchableOpacity>
              <View style={styles.linkDivider} />
              <TouchableOpacity
                onPress={handleCancelBooking}
                style={styles.linkButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Cancel appointment"
              >
                <Text style={[typography.smallBold, styles.cancelLinkText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Primary Consult Action Section */}
        <View style={styles.consultActionSection}>
          <Button
            title="Consult now"
            onPress={handleStartConsultNow}
            variant={hasBooking ? 'secondary' : 'primary'}
            size="large"
            icon={<Video size={22} color={colors.ink} />}
            style={styles.mainConsultBtn}
          />
          <Text style={[typography.caption, styles.waitNote]}>
            Instant doctor connect or preferred slot booking
          </Text>
        </View>

        {/* Clinical Quality Assurance Pill */}
        <View style={styles.trustBadgeRow}>
          <ShieldCheck size={16} color={colors.success} />
          <Text style={[typography.caption, styles.trustBadgeText]}>
            Licensed Telemedicine Physicians • Verified by MMC / DMC
          </Text>
        </View>
      </ScrollView>

      {/* Consult Now Mode Selection Sheet: Immediate vs Schedule */}
      <BottomSheet
        visible={consultTypeSheetOpen}
        onClose={() => setConsultTypeSheetOpen(false)}
        title="Consultation Options"
        subtitle="How would you like to connect with your physician today?"
      >
        <View style={styles.sheetOptionList}>
          {/* Option 1: Right Now (Immediate) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleChooseImmediate}
            style={styles.optionCard}
            accessibilityRole="button"
            accessibilityLabel="Right Now - Immediate consult with next available doctor, wait approximately 6 minutes"
          >
            <View style={styles.optionIconCircle}>
              <Zap size={24} color={colors.ink} />
            </View>
            <View style={styles.optionTextCol}>
              <View style={styles.optionTitleRow}>
                <Text style={[typography.h2, styles.optionTitle]}>Right Now</Text>
                <View style={styles.immediatePill}>
                  <Text style={styles.immediatePillText}>~6 mins wait</Text>
                </View>
              </View>
              <Text style={[typography.small, styles.optionSubtitle]}>
                Immediate consult with the next available on-duty Good Shift doctor
              </Text>
            </View>
            <ArrowRight size={18} color={colors.ink} style={styles.optionArrow} />
          </TouchableOpacity>

          {/* Option 2: Preferred Time Slot (Schedule) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleChooseSchedule}
            style={[styles.optionCard, styles.scheduleOptionCard]}
            accessibilityRole="button"
            accessibilityLabel="Preferred Time Slot - Pick a convenient time slot and skip live queue"
          >
            <View style={[styles.optionIconCircle, styles.scheduleIconCircle]}>
              <Calendar size={24} color={colors.ink} />
            </View>
            <View style={styles.optionTextCol}>
              <View style={styles.optionTitleRow}>
                <Text style={[typography.h2, styles.optionTitle]}>Preferred Time Slot</Text>
                <View style={styles.schedulePill}>
                  <Text style={styles.schedulePillText}>Priority Connect</Text>
                </View>
              </View>
              <Text style={[typography.small, styles.optionSubtitle]}>
                Pick a convenient time slot in the next 7 days and skip the live queue when you join
              </Text>
            </View>
            <ArrowRight size={18} color={colors.ink} style={styles.optionArrow} />
          </TouchableOpacity>
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
    paddingBottom: 100,
  },
  historyTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 12,
    minHeight: 44,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  historyTopText: {
    color: colors.ink,
    fontWeight: '700',
    marginLeft: 6,
  },
  greetingHeader: {
    marginVertical: 14,
  },
  greeting: {
    color: colors.ink,
  },
  programBadge: {
    color: colors.inkSecondary,
    marginTop: 4,
  },
  followUpCard: {
    marginBottom: 16,
  },
  followUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followUpIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  followUpTextCol: {
    flex: 1,
  },
  followUpTitle: {
    color: colors.ink,
  },
  followUpSubtitle: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  scheduledCard: {
    marginBottom: 20,
    borderColor: colors.accentSoft,
    backgroundColor: colors.surfaceTint,
  },
  scheduledBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  scheduledPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.line,
  },
  scheduledPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginLeft: 6,
  },
  doctorSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorSnippetAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  doctorSnippetCol: {
    flex: 1,
  },
  doctorSnippetName: {
    color: colors.ink,
  },
  doctorSnippetQual: {
    color: colors.inkSecondary,
    marginTop: 1,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  slotText: {
    color: colors.inkSecondary,
    marginLeft: 5,
  },
  scheduledActionContainer: {
    marginTop: 4,
  },
  windowHelperText: {
    color: colors.inkSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  bookingLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.accentSoft,
  },
  linkButton: {
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: colors.ink,
  },
  cancelLinkText: {
    color: colors.accentStrong,
  },
  linkDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.accentSoft,
  },
  consultActionSection: {
    marginBottom: 20,
    marginTop: 6,
  },
  mainConsultBtn: {
    width: '100%',
  },
  waitNote: {
    color: colors.inkSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  trustBadgeText: {
    color: colors.inkSecondary,
    marginLeft: 6,
  },
  sheetOptionList: {
    paddingBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.surfaceTint,
    marginBottom: 14,
  },
  scheduleOptionCard: {
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  optionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scheduleIconCircle: {
    backgroundColor: colors.surfaceTint,
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    color: colors.ink,
    marginRight: 8,
  },
  immediatePill: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.chip,
  },
  immediatePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
  },
  schedulePill: {
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.chip,
  },
  schedulePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
  },
  optionSubtitle: {
    color: colors.inkSecondary,
    lineHeight: 18,
  },
  optionArrow: {
    marginLeft: 10,
  },
});
