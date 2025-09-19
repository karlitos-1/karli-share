
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Tables } from '../app/integrations/supabase/types';
import { formatFileSize } from '../utils/fileUtils';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { colors, shadows } from '../styles/commonStyles';
import { formatAppSize } from '../utils/appUtils';

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
      case 'completed': return colors.success;
      case 'in_progress': return colors.warning;
      case 'failed': return colors.error;
      case 'cancelled': return colors.textSecondary;
      default: return colors.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'failed': return 'Échec';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application') return 'apps-outline';
    if (fileType.startsWith('image')) return 'image-outline';
    if (fileType.startsWith('video')) return 'videocam-outline';
    if (fileType.startsWith('audio')) return 'musical-notes-outline';
    return 'document-outline';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `Il y a ${minutes} min`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `Il y a ${hours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTransferTypeGradient = () => {
    if (transfer.file_type === 'application') {
      return [colors.warning, '#D97706'];
    }
    return isSender ? [colors.primary, colors.secondary] : [colors.success, '#059669'];
  };

  const getTransferDirection = () => {
    if (isSender) return 'Envoyé';
    if (isReceiver) return 'Reçu';
    return 'Transfert';
  };

  const getTransferIcon = () => {
    if (isSender) return 'arrow-up-outline';
    if (isReceiver) return 'arrow-down-outline';
    return 'swap-horizontal-outline';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <LinearGradient
          colors={getTransferTypeGradient()}
          style={styles.iconContainer}
        >
          <Icon 
            name={getFileIcon(transfer.file_type)} 
            size={24} 
            color={colors.background} 
          />
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.fileName} numberOfLines={1}>
              {transfer.file_name}
            </Text>
            <View style={styles.directionContainer}>
              <Icon 
                name={getTransferIcon()} 
                size={16} 
                color={isSender ? colors.primary : colors.success} 
              />
              <Text style={[
                styles.direction,
                { color: isSender ? colors.primary : colors.success }
              ]}>
                {getTransferDirection()}
              </Text>
            </View>
          </View>

          <View style={styles.details}>
            <Text style={styles.fileSize}>
              {transfer.file_type === 'application' 
                ? formatAppSize(transfer.file_size) 
                : formatFileSize(transfer.file_size)
              }
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.method}>
              {transfer.transfer_method === 'qr_code' ? 'QR Code' :
               transfer.transfer_method === 'wifi_direct' ? 'Wi-Fi Direct' :
               transfer.transfer_method === 'internet' ? 'Internet' : 'Inconnu'}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.date}>{formatDate(transfer.created_at)}</Text>
          </View>

          <View style={styles.footer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transfer.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(transfer.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(transfer.status) }]}>
                {getStatusText(transfer.status)}
              </Text>
            </View>

            {transfer.progress > 0 && transfer.status === 'in_progress' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${transfer.progress}%`,
                        backgroundColor: getStatusColor(transfer.status)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{transfer.progress}%</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  },
  direction: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileSize: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  separator: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  method: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 32,
  },
});
