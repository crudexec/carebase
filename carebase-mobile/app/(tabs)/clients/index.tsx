import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, screenPadding } from '../../../lib/theme';
import { api, endpoints, Client } from '../../../lib/api';
import { CarebaseCard, CarebaseTextField, LoadingView, ErrorStateView, EmptyStateView, StatusBadge, getClientStatusVariant } from '../../../components/ui';

export default function ClientsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get<{ clients: Client[] }>(endpoints.clients);
      setClients(response.clients || []);
      setFilteredClients(response.clients || []);
    } catch (err) {
      console.error('Clients load error:', err);
      setError('Failed to load clients');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredClients(
        clients.filter(
          (client) =>
            client.firstName.toLowerCase().includes(query) ||
            client.lastName.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, clients]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadClients();
  }, [loadClients]);

  const renderClientItem = ({ item: client }: { item: Client }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/clients/${client.id}`)}
      style={styles.clientItemContainer}
    >
      <CarebaseCard>
        <View style={styles.clientRow}>
          <View style={styles.clientInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.avatarText, { color: colors.accent }]}>
                {client.firstName[0]}{client.lastName[0]}
              </Text>
            </View>
            <View style={styles.clientDetails}>
              <Text style={[styles.clientName, { color: colors.textPrimary }]}>
                {client.firstName} {client.lastName}
              </Text>
              {client.address && (
                <Text style={[styles.clientAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                  {client.address}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.statusContainer}>
            <StatusBadge
              label={client.status}
              variant={getClientStatusVariant(client.status)}
              size="small"
            />
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
              style={styles.chevron}
            />
          </View>
        </View>
      </CarebaseCard>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <LoadingView message="Loading clients..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Clients</Text>
      </View>

      <View style={styles.searchContainer}>
        <CarebaseTextField
          placeholder="Search clients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          rightIcon={searchQuery ? 'close-circle' : undefined}
          onRightIconPress={() => setSearchQuery('')}
        />
      </View>

      {error ? (
        <ErrorStateView message={error} onRetry={loadClients} />
      ) : filteredClients.length === 0 ? (
        <EmptyStateView
          icon="people-outline"
          title={searchQuery ? 'No Results' : 'No Clients'}
          message={
            searchQuery
              ? `No clients match "${searchQuery}"`
              : "You don't have any clients assigned yet."
          }
        />
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          renderItem={renderClientItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.title1,
  },
  searchContainer: {
    paddingHorizontal: screenPadding,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.xxl,
  },
  clientItemContainer: {
    marginBottom: spacing.sm,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.labelMedium,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    ...typography.headlineSmall,
  },
  clientAddress: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});
