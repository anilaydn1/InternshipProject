import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import ApiService from '../services/api';

const { width } = Dimensions.get('window');

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesScreenProps {
  navigation: any;
}

const NotesScreen: React.FC<NotesScreenProps> = ({ navigation }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);


  // Animasyon değerleri
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  useEffect(() => {
    loadNotes();
    // Animasyonları başlat
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15 });

    // Navigation listener - sayfa odaklandığında notları yenile
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
    });

    return unsubscribe;
  }, [navigation]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const notesData = await ApiService.getNotes();
      setNotes(notesData);
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Hata', 'Notlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };





  const handleDeleteNote = async (noteId: number) => {
    Alert.alert(
      'Not Sil',
      'Bu notu silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteNote(noteId);
              loadNotes();
            } catch (error) {
              console.error('Not silme hatası:', error);
              Alert.alert('Hata', 'Not silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const openAddNote = () => {
    navigation.navigate('NoteForm');
  };

  const openEditNote = (note: Note) => {
    navigation.navigate('NoteForm', { note });
  };

  const renderNoteItem = ({ item, index }: { item: Note; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.noteItem}
    >
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.noteGradient}
      >
        <View style={styles.noteHeader}>
          <View style={styles.noteTitleContainer}>
            <View style={styles.noteIcon}>
              <Ionicons name="document-text" size={20} color="#667eea" />
            </View>
            <Text style={styles.noteTitle}>{item.title}</Text>
          </View>
          <View style={styles.noteActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => openEditNote(item)}
            >
              <Ionicons name="pencil" size={18} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteNote(item.id)}
            >
              <Ionicons name="trash" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.noteContent} numberOfLines={3}>
          {item.content}
        </Text>
        <View style={styles.noteFooter}>
          <View style={styles.dateContainer}>
            <Ionicons name="time" size={14} color="#94a3b8" />
            <Text style={styles.noteDate}>
              {new Date(item.created_at).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="library" size={28} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Notlarım</Text>
              <Text style={styles.headerSubtitle}>{notes.length} not</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddNote}>
            <LinearGradient
              colors={['#ffffff', '#f1f5f9']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={24} color="#667eea" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.content, animatedContainerStyle]}>
        {loading ? (
          <View style={styles.centerContainer}>
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass" size={48} color="#667eea" />
              <Text style={styles.loadingText}>Notlar yükleniyor...</Text>
            </View>
          </View>
        ) : notes.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyText}>Henüz not bulunmuyor</Text>
              <Text style={styles.emptySubText}>İlk notunuzu oluşturmak için + butonuna tıklayın</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={openAddNote}>
                <Text style={styles.emptyButtonText}>İlk Notumu Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>


    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  addButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  noteItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  noteGradient: {
    padding: 20,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  noteActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  editButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  noteContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
    fontWeight: '500',
  },

});
export default NotesScreen;
