import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';
import { Clock } from 'lucide-react-native';

export interface CountdownTimerProps {
  initialSeconds: number;
  onZero?: () => void;
  prefix?: string;
  countUp?: boolean;
  style?: ViewStyle;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds,
  onZero,
  prefix,
  countUp = false,
  style,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (!countUp) {
          if (prev <= 1) {
            clearInterval(timer);
            if (onZero) onZero();
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countUp, onZero]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <View style={[styles.container, style]}>
      <Clock size={16} color={colors.ink} style={styles.icon} />
      {prefix && <Text style={[typography.small, styles.prefix]}>{prefix} </Text>}
      <Text style={[typography.bodyBold, styles.time]}>{timeFormatted}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  prefix: {
    color: colors.inkSecondary,
  },
  time: {
    color: colors.ink,
    letterSpacing: 0.5,
  },
});
