import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { useConsultationStore, ScheduledBooking } from '../../store/consultationStore';
import { mockDoctors } from '../../mock/doctors';
import {
  TopBar,
  ProgressBar,
  Button,
  Card,
  BottomSheet,
} from '../../components';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Bell,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';

interface DayOption {
  date: Date;
  dayLabel: string;
  dateLabel: string;
  dateStr: string;
}

const getNext7Days = (): DayOption[] => {
  const days: DayOption[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateLabel: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      dateStr: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
  }
  return days;
};

const MORNING_SLOTS = ['09:00 AM', '10:00 AM', '11:30 AM'];
const AFTERNOON_SLOTS = ['02:00 PM', '03:30 PM', '04:45 PM'];
const EVENING_SLOTS = ['06:00 PM', '06:30 PM', '07:15 PM', '08:00 PM'];

export default function ScheduleScreen() {
  const router = useRouter();
  const store = useConsultationStore();

  const days = getNext7Days();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string>('06:30 PM');

  // Assigned doctor based on language match
  const assignedDoctor = mockDoctors[0]; // Dr. Ananya Sen (speaks Hindi & English)

  // Booking confirmation sheet & success modal
  const [confirmSheetOpen, setConfirmSheetOpen] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const selectedDay = days[selectedDayIndex];

  const handleReviewBooking = () => {
    setConfirmSheetOpen(true);
  };

  const handleConfirmBooking = async () => {
    const booking: ScheduledBooking = {
      doctorId: assignedDoctor.id,
      doctorName: assignedDoctor.name,
      doctorAvatar: assignedDoctor.avatar,
      doctorQualification: assignedDoctor.qualification,
      dateStr: selectedDay.dateStr,
      timeSlot: selectedSlot,
      language: 'Hindi & English',
      timestamp: Date.now(),
      consultationId: `VC-000${Math.floor(200 + Math.random() * 800)}`,
    };

    await store.bookSchedule(booking);
    setConfirmSheetOpen(false);
    setIsBooked(true);
  };

  const handleAddToCalendar = () => {
    Alert.alert(
      'Calendar Event Added',
      `Consultation with ${assignedDoctor.name} added to device calendar for ${selectedDay.dateStr} at ${selectedSlot}.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <TopBar title="Schedule a Slot" onBack={() => router.back()} />
      <ProgressBar currentStep={3} totalSteps={4} />

      {!isBooked ? (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[typography.h1, styles.title]}>Select Date & Time</Text>
            <Text style={[typography.body, styles.subtitle]}>
              Only showing slots with physicians fluent in your language (Hindi & English).
            </Text>

            {/* Horizontal 7-Day Date Strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateStrip}
            >
              {days.map((d, index) => {
                const isSelected = selectedDayIndex === index;
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.75}
                    onPress={() => setSelectedDayIndex(index)}
                    style={[
                      styles.dayCard,
                      isSelected ? styles.dayCardSelected : styles.dayCardNormal,
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption,
                        isSelected ? styles.dayTextSelected : styles.dayTextNormal,
                      ]}
                    >
                      {d.dayLabel}
                    </Text>
                    <Text
                      style={[
                        typography.bodyBold,
                        isSelected ? styles.dateTextSelected : styles.dateTextNormal,
                      ]}
                    >
                      {d.dateLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time Slot Sections */}
            <View style={styles.slotsContainer}>
              {/* Morning */}
              <Text style={[typography.smallBold, styles.slotGroupHeader]}>
                Morning Slots
              </Text>
              <View style={styles.slotGrid}>
                {MORNING_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => setSelectedSlot(slot)}
                    style={[
                      styles.slotPill,
                      selectedSlot === slot ? styles.slotPillSelected : styles.slotPillNormal,
                    ]}
                  >
                    <Clock size={13} color={colors.ink} style={styles.slotIcon} />
                    <Text
                      style={[
                        typography.smallBold,
                        selectedSlot === slot ? styles.slotTextSelected : styles.slotTextNormal,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Afternoon */}
              <Text style={[typography.smallBold, styles.slotGroupHeader]}>
                Afternoon Slots
              </Text>
              <View style={styles.slotGrid}>
                {AFTERNOON_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => setSelectedSlot(slot)}
                    style={[
                      styles.slotPill,
                      selectedSlot === slot ? styles.slotPillSelected : styles.slotPillNormal,
                    ]}
                  >
                    <Clock size={13} color={colors.ink} style={styles.slotIcon} />
                    <Text
                      style={[
                        typography.smallBold,
                        selectedSlot === slot ? styles.slotTextSelected : styles.slotTextNormal,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Evening */}
              <Text style={[typography.smallBold, styles.slotGroupHeader]}>
                Evening Slots
              </Text>
              <View style={styles.slotGrid}>
                {EVENING_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => setSelectedSlot(slot)}
                    style={[
                      styles.slotPill,
                      selectedSlot === slot ? styles.slotPillSelected : styles.slotPillNormal,
                    ]}
                  >
                    <Clock size={13} color={colors.ink} style={styles.slotIcon} />
                    <Text
                      style={[
                        typography.smallBold,
                        selectedSlot === slot ? styles.slotTextSelected : styles.slotTextNormal,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Connect Explanation */}
            <Card variant="tint" style={styles.priorityNoteCard}>
              <View style={styles.priorityRow}>
                <Sparkles size={20} color={colors.ink} />
                <View style={styles.priorityTextCol}>
                  <Text style={[typography.bodyBold, styles.priorityTitle]}>
                    Priority Connect Guaranteed
                  </Text>
                  <Text style={[typography.small, styles.priorityDesc]}>
                    When you join on time, you skip the live queue and connect first with your doctor.
                  </Text>
                </View>
              </View>
            </Card>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <Button
              title={`Confirm: ${selectedDay.dayLabel}, ${selectedSlot}`}
              onPress={handleReviewBooking}
              variant="primary"
              size="large"
              style={styles.confirmBtn}
            />
          </View>
        </>
      ) : (
        /* Booking Success Screen */
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <CheckCircle2 size={52} color={colors.success} />
          </View>

          <Text style={[typography.display, styles.successTitle]}>
            Consultation Scheduled!
          </Text>

          <Text style={[typography.body, styles.successSubtitle]}>
            Your appointment with {assignedDoctor.name} is confirmed for:
          </Text>

          <Card variant="tint" style={styles.bookingDetailsCard}>
            <View style={styles.detailRow}>
              <Calendar size={18} color={colors.ink} />
              <Text style={[typography.bodyBold, styles.detailText]}>
                {selectedDay.dateStr}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={18} color={colors.ink} />
              <Text style={[typography.bodyBold, styles.detailText]}>
                {selectedSlot} (IST)
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Sparkles size={18} color={colors.ink} />
              <Text style={[typography.small, styles.detailText]}>
                Language: Hindi & English
              </Text>
            </View>
          </Card>

          {/* Reminders Note */}
          <View style={styles.reminderBox}>
            <Bell size={18} color={colors.inkSecondary} />
            <Text style={[typography.small, styles.reminderText]}>
              We will remind you 1 hour and 10 minutes before by push notification, WhatsApp and SMS.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.successActions}>
            <Button
              title="Add to Calendar"
              onPress={handleAddToCalendar}
              variant="secondary"
              size="normal"
              style={styles.calBtn}
            />

            <Button
              title="Back to Home"
              onPress={() => router.replace('/(patient)')}
              variant="primary"
              size="large"
              style={styles.homeBtn}
            />
          </View>
        </View>
      )}

      {/* Confirmation Bottom Sheet */}
      <BottomSheet
        visible={confirmSheetOpen}
        onClose={() => setConfirmSheetOpen(false)}
        title="Confirm Your Appointment"
      >
        <View style={styles.confirmSheetContent}>
          <Text style={[typography.body, styles.confirmSheetDesc]}>
            Please review your booking details before locking this slot:
          </Text>

          <Card style={styles.sheetSummaryCard} variant="tint">
            <Text style={[typography.h2, styles.sheetDoctorName]}>
              {assignedDoctor.name}
            </Text>
            <Text style={[typography.small, styles.sheetDoctorQual]}>
              {assignedDoctor.qualification}
            </Text>
            <Text style={[typography.bodyBold, styles.sheetDateTime]}>
              {selectedDay.dateStr} at {selectedSlot}
            </Text>
          </Card>

          <View style={styles.sheetRuleRow}>
            <CheckCircle2 size={16} color={colors.success} />
            <Text style={[typography.small, styles.sheetRuleText]}>
              You will be connected first ahead of the live queue when you join on time.
            </Text>
          </View>

          <Button
            title="Book This Slot Now"
            onPress={handleConfirmBooking}
            variant="primary"
            size="large"
            style={styles.sheetBookBtn}
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
    paddingBottom: 110,
  },
  title: {
    color: colors.ink,
    marginTop: 8,
  },
  subtitle: {
    color: colors.inkSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 22,
  },
  dateStrip: {
    paddingBottom: 16,
  },
  dayCard: {
    width: 80,
    height: 72,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
  },
  dayCardNormal: {
    backgroundColor: colors.bg,
    borderColor: colors.line,
  },
  dayCardSelected: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.accent,
  },
  dayTextNormal: {
    color: colors.inkSecondary,
  },
  dayTextSelected: {
    color: colors.ink,
    fontWeight: '700',
  },
  dateTextNormal: {
    color: colors.ink,
    marginTop: 4,
  },
  dateTextSelected: {
    color: colors.ink,
    fontWeight: '800',
    marginTop: 4,
  },
  slotsContainer: {
    marginVertical: 12,
  },
  slotGroupHeader: {
    color: colors.ink,
    marginBottom: 8,
    marginTop: 6,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginRight: 10,
    marginBottom: 10,
  },
  slotPillNormal: {
    backgroundColor: colors.bg,
    borderColor: colors.line,
  },
  slotPillSelected: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.accent,
  },
  slotIcon: {
    marginRight: 6,
  },
  slotTextNormal: {
    color: colors.ink,
  },
  slotTextSelected: {
    color: colors.ink,
    fontWeight: '700',
  },
  assignedDocHeader: {
    color: colors.ink,
    marginTop: 10,
    marginBottom: 8,
  },
  priorityNoteCard: {
    marginTop: 16,
    marginBottom: 20,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  priorityTitle: {
    color: colors.ink,
  },
  priorityDesc: {
    color: colors.inkSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  confirmBtn: {
    width: '100%',
  },
  successContainer: {
    flex: 1,
    padding: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    color: colors.inkSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  bookingDetailsCard: {
    width: '100%',
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    color: colors.ink,
    marginLeft: 10,
  },
  reminderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTint,
    padding: 12,
    borderRadius: radius.card,
    marginBottom: 24,
    width: '100%',
  },
  reminderText: {
    color: colors.ink,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  successActions: {
    width: '100%',
  },
  calBtn: {
    marginBottom: 12,
  },
  homeBtn: {
    width: '100%',
  },
  confirmSheetContent: {
    paddingBottom: 24,
  },
  confirmSheetDesc: {
    color: colors.inkSecondary,
    marginBottom: 14,
  },
  sheetSummaryCard: {
    marginBottom: 14,
  },
  sheetDoctorName: {
    color: colors.ink,
  },
  sheetDoctorQual: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  sheetDateTime: {
    color: colors.accentStrong,
    marginTop: 8,
  },
  sheetRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sheetRuleText: {
    color: colors.ink,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  sheetBookBtn: {
    width: '100%',
  },
});
