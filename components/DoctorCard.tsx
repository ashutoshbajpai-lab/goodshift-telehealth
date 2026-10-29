import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { colors, radius, shadows, typography } from '../theme/tokens';
import { Doctor } from '../mock/doctors';
import { CheckCircle2, Award, Globe, Star } from 'lucide-react-native';

export interface DoctorCardProps {
  doctor: Doctor;
  onPress?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onPress,
  style,
  compact = false,
}) => {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, compact && styles.compactCard, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: doctor.avatar }}
            style={[styles.avatar, compact && styles.compactAvatar]}
            resizeMode="cover"
          />
          {doctor.verified && (
            <View style={styles.verifiedIcon}>
              <CheckCircle2 size={16} color={colors.success} />
            </View>
          )}
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={[compact ? typography.bodyBold : typography.h2, styles.name]}>
              {doctor.name}
            </Text>
            {doctor.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          <Text style={[typography.smallBold, styles.qualification]}>
            {doctor.qualification}
          </Text>

          <Text style={[typography.caption, styles.regNumber]}>
            Reg: {doctor.registrationNumber}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Award size={13} color={colors.inkSecondary} />
              <Text style={[typography.caption, styles.metaText]}>
                {doctor.yearsOfExperience} yrs exp
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Star size={13} color={colors.accent} fill={colors.accent} />
              <Text style={[typography.caption, styles.metaText]}>
                {doctor.rating} ({doctor.reviewsCount})
              </Text>
            </View>
          </View>
        </View>
      </View>

      {!compact && (
        <View style={styles.bottomRow}>
          <View style={styles.languageRow}>
            <Globe size={14} color={colors.inkSecondary} />
            <Text style={[typography.caption, styles.languageText]}>
              {doctor.languages.join(' • ')}
            </Text>
          </View>

          {doctor.availableNow && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Available Now</Text>
            </View>
          )}
        </View>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    ...shadows.soft,
  },
  compactCard: {
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceTint,
  },
  compactAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  verifiedIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.bg,
    borderRadius: 9,
    padding: 1,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  name: {
    color: colors.ink,
    marginRight: 6,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
  },
  qualification: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  regNumber: {
    color: colors.inkSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  metaText: {
    color: colors.inkSecondary,
    marginLeft: 4,
  },
  bottomRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    color: colors.inkSecondary,
    marginLeft: 6,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.chip,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
  },
});
