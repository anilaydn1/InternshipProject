import React, { useState, useRef } from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';

interface TextAreaProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  required?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  rows = 4,
  maxLength,
  showCharCount = false,
  style,
  inputStyle,
  required = false,
  value = '',
  onChangeText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(value);
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const labelPositionAnim = useRef(new Animated.Value(text ? 1 : 0)).current;
  const labelPositionValue = useSharedValue(text ? 1 : 0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(borderColorAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(labelPositionAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (!text) {
      Animated.timing(labelPositionAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleChangeText = (newText: string) => {
    setText(newText);
    onChangeText?.(newText);

    if (newText && labelPositionValue.value === 0) {
      labelPositionValue.value = 1;
      Animated.timing(labelPositionAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else if (!newText && !isFocused) {
      labelPositionValue.value = 0;
      Animated.timing(labelPositionAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#EF4444' : '#D1D5DB', error ? '#EF4444' : '#0EA5E9'],
  });

  const labelTop = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -8],
  });

  const labelFontSize = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const labelColor = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#9CA3AF', error ? '#EF4444' : isFocused ? '#0EA5E9' : '#6B7280'],
  });

  const characterCount = text.length;
  const isOverLimit = maxLength ? characterCount > maxLength : false;

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <View style={{ position: 'relative' }}>
        {label && (
          <Animated.Text
            style={{
              position: 'absolute',
              left: 12,
              top: labelTop,
              fontSize: labelFontSize,
              color: labelColor,
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 4,
              zIndex: 1,
              fontWeight: '500',
            }}
          >
            {label}{required && ' *'}
          </Animated.Text>
        )}
        
        <Animated.View
          style={{
            borderWidth: 2,
            borderColor: borderColor,
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            minHeight: rows * 24 + 32,
          }}
        >
          <TextInput
            {...props}
            value={text}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline
            numberOfLines={rows}
            textAlignVertical="top"
            maxLength={maxLength}
            style={[
              {
                padding: 16,
                fontSize: 16,
                color: '#1F2937',
                minHeight: rows * 24,
                fontFamily: 'System',
              },
              inputStyle,
            ]}
            placeholderTextColor="#9CA3AF"
          />
        </Animated.View>
      </View>

      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
      }}>
        <View style={{ flex: 1 }}>
          {error && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={{
                marginLeft: 4,
                fontSize: 12,
                color: '#EF4444',
                fontWeight: '500',
              }}>
                {error}
              </Text>
            </View>
          )}
          
          {!error && helperText && (
            <Text style={{
              fontSize: 12,
              color: '#6B7280',
            }}>
              {helperText}
            </Text>
          )}
        </View>

        {(showCharCount || maxLength) && (
          <Text style={{
            fontSize: 12,
            color: isOverLimit ? '#EF4444' : '#9CA3AF',
            fontWeight: '500',
          }}>
            {characterCount}{maxLength && `/${maxLength}`}
          </Text>
        )}
      </View>
    </View>
  );
};

export default TextArea;
export type { TextAreaProps };