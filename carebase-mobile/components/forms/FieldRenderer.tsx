import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormField, FormFieldConfig } from '../../lib/api/types';
import { useTheme, spacing, typography } from '../../lib/theme';

import { TextShortField } from './fields/TextShortField';
import { TextLongField } from './fields/TextLongField';
import { NumberField } from './fields/NumberField';
import { YesNoField } from './fields/YesNoField';
import { SingleChoiceField } from './fields/SingleChoiceField';
import { MultipleChoiceField } from './fields/MultipleChoiceField';
import { DateField } from './fields/DateField';
import { TimeField } from './fields/TimeField';
import { DateTimeField } from './fields/DateTimeField';
import { SignatureField } from './fields/SignatureField';
import { PhotoField } from './fields/PhotoField';
import { RatingScaleField } from './fields/RatingScaleField';

export interface FieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function FieldRenderer({ field, value, onChange, error }: FieldRendererProps) {
  const { colors } = useTheme();

  const renderField = () => {
    const props: FieldProps = { field, value, onChange, error };

    switch (field.type) {
      case 'TEXT_SHORT':
        return <TextShortField {...props} />;
      case 'TEXT_LONG':
        return <TextLongField {...props} />;
      case 'NUMBER':
        return <NumberField {...props} />;
      case 'YES_NO':
        return <YesNoField {...props} />;
      case 'SINGLE_CHOICE':
        return <SingleChoiceField {...props} />;
      case 'MULTIPLE_CHOICE':
        return <MultipleChoiceField {...props} />;
      case 'DATE':
        return <DateField {...props} />;
      case 'TIME':
        return <TimeField {...props} />;
      case 'DATETIME':
        return <DateTimeField {...props} />;
      case 'SIGNATURE':
        return <SignatureField {...props} />;
      case 'PHOTO':
        return <PhotoField {...props} />;
      case 'RATING_SCALE':
        return <RatingScaleField {...props} />;
      default:
        return (
          <Text style={{ color: colors.textTertiary }}>
            Unsupported field type: {field.type}
          </Text>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {field.label}
        </Text>
        {field.required && (
          <Text style={[styles.required, { color: colors.error }]}>*</Text>
        )}
      </View>
      {field.description && (
        <Text style={[styles.description, { color: colors.textTertiary }]}>
          {field.description}
        </Text>
      )}
      {renderField()}
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.labelMedium,
  },
  required: {
    ...typography.labelMedium,
    marginLeft: spacing.xxs,
  },
  description: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  error: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
