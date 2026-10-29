import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { colors, radius, typography } from '../theme/tokens';
import { Button } from './Button';
import { AlertCircle, FileQuestion } from 'lucide-react-native';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.centerContainer, style]}>
      <View style={styles.iconCircle}>
        {icon || <FileQuestion size={36} color={colors.inkSecondary} />}
      </View>
      <Text style={[typography.h2, styles.title]}>{title}</Text>
      <Text style={[typography.body, styles.description]}>{description}</Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="secondary"
          size="normal"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryTitle?: string;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryTitle = 'Try again',
  style,
}) => {
  return (
    <View style={[styles.centerContainer, style]}>
      <View style={[styles.iconCircle, styles.errorCircle]}>
        <AlertCircle size={36} color={colors.accentStrong} />
      </View>
      <Text style={[typography.h2, styles.title]}>{title}</Text>
      <Text style={[typography.body, styles.description]}>{message}</Text>
      {onRetry && (
        <Button
          title={retryTitle}
          onPress={onRetry}
          variant="primary"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = radius.card,
  style,
}) => {
  const shimmer = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.line,
          opacity: shimmer,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorCircle: {
    backgroundColor: colors.errorBg,
  },
  title: {
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    color: colors.inkSecondary,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 20,
  },
  actionBtn: {
    minWidth: 160,
  },
});
