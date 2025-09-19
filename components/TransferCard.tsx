
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows } from '../styles/commonStyles';
import { Tables } from '../app/integrations/supabase/types';
import { formatFileSize } from '../utils/fileUtils';
import { formatAppSize } from '../utils/appUtils';
import Icon from './Icon';

interface TransferCardProps {
  transfer: Tables<'transfers'>;
  onPress?: () => void;
  currentUserId?: string | null;
}

export default function TransferCard({ transfer, onPress, currentUserId }: TransferCardProps) {
  const isSender = transfer.sender_device_id === currentUserId;
  const isApplication = transfer.file_type === 'application';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'in_progress': return colors.primary;
      case 'completed': return colors.success;
      case 'failed': return colors.error;
      case 'cancelled': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'failed': return 'Échec';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return 'image-outline';
      case 'video': return 'videocam-outline';
      case 'application': return 'apps-outline';
      case 'document': return 'document-outline';
      default: return 'document-outline';
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
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getTransferTypeGradient = () => {
    if (isApplication) {
      return [colors.warning, '#D97706'];
    }
    return isSender ? [colors.primary, colors.secondary] : [colors.success, '#059669'];
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.typeIndicator}>
            <LinearGradient
              colors={getTransferTypeGradient()}
              style={styles.typeGradient}
            >
              <Icon 
                name={getFileIcon(transfer.file_type)} 
                size={20} 
                color={colors.background} 
              />
            </LinearGradient>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {transfer.file_name}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.fileSize}>
                {isApplication ? formatAppSize(transfer.file_size) : formatFileSize(transfer.file_size)}
              </Text>
              <View style={styles.dot} />
              <Text style={styles.transferType}>
                {isSender ? 'Envoyé' : 'Reçu'}
              </Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transfer.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(transfer.status) }]}>
                {getStatusText(transfer.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.methodContainer}>
            <Icon 
              name={transfer.transfer_method === 'qr_code' ? 'qr-code-outline' : 
                   transfer.transfer_method === 'wifi_direct' ? 'wifi-outline' : 
                   'cloud-outline'} 
              size={16} 
              color={colors.textSecondary} 
            />
            <Text style={styles.methodText}>
              {transfer.transfer_method === 'qr_code' ? 'QR Code' :
               transfer.transfer_method === 'wifi_direct' ? 'Wi-Fi Direct' :
               'Internet'}
            </Text>
          </View>
          
          <Text style={styles.timestamp}>
            {formatDate(transfer.created_at)}
          </Text>
        </View>

        {transfer.progress !== null && transfer.progress > 0 && transfer.progress < 100 && (
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIndicator: {
    marginRight: 12,
  },
  typeGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileSize: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 8,
  },
  transferType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
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
    textAlign: 'right',
  },
});
