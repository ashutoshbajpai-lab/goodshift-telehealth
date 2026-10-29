import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { colors, radius, shadows, typography } from '../theme/tokens';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onDismiss?: () => void;
  duration?: number;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  onDismiss,
  duration = 3200,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onDismiss) onDismiss();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color={colors.success} />;
      case 'warning':
      case 'error':
        return <AlertCircle size={18} color={colors.accentStrong} />;
      case 'info':
      default:
        return <Info size={18} color={colors.ink} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text style={[typography.smallBold, styles.text]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    ...shadows.soft,
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    color: colors.ink,
    flexShrink: 1,
  },
});
