import React, { useState, useEffect } from 'react';
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
import { TopBar, Button, Card, CountdownTimer } from '../../components';
import {
  Video,
  Calendar,
  Clock,
  History,
  AlertCircle,
  TrendingDown,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const store = useConsultationStore();
  const { patient, scheduledBooking } = store;

  // Track if scheduled call window is open (within 10 minutes or mock test toggle)
  // For easy testing, we allow testers to simulate "within 10 min window"
  const [forceWindowOpen, setForceWindowOpen] = useState(true);

  const hasBooking = !!scheduledBooking;
  const isJoinWindowActive = hasBooking && forceWindowOpen;

  const handleStartConsultNow = () => {
    // Reset to start of live consult flow
    store.startLiveCallProcess(false);
    router.push('/(patient)/check');
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
      <TopBar title="Good Shift Care" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Greeting */}
        <View style={styles.greetingHeader}>
          <Text style={[typography.display, styles.greeting]}>
            Hello, {patient.firstName}
          </Text>
          <Text style={[typography.body, styles.programBadge]}>
            {patient.programName} • Week {patient.weeksOnProgram}
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
              <TouchableOpacity onPress={handleReschedule} style={styles.linkButton}>
                <Text style={[typography.smallBold, styles.linkText]}>Reschedule</Text>
              </TouchableOpacity>
              <View style={styles.linkDivider} />
              <TouchableOpacity onPress={handleCancelBooking} style={styles.linkButton}>
                <Text style={[typography.smallBold, styles.cancelLinkText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Consult Now Section */}
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
            Avg wait time: ~6 mins • Hindi & English physicians on duty
          </Text>
        </View>

        {/* Schedule a future slot shortcut if no booking exists */}
        {!hasBooking && (
          <TouchableOpacity
            style={styles.scheduleSlotBanner}
            onPress={() => router.push('/(patient)/schedule')}
          >
            <View style={styles.bannerLeft}>
              <Calendar size={20} color={colors.ink} />
              <View style={styles.bannerTextCol}>
                <Text style={[typography.bodyBold, styles.bannerTitle]}>
                  Prefer a planned appointment?
                </Text>
                <Text style={[typography.small, styles.bannerSubtitle]}>
                  Book a confirmed slot for the next 7 days
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.inkSecondary} />
          </TouchableOpacity>
        )}

        {/* Clinical Snapshot for Patient Context */}
        <Card style={styles.metricOverviewCard}>
          <Text style={[typography.h2, styles.overviewTitle]}>Your GLP-1 Progress</Text>
          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <View style={styles.metricIconCircle}>
                <TrendingDown size={18} color={colors.accentStrong} />
              </View>
              <Text style={[typography.h1, styles.metricVal]}>83.0 kg</Text>
              <Text style={[typography.caption, styles.metricLabel]}>-6 kg from start</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricIconCircle}>
                <ShieldCheck size={18} color={colors.success} />
              </View>
              <Text style={[typography.h1, styles.metricVal]}>Step 2</Text>
              <Text style={[typography.caption, styles.metricLabel]}>Semaglutide 0.5 mg</Text>
            </View>
          </View>
        </Card>

        {/* Shortcut to Consultation History */}
        <TouchableOpacity
          style={styles.historyLinkCard}
          onPress={() => router.push('/(patient)/history')}
        >
          <View style={styles.historyLeft}>
            <View style={styles.historyIconCircle}>
              <History size={20} color={colors.ink} />
            </View>
            <View>
              <Text style={[typography.bodyBold, styles.historyTitle]}>
                Consultation history
              </Text>
              <Text style={[typography.small, styles.historySubtitle]}>
                Past clinical notes, prescriptions & summaries
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.inkSecondary} />
        </TouchableOpacity>
      </ScrollView>
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
    paddingVertical: 6,
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
  },
  mainConsultBtn: {
    width: '100%',
  },
  waitNote: {
    color: colors.inkSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  scheduleSlotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    marginBottom: 20,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  bannerTitle: {
    color: colors.ink,
  },
  bannerSubtitle: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  metricOverviewCard: {
    marginBottom: 20,
  },
  overviewTitle: {
    color: colors.ink,
    marginBottom: 14,
  },
  metricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.card,
    marginHorizontal: 4,
  },
  metricIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricVal: {
    color: colors.ink,
  },
  metricLabel: {
    color: colors.inkSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  historyLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.bg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  historyTitle: {
    color: colors.ink,
  },
  historySubtitle: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
});
