import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const focusAnimation = useSharedValue(0);
  const errorAnimation = useSharedValue(0);

  React.useEffect(() => {
    focusAnimation.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  React.useEffect(() => {
    errorAnimation.value = withTiming(error ? 1 : 0, { duration: 200 });
  }, [error]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [error ? '#EF4444' : '#E5E7EB', error ? '#EF4444' : '#0EA5E9']
    );
    
    const backgroundColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      ['#F9FAFB', '#FFFFFF']
    );

    return {
      borderColor,
      backgroundColor,
    };
  });

  const errorAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: errorAnimation.value,
      transform: [
        {
          translateY: errorAnimation.value * -5,
        },
      ],
    };
  });

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getContainerStyle = (): ViewStyle => {
    return {
      borderWidth: 2,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: multiline ? 12 : 16,
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      minHeight: multiline ? 80 : 56,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      fontSize: 16,
      color: '#374151',
      paddingVertical: 0,
      marginLeft: leftIcon ? 12 : 0,
      marginRight: (rightIcon || secureTextEntry) ? 12 : 0,
      textAlignVertical: multiline ? 'top' : 'center',
    };
  };

  return (
    <View style={style}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      
      <Animated.View style={[getContainerStyle(), containerAnimatedStyle]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={20}
            color={isFocused ? '#0EA5E9' : '#9CA3AF'}
          />
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete as any}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={isFocused ? '#0EA5E9' : '#9CA3AF'}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={isFocused ? '#0EA5E9' : '#9CA3AF'}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Animated.View style={errorAnimatedStyle}>
          <Text
            style={{
              fontSize: 12,
              color: '#EF4444',
              marginTop: 4,
              marginLeft: 4,
            }}
          >
            {error}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default Input;
export type { InputProps };