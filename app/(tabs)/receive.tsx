
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { generateSessionCode } from '../../utils/fileUtils';
import Icon from '../../components/Icon';

const { width } = Dimensions.get('window');

export default function ReceiveScreen() {
  const { deviceId } = useAuth();
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const generateSession = useCallback(async () => {
    if (!deviceId) return;
    
    try {
      const code = generateSessionCode();
      setSessionCode(code);
      console.log('Generated session code:', code);
    } catch (error) {
      console.error('Error generating session code:', error);
    }
  }, [deviceId]);

  useEffect(() => {
    if (mode === 'generate') {
      generateSession();
    }
  }, [mode, generateSession]);

  useEffect(() => {
    getBarCodeScannerPermissions();
  }, []);

  const getBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setIsCameraActive(false);
    
    try {
      const transferData = JSON.parse(data);
      console.log('Scanned transfer data:', transferData);
      
      Alert.alert(
        'Fichier détecté',
        `Voulez-vous recevoir "${transferData.fileName}" (${transferData.fileSize} bytes) ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Recevoir', 
            onPress: () => {
              // Here you would implement the file receiving logic
              Alert.alert('Succès', 'Réception du fichier en cours...');
            }
          },
        ]
      );
    } catch (error) {
      console.error('Error parsing QR code:', error);
      Alert.alert('Erreur', 'Code QR invalide');
    }
  };

  const renderGenerateMode = () => (
    <View style={styles.content}>
      <View style={styles.modeHeader}>
        <Text style={styles.modeTitle}>Code de session</Text>
        <Text style={styles.modeDescription}>
          Partagez ce code avec l&apos;expéditeur pour recevoir des fichiers
        </Text>
      </View>

      <View style={styles.sessionContainer}>
        <View style={styles.qrContainer}>
          {sessionCode ? (
            <QRCode
              value={sessionCode}
              size={width * 0.5}
              backgroundColor={colors.background}
              color={colors.text}
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Icon name="qr-code-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>Génération du code...</Text>
            </View>
          )}
        </View>

        <View style={styles.sessionCodeContainer}>
          <Text style={styles.sessionCodeLabel}>Code de session</Text>
          <Text style={styles.sessionCodeText}>{sessionCode || '------'}</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={generateSession}
        >
          <Icon name="refresh-outline" size={20} color={colors.primary} />
          <Text style={styles.refreshButtonText}>Nouveau code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScanMode = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.content}>
          <Text style={styles.permissionText}>Demande d&apos;autorisation caméra...</Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.content}>
          <Icon name="camera-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.permissionText}>
            Accès à la caméra refusé. Veuillez autoriser l&apos;accès dans les paramètres.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={getBarCodeScannerPermissions}
          >
            <Text style={styles.permissionButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <View style={styles.modeHeader}>
          <Text style={styles.modeTitle}>Scanner un code QR</Text>
          <Text style={styles.modeDescription}>
            Pointez la caméra vers le code QR de l&apos;expéditeur
          </Text>
        </View>

        <View style={styles.scannerContainer}>
          {isCameraActive ? (
            <BarCodeScanner
              onBarCodeScanned={handleBarCodeScanned}
              style={styles.scanner}
            />
          ) : (
            <View style={styles.scannerPlaceholder}>
              <Icon name="camera-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>Caméra inactive</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setIsCameraActive(!isCameraActive)}
        >
          <Text style={styles.scanButtonText}>
            {isCameraActive ? 'Arrêter la caméra' : 'Activer la caméra'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recevoir</Text>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'generate' && styles.modeButtonActive]}
          onPress={() => setMode('generate')}
        >
          <Icon
            name="qr-code-outline"
            size={20}
            color={mode === 'generate' ? colors.background : colors.textSecondary}
          />
          <Text
            style={[
              styles.modeButtonText,
              mode === 'generate' && styles.modeButtonTextActive,
            ]}
          >
            Générer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === 'scan' && styles.modeButtonActive]}
          onPress={() => setMode('scan')}
        >
          <Icon
            name="camera-outline"
            size={20}
            color={mode === 'scan' ? colors.background : colors.textSecondary}
          />
          <Text
            style={[
              styles.modeButtonText,
              mode === 'scan' && styles.modeButtonTextActive,
            ]}
          >
            Scanner
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'generate' ? renderGenerateMode() : renderScanMode()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  modeSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sessionContainer: {
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: colors.backgroundAlt,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.5,
    height: width * 0.5,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  sessionCodeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sessionCodeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  sessionCodeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  scannerContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    height: width * 0.8,
  },
  scanner: {
    flex: 1,
  },
  scannerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
