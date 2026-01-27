import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { useTheme, spacing, cornerRadius, screenPadding } from '../../lib/theme';

interface CarebaseCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
}

export function CarebaseCard({
  children,
  style,
  onPress,
  padded = true,
}: CarebaseCardProps) {
  const { colors, isDark } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.background,
    borderRadius: cornerRadius.lg,
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 3,
  };

  const content = (
    <View
      style={[
        styles.container,
        cardStyle,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export function ScreenPaddedCard({
  children,
  style,
  onPress,
  padded = true,
}: CarebaseCardProps) {
  return (
    <View style={styles.screenPadding}>
      <CarebaseCard style={style} onPress={onPress} padded={padded}>
        {children}
      </CarebaseCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  screenPadding: {
    paddingHorizontal: screenPadding,
  },
});
