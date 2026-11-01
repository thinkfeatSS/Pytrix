import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../theme';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'code'
  | 'caption'
  | 'label';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  weight?: 'regular' | 'medium' | 'bold';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function AppText({
  variant = 'body',
  color,
  weight,
  align = 'left',
  style,
  children,
  ...rest
}: AppTextProps) {
  const { theme } = useTheme();

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'display':
        return {
          fontSize: theme.typography.sizes.display,
          fontFamily: theme.typography.families.bold,
          fontWeight: '700',
          color: theme.colors.textPrimary,
          lineHeight: theme.typography.sizes.display * 1.2,
        };
      case 'h1':
        return {
          fontSize: theme.typography.sizes.xxl,
          fontFamily: theme.typography.families.bold,
          fontWeight: weight === 'regular' ? '400' : '700',
          color: theme.colors.textPrimary,
          lineHeight: theme.typography.sizes.xxl * 1.25,
        };
      case 'h2':
        return {
          fontSize: theme.typography.sizes.xl,
          fontFamily: theme.typography.families.bold,
          fontWeight: weight === 'regular' ? '400' : '700',
          color: theme.colors.textPrimary,
          lineHeight: theme.typography.sizes.xl * 1.3,
        };
      case 'h3':
        return {
          fontSize: theme.typography.sizes.lg,
          fontFamily: theme.typography.families.medium,
          fontWeight: weight === 'bold' ? '700' : '600',
          color: theme.colors.textPrimary,
          lineHeight: theme.typography.sizes.lg * 1.35,
        };
      case 'body':
        return {
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.families.regular,
          fontWeight: weight === 'bold' ? '700' : weight === 'medium' ? '600' : '400',
          color: theme.colors.textPrimary,
          lineHeight: theme.typography.sizes.base * 1.45,
        };
      case 'bodySmall':
        return {
          fontSize: theme.typography.sizes.sm,
          fontFamily: theme.typography.families.regular,
          fontWeight: weight === 'bold' ? '700' : weight === 'medium' ? '600' : '400',
          color: theme.colors.textSecondary,
          lineHeight: theme.typography.sizes.sm * 1.45,
        };
      case 'code':
        return {
          fontSize: theme.typography.sizes.sm,
          fontFamily: theme.typography.families.code,
          color: theme.colors.pythonYellow,
          lineHeight: theme.typography.sizes.sm * 1.5,
        };
      case 'caption':
        return {
          fontSize: theme.typography.sizes.xs,
          fontFamily: theme.typography.families.regular,
          fontWeight: weight === 'bold' ? '700' : weight === 'medium' ? '600' : '400',
          color: theme.colors.textMuted,
          lineHeight: theme.typography.sizes.xs * 1.4,
        };
      case 'label':
        return {
          fontSize: theme.typography.sizes.sm,
          fontFamily: theme.typography.families.medium,
          fontWeight: '600',
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        };
      default:
        return {};
    }
  };

  const customStyle: TextStyle = {
    textAlign: align,
    ...(color ? { color } : {}),
  };

  return (
    <Text style={[getVariantStyle(), customStyle, style]} {...rest}>
      {children}
    </Text>
  );
}
