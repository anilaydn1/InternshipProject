import React, { useEffect } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Yükleniyor...', 
  size = 'medium',
  color = '#0EA5E9',
  style 
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const bounceY = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );

    bounceY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const dotAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      rotation.value,
      [0, 90, 180, 270, 360],
      [1, 0.3, 0.6, 0.9, 1]
    );
    return { 
      opacity,
      transform: [{ translateY: bounceY.value }]
    };
  });

  const getSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'medium': return 32;
      case 'large': return 48;
      default: return 32;
    }
  };

  const spinnerSize = getSize();

  return (
    <View style={[
      {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 20,
      },
      style
    ]}>
      <Animated.View style={[
        {
          width: spinnerSize,
          height: spinnerSize,
          borderRadius: spinnerSize / 2,
          borderWidth: 3,
          borderColor: `${color}20`,
          borderTopColor: color,
          marginBottom: 16,
        },
        animatedStyle
      ]} />
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{
          fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
          color: '#6B7280',
          fontWeight: '500',
          marginRight: 8,
        }}>
          {message}
        </Text>
        
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              {
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: color,
                marginHorizontal: 1,
              },
              dotAnimatedStyle,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default Loading;