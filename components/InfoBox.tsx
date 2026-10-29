import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';
import { Info } from 'lucide-react-native';

export interface InfoBoxProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  title,
  message,
  icon,
  action,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {icon || <Info size={20} color={colors.ink} />}
      </View>
      <View style={styles.textContainer}>
        {title && <Text style={[typography.smallBold, styles.title]}>{title}</Text>}
        <Text style={[typography.small, styles.message]}>{message}</Text>
        {action && <View style={styles.actionRow}>{action}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.card,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  iconContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    marginBottom: 4,
  },
  message: {
    color: colors.ink,
    lineHeight: 20,
  },
  actionRow: {
    marginTop: 8,
  },
});
