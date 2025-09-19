
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
import { colors, commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { useTransfers } from '../../hooks/useTransfers';
import TransferCard from '../../components/TransferCard';
import Icon from '../../components/Icon';
import { router } from 'expo-router';

export default function TransfersScreen() {
  const { user } = useAuth();
  const { transfers, loading, refetch } = useTransfers();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredTransfers = transfers.filter((transfer) => {
    if (filter === 'sent') return transfer.sender_id === user?.id;
    if (filter === 'received') return transfer.receiver_id === user?.id;
    return true;
  });

  const getFilterCount = (filterType: 'all' | 'sent' | 'received') => {
    if (filterType === 'sent') return transfers.filter(t => t.sender_id === user?.id).length;
    if (filterType === 'received') return transfers.filter(t => t.receiver_id === user?.id).length;
    return transfers.length;
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes transferts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/')}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'sent', label: 'Envoyés' },
          { key: 'received', label: 'Reçus' },
        ].map((filterOption) => (
          <TouchableOpacity
            key={filterOption.key}
            style={[
              styles.filterButton,
              filter === filterOption.key && styles.activeFilterButton,
            ]}
            onPress={() => setFilter(filterOption.key as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterOption.key && styles.activeFilterText,
              ]}
            >
              {filterOption.label} ({getFilterCount(filterOption.key as any)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : filteredTransfers.length > 0 ? (
            filteredTransfers.map((transfer) => (
              <TransferCard
                key={transfer.id}
                transfer={transfer}
                currentUserId={user?.id}
                onPress={() => router.push(`/transfer/${transfer.id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="folder-open-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Aucun transfert</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'sent' && 'Vous n\'avez envoyé aucun fichier'}
                {filter === 'received' && 'Vous n\'avez reçu aucun fichier'}
                {filter === 'all' && 'Commencez par envoyer votre premier fichier'}
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/(tabs)/')}
              >
                <Text style={styles.emptyButtonText}>Envoyer un fichier</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
