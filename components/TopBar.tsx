import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, typography } from '../theme/tokens';
import { ArrowLeft } from 'lucide-react-native';

export interface TopBarProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showLogo?: boolean;
  onLogoLongPress?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  onBack,
  showLogo = true,
  onLogoLongPress,
  rightElement,
  style,
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.container}>
        <View style={styles.left}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ArrowLeft size={22} color={colors.ink} />
            </TouchableOpacity>
          ) : null}

          {showLogo ? (
            <TouchableOpacity
              onLongPress={onLogoLongPress}
              delayLongPress={600}
              activeOpacity={0.8}
              accessibilityLabel="Brand Logo - long press for dev panel"
              style={styles.logoRow}
            >
              <Text style={styles.logoText}>Elevate</Text>
              <View style={styles.logoDot} />
              <Text style={styles.logoSubtext}>GLP-1</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.titleColumn}>
              {title && (
                <Text numberOfLines={1} style={[typography.h2, styles.titleText]}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text numberOfLines={1} style={[typography.caption, styles.subtitleText]}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.right}>
          {showLogo && title && (
            <Text numberOfLines={1} style={[typography.smallBold, styles.centerTitle]}>
              {title}
            </Text>
          )}
          {rightElement}
        </View>
      </View>
      {/* 4px accent bar along the bottom edge */}
      <View style={styles.accentBottomBar} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bg,
    width: '100%',
    zIndex: 10,
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderRadius: 22,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: -0.5,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentStrong,
    marginHorizontal: 3,
  },
  logoSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkSecondary,
  },
  titleColumn: {
    flex: 1,
  },
  titleText: {
    color: colors.ink,
  },
  subtitleText: {
    color: colors.inkSecondary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerTitle: {
    color: colors.ink,
    marginRight: 8,
  },
  accentBottomBar: {
    height: 4,
    backgroundColor: colors.accent,
    width: '100%',
  },
});
