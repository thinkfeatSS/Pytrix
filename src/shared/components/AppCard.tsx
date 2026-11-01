import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface AppCardProps extends ViewProps {
  elevated?: boolean;
  bordered?: boolean;
  children: React.ReactNode;
}

export function AppCard({
  elevated = false,
  bordered = true,
  style,
  children,
  ...rest
}: AppCardProps) {
  const { theme } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? theme.colors.surfaceElevated : theme.colors.surface,
    borderColor: bordered ? theme.colors.border : 'transparent',
    borderWidth: bordered ? 1 : 0,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
  };

  return (
    <View style={[styles.card, cardStyle, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

