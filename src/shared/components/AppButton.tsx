import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function AppButton({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  ...rest
}: AppButtonProps) {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    let bg = theme.colors.primary;
    let border = 'transparent';
    let borderWidth = 0;

    if (variant === 'secondary') {
      bg = theme.colors.surfaceElevated;
      border = theme.colors.border;
      borderWidth = 1;
    } else if (variant === 'outline') {
      bg = 'transparent';
      border = theme.colors.primary;
      borderWidth = 1.5;
    } else if (variant === 'ghost') {
      bg = 'transparent';
    }

    let paddingVertical = theme.spacing.md;
    let paddingHorizontal = theme.spacing.lg;
    let minHeight = 48; // Accessible min target

    if (size === 'sm') {
      paddingVertical = theme.spacing.sm;
      paddingHorizontal = theme.spacing.md;
      minHeight = 38;
    } else if (size === 'lg') {
      paddingVertical = theme.spacing.base;
      paddingHorizontal = theme.spacing.xl;
      minHeight = 54;
    }

    return {
      backgroundColor: bg,
      borderColor: border,
      borderWidth,
      paddingVertical,
      paddingHorizontal,
      minHeight,
      borderRadius: theme.borderRadius.md,
      opacity: disabled || loading ? 0.5 : 1,
    };
  };

  const getTextColor = (): string => {
    if (variant === 'primary') return '#FFFFFF';
    if (variant === 'outline' || variant === 'ghost') return theme.colors.primary;
    return theme.colors.textPrimary;
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[styles.base, getContainerStyle(), style]}
      hitSlop={theme.hitSlop.small}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      ) : (
        <>
          {leftIcon}
          <AppText
            variant={size === 'sm' ? 'bodySmall' : 'body'}
            weight="medium"
            color={getTextColor()}
            style={[styles.text, leftIcon ? { marginLeft: theme.spacing.sm } : null, rightIcon ? { marginRight: theme.spacing.sm } : null]}
          >
            {title}
          </AppText>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
