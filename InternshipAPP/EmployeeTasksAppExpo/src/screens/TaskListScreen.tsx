import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import TaskCard from '../components/TaskCard';
import Loading from '../components/Loading';
import { Button, Card, EmptyState } from '../components/ui';
import { FAB } from 'react-native-paper';

interface TaskListScreenProps {
  navigation: any;
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  const { user, logout } = useAuth();

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const animatedSearchStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const loadTasks = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const tasksData = await ApiService.getTasks();
      setTasks(tasksData);
      setFilteredTasks(tasksData);
      
      // Animate in the content
      fadeAnim.value = withTiming(1, { duration: 600 });
      slideAnim.value = withTiming(0, { duration: 600 });
    } catch (error: any) {
      console.error('Load tasks error:', error);
      
      // Check if it's a 401 error (unauthorized)
      if (error?.response?.status === 401) {
        Alert.alert('Oturum Süresi Doldu', 'Lütfen tekrar giriş yapın.', [
          { text: 'Tamam', onPress: () => logout() }
        ]);
        return;
      }
      
      Alert.alert('Hata', 'Görevler yüklenirken hata oluştu');
    } finally {
      if (showLoading) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load tasks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  // Filter tasks based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, tasks]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTasks(false);
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleEditTask = (task: Task) => {
    navigation.navigate('TaskForm', { task });
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const response = await ApiService.deleteTask(taskToDelete.id);
      if (response.success) {
        Alert.alert('Başarılı', 'Görev başarıyla silindi');
        loadTasks(false);
      } else {
        Alert.alert('Hata', response.message || 'Görev silinirken hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', 'Görev silinirken hata oluştu');
    } finally {
      setDeleteDialogVisible(false);
      setTaskToDelete(null);
    }
  };

  const handleCreateTask = () => {
    navigation.navigate('TaskForm');
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => handleTaskPress(item)}
      onEdit={() => handleEditTask(item)}
      onDelete={() => handleDeleteTask(item)}
      showActions={true}
    />
  );

  const renderEmptyList = () => (
    <EmptyState
      icon="clipboard-outline"
      title="Henüz görev yok"
      description="İlk görevinizi oluşturmak için + butonuna tıklayın"
      actionLabel="Yeni Görev Oluştur"
      onAction={handleCreateTask}
    />
  );

  if (isLoading) {
    return <Loading message="Görevler yükleniyor..." />;
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
            <View>
              <Animated.Text 
                style={[
                  animatedHeaderStyle,
                  {
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold'
                  }
                ]}
              >
                Görevlerim
              </Animated.Text>
              <Animated.Text 
                style={[
                  animatedHeaderStyle,
                  {
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 14
                  }
                ]}
              >
                {filteredTasks.length} görev
              </Animated.Text>
            </View>
            <TouchableOpacity
              onPress={handleCreateTask}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                padding: 12
              }}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <Animated.View 
            style={[
              animatedSearchStyle,
              {
                backgroundColor: searchFocused ? 'white' : 'rgba(255,255,255,0.9)',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center'
              }
            ]}
          >
            <Ionicons 
              name="search" 
              size={20} 
              color={searchFocused ? '#667eea' : '#666'} 
            />
            <TextInput
              placeholder="Görev ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1,
                marginLeft: 12,
                color: '#1F2937',
                fontSize: 16
              }}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        {/* Content */}
        <Animated.View 
          style={[
            animatedContentStyle,
            {
              flex: 1,
              backgroundColor: '#f9fafb',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              marginTop: 8
            }
          ]}
        >
          <FlatList
            data={filteredTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 100,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#667eea']}
                tintColor="#667eea"
              />
            }
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>

        {/* Delete Confirmation Dialog */}
        {deleteDialogVisible && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <Card style={{ width: '100%', maxWidth: 320 }}>
              <View style={{ padding: 24 }}>
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#fef2f2', borderRadius: 20, padding: 12, marginBottom: 12 }}>
                    <Ionicons name="trash" size={24} color="#EF4444" />
                  </View>
                  <Animated.Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', textAlign: 'center' }}>
                    Görevi Sil
                  </Animated.Text>
                </View>
                
                <Animated.Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
                  Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </Animated.Text>
                
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Button
                    title="İptal"
                    onPress={() => setDeleteDialogVisible(false)}
                    variant="outline"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Sil"
                    onPress={confirmDeleteTask}
                    variant="primary"
                    style={{ flex: 1, backgroundColor: '#ef4444' }}
                  />
                </View>
              </View>
            </Card>
          </View>
        )}
      </View>
      
      {/* Floating Action Buttons */}
      {user?.role === 'manager' && (
        <FAB
          icon="plus"
          label="Görev Ata"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 80,
            backgroundColor: '#10b981',
          }}
          onPress={() => navigation.navigate('AssignTask')}
        />
      )}
      

    </LinearGradient>
  );
};



export default TaskListScreen;