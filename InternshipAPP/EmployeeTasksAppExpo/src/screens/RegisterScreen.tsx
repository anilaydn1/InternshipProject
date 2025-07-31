import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword, validateName } from '../utils/validation';
import Loading from '../components/Loading';
import { Button, Input, Card } from '../components/ui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'employee' as 'manager' | 'employee',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isLoading } = useAuth();
  
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

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message!;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message!;
    }

    // Password confirmation validation
    if (!formData.password_confirmation.trim()) {
      newErrors.password_confirmation = 'Şifre tekrarı gereklidir';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
      });
      
      if (!result.success) {
        Alert.alert('Kayıt Hatası', result.message);
      }
      // If successful, AuthContext will handle navigation
    } catch (error) {
      Alert.alert('Hata', 'Kayıt olurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  if (isLoading) {
    return <Loading message="Kayıt oluşturuluyor..." />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <LinearGradient
        colors={['#7C3AED', '#6D28D9', '#5B21B6']}
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
                marginBottom: 32,
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
                  <Ionicons name="person-add" size={40} color="#FFFFFF" />
                </View>
                
                <Text style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  marginBottom: 8,
                }}>
                  Hesap Oluşturun
                </Text>
                
                <Text style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                }}>
                  Yeni hesabınızı oluşturun
                </Text>
              </View>

              {/* Register Form */}
              <Card variant="elevated" style={{ marginBottom: 24 }}>
                <View style={{ padding: 24 }}>
                  <Input
                    label="Ad Soyad"
                    value={formData.name}
                    onChangeText={(value) => updateFormData('name', value)}
                    autoCapitalize="words"
                    error={errors.name}
                    leftIcon="person"
                    placeholder="Adınız ve soyadınız"
                  />

                  <Input
                    label="E-posta"
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={errors.email}
                    leftIcon="mail"
                    placeholder="ornek@email.com"
                  />

                  {/* Role Selection */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 12,
                      marginLeft: 4,
                    }}>
                      Rol Seçimi
                    </Text>
                    
                    <View style={{
                      flexDirection: 'row',
                      gap: 12,
                    }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          padding: 16,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: formData.role === 'employee' ? '#7C3AED' : '#E5E7EB',
                          backgroundColor: formData.role === 'employee' ? '#7C3AED10' : '#FFFFFF',
                          alignItems: 'center',
                        }}
                        onPress={() => updateFormData('role', 'employee')}
                      >
                        <Ionicons 
                          name="person" 
                          size={24} 
                          color={formData.role === 'employee' ? '#7C3AED' : '#6B7280'} 
                        />
                        <Text style={{
                          marginTop: 8,
                          fontSize: 14,
                          fontWeight: '500',
                          color: formData.role === 'employee' ? '#7C3AED' : '#6B7280',
                        }}>
                          Çalışan
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          padding: 16,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: formData.role === 'manager' ? '#7C3AED' : '#E5E7EB',
                          backgroundColor: formData.role === 'manager' ? '#7C3AED10' : '#FFFFFF',
                          alignItems: 'center',
                        }}
                        onPress={() => updateFormData('role', 'manager')}
                      >
                        <Ionicons 
                          name="briefcase" 
                          size={24} 
                          color={formData.role === 'manager' ? '#7C3AED' : '#6B7280'} 
                        />
                        <Text style={{
                          marginTop: 8,
                          fontSize: 14,
                          fontWeight: '500',
                          color: formData.role === 'manager' ? '#7C3AED' : '#6B7280',
                        }}>
                          Yönetici
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Input
                    label="Şifre"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    secureTextEntry={!showPassword}
                    error={errors.password}
                    leftIcon="lock-closed"
                    rightIcon={showPassword ? 'eye-off' : 'eye'}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    placeholder="Şifrenizi giriniz"
                  />

                  <Input
                    label="Şifre Tekrarı"
                    value={formData.password_confirmation}
                    onChangeText={(value) => updateFormData('password_confirmation', value)}
                    secureTextEntry={!showConfirmPassword}
                    error={errors.password_confirmation}
                    leftIcon="lock-closed"
                    rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    placeholder="Şifrenizi tekrar giriniz"
                  />

                  <Button
                    title="Kayıt Ol"
                    onPress={handleRegister}
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{ 
                      marginTop: 8,
                      backgroundColor: '#7C3AED',
                    }}
                  />
                </View>
              </Card>

              {/* Login Link */}
              <View style={{
                alignItems: 'center',
              }}>
                <Text style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 16,
                  marginBottom: 8,
                }}>
                  Zaten hesabınız var mı?
                </Text>
                
                <Button
                  title="Giriş Yap"
                  onPress={navigateToLogin}
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



export default RegisterScreen;