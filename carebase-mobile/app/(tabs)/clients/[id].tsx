import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, screenPadding } from '../../../lib/theme';
import { api, endpoints, Client, Shift, VisitNote } from '../../../lib/api';
import {
  CarebaseCard,
  ScreenPaddedCard,
  LoadingView,
  ErrorStateView,
  StatusBadge,
  getClientStatusVariant,
  getShiftStatusVariant,
} from '../../../components/ui';
import { formatShiftTime, getShiftDateLabel, formatRelativeTime } from '../../../lib/utils/dates';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [recentNotes, setRecentNotes] = useState<VisitNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClientData = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);
      const [clientResponse, shiftsResponse, notesResponse] = await Promise.all([
        api.get<{ client: Client }>(endpoints.client(id)),
        api.get<{ shifts: Shift[] }>(endpoints.shifts, { clientId: id, filter: 'upcoming', limit: 3 }),
        api.get<{ visitNotes: VisitNote[] }>(endpoints.visitNotes, { clientId: id, limit: 3 }),
      ]);
      setClient(clientResponse.client);
      setUpcomingShifts(shiftsResponse.shifts || []);
      setRecentNotes(notesResponse.visitNotes || []);
    } catch (err) {
      console.error('Client load error:', err);
      setError('Failed to load client details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadClientData();
  }, [loadClientData]);

  const handleCall = () => {
    if (client?.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleEmail = () => {
    if (client?.email) {
      Linking.openURL(`mailto:${client.email}`);
    }
  };

  if (isLoading) {
    return <LoadingView message="Loading client details..." />;
  }

  if (error || !client) {
    return <ErrorStateView message={error || 'Client not found'} onRetry={loadClientData} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
        />
      }
    >
      {/* Client Header */}
      <ScreenPaddedCard>
        <View style={styles.clientHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>
              {client.firstName[0]}{client.lastName[0]}
            </Text>
          </View>
          <View style={styles.clientDetails}>
            <Text style={[styles.clientName, { color: colors.textPrimary }]}>
              {client.firstName} {client.lastName}
            </Text>
            <StatusBadge
              label={client.status}
              variant={getClientStatusVariant(client.status)}
            />
          </View>
        </View>
      </ScreenPaddedCard>

      {/* Contact Actions */}
      {(client.phone || client.email) && (
        <View style={styles.actionsRow}>
          {client.phone && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background }]}
              onPress={handleCall}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.successSoft }]}>
                <Ionicons name="call" size={20} color={colors.success} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Call</Text>
            </TouchableOpacity>
          )}
          {client.email && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background }]}
              onPress={handleEmail}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.infoSoft }]}>
                <Ionicons name="mail" size={20} color={colors.info} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Email</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Contact Info */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Contact Information
        </Text>
      </View>
      <ScreenPaddedCard>
        {client.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={colors.textTertiary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>{client.phone}</Text>
          </View>
        )}
        {client.email && (
          <View style={[styles.infoRow, client.phone && styles.infoRowMargin]}>
            <Ionicons name="mail-outline" size={18} color={colors.textTertiary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>{client.email}</Text>
          </View>
        )}
        {client.address && (
          <View style={[styles.infoRow, (client.phone || client.email) && styles.infoRowMargin]}>
            <Ionicons name="location-outline" size={18} color={colors.textTertiary} />
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>{client.address}</Text>
          </View>
        )}
      </ScreenPaddedCard>

      {/* Care Needs */}
      {client.careNeeds && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Care Needs
            </Text>
          </View>
          <ScreenPaddedCard>
            <Text style={[styles.careNeedsText, { color: colors.textPrimary }]}>
              {client.careNeeds}
            </Text>
          </ScreenPaddedCard>
        </>
      )}

      {/* Upcoming Shifts */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Upcoming Shifts
        </Text>
      </View>
      {upcomingShifts.length === 0 ? (
        <ScreenPaddedCard>
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={24} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No upcoming shifts
            </Text>
          </View>
        </ScreenPaddedCard>
      ) : (
        upcomingShifts.map((shift, index) => (
          <ScreenPaddedCard
            key={shift.id}
            onPress={() => router.push(`/(tabs)/shifts/${shift.id}`)}
            style={index > 0 ? styles.shiftCard : undefined}
          >
            <View style={styles.shiftRow}>
              <View>
                <Text style={[styles.shiftDate, { color: colors.textPrimary }]}>
                  {getShiftDateLabel(shift.scheduledStart)}
                </Text>
                <Text style={[styles.shiftTime, { color: colors.textSecondary }]}>
                  {formatShiftTime(shift.scheduledStart, shift.scheduledEnd)}
                </Text>
              </View>
              <View style={styles.shiftStatus}>
                <StatusBadge
                  label={shift.status.replace('_', ' ')}
                  variant={getShiftStatusVariant(shift.status)}
                  size="small"
                />
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </View>
            </View>
          </ScreenPaddedCard>
        ))
      )}

      {/* Recent Notes */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Recent Notes
        </Text>
      </View>
      {recentNotes.length === 0 ? (
        <ScreenPaddedCard>
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={24} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No visit notes yet
            </Text>
          </View>
        </ScreenPaddedCard>
      ) : (
        recentNotes.map((note, index) => (
          <ScreenPaddedCard
            key={note.id}
            onPress={() => router.push(`/(tabs)/visit-notes/${note.id}`)}
            style={index > 0 ? styles.noteCard : undefined}
          >
            <View style={styles.noteRow}>
              <View>
                <Text style={[styles.noteTitle, { color: colors.textPrimary }]}>
                  {note.templateName}
                </Text>
                <Text style={[styles.noteTime, { color: colors.textTertiary }]}>
                  {formatRelativeTime(note.submittedAt)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </View>
          </ScreenPaddedCard>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.title2,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    ...typography.title2,
    marginBottom: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: screenPadding,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  actionLabel: {
    ...typography.labelMedium,
  },
  sectionHeader: {
    paddingHorizontal: screenPadding,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.labelMedium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRowMargin: {
    marginTop: spacing.md,
  },
  infoText: {
    ...typography.bodyMedium,
    marginLeft: spacing.md,
    flex: 1,
  },
  careNeedsText: {
    ...typography.bodyMedium,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  emptyText: {
    ...typography.bodyMedium,
    marginLeft: spacing.sm,
  },
  shiftCard: {
    marginTop: spacing.sm,
  },
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftDate: {
    ...typography.headlineSmall,
  },
  shiftTime: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  shiftStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noteCard: {
    marginTop: spacing.sm,
  },
  noteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTitle: {
    ...typography.headlineSmall,
  },
  noteTime: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
});
