import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Avatar, Chip, Searchbar, FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';
import apiService from '../services/api';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

interface TeamScreenProps {
  navigation: any;
}

const TeamScreen: React.FC<TeamScreenProps> = ({ navigation }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers();
      setUsers(response);
      setFilteredUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return 'shield';
      case 'manager':
        return 'briefcase';
      case 'employee':
        return 'person';
      default:
        return 'person';
    }
  };

  if (isLoading) {
    return <Loading message="Ekip üyeleri yükleniyor..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Ekip</Text>
          <Text style={styles.headerSubtitle}>{filteredUsers.length} üye</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Ekip üyesi ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#10b981"
        />

        <ScrollView
          style={styles.usersList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#10b981']}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredUsers.map((user) => (
            <Card key={user.id} style={styles.userCard}>
              <Card.Content style={styles.userCardContent}>
                <View style={styles.userInfo}>
                  <Avatar.Text
                    size={50}
                    label={getInitials(user.name)}
                    style={[styles.avatar, { backgroundColor: getRoleColor(user.role) }]}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.roleContainer}>
                      <Chip
                        icon={() => (
                          <Ionicons
                            name={getRoleIcon(user.role) as any}
                            size={16}
                            color="white"
                          />
                        )}
                        style={[styles.roleChip, { backgroundColor: getRoleColor(user.role) }]}
                        textStyle={styles.roleChipText}
                      >
                        {getRoleDisplayName(user.role)}
                      </Chip>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Arama kriterlerine uygun üye bulunamadı' : 'Henüz ekip üyesi yok'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
      
      {currentUser?.role === 'manager' && (
        <FAB
          icon="plus"
          label="Görev Ata"
          style={styles.fab}
          onPress={() => navigation.navigate('AssignTask')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
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
  content: {
    flex: 1,
    padding: 20,
    marginTop: -20,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    marginBottom: 12,
    elevation: 2,
  },
  userCardContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
  },
  roleChip: {
    height: 28,
  },
  roleChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#10b981',
  },
});

export default TeamScreen;