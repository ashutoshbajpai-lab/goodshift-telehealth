import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';
import { useConsultationStore } from '../../store/consultationStore';
import {
  TopBar,
  ProgressBar,
  Button,
  Card,
  CheckboxRow,
  Toggle,
} from '../../components';
import {
  ChevronDown,
  ChevronUp,
  Lock,
  Mic,
  ShieldCheck,
  Info,
} from 'lucide-react-native';

interface ConsentItemConfig {
  key: string;
  label: string;
  subtitle: string;
  mandatory: boolean;
  whyNeeded?: string;
}

const CONSENT_ITEMS: ConsentItemConfig[] = [
  // Mandatory (Locked)
  {
    key: 'demographics',
    label: 'Name, age, gender & height',
    subtitle: 'Core clinical identification for telemedicine compliance',
    mandatory: true,
    whyNeeded: 'Medical practice regulations require licensed physicians to verify patient identity and biometric parameters before issuing prescriptions.',
  },
  {
    key: 'weightHistory',
    label: 'Weight history & BMI trajectory',
    subtitle: '12-week weight logs, baseline (89 kg) to current (83 kg)',
    mandatory: true,
    whyNeeded: 'GLP-1 dosage titration and safety depend on monitoring your rate of weight loss and body composition shifts.',
  },
  {
    key: 'conditionsAllergies',
    label: 'Medical conditions & allergies',
    subtitle: 'PCOS, Insulin Resistance, no known drug allergies',
    mandatory: true,
    whyNeeded: 'Crucial to prevent adverse contraindications with GLP-1 medications (e.g. medullary thyroid carcinoma or pancreatitis risks).',
  },
  {
    key: 'medicinesDoseLog',
    label: 'Current medicines & GLP-1 dose log',
    subtitle: 'Semaglutide 0.5 mg (Step 2), last taken yesterday',
    mandatory: true,
    whyNeeded: 'Your physician needs your exact injection timetable to evaluate efficacy and prescribe the next titration safely.',
  },
  {
    key: 'sideEffects',
    label: 'Side effects reported',
    subtitle: 'Mild nausea twice this week',
    mandatory: true,
    whyNeeded: 'Allows your doctor to address gastrointestinal tolerance and adjust antiemetic or hydration recommendations.',
  },
  // Optional (Can be unticked)
  {
    key: 'foodLogs',
    label: 'Food logs & 6 meal photos',
    subtitle: 'Recent meals (Moong Dal Chilla, Paneer Tikka Salad)',
    mandatory: false,
  },
  {
    key: 'stepsActivity',
    label: 'Steps & physical activity',
    subtitle: 'Daily average: 7,120 steps / day',
    mandatory: false,
  },
  {
    key: 'sleep',
    label: 'Sleep metrics',
    subtitle: 'Daily average: 6.8 hours / night',
    mandatory: false,
  },
  {
    key: 'water',
    label: 'Water intake logs',
    subtitle: 'Daily average: 1.8 L / day (Low)',
    mandatory: false,
  },
  {
    key: 'mood',
    label: 'Mood check-ins',
    subtitle: 'Weekly well-being & motivation score: 4/5',
    mandatory: false,
  },
  {
    key: 'labsPrescriptions',
    label: 'Lab reports & past prescriptions',
    subtitle: '12-week metabolic panel (HbA1c 5.8%, lipids)',
    mandatory: false,
  },
  {
    key: 'deviceData',
    label: 'Smart device & connected sensors',
    subtitle: 'Bluetooth smart scale & continuous vitals',
    mandatory: false,
  },
];

