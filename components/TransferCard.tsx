
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../styles/commonStyles';
import { Tables } from '../app/integrations/supabase/types';
import { formatFileSize } from '../utils/fileUtils';
import Icon from './Icon';

interface TransferCardProps {
  transfer: Tables<'transfers'>;
  onPress?: () => void;
  currentUserId?: string;
}

export default function TransferCard({ transfer, onPress, currentUserId }: TransferCardProps) {
  const isReceived = transfer.receiver_id === currentUserId;
  const isSent = transfer.sender_id === currentUserId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'failed':
      case 'cancelled':
        return colors.error;
      case 'in_progress':
        return colors.warning;
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
    if (fileType.startsWith('image/')) return 'image-outline';
    if (fileType.startsWith('video/')) return 'videocam-outline';
    if (fileType.includes('pdf')) return 'document-text-outline';
    return 'document-outline';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.fileInfo}>
          <View style={styles.iconContainer}>
            <Icon
              name={getFileIcon(transfer.file_type)}
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={styles.fileDetails}>
            <Text style={styles.fileName} numberOfLines={1}>
              {transfer.file_name}
            </Text>
            <Text style={styles.fileSize}>
              {formatFileSize(transfer.file_size)}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(transfer.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(transfer.status) }]}>
            {getStatusText(transfer.status)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.direction}>
          {isReceived ? 'Reçu' : 'Envoyé'}
        </Text>
        <Text style={styles.method}>
          {transfer.transfer_method === 'qr_code' && 'QR Code'}
          {transfer.transfer_method === 'wifi_direct' && 'Wi-Fi Direct'}
          {transfer.transfer_method === 'internet' && 'Internet'}
        </Text>
        <Text style={styles.date}>
          {new Date(transfer.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {transfer.status === 'in_progress' && (
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 14,
    color: colors.textSecondary,
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
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  direction: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  method: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
