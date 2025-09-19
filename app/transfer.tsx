
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, commonStyles } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';
import { useTransfers } from '../hooks/useTransfers';
import { router, useLocalSearchParams } from 'expo-router';
import { formatFileSize, generateEncryptionKey } from '../utils/fileUtils';
import { formatAppSize } from '../utils/appUtils';
import QRCode from 'react-native-qrcode-svg';
import Icon from '../components/Icon';

const { width } = Dimensions.get('window');

export default function TransferScreen() {
  const params = useLocalSearchParams();
  const { createTransfer, uploadFile, transferProgress } = useTransfers();
  const { deviceId } = useAuth();
  const [transferMethod, setTransferMethod] = useState<'qr_code' | 'wifi_direct' | 'internet'>('qr_code');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTransfer, setCurrentTransfer] = useState<any>(null);

  const file = useMemo(() => {
    return params.fileName ? {
      name: params.fileName as string,
      size: parseInt(params.fileSize as string) || 0,
      type: params.fileType as string,
      uri: params.fileUri as string,
    } : null;
  }, [params.fileName, params.fileSize, params.fileType, params.fileUri]);

  const app = useMemo(() => {
    return params.appName ? {
      name: params.appName as string,
      packageName: params.appPackage as string,
      version: params.appVersion as string,
      icon: params.appIcon as string,
      size: parseInt(params.fileSize as string) || 0,
    } : null;
  }, [params.appName, params.appPackage, params.appVersion, params.appIcon, params.fileSize]);

  const isApplication = params.fileType === 'application';

  const generateQRCode = useCallback(async () => {
    if (!deviceId || (!file && !app)) return;

    setIsGenerating(true);
    try {
      const encryptionKey = generateEncryptionKey();
      const transferData = {
        deviceId,
        encryptionKey,
        method: transferMethod,
        timestamp: Date.now(),
        ...(isApplication && app ? {
          type: 'application',
          app: {
            name: app.name,
            packageName: app.packageName,
            version: app.version,
            icon: app.icon,
            size: app.size,
          }
        } : {
          type: 'file',
          file: {
            name: file?.name,
            size: file?.size,
            type: file?.type,
            uri: file?.uri,
          }
        })
      };

      const qrData = JSON.stringify(transferData);
      setQrCodeData(qrData);
      console.log('QR Code generated:', qrData);
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Erreur', 'Impossible de générer le code QR');
    } finally {
      setIsGenerating(false);
    }
  }, [file, app, deviceId, transferMethod, isApplication]);

  useEffect(() => {
    if ((file || app) && deviceId) {
      generateQRCode();
    }
  }, [file, app, deviceId, generateQRCode]);

  const handleMethodChange = (method: 'qr_code' | 'wifi_direct' | 'internet') => {
    setTransferMethod(method);
    generateQRCode();
  };

  const handleStartTransfer = useCallback(async () => {
    if (!deviceId || (!file && !app)) return;

    try {
      const transferData = {
        sender_device_id: deviceId,
        file_name: isApplication && app ? `${app.name}.apk` : file?.name || '',
        file_size: isApplication && app ? app.size : file?.size || 0,
        file_type: isApplication ? 'application' : file?.type || 'other',
        transfer_method: transferMethod,
        status: 'pending' as const,
        encryption_key: generateEncryptionKey(),
        qr_code_data: qrCodeData,
      };

      const transfer = await createTransfer(transferData);
      if (!transfer) {
        Alert.alert('Erreur', 'Impossible de créer le transfert');
        return;
      }

      setCurrentTransfer(transfer);

      // If it's a file (not application), start uploading immediately
      if (file && file.uri) {
        console.log('Starting file upload for transfer:', transfer.id);
        const success = await uploadFile(transfer.id, file.uri);
        
        if (success) {
          Alert.alert(
            'Transfert créé',
            'Le fichier a été préparé avec succès. Partagez le code QR avec le destinataire.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Erreur', 'Échec de l\'envoi du fichier');
        }
      } else {
        // For applications, just create the transfer record
        Alert.alert(
          'Transfert créé',
          'Le transfert a été créé avec succès. Partagez le code QR avec le destinataire.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      Alert.alert('Erreur', 'Impossible de créer le transfert');
    }
  }, [file, app, deviceId, transferMethod, isApplication, qrCodeData, createTransfer, uploadFile]);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'qr_code': return 'qr-code-outline';
      case 'wifi_direct': return 'wifi-outline';
      case 'internet': return 'cloud-outline';
      default: return 'help-outline';
    }
  };

  const getMethodTitle = (method: string) => {
    switch (method) {
      case 'qr_code': return 'Code QR';
      case 'wifi_direct': return 'Wi-Fi Direct';
      case 'internet': return 'Internet';
      default: return 'Inconnu';
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'qr_code': return 'Scan rapide et sécurisé';
      case 'wifi_direct': return 'Connexion directe sans internet';
      case 'internet': return 'Via serveur sécurisé';
      default: return '';
    }
  };

  if (!file && !app) {
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

  // Get current transfer progress
  const progress = currentTransfer ? transferProgress.get(currentTransfer.id) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Partager</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* File/App Info Card */}
        <View style={styles.fileCard}>
          <LinearGradient
            colors={isApplication ? [colors.warning, '#D97706'] : [colors.primary, colors.secondary]}
            style={styles.fileCardGradient}
          >
            <View style={styles.fileInfo}>
              {isApplication && app ? (
                <>
                  <Image
                    source={{ uri: app.icon || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop' }}
                    style={styles.appIcon}
                  />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{app.name}</Text>
                    <Text style={styles.fileSubtitle}>{app.packageName}</Text>
                    <Text style={styles.fileSize}>v{app.version} • {formatAppSize(app.size)}</Text>
                  </View>
                  <View style={styles.fileTypeIcon}>
                    <Icon name="apps-outline" size={32} color={colors.background} />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.fileIconContainer}>
                    <Icon 
                      name={file?.type.startsWith('image') ? 'image-outline' : 
                           file?.type.startsWith('video') ? 'videocam-outline' : 
                           'document-outline'} 
                      size={32} 
                      color={colors.background} 
                    />
                  </View>
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{file?.name}</Text>
                    <Text style={styles.fileSubtitle}>{file?.type}</Text>
                    <Text style={styles.fileSize}>{formatFileSize(file?.size || 0)}</Text>
                  </View>
                </>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Progress Indicator */}
        {progress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{progress.message}</Text>
              <Text style={styles.progressPercent}>{progress.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress.progress}%`,
                    backgroundColor: progress.status === 'failed' ? colors.error : colors.success
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Transfer Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Méthode de transfert</Text>
          <View style={styles.methodsContainer}>
            {(['qr_code', 'wifi_direct', 'internet'] as const).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodCard,
                  transferMethod === method && styles.methodCardActive
                ]}
                onPress={() => handleMethodChange(method)}
              >
                <Icon 
                  name={getMethodIcon(method)} 
                  size={24} 
                  color={transferMethod === method ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  styles.methodTitle,
                  transferMethod === method && styles.methodTitleActive
                ]}>
                  {getMethodTitle(method)}
                </Text>
                <Text style={styles.methodDescription}>
                  {getMethodDescription(method)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Code QR</Text>
          <View style={styles.qrContainer}>
            {isGenerating ? (
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>Génération...</Text>
              </View>
            ) : qrCodeData ? (
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={qrCodeData}
                  size={200}
                  backgroundColor={colors.background}
                  color={colors.text}
                />
              </View>
            ) : (
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>Code QR indisponible</Text>
              </View>
            )}
            <Text style={styles.qrInstructions}>
              Demandez au destinataire de scanner ce code QR
            </Text>
          </View>
        </View>

        {/* Start Transfer Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.startButton, (isGenerating || progress) && styles.startButtonDisabled]}
            onPress={handleStartTransfer}
            disabled={isGenerating || !!progress}
          >
            <LinearGradient
              colors={[colors.success, '#059669']}
              style={styles.startButtonGradient}
            >
              <Icon name="send-outline" size={24} color={colors.background} />
              <Text style={styles.startButtonText}>
                {progress ? 'Transfert en cours...' : 'Démarrer le transfert'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  fileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  fileCardGradient: {
    padding: 20,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 16,
  },
  fileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.background + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 4,
  },
  fileSubtitle: {
    fontSize: 14,
    color: colors.background + 'CC',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: colors.background + 'AA',
  },
  fileTypeIcon: {
    marginLeft: 16,
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  methodsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  methodCard: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  methodTitleActive: {
    color: colors.primary,
  },
  methodDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 16,
  },
  qrPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  qrInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(16, 185, 129, 0.3)',
    elevation: 4,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  startButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});
