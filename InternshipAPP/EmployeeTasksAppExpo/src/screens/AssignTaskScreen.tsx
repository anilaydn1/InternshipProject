import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  List,
  Portal,
  Modal,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { User, AssignTaskData } from '../types';
import apiService from '../services/api';
import Loading from '../components/Loading';

interface AssignTaskScreenProps {
  navigation: any;
}

const AssignTaskScreen: React.FC<AssignTaskScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: 0,
    status: 'future' as 'in_progress' | 'future' | 'completed',
    progress: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await apiService.getUsers();
      // Filter out managers and admins, only show employees
      const employees = response.filter(user => user.role === 'employee');
      setUsers(employees);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Görev başlığı gereklidir';
    }

    if (!selectedUser) {
      newErrors.assigned_to = 'Bir çalışan seçmelisiniz';
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
      const taskData: AssignTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        assigned_to: selectedUser!.id,
        status: formData.status,
        progress: formData.progress,
      };

      const response = await apiService.assignTask(taskData);
      
      if (response.success) {
        Alert.alert(
          'Başarılı',
          'Görev başarıyla atandı!',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Hata', response.message || 'Görev atanırken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      Alert.alert('Hata', 'Görev atanırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setFormData(prev => ({ ...prev, assigned_to: user.id }));
    setShowUserModal(false);
    setErrors(prev => ({ ...prev, assigned_to: '' }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'manager': return '#f97316';
      case 'employee': return '#22c55e';
      default: return '#6b7280';
    }
  };

  if (isLoadingUsers) {
    return <Loading message="Çalışanlar yükleniyor..." />;
  }

  if (isLoading) {
    return <Loading message="Görev atanıyor..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCancel}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Görev Ata</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Card.Content style={styles.formContent}>
            <Text style={styles.sectionTitle}>Görev Bilgileri</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Görev Başlığı *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={formData.title}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, title: text }));
                  setErrors(prev => ({ ...prev, title: '' }));
                }}
                placeholder="Görev başlığını girin"
                mode="outlined"
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Açıklama</Text>
              <TextInput
                style={styles.textArea}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Görev açıklamasını girin"
                mode="outlined"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Atanacak Çalışan *</Text>
              <TouchableOpacity
                style={[styles.userSelector, errors.assigned_to && styles.inputError]}
                onPress={() => setShowUserModal(true)}
              >
                {selectedUser ? (
                  <View style={styles.selectedUserContainer}>
                    <Avatar.Text
                      size={40}
                      label={selectedUser.name.charAt(0).toUpperCase()}
                      style={{ backgroundColor: getRoleColor(selectedUser.role) }}
                    />
                    <View style={styles.selectedUserInfo}>
                      <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
                      <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </View>
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderText}>Çalışan seçin</Text>
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </View>
                )}
              </TouchableOpacity>
              {errors.assigned_to && <Text style={styles.errorText}>{errors.assigned_to}</Text>}
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={[styles.button, styles.cancelButton]}
            labelStyle={styles.cancelButtonText}
          >
            İptal
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, styles.submitButton]}
            labelStyle={styles.submitButtonText}
          >
            Görevi Ata
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={showUserModal}
          onDismiss={() => setShowUserModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Çalışan Seç</Text>
            <TouchableOpacity onPress={() => setShowUserModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.userList}>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userItem}
                onPress={() => selectUser(user)}
              >
                <Avatar.Text
                  size={40}
                  label={user.name.charAt(0).toUpperCase()}
                  style={{ backgroundColor: getRoleColor(user.role) }}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                {selectedUser?.id === user.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: -10,
  },
  formCard: {
    marginBottom: 20,
    elevation: 2,
  },
  formContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
  },
  textArea: {
    backgroundColor: 'white',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  userSelector: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedUserName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  selectedUserEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: '#6b7280',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#667eea',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  userList: {
    maxHeight: 400,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default AssignTaskScreen;