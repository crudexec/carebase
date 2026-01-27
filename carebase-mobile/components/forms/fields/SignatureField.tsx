import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, cornerRadius } from '../../../lib/theme';
import { FieldProps } from '../FieldRenderer';

export function SignatureField({ field, value, onChange, error }: FieldProps) {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const signatureRef = useRef<any>(null);

  const handleSignature = (signature: string) => {
    onChange(signature);
    setShowModal(false);
  };

  const handleClear = () => {
    onChange(null);
  };

  const hasSignature = value && typeof value === 'string' && value.length > 0;

  return (
    <View>
      {hasSignature ? (
        <View style={styles.signaturePreview}>
          <Image
            source={{ uri: value }}
            style={styles.signatureImage}
            resizeMode="contain"
          />
          <View style={styles.signatureActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accentSoft }]}
              onPress={() => setShowModal(true)}
            >
              <Ionicons name="pencil" size={18} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.accent }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.errorSoft }]}
              onPress={handleClear}
            >
              <Ionicons name="trash" size={18} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="pencil" size={32} color={colors.textTertiary} />
          <Text style={[styles.addButtonText, { color: colors.textSecondary }]}>
            Tap to sign
          </Text>
        </TouchableOpacity>
      )}

      <Modal visible={showModal} animationType="slide">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={[styles.modalButtonText, { color: colors.error }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Sign Below</Text>
            <TouchableOpacity onPress={() => signatureRef.current?.clearSignature()}>
              <Text style={[styles.modalButtonText, { color: colors.accent }]}>Clear</Text>
            </TouchableOpacity>
          </View>

          <SignatureCanvas
            ref={signatureRef}
            onOK={handleSignature}
            onEmpty={() => setShowModal(false)}
            descriptionText=""
            clearText="Clear"
            confirmText="Save"
            webStyle={`
              .m-signature-pad { box-shadow: none; border: none; }
              .m-signature-pad--body { border: none; }
              .m-signature-pad--footer { display: none; }
              body { margin: 0; padding: 0; }
            `}
            backgroundColor={colors.backgroundSecondary}
            penColor={colors.textPrimary}
            style={styles.signatureCanvas}
          />

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={() => signatureRef.current?.readSignature()}
            >
              <Text style={[styles.saveButtonText, { color: colors.textInverse }]}>
                Save Signature
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    borderRadius: cornerRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addButtonText: {
    ...typography.bodyMedium,
    marginTop: spacing.sm,
  },
  signaturePreview: {
    borderRadius: cornerRadius.md,
    overflow: 'hidden',
  },
  signatureImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
  },
  signatureActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: cornerRadius.md,
    gap: spacing.xs,
  },
  actionText: {
    ...typography.labelSmall,
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
    paddingTop: spacing.xxxl,
  },
  modalTitle: {
    ...typography.headlineMedium,
  },
  modalButtonText: {
    ...typography.labelMedium,
  },
  signatureCanvas: {
    flex: 1,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    paddingBottom: spacing.xxxl,
  },
  saveButton: {
    paddingVertical: spacing.md,
    borderRadius: cornerRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.labelMedium,
  },
});
