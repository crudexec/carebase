import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, screenPadding, cornerRadius } from '../../../lib/theme';
import { api, endpoints, VisitNote, FormSection, FormField } from '../../../lib/api';
import { CarebaseCard, ScreenPaddedCard, LoadingView, ErrorStateView } from '../../../components/ui';
import { formatRelativeTime, formatDate, formatTime, formatDateTime } from '../../../lib/utils/dates';

export default function VisitNoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const [note, setNote] = useState<VisitNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNote = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);
      const response = await api.get<{ visitNote: VisitNote }>(endpoints.visitNote(id));
      setNote(response.visitNote);
    } catch (err) {
      console.error('Note load error:', err);
      setError('Failed to load visit note');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadNote();
  }, [loadNote]);

  const renderFieldValue = (field: FormField, value: any) => {
    if (value === undefined || value === null || value === '') {
      return (
        <Text style={[styles.emptyValue, { color: colors.textTertiary }]}>
          Not provided
        </Text>
      );
    }

    switch (field.type) {
      case 'TEXT_SHORT':
      case 'TEXT_LONG':
        return (
          <Text style={[styles.textValue, { color: colors.textPrimary }]}>
            {value}
          </Text>
        );

      case 'NUMBER':
        return (
          <Text style={[styles.textValue, { color: colors.textPrimary }]}>
            {typeof value === 'number' ? value.toString() : value}
          </Text>
        );

      case 'YES_NO':
        return (
          <View style={styles.yesNoValue}>
            <Ionicons
              name={value ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={value ? colors.success : colors.error}
            />
            <Text style={[styles.textValue, { color: colors.textPrimary }]}>
              {value ? 'Yes' : 'No'}
            </Text>
          </View>
        );

      case 'SINGLE_CHOICE':
        return (
          <View style={[styles.choiceBadge, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.choiceText, { color: colors.accent }]}>{value}</Text>
          </View>
        );

      case 'MULTIPLE_CHOICE':
        if (!Array.isArray(value) || value.length === 0) {
          return (
            <Text style={[styles.emptyValue, { color: colors.textTertiary }]}>
              Not provided
            </Text>
          );
        }
        return (
          <View style={styles.choicesContainer}>
            {value.map((choice: string, index: number) => (
              <View
                key={index}
                style={[styles.choiceBadge, { backgroundColor: colors.accentSoft }]}
              >
                <Text style={[styles.choiceText, { color: colors.accent }]}>{choice}</Text>
              </View>
            ))}
          </View>
        );

      case 'DATE':
        return (
          <Text style={[styles.textValue, { color: colors.textPrimary }]}>
            {formatDate(value, 'MMMM d, yyyy')}
          </Text>
        );

      case 'TIME':
        return (
          <Text style={[styles.textValue, { color: colors.textPrimary }]}>
            {formatTime(value)}
          </Text>
        );

      case 'DATETIME':
        return (
          <Text style={[styles.textValue, { color: colors.textPrimary }]}>
            {formatDateTime(value)}
          </Text>
        );

      case 'RATING_SCALE': {
        const maxRating = field.config?.max || field.config?.maxValue || 5;
        return (
          <View style={styles.ratingContainer}>
            {Array.from({ length: maxRating }, (_, i) => (
              <Ionicons
                key={i}
                name={i < value ? 'star' : 'star-outline'}
                size={20}
                color={i < value ? colors.warning : colors.textTertiary}
              />
            ))}
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {value}/{maxRating}
            </Text>
          </View>
        );
      }

      case 'SIGNATURE':
      case 'PHOTO': {
        const imageUrl = typeof value === 'string' ? value : value?.fileUrl;
        if (!imageUrl) {
          return (
            <Text style={[styles.emptyValue, { color: colors.textTertiary }]}>
              Not provided
            </Text>
          );
        }
        return (
          <Image
            source={{ uri: imageUrl }}
            style={styles.imageValue}
            resizeMode={field.type === 'SIGNATURE' ? 'contain' : 'cover'}
          />
        );
      }

      default:
        return (
          <Text style={[styles.textValue, { color: colors.textPrimary }]}>
            {JSON.stringify(value)}
          </Text>
        );
    }
  };

  if (isLoading) {
    return <LoadingView message="Loading visit note..." />;
  }

  if (error || !note) {
    return <ErrorStateView message={error || 'Visit note not found'} onRetry={loadNote} />;
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
      {/* Header Card */}
      <ScreenPaddedCard>
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="document-text" size={24} color={colors.accent} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {note.templateName}
            </Text>
            {note.templateVersion && (
              <Text style={[styles.headerVersion, { color: colors.textTertiary }]}>
                Version {note.templateVersion}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.metadataContainer}>
          <View style={styles.metadataRow}>
            <Ionicons name="time-outline" size={16} color={colors.textTertiary} />
            <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
              Submitted
            </Text>
            <Text style={[styles.metadataValue, { color: colors.textPrimary }]}>
              {formatRelativeTime(note.submittedAt)}
            </Text>
          </View>

          {note.client && (
            <View style={styles.metadataRow}>
              <Ionicons name="person-outline" size={16} color={colors.textTertiary} />
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
                Client
              </Text>
              <Text style={[styles.metadataValue, { color: colors.textPrimary }]}>
                {note.client.firstName} {note.client.lastName}
              </Text>
            </View>
          )}

          {note.carer && (
            <View style={styles.metadataRow}>
              <Ionicons name="person" size={16} color={colors.textTertiary} />
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
                Carer
              </Text>
              <Text style={[styles.metadataValue, { color: colors.textPrimary }]}>
                {note.carer.firstName} {note.carer.lastName}
              </Text>
            </View>
          )}
        </View>
      </ScreenPaddedCard>

      {/* Form Data Sections */}
      {note.formSchemaSnapshot?.sections?.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {section.title}
          </Text>
          <ScreenPaddedCard>
            {section.fields.map((field, index) => (
              <View key={field.id}>
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    {field.label}
                  </Text>
                  {renderFieldValue(field, note.data?.[field.id])}
                </View>
                {index < section.fields.length - 1 && (
                  <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </ScreenPaddedCard>
        </View>
      ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...typography.headlineMedium,
  },
  headerVersion: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  metadataContainer: {
    gap: spacing.sm,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataLabel: {
    ...typography.bodySmall,
    marginLeft: spacing.sm,
    width: 80,
  },
  metadataValue: {
    ...typography.bodySmall,
    flex: 1,
    textAlign: 'right',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.labelMedium,
    paddingHorizontal: screenPadding,
    marginBottom: spacing.sm,
  },
  fieldContainer: {
    paddingVertical: spacing.sm,
  },
  fieldLabel: {
    ...typography.labelSmall,
    marginBottom: spacing.xs,
  },
  fieldDivider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  textValue: {
    ...typography.bodyMedium,
  },
  emptyValue: {
    ...typography.bodyMedium,
    fontStyle: 'italic',
  },
  yesNoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  choicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  choiceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: cornerRadius.sm,
  },
  choiceText: {
    ...typography.bodySmall,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  ratingText: {
    ...typography.bodySmall,
    marginLeft: spacing.sm,
  },
  imageValue: {
    width: '100%',
    height: 200,
    borderRadius: cornerRadius.md,
    marginTop: spacing.xs,
  },
});
