import React, { useEffect } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  label?: string;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showLabel = false,
  label,
  color = '#0EA5E9',
  backgroundColor = '#E5E7EB',
  style,
  animated = true,
}) => {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    if (animated) {
      progressValue.value = withTiming(clampedProgress, { duration: 800 });
    } else {
      progressValue.value = clampedProgress;
    }
  }, [progress, animated]);

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const widthPercentage = progressValue.value;
    
    // Color interpolation based on progress
    const progressColor = interpolateColor(
      progressValue.value,
      [0, 50, 100],
      ['#EF4444', '#F59E0B', '#22C55E'] // Red -> Yellow -> Green
    );

    return {
      width: `${widthPercentage}%`,
      backgroundColor: color === '#0EA5E9' ? progressColor : color,
    };
  });

  const getProgressText = () => {
    if (label) return label;
    return `${Math.round(progress)}%`;
  };

  return (
    <View style={style}>
      {showLabel && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
            }}
          >
            İlerleme
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#6B7280',
            }}
          >
            {getProgressText()}
          </Text>
        </View>
      )}
      
      <View
        style={{
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: height / 2,
            },
            progressAnimatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

export default ProgressBar;
export type { ProgressBarProps };