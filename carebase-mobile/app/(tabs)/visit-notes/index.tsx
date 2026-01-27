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
import { api, endpoints, VisitNote } from '../../../lib/api';
import { CarebaseCard, LoadingView, ErrorStateView, EmptyStateView } from '../../../components/ui';
import { formatRelativeTime, formatDate } from '../../../lib/utils/dates';

export default function VisitNotesScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [notes, setNotes] = useState<VisitNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get<{ visitNotes: VisitNote[] }>(endpoints.visitNotes);
      setNotes(response.visitNotes || []);
    } catch (err) {
      console.error('Notes load error:', err);
      setError('Failed to load visit notes');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadNotes();
  }, [loadNotes]);

  const renderNoteItem = ({ item: note }: { item: VisitNote }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/visit-notes/${note.id}`)}
      style={styles.noteItemContainer}
    >
      <CarebaseCard>
        <View style={styles.noteRow}>
          <View style={[styles.noteIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="document-text" size={24} color={colors.accent} />
          </View>
          <View style={styles.noteDetails}>
            <Text style={[styles.noteTitle, { color: colors.textPrimary }]}>
              {note.templateName}
            </Text>
            {note.client && (
              <Text style={[styles.noteClient, { color: colors.textSecondary }]}>
                {note.client.firstName} {note.client.lastName}
              </Text>
            )}
            <Text style={[styles.noteTime, { color: colors.textTertiary }]}>
              {formatRelativeTime(note.submittedAt)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>
      </CarebaseCard>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <LoadingView message="Loading visit notes..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Visit Notes</Text>
      </View>

      {error ? (
        <ErrorStateView message={error} onRetry={loadNotes} />
      ) : notes.length === 0 ? (
        <EmptyStateView
          icon="document-text-outline"
          title="No Visit Notes"
          message="You haven't submitted any visit notes yet."
        />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
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
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.title1,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.xxl,
  },
  noteItemContainer: {
    marginBottom: spacing.sm,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  noteClient: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  noteTime: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
});
