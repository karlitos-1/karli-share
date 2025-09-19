
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
import { LinearGradient } from 'expo-linear-gradient';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { generateSessionCode } from '../../utils/fileUtils';
import QRCode from 'react-native-qrcode-svg';
import Icon from '../../components/Icon';

const { width } = Dimensions.get('window');

export default function ReceiveScreen() {
  const { deviceId } = useAuth();
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [sessionCode, setSessionCode] = useState<string>('');
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (mode === 'scan') {
      getBarCodeScannerPermissions();
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'generate') {
      generateSession();
    }
  }, [mode, generateSession]);

  const generateSession = useCallback(() => {
    const code = generateSessionCode();
    setSessionCode(code);
    console.log('Generated session code:', code);
  }, []);

  const getBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    console.log('QR Code scanned:', data);

    try {
      const transferData = JSON.parse(data);
      
      if (transferData.type === 'application') {
        Alert.alert(
          'Application reçue',
          `Voulez-vous recevoir l'application "${transferData.app.name}" (${transferData.app.version}) ?`,
          [
            { text: 'Annuler', style: 'cancel', onPress: () => setScanned(false) },
            { 
              text: 'Recevoir', 
              onPress: () => {
                console.log('Receiving application:', transferData.app);
                Alert.alert(
                  'Réception en cours',
                  'L\'application est en cours de réception. Vous recevrez une notification une fois terminé.',
                  [{ text: 'OK', onPress: () => setScanned(false) }]
                );
              }
            }
          ]
        );
      } else if (transferData.type === 'file') {
        Alert.alert(
          'Fichier reçu',
          `Voulez-vous recevoir le fichier "${transferData.file.name}" ?`,
          [
            { text: 'Annuler', style: 'cancel', onPress: () => setScanned(false) },
            { 
              text: 'Recevoir', 
              onPress: () => {
                console.log('Receiving file:', transferData.file);
                Alert.alert(
                  'Réception en cours',
                  'Le fichier est en cours de réception. Vous recevrez une notification une fois terminé.',
                  [{ text: 'OK', onPress: () => setScanned(false) }]
                );
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Code QR invalide',
          'Ce code QR ne contient pas de données de transfert valides.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      Alert.alert(
        'Erreur',
        'Impossible de lire les données du code QR.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const renderGenerateMode = () => (
    <View style={styles.content}>
      <LinearGradient
        colors={[colors.success, '#059669']}
        style={styles.headerGradient}
      >
        <Icon name="qr-code-outline" size={48} color={colors.background} />
        <Text style={styles.headerTitle}>Code de session</Text>
        <Text style={styles.headerSubtitle}>
          Partagez ce code pour recevoir des fichiers
        </Text>
      </LinearGradient>

      <View style={styles.qrContainer}>
        <View style={styles.qrWrapper}>
          <QRCode
            value={JSON.stringify({
              type: 'session',
              sessionCode,
              deviceId,
              timestamp: Date.now(),
            })}
            size={200}
            backgroundColor={colors.background}
            color={colors.text}
          />
        </View>
        
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionLabel}>Code de session</Text>
          <Text style={styles.sessionCode}>{sessionCode}</Text>
        </View>
      </View>

      <View style={styles.instructions}>
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>1</Text>
          </View>
          <Text style={styles.instructionText}>
            Demandez à l'expéditeur de scanner ce code QR
          </Text>
        </View>
        
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>2</Text>
          </View>
          <Text style={styles.instructionText}>
            Ou partagez le code de session : {sessionCode}
          </Text>
        </View>
        
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>3</Text>
          </View>
          <Text style={styles.instructionText}>
            Recevez vos fichiers et applications instantanément
          </Text>
        </View>
      </View>
    </View>
  );

  const renderScanMode = () => {
    if (hasPermission === null) {
      return (
        <View style={[styles.content, { justifyContent: 'center' }]}>
          <Text style={styles.permissionText}>Demande d'autorisation caméra...</Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={[styles.content, { justifyContent: 'center' }]}>
          <Icon name="camera-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.permissionText}>
            Accès à la caméra requis pour scanner les codes QR
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={getBarCodeScannerPermissions}
          >
            <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
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
            Pointez la caméra vers un code QR
          </Text>
          
          {scanned && (
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.scanAgainText}>Scanner à nouveau</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recevoir</Text>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'generate' && styles.modeButtonActive]}
            onPress={() => setMode('generate')}
          >
            <Text style={[styles.modeButtonText, mode === 'generate' && styles.modeButtonTextActive]}>
              Générer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'scan' && styles.modeButtonActive]}
            onPress={() => setMode('scan')}
          >
            <Text style={[styles.modeButtonText, mode === 'scan' && styles.modeButtonTextActive]}>
              Scanner
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === 'generate' ? renderGenerateMode() : renderScanMode()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
  headerGradient: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 16,
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.background,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.background + 'CC',
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 20,
  },
  sessionInfo: {
    alignItems: 'center',
  },
  sessionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sessionCode: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 2,
  },
  instructions: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  instructionNumberText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
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
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scannerText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
    textAlign: 'center',
    marginTop: 32,
    backgroundColor: colors.text + 'AA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scanAgainButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  scanAgainText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  permissionButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
