import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { noteService } from '../services/noteService';
import { Note } from '../types';
import Loading from '../components/Loading';

interface NoteFormScreenProps {
  navigation: any;
  route: any;
}

const NoteFormScreen: React.FC<NoteFormScreenProps> = ({ navigation, route }) => {
  const existingNote = route.params?.note;
  const isEditing = !!existingNote;
  const { user } = useAuth();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    title: existingNote?.title || '',
    content: existingNote?.content || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Başlık gereklidir';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'İçerik gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        await noteService.updateNote(existingNote.id, formData);
        Alert.alert('Başarılı', 'Not başarıyla güncellendi');
      } else {
        await noteService.createNote(formData);
        Alert.alert('Başarılı', 'Not başarıyla oluşturuldu');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Note save error:', error);
      Alert.alert('Hata', 'Not kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return <Loading message={isEditing ? 'Not güncelleniyor...' : 'Not oluşturuluyor...'} />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <LinearGradient
        colors={['#7C3AED', '#6D28D9', '#5B21B6']}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              iconColor="white"
              size={24}
              onPress={handleCancel}
            />
            <Text style={styles.headerTitle}>
              {isEditing ? 'Notu Düzenle' : 'Yeni Not'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.formCard}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Başlık</Text>
                  <TextInput
                    mode="outlined"
                    value={formData.title}
                    onChangeText={(text) => {
                      setFormData({ ...formData, title: text });
                      if (errors.title) {
                        setErrors({ ...errors, title: '' });
                      }
                    }}
                    placeholder="Not başlığını girin"
                    error={!!errors.title}
                    style={styles.input}
                    theme={{
                      colors: {
                        primary: theme.colors.primary,
                        outline: errors.title ? theme.colors.error : theme.colors.outline,
                      },
                    }}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>{errors.title}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>İçerik</Text>
                  <TextInput
                    mode="outlined"
                    value={formData.content}
                    onChangeText={(text) => {
                      setFormData({ ...formData, content: text });
                      if (errors.content) {
                        setErrors({ ...errors, content: '' });
                      }
                    }}
                    placeholder="Not içeriğini girin"
                    multiline
                    numberOfLines={8}
                    error={!!errors.content}
                    style={[styles.input, styles.textArea]}
                    theme={{
                      colors: {
                        primary: theme.colors.primary,
                        outline: errors.content ? theme.colors.error : theme.colors.outline,
                      },
                    }}
                  />
                  {errors.content && (
                    <Text style={styles.errorText}>{errors.content}</Text>
                  )}
                </View>

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
                    onPress={handleSave}
                    style={[styles.button, styles.saveButton]}
                    labelStyle={styles.saveButtonText}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isEditing ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  formCard: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: '#6B7280',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#7C3AED',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NoteFormScreen;