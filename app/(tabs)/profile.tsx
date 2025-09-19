
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { useTransfers } from '../../hooks/useTransfers';
import SimpleBottomSheet from '../../components/BottomSheet';
import Icon from '../../components/Icon';

const PROFILE_KEY = 'karli_share_profile';

interface ProfileData {
  displayName: string;
  deviceName: string;
}

export default function ProfileScreen() {
  const { deviceId } = useAuth();
  const { transfers } = useTransfers();
  const [profile, setProfile] = useState<ProfileData>({
    displayName: 'Utilisateur',
    deviceName: 'Mon appareil',
  });
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>({
    displayName: '',
    deviceName: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(PROFILE_KEY);
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setProfile(profileData);
        setEditForm(profileData);
      } else {
        // Set default values
        const defaultProfile = {
          displayName: 'Utilisateur',
          deviceName: 'Mon appareil',
        };
        setProfile(defaultProfile);
        setEditForm(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(editForm));
      setProfile(editForm);
      setShowEditSheet(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
    }
  };

  const clearData = () => {
    Alert.alert(
      'Effacer les données',
      'Êtes-vous sûr de vouloir effacer toutes les données de l\'application ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Succès', 'Toutes les données ont été effacées');
              // Reset to default values
              const defaultProfile = {
                displayName: 'Utilisateur',
                deviceName: 'Mon appareil',
              };
              setProfile(defaultProfile);
              setEditForm(defaultProfile);
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Erreur', 'Impossible d\'effacer les données');
            }
          },
        },
      ]
    );
  };

  // Calculate statistics
  const sentTransfers = transfers.filter(t => t.sender_device_id === deviceId);
  const receivedTransfers = transfers.filter(t => t.receiver_device_id === deviceId);
  const totalDataTransferred = transfers.reduce((total, transfer) => {
    if (transfer.sender_device_id === deviceId || transfer.receiver_device_id === deviceId) {
      return total + (transfer.file_size || 0);
    }
    return total;
  }, 0);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowEditSheet(true)}
          >
            <Icon name="settings" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{profile.displayName}</Text>
            <Text style={styles.deviceName}>{profile.deviceName}</Text>
            <Text style={styles.deviceId}>ID: {deviceId?.slice(-8)}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditSheet(true)}
            >
              <Text style={styles.editButtonText}>Modifier le profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Statistiques</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sentTransfers.length}</Text>
              <Text style={styles.statLabel}>Fichiers envoyés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{receivedTransfers.length}</Text>
              <Text style={styles.statLabel}>Fichiers reçus</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatBytes(totalDataTransferred)}</Text>
              <Text style={styles.statLabel}>Données transférées</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={clearData}>
            <Icon name="trash-outline" size={20} color={colors.error} />
            <Text style={styles.actionButtonText}>Effacer les données</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SimpleBottomSheet
        isVisible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Modifier le profil</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom d&apos;affichage</Text>
            <TextInput
              style={styles.input}
              value={editForm.displayName}
              onChangeText={(text) => setEditForm({ ...editForm, displayName: text })}
              placeholder="Entrez votre nom"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom de l&apos;appareil</Text>
            <TextInput
              style={styles.input}
              value={editForm.deviceName}
              onChangeText={(text) => setEditForm({ ...editForm, deviceName: text })}
              placeholder="Entrez le nom de votre appareil"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setShowEditSheet(false)}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={saveProfile}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Sauvegarder
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.background,
  },
  profileInfo: {
    alignItems: 'center',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  editButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: colors.background,
  },
  secondaryButtonText: {
    color: colors.text,
  },
});
