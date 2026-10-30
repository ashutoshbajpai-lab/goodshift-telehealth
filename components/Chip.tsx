import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        disabled && styles.disabledChip,
        style,
      ]}
    >
      {icon && <>{icon}</>}
      <Text
        style={[
          typography.smallBold,
          selected ? styles.selectedText : styles.unselectedText,
          icon ? styles.textWithIcon : null,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.chip,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  unselectedChip: {
    backgroundColor: colors.bg,
    borderColor: colors.line,
  },
  selectedChip: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.accent,
  },
  disabledChip: {
    opacity: 0.5,
  },
  unselectedText: {
    color: colors.ink,
  },
  selectedText: {
    color: colors.ink,
    fontWeight: '700',
  },
  textWithIcon: {
    marginLeft: 6,
  },
});
