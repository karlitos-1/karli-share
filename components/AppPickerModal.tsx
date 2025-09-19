
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { colors } from '../styles/commonStyles';
import { BlurView } from 'expo-blur';
import Icon from './Icon';
import { getInstalledApps, AppInfo, formatAppSize } from '../utils/appUtils';

interface AppPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectApp: (app: AppInfo) => void;
}

export default function AppPickerModal({
  visible,
  onClose,
  onSelectApp,
}: AppPickerModalProps) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      loadApps();
    }
  }, [visible]);

  const loadApps = async () => {
    setLoading(true);
    try {
      const installedApps = await getInstalledApps();
      setApps(installedApps);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = apps.filter(app =>
    app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAppSelection = (packageName: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(packageName)) {
      newSelected.delete(packageName);
    } else {
      newSelected.add(packageName);
    }
    setSelectedApps(newSelected);
  };

  const handleSendSelected = () => {
    const selectedAppsList = apps.filter(app => selectedApps.has(app.packageName));
    selectedAppsList.forEach(app => onSelectApp(app));
    onClose();
    setSelectedApps(new Set());
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <BlurView intensity={80} style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choisir des applications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une application..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {selectedApps.size > 0 && (
            <View style={styles.selectionBar}>
              <Text style={styles.selectionText}>
                {selectedApps.size} app{selectedApps.size > 1 ? 's' : ''} sélectionnée{selectedApps.size > 1 ? 's' : ''}
              </Text>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendSelected}
              >
                <Text style={styles.sendButtonText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={styles.appsList} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement des applications...</Text>
              </View>
            ) : (
              filteredApps.map((app) => (
                <TouchableOpacity
                  key={app.packageName}
                  style={[
                    styles.appItem,
                    selectedApps.has(app.packageName) && styles.appItemSelected
                  ]}
                  onPress={() => toggleAppSelection(app.packageName)}
                >
                  <Image
                    source={{ uri: app.iconUrl || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop' }}
                    style={styles.appIcon}
                  />
                  <View style={styles.appInfo}>
                    <Text style={styles.appName}>{app.appName}</Text>
                    <Text style={styles.appPackage}>{app.packageName}</Text>
                    <View style={styles.appMeta}>
                      <Text style={styles.appVersion}>v{app.versionName}</Text>
                      {app.apkSize && (
                        <Text style={styles.appSize}>{formatAppSize(app.apkSize)}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.selectionIndicator}>
                    {selectedApps.has(app.packageName) ? (
                      <View style={styles.selectedCircle}>
                        <Icon name="checkmark" size={16} color={colors.background} />
                      </View>
                    ) : (
                      <View style={styles.unselectedCircle} />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ⚠️ Fonctionnalité de démonstration. L'accès aux applications installées nécessite des permissions spéciales.
            </Text>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 20,
    marginBottom: 0,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  appsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    marginVertical: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  appItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  appPackage: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  appVersion: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  appSize: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  selectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
