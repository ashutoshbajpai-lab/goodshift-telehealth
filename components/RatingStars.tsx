import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { colors, radius, touchTargets, typography } from '../theme/tokens';
import { Star } from 'lucide-react-native';

export interface RatingStarsProps {
  rating: number;
  onRatingChange: (rate: number) => void;
  maxStars?: number;
  size?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  maxStars = 5,
  size = 36,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = rating >= starValue;
        return (
          <TouchableOpacity
            key={starValue}
            activeOpacity={0.7}
            onPress={() => onRatingChange(starValue)}
            accessibilityRole="button"
            accessibilityLabel={`${starValue} of ${maxStars} stars`}
            style={styles.starBtn}
          >
            <Star
              size={size}
              color={isFilled ? colors.accent : colors.line}
              fill={isFilled ? colors.accent : 'transparent'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export interface Scale0To10Props {
  value: number | null;
  onSelect: (val: number) => void;
}

export const Scale0To10: React.FC<Scale0To10Props> = ({ value, onSelect }) => {
  return (
    <View style={styles.scaleContainer}>
      <View style={styles.buttonsRow}>
        {Array.from({ length: 11 }).map((_, index) => {
          const isSelected = value === index;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => onSelect(index)}
              accessibilityRole="button"
              accessibilityLabel={`Score ${index}`}
              style={[
                styles.scaleBtn,
                isSelected ? styles.scaleBtnSelected : styles.scaleBtnNormal,
              ]}
            >
              <Text
                style={[
                  typography.smallBold,
                  isSelected ? styles.scaleTextSelected : styles.scaleTextNormal,
                ]}
              >
                {index}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.labelRow}>
        <Text style={[typography.caption, styles.scaleLabel]}>0 - Not at all likely</Text>
        <Text style={[typography.caption, styles.scaleLabel]}>10 - Extremely likely</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  starBtn: {
    padding: 8,
    minWidth: touchTargets.min,
    minHeight: touchTargets.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleContainer: {
    width: '100%',
    marginVertical: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },
  scaleBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.card,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  scaleBtnNormal: {
    backgroundColor: colors.bg,
    borderColor: colors.line,
  },
  scaleBtnSelected: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.accent,
  },
  scaleTextNormal: {
    color: colors.ink,
  },
  scaleTextSelected: {
    color: colors.ink,
    fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  scaleLabel: {
    color: colors.inkSecondary,
  },
});
