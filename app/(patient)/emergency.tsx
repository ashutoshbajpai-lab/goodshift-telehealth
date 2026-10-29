import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { TopBar, Button, Card } from '../../components';
import { AlertTriangle, PhoneCall, ShieldAlert, ArrowLeft } from 'lucide-react-native';

export default function EmergencyScreen() {
  const router = useRouter();

  const handleCallEmergency = () => {
    Linking.openURL('tel:112').catch(() => {
      // In simulator or web, gracefully handle
    });
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Emergency Guidance"
        onBack={() => router.replace('/(patient)')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.alertHeader}>
          <View style={styles.iconCircle}>
            <ShieldAlert size={40} color={colors.accentStrong} />
          </View>
          <Text style={[typography.display, styles.title]}>
            Immediate Medical Care Needed
          </Text>
          <Text style={[typography.body, styles.subtitle]}>
            Based on the symptoms you reported, a routine telehealth video visit is not safe. You require immediate, in-person clinical evaluation.
          </Text>
        </View>

        <Card style={styles.card} variant="tint">
          <View style={styles.cardHeader}>
            <AlertTriangle size={20} color={colors.accentStrong} />
            <Text style={[typography.h2, styles.cardTitle]}>Reported Symptoms</Text>
          </View>
          <Text style={[typography.body, styles.warningText]}>
            Severe vomiting, chest pressure, fainting, or pregnancy complications can be life-threatening and require urgent emergency department intervention.
          </Text>
        </Card>

        <View style={styles.stepsBox}>
          <Text style={[typography.h2, styles.stepsTitle]}>What you must do immediately:</Text>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={[typography.body, styles.stepDesc]}>
              Call India Emergency Services at <Text style={typography.bodyBold}>112</Text> or have someone drive you to the nearest hospital casualty immediately.
            </Text>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={[typography.body, styles.stepDesc]}>
              Inform the ER triage staff that you are taking a GLP-1 receptor agonist medication (Semaglutide).
            </Text>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>3</Text></View>
            <Text style={[typography.body, styles.stepDesc]}>
              Do not take any further doses until cleared by an emergency physician.
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="Call Emergency Services (112)"
            variant="danger"
            size="large"
            icon={<PhoneCall size={20} color={colors.ink} />}
            onPress={handleCallEmergency}
            style={styles.callBtn}
          />

          <Button
            title="Return to Home"
            variant="secondary"
            size="normal"
            onPress={() => router.replace('/(patient)')}
            style={styles.homeBtn}
          />
        </View>
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
  alertHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceTint,
    borderWidth: 2,
    borderColor: colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.inkSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    marginVertical: 16,
    borderColor: colors.accentStrong,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    marginLeft: 8,
    color: colors.ink,
  },
  warningText: {
    color: colors.ink,
    lineHeight: 22,
  },
  stepsBox: {
    backgroundColor: colors.bg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 24,
  },
  stepsTitle: {
    color: colors.ink,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumText: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 14,
  },
  stepDesc: {
    flex: 1,
    color: colors.ink,
    lineHeight: 22,
  },
  actionButtons: {
    marginTop: 8,
  },
  callBtn: {
    marginBottom: 12,
  },
  homeBtn: {
    borderColor: colors.line,
  },
});
