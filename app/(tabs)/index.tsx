
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { useTransfers } from '../../hooks/useTransfers';
import { useNotifications } from '../../hooks/useNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import FilePickerModal from '../../components/FilePickerModal';
import AppPickerModal from '../../components/AppPickerModal';
import TransferCard from '../../components/TransferCard';
import Icon from '../../components/Icon';
import { pickDocument, pickImage, pickVideo, FileInfo } from '../../utils/fileUtils';
import { AppInfo } from '../../utils/appUtils';
import { router } from 'expo-router';

const ONBOARDING_KEY = 'karli_share_onboarding_completed';
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { deviceId, loading: authLoading } = useAuth();
  const { transfers, loading: transfersLoading } = useTransfers();
  const { unreadCount } = useNotifications();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showAppPicker, setShowAppPicker] = useState(false);

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

  const handleAppSelected = async (app: AppInfo) => {
    console.log('App selected:', app);
    router.push({
      pathname: '/transfer',
      params: {
        fileName: `${app.appName}.apk`,
        fileSize: (app.apkSize || 0).toString(),
        fileType: 'application',
        appPackage: app.packageName,
        appName: app.appName,
        appVersion: app.versionName || '1.0.0',
        appIcon: app.iconUrl || '',
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with gradient */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/ea7ba2fc-1cf2-4330-a169-2ab9480db233.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View style={styles.titleContainer}>
                  <Text style={styles.greeting}>Karli&apos;Share</Text>
                  <Text style={styles.subtitle}>Partagez facilement vos contenus</Text>
                </View>
              </View>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push('/notifications')}
              >
                <Icon name="notifications-outline" size={24} color={colors.background} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>{unreadCount}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickAction, styles.primaryAction]}
              onPress={() => setShowFilePicker(true)}
            >
              <LinearGradient
                colors={[colors.success, '#059669']}
                style={styles.actionGradient}
              >
                <Icon name="document-outline" size={28} color={colors.background} />
                <Text style={styles.actionText}>Fichiers</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, styles.primaryAction]}
              onPress={() => setShowAppPicker(true)}
            >
              <LinearGradient
                colors={[colors.warning, '#D97706']}
                style={styles.actionGradient}
              >
                <Icon name="apps-outline" size={28} color={colors.background} />
                <Text style={styles.actionText}>Applications</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, styles.secondaryAction]}
              onPress={() => router.push('/(tabs)/receive')}
            >
              <Icon name="qr-code-outline" size={28} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Scanner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, styles.secondaryAction]}
              onPress={() => router.push('/(tabs)/receive')}
            >
              <Icon name="wifi-outline" size={28} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Recevoir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="arrow-up-outline" size={24} color={colors.success} />
              <Text style={styles.statNumber}>
                {transfers.filter(t => t.sender_device_id === deviceId).length}
              </Text>
              <Text style={styles.statLabel}>Envoyés</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="arrow-down-outline" size={24} color={colors.primary} />
              <Text style={styles.statNumber}>
                {transfers.filter(t => t.receiver_device_id === deviceId).length}
              </Text>
              <Text style={styles.statLabel}>Reçus</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="checkmark-circle-outline" size={24} color={colors.success} />
              <Text style={styles.statNumber}>
                {transfers.filter(t => t.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Réussis</Text>
            </View>
          </View>
        </View>

        {/* Recent Transfers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transferts récents</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transfers')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {transfersLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
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
                Commencez par partager votre premier contenu
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

      <AppPickerModal
        visible={showAppPicker}
        onClose={() => setShowAppPicker(false)}
        onSelectApp={handleAppSelected}
      />
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
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerContent: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.background,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.background + 'CC',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: colors.background + '20',
    borderRadius: 12,
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
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: (width - 56) / 2,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryAction: {
    // Gradient will be applied via LinearGradient
  },
  secondaryAction: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
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
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    paddingHorizontal: 20,
  },
});
