import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, radius, typography } from '../theme/tokens';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'text' | 'surface';
  size?: 'normal' | 'small' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'normal',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? colors.line : colors.accent,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: colors.bg,
          borderWidth: 1.5,
          borderColor: disabled ? colors.line : colors.ink,
        };
      case 'danger':
        return {
          backgroundColor: disabled ? colors.line : colors.accentStrong,
          borderWidth: 0,
        };
      case 'surface':
        return {
          backgroundColor: disabled ? colors.line : colors.surfaceTint,
          borderWidth: 1,
          borderColor: colors.accentSoft,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          paddingHorizontal: 8,
          minHeight: 44,
          justifyContent: 'center',
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.inkSecondary;
    switch (variant) {
      case 'primary':
        // CRITICAL RULE: Never white text on orange. Text on #FF9F68 is ink #37474F (4.8:1 contrast).
        return colors.ink;
      case 'danger':
        // For #FF6F59, bold ink passes contrast.
        return colors.ink;
      case 'secondary':
      case 'surface':
      case 'text':
        return colors.ink;
    }
  };

  const getHeight = (): number => {
    switch (size) {
      case 'small':
        return 44;
      case 'large':
        return 56;
      case 'normal':
      default:
        return 50;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
      style={[
        styles.base,
        { minHeight: getHeight() },
        getContainerStyle(),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              size === 'large' ? typography.h2 : typography.bodyBold,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  text: {
    textAlign: 'center',
  },
});
