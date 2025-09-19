
import { colors, commonStyles } from '../../styles/commonStyles';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import QRCode from 'react-native-qrcode-svg';
import { generateSessionCode } from '../../utils/fileUtils';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { supabase } from '../../app/integrations/supabase/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
    ...commonStyles.shadow,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeModeButtonText: {
    color: colors.background,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  qrCode: {
    marginBottom: 20,
  },
  sessionCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  sessionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    ...commonStyles.shadow,
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  permissionButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function ReceiveScreen() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [sessionCode, setSessionCode] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  const generateSession = useCallback(async () => {
    if (!user) return;

    const code = generateSessionCode();
    setSessionCode(code);

    try {
      const { error } = await supabase
        .from('transfer_sessions')
        .insert({
          session_code: code,
          creator_id: user.id,
          is_active: true,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        });

      if (error) {
        console.error('Error creating session:', error);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }, [user]);

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
    setScanned(true);
    Alert.alert(
      'QR Code Scanned',
      `Data: ${data}`,
      [
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
        {
          text: 'OK',
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  const renderGenerateMode = () => (
    <View style={styles.qrContainer}>
      <View style={styles.qrCard}>
        <View style={styles.qrCode}>
          <QRCode
            value={sessionCode}
            size={width * 0.5}
            backgroundColor={colors.background}
            color={colors.text}
          />
        </View>
        <Text style={styles.sessionCode}>{sessionCode}</Text>
        <Text style={styles.sessionLabel}>Session Code</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={generateSession}>
          <Icon name="refresh" size={20} color={colors.background} />
          <Text style={styles.refreshButtonText}>Generate New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScanMode = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to scan QR codes
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={getBarCodeScannerPermissions}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerText}>
            Point your camera at a QR code to scan
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Receive Files</Text>
          <Text style={styles.subtitle}>
            {mode === 'generate'
              ? 'Share this QR code to receive files'
              : 'Scan a QR code to connect'}
          </Text>
        </View>

        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'generate' && styles.activeModeButton,
            ]}
            onPress={() => setMode('generate')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'generate' && styles.activeModeButtonText,
              ]}
            >
              Generate QR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'scan' && styles.activeModeButton,
            ]}
            onPress={() => setMode('scan')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'scan' && styles.activeModeButtonText,
              ]}
            >
              Scan QR
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'generate' ? renderGenerateMode() : renderScanMode()}
      </View>
    </SafeAreaView>
  );
}
