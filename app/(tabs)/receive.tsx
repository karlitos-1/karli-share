
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../../integrations/supabase/client';
import { generateSessionCode } from '../../utils/fileUtils';

const { width } = Dimensions.get('window');

export default function ReceiveScreen() {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [mode, setMode] = useState<'scan' | 'generate'>('scan');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    getBarCodeScannerPermissions();
  }, []);

  useEffect(() => {
    if (mode === 'generate' && !sessionCode) {
      generateSession();
    }
  }, [mode]);

  const getBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const generateSession = async () => {
    if (!user) return;

    const code = generateSessionCode();
    setSessionCode(code);

    try {
      const { error } = await supabase
        .from('transfer_sessions')
        .insert({
          session_code: code,
          creator_id: user.id,
        });

      if (error) {
        console.error('Error creating session:', error);
        Alert.alert('Erreur', 'Impossible de créer la session');
        return;
      }

      setSessionActive(true);
      console.log('Session created:', code);
    } catch (error) {
      console.error('Error creating session:', error);
      Alert.alert('Erreur', 'Impossible de créer la session');
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    console.log('QR Code scanned:', data);

    try {
      // Parse QR code data
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'karli_share_session' && qrData.sessionCode) {
        // Join session
        const { data: session, error } = await supabase
          .from('transfer_sessions')
          .select('*')
          .eq('session_code', qrData.sessionCode)
          .eq('is_active', true)
          .single();

        if (error || !session) {
          Alert.alert('Erreur', 'Session introuvable ou expirée');
          return;
        }

        Alert.alert(
          'Session trouvée',
          'Vous êtes maintenant connecté à la session de transfert.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      } else {
        Alert.alert('QR Code invalide', 'Ce QR code n\'est pas compatible avec Karli\'Share');
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      Alert.alert('QR Code invalide', 'Format de QR code non reconnu');
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Demande d'autorisation caméra...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Icon name="camera-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.permissionTitle}>Autorisation caméra requise</Text>
          <Text style={styles.permissionText}>
            Pour scanner les QR codes, nous avons besoin d'accéder à votre caméra.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={getBarCodeScannerPermissions}
          >
            <Text style={styles.permissionButtonText}>Autoriser</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recevoir des fichiers</Text>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'scan' && styles.activeModeButton]}
            onPress={() => setMode('scan')}
          >
            <Icon
              name="scan-outline"
              size={20}
              color={mode === 'scan' ? colors.background : colors.textSecondary}
            />
            <Text
              style={[
                styles.modeText,
                mode === 'scan' && styles.activeModeText,
              ]}
            >
              Scanner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'generate' && styles.activeModeButton]}
            onPress={() => setMode('generate')}
          >
            <Icon
              name="qr-code-outline"
              size={20}
              color={mode === 'generate' ? colors.background : colors.textSecondary}
            />
            <Text
              style={[
                styles.modeText,
                mode === 'generate' && styles.activeModeText,
              ]}
            >
              Générer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === 'scan' ? (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.scanner}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>
              Pointez votre caméra vers un QR code Karli'Share
            </Text>
          </View>
          {scanned && (
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.scanAgainText}>Scanner à nouveau</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.generateContainer}>
          <View style={styles.qrContainer}>
            {sessionCode && (
              <QRCode
                value={JSON.stringify({
                  type: 'karli_share_session',
                  sessionCode,
                  userId: user?.id,
                })}
                size={width * 0.6}
                backgroundColor={colors.background}
                color={colors.text}
              />
            )}
          </View>
          
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>Session de réception</Text>
            <Text style={styles.sessionCode}>Code: {sessionCode}</Text>
            <Text style={styles.sessionDescription}>
              Partagez ce QR code ou ce code avec l'expéditeur pour recevoir des fichiers
            </Text>
            
            <View style={styles.sessionStatus}>
              <View style={[styles.statusDot, { backgroundColor: sessionActive ? colors.success : colors.textSecondary }]} />
              <Text style={styles.statusText}>
                {sessionActive ? 'Session active' : 'Session inactive'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={generateSession}
          >
            <Icon name="refresh-outline" size={20} color={colors.primary} />
            <Text style={styles.refreshText}>Nouvelle session</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeModeButton: {
    backgroundColor: colors.primary,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeModeText: {
    color: colors.background,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    borderRadius: 8,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  scanAgainText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  generateContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrContainer: {
    backgroundColor: colors.background,
    padding: 24,
    borderRadius: 16,
    marginVertical: 32,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sessionCode: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 16,
    letterSpacing: 2,
  },
  sessionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
