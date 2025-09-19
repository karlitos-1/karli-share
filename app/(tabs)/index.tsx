
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { useTransfers } from '../../hooks/useTransfers';
import { useNotifications } from '../../hooks/useNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import FilePickerModal from '../../components/FilePickerModal';
import TransferCard from '../../components/TransferCard';
import Icon from '../../components/Icon';
import { pickDocument, pickImage, pickVideo, FileInfo } from '../../utils/fileUtils';
import { router } from 'expo-router';

const ONBOARDING_KEY = 'karli_share_onboarding_completed';

export default function HomeScreen() {
  const { deviceId, loading: authLoading } = useAuth();
  const { transfers, loading: transfersLoading } = useTransfers();
  const { unreadCount } = useNotifications();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding:', error);
    }
  };

  const handleFilePicked = async (file: FileInfo | null) => {
    if (!file) return;

    console.log('File picked:', file);
    // Navigate to transfer screen with file data
    router.push({
      pathname: '/transfer',
      params: {
        fileName: file.name,
        fileSize: file.size.toString(),
        fileType: file.type,
        fileUri: file.uri,
      },
    });
  };

  const handlePickImage = async () => {
    const file = await pickImage();
    handleFilePicked(file);
  };

  const handlePickVideo = async () => {
    const file = await pickVideo();
    handleFilePicked(file);
  };

  const handlePickDocument = async () => {
    const file = await pickDocument();
    handleFilePicked(file);
  };

  if (authLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center' }]}>
          <Text style={commonStyles.text}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const recentTransfers = transfers.slice(0, 3);

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour ! 👋</Text>
            <Text style={styles.subtitle}>Prêt à partager vos fichiers ?</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Icon name="notifications-outline" size={24} color={colors.text} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{unreadCount}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => setShowFilePicker(true)}
          >
            <Icon name="add" size={32} color={colors.background} />
            <Text style={styles.primaryActionText}>Envoyer un fichier</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.push('/(tabs)/receive')}
            >
              <Icon name="qr-code-outline" size={24} color={colors.primary} />
              <Text style={styles.secondaryActionText}>Scanner QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.push('/(tabs)/receive')}
            >
              <Icon name="wifi-outline" size={24} color={colors.primary} />
              <Text style={styles.secondaryActionText}>Recevoir</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transferts récents</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transfers')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {transfersLoading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : recentTransfers.length > 0 ? (
            recentTransfers.map((transfer) => (
              <TransferCard
                key={transfer.id}
                transfer={transfer}
                currentUserId={deviceId}
                onPress={() => router.push(`/transfer/${transfer.id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="folder-open-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Aucun transfert récent</Text>
              <Text style={styles.emptySubtext}>
                Commencez par envoyer votre premier fichier
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <FilePickerModal
        visible={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onPickImage={handlePickImage}
        onPickVideo={handlePickVideo}
        onPickDocument={handlePickDocument}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.3)',
    elevation: 4,
  },
  primaryActionText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryActionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    paddingVertical: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
