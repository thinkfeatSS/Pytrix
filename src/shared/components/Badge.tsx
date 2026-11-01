import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'python';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  const { theme } = useTheme();

  const getBadgeColors = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'success':
        return {
          bg: theme.colors.successBg,
          text: theme.colors.success,
          border: theme.colors.success,
        };
      case 'warning':
        return {
          bg: theme.colors.warningBg,
          text: theme.colors.warning,
          border: theme.colors.warning,
        };
      case 'error':
        return {
          bg: theme.colors.errorBg,
          text: theme.colors.error,
          border: theme.colors.error,
        };
      case 'info':
        return {
          bg: theme.colors.infoBg,
          text: theme.colors.info,
          border: theme.colors.info,
        };
      case 'python':
        return {
          bg: 'rgba(255, 212, 59, 0.12)',
          text: theme.colors.pythonYellow,
          border: theme.colors.pythonYellow,
        };
      case 'neutral':
      default:
        return {
          bg: theme.colors.surfaceElevated,
          text: theme.colors.textSecondary,
          border: theme.colors.border,
        };
    }
  };

  const { bg, text, border } = getBadgeColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: theme.borderRadius.round,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xxs,
        },
        style,
      ]}
    >
      <AppText variant="caption" weight="medium" color={text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

