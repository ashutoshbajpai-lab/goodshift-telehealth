import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { useConsultationStore } from '../../store/consultationStore';
import { ConsultationRecord } from '../../mock/consultations';
import {
  TopBar,
  Card,
  BottomSheet,
  Button,
  Chip,
} from '../../components';
import {
  Search,
  Calendar,
  Clock,
  FileText,
  ChevronRight,
  Sparkles,
  Award,
  Video,
  Volume2,
} from 'lucide-react-native';

export default function HistoryScreen() {
  const router = useRouter();
  const store = useConsultationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState<ConsultationRecord | null>(null);

  const consultations = store.consultationHistory;

  // Filter list
  const filtered = consultations.filter((c) => {
    const matchesDoctor =
      selectedDoctorFilter === 'All' || c.doctorName.includes(selectedDoctorFilter);
    const matchesQuery =
      searchQuery === '' ||
      c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDoctor && matchesQuery;
  });

  return (
    <View style={styles.container}>
      <TopBar title="Consultation History" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={colors.inkSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by doctor, date or clinical reason..."
            placeholderTextColor={colors.inkSecondary}
            style={styles.searchInput}
          />
        </View>

        {/* Doctor Filter Chips */}
        <View style={styles.filterRow}>
          {['All', 'Dr. Ananya Sen', 'Dr. Rajesh Deshmukh'].map((doc) => (
            <Chip
              key={doc}
              label={doc}
              selected={selectedDoctorFilter === doc}
              onPress={() => setSelectedDoctorFilter(doc)}
            />
          ))}
        </View>

        <Text style={[typography.caption, styles.resultsCount]}>
          Showing {filtered.length} consultation{filtered.length === 1 ? '' : 's'}
        </Text>

        {/* Consultations List */}
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => setSelectedRecord(item)}
            style={styles.recordCardWrapper}
            accessibilityRole="button"
            accessibilityLabel={`Consultation record with ${item.doctorName} on ${item.date}, ${item.reason}`}
          >
            <Card style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.headerLeft}>
                  {item.mode === 'audio' ? (
                    <Volume2 size={16} color={colors.accent} style={{ marginRight: 6 }} />
                  ) : (
                    <Video size={16} color={colors.accent} style={{ marginRight: 6 }} />
                  )}
                  <Text style={[typography.caption, styles.recordDate]}>
                    {item.date} • {item.time} ({item.durationMinutes} mins)
                  </Text>
                </View>
                <View style={styles.cidBadge}>
                  <Text style={styles.cidText}>{item.id}</Text>
                </View>
              </View>

              <View style={styles.doctorSnippet}>
                {item.doctorAvatar ? (
                  <Image source={{ uri: item.doctorAvatar }} style={styles.docAvatar} />
                ) : (
                  <View style={styles.docAvatarFallback}>
                    <Text style={styles.avatarInitials}>DR</Text>
                  </View>
                )}
                <View style={styles.docInfoCol}>
                  <Text style={[typography.bodyBold, styles.doctorName]}>
                    {item.doctorName}
                  </Text>
                  <Text style={[typography.caption, styles.doctorQual]}>
                    {item.doctorQualification}
                  </Text>
                </View>
              </View>

              <Text style={[typography.bodyBold, styles.reasonText]}>
                {item.reason}
              </Text>
              <Text numberOfLines={2} style={[typography.small, styles.summarySnippet]}>
                {item.summary}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={[typography.caption, styles.viewDetailsText]}>
                  View full summary, Rx & pointers
                </Text>
                <ChevronRight size={16} color={colors.ink} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Full Record Details Bottom Sheet */}
      <BottomSheet
        visible={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.reason || 'Consultation Record'}
        subtitle={`${selectedRecord?.doctorName} • ${selectedRecord?.date}`}
      >
        {selectedRecord && (
          <View style={styles.detailsModalContent}>
            {/* Doctor Info Card */}
            <Card variant="tint" style={styles.docModalCard}>
              <Text style={[typography.bodyBold, styles.modalDocName]}>
                {selectedRecord.doctorName}
              </Text>
              <Text style={[typography.caption, styles.modalDocQual]}>
                {selectedRecord.doctorQualification}
              </Text>
              <Text style={[typography.caption, styles.modalDocReg]}>
                Registration: {selectedRecord.doctorRegNumber}
              </Text>
            </Card>

            {/* Full Summary */}
            <Text style={[typography.smallBold, styles.detailSectionTitle]}>
              Clinical Summary
            </Text>
            <Text style={[typography.body, styles.detailSectionText]}>
              {selectedRecord.summary}
            </Text>

            {/* Key Pointers */}
            {selectedRecord.keyPointers && selectedRecord.keyPointers.length > 0 && (
              <>
                <Text style={[typography.smallBold, styles.detailSectionTitle]}>
                  Physician Key Guidance
                </Text>
                {selectedRecord.keyPointers.map((p, idx) => (
                  <Text key={idx} style={[typography.small, styles.modalPointer]}>
                    • {p}
                  </Text>
                ))}
              </>
            )}

            {/* Prescriptions */}
            {selectedRecord.prescription && selectedRecord.prescription.length > 0 && (
              <>
                <Text style={[typography.smallBold, styles.detailSectionTitle]}>
                  Prescription
                </Text>
                {selectedRecord.prescription.map((rx, idx) => (
                  <Card key={idx} style={styles.modalRxCard}>
                    <Text style={[typography.bodyBold, styles.rxName]}>
                      {rx.medicineName}
                    </Text>
                    <Text style={[typography.caption, styles.rxDosage]}>
                      {rx.dosage} • {rx.frequency} ({rx.duration})
                    </Text>
                    <Text style={[typography.caption, styles.rxNotes]}>
                      Instructions: {rx.instructions}
                    </Text>
                  </Card>
                ))}
              </>
            )}

            <Button
              title="Close Record"
              variant="secondary"
              size="normal"
              onPress={() => setSelectedRecord(null)}
              style={{ marginTop: 20 }}
            />
          </View>
        )}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    paddingHorizontal: 12,
    minHeight: 48,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.ink,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  resultsCount: {
    color: colors.inkSecondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  recordCardWrapper: {
    marginBottom: 14,
  },
  recordCard: {
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordDate: {
    color: colors.inkSecondary,
  },
  cidBadge: {
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.chip,
  },
  cidText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  doctorSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  docAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  docAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitials: {
    color: colors.ink,
    fontWeight: '700',
  },
  docInfoCol: {
    flex: 1,
  },
  doctorName: {
    color: colors.ink,
  },
  doctorQual: {
    color: colors.inkSecondary,
  },
  reasonText: {
    color: colors.ink,
    marginBottom: 4,
  },
  summarySnippet: {
    color: colors.inkSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  viewDetailsText: {
    color: colors.ink,
    fontWeight: '700',
  },
  detailsModalContent: {
    paddingBottom: 20,
  },
  docModalCard: {
    padding: 12,
    marginBottom: 14,
  },
  modalDocName: {
    color: colors.ink,
  },
  modalDocQual: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  modalDocReg: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  detailSectionTitle: {
    color: colors.ink,
    marginTop: 12,
    marginBottom: 6,
  },
  detailSectionText: {
    color: colors.ink,
    lineHeight: 22,
    marginBottom: 10,
  },
  modalPointer: {
    color: colors.ink,
    lineHeight: 20,
    marginBottom: 4,
    marginLeft: 6,
  },
  modalRxCard: {
    padding: 10,
    marginBottom: 8,
  },
  rxName: {
    color: colors.ink,
  },
  rxDosage: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  rxNotes: {
    color: colors.ink,
    marginTop: 4,
  },
});
