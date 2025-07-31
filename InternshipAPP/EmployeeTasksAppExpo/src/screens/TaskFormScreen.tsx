import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Text,
  TextInput,
  Button,
  Card,
  Snackbar,
  Appbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import ApiService from '../services/api';
import { validateTaskTitle } from '../utils/validation';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

type TaskFormScreenProps = StackScreenProps<RootStackParamList, 'TaskForm'>;

const TaskFormScreen: React.FC<TaskFormScreenProps> = ({ navigation, route }) => {
  const existingTask = route.params?.task;
  const isEditing = !!existingTask;
  const { user } = useAuth();

  // Atanan çalışan mı kontrol et
  const isAssignedEmployee = existingTask?.assigned_to === user?.id && existingTask?.user_id !== user?.id;

  const [formData, setFormData] = useState({
    title: existingTask?.title || '',
    description: existingTask?.description || '',
    status: existingTask?.status || 'future',
    progress: existingTask?.progress || 0,
  });
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Status options ve config fonksiyonu
  const statusOptions = [
    { value: 'future', label: 'Gelecekte Yapılacak', icon: 'time', color: '#3b82f6' },
    { value: 'in_progress', label: 'Devam Ediyor', icon: 'play-circle', color: '#10b981' },
    { value: 'completed', label: 'Tamamlandı', icon: 'checkmark-circle', color: '#9ca3af' },
  ];

  const getStatusConfig = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={isEditing ? 'Görevi Düzenle' : 'Yeni Görev'} />
        </Appbar.Header>
      ),
    });
  }, [navigation, isEditing]);

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};

    // Title validation
    const titleValidation = validateTaskTitle(formData.title);
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.message!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (isEditing && existingTask) {
        response = await ApiService.updateTask(existingTask.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          status: formData.status,
          progress: formData.progress,
        });
      } else {
        response = await ApiService.createTask({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          status: formData.status,
          progress: formData.progress,
        });
      }

      if (response.success) {
        setSnackbarMessage(
          isEditing ? 'Görev başarıyla güncellendi' : 'Görev başarıyla oluşturuldu'
        );
        setSnackbarVisible(true);

        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        setSnackbarMessage(response.message || 'İşlem sırasında hata oluştu');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('İşlem sırasında hata oluştu');
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <Loading
        message={isEditing ? 'Görev güncelleniyor...' : 'Görev oluşturuluyor...'}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.title}>
                {isEditing ? (isAssignedEmployee ? 'Görev Durumunu Güncelle' : 'Görevi Düzenle') : 'Yeni Görev Oluştur'}
              </Text>

              {!isAssignedEmployee && (
                <>
                  <TextInput
                    label="Görev Başlığı *"
                    value={formData.title}
                    onChangeText={(value) => updateFormData('title', value)}
                    mode="outlined"
                    error={!!errors.title}
                    style={styles.input}
                    maxLength={255}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>{errors.title}</Text>
                  )}

                  <TextInput
                    label="Açıklama"
                    value={formData.description}
                    onChangeText={(value) => updateFormData('description', value)}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                    placeholder="Görev detaylarını buraya yazabilirsiniz..."
                  />
                </>
              )}

              {isAssignedEmployee && (
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#374151' }}>Görev Başlığı</Text>
                  <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 16 }}>{existingTask?.title}</Text>

                  {existingTask?.description && (
                    <>
                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#374151' }}>Açıklama</Text>
                      <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 16 }}>{existingTask.description}</Text>
                    </>
                  )}
                </View>
              )}

              {/* Status Seçimi */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1a1a1a' }}>Görev Durumu</Text>
                <Menu
                  visible={statusMenuVisible}
                  onDismiss={() => setStatusMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      onPress={() => setStatusMenuVisible(true)}
                      style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 8,
                        padding: 16,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'white'
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons
                          name={getStatusConfig(formData.status).icon as any}
                          size={20}
                          color={getStatusConfig(formData.status).color}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={{ fontSize: 16, color: '#1a1a1a' }}>
                          {getStatusConfig(formData.status).label}
                        </Text>
                      </View>
                      <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                  }
                >
                  {statusOptions.map((option) => (
                    <Menu.Item
                      key={option.value}
                      onPress={() => {
                        updateFormData('status', option.value);
                        setStatusMenuVisible(false);
                      }}
                      title={
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons
                            name={option.icon as any}
                            size={18}
                            color={option.color}
                            style={{ marginRight: 8 }}
                          />
                          <Text>{option.label}</Text>
                        </View>
                      }
                    />
                  ))}
                </Menu>
              </View>

              {/* Progress Slider */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1a1a1a' }}>İlerleme Durumu</Text>
                <View style={{ paddingHorizontal: 8 }}>
                  <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    step={5}
                    value={formData.progress}
                    onValueChange={(value) => updateFormData('progress', Math.round(value))}
                    minimumTrackTintColor={getStatusConfig(formData.status).color}
                    maximumTrackTintColor="#e5e7eb"
                    thumbTintColor={getStatusConfig(formData.status).color}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>0%</Text>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: getStatusConfig(formData.status).color }}>%{formData.progress}</Text>
                    <Text style={{ fontSize: 14, color: '#6b7280' }}>100%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.cancelButton}
                  disabled={isLoading}
                >
                  İptal
                </Button>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  disabled={isLoading}
                >
                  {isEditing ? 'Güncelle' : 'Oluştur'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Tamam',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  input: {
    marginBottom: 8,
  },
  textArea: {
    marginBottom: 24,
    minHeight: 100,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default TaskFormScreen;