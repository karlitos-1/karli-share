
import React, { useState, useEffect, useCallback } from 'react';
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
import QRCode from 'react-native-qrcode-svg';
import { colors, commonStyles } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';
import { useTransfers } from '../hooks/useTransfers';
import { formatFileSize, generateEncryptionKey } from '../utils/fileUtils';
import Icon from '../components/Icon';

const { width } = Dimensions.get('window');

export default function TransferScreen() {
  const params = useLocalSearchParams();
  const { deviceId } = useAuth();
  const { createTransfer } = useTransfers();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [transferMethod, setTransferMethod] = useState<'qr_code' | 'wifi_direct' | 'internet'>('qr_code');
  const [loading, setLoading] = useState(false);

  const file = {
    name: params.fileName as string,
    size: parseInt(params.fileSize as string),
    type: params.fileType as string,
    uri: params.fileUri as string,
  };

  const generateQRCode = useCallback(async () => {
    if (!file || !deviceId) return;

    try {
      const encryptionKey = generateEncryptionKey();
      const transferData = {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: file.uri,
        transfer_method: transferMethod,
        encryption_key: encryptionKey,
        sender_device_id: deviceId,
      };

      // Create transfer record
      const transfer = await createTransfer(transferData);
      if (!transfer) {
        Alert.alert('Erreur', 'Impossible de créer le transfert');
        return;
      }

      // Generate QR code data
      const qrData = JSON.stringify({
        transferId: transfer.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        encryptionKey: encryptionKey,
        senderDeviceId: deviceId,
      });

      setQrCode(qrData);
      console.log('QR Code generated for transfer:', transfer.id);
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Erreur', 'Impossible de générer le code QR');
    }
  }, [file, deviceId, transferMethod, createTransfer]);

  useEffect(() => {
    if (file && deviceId) {
      generateQRCode();
    }
  }, [file, deviceId, generateQRCode]);

  const handleMethodChange = (method: 'qr_code' | 'wifi_direct' | 'internet') => {
    setTransferMethod(method);
    setQrCode(null);
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
        return 'Code QR';
      case 'wifi_direct':
        return 'Wi-Fi Direct';
      case 'internet':
        return 'Internet sécurisé';
      default:
        return 'Partage';
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'qr_code':
        return 'Scannez le code QR pour recevoir le fichier';
      case 'wifi_direct':
        return 'Connexion directe entre appareils';
      case 'internet':
        return 'Transfert via serveur sécurisé';
      default:
        return '';
    }
  };

  const handleStartTransfer = () => {
    if (!qrCode) {
      generateQRCode();
      return;
    }
    
    Alert.alert(
      'Transfert prêt',
      'Demandez au destinataire de scanner le code QR pour recevoir le fichier.',
      [{ text: 'OK' }]
    );
  };

  if (!file) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Aucun fichier sélectionné</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Envoyer le fichier</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.fileInfo}>
          <View style={styles.fileIcon}>
            <Icon name="document-outline" size={32} color={colors.primary} />
          </View>
          <View style={styles.fileDetails}>
            <Text style={styles.fileName}>{file.name}</Text>
            <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
            <Text style={styles.fileType}>{file.type}</Text>
          </View>
        </View>

        <View style={styles.methodSelector}>
          <Text style={styles.sectionTitle}>Méthode de transfert</Text>
          {(['qr_code', 'wifi_direct', 'internet'] as const).map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.methodOption,
                transferMethod === method && styles.methodOptionActive,
              ]}
              onPress={() => handleMethodChange(method)}
            >
              <Icon
                name={getMethodIcon(method)}
                size={24}
                color={transferMethod === method ? colors.primary : colors.textSecondary}
              />
              <View style={styles.methodInfo}>
                <Text
                  style={[
                    styles.methodTitle,
                    transferMethod === method && styles.methodTitleActive,
                  ]}
                >
                  {getMethodTitle(method)}
                </Text>
                <Text style={styles.methodDescription}>
                  {getMethodDescription(method)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {transferMethod === 'qr_code' && (
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Code QR</Text>
            <View style={styles.qrContainer}>
              {qrCode ? (
                <QRCode
                  value={qrCode}
                  size={width * 0.6}
                  backgroundColor={colors.background}
                  color={colors.text}
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Icon name="qr-code-outline" size={64} color={colors.textSecondary} />
                  <Text style={styles.qrPlaceholderText}>
                    Génération du code QR...
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.qrInstructions}>
              Demandez au destinataire de scanner ce code QR avec l&apos;application Karli&apos;Share
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.startButton, loading && styles.startButtonDisabled]}
          onPress={handleStartTransfer}
          disabled={loading}
        >
          <Text style={styles.startButtonText}>
            {loading ? 'Préparation...' : 'Prêt à envoyer'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
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
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
    textTransform: 'uppercase',
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
  methodOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  methodTitleActive: {
    color: colors.primary,
  },
  methodDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  qrSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.6,
    height: width * 0.6,
  },
  qrPlaceholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  qrInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: colors.primary,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
