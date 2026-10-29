import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

export interface BrandedDoctorBackgroundProps {
  showBranding?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const BrandedDoctorBackground: React.FC<BrandedDoctorBackgroundProps> = ({
  showBranding = true,
  style,
  children,
}) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: showBranding ? colors.surfaceTint : '#2C3E50' },
        style,
      ]}
    >
      {showBranding && (
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkLogo}>Elevate GLP-1 Care</Text>
          <Text style={styles.watermarkTagline}>Clinical Telehealth Consultation</Text>
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 24,
    left: 20,
    opacity: 0.2, // 20% opacity as requested
    zIndex: 1,
  },
  watermarkLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  watermarkTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
    marginTop: 2,
  },
});
