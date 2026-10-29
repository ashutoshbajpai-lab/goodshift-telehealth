import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Text,
  View,
} from 'react-native';
import { colors, radius, touchTargets, typography } from '../theme/tokens';

export interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  label?: string;
  variant?: 'default' | 'primary' | 'danger' | 'ghost' | 'active';
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  icon,
  label,
  variant = 'default',
  size = 52,
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const getBackground = (): string => {
    if (disabled) return colors.line;
    switch (variant) {
      case 'primary':
        return colors.accent;
      case 'danger':
        return colors.accentStrong;
      case 'active':
        return colors.surfaceTint;
      case 'ghost':
        return 'transparent';
      case 'default':
      default:
        return colors.bg;
    }
  };

  const getBorder = (): ViewStyle => {
    if (variant === 'default') {
      return { borderWidth: 1, borderColor: colors.line };
    }
    if (variant === 'active') {
      return { borderWidth: 1.5, borderColor: colors.accent };
    }
    return { borderWidth: 0 };
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.button,
          {
            width: Math.max(size, touchTargets.min),
            height: Math.max(size, touchTargets.min),
            borderRadius: radius.full,
            backgroundColor: getBackground(),
          },
          getBorder(),
          style,
        ]}
      >
        {icon}
      </TouchableOpacity>
      {label && (
        <Text style={[typography.caption, styles.label]}>
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.ink,
    marginTop: 4,
    textAlign: 'center',
  },
});
