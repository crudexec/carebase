import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, typography, cornerRadius } from '../../../lib/theme';
import { FieldProps } from '../FieldRenderer';

export function PhotoField({ field, value, onChange, error }: FieldProps) {
  const { colors } = useTheme();

  const pickImage = async (useCamera: boolean) => {
    try {
      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Photo library permission is required.');
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // Return base64 data URL
        const base64 = `data:image/jpeg;base64,${asset.base64}`;
        onChange(base64);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const showOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImage(true);
          if (buttonIndex === 2) pickImage(false);
        }
      );
    } else {
      Alert.alert('Add Photo', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => pickImage(true) },
        { text: 'Choose from Library', onPress: () => pickImage(false) },
      ]);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  const hasPhoto = value && typeof value === 'string' && value.length > 0;

  return (
    <View>
      {hasPhoto ? (
        <View style={styles.photoPreview}>
          <Image source={{ uri: value }} style={styles.photoImage} resizeMode="cover" />
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accentSoft }]}
              onPress={showOptions}
            >
              <Ionicons name="camera" size={18} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.accent }]}>Replace</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.errorSoft }]}
              onPress={handleClear}
            >
              <Ionicons name="trash" size={18} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>Remove</Text>
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
          onPress={showOptions}
        >
          <Ionicons name="camera" size={32} color={colors.textTertiary} />
          <Text style={[styles.addButtonText, { color: colors.textSecondary }]}>
            Tap to add photo
          </Text>
        </TouchableOpacity>
      )}
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
  photoPreview: {
    borderRadius: cornerRadius.md,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderRadius: cornerRadius.md,
  },
  photoActions: {
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
});
