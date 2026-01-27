import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, screenPadding, cornerRadius } from '../../../lib/theme';
import { useAuth } from '../../../lib/auth';
import { CarebaseCard, ScreenPaddedCard, CarebaseButton } from '../../../components/ui';

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
          } catch (err) {
            console.error('Logout error:', err);
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'MANAGER':
        return 'Manager';
      case 'COORDINATOR':
        return 'Coordinator';
      case 'CARER':
        return 'Carer';
      default:
        return role || 'Unknown';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>
        </View>

        {/* User Info */}
        <ScreenPaddedCard>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.avatarText, { color: colors.accent }]}>
                {user?.firstName?.[0] || '?'}{user?.lastName?.[0] || '?'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={[styles.userRole, { color: colors.textSecondary }]}>
                {getRoleLabel(user?.role)}
              </Text>
            </View>
          </View>
        </ScreenPaddedCard>

        {/* Contact Info Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Contact Information
          </Text>
        </View>
        <ScreenPaddedCard>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.infoSoft }]}>
              <Ionicons name="mail" size={18} color={colors.info} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {user?.email || 'Not set'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="call" size={18} color={colors.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {user?.phone || 'Not set'}
              </Text>
            </View>
          </View>
        </ScreenPaddedCard>

        {/* Settings Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Settings
          </Text>
        </View>
        <ScreenPaddedCard>
          <TouchableOpacity style={styles.settingsRow}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="notifications" size={18} color={colors.accent} />
            </View>
            <View style={styles.settingsContent}>
              <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>
                Notifications
              </Text>
              <Text style={[styles.settingsDesc, { color: colors.textTertiary }]}>
                Manage push notifications
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.settingsRow}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.warningSoft }]}>
              <Ionicons name="moon" size={18} color={colors.warning} />
            </View>
            <View style={styles.settingsContent}>
              <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingsDesc, { color: colors.textTertiary }]}>
                {isDark ? 'Currently enabled' : 'Currently disabled'}
              </Text>
            </View>
            <Text style={[styles.settingsValue, { color: colors.textTertiary }]}>
              System
            </Text>
          </View>
        </ScreenPaddedCard>

        {/* Support Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Support
          </Text>
        </View>
        <ScreenPaddedCard>
          <TouchableOpacity style={styles.settingsRow}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.infoSoft }]}>
              <Ionicons name="help-circle" size={18} color={colors.info} />
            </View>
            <View style={styles.settingsContent}>
              <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.settingsRow}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="document-text" size={18} color={colors.success} />
            </View>
            <View style={styles.settingsContent}>
              <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>
                Privacy Policy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.settingsRow}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.warningSoft }]}>
              <Ionicons name="shield-checkmark" size={18} color={colors.warning} />
            </View>
            <View style={styles.settingsContent}>
              <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>
                Terms of Service
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </ScreenPaddedCard>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <CarebaseButton
            title="Logout"
            onPress={handleLogout}
            variant="destructive"
            loading={isLoggingOut}
            fullWidth
          />
        </View>

        {/* Version */}
        <Text style={[styles.version, { color: colors.textTertiary }]}>
          Carebase v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
  },
  userInfo: {
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
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.title3,
  },
  userRole: {
    ...typography.bodyMedium,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
  },
  infoValue: {
    ...typography.bodyMedium,
    marginTop: spacing.xxs,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingsContent: {
    flex: 1,
  },
  settingsLabel: {
    ...typography.bodyMedium,
  },
  settingsDesc: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  settingsValue: {
    ...typography.bodySmall,
  },
  logoutContainer: {
    paddingHorizontal: screenPadding,
    marginTop: spacing.xxl,
  },
  version: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
