import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';

export interface StatusDotProps {
  status: 'good' | 'fair' | 'weak' | 'offline' | 'recording';
  size?: number;
  label?: string;
  showPulse?: boolean;
  style?: ViewStyle;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 10,
  label,
  style,
}) => {
  const getColor = () => {
    switch (status) {
      case 'good':
        return colors.success;
      case 'fair':
        return colors.accentSoft;
      case 'weak':
        return colors.accent;
      case 'recording':
      case 'offline':
      default:
        return colors.accentStrong;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: getColor(),
          },
        ]}
      />
      {label && <Text style={[typography.caption, styles.label]}>{label}</Text>}
    </View>
  );
};

export interface BadgeProps {
  label: string;
  variant?: 'new' | 'accent' | 'neutral' | 'success';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'new',
  style,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'new':
        return {
          backgroundColor: colors.surfaceTint,
          borderColor: colors.accentStrong,
        };
      case 'accent':
        return {
          backgroundColor: colors.surfaceTint,
          borderColor: colors.accent,
        };
      case 'success':
        return {
          backgroundColor: '#E8F5E9',
          borderColor: colors.success,
        };
      case 'neutral':
      default:
        return {
          backgroundColor: colors.line,
          borderColor: colors.inkSecondary,
        };
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={[styles.badgeText, typography.caption]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    marginRight: 6,
  },
  label: {
    color: colors.ink,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.chip,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: colors.ink,
    fontWeight: '700',
  },
});
