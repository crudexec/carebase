import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, screenPadding, cornerRadius } from '../../../lib/theme';
import { api, endpoints, Incident, IncidentResponse, IncidentSeverity, IncidentStatus } from '../../../lib/api';
import { ScreenPaddedCard, LoadingView, ErrorStateView } from '../../../components/ui';

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  LOW: '#6B7280',
  MEDIUM: '#F59E0B',
  HIGH: '#EF4444',
  CRITICAL: '#DC2626',
};

const STATUS_COLORS: Record<IncidentStatus, string> = {
  PENDING: '#F59E0B',
  APPROVED: '#10B981',
  REJECTED: '#EF4444',
};

const SEVERITY_DESCRIPTIONS: Record<IncidentSeverity, string> = {
  LOW: 'Minor incident with no harm',
  MEDIUM: 'Moderate impact, monitoring required',
  HIGH: 'Serious incident, action required',
  CRITICAL: 'Severe incident, immediate action needed',
};

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIncident = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);
      const response = await api.get<IncidentResponse>(endpoints.incident(id));
      setIncident(response.incident);
    } catch (err) {
      console.error('Incident load error:', err);
      setError('Failed to load incident details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadIncident();
  }, [loadIncident]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadIncident();
  }, [loadIncident]);

  const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options || {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return <LoadingView message="Loading incident..." />;
  }

  if (error || !incident) {
    return <ErrorStateView message={error || 'Incident not found'} onRetry={loadIncident} />;
  }

  const severityColor = SEVERITY_COLORS[incident.severity];
  const statusColor = STATUS_COLORS[incident.status];

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
        <View style={styles.headerRow}>
          <View style={[styles.headerIcon, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="warning" size={24} color={colors.error} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.category, { color: colors.textPrimary }]}>
              {incident.category}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: severityColor + '20' }]}>
                <Text style={[styles.badgeText, { color: severityColor }]}>
                  {incident.severity}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.badgeText, { color: statusColor }]}>
                  {incident.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Client Info */}
        <View style={styles.infoRow}>
          <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>
              {incident.client.firstName[0]}{incident.client.lastName[0]}
            </Text>
          </View>
          <View style={styles.infoDetails}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Client</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {incident.client.firstName} {incident.client.lastName}
            </Text>
          </View>
        </View>
      </ScreenPaddedCard>

      {/* Incident Details Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Incident Details
        </Text>
      </View>
      <ScreenPaddedCard>
        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: colors.infoSoft }]}>
            <Ionicons name="calendar" size={18} color={colors.info} />
          </View>
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {formatDate(incident.incidentDate)}
            </Text>
          </View>
        </View>

        <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: colors.warningSoft }]}>
            <Ionicons name="location" size={18} color={colors.warning} />
          </View>
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {incident.location}
            </Text>
          </View>
        </View>

        <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: severityColor + '20' }]}>
            <Ionicons name="alert-circle" size={18} color={severityColor} />
          </View>
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Severity</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {incident.severity} - {SEVERITY_DESCRIPTIONS[incident.severity]}
            </Text>
          </View>
        </View>
      </ScreenPaddedCard>

      {/* Description Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Description
        </Text>
      </View>
      <ScreenPaddedCard>
        <Text style={[styles.longText, { color: colors.textPrimary }]}>
          {incident.description}
        </Text>
      </ScreenPaddedCard>

      {/* Actions Taken Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Actions Taken
        </Text>
      </View>
      <ScreenPaddedCard>
        <Text style={[styles.longText, { color: colors.textPrimary }]}>
          {incident.actionsTaken}
        </Text>
      </ScreenPaddedCard>

      {/* Witnesses Section */}
      {incident.witnesses && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Witnesses
            </Text>
          </View>
          <ScreenPaddedCard>
            <Text style={[styles.longText, { color: colors.textPrimary }]}>
              {incident.witnesses}
            </Text>
          </ScreenPaddedCard>
        </>
      )}

      {/* Reporter Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Reported By
        </Text>
      </View>
      <ScreenPaddedCard>
        <View style={styles.personRow}>
          <View style={[styles.avatar, { backgroundColor: colors.infoSoft }]}>
            <Text style={[styles.avatarText, { color: colors.info }]}>
              {incident.reporter.firstName[0]}{incident.reporter.lastName[0]}
            </Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={[styles.personName, { color: colors.textPrimary }]}>
              {incident.reporter.firstName} {incident.reporter.lastName}
            </Text>
            <Text style={[styles.personRole, { color: colors.textSecondary }]}>
              {incident.reporter.role}
            </Text>
          </View>
        </View>
        <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
          Reported on {formatDateTime(incident.createdAt)}
        </Text>
      </ScreenPaddedCard>

      {/* Approval Section */}
      {incident.status !== 'PENDING' && incident.approvedBy && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {incident.status === 'APPROVED' ? 'Approved By' : 'Reviewed By'}
            </Text>
          </View>
          <ScreenPaddedCard>
            <View style={styles.personRow}>
              <View style={[styles.avatar, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.avatarText, { color: statusColor }]}>
                  {incident.approvedBy.firstName[0]}{incident.approvedBy.lastName[0]}
                </Text>
              </View>
              <View style={styles.personInfo}>
                <Text style={[styles.personName, { color: colors.textPrimary }]}>
                  {incident.approvedBy.firstName} {incident.approvedBy.lastName}
                </Text>
              </View>
            </View>
            {incident.approvedAt && (
              <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                {incident.status === 'APPROVED' ? 'Approved' : 'Reviewed'} on {formatDateTime(incident.approvedAt)}
              </Text>
            )}
          </ScreenPaddedCard>
        </>
      )}

      {/* Sponsor Notification Status */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Notifications
        </Text>
      </View>
      <ScreenPaddedCard>
        <View style={styles.notificationRow}>
          <Ionicons
            name={incident.sponsorNotified ? 'checkmark-circle' : 'time'}
            size={20}
            color={incident.sponsorNotified ? colors.success : colors.warning}
          />
          <Text style={[styles.notificationText, { color: colors.textPrimary }]}>
            {incident.sponsorNotified
              ? 'Sponsor has been notified'
              : 'Sponsor notification pending approval'}
          </Text>
        </View>
      </ScreenPaddedCard>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  category: {
    ...typography.headlineMedium,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: cornerRadius.full,
    gap: spacing.xxs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
  infoDetails: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
  },
  infoValue: {
    ...typography.bodyMedium,
    fontWeight: '500',
    marginTop: spacing.xxs,
  },
  sectionHeader: {
    paddingHorizontal: screenPadding,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.labelMedium,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
  },
  detailValue: {
    ...typography.bodyMedium,
    marginTop: spacing.xxs,
  },
  detailDivider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  longText: {
    ...typography.bodyMedium,
    lineHeight: 22,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    ...typography.bodyMedium,
    fontWeight: '500',
  },
  personRole: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  timestamp: {
    ...typography.caption,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notificationText: {
    ...typography.bodyMedium,
  },
});
