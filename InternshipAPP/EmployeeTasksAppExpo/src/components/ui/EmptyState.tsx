import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';

type EmptyStateType = 'empty' | 'error' | 'no-results' | 'offline';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'empty':
        return {
          icon: 'document-outline' as keyof typeof Ionicons.glyphMap,
          title: 'Henüz görev yok',
          description: 'Yeni görevler eklendiğinde burada görünecek.',
          actionLabel: 'Yenile',
        };
      case 'error':
        return {
          icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap,
          title: 'Bir hata oluştu',
          description: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
          actionLabel: 'Tekrar Dene',
        };
      case 'no-results':
        return {
          icon: 'search-outline' as keyof typeof Ionicons.glyphMap,
          title: 'Sonuç bulunamadı',
          description: 'Arama kriterlerinize uygun sonuç bulunamadı.',
          actionLabel: 'Aramayı Temizle',
        };
      case 'offline':
        return {
          icon: 'cloud-offline-outline' as keyof typeof Ionicons.glyphMap,
          title: 'İnternet bağlantısı yok',
          description: 'Lütfen internet bağlantınızı kontrol edin.',
          actionLabel: 'Tekrar Dene',
        };
      default:
        return {
          icon: 'document-outline' as keyof typeof Ionicons.glyphMap,
          title: 'Boş',
          description: 'İçerik bulunamadı.',
          actionLabel: 'Yenile',
        };
    }
  };

  const defaultContent = getDefaultContent();
  const finalIcon = icon || defaultContent.icon;
  const finalTitle = title || defaultContent.title;
  const finalDescription = description || defaultContent.description;
  const finalActionLabel = actionLabel || defaultContent.actionLabel;

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return '#EF4444';
      case 'offline':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  return (
    <View style={[
      {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#F9FAFB',
      },
      style
    ]}>
      <View style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${getIconColor()}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <Ionicons 
          name={finalIcon} 
          size={40} 
          color={getIconColor()} 
        />
      </View>

      <Text style={{
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
      }}>
        {finalTitle}
      </Text>

      <Text style={{
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        maxWidth: 280,
      }}>
        {finalDescription}
      </Text>

      {onAction && (
        <Button
          title={finalActionLabel}
          onPress={onAction}
          variant={type === 'error' ? 'primary' : 'outline'}
          size="md"
        />
      )}
    </View>
  );
};

export default EmptyState;
export type { EmptyStateProps };