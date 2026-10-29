import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { colors, radius, typography } from '../theme/tokens';
import { useConsultationStore } from '../store/consultationStore';
import { X, Wrench, RefreshCw, AlertTriangle, Wifi, PhoneOff, UserCheck, ShieldAlert } from 'lucide-react-native';

export interface DevPanelModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DevPanelModal: React.FC<DevPanelModalProps> = ({
  visible,
  onClose,
}) => {
  const store = useConsultationStore();
  const [activeTab, setActiveTab] = useState<'controls' | 'eventLogs'>('controls');

  const stats = store.getCallStatistics();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Wrench size={20} color={colors.accentStrong} />
              <Text style={[typography.h2, styles.headerTitle]}>Developer Controls</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close dev panel"
              accessibilityRole="button"
              style={styles.closeBtn}
            >
              <X size={20} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {/* Sub tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => setActiveTab('controls')}
              style={[styles.tabItem, activeTab === 'controls' && styles.tabItemActive]}
            >
              <Text
                style={[
                  typography.smallBold,
                  activeTab === 'controls' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Force State Triggers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('eventLogs')}
              style={[styles.tabItem, activeTab === 'eventLogs' && styles.tabItemActive]}
            >
              <Text
                style={[
                  typography.smallBold,
                  activeTab === 'eventLogs' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Call Event Log ({store.eventLogs.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {activeTab === 'controls' ? (
              <View>
                <Text style={[typography.caption, styles.sectionHeader]}>
                  NETWORK SIMULATION (Current: {store.networkQuality.toUpperCase()})
                </Text>
                <View style={styles.buttonGrid}>
                  {(['good', 'fair', 'weak', 'offline'] as const).map((net) => (
                    <TouchableOpacity
                      key={net}
                      onPress={() => store.setNetworkQuality(net)}
                      style={[
                        styles.gridBtn,
                        store.networkQuality === net && styles.gridBtnActive,
                      ]}
                    >
                      <Wifi size={14} color={colors.ink} style={styles.btnIcon} />
                      <Text style={[typography.caption, styles.btnText]}>
                        {net.charAt(0).toUpperCase() + net.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[typography.caption, styles.sectionHeader]}>
                  CALL & QUEUE FORCED TRIGGERS
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    store.triggerCallDrop();
                    onClose();
                  }}
                  style={styles.actionRow}
                >
                  <View style={styles.actionIconCol}>
                    <PhoneOff size={18} color={colors.accentStrong} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={[typography.bodyBold, styles.actionTitle]}>Force Call Drop</Text>
                    <Text style={[typography.caption, styles.actionDesc]}>
                      Triggers instant offline state, reconnect countdown & audio recovery
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    store.forceDoctorJoinsNow();
                    onClose();
                  }}
                  style={styles.actionRow}
                >
                  <View style={styles.actionIconCol}>
                    <UserCheck size={18} color={colors.success} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={[typography.bodyBold, styles.actionTitle]}>Doctor Joins Now</Text>
                    <Text style={[typography.caption, styles.actionDesc]}>
                      Skips waiting room straight to matched & active consultation
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    store.forceLongQueue();
                  }}
                  style={styles.actionRow}
                >
                  <View style={styles.actionIconCol}>
                    <AlertTriangle size={18} color={colors.accent} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={[typography.bodyBold, styles.actionTitle]}>Trigger Long Queue Offer</Text>
                    <Text style={[typography.caption, styles.actionDesc]}>
                      Pushes wait time above threshold to show 'Book a slot instead' offer
                    </Text>
                  </View>
                </TouchableOpacity>

                <Text style={[typography.caption, styles.sectionHeader]}>
                  PERMISSIONS & PRIVACY OVERRIDES
                </Text>

                <View style={styles.toggleRow}>
                  <Text style={[typography.bodyBold, styles.toggleLabel]}>
                    Simulate Failed Camera Permission
                  </Text>
                  <Switch
                    value={store.devSimulatePermissionDenied}
                    onValueChange={(val) => store.setDevSimulatePermissionDenied(val)}
                    trackColor={{ false: colors.line, true: colors.accent }}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={[typography.bodyBold, styles.toggleLabel]}>
                    Recording & Transcription Enabled
                  </Text>
                  <Switch
                    value={store.isRecordingOn}
                    onValueChange={(val) => store.setIsRecordingOn(val, 'patient')}
                    trackColor={{ false: colors.line, true: colors.accent }}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => {
                    store.triggerDevRedFlag();
                    onClose();
                  }}
                  style={styles.actionRow}
                >
                  <View style={styles.actionIconCol}>
                    <ShieldAlert size={18} color={colors.accentStrong} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={[typography.bodyBold, styles.actionTitle]}>Trigger Red-Flag Answer</Text>
                    <Text style={[typography.caption, styles.actionDesc]}>
                      Opens emergency guidance screen (chest pain / vomiting triage)
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => store.resetAllState()}
                  style={[styles.actionRow, { marginTop: 12, borderColor: colors.line }]}
                >
                  <RefreshCw size={18} color={colors.inkSecondary} />
                  <Text style={[typography.smallBold, { marginLeft: 10, color: colors.inkSecondary }]}>
                    Reset Consultation & Test Data
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.statBox}>
                  <Text style={[typography.smallBold, styles.statTitle]}>
                    Consultation Metrics: {store.currentConsultationId}
                  </Text>
                  <View style={styles.statGrid}>
                    <View style={styles.statCell}>
                      <Text style={[typography.h2, styles.statValue]}>{stats.switchesCount}</Text>
                      <Text style={[typography.caption, styles.statLabel]}>Mode Switches</Text>
                    </View>
                    <View style={styles.statCell}>
                      <Text style={[typography.h2, styles.statValue]}>{stats.dropsCount}</Text>
                      <Text style={[typography.caption, styles.statLabel]}>Drops Logged</Text>
                    </View>
                    <View style={styles.statCell}>
                      <Text style={[typography.h2, styles.statValue]}>{stats.videoMinutes}m</Text>
                      <Text style={[typography.caption, styles.statLabel]}>Video Time</Text>
                    </View>
                    <View style={styles.statCell}>
                      <Text style={[typography.h2, styles.statValue]}>{stats.audioMinutes}m</Text>
                      <Text style={[typography.caption, styles.statLabel]}>Audio Time</Text>
                    </View>
                  </View>
                  <Text style={[typography.caption, { marginTop: 8, color: colors.inkSecondary }]}>
                    Avg reconnect time: {stats.avgReconnectSecs}s
                  </Text>
                </View>

                <Text style={[typography.caption, styles.sectionHeader]}>
                  EVENT STREAM ({store.eventLogs.length} events)
                </Text>

                {store.eventLogs.length === 0 ? (
                  <Text style={[typography.small, { color: colors.inkSecondary, textAlign: 'center', marginVertical: 20 }]}>
                    No call events logged yet. Start a consultation to see live state events.
                  </Text>
                ) : (
                  store.eventLogs.map((ev, idx) => (
                    <View key={idx} style={styles.logCard}>
                      <View style={styles.logHeader}>
                        <Text style={[typography.caption, styles.logTime]}>
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </Text>
                        <Text style={[typography.caption, styles.logTrigger]}>
                          Trigger: {ev.triggeredBy.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[typography.smallBold, styles.logType]}>{ev.eventType}</Text>
                      <Text style={[typography.caption, styles.logDetails]}>
                        Net: {ev.networkQuality} • Mode: {ev.modeAfter} • CID: {ev.consultationId}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(55, 71, 79, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '88%',
    backgroundColor: colors.bg,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.surfaceTint,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 8,
    color: colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
  },
  tabTextActive: {
    color: colors.ink,
  },
  tabTextInactive: {
    color: colors.inkSecondary,
  },
  scrollBody: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    color: colors.inkSecondary,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: radius.card,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  gridBtnActive: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.accent,
  },
  btnIcon: {
    marginRight: 4,
  },
  btnText: {
    color: colors.ink,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    marginBottom: 8,
  },
  actionIconCol: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    color: colors.ink,
  },
  actionDesc: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  toggleLabel: {
    color: colors.ink,
    flex: 1,
    marginRight: 12,
  },
  statBox: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  statTitle: {
    color: colors.ink,
    marginBottom: 8,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCell: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.ink,
  },
  statLabel: {
    color: colors.inkSecondary,
  },
  logCard: {
    padding: 10,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 6,
    backgroundColor: colors.bg,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logTime: {
    color: colors.inkSecondary,
  },
  logTrigger: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
  logType: {
    color: colors.ink,
  },
  logDetails: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
});
