import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, screenPadding, cornerRadius } from '../../../lib/theme';
import { api, endpoints, FormTemplate, FormSection, APIError } from '../../../lib/api';
import {
  CarebaseButton,
  CarebaseCard,
  ScreenPaddedCard,
  LoadingView,
  ErrorStateView,
} from '../../../components/ui';
import { FieldRenderer } from '../../../components/forms';

export default function NewVisitNoteScreen() {
  const { shiftId, clientId } = useLocalSearchParams<{ shiftId?: string; clientId?: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get<{ templates: FormTemplate[] }>(endpoints.formTemplatesEnabled);
      const templateList = response.templates || [];
      setTemplates(templateList);

      // Auto-show template selection if there are templates
      if (templateList.length > 0) {
        setShowTemplateModal(true);
      }
    } catch (err) {
      console.error('Templates load error:', err);
      setError('Failed to load form templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTemplateDetails = async (templateId: string) => {
    try {
      const response = await api.get<{ template: FormTemplate }>(endpoints.formTemplate(templateId));
      setSelectedTemplate(response.template);
      setFormData({});
      setErrors({});
    } catch (err) {
      console.error('Template details load error:', err);
      Alert.alert('Error', 'Failed to load template details');
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    if (!selectedTemplate?.sections) return false;

    const newErrors: Record<string, string> = {};

    for (const section of selectedTemplate.sections) {
      for (const field of section.fields) {
        if (field.required) {
          const value = formData[field.id];
          const isEmpty =
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0);

          if (isEmpty) {
            newErrors[field.id] = 'This field is required';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || !shiftId || !clientId) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(endpoints.visitNotes, {
        templateId: selectedTemplate.id,
        shiftId,
        clientId,
        data: formData,
      });

      Alert.alert('Success', 'Visit note submitted successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Submit error:', err);
      if (err instanceof APIError) {
        Alert.alert('Error', err.message);
      } else {
        Alert.alert('Error', 'Failed to submit visit note');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTemplateItem = ({ item: template }: { item: FormTemplate }) => (
    <TouchableOpacity
      style={[styles.templateItem, { borderBottomColor: colors.border }]}
      onPress={() => {
        loadTemplateDetails(template.id);
        setShowTemplateModal(false);
      }}
    >
      <View style={[styles.templateIcon, { backgroundColor: colors.accentSoft }]}>
        <Ionicons name="document-text" size={24} color={colors.accent} />
      </View>
      <View style={styles.templateInfo}>
        <Text style={[styles.templateName, { color: colors.textPrimary }]}>
          {template.name}
        </Text>
        {template.description && (
          <Text style={[styles.templateDesc, { color: colors.textSecondary }]} numberOfLines={2}>
            {template.description}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingView message="Loading templates..." />;
  }

  if (error) {
    return <ErrorStateView message={error} onRetry={loadTemplates} />;
  }

  if (!shiftId || !clientId) {
    return (
      <ErrorStateView
        message="Missing shift or client information"
        onRetry={() => router.back()}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['bottom']}>
      {selectedTemplate ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Template Header */}
          <TouchableOpacity
            onPress={() => setShowTemplateModal(true)}
            style={styles.templateHeader}
          >
            <ScreenPaddedCard>
              <View style={styles.templateHeaderRow}>
                <View style={[styles.templateIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="document-text" size={24} color={colors.accent} />
                </View>
                <View style={styles.templateHeaderInfo}>
                  <Text style={[styles.templateHeaderName, { color: colors.textPrimary }]}>
                    {selectedTemplate.name}
                  </Text>
                  <Text style={[styles.changeTemplate, { color: colors.accent }]}>
                    Change template
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </View>
            </ScreenPaddedCard>
          </TouchableOpacity>

          {/* Form Sections */}
          {selectedTemplate.sections?.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
              {section.description && (
                <Text style={[styles.sectionDesc, { color: colors.textTertiary }]}>
                  {section.description}
                </Text>
              )}
              <CarebaseCard style={styles.sectionCard}>
                {section.fields.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    error={errors[field.id]}
                  />
                ))}
              </CarebaseCard>
            </View>
          ))}

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <CarebaseButton
              title="Submit Visit Note"
              onPress={handleSubmit}
              loading={isSubmitting}
              fullWidth
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noTemplateContainer}>
          <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.noTemplateText, { color: colors.textSecondary }]}>
            Select a form template to continue
          </Text>
          <CarebaseButton
            title="Select Template"
            onPress={() => setShowTemplateModal(true)}
            style={styles.selectButton}
          />
        </View>
      )}

      {/* Template Selection Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.accent }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Form</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          {templates.length === 0 ? (
            <View style={styles.emptyTemplates}>
              <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No form templates available
              </Text>
            </View>
          ) : (
            <FlatList
              data={templates}
              keyExtractor={(item) => item.id}
              renderItem={renderTemplateItem}
              contentContainerStyle={styles.templateList}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  templateHeader: {
    marginTop: spacing.md,
  },
  templateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  templateHeaderInfo: {
    flex: 1,
  },
  templateHeaderName: {
    ...typography.headlineMedium,
  },
  changeTemplate: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.labelMedium,
    paddingHorizontal: screenPadding,
    marginBottom: spacing.xs,
  },
  sectionDesc: {
    ...typography.caption,
    paddingHorizontal: screenPadding,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    marginHorizontal: screenPadding,
  },
  submitContainer: {
    paddingHorizontal: screenPadding,
    marginTop: spacing.xl,
  },
  noTemplateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: screenPadding,
  },
  noTemplateText: {
    ...typography.bodyMedium,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  selectButton: {
    minWidth: 200,
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
  templateList: {
    paddingVertical: spacing.sm,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  templateInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  templateName: {
    ...typography.headlineSmall,
  },
  templateDesc: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
  },
  emptyTemplates: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    marginTop: spacing.md,
  },
});
