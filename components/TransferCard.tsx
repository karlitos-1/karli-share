
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Tables } from '../app/integrations/supabase/types';
import { colors } from '../styles/commonStyles';
import { formatFileSize } from '../utils/fileUtils';
import Icon from './Icon';

interface TransferCardProps {
  transfer: Tables<'transfers'>;
  onPress?: () => void;
  currentUserId?: string | null;
}

export default function TransferCard({ transfer, onPress, currentUserId }: TransferCardProps) {
  const isSender = transfer.sender_device_id === currentUserId;
  const isReceiver = transfer.receiver_device_id === currentUserId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'in_progress':
        return colors.warning;
      case 'failed':
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'failed':
        return 'Échec';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return 'image-outline';
    } else if (fileType.startsWith('video/')) {
      return 'videocam-outline';
    } else if (fileType.startsWith('audio/')) {
      return 'musical-notes-outline';
    } else if (fileType.includes('pdf')) {
      return 'document-text-outline';
    } else {
      return 'document-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon
          name={getFileIcon(transfer.file_type)}
          size={24}
          color={colors.primary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.fileName} numberOfLines={1}>
            {transfer.file_name}
          </Text>
          <View style={styles.directionContainer}>
            <Icon
              name={isSender ? 'arrow-up-outline' : 'arrow-down-outline'}
              size={16}
              color={isSender ? colors.primary : colors.success}
            />
            <Text style={styles.directionText}>
              {isSender ? 'Envoyé' : 'Reçu'}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.fileSize}>
            {formatFileSize(transfer.file_size)}
          </Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.date}>
            {formatDate(transfer.created_at)}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(transfer.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(transfer.status) },
              ]}
            >
              {getStatusText(transfer.status)}
            </Text>
          </View>

          {transfer.progress !== null && transfer.progress < 100 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${transfer.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{transfer.progress}%</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fileName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  directionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  directionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileSize: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  separator: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
