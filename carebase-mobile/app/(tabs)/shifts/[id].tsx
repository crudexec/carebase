import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, screenPadding, cornerRadius } from '../../../lib/theme';
import { api, endpoints, Shift, VisitNote, APIError } from '../../../lib/api';
import {
  CarebaseButton,
  CarebaseCard,
  ScreenPaddedCard,
  LoadingView,
  ErrorStateView,
  StatusBadge,
  getShiftStatusVariant,
} from '../../../components/ui';
import { formatShiftTime, formatDate, formatTime, formatRelativeTime } from '../../../lib/utils/dates';

export default function ShiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  const [shift, setShift] = useState<Shift | null>(null);
  const [visitNotes, setVisitNotes] = useState<VisitNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadShiftData = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);
      const [shiftResponse, notesResponse] = await Promise.all([
        api.get<{ shift: Shift }>(endpoints.shift(id)),
        api.get<{ visitNotes: VisitNote[] }>(endpoints.visitNotes, { shiftId: id }),
      ]);
      setShift(shiftResponse.shift);
      setVisitNotes(notesResponse.visitNotes || []);
    } catch (err) {
      console.error('Shift load error:', err);
      setError('Failed to load shift details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadShiftData();
  }, [loadShiftData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadShiftData();
  }, [loadShiftData]);

  const handleCheckIn = async () => {
    if (!shift) return;

    setIsCheckingIn(true);
    try {
      await api.post(endpoints.checkIn(shift.id));
      Alert.alert(
        'Checked In',
        `You've started your shift with ${shift.client.firstName}. Have a great visit!`,
        [{ text: 'OK' }]
      );
      loadShiftData();
    } catch (err) {
      if (err instanceof APIError && err.isAlreadyError) {
        loadShiftData();
        Alert.alert('Already Checked In', 'You have already checked in for this shift.');
      } else {
        Alert.alert('Error', 'Failed to check in. Please try again.');
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!shift) return;

    setIsCheckingOut(true);
    try {
      await api.post(endpoints.checkOut(shift.id));
      Alert.alert(
        'Checked Out',
        "You've completed this shift. Great work!",
        [{ text: 'OK' }]
      );
      loadShiftData();
    } catch (err) {
      if (err instanceof APIError && err.isAlreadyError) {
        loadShiftData();
        Alert.alert('Already Checked Out', 'You have already checked out from this shift.');
      } else {
        Alert.alert('Error', 'Failed to check out. Please try again.');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleAddVisitNote = () => {
    if (!shift) return;
    router.push({
      pathname: '/(tabs)/visit-notes/new',
      params: { shiftId: shift.id, clientId: shift.client.id },
    });
  };

  if (isLoading) {
    return <LoadingView message="Loading shift details..." />;
  }

  if (error || !shift) {
    return <ErrorStateView message={error || 'Shift not found'} onRetry={loadShiftData} />;
  }

  const canCheckIn = shift.status === 'SCHEDULED' && !shift.isCheckedIn;
  const canCheckOut = shift.isCheckedIn && !shift.isCheckedOut;
  const canAddNote = shift.isCheckedIn;

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
      {/* Client Info Card */}
      <ScreenPaddedCard>
        <View style={styles.clientHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>
              {shift.client.firstName[0]}{shift.client.lastName[0]}
            </Text>
          </View>
          <View style={styles.clientDetails}>
            <Text style={[styles.clientName, { color: colors.textPrimary }]}>
              {shift.client.firstName} {shift.client.lastName}
            </Text>
            <StatusBadge
              label={shift.status.replace('_', ' ')}
              variant={getShiftStatusVariant(shift.status)}
            />
          </View>
        </View>
      </ScreenPaddedCard>

      {/* Shift Times Card */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Shift Times
        </Text>
      </View>
      <ScreenPaddedCard>
        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <View style={[styles.timeIcon, { backgroundColor: colors.infoSoft }]}>
              <Ionicons name="calendar" size={18} color={colors.info} />
            </View>
            <View>
              <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[styles.timeValue, { color: colors.textPrimary }]}>
                {formatDate(shift.scheduledStart, 'EEEE, MMMM d')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <View style={[styles.timeIcon, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="time" size={18} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Scheduled</Text>
              <Text style={[styles.timeValue, { color: colors.textPrimary }]}>
                {formatShiftTime(shift.scheduledStart, shift.scheduledEnd)}
              </Text>
            </View>
          </View>
        </View>

        {shift.actualStart && (
          <>
            <View style={styles.divider} />
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <View style={[styles.timeIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="log-in" size={18} color={colors.accent} />
                </View>
                <View>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Checked In</Text>
                  <Text style={[styles.timeValue, { color: colors.textPrimary }]}>
                    {formatTime(shift.actualStart)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {shift.actualEnd && (
          <>
            <View style={styles.divider} />
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <View style={[styles.timeIcon, { backgroundColor: colors.warningSoft }]}>
                  <Ionicons name="log-out" size={18} color={colors.warning} />
                </View>
                <View>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Checked Out</Text>
                  <Text style={[styles.timeValue, { color: colors.textPrimary }]}>
                    {formatTime(shift.actualEnd)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScreenPaddedCard>

      {/* Check-in/Check-out Actions */}
      {(canCheckIn || canCheckOut) && (
        <View style={styles.actionsContainer}>
          {canCheckIn && (
            <CarebaseButton
              title="Check In"
              onPress={handleCheckIn}
              loading={isCheckingIn}
              fullWidth
            />
          )}
          {canCheckOut && (
            <CarebaseButton
              title="Check Out"
              onPress={handleCheckOut}
              loading={isCheckingOut}
              variant="secondary"
              fullWidth
            />
          )}
        </View>
      )}

      {/* Visit Notes Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Visit Notes
        </Text>
        {canAddNote && (
          <CarebaseButton
            title="Add Note"
            onPress={handleAddVisitNote}
            variant="ghost"
            size="small"
          />
        )}
      </View>

      {visitNotes.length === 0 ? (
        <ScreenPaddedCard>
          <View style={styles.emptyNotes}>
            <Ionicons name="document-text-outline" size={32} color={colors.textTertiary} />
            <Text style={[styles.emptyNotesText, { color: colors.textSecondary }]}>
              No visit notes yet
            </Text>
          </View>
        </ScreenPaddedCard>
      ) : (
        visitNotes.map((note) => (
          <ScreenPaddedCard
            key={note.id}
            onPress={() => router.push(`/(tabs)/visit-notes/${note.id}`)}
            style={styles.noteCard}
          >
            <View style={styles.noteHeader}>
              <View style={[styles.noteIcon, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="document-text" size={18} color={colors.accent} />
              </View>
              <View style={styles.noteDetails}>
                <Text style={[styles.noteTitle, { color: colors.textPrimary }]}>
                  {note.templateName}
                </Text>
                <Text style={[styles.noteTime, { color: colors.textTertiary }]}>
                  {formatRelativeTime(note.submittedAt)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
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
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.title3,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    ...typography.title3,
    marginBottom: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.labelMedium,
  },
  timeRow: {
    paddingVertical: spacing.sm,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timeLabel: {
    ...typography.caption,
  },
  timeValue: {
    ...typography.bodyMedium,
    marginTop: spacing.xxs,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: spacing.xs,
  },
  actionsContainer: {
    paddingHorizontal: screenPadding,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  emptyNotes: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyNotesText: {
    ...typography.bodyMedium,
    marginTop: spacing.sm,
  },
  noteCard: {
    marginTop: spacing.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  noteDetails: {
    flex: 1,
  },
  noteTitle: {
    ...typography.headlineSmall,
  },
  noteTime: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
});
