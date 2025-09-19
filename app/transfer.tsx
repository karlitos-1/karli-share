
import { formatFileSize, generateEncryptionKey } from '../utils/fileUtils';
import Icon from '../components/Icon';
import React, { useState, useEffect, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransfers } from '../hooks/useTransfers';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  fileInfo: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...commonStyles.shadow,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fileSize: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fileType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  methodSelector: {
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  methodOptions: {
    gap: 12,
  },
  methodOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    ...commonStyles.shadow,
  },
  selectedMethod: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  methodDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  qrContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    ...commonStyles.shadow,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  qrCode: {
    marginBottom: 16,
  },
  qrInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
  },
});

export default function TransferScreen() {
  const params = useLocalSearchParams();
  const { createTransfer } = useTransfers();
  const { user } = useAuth();
  const [transferMethod, setTransferMethod] = useState<'qr_code' | 'wifi_direct' | 'internet'>('qr_code');
  const [qrData, setQrData] = useState('');

  const generateQRCode = useCallback(() => {
    if (!params.fileName || !params.fileSize || !params.fileType) return;

    const transferData = {
      fileName: params.fileName as string,
      fileSize: parseInt(params.fileSize as string),
      fileType: params.fileType as string,
      method: transferMethod,
      encryptionKey: generateEncryptionKey(),
    };

    setQrData(JSON.stringify(transferData));
  }, [params.fileName, params.fileSize, params.fileType, transferMethod]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const handleMethodChange = (method: 'qr_code' | 'wifi_direct' | 'internet') => {
    setTransferMethod(method);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'qr_code':
        return 'qr-code';
      case 'wifi_direct':
        return 'wifi';
      case 'internet':
        return 'globe';
      default:
        return 'qr-code';
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
        return 'QR Code';
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'qr_code':
        return 'Share via QR code scanning';
      case 'wifi_direct':
        return 'Direct connection via Wi-Fi';
      case 'internet':
        return 'Secure transfer over internet';
      default:
        return 'Share via QR code scanning';
    }
  };

  const handleStartTransfer = async () => {
    if (!user || !params.fileName) return;

    try {
      const transfer = await createTransfer({
        file_name: params.fileName as string,
        file_size: parseInt(params.fileSize as string),
        file_type: params.fileType as string,
        transfer_method: transferMethod,
        status: 'pending',
        progress: 0,
        encryption_key: generateEncryptionKey(),
        qr_code_data: qrData,
      });

      if (transfer) {
        Alert.alert('Success', 'Transfer initiated successfully');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to initiate transfer');
      }
    } catch (error) {
      console.error('Error starting transfer:', error);
      Alert.alert('Error', 'Failed to initiate transfer');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Transfer File</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{params.fileName}</Text>
          <View style={styles.fileDetails}>
            <Text style={styles.fileSize}>
              {formatFileSize(parseInt(params.fileSize as string) || 0)}
            </Text>
            <Text style={styles.fileType}>{params.fileType}</Text>
          </View>
        </View>

        <View style={styles.methodSelector}>
          <Text style={styles.selectorTitle}>Transfer Method</Text>
          <View style={styles.methodOptions}>
            {(['qr_code', 'wifi_direct', 'internet'] as const).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodOption,
                  transferMethod === method && styles.selectedMethod,
                ]}
                onPress={() => handleMethodChange(method)}
              >
                <View style={styles.methodIcon}>
                  <Icon
                    name={getMethodIcon(method)}
                    size={20}
                    color={colors.background}
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>
                    {getMethodTitle(method)}
                  </Text>
                  <Text style={styles.methodDescription}>
                    {getMethodDescription(method)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {transferMethod === 'qr_code' && qrData && (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>QR Code</Text>
            <View style={styles.qrCode}>
              <QRCode
                value={qrData}
                size={width * 0.6}
                backgroundColor={colors.background}
                color={colors.text}
              />
            </View>
            <Text style={styles.qrInstructions}>
              Ask the recipient to scan this QR code to receive the file
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.button} onPress={handleStartTransfer}>
            <Icon name="send" size={20} color={colors.background} />
            <Text style={styles.buttonText}>Start Transfer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
