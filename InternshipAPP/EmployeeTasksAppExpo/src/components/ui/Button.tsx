import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      minHeight: size === 'sm' ? 40 : size === 'md' ? 48 : 56,
      paddingHorizontal: size === 'sm' ? 16 : size === 'md' ? 20 : 24,
      paddingVertical: size === 'sm' ? 8 : size === 'md' ? 12 : 16,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? '#9CA3AF' : '#0EA5E9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? '#F3F4F6' : '#F0F9FF',
          borderWidth: 1,
          borderColor: disabled ? '#D1D5DB' : '#0EA5E9',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled ? '#D1D5DB' : '#0EA5E9',
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: size === 'sm' ? 14 : size === 'md' ? 16 : 18,
      fontWeight: '600',
      marginLeft: icon ? 8 : 0,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: disabled ? '#6B7280' : '#FFFFFF',
        };
      case 'secondary':
      case 'outline':
        return {
          ...baseTextStyle,
          color: disabled ? '#9CA3AF' : '#0EA5E9',
        };
      case 'ghost':
        return {
          ...baseTextStyle,
          color: disabled ? '#9CA3AF' : '#374151',
        };
      default:
        return baseTextStyle;
    }
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? '#FFFFFF' : '#0EA5E9'}
          />
        ) : (
          <>
            {icon}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Button;
export type { ButtonProps };