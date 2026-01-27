import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, screenPadding, cornerRadius } from '../../../lib/theme';
import { api, endpoints, Client, CreateIncidentRequest, IncidentSeverity, APIError } from '../../../lib/api';
import {
  CarebaseButton,
  CarebaseCard,
  ScreenPaddedCard,
  LoadingView,
  ErrorStateView,
} from '../../../components/ui';

const CATEGORIES = [
  'Fall',
  'Medication Error',
  'Injury',
  'Behavior',
  'Equipment Failure',
  'Environmental Hazard',
  'Other',
];

const SEVERITIES: { value: IncidentSeverity; label: string; color: string; description: string }[] = [
  { value: 'LOW', label: 'Low', color: '#6B7280', description: 'Minor incident, no harm' },
  { value: 'MEDIUM', label: 'Medium', color: '#F59E0B', description: 'Moderate impact, monitored' },
  { value: 'HIGH', label: 'High', color: '#EF4444', description: 'Serious incident, action required' },
  { value: 'CRITICAL', label: 'Critical', color: '#DC2626', description: 'Severe, immediate action' },
];

interface FormData {
  clientId: string;
  incidentDate: string;
  location: string;
  category: string;
  severity: IncidentSeverity;
  description: string;
  actionsTaken: string;
  witnesses: string;
}

