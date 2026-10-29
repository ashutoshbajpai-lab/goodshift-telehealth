import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { useConsultationStore } from '../../store/consultationStore';
import { mockPatient } from '../../mock/patient';
import { TopBar, Button, Card, Badge } from '../../components';
import {
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Calendar,
  AlertTriangle,
  Activity,
} from 'lucide-react-native';

export default function DoctorQueueScreen() {
  const router = useRouter();
  const store = useConsultationStore();

  const handleStartConsult = (isScheduled: boolean) => {
    store.startLiveCallProcess(isScheduled);
    store.setCallState('inCall');
    router.push('/(doctor)/call');
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Doctor Clinical Queue"
        subtitle="Endocrinology & GLP-1 Telehealth Station"
        showLogo={false}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Duty Overview Strip */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="tint">
            <Text style={[typography.caption, styles.statLabel]}>WAITING ROOM</Text>
            <Text style={[typography.display, styles.statVal]}>3</Text>
            <Text style={[typography.caption, styles.statSub]}>2 Live • 1 Scheduled</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={[typography.caption, styles.statLabel]}>AVERAGE WAIT</Text>
            <Text style={[typography.display, styles.statVal]}>~5m</Text>
            <Text style={[typography.caption, styles.statSub]}>Within SLA target</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={[typography.caption, styles.statLabel]}>CONSULTS TODAY</Text>
            <Text style={[typography.display, styles.statVal]}>8</Text>
            <Text style={[typography.caption, styles.statSub]}>100% Notes completed</Text>
          </Card>
        </View>

        <Text style={[typography.h2, styles.sectionTitle]}>
          Patient Queue Priority Stream
        </Text>

        {/* 1. Scheduled Patient (Pinned Priority on Top) */}
        <Card style={styles.patientRowCard} variant="tint">
          <View style={styles.rowHeader}>
            <View style={styles.priorityBadge}>
              <Sparkles size={12} color={colors.ink} />
              <Text style={styles.priorityBadgeText}>Priority Booking</Text>
            </View>
            <View style={styles.timeTag}>
              <Calendar size={13} color={colors.inkSecondary} />
              <Text style={[typography.caption, styles.timeTagText]}>Scheduled Slot: 6:30 PM</Text>
            </View>
          </View>

          <View style={styles.patientMainInfo}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>PS</Text>
            </View>
            <View style={styles.patientDetails}>
              <View style={styles.nameRow}>
                <Text style={[typography.h2, styles.patientName]}>{mockPatient.name}</Text>
                <Text style={[typography.small, styles.patientMeta]}>
                  {mockPatient.age}y • {mockPatient.gender.toUpperCase()} • Hindi / English
                </Text>
              </View>
              <Text style={[typography.small, styles.patientClinical]}>
                Week 12 Semaglutide 0.5mg • Start: 89kg → Current: 83kg • PCOS
              </Text>
              <View style={styles.tagGroup}>
                <View style={styles.alertTag}>
                  <AlertTriangle size={12} color={colors.accentStrong} />
                  <Text style={styles.alertTagText}>Reported Nausea (2x)</Text>
                </View>
                <View style={styles.docTag}>
                  <Text style={styles.docTagText}>New Lab Upload Ready</Text>
                </View>
              </View>
            </View>

            <Button
              title="Start Visit"
              onPress={() => handleStartConsult(true)}
              variant="primary"
              size="normal"
              icon={<ArrowRight size={16} color={colors.ink} />}
              iconPosition="right"
              style={styles.startBtn}
            />
          </View>
        </Card>

        {/* 2. Live Queue Patient 1 */}
        <Card style={styles.patientRowCard}>
          <View style={styles.rowHeader}>
            <Badge label="Live Queue #1" variant="accent" />
            <View style={styles.timeTag}>
              <Clock size={13} color={colors.inkSecondary} />
              <Text style={[typography.caption, styles.timeTagText]}>Waiting 6 mins</Text>
            </View>
          </View>

          <View style={styles.patientMainInfo}>
            <View style={[styles.avatarCircle, { backgroundColor: '#E2E8F0' }]}>
              <Text style={styles.avatarInitials}>AK</Text>
            </View>
            <View style={styles.patientDetails}>
              <View style={styles.nameRow}>
                <Text style={[typography.h2, styles.patientName]}>Amit Kulkarni</Text>
                <Text style={[typography.small, styles.patientMeta]}>41y • MALE • Marathi / English</Text>
              </View>
              <Text style={[typography.small, styles.patientClinical]}>
                Week 8 Titration Review • 94kg → 89kg • Type 2 Diabetes
              </Text>
            </View>

            <Button
              title="Start Visit"
              onPress={() => handleStartConsult(false)}
              variant="secondary"
              size="normal"
              style={styles.startBtn}
            />
          </View>
        </Card>

        {/* 3. Live Queue Patient 2 */}
        <Card style={styles.patientRowCard}>
          <View style={styles.rowHeader}>
            <Badge label="Live Queue #2" variant="neutral" />
            <View style={styles.timeTag}>
              <Clock size={13} color={colors.inkSecondary} />
              <Text style={[typography.caption, styles.timeTagText]}>Waiting 2 mins</Text>
            </View>
          </View>

          <View style={styles.patientMainInfo}>
            <View style={[styles.avatarCircle, { backgroundColor: '#E2E8F0' }]}>
              <Text style={styles.avatarInitials}>NV</Text>
            </View>
            <View style={styles.patientDetails}>
              <View style={styles.nameRow}>
                <Text style={[typography.h2, styles.patientName]}>Neha Verma</Text>
                <Text style={[typography.small, styles.patientMeta]}>29y • FEMALE • Hindi / English</Text>
              </View>
              <Text style={[typography.small, styles.patientClinical]}>
                Initial GLP-1 Eligibility Consult • BMI 32.8 • Dyslipidemia
              </Text>
            </View>

            <Button
              title="Start Visit"
              onPress={() => handleStartConsult(false)}
              variant="secondary"
              size="normal"
              style={styles.startBtn}
            />
          </View>
        </Card>
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
    padding: spacing.tabletSide,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
  },
  statLabel: {
    color: colors.inkSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statVal: {
    color: colors.ink,
    marginVertical: 4,
  },
  statSub: {
    color: colors.inkSecondary,
  },
  sectionTitle: {
    color: colors.ink,
    marginBottom: 16,
  },
  patientRowCard: {
    marginBottom: 16,
    padding: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.chip,
  },
  priorityBadgeText: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 11,
    marginLeft: 4,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTagText: {
    color: colors.inkSecondary,
    marginLeft: 5,
  },
  patientMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  patientDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientName: {
    color: colors.ink,
    marginRight: 10,
  },
  patientMeta: {
    color: colors.inkSecondary,
  },
  patientClinical: {
    color: colors.ink,
    marginTop: 3,
  },
  tagGroup: {
    flexDirection: 'row',
    marginTop: 6,
  },
  alertTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.chip,
    marginRight: 8,
  },
  alertTagText: {
    color: colors.accentStrong,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  docTag: {
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.chip,
  },
  docTagText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '600',
  },
  startBtn: {
    minWidth: 140,
    marginLeft: 16,
  },
});
