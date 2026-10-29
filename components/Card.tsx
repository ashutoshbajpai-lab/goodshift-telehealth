import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '../theme/tokens';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'white' | 'tint' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'white',
}) => {
  const getBg = () => {
    switch (variant) {
      case 'tint':
        return colors.surfaceTint;
      case 'outline':
      case 'white':
      default:
        return colors.bg;
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: getBg() },
        variant === 'outline' && styles.outline,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    ...shadows.soft,
  },
  outline: {
    borderColor: colors.accentSoft,
  },
});
