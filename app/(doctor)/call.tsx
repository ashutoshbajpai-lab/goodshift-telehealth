import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Line, Circle, Rect, Polyline, Text as SvgText } from 'react-native-svg';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';
import { useConsultationStore, PrescriptionItem } from '../../store/consultationStore';
import { mockPatient } from '../../mock/patient';
import { mockWeightHistory, mockMealPhotos, mockLabReports } from '../../mock/metrics';
import { mockConsultations } from '../../mock/consultations';
import {
  TopBar,
  Button,
  Card,
  Chip,
  BottomSheet,
  StatusDot,
  Toast,
} from '../../components';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Shield,
  Share2,
  FileText,
  TrendingDown,
  Activity,
  History,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  RotateCw,
  Search,
  Sparkles,
  PhoneOff,
  Check,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react-native';

const REASON_SUGGESTIONS = [
  'Weight plateau',
  'GLP-1 dose review',
  'Side effects',
  'Lab review',
  'Comorbidities',
  'Diet and nutrition',
  'Activity and sleep',
  'Mental wellbeing',
];

const PREDEFINED_KEY_POINTERS = [
  'Drink at least 3 litres of room temperature water daily.',
  'Split morning meals into two smaller protein-rich portions.',
  'Maintain Semaglutide 0.5 mg injection every Tuesday morning.',
  'Avoid heavy or high-fat meals on injection evening.',
  'Report any severe acute abdominal pain immediately to emergency.',
];

