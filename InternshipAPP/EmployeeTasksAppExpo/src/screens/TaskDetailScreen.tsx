import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, Task } from '../types';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import Loading from '../components/Loading';
import { Button, Card } from '../components/ui';

type TaskDetailScreenProps = StackScreenProps<RootStackParamList, 'TaskDetail'>;

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ navigation, route }) => {
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const { taskId } = route.params;

  // Status'a göre renk ve ikon belirleme
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'in_progress':
        return {
          color: '#10b981', // yeşil
          backgroundColor: '#ecfdf5',
          icon: 'play-circle' as const,
          text: 'Devam Ediyor'
        };
      case 'completed':
        return {
          color: '#9ca3af', // açık gri
          backgroundColor: '#f9fafb',
          icon: 'checkmark-circle' as const,
          text: 'Tamamlandı'
        };
      case 'future':
      default:
        return {
          color: '#3b82f6', // mavi
          backgroundColor: '#eff6ff',
          icon: 'time' as const,
          text: 'Gelecekte Yapılacak'
        };
    }
  };

  // Animations
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  useEffect(() => {
    if (task) {
      fadeAnim.value = withTiming(1, { duration: 800 });
      slideAnim.value = withSpring(0, { damping: 15 });
      scaleAnim.value = withSpring(1, { damping: 15 });
    }
  }, [task]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { translateY: slideAnim.value },
        { scale: scaleAnim.value },
      ],
    };
  });

  const loadTask = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getTask(taskId);
      setTask(response);
    } catch (error) {
      console.error('Load task error:', error);
      Alert.alert('Hata', 'Görev yüklenirken hata oluştu');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('TaskForm', { task });
  };

  const handleDelete = () => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await ApiService.deleteTask(taskId);
      Alert.alert('Başarılı', 'Görev başarıyla silindi');
      navigation.goBack();
    } catch (error) {
      console.error('Delete task error:', error);
      Alert.alert('Hata', 'Görev silinirken hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <Loading message="Görev yükleniyor..." />;
  }

  if (!task) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Görev bulunamadı</Text>
        <Button title="Geri Dön" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      <View style={{ flex: 1, paddingTop: 44 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                padding: 12
              }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold'
            }}>
              Görev Detayı
            </Text>

            <View style={{ flexDirection: 'row' }}>
              {(user?.role === 'manager' || task?.assigned_to === user?.id) && (
                <TouchableOpacity
                  onPress={handleEdit}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 20,
                    padding: 12,
                    marginRight: 8
                  }}
                >
                  <Ionicons name="pencil" size={20} color="white" />
                </TouchableOpacity>
              )}

              {user?.role === 'manager' && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    backgroundColor: 'rgba(255,0,0,0.3)',
                    borderRadius: 20,
                    padding: 12
                  }}
                >
                  <Ionicons name="trash" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <Animated.View
          style={[
            animatedContainerStyle,
            {
              flex: 1,
              backgroundColor: '#f9fafb',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              marginTop: 8
            }
          ]}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 40
            }}
            showsVerticalScrollIndicator={false}
          >
            <Card style={{ marginBottom: 20 }}>
              <View style={{ padding: 20 }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: 16
                }}>
                  {task.title}
                </Text>

                {task.description && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8
                    }}>
                      Açıklama
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      color: '#6B7280',
                      lineHeight: 24
                    }}>
                      {task.description}
                    </Text>
                  </View>
                )}

                {/* Status Bilgisi */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 8
                  }}>
                    Durum
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: getStatusConfig(task.status).backgroundColor,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    alignSelf: 'flex-start'
                  }}>
                    <Ionicons
                      name={getStatusConfig(task.status).icon}
                      size={20}
                      color={getStatusConfig(task.status).color}
                    />
                    <Text style={{
                      fontSize: 16,
                      color: getStatusConfig(task.status).color,
                      marginLeft: 8,
                      fontWeight: '600'
                    }}>
                      {getStatusConfig(task.status).text}
                    </Text>
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 8
                  }}>
                    Atanan Kişi
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#6B7280'
                  }}>
                    {task.assignedTo?.name || 'Atanmamış'}
                  </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 8
                  }}>
                    Görev Sahibi
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#6B7280'
                  }}>
                    {task.user?.name || 'Bilinmiyor'}
                  </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 8
                  }}>
                    Oluşturulma Tarihi
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#6B7280'
                  }}>
                    {formatDate(task.created_at)}
                  </Text>
                </View>

                {task.updated_at !== task.created_at && (
                  <View>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8
                    }}>
                      Son Güncelleme
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      color: '#6B7280'
                    }}>
                      {formatDate(task.updated_at)}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          </ScrollView>
        </Animated.View>
      </View>

      {isDeleting && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Loading message="Görev siliniyor..." />
        </View>
      )}
    </LinearGradient>
  );
};

export default TaskDetailScreen;