export default function NewIncidentScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    clientId: '',
    incidentDate: new Date().toISOString().split('T')[0],
    location: '',
    category: '',
    severity: 'MEDIUM',
    description: '',
    actionsTaken: '',
    witnesses: '',
  });

  const loadClients = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get<{ clients: Client[] }>(endpoints.clients);
      setClients(response.clients || []);
    } catch (err) {
      console.error('Clients load error:', err);
      setError('Failed to load clients');
    } finally {
      setIsLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    updateField('clientId', client.id);
    setShowClientModal(false);
  };

  const selectCategory = (category: string) => {
    updateField('category', category);
    setShowCategoryModal(false);
  };

  const validateForm = (): string | null => {
    if (!formData.clientId) return 'Please select a client';
    if (!formData.incidentDate) return 'Please enter the incident date';
    if (!formData.location.trim()) return 'Please enter the location';
    if (!formData.category) return 'Please select a category';
    if (!formData.description.trim()) return 'Please provide a description';
    if (formData.description.trim().length < 10) return 'Description must be at least 10 characters';
    if (!formData.actionsTaken.trim()) return 'Please describe actions taken';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const request: CreateIncidentRequest = {
        clientId: formData.clientId,
        incidentDate: formData.incidentDate,
        location: formData.location.trim(),
        category: formData.category,
        severity: formData.severity,
        description: formData.description.trim(),
        actionsTaken: formData.actionsTaken.trim(),
        witnesses: formData.witnesses.trim() || null,
      };

      await api.post(endpoints.incidents, request);

      Alert.alert('Success', 'Incident report submitted successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Submit error:', err);
      if (err instanceof APIError) {
        Alert.alert('Error', err.message);
      } else {
        Alert.alert('Error', 'Failed to submit incident report');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderClientItem = ({ item: client }: { item: Client }) => (
    <TouchableOpacity
      style={[styles.listItem, { borderBottomColor: colors.border }]}
      onPress={() => selectClient(client)}
    >
      <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
        <Text style={[styles.avatarText, { color: colors.accent }]}>
          {client.firstName[0]}{client.lastName[0]}
        </Text>
      </View>
      <View style={styles.listItemInfo}>
        <Text style={[styles.listItemTitle, { color: colors.textPrimary }]}>
          {client.firstName} {client.lastName}
        </Text>
      </View>
      {selectedClient?.id === client.id && (
        <Ionicons name="checkmark" size={20} color={colors.accent} />
      )}
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item: category }: { item: string }) => (
    <TouchableOpacity
      style={[styles.listItem, { borderBottomColor: colors.border }]}
      onPress={() => selectCategory(category)}
    >
      <Text style={[styles.listItemTitle, { color: colors.textPrimary }]}>
        {category}
      </Text>
      {formData.category === category && (
        <Ionicons name="checkmark" size={20} color={colors.accent} />
      )}
    </TouchableOpacity>
  );

  if (isLoadingClients) {
    return <LoadingView message="Loading..." />;
  }

  if (error) {
    return <ErrorStateView message={error} onRetry={loadClients} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Client Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Client *
            </Text>
            <TouchableOpacity onPress={() => setShowClientModal(true)}>
              <CarebaseCard style={styles.selectorCard}>
                <View style={styles.selectorRow}>
                  {selectedClient ? (
                    <>
                      <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
                        <Text style={[styles.avatarText, { color: colors.accent }]}>
                          {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                        </Text>
                      </View>
                      <Text style={[styles.selectorText, { color: colors.textPrimary }]}>
                        {selectedClient.firstName} {selectedClient.lastName}
                      </Text>
                    </>
                  ) : (
                    <>
                      <View style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}>
                        <Ionicons name="person" size={18} color={colors.textTertiary} />
                      </View>
                      <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                        Select a client
                      </Text>
                    </>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>
              </CarebaseCard>
            </TouchableOpacity>
          </View>

          {/* Incident Date */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Incident Date *
            </Text>
            <CarebaseCard>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={formData.incidentDate}
                onChangeText={(value) => updateField('incidentDate', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
              />
            </CarebaseCard>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Location *
            </Text>
            <CarebaseCard>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={formData.location}
                onChangeText={(value) => updateField('location', value)}
                placeholder="Where did the incident occur?"
                placeholderTextColor={colors.textTertiary}
              />
            </CarebaseCard>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Category *
            </Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
              <CarebaseCard style={styles.selectorCard}>
                <View style={styles.selectorRow}>
                  <Text
                    style={[
                      formData.category ? styles.selectorText : styles.placeholderText,
                      { color: formData.category ? colors.textPrimary : colors.textTertiary },
                    ]}
                  >
                    {formData.category || 'Select a category'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>
              </CarebaseCard>
            </TouchableOpacity>
          </View>

          {/* Severity */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Severity *
            </Text>
            <CarebaseCard>
              <View style={styles.severityContainer}>
                {SEVERITIES.map((severity) => (
                  <TouchableOpacity
                    key={severity.value}
                    style={[
                      styles.severityOption,
                      {
                        backgroundColor:
                          formData.severity === severity.value
                            ? severity.color + '20'
                            : colors.backgroundTertiary,
                        borderColor:
                          formData.severity === severity.value
                            ? severity.color
                            : 'transparent',
                      },
                    ]}
                    onPress={() => updateField('severity', severity.value)}
                  >
                    <Text
                      style={[
                        styles.severityLabel,
                        {
                          color:
                            formData.severity === severity.value
                              ? severity.color
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {severity.label}
                    </Text>
                    <Text
                      style={[
                        styles.severityDesc,
                        { color: colors.textTertiary },
                      ]}
                      numberOfLines={1}
                    >
                      {severity.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </CarebaseCard>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Description *
            </Text>
            <CarebaseCard>
              <TextInput
                style={[styles.textArea, { color: colors.textPrimary }]}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="Describe what happened in detail..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </CarebaseCard>
          </View>

          {/* Actions Taken */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Actions Taken *
            </Text>
            <CarebaseCard>
              <TextInput
                style={[styles.textArea, { color: colors.textPrimary }]}
                value={formData.actionsTaken}
                onChangeText={(value) => updateField('actionsTaken', value)}
                placeholder="What actions were taken in response?"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </CarebaseCard>
          </View>

          {/* Witnesses */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Witnesses (Optional)
            </Text>
            <CarebaseCard>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={formData.witnesses}
                onChangeText={(value) => updateField('witnesses', value)}
                placeholder="Names of any witnesses"
                placeholderTextColor={colors.textTertiary}
              />
            </CarebaseCard>
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <CarebaseButton
              title="Submit Incident Report"
              onPress={handleSubmit}
              loading={isSubmitting}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Client Selection Modal */}
      <Modal
        visible={showClientModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowClientModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.accent }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Client</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <FlatList
            data={clients}
            keyExtractor={(item) => item.id}
            renderItem={renderClientItem}
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.accent }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Category</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: screenPadding,
  },
  sectionTitle: {
    ...typography.labelMedium,
    marginBottom: spacing.sm,
  },
  selectorCard: {
    paddingVertical: spacing.sm,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorText: {
    ...typography.bodyMedium,
    flex: 1,
  },
  placeholderText: {
    ...typography.bodyMedium,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
  input: {
    ...typography.bodyMedium,
    paddingVertical: spacing.xs,
  },
  textArea: {
    ...typography.bodyMedium,
    minHeight: 80,
    paddingVertical: spacing.xs,
  },
  severityContainer: {
    gap: spacing.sm,
  },
  severityOption: {
    padding: spacing.sm,
    borderRadius: cornerRadius.md,
    borderWidth: 2,
  },
  severityLabel: {
    ...typography.labelMedium,
    marginBottom: spacing.xxs,
  },
  severityDesc: {
    ...typography.caption,
  },
  submitContainer: {
    paddingHorizontal: screenPadding,
    marginTop: spacing.md,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalCancel: {
    ...typography.labelMedium,
  },
  modalTitle: {
    ...typography.headlineMedium,
  },
  modalPlaceholder: {
    width: 50,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    ...typography.bodyMedium,
  },
});
