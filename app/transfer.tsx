
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';
import { useTransfers } from '../hooks/useTransfers';
import Icon from '../components/Icon';
import QRCode from 'react-native-qrcode-svg';
import { formatFileSize, generateEncryptionKey } from '../utils/fileUtils';

const { width } = Dimensions.get('window');

export default function TransferScreen() {
  const { user } = useAuth();
  const { createTransfer } = useTransfers();
  const params = useLocalSearchParams();
  const [transferMethod, setTransferMethod] = useState<'qr_code' | 'wifi_direct' | 'internet'>('qr_code');
  const [qrData, setQrData] = useState<string>('');
  const [transferId, setTransferId] = useState<string>('');

  const fileInfo = {
    name: params.fileName as string,
    size: parseInt(params.fileSize as string) || 0,
    type: params.fileType as string,
    uri: params.fileUri as string,
  };

  useEffect(() => {
    if (transferMethod === 'qr_code') {
      generateQRCode();
    }
  }, [transferMethod]);

  const generateQRCode = async () => {
    if (!user) return;

    const encryptionKey = generateEncryptionKey();
    
    // Create transfer record
    const transfer = await createTransfer({
      file_name: fileInfo.name,
      file_size: fileInfo.size,
      file_type: fileInfo.type,
      file_url: fileInfo.uri,
      transfer_method: 'qr_code',
      encryption_key: encryptionKey,
    });

    if (!transfer) {
      Alert.alert('Erreur', 'Impossible de créer le transfert');
      return;
    }

    setTransferId(transfer.id);

    const qrCodeData = {
      type: 'karli_share_transfer',
      transferId: transfer.id,
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      fileType: fileInfo.type,
      encryptionKey,
      senderId: user.id,
    };

    setQrData(JSON.stringify(qrCodeData));
  };

  const handleMethodChange = (method: 'qr_code' | 'wifi_direct' | 'internet') => {
    setTransferMethod(method);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'qr_code':
        return 'qr-code-outline';
      case 'wifi_direct':
        return 'wifi-outline';
      case 'internet':
        return 'cloud-outline';
      default:
        return 'share-outline';
    }
  };

  const getMethodTitle = (method: string) => {
    switch (method) {
      case 'qr_code':
        return 'QR Code';
      case 'wifi_direct':
        return 'Wi-Fi Direct';
      case 'internet':
        return 'Internet';
      default:
        return 'Partage';
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'qr_code':
        return 'Partagez ce QR code avec le destinataire';
      case 'wifi_direct':
        return 'Connexion directe via Wi-Fi (bientôt disponible)';
      case 'internet':
        return 'Transfert via Internet sécurisé (bientôt disponible)';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Envoyer le fichier</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.fileInfo}>
          <View style={styles.fileIcon}>
            <Icon
              name={fileInfo.type.startsWith('image/') ? 'image-outline' : 
                    fileInfo.type.startsWith('video/') ? 'videocam-outline' : 
                    'document-outline'}
              size={32}
              color={colors.primary}
            />
          </View>
          <View style={styles.fileDetails}>
            <Text style={styles.fileName} numberOfLines={2}>
              {fileInfo.name}
            </Text>
            <Text style={styles.fileSize}>
              {formatFileSize(fileInfo.size)}
            </Text>
            <Text style={styles.fileType}>
              {fileInfo.type}
            </Text>
          </View>
        </View>

        <View style={styles.methodSelector}>
          <Text style={styles.sectionTitle}>Méthode de transfert</Text>
          
          {['qr_code', 'wifi_direct', 'internet'].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.methodOption,
                transferMethod === method && styles.activeMethodOption,
                method !== 'qr_code' && styles.disabledMethodOption,
              ]}
              onPress={() => method === 'qr_code' && handleMethodChange(method as any)}
              disabled={method !== 'qr_code'}
            >
              <View style={styles.methodIcon}>
                <Icon
                  name={getMethodIcon(method) as any}
                  size={24}
                  color={method === 'qr_code' ? 
                    (transferMethod === method ? colors.primary : colors.textSecondary) : 
                    colors.grey}
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={[
                  styles.methodTitle,
                  transferMethod === method && styles.activeMethodTitle,
                  method !== 'qr_code' && styles.disabledMethodTitle,
                ]}>
                  {getMethodTitle(method)}
                </Text>
                <Text style={[
                  styles.methodDescription,
                  method !== 'qr_code' && styles.disabledMethodDescription,
                ]}>
                  {getMethodDescription(method)}
                </Text>
              </View>
              {transferMethod === method && (
                <Icon name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {transferMethod === 'qr_code' && qrData && (
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>QR Code de transfert</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={qrData}
                size={width * 0.6}
                backgroundColor={colors.background}
                color={colors.text}
              />
            </View>
            <Text style={styles.qrInstructions}>
              Demandez au destinataire de scanner ce QR code avec Karli'Share
            </Text>
          </View>
        )}

        <View style={styles.securityInfo}>
          <View style={styles.securityHeader}>
            <Icon name="shield-checkmark-outline" size={20} color={colors.success} />
            <Text style={styles.securityTitle}>Transfert sécurisé</Text>
          </View>
          <Text style={styles.securityDescription}>
            Votre fichier est chiffré de bout en bout. Seul le destinataire pourra le déchiffrer.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  fileType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  methodSelector: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeMethodOption: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  disabledMethodOption: {
    opacity: 0.5,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  activeMethodTitle: {
    color: colors.primary,
  },
  disabledMethodTitle: {
    color: colors.grey,
  },
  methodDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  disabledMethodDescription: {
    color: colors.grey,
  },
  qrSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: colors.background,
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  qrInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  securityInfo: {
    backgroundColor: colors.success + '10',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 8,
  },
  securityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