export default function ConsentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const store = useConsultationStore();

  const isScheduleFlow = params.flow === 'schedule';

  // Collapsed by default as required by specification
  const [isExpanded, setIsExpanded] = useState(false);

  const sharedCount = Object.values(store.consentOptions).filter(Boolean).length;
  const totalCount = CONSENT_ITEMS.length;

  const handleToggle = (key: string, val: boolean) => {
    store.setConsentOption(key, val);
  };

  const handleShowWhyNeeded = (item: ConsentItemConfig) => {
    Alert.alert(
      'Required for Safe Clinical Care',
      `${item.label}\n\n${item.whyNeeded || 'This clinical parameter is required to safely prescribe and manage your GLP-1 therapy.'}`,
      [{ text: 'Understood', style: 'default' }]
    );
  };

  const handleContinue = () => {
    // Save choices with timestamp to store & AsyncStorage
    store.saveConsent();

    if (isScheduleFlow) {
      router.push('/(patient)/schedule');
    } else {
      router.push('/(patient)/queue');
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title="Data Sharing Consent" onBack={() => router.back()} />
      <ProgressBar currentStep={2} totalSteps={4} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Short Plain Purpose Line */}
        <Text style={[typography.h1, styles.heading]}>
          Your doctor sees this information to plan your treatment.
        </Text>
        <Text style={[typography.body, styles.purposeDesc]}>
          In accordance with Digital Personal Data Protection standards, you have full visibility and control over what health data is shared.
        </Text>

        {/* Expandable Multiselect Card */}
        <Card style={styles.expandableCard}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.expandHeader}
            accessibilityRole="button"
            accessibilityLabel={`Shared with your doctor: ${sharedCount} of ${totalCount}. Tap to ${isExpanded ? 'collapse' : 'expand'}`}
          >
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <ShieldCheck size={20} color={colors.ink} />
              </View>
              <View>
                <Text style={[typography.bodyBold, styles.countTitle]}>
                  Shared with your doctor: {sharedCount} of {totalCount}
                </Text>
                <Text style={[typography.caption, styles.countSubtitle]}>
                  {isExpanded ? 'Tap to collapse list' : 'Tap or drag to view & customize shared items'}
                </Text>
              </View>
            </View>
            {isExpanded ? (
              <ChevronUp size={22} color={colors.ink} />
            ) : (
              <ChevronDown size={22} color={colors.ink} />
            )}
          </TouchableOpacity>

          {/* Expanded List */}
          {isExpanded && (
            <View style={styles.itemsList}>
              <View style={styles.noticeRow}>
                <Lock size={14} color={colors.inkSecondary} />
                <Text style={[typography.caption, styles.mandatoryNote]}>
                  Mandatory items are locked for clinical safety
                </Text>
              </View>

              {CONSENT_ITEMS.map((item) => (
                <CheckboxRow
                  key={item.key}
                  label={item.label}
                  subtitle={item.subtitle}
                  checked={!!store.consentOptions[item.key]}
                  locked={item.mandatory}
                  onToggle={(val) => handleToggle(item.key, val)}
                  onLockedPress={() => handleShowWhyNeeded(item)}
                />
              ))}
            </View>
          )}
        </Card>

        {/* Separate Recording & Transcription Row */}
        <Card style={styles.recordingCard}>
          <View style={styles.recordingRow}>
            <View style={styles.recordingLeft}>
              <View style={styles.recIconCircle}>
                <Mic size={20} color={colors.ink} />
              </View>
              <View style={styles.recTextCol}>
                <View style={styles.recTitleRow}>
                  <Text style={[typography.bodyBold, styles.recTitle]}>
                    Recording and transcription
                  </Text>
                  <View style={styles.recBadge}>
                    <Text style={styles.recBadgeText}>
                      {store.isRecordingOn ? 'On' : 'Off'}
                    </Text>
                  </View>
                </View>
                <Text style={[typography.small, styles.recDesc]}>
                  Your consult is recorded and transcribed so you receive a clinical summary. You can turn this off at any time, including during the call.
                </Text>
              </View>
            </View>
            <Toggle
              value={store.isRecordingOn}
              onValueChange={(val) => store.setIsRecordingOn(val, 'patient')}
              accessibilityLabel="Toggle recording and transcription"
            />
          </View>
        </Card>

        {/* Footer Change Later Notice */}
        <View style={styles.footerNoticeRow}>
          <Info size={16} color={colors.inkSecondary} />
          <Text style={[typography.caption, styles.footerNoticeText]}>
            You can change your data sharing choices later in your profile settings.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          style={styles.continueBtn}
        />
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
    padding: spacing.base,
    paddingBottom: 120,
  },
  heading: {
    color: colors.ink,
    marginTop: 10,
    marginBottom: 6,
  },
  purposeDesc: {
    color: colors.inkSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  expandableCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  expandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surfaceTint,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  countTitle: {
    color: colors.ink,
  },
  countSubtitle: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  itemsList: {
    padding: 16,
    backgroundColor: colors.bg,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  mandatoryNote: {
    color: colors.inkSecondary,
    marginLeft: 6,
  },
  recordingCard: {
    marginBottom: 20,
    backgroundColor: colors.surfaceTint,
    borderColor: colors.accentSoft,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  recordingLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  recIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  recTextCol: {
    flex: 1,
  },
  recTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recTitle: {
    color: colors.ink,
    marginRight: 8,
  },
  recBadge: {
    backgroundColor: colors.bg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.line,
  },
  recBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
  },
  recDesc: {
    color: colors.inkSecondary,
    lineHeight: 18,
  },
  footerNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  footerNoticeText: {
    color: colors.inkSecondary,
    marginLeft: 6,
    textAlign: 'center',
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
    ...shadows.sheet,
  },
  continueBtn: {
    width: '100%',
  },
});
