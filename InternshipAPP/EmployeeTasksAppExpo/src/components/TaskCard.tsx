import React from 'react';
import { View, TouchableOpacity, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { formatDateShort, truncateText } from '../utils/validation';
import { Card } from './ui';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onPress, 
  onEdit, 
  onDelete, 
  showActions = true 
}) => {
  const scaleAnim = new Animated.Value(1);

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
          text: 'Gelecekte'
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginBottom: 16,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Card style={{ 
          backgroundColor: 'white', 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 1 }, 
          shadowOpacity: 0.1, 
          shadowRadius: 2, 
          elevation: 2, 
          borderWidth: 2, 
          borderColor: statusConfig.color,
          borderLeftWidth: 6
        }}>
          <View style={{ padding: 16 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', lineHeight: 24 }}>
                  {task.title}
                </Text>
              </View>
              
              {showActions && (
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {onEdit && (
                    <TouchableOpacity
                      onPress={onEdit}
                      style={{ backgroundColor: '#eff6ff', borderRadius: 20, padding: 8 }}
                    >
                      <Ionicons name="pencil" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                  )}
                  {onDelete && (
                    <TouchableOpacity
                      onPress={onDelete}
                      style={{ backgroundColor: '#fef2f2', borderRadius: 20, padding: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            
            {/* Description */}
            {task.description && (
              <Text style={{ color: '#6b7280', fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
                {truncateText(task.description, 100)}
              </Text>
            )}
            
            {/* Status Badge and Progress Bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: statusConfig.backgroundColor, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
                <Text style={{ fontSize: 12, color: statusConfig.color, marginLeft: 6, fontWeight: '600' }}>
                  {statusConfig.text}
                </Text>
              </View>
              
              {/* Progress Bar */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 10, color: '#6b7280', fontWeight: '500' }}>İlerleme</Text>
                  <Text style={{ fontSize: 10, color: statusConfig.color, fontWeight: '600' }}>%{task.progress || 0}</Text>
                </View>
                <View style={{ 
                  height: 6, 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: 3, 
                  overflow: 'hidden' 
                }}>
                  <View style={{ 
                    height: '100%', 
                    width: `${task.progress || 0}%`, 
                    backgroundColor: statusConfig.color,
                    borderRadius: 3,
                    minWidth: task.progress > 0 ? 2 : 0
                  }} />
                </View>
              </View>
            </View>

            {/* Assigned To Info */}
            {task.assignedTo && (
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Ionicons name="arrow-forward-outline" size={14} color="#d97706" />
                  <Text style={{ fontSize: 12, color: '#d97706', marginLeft: 4, fontWeight: '600' }}>
                    Atanan: {task.assignedTo.name}
                  </Text>
                </View>
              </View>
            )}

            {/* Footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                  {formatDateShort(task.created_at)}
                </Text>
              </View>
              
              {task.user && (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Ionicons name="person-outline" size={14} color="#3b82f6" />
                  <Text style={{ fontSize: 12, color: '#2563eb', marginLeft: 4 }}>
                    {task.user.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};



export default TaskCard;