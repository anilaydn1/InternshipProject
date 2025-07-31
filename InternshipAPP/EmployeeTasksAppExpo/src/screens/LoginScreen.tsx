import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validation';
import Loading from '../components/Loading';
import { Button, Input, Card } from '../components/ui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isLoading } = useAuth();

  // Animations
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);

  React.useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15 });
    scaleAnim.value = withSpring(1, { damping: 15 });
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { translateY: slideAnim.value },
        { scale: scaleAnim.value },
      ],
    };
  });

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!password.trim()) {
      newErrors.password = 'Şifre gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({ email: email.trim(), password });

      if (!result.success) {
        Alert.alert('Giriş Hatası', result.message);
      }
      // If successful, AuthContext will handle navigation
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  if (isLoading) {
    return <Loading message="Giriş yapılıyor..." />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />
      <LinearGradient
        colors={['#0EA5E9', '#0284C7', '#0369A1']}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              padding: 24,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[animatedContainerStyle]}>
              {/* Header */}
              <View style={{
                alignItems: 'center',
                marginBottom: 48,
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 24,
                }}>
                  <Ionicons name="person" size={40} color="#FFFFFF" />
                </View>

                <Text style={{
                  fontSize: 32,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  marginBottom: 8,
                }}>
                  Hoş Geldiniz
                </Text>

                <Text style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                }}>
                  Hesabınıza giriş yapın
                </Text>
              </View>

              {/* Login Form */}
              <Card variant="elevated" style={{ marginBottom: 24 }}>
                <View style={{ padding: 24 }}>
                  <Input
                    label="E-posta"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={errors.email}
                    leftIcon="mail"
                    placeholder="ornek@email.com"
                  />

                  <Input
                    label="Şifre"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    error={errors.password}
                    leftIcon="lock-closed"
                    rightIcon={showPassword ? 'eye-off' : 'eye'}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    placeholder="Şifrenizi giriniz"
                  />

                  <Button
                    title="Giriş Yap"
                    onPress={handleLogin}
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{ marginTop: 8 }}
                  />
                </View>
              </Card>

              {/* Register Link */}
              <View style={{
                alignItems: 'center',
              }}>
                <Text style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 16,
                  marginBottom: 8,
                }}>
                  Hesabınız yok mu?
                </Text>

                <Button
                  title="Kayıt Ol"
                  onPress={navigateToRegister}
                  variant="outline"
                  size="md"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                  textStyle={{ color: '#FFFFFF' }}
                />
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};



export default LoginScreen;