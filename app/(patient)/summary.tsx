import React, { useState, useEffect } from 'react';
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
import { useConsultationStore } from '../../store/consultationStore';
import {
  TopBar,
  Button,
  Card,
  SkeletonLoader,
  Toast,
} from '../../components';
import {
  FileText,
  Download,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Sparkles,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  Home,
} from 'lucide-react-native';

export default function SummaryScreen() {
  const router = useRouter();
  const store = useConsultationStore();

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check latest consultation in store history
  const latestConsult = store.consultationHistory[0];
  const doctor = store.activeDoctor;

  useEffect(() => {
    // Simulate AI summary preparation delay
    const timer = setTimeout(() => {
      setIsLoading(false);
      setToastMessage('Your consultation summary is ready.');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleDownloadPrescription = () => {
    Alert.alert(
      'Prescription Downloaded',
      `Signed digital prescription for ${doctor?.name || 'Dr. Ananya Sen'} (Reg: ${doctor?.registrationNumber || 'MMC 2017/08/3412'}) saved to your device.`,
      [{ text: 'OK' }]
    );
  };

  const handleOrderMedicines = () => {
    Alert.alert(
      'Order Medicines',
      'Prescription forwarded to partner pharmacy for doorstep delivery in Mumbai & NCR.',
      [{ text: 'Great' }]
    );
  };

  const handleBookNextAppointment = () => {
    router.push('/(patient)/schedule');
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Consultation Summary"
        onBack={() => router.replace('/(patient)')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          /* Loading / Preparation Skeleton State */
          <View style={styles.loadingContainer}>
            <View style={styles.preparingBadge}>
              <Clock size={16} color={colors.ink} />
              <Text style={[typography.smallBold, styles.preparingText]}>
                Synthesizing consultation transcript...
              </Text>
            </View>
            <Text style={[typography.display, styles.loadingTitle]}>
              Your summary is being prepared
            </Text>
            <Text style={[typography.body, styles.loadingDesc]}>
              Our medical scribe engine (Fireflies) is compiling doctor instructions, prescriptions, and key pointers.
            </Text>

            <Card style={styles.skeletonCard}>
              <SkeletonLoader height={24} width="60%" style={{ marginBottom: 12 }} />
              <SkeletonLoader height={16} width="90%" style={{ marginBottom: 8 }} />
              <SkeletonLoader height={16} width="80%" style={{ marginBottom: 8 }} />
              <SkeletonLoader height={16} width="70%" />
            </Card>

            <Card style={styles.skeletonCard}>
              <SkeletonLoader height={24} width="50%" style={{ marginBottom: 12 }} />
              <SkeletonLoader height={40} width="100%" style={{ marginBottom: 8 }} />
              <SkeletonLoader height={40} width="100%" />
            </Card>
          </View>
        ) : (
          /* Summary Ready View */
          <View>
            {/* Header Success Tag */}
            <View style={styles.summaryReadyHeader}>
              <View style={styles.checkIcon}>
                <CheckCircle2 size={24} color={colors.success} />
              </View>
              <View>
                <Text style={[typography.h1, styles.summaryMainTitle]}>
                  Visit Completed & Verified
                </Text>
                <Text style={[typography.caption, styles.summaryDocLine]}>
                  {doctor?.name || 'Dr. Ananya Sen'} • {doctor?.qualification || 'MBBS, MD'}
                </Text>
              </View>
            </View>

            {/* Free Follow-Up Window Tag */}
            <Card variant="tint" style={styles.followUpWindowCard}>
              <View style={styles.windowRow}>
                <Sparkles size={18} color={colors.ink} />
                <View style={styles.windowTextCol}>
                  <Text style={[typography.bodyBold, styles.windowTitle]}>
                    Free follow-up: 7 days remaining
                  </Text>
                  <Text style={[typography.caption, styles.windowDesc]}>
                    You can message your doctor or book a quick check-in at no extra charge.
                  </Text>
                </View>
              </View>
            </Card>

            {/* Conversation Summary Section */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <FileText size={18} color={colors.ink} />
                <Text style={[typography.h2, styles.sectionTitle]}>
                  Conversation Summary
                </Text>
              </View>

              <Text style={[typography.body, styles.summaryParagraph]}>
                {store.isRecordingOn
                  ? latestConsult?.summary ||
                    'Patient Priya Sharma reviewed at week 12 of Semaglutide therapy. Steady weight progress noted with cumulative 6 kg reduction. Discussed mild post-dose nausea linked to low hydration (1.8 L). Recommended increasing hydration to 3.0 L with morning electrolytes, maintaining current 0.5 mg dose, and scheduling repeat lipid panel in 4 weeks.'
                  : `Doctor's Clinical Notes: ${store.soapNotes.assessment} ${store.soapNotes.plan}\n\n(Recording was disabled by patient for this consultation. Summary compiled directly from physician notes).`}
              </Text>

              <View style={styles.transcriptSourceTag}>
                <ShieldCheck size={14} color={colors.success} />
                <Text style={[typography.caption, styles.transcriptSourceText]}>
                  {store.isRecordingOn
                    ? 'Generated from Fireflies AI Telehealth Transcription'
                    : 'Compiled from licensed physician clinical SOAP entries'}
                </Text>
              </View>
            </Card>

            {/* Doctor's Key Pointers */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Sparkles size={18} color={colors.ink} />
                <Text style={[typography.h2, styles.sectionTitle]}>
                  Doctor's Key Pointers
                </Text>
              </View>

              <View style={styles.pointersList}>
                {store.keyPointersList.map((point, index) => (
                  <View key={index} style={styles.pointerItem}>
                    <View style={styles.pointerBullet}>
                      <Text style={styles.bulletText}>{index + 1}</Text>
                    </View>
                    <Text style={[typography.body, styles.pointerItemText]}>
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Prescription Section with Action Buttons */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Award size={18} color={colors.ink} />
                <Text style={[typography.h2, styles.sectionTitle]}>
                  Prescription Orders
                </Text>
              </View>

              {store.prescriptionList.map((item, idx) => (
                <View key={idx} style={styles.prescItem}>
                  <Text style={[typography.bodyBold, styles.prescMedName]}>
                    {item.medicineName}
                  </Text>
                  <Text style={[typography.small, styles.prescDosage]}>
                    {item.dosage} • {item.frequency} ({item.duration})
                  </Text>
                  <Text style={[typography.caption, styles.prescInst]}>
                    Instructions: {item.instructions}
                  </Text>
                </View>
              ))}

              <View style={styles.signatureRow}>
                <View>
                  <Text style={[typography.caption, styles.signatureLabel]}>
                    Physician Digital Signature
                  </Text>
                  <Text style={[typography.smallBold, styles.signatureDoc]}>
                    {doctor?.name || 'Dr. Ananya Sen'}
                  </Text>
                  <Text style={[typography.caption, styles.regText]}>
                    Reg: {doctor?.registrationNumber || 'MMC 2017/08/3412'}
                  </Text>
                </View>
                <View style={styles.signedBadge}>
                  <Text style={styles.signedText}>Digitally Signed</Text>
                </View>
              </View>

              <View style={styles.rxButtonsRow}>
                <Button
                  title="Download Prescription"
                  variant="secondary"
                  size="normal"
                  icon={<Download size={16} color={colors.ink} />}
                  onPress={handleDownloadPrescription}
                  style={styles.rxActionBtn}
                />
                <Button
                  title="Order Medicines"
                  variant="primary"
                  size="normal"
                  icon={<ShoppingBag size={16} color={colors.ink} />}
                  onPress={handleOrderMedicines}
                  style={styles.rxActionBtn}
                />
              </View>
            </Card>

            {/* Lab Tests Ordered */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <FileText size={18} color={colors.ink} />
                <Text style={[typography.h2, styles.sectionTitle]}>
                  Lab Tests Ordered
                </Text>
              </View>

              <View style={styles.labOrderItem}>
                <Text style={[typography.bodyBold, styles.labName]}>
                  • Fasting Plasma Glucose & HbA1c Panel
                </Text>
                <Text style={[typography.caption, styles.labWhy]}>
                  Evaluate glycemic control during dose step 2
                </Text>
              </View>

              <View style={styles.labOrderItem}>
                <Text style={[typography.bodyBold, styles.labName]}>
                  • Repeat Lipid Profile (Cholesterol & Triglycerides)
                </Text>
                <Text style={[typography.caption, styles.labWhy]}>
                  Recommended before next monthly titration
                </Text>
              </View>
            </Card>

            {/* Next Appointment Card */}
            <Card variant="tint" style={styles.nextAppointmentCard}>
              <View style={styles.nextAppTop}>
                <Calendar size={20} color={colors.ink} />
                <View style={styles.nextAppTextCol}>
                  <Text style={[typography.bodyBold, styles.nextAppTitle]}>
                    Next Appointment: In 4 Weeks
                  </Text>
                  <Text style={[typography.small, styles.nextAppDesc]}>
                    Recommended for Step 3 titration review and lab evaluation.
                  </Text>
                </View>
              </View>
              <Button
                title="Book Next Appointment"
                variant="primary"
                size="normal"
                onPress={handleBookNextAppointment}
                style={{ marginTop: 12 }}
              />
            </Card>

            {/* Bottom Navigation Buttons */}
            <View style={styles.summaryBottomButtons}>
              <Button
                title="View in Consultation History"
                variant="secondary"
                size="large"
                onPress={() => router.push('/(patient)/history')}
                style={{ marginBottom: 12 }}
              />
              <Button
                title="Return to Home"
                variant="primary"
                size="large"
                icon={<Home size={18} color={colors.ink} />}
                onPress={() => router.replace('/(patient)')}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Toast Notification */}
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
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  preparingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.chip,
    marginBottom: 16,
  },
  preparingText: {
    color: colors.ink,
    marginLeft: 8,
  },
  loadingTitle: {
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingDesc: {
    color: colors.inkSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 320,
  },
  skeletonCard: {
    width: '100%',
    padding: 16,
    marginBottom: 16,
  },
  summaryReadyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  checkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  summaryMainTitle: {
    color: colors.ink,
  },
  summaryDocLine: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  followUpWindowCard: {
    marginBottom: 16,
    padding: 14,
  },
  windowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  windowTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  windowTitle: {
    color: colors.ink,
  },
  windowDesc: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.ink,
    marginLeft: 8,
  },
  summaryParagraph: {
    color: colors.ink,
    lineHeight: 24,
  },
  transcriptSourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTint,
    padding: 8,
    borderRadius: radius.card,
    marginTop: 14,
  },
  transcriptSourceText: {
    color: colors.ink,
    marginLeft: 6,
    fontWeight: '600',
  },
  pointersList: {
    marginTop: 4,
  },
  pointerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  pointerBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  pointerItemText: {
    color: colors.ink,
    flex: 1,
    lineHeight: 22,
  },
  prescItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  prescMedName: {
    color: colors.ink,
  },
  prescDosage: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  prescInst: {
    color: colors.ink,
    marginTop: 4,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
    paddingTop: 10,
  },
  signatureLabel: {
    color: colors.inkSecondary,
  },
  signatureDoc: {
    color: colors.ink,
    marginTop: 2,
  },
  regText: {
    color: colors.inkSecondary,
  },
  signedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.chip,
  },
  signedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  rxButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  rxActionBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  labOrderItem: {
    marginBottom: 10,
  },
  labName: {
    color: colors.ink,
  },
  labWhy: {
    color: colors.inkSecondary,
    marginLeft: 14,
    marginTop: 2,
  },
  nextAppointmentCard: {
    marginBottom: 20,
    padding: 16,
  },
  nextAppTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextAppTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  nextAppTitle: {
    color: colors.ink,
  },
  nextAppDesc: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  summaryBottomButtons: {
    marginTop: 10,
    marginBottom: 30,
  },
});
