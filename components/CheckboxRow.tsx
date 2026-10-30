import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, radius, typography } from '../theme/tokens';
import { Check, Lock } from 'lucide-react-native';

export interface CheckboxRowProps {
  label: string;
  subtitle?: string;
  checked: boolean;
  onToggle: (nextState: boolean) => void;
  locked?: boolean;
  onLockedPress?: () => void;
  style?: ViewStyle;
}

export const CheckboxRow: React.FC<CheckboxRowProps> = ({
  label,
  subtitle,
  checked,
  onToggle,
  locked = false,
  onLockedPress,
  style,
}) => {
  const handlePress = () => {
    if (locked) {
      if (onLockedPress) onLockedPress();
      return;
    }
    onToggle(!checked);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: locked }}
      accessibilityLabel={`${label}${locked ? ', locked for safe consult' : ''}`}
      style={[
        styles.row,
        checked ? styles.rowChecked : styles.rowUnchecked,
        style,
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.checkboxBox,
            checked ? styles.checkboxChecked : styles.checkboxUnchecked,
            locked && styles.checkboxLocked,
          ]}
        >
          {locked ? (
            <Lock size={14} color={colors.ink} />
          ) : checked ? (
            <Check size={16} color={colors.ink} strokeWidth={3} />
          ) : null}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.labelRow}>
            <Text style={[typography.bodyBold, styles.label]}>{label}</Text>
            {locked && (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedBadgeText}>Required</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text style={[typography.small, styles.subtitle]}>{subtitle}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 52,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
    backgroundColor: colors.bg,
  },
  rowChecked: {
    borderColor: colors.accentSoft,
    backgroundColor: colors.bg,
  },
  rowUnchecked: {
    borderColor: colors.line,
    backgroundColor: '#FAFAFA',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxUnchecked: {
    borderColor: colors.inkSecondary,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  checkboxLocked: {
    borderColor: colors.inkSecondary,
    backgroundColor: colors.surfaceTint,
  },
  textContainer: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  label: {
    color: colors.ink,
    marginRight: 6,
  },
  lockedBadge: {
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  lockedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
  },
  subtitle: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
});