export default function DoctorWorkspaceScreen() {
  const router = useRouter();
  const store = useConsultationStore();
  const { width } = useWindowDimensions();

  // Active tab on right panel
  const [activeTab, setActiveTab] = useState<
    'metrics' | 'graphs' | 'history' | 'documents' | 'notes' | 'prescription' | 'pointers' | 'summary' | 'chat'
  >('metrics');

  // Reason search text
  const [reasonQuery, setReasonQuery] = useState('');
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);

  // Graph state
  const [graphTimeframe, setGraphTimeframe] = useState<'4w' | '12w' | 'all'>('12w');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(11);

  // New prescription form state
  const [newMedName, setNewMedName] = useState('Semaglutide 0.5 mg pen');
  const [newMedDose, setNewMedDose] = useState('0.5 mg Subcutaneous');
  const [newMedFreq, setNewMedFreq] = useState('Once weekly');
  const [newMedDuration, setNewMedDuration] = useState('4 weeks');
  const [newMedReason, setNewMedReason] = useState('Maintain step 2 stabilization');

  // Chat message input
  const [chatInput, setChatInput] = useState('');

  // Wrap-up modal
  const [wrapUpModalOpen, setWrapUpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Full-screen document preview modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [docRotation, setDocRotation] = useState(0);

  // Check if patient uploads changed to trigger toast
  useEffect(() => {
    const unreviewed = store.uploadedDocs.filter((d) => d.isNew);
    if (unreviewed.length > 0) {
      setToastMessage(`Patient uploaded new report: ${unreviewed[0].title}`);
    }
  }, [store.uploadedDocs]);

  const handleSelectReason = (reason: string) => {
    store.toggleReason(reason);
    setReasonQuery('');
    setShowReasonDropdown(false);
  };

  const handleShareGraphWithPatient = () => {
    store.setDoctorSharedItem({
      type: 'graph',
      title: '12-Week Weight & Dose Trajectory',
      details:
        'Your physician shared your 12-week GLP-1 weight trend chart (-6 kg loss, steady titration at 0.5 mg). Goal target: 72 kg.',
    });
    setToastMessage('Graph pushed to patient screen');
  };

  const handleSendDoctorChat = () => {
    if (!chatInput.trim()) return;
    store.addChatMessage({
      sender: 'doctor',
      text: chatInput.trim(),
    });
    setChatInput('');
  };

  const handleAddPrescription = () => {
    if (!newMedName) return;
    store.addPrescriptionItem({
      medicineName: newMedName,
      dosage: newMedDose,
      frequency: newMedFreq,
      duration: newMedDuration,
      instructions: newMedReason,
      indication: 'GLP-1 Weight Management',
    });
    setToastMessage('Added medicine to prescription');
  };

  const handleCompleteVisit = () => {
    // Check SOAP completeness rule
    if (!store.soapNotes.subjective || !store.soapNotes.assessment || !store.soapNotes.plan) {
      Alert.alert(
        'Incomplete Clinical Notes',
        'Telemedicine guidelines require Subjective, Assessment, and Plan to be completed before finishing the visit.',
        [{ text: 'Review Notes' }]
      );
      return;
    }

    setWrapUpModalOpen(false);
    store.endCall('doctor');
    router.replace('/(doctor)');
  };

  // SVG Weight Graph Calculations
  const chartWeeks = mockWeightHistory;
  const svgWidth = 440;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const minWeight = 70;
  const maxWeight = 90;

  const points = chartWeeks.map((entry, idx) => {
    const x = paddingX + (idx / (chartWeeks.length - 1)) * (svgWidth - paddingX * 2);
    const y =
      svgHeight -
      paddingY -
      ((entry.weightKg - minWeight) / (maxWeight - minWeight)) * (svgHeight - paddingY * 2);
    return { x, y, entry, idx };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const goalY =
    svgHeight -
    paddingY -
    ((72 - minWeight) / (maxWeight - minWeight)) * (svgHeight - paddingY * 2);

  const selectedWeekData = chartWeeks[selectedWeekIndex];

  return (
    <View style={styles.container}>
      {/* Top Tablet Header Strip */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={[typography.h2, styles.headerPatientTitle]}>
            Patient: {mockPatient.name} ({mockPatient.age}y, {mockPatient.gender.toUpperCase()})
          </Text>
          <Text style={[typography.caption, styles.headerSub]}>
            CID: {store.currentConsultationId} • Program: {mockPatient.programName}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <StatusDot
            status={store.networkQuality}
            size={10}
            label={`Net: ${store.networkQuality.toUpperCase()}`}
          />
          <View style={styles.timeCounter}>
            <Text style={styles.timeCounterText}>
              Duration: {Math.floor(store.callDurationSeconds / 60)}:
              {(store.callDurationSeconds % 60).toString().padStart(2, '0')}
            </Text>
          </View>
          <Button
            title="End Visit"
            variant="danger"
            size="small"
            onPress={() => setWrapUpModalOpen(true)}
            style={styles.headerEndBtn}
          />
        </View>
      </View>

      {/* Main Workspace Split: Left 40% (Video), Right 60% (Tabbed Panel) */}
      <View style={styles.workspaceBody}>
        {/* ================= LEFT 40%: VIDEO & VITALS ================= */}
        <View style={styles.leftCol}>
          {/* Patient Video Box */}
          <View style={styles.patientVideoWrapper}>
            {store.isPatientCameraOff || store.callMode === 'audio' ? (
              <View style={styles.patientAvatarFallback}>
                <View style={styles.patientInitialsCircle}>
                  <Text style={styles.patientInitialsText}>PS</Text>
                </View>
                <Text style={[typography.bodyBold, styles.patientNameText]}>
                  {mockPatient.name}
                </Text>
                <Text style={[typography.caption, styles.patientModeNotice]}>
                  {store.callMode === 'audio'
                    ? 'Audio-Only Mode'
                    : 'Patient Video is Paused'}
                </Text>
              </View>
            ) : (
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
                }}
                style={styles.patientFeedImage}
                resizeMode="cover"
              />
            )}

            {/* Doctor Self-View Inset */}
            <View style={styles.doctorSelfInset}>
              <Image
                source={{ uri: store.activeDoctor?.avatar }}
                style={styles.doctorSelfImage}
              />
              <Text style={styles.selfLabel}>You</Text>
            </View>

            {/* Live Patient State Badges (Synchronized from Store) */}
            <View style={styles.patientStateBadges}>
              {store.isPatientMuted && (
                <View style={styles.stateBadgeRed}>
                  <MicOff size={12} color={colors.accentStrong} />
                  <Text style={styles.stateBadgeText}>Patient Muted</Text>
                </View>
              )}
              {store.isPatientCameraOff && (
                <View style={styles.stateBadgeRed}>
                  <VideoOff size={12} color={colors.accentStrong} />
                  <Text style={styles.stateBadgeText}>Video Off</Text>
                </View>
              )}
              {store.callMode === 'audio' && (
                <View style={styles.stateBadgeAmber}>
                  <Text style={styles.stateBadgeText}>Switched to Audio</Text>
                </View>
              )}
              {!store.isRecordingOn && (
                <View style={styles.stateBadgeAmber}>
                  <Text style={styles.stateBadgeText}>Recording Off</Text>
                </View>
              )}
              {store.callState === 'reconnecting' && (
                <View style={styles.stateBadgeRed}>
                  <RotateCw size={12} color={colors.accentStrong} />
                  <Text style={styles.stateBadgeText}>Reconnecting...</Text>
                </View>
              )}
            </View>

            {/* Floating Reaction Overlay (Live from Patient) */}
            {store.activeReaction && (
              <View style={styles.doctorReactionOverlay}>
                <Text style={{ fontSize: 36 }}>{store.activeReaction}</Text>
              </View>
            )}
          </View>

          {/* Doctor Video Controls */}
          <View style={styles.doctorControlsRow}>
            <TouchableOpacity
              onPress={() => store.toggleDoctorMute()}
              style={[styles.docCtrlBtn, store.isDoctorMuted && styles.docCtrlBtnActive]}
            >
              {store.isDoctorMuted ? (
                <MicOff size={18} color={colors.accentStrong} />
              ) : (
                <Mic size={18} color={colors.ink} />
              )}
              <Text style={styles.docCtrlLabel}>
                {store.isDoctorMuted ? 'Unmute' : 'Mute'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => store.toggleDoctorCamera()}
              style={[styles.docCtrlBtn, store.isDoctorCameraOff && styles.docCtrlBtnActive]}
            >
              {store.isDoctorCameraOff ? (
                <VideoOff size={18} color={colors.accentStrong} />
              ) : (
                <Video size={18} color={colors.ink} />
              )}
              <Text style={styles.docCtrlLabel}>
                {store.isDoctorCameraOff ? 'Cam On' : 'Cam Off'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                store.setDoctorBrandedBackground(!store.doctorBrandedBackgroundOn)
              }
              style={[
                styles.docCtrlBtn,
                store.doctorBrandedBackgroundOn && styles.docCtrlBtnActive,
              ]}
            >
              <Shield size={18} color={colors.ink} />
              <Text style={styles.docCtrlLabel}>Branded BG</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShareGraphWithPatient}
              style={styles.docCtrlBtn}
            >
              <Share2 size={18} color={colors.ink} />
              <Text style={styles.docCtrlLabel}>Share Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Patient Clinical Snapshot Strip */}
          <Card style={styles.snapshotCard} variant="tint">
            <View style={styles.snapshotGrid}>
              <View style={styles.snapshotCell}>
                <Text style={[typography.caption, styles.snapshotLabel]}>BMI</Text>
                <Text style={[typography.bodyBold, styles.snapshotVal]}>
                  {mockPatient.startBmi} → {mockPatient.currentBmi}
                </Text>
              </View>
              <View style={styles.snapshotCell}>
                <Text style={[typography.caption, styles.snapshotLabel]}>WEIGHT</Text>
                <Text style={[typography.bodyBold, styles.snapshotVal]}>
                  {mockPatient.currentWeightKg} kg / Goal {mockPatient.goalWeightKg}
                </Text>
              </View>
              <View style={styles.snapshotCell}>
                <Text style={[typography.caption, styles.snapshotLabel]}>DOSE</Text>
                <Text style={[typography.bodyBold, styles.snapshotVal]}>
                  Step 2 (0.5 mg)
                </Text>
              </View>
              <View style={styles.snapshotCell}>
                <Text style={[typography.caption, styles.snapshotLabel]}>ADHERENCE</Text>
                <Text style={[typography.bodyBold, styles.snapshotVal]}>
                  {mockPatient.adherencePercent}%
                </Text>
              </View>
            </View>
          </Card>

          {/* Active Clinical Alerts Row */}
          <View style={styles.alertsRow}>
            <View style={styles.alertChipRed}>
              <AlertTriangle size={14} color={colors.accentStrong} />
              <Text style={styles.alertChipRedText}>
                Side Effect: Nausea (2x this week)
              </Text>
            </View>
            <View style={styles.alertChipAmber}>
              <Activity size={14} color={colors.ink} />
              <Text style={styles.alertChipAmberText}>
                Hydration: Low (1.8 L / day)
              </Text>
            </View>
          </View>
        </View>

        {/* ================= RIGHT 60%: TABBED CLINICAL PANEL ================= */}
        <View style={styles.rightCol}>
          {/* Panel Tab Navigation Bar */}
          <View style={styles.tabsBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { id: 'metrics', label: 'Metrics' },
                { id: 'graphs', label: 'Graphs' },
                { id: 'history', label: 'History' },
                {
                  id: 'documents',
                  label: `Docs (${store.uploadedDocs.length})`,
                },
                { id: 'notes', label: 'SOAP Notes' },
                {
                  id: 'prescription',
                  label: `Rx (${store.prescriptionList.length})`,
                },
                {
                  id: 'pointers',
                  label: `Pointers (${store.keyPointersList.length})`,
                },
                { id: 'summary', label: 'Summary' },
                { id: 'chat', label: `Chat (${store.chatMessages.length})` },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  style={[
                    styles.tabButton,
                    activeTab === tab.id && styles.tabButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      typography.smallBold,
                      activeTab === tab.id
                        ? styles.tabTextActive
                        : styles.tabTextInactive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tab Content Container */}
          <View style={styles.tabContentArea}>
            {/* 1. METRICS TAB */}
            {activeTab === 'metrics' && (
              <ScrollView style={styles.tabScroll}>
                {/* Reason Search Box with Multiselect Suggestions */}
                <View style={styles.reasonSearchContainer}>
                  <Text style={[typography.smallBold, styles.reasonLabel]}>
                    Consultation Reasons & Focus:
                  </Text>
                  <View style={styles.searchRow}>
                    <Search size={16} color={colors.inkSecondary} />
                    <TextInput
                      value={reasonQuery}
                      onChangeText={(t) => {
                        setReasonQuery(t);
                        setShowReasonDropdown(true);
                      }}
                      onFocus={() => setShowReasonDropdown(true)}
                      placeholder="Type the reason or problem (e.g. Weight plateau, Side effects)..."
                      style={styles.reasonInput}
                    />
                  </View>

                  {/* Active Selected Reason Chips */}
                  <View style={styles.activeReasonChips}>
                    {store.selectedReasons.map((reason) => (
                      <Chip
                        key={reason}
                        label={reason}
                        selected
                        onPress={() => store.toggleReason(reason)}
                      />
                    ))}
                  </View>

                  {/* Dropdown Suggestions */}
                  {showReasonDropdown && (
                    <Card style={styles.dropdownCard}>
                      <Text style={[typography.caption, styles.dropdownTitle]}>
                        SUGGESTED CLINICAL TOPICS:
                      </Text>
                      {REASON_SUGGESTIONS.map((sug) => {
                        const isChosen = store.selectedReasons.includes(sug);
                        return (
                          <TouchableOpacity
                            key={sug}
                            onPress={() => handleSelectReason(sug)}
                            style={styles.dropdownItem}
                          >
                            <Text
                              style={[
                                typography.small,
                                isChosen ? styles.sugChosen : styles.sugNormal,
                              ]}
                            >
                              {isChosen ? '✓ ' : '+ '}
                              {sug}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </Card>
                  )}
                </View>

                {/* Metric Cards dynamically shown based on selected reasons */}
                <View style={styles.metricCardsGrid}>
                  {/* Weight Metric Card */}
                  {(store.selectedReasons.includes('Weight plateau') ||
                    store.selectedReasons.length === 0) && (
                    <Card style={styles.metricCard}>
                      <View style={styles.metricCardHeader}>
                        <Text style={[typography.bodyBold, styles.metricCardTitle]}>
                          Weight & Adiposity
                        </Text>
                        <View style={styles.plateauChip}>
                          <Text style={styles.plateauText}>Plateau Flag (8d)</Text>
                        </View>
                      </View>
                      <Text style={[typography.h1, styles.metricCardBigVal]}>
                        83.0 kg
                      </Text>
                      <Text style={[typography.small, styles.metricCardDesc]}>
                        Start: 89.0 kg • Net loss: -6.0 kg • Weekly average: -0.5 kg
                      </Text>
                    </Card>
                  )}

                  {/* Medication & GLP-1 Card */}
                  {(store.selectedReasons.includes('GLP-1 dose review') ||
                    store.selectedReasons.length === 0) && (
                    <Card style={styles.metricCard}>
                      <Text style={[typography.bodyBold, styles.metricCardTitle]}>
                        GLP-1 Prescription Schedule
                      </Text>
                      <Text style={[typography.h1, styles.metricCardBigVal]}>
                        Semaglutide 0.5 mg
                      </Text>
                      <Text style={[typography.small, styles.metricCardDesc]}>
                        Step 2 Titration • Last dose: Yesterday • Next dose: Tomorrow
                      </Text>
                    </Card>
                  )}

                  {/* Side Effects Card */}
                  {(store.selectedReasons.includes('Side effects') ||
                    store.selectedReasons.length === 0) && (
                    <Card style={styles.metricCard} variant="tint">
                      <Text style={[typography.bodyBold, styles.metricCardTitle]}>
                        Logged Gastrointestinal Symptoms
                      </Text>
                      <Text style={[typography.smallBold, { color: colors.accentStrong, marginTop: 4 }]}>
                        • Mild Nausea: Oct 28 & Oct 22 (Morning after injection)
                      </Text>
                      <Text style={[typography.small, { color: colors.ink, marginTop: 2 }]}>
                        • Mild Constipation: Oct 25 (Hydration deficit)
                      </Text>
                    </Card>
                  )}

                  {/* Labs Metric Card */}
                  {(store.selectedReasons.includes('Lab review') ||
                    store.selectedReasons.length === 0) && (
                    <Card style={styles.metricCard}>
                      <Text style={[typography.bodyBold, styles.metricCardTitle]}>
                        Metabolic Biomarkers
                      </Text>
                      <View style={styles.labRowSummary}>
                        <Text style={typography.small}>HbA1c: 6.4% → 5.8% (Improved)</Text>
                        <Text style={typography.small}>Fasting Glucose: 118 → 98 mg/dL</Text>
                        <Text style={typography.small}>Total Cholesterol: 228 → 194 mg/dL</Text>
                      </View>
                    </Card>
                  )}
                </View>
              </ScrollView>
            )}

            {/* 2. GRAPHS TAB */}
            {activeTab === 'graphs' && (
              <ScrollView style={styles.tabScroll}>
                <View style={styles.graphHeaderRow}>
                  <Text style={[typography.h2, styles.graphTitle]}>
                    Weight & Titration Trajectory (12 Weeks)
                  </Text>
                  <Button
                    title="Share with patient"
                    variant="surface"
                    size="small"
                    icon={<Share2 size={14} color={colors.ink} />}
                    onPress={handleShareGraphWithPatient}
                  />
                </View>

                {/* SVG Graph Component */}
                <Card style={styles.svgCard}>
                  <Svg width={svgWidth} height={svgHeight}>
                    {/* Goal Band in accentSoft */}
                    <Rect
                      x={paddingX}
                      y={goalY - 14}
                      width={svgWidth - paddingX * 2}
                      height={28}
                      fill={colors.accentSoft}
                      opacity={0.35}
                    />
                    <SvgText
                      x={svgWidth - paddingX - 4}
                      y={goalY + 4}
                      fill={colors.inkSecondary}
                      fontSize="10"
                      textAnchor="end"
                    >
                      Goal Band (72kg)
                    </SvgText>

                    {/* Trend Line in accent */}
                    <Polyline
                      points={polylinePoints}
                      fill="none"
                      stroke={colors.accent}
                      strokeWidth="3"
                    />

                    {/* Data Points */}
                    {points.map((p) => {
                      const isSelected = p.idx === selectedWeekIndex;
                      return (
                        <Circle
                          key={p.idx}
                          cx={p.x}
                          cy={p.y}
                          r={isSelected ? '6' : '4'}
                          fill={isSelected ? colors.accentStrong : colors.ink}
                          onPress={() => setSelectedWeekIndex(p.idx)}
                        />
                      );
                    })}
                  </Svg>

                  <Text style={[typography.caption, styles.graphHint]}>
                    Tap any week node to inspect correlating diet, steps & notes
                  </Text>
                </Card>

                {/* Selected Point Clinical Detail Card */}
                {selectedWeekData && (
                  <Card variant="tint" style={styles.weekDetailCard}>
                    <Text style={[typography.h2, styles.weekDetailTitle]}>
                      Week {selectedWeekData.week} Details ({selectedWeekData.date})
                    </Text>
                    <View style={styles.weekGrid}>
                      <Text style={typography.small}>
                        <Text style={typography.smallBold}>Weight:</Text>{' '}
                        {selectedWeekData.weightKg} kg
                      </Text>
                      <Text style={typography.small}>
                        <Text style={typography.smallBold}>Dose:</Text>{' '}
                        {selectedWeekData.doseMg} mg
                      </Text>
                      <Text style={typography.small}>
                        <Text style={typography.smallBold}>Avg Steps:</Text>{' '}
                        {selectedWeekData.avgDailySteps} / day
                      </Text>
                      <Text style={typography.small}>
                        <Text style={typography.smallBold}>Meals Logged:</Text>{' '}
                        {selectedWeekData.mealsLogged}
                      </Text>
                    </View>
                    <Text style={[typography.small, { marginTop: 6, color: colors.ink }]}>
                      <Text style={typography.smallBold}>Clinical Note:</Text>{' '}
                      {selectedWeekData.notes}
                    </Text>
                  </Card>
                )}
              </ScrollView>
            )}

            {/* 3. HISTORY TAB */}
            {activeTab === 'history' && (
              <ScrollView style={styles.tabScroll}>
                <Text style={[typography.h2, styles.historyTabHeader]}>
                  Past Teleconsultation Records ({mockConsultations.length})
                </Text>
                {mockConsultations.map((c) => (
                  <Card key={c.id} style={styles.historyItemCard}>
                    <View style={styles.historyItemTop}>
                      <View>
                        <Text style={[typography.bodyBold, styles.historyDocName]}>
                          {c.doctorName}
                        </Text>
                        <Text style={[typography.caption, styles.historyDate]}>
                          {c.date} • {c.time} ({c.durationMinutes} mins)
                        </Text>
                      </View>
                      <View style={styles.historyBadge}>
                        <Text style={styles.historyBadgeText}>{c.id}</Text>
                      </View>
                    </View>
                    <Text style={[typography.smallBold, styles.historyReason]}>
                      Reason: {c.reason}
                    </Text>
                    <Text style={[typography.small, styles.historySummary]}>
                      {c.summary}
                    </Text>
                  </Card>
                ))}
              </ScrollView>
            )}

            {/* 4. DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <ScrollView style={styles.tabScroll}>
                <View style={styles.docHeaderRow}>
                  <Text style={[typography.h2, styles.docTabTitle]}>
                    Patient Uploads & Clinical Documents
                  </Text>
                  <Text style={[typography.caption, { color: colors.inkSecondary }]}>
                    Real-time feed
                  </Text>
                </View>

                {store.uploadedDocs.map((doc) => (
                  <Card key={doc.id} style={styles.docCard}>
                    <View style={styles.docCardRow}>
                      <FileText size={24} color={colors.ink} />
                      <View style={styles.docCardInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={[typography.bodyBold, styles.docCardTitle]}>
                            {doc.title}
                          </Text>
                          {doc.isNew && (
                            <View style={styles.docNewBadge}>
                              <Text style={styles.docNewText}>New</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[typography.caption, styles.docCardMeta]}>
                          Uploaded {doc.uploadedAt} • Status:{' '}
                          {doc.reviewed ? 'Reviewed' : 'Pending Review'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.docActionsRow}>
                      <Button
                        title="View Full Document"
                        variant="surface"
                        size="small"
                        onPress={() => setPreviewDoc(doc)}
                        style={{ marginRight: 8 }}
                      />
                      {!doc.reviewed && (
                        <Button
                          title="Mark Reviewed"
                          variant="secondary"
                          size="small"
                          onPress={() => store.markDocReviewed(doc.id)}
                        />
                      )}
                    </View>
                  </Card>
                ))}
              </ScrollView>
            )}

            {/* 5. NOTES TAB (SOAP Autosave) */}
            {activeTab === 'notes' && (
              <ScrollView style={styles.tabScroll}>
                <View style={styles.notesHeaderRow}>
                  <Text style={[typography.h2, styles.notesTitle]}>
                    SOAP Clinical Consultation Notes
                  </Text>
                  <View style={styles.autosaveBadge}>
                    <Check size={12} color={colors.success} />
                    <Text style={styles.autosaveText}>
                      Autosaved: {store.soapNotes.lastSavedAt}
                    </Text>
                  </View>
                </View>

                {/* Subjective */}
                <Text style={[typography.smallBold, styles.soapLabel]}>
                  S — Subjective (Patient Reported Concerns)
                </Text>
                <TextInput
                  value={store.soapNotes.subjective}
                  onChangeText={(t) => store.updateSOAPNotes('subjective', t)}
                  multiline
                  style={styles.soapInput}
                />

                {/* Objective */}
                <Text style={[typography.smallBold, styles.soapLabel]}>
                  O — Objective (Biometrics, Dose, Lab Findings)
                </Text>
                <TextInput
                  value={store.soapNotes.objective}
                  onChangeText={(t) => store.updateSOAPNotes('objective', t)}
                  multiline
                  style={styles.soapInput}
                />

                {/* Assessment */}
                <Text style={[typography.smallBold, styles.soapLabel]}>
                  A — Assessment (Clinical Diagnosis & Progression)
                </Text>
                <TextInput
                  value={store.soapNotes.assessment}
                  onChangeText={(t) => store.updateSOAPNotes('assessment', t)}
                  multiline
                  style={styles.soapInput}
                />

                {/* Plan */}
                <Text style={[typography.smallBold, styles.soapLabel]}>
                  P — Plan (Titration, Hydration, Lab Tests, Cadence)
                </Text>
                <TextInput
                  value={store.soapNotes.plan}
                  onChangeText={(t) => store.updateSOAPNotes('plan', t)}
                  multiline
                  style={styles.soapInput}
                />
              </ScrollView>
            )}

            {/* 6. PRESCRIPTION TAB */}
            {activeTab === 'prescription' && (
              <ScrollView style={styles.tabScroll}>
                <Text style={[typography.h2, styles.rxHeader]}>
                  Prescription Management (e-Prescription)
                </Text>

                {/* Existing Prescribed Medicines */}
                {store.prescriptionList.map((item, idx) => (
                  <Card key={idx} style={styles.rxCard}>
                    <View style={styles.rxCardTop}>
                      <View>
                        <Text style={[typography.bodyBold, styles.rxMedName]}>
                          {item.medicineName}
                        </Text>
                        <Text style={[typography.caption, styles.rxMedDose]}>
                          {item.dosage} • {item.frequency} for {item.duration}
                        </Text>
                        <Text style={[typography.caption, styles.rxInst]}>
                          Instructions: {item.instructions}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => store.removePrescriptionItem(idx)}
                        style={styles.rxDeleteBtn}
                      >
                        <Trash2 size={16} color={colors.accentStrong} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}

                {/* Add New Medicine Form */}
                <Card variant="tint" style={styles.addMedCard}>
                  <Text style={[typography.bodyBold, styles.addMedTitle]}>
                    Add Medicine / GLP-1 Pen
                  </Text>
                  <TextInput
                    value={newMedName}
                    onChangeText={setNewMedName}
                    placeholder="Medicine Name (e.g. Semaglutide 0.5mg)"
                    style={styles.formInput}
                  />
                  <TextInput
                    value={newMedDose}
                    onChangeText={setNewMedDose}
                    placeholder="Dosage (e.g. 0.5mg SC)"
                    style={styles.formInput}
                  />
                  <TextInput
                    value={newMedReason}
                    onChangeText={setNewMedReason}
                    placeholder="Reason for dose change / instruction"
                    style={styles.formInput}
                  />
                  <Button
                    title="Add to Prescription"
                    variant="primary"
                    size="small"
                    onPress={handleAddPrescription}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </ScrollView>
            )}

            {/* 7. KEY POINTERS TAB */}
            {activeTab === 'pointers' && (
              <ScrollView style={styles.tabScroll}>
                <Text style={[typography.h2, styles.pointersTitle]}>
                  Plain-Language Key Pointers for Patient
                </Text>
                <Text style={[typography.caption, styles.pointersDesc]}>
                  Sent directly to the patient summary card after visit ends.
                </Text>

                {store.keyPointersList.map((point, index) => (
                  <View key={index} style={styles.pointerRow}>
                    <Text style={[typography.body, styles.pointerText]}>
                      • {point}
                    </Text>
                    <TouchableOpacity
                      onPress={() => store.removeKeyPointer(index)}
                      style={styles.pointerDel}
                    >
                      <Trash2 size={14} color={colors.inkSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}

                <Text style={[typography.smallBold, styles.sugPointersHeader]}>
                  One-Tap Quick Suggestions:
                </Text>
                {PREDEFINED_KEY_POINTERS.map((sug, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => store.addKeyPointer(sug)}
                    style={styles.sugPointerItem}
                  >
                    <Plus size={14} color={colors.ink} />
                    <Text style={[typography.small, styles.sugPointerText]}>
                      {sug}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* 8. SUMMARY PREVIEW TAB */}
            {activeTab === 'summary' && (
              <ScrollView style={styles.tabScroll}>
                <Text style={[typography.h2, styles.summaryHeader]}>
                  Automated Transcription & Summary
                </Text>
                <Card variant="tint" style={styles.summaryInfoCard}>
                  <Text style={[typography.bodyBold, styles.summaryService]}>
                    Engine: Fireflies Telehealth Transcriber (v2.4)
                  </Text>
                  <Text style={[typography.small, styles.summaryStatus]}>
                    Status:{' '}
                    {store.isRecordingOn
                      ? 'Recording in progress. AI summary pipeline will trigger upon End Visit.'
                      : 'Recording disabled by patient. Summary will compile directly from your SOAP notes.'}
                  </Text>
                </Card>
              </ScrollView>
            )}

            {/* 9. CHAT TAB */}
            {activeTab === 'chat' && (
              <View style={styles.chatTabContainer}>
                <ScrollView style={styles.chatMessagesScroll}>
                  {store.chatMessages.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        styles.doctorChatBubble,
                        msg.sender === 'doctor'
                          ? styles.bubbleDoctorSender
                          : styles.bubblePatientSender,
                      ]}
                    >
                      <Text style={[typography.caption, styles.chatSenderName]}>
                        {msg.sender === 'doctor' ? 'You (Physician)' : mockPatient.name} •{' '}
                        {msg.timestamp}
                      </Text>
                      <Text style={[typography.body, styles.chatMsgBody]}>
                        {msg.text}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.chatInputRow}>
                  <TextInput
                    value={chatInput}
                    onChangeText={setChatInput}
                    placeholder="Send a clinical instruction or answer..."
                    style={styles.doctorChatInput}
                  />
                  <TouchableOpacity
                    onPress={handleSendDoctorChat}
                    style={styles.chatSendButton}
                  >
                    <Send size={18} color={colors.ink} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Quick Actions Footer Pinned at Bottom of Right Panel */}
          <View style={styles.quickActionsBar}>
            <Button
              title="Order Labs"
              variant="surface"
              size="small"
              onPress={() => setToastMessage('Ordered Fasting Glucose & Lipids')}
              style={styles.qaBtn}
            />
            <Button
              title="Schedule Follow-up"
              variant="surface"
              size="small"
              onPress={() => setToastMessage('Follow-up queued for 4 weeks')}
              style={styles.qaBtn}
            />
            <Button
              title="Assign Education"
              variant="surface"
              size="small"
              onPress={() => setToastMessage('Assigned GLP-1 Nausea SOP to patient')}
              style={styles.qaBtn}
            />
            <Button
              title="End Visit & Sign"
              variant="danger"
              size="small"
              onPress={() => setWrapUpModalOpen(true)}
              style={styles.qaEndBtn}
            />
          </View>
        </View>
      </View>

      {/* Wrap-up / End Visit Modal */}
      <BottomSheet
        visible={wrapUpModalOpen}
        onClose={() => setWrapUpModalOpen(false)}
        title="Complete Visit & Sign Consultation Record"
        subtitle="Verify clinical notes and prescription before submitting"
      >
        <View style={styles.wrapUpContent}>
          <View style={styles.wrapUpCheckItem}>
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={[typography.bodyBold, styles.wrapUpCheckText]}>
              SOAP Notes Complete (Subjective, Objective, Assessment, Plan)
            </Text>
          </View>

          <View style={styles.wrapUpCheckItem}>
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={[typography.bodyBold, styles.wrapUpCheckText]}>
              Prescription Electronically Signed (Dr. Ananya Sen, MMC 2017/08/3412)
            </Text>
          </View>

          <View style={styles.wrapUpCheckItem}>
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={[typography.bodyBold, styles.wrapUpCheckText]}>
              Key Pointers Confirmed ({store.keyPointersList.length} points)
            </Text>
          </View>

          <Button
            title="Next Patient (Finish Visit)"
            variant="primary"
            size="large"
            onPress={handleCompleteVisit}
            style={styles.finishVisitBtn}
          />
        </View>
      </BottomSheet>

      {/* Document Full View Modal */}
      <BottomSheet
        visible={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || 'Document Preview'}
      >
        <View style={styles.docPreviewBody}>
          <TouchableOpacity
            onPress={() => setDocRotation((prev) => (prev + 90) % 360)}
            style={styles.rotateDocBtn}
          >
            <RotateCw size={16} color={colors.ink} />
            <Text style={styles.rotateDocText}>Rotate ({docRotation}°)</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: previewDoc?.url }}
            style={[styles.previewImage, { transform: [{ rotate: `${docRotation}deg` }] }]}
            resizeMode="contain"
          />
        </View>
      </BottomSheet>

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
  topHeader: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg,
  },
  headerLeft: {
    flex: 1,
  },
  headerPatientTitle: {
    color: colors.ink,
  },
  headerSub: {
    color: colors.inkSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeCounter: {
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.chip,
    marginHorizontal: 10,
  },
  timeCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  headerEndBtn: {
    minHeight: 36,
  },
  workspaceBody: {
    flex: 1,
    flexDirection: 'row',
  },
  leftCol: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: colors.line,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  patientVideoWrapper: {
    width: '100%',
    height: 240,
    backgroundColor: '#1E293B',
    borderRadius: radius.card,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  patientFeedImage: {
    width: '100%',
    height: '100%',
  },
  patientAvatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTint,
  },
  patientInitialsCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  patientInitialsText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
  },
  patientNameText: {
    color: colors.ink,
  },
  patientModeNotice: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  doctorSelfInset: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 64,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.accent,
    overflow: 'hidden',
    backgroundColor: colors.bg,
  },
  doctorSelfImage: {
    width: '100%',
    height: '100%',
  },
  selfLabel: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    backgroundColor: 'rgba(55,71,79,0.8)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  patientStateBadges: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stateBadgeRed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.chip,
    marginRight: 6,
    marginBottom: 4,
  },
  stateBadgeAmber: {
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.chip,
    marginRight: 6,
    marginBottom: 4,
  },
  stateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
    marginLeft: 3,
  },
  doctorReactionOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  doctorControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  docCtrlBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 2,
    borderRadius: radius.card,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  docCtrlBtnActive: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.accent,
  },
  docCtrlLabel: {
    fontSize: 10,
    color: colors.ink,
    marginTop: 2,
  },
  snapshotCard: {
    padding: 10,
    marginBottom: 8,
  },
  snapshotGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  snapshotCell: {
    alignItems: 'center',
  },
  snapshotLabel: {
    color: colors.inkSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  snapshotVal: {
    color: colors.ink,
    fontSize: 13,
    marginTop: 2,
  },
  alertsRow: {
    flexDirection: 'column',
  },
  alertChipRed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.card,
    marginBottom: 6,
  },
  alertChipRedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentStrong,
    marginLeft: 6,
  },
  alertChipAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.card,
  },
  alertChipAmberText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
    marginLeft: 6,
  },
  rightCol: {
    width: '60%',
    flex: 1,
    backgroundColor: colors.bg,
  },
  tabsBar: {
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: '#FAFAFA',
  },
  tabButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
    backgroundColor: colors.bg,
  },
  tabTextActive: {
    color: colors.ink,
  },
  tabTextInactive: {
    color: colors.inkSecondary,
  },
  tabContentArea: {
    flex: 1,
  },
  tabScroll: {
    flex: 1,
    padding: 16,
  },
  reasonSearchContainer: {
    marginBottom: 14,
  },
  reasonLabel: {
    color: colors.ink,
    marginBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    paddingHorizontal: 12,
    height: 40,
  },
  reasonInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.ink,
  },
  activeReasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dropdownCard: {
    marginTop: 6,
    padding: 8,
  },
  dropdownTitle: {
    color: colors.inkSecondary,
    fontWeight: '700',
    marginBottom: 6,
  },
  dropdownItem: {
    paddingVertical: 6,
  },
  sugChosen: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
  sugNormal: {
    color: colors.ink,
  },
  metricCardsGrid: {
    marginTop: 6,
  },
  metricCard: {
    marginBottom: 10,
    padding: 14,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricCardTitle: {
    color: colors.ink,
  },
  plateauChip: {
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.chip,
  },
  plateauText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentStrong,
  },
  metricCardBigVal: {
    color: colors.ink,
    marginVertical: 4,
  },
  metricCardDesc: {
    color: colors.inkSecondary,
  },
  labRowSummary: {
    marginTop: 6,
  },
  graphHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  graphTitle: {
    color: colors.ink,
  },
  svgCard: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  graphHint: {
    color: colors.inkSecondary,
    marginTop: 8,
  },
  weekDetailCard: {
    padding: 14,
  },
  weekDetailTitle: {
    color: colors.ink,
    marginBottom: 6,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  historyTabHeader: {
    color: colors.ink,
    marginBottom: 12,
  },
  historyItemCard: {
    marginBottom: 10,
    padding: 14,
  },
  historyItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyDocName: {
    color: colors.ink,
  },
  historyDate: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  historyBadge: {
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.chip,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
  },
  historyReason: {
    color: colors.ink,
    marginBottom: 4,
  },
  historySummary: {
    color: colors.inkSecondary,
    lineHeight: 18,
  },
  docHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  docTabTitle: {
    color: colors.ink,
  },
  docCard: {
    marginBottom: 10,
    padding: 14,
  },
  docCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docCardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  docCardTitle: {
    color: colors.ink,
  },
  docNewBadge: {
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.accentStrong,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  docNewText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentStrong,
  },
  docCardMeta: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  docActionsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  notesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesTitle: {
    color: colors.ink,
  },
  autosaveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.chip,
  },
  autosaveText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '700',
    marginLeft: 4,
  },
  soapLabel: {
    color: colors.ink,
    marginTop: 10,
    marginBottom: 4,
  },
  soapInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    padding: 10,
    color: colors.ink,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  rxHeader: {
    color: colors.ink,
    marginBottom: 12,
  },
  rxCard: {
    marginBottom: 8,
    padding: 12,
  },
  rxCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rxMedName: {
    color: colors.ink,
  },
  rxMedDose: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  rxInst: {
    color: colors.ink,
    marginTop: 4,
  },
  rxDeleteBtn: {
    padding: 4,
  },
  addMedCard: {
    marginTop: 10,
    padding: 14,
  },
  addMedTitle: {
    color: colors.ink,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    paddingHorizontal: 12,
    height: 38,
    marginBottom: 8,
    color: colors.ink,
  },
  pointersTitle: {
    color: colors.ink,
  },
  pointersDesc: {
    color: colors.inkSecondary,
    marginBottom: 12,
  },
  pointerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  pointerText: {
    flex: 1,
    color: colors.ink,
  },
  pointerDel: {
    padding: 4,
  },
  sugPointersHeader: {
    color: colors.ink,
    marginTop: 14,
    marginBottom: 8,
  },
  sugPointerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sugPointerText: {
    color: colors.ink,
    marginLeft: 8,
    flex: 1,
  },
  summaryHeader: {
    color: colors.ink,
    marginBottom: 12,
  },
  summaryInfoCard: {
    padding: 14,
  },
  summaryService: {
    color: colors.ink,
  },
  summaryStatus: {
    color: colors.inkSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  chatTabContainer: {
    flex: 1,
    padding: 12,
  },
  chatMessagesScroll: {
    flex: 1,
  },
  doctorChatBubble: {
    padding: 10,
    borderRadius: radius.card,
    marginBottom: 8,
    maxWidth: '85%',
  },
  bubbleDoctorSender: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surfaceTint,
  },
  bubblePatientSender: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
  },
  chatSenderName: {
    color: colors.inkSecondary,
    marginBottom: 2,
  },
  chatMsgBody: {
    color: colors.ink,
  },
  chatInputRow: {
    flexDirection: 'row',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  doctorChatInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    paddingHorizontal: 12,
    color: colors.ink,
  },
  chatSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  quickActionsBar: {
    height: 52,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  qaBtn: {
    marginRight: 6,
  },
  qaEndBtn: {
    minWidth: 110,
  },
  wrapUpContent: {
    paddingBottom: 20,
  },
  wrapUpCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  wrapUpCheckText: {
    color: colors.ink,
    marginLeft: 10,
    flex: 1,
  },
  finishVisitBtn: {
    marginTop: 10,
  },
  docPreviewBody: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  rotateDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: radius.chip,
    backgroundColor: colors.surfaceTint,
    marginBottom: 12,
  },
  rotateDocText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginLeft: 6,
  },
  previewImage: {
    width: 320,
    height: 380,
  },
});
