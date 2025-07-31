import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '../types';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Loading from '../components/Loading';

interface ChatScreenProps {
  navigation: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchChats = async () => {
    try {
      const response = await apiService.getChats();
      setChats(response);
    } catch (error) {
      console.error('Error fetching chats:', error);
      Alert.alert('Hata', 'Mesajlar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchChats();
  };

  const sendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const newChat = await apiService.sendMessage({ message: message.trim() });
      setChats(prev => [...prev, newChat]);
      setMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi.');
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (chatId: number) => {
    Alert.alert(
      'Mesajı Sil',
      'Bu mesajı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteMessage(chatId);
              setChats(prev => prev.filter(chat => chat.id !== chatId));
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert('Hata', 'Mesaj silinemedi.');
            }
          },
        },
      ]
    );
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Yönetici';
      case 'manager':
        return 'Müdür';
      case 'employee':
        return 'Çalışan';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#ef4444';
      case 'manager':
        return '#f59e0b';
      case 'employee':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const isMyMessage = item.user_id === user?.id;
    
    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        {!isMyMessage && (
          <View style={styles.userInfoContainer}>
            <View style={[styles.userAvatar, { backgroundColor: getRoleColor(item.user.role) }]}>
              <Text style={styles.userInitial}>
                {item.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: getRoleColor(item.user.role) }]}>
                {item.user.name}
              </Text>
              <View style={[styles.roleTag, { backgroundColor: getRoleColor(item.user.role) }]}>
                <Text style={styles.roleTagText}>
                  {getRoleDisplayName(item.user.role)}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble]}>
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
            {item.message}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.otherMessageTime]}>
              {formatTime(item.created_at)}
            </Text>
            
            {isMyMessage && (
              <TouchableOpacity
                onPress={() => deleteMessage(item.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={14} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <Loading message="Sohbet yükleniyor..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#87CEEB', '#4A90E2', '#2E7D32', '#1B5E20']}
        style={styles.backgroundGradient}
        locations={[0, 0.3, 0.7, 1]}
      >
        <View style={styles.overlay}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.9)', 'rgba(29, 78, 216, 0.9)']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>💬 Sohbet</Text>
              <Text style={styles.headerSubtitle}>{chats.length} mesaj • Canlı sohbet</Text>
            </View>
          </LinearGradient>

          <KeyboardAvoidingView 
            style={styles.chatContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <FlatList
              ref={flatListRef}
              data={chats}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderChatItem}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  colors={['#3b82f6']}
                  tintColor="#3b82f6"
                />
              }
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Mesajınızı yazın..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  maxLength={1000}
                />
                <TouchableOpacity
                  style={[styles.sendButton, (!message.trim() || isSending) && styles.sendButtonDisabled]}
                  onPress={sendMessage}
                  disabled={!message.trim() || isSending}
                >
                  <Ionicons 
                    name={isSending ? "hourglass-outline" : "send"} 
                    size={22} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backgroundGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  chatContainer: {
    flex: 1,
    marginTop: -20,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 20,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleTagText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  myMessageBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1f2937',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherMessageTime: {
    color: '#9ca3af',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 22,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.1,
  },
});

export default ChatScreen;