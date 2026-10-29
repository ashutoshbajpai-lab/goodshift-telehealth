import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadows, typography } from '../theme/tokens';
import { X } from 'lucide-react-native';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: number | string;
  showCloseButton?: boolean;
  style?: ViewStyle;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  style,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, style]}>
              {/* Drag indicator bar */}
              <View style={styles.dragBarContainer}>
                <View style={styles.dragBar} />
              </View>

              {(title || showCloseButton) && (
                <View style={styles.header}>
                  <View style={styles.headerTextCol}>
                    {title && <Text style={[typography.h2, styles.title]}>{title}</Text>}
                    {subtitle && <Text style={[typography.small, styles.subtitle]}>{subtitle}</Text>}
                  </View>
                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={onClose}
                      accessibilityLabel="Close bottom sheet"
                      accessibilityRole="button"
                      style={styles.closeBtn}
                    >
                      <X size={20} color={colors.ink} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(55, 71, 79, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '85%',
    ...shadows.sheet,
  },
  dragBarContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 6,
    marginBottom: 16,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: colors.ink,
  },
  subtitle: {
    color: colors.inkSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentScroll: {
    flexGrow: 0,
  },
  content: {
    paddingBottom: 16,
  },
});
