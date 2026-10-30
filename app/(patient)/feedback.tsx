import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';
import { useConsultationStore } from '../../store/consultationStore';
import { callEngine } from '../../engine/callEngine';
import {
  TopBar,
  Button,
  Card,
  RatingStars,
  Scale0To10,
  Chip,
} from '../../components';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react-native';

const TOTAL_QUESTIONS = 8;

const NEXT_STEPS_OPTIONS = [
  'Start or continue medicines',
  'Follow the diet plan',
  'Book lab tests',
  'Book a follow-up',
  'Not sure yet',
];

export default function FeedbackScreen() {
  const router = useRouter();
  const store = useConsultationStore();

  const [currentStep, setCurrentStep] = useState(1);

  // Form answers
  const [q1, setQ1] = useState<'Yes' | 'Partly' | 'No' | null>(null);
  const [q2, setQ2] = useState<number>(5);
  const [q3, setQ3] = useState<'Yes' | 'No' | null>(null);
  const [q4, setQ4] = useState<number>(4);
  const [q5, setQ5] = useState<string[]>(['Start or continue medicines']);
  const [q6, setQ6] = useState<string>('');
  const [q7, setQ7] = useState<'Good' | 'Some issues' | 'Poor' | null>('Good');
  const [q8, setQ8] = useState<number | null>(9);

  // Follow-up rule trigger
  const needsCareTeamFollowUp = q1 === 'Partly' || q1 === 'No' || (q4 && q4 <= 2);

  const handleNextStepToggle = (opt: string) => {
    if (q5.includes(opt)) {
      if (q5.length > 1) setQ5(q5.filter((o) => o !== opt));
    } else {
      setQ5([...q5, opt]);
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_QUESTIONS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finalizeFeedback();
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_QUESTIONS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finalizeFeedback();
    }
  };

  const finalizeFeedback = () => {
    // Save to store
    store.setFeedbackAnswer('problemResolved', q1);
    store.setFeedbackAnswer('guidanceRating', q2);
    store.setFeedbackAnswer('doctorUnderstood', q3);
    store.setFeedbackAnswer('confidenceRating', q4);
    store.setFeedbackAnswer('nextSteps', q5);
    store.setFeedbackAnswer('confidenceFeedback', q6);
    store.setFeedbackAnswer('callQuality', q7);
    store.setFeedbackAnswer('npsScore', q8);
    store.setFeedbackAnswer('submittedAt', Date.now());

    // Trigger the automated post-call summary generation pipeline
    callEngine.runPostCallPipeline();

    // Navigate to summary screen
    router.replace('/(patient)/summary');
  };

  return (
    <View style={styles.container}>
      <TopBar title="Consultation Feedback" showLogo={false} />

      {/* Progress Dots Indicator */}
      <View style={styles.progressRow}>
        {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              currentStep === i + 1
                ? styles.progressDotActive
                : currentStep > i + 1
                ? styles.progressDotCompleted
                : styles.progressDotInactive,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <Text style={[typography.caption, styles.stepCounterText]}>
            Question {currentStep} of {TOTAL_QUESTIONS}
          </Text>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Skip this question"
          >
            <Text style={[typography.smallBold, styles.skipText]}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Question 1: Problem resolved */}
        {currentStep === 1 && (
          <Card style={styles.questionCard}>
            <Text style={[typography.h1, styles.questionTitle]}>
              Was the problem you came with resolved?
            </Text>
            <Text style={[typography.body, styles.questionDesc]}>
              Your feedback helps our clinical leadership ensure quality care standards.
            </Text>

            <View style={styles.optionsList}>
              {(['Yes', 'Partly', 'No'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  onPress={() => setQ1(opt)}
                  accessibilityRole="button"
                  accessibilityLabel={`Option ${opt}`}
                  style={[
                    styles.choiceCard,
                    q1 === opt && styles.choiceCardSelected,
                  ]}
                >
                  <Text
                    style={[
                      typography.bodyBold,
                      q1 === opt ? styles.choiceTextSelected : styles.choiceTextNormal,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Question 2: Doctor guidance rating (1 to 5 stars) */}
        {currentStep === 2 && (
          <Card style={styles.questionCard}>
            <Text style={[typography.h1, styles.questionTitle]}>
              Was the doctor's guidance clear and right for you?
            </Text>
            <Text style={[typography.body, styles.questionDesc]}>
              Rate your clarity on dose instructions and lifestyle recommendations:
            </Text>
            <View style={styles.starsWrapper}>
              <RatingStars rating={q2} onRatingChange={setQ2} size={42} />
              <Text style={[typography.caption, styles.starLabel]}>
                {q2 === 5
                  ? '5 - Extremely clear & actionable'
                  : q2 >= 4
                  ? '4 - Very clear'
                  : q2 === 3
                  ? '3 - Moderately clear'
                  : 'Needs more explanation'}
              </Text>
            </View>
          </Card>
        )}

        {/* Question 3: Doctor understood concern */}
        {currentStep === 3 && (
          <Card style={styles.questionCard}>
            <Text style={[typography.h1, styles.questionTitle]}>
              Did the doctor understand your concern?
            </Text>
            <Text style={[typography.body, styles.questionDesc]}>
              Regarding your GLP-1 side effects, hydration and progress trajectory.
            </Text>

            <View style={styles.optionsList}>
              {(['Yes', 'No'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  onPress={() => setQ3(opt)}
                  accessibilityRole="button"
                  accessibilityLabel={`Option ${opt}`}
                  style={[
                    styles.choiceCard,
                    q3 === opt && styles.choiceCardSelected,
                  ]}
                >
                  <Text
                    style={[
                      typography.bodyBold,
                      q3 === opt ? styles.choiceTextSelected : styles.choiceTextNormal,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Question 4: Confidence rating (1 to 5) */}
        {currentStep === 4 && (
          <Card style={styles.questionCard}>
            <Text style={[typography.h1, styles.questionTitle]}>
              How confident do you feel about your treatment now?
            </Text>
            <Text style={[typography.body, styles.questionDesc]}>
              Regarding continuing your medication and daily targets:
            </Text>
            <View style={styles.starsWrapper}>
              <RatingStars rating={q4} onRatingChange={setQ4} size={42} />
              <Text style={[typography.caption, styles.starLabel]}>
                {q4 >= 4 ? 'Confident in my health plan' : 'Feeling uncertain or anxious'}
              </Text>
            </View>
          </Card>
        )}

        {/* Question 5: What will you do next */}
        {currentStep === 5 && (
          <Card style={styles.questionCard}>
            <Text style={[typography.h1, styles.questionTitle]}>
              What will you do next?
            </Text>
            <Text style={[typography.body, styles.questionDesc]}>
              Select all actions you plan to take following today's consultation:
            </Text>
            <View style={styles.multiSelectGrid}>
              {NEXT_STEPS_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  label={opt}
                  selected={q5.includes(opt)}
                  onPress={() => handleNextStepToggle(opt)}
                  style={styles.nextStepChip}
                />
              ))}
            </View>
          </Card>
        )}

        {/* Question 6: Free text */}
        {currentStep === 6 && (
          <Card style={styles.questionCard}>
            <Text style={[typography.h1, styles.questionTitle]}>
              What would make you more confident?
            </Text>
            <Text style={[typography.body, styles.questionDesc]}>
              Optional notes or requests for your dedicated health coach:
            </Text>
            <TextInput
              value={q6}
              onChangeText={setQ6}
              placeholder="E.g. A printed weekly meal calendar or call regarding anti-nausea tips..."
              multiline
              style={styles.textInputBox}
            />
          </Card>
        )}

        {/* Question 7: Call quality */}
        {currentStep === 7 && (
          <Card style={styles.questionCard}>
            <Text style={[typography.h1, styles.questionTitle]}>
              How was the call audio & video quality?
            </Text>
            <Text style={[typography.body, styles.questionDesc]}>
              Helps us calibrate our adaptive connection engine:
            </Text>
            <View style={styles.optionsList}>
              {(['Good', 'Some issues', 'Poor'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  onPress={() => setQ7(opt)}
                  accessibilityRole="button"
                  accessibilityLabel={`Option ${opt}`}
                  style={[
                    styles.choiceCard,
                    q7 === opt && styles.choiceCardSelected,
                  ]}
                >
                  <Text
                    style={[
                      typography.bodyBold,
                      q7 === opt ? styles.choiceTextSelected : styles.choiceTextNormal,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Question 8: NPS (0 to 10) */}
        {currentStep === 8 && (
          <Card style={styles.questionCard}>
            <Text style={[typography.h1, styles.questionTitle]}>
              How likely are you to recommend us to a friend or family member?
            </Text>
            <Scale0To10 value={q8} onSelect={setQ8} />
          </Card>
        )}

        {/* Follow-up rule notification */}
        {needsCareTeamFollowUp && (
          <Card variant="tint" style={styles.careTeamBanner}>
            <View style={styles.careTeamRow}>
              <HeartHandshake size={20} color={colors.accentStrong} />
              <View style={styles.careTeamTextCol}>
                <Text style={[typography.bodyBold, styles.careTeamTitle]}>
                  Our care team will reach out today
                </Text>
                <Text style={[typography.small, styles.careTeamDesc]}>
                  Because your concern was not fully resolved, a dedicated clinical nurse will follow up via phone to support you.
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Footer Next Button */}
      <View style={styles.footer}>
        <Button
          title={currentStep === TOTAL_QUESTIONS ? 'Submit Feedback' : 'Next Question'}
          onPress={handleNext}
          variant="primary"
          size="large"
          icon={<ArrowRight size={18} color={colors.ink} />}
          iconPosition="right"
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
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.accent,
  },
  progressDotCompleted: {
    width: 14,
    backgroundColor: colors.accentSoft,
  },
  progressDotInactive: {
    width: 8,
    backgroundColor: colors.line,
  },
  content: {
    padding: spacing.base,
    paddingBottom: 110,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepCounterText: {
    color: colors.inkSecondary,
    fontWeight: '700',
  },
  skipBtn: {
    padding: 6,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: colors.inkSecondary,
  },
  questionCard: {
    padding: 20,
    marginBottom: 20,
  },
  questionTitle: {
    color: colors.ink,
    marginBottom: 8,
  },
  questionDesc: {
    color: colors.inkSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  optionsList: {
    marginTop: 8,
  },
  choiceCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginBottom: 10,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceTint,
  },
  choiceTextNormal: {
    color: colors.ink,
  },
  choiceTextSelected: {
    color: colors.ink,
    fontWeight: '800',
  },
  starsWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  starLabel: {
    color: colors.inkSecondary,
    marginTop: 8,
  },
  multiSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nextStepChip: {
    marginBottom: 10,
  },
  textInputBox: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    padding: 14,
    color: colors.ink,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  careTeamBanner: {
    marginBottom: 16,
    borderColor: colors.accentStrong,
  },
  careTeamRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  careTeamTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  careTeamTitle: {
    color: colors.accentStrong,
  },
  careTeamDesc: {
    color: colors.ink,
    marginTop: 3,
    lineHeight: 20,
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
});
