import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  animateOnPress?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  style,
  animateOnPress = true,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    if (animateOnPress && onPress) {
      scale.value = withSpring(0.98);
      opacity.value = withTiming(0.8, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (animateOnPress && onPress) {
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 100 });
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
    };

    const paddingStyle: ViewStyle = {
      padding:
        padding === 'none' ? 0 :
        padding === 'sm' ? 12 :
        padding === 'md' ? 16 :
        padding === 'lg' ? 24 : 16,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...paddingStyle,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        };
      case 'outlined':
        return {
          ...baseStyle,
          ...paddingStyle,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        };
      case 'default':
      default:
        return {
          ...baseStyle,
          ...paddingStyle,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
    }
  };

  if (onPress) {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <TouchableOpacity
          style={getCardStyle()}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[getCardStyle(), style]}>
      {children}
    </Animated.View>
  );
};

export default Card;
export type { CardProps };