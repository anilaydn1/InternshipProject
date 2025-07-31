import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card, Avatar, Divider, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Avatar.Text
            size={80}
            label={getInitials(user?.name || 'U')}
            style={styles.avatar}
          />
          <Text style={styles.headerName}>{user?.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role || '') }]}>
            <Text style={styles.roleText}>{getRoleDisplayName(user?.role || '')}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={24} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>İsim</Text>
                <Text style={styles.infoValue}>{user?.name}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={24} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>E-posta</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={24} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Rol</Text>
                <Text style={styles.infoValue}>{getRoleDisplayName(user?.role || '')}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleLogout}
              icon="logout"
              style={styles.logoutButton}
              buttonColor="#ef4444"
              textColor="white"
            >
              Çıkış Yap
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: -20,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 8,
  },
  actionCard: {
    elevation: 2,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;