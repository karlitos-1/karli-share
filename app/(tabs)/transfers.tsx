
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { useTransfers } from '../../hooks/useTransfers';
import TransferCard from '../../components/TransferCard';
import Icon from '../../components/Icon';

export default function TransfersScreen() {
  const { deviceId } = useAuth();
  const { transfers, loading, refetch } = useTransfers();
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getFilteredTransfers = () => {
    switch (filter) {
      case 'sent':
        return transfers.filter(t => t.sender_device_id === deviceId);
      case 'received':
        return transfers.filter(t => t.receiver_device_id === deviceId);
      default:
        return transfers;
    }
  };

  const getFilterCount = (filterType: 'all' | 'sent' | 'received') => {
    switch (filterType) {
      case 'sent':
        return transfers.filter(t => t.sender_device_id === deviceId).length;
      case 'received':
        return transfers.filter(t => t.receiver_device_id === deviceId).length;
      default:
        return transfers.length;
    }
  };

  const filteredTransfers = getFilteredTransfers();

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transferts</Text>
      </View>

      <View style={styles.filterContainer}>
        {(['all', 'sent', 'received'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === filterType && styles.filterButtonTextActive,
              ]}
            >
              {filterType === 'all' && 'Tous'}
              {filterType === 'sent' && 'Envoyés'}
              {filterType === 'received' && 'Reçus'}
            </Text>
            <View
              style={[
                styles.filterBadge,
                filter === filterType && styles.filterBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  filter === filterType && styles.filterBadgeTextActive,
                ]}
              >
                {getFilterCount(filterType)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : filteredTransfers.length > 0 ? (
          <View style={styles.transfersList}>
            {filteredTransfers.map((transfer) => (
              <TransferCard
                key={transfer.id}
                transfer={transfer}
                currentUserId={deviceId}
                onPress={() => router.push(`/transfer/${transfer.id}`)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="folder-open-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {filter === 'all' && 'Aucun transfert'}
              {filter === 'sent' && 'Aucun fichier envoyé'}
              {filter === 'received' && 'Aucun fichier reçu'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' && 'Vos transferts apparaîtront ici'}
              {filter === 'sent' && 'Les fichiers que vous envoyez apparaîtront ici'}
              {filter === 'received' && 'Les fichiers que vous recevez apparaîtront ici'}
            </Text>
            <TouchableOpacity
              style={styles.emptyAction}
              onPress={() => router.push('/(tabs)/')}
            >
              <Text style={styles.emptyActionText}>Commencer un transfert</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.background,
  },
  filterBadge: {
    backgroundColor: colors.background,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeActive: {
    backgroundColor: colors.background,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  filterBadgeTextActive: {
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  transfersList: {
    padding: 20,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyAction: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyActionText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
