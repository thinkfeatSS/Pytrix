/**
 * Privacy Policy & Terms Screen
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';

interface PrivacyPolicyScreenProps {
  navigation: any;
}

export function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable>
      {/* Header */}
      <View style={styles.headerRow}>
        <AppButton
          title="← Back"
          variant="ghost"
          size="sm"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <Badge label="LEGAL & PRIVACY" variant="neutral" />
      </View>

      <AppText variant="h1" style={styles.title}>Privacy Policy</AppText>
      <AppText variant="bodySmall" color={theme.colors.textMuted} style={styles.subtitle}>
        Last updated: November 2026 • 100% On-Device Privacy
      </AppText>

      {/* Highlights Banner */}
      <AppCard elevated style={styles.card}>
        <AppText variant="caption" weight="bold" color={theme.colors.success}>
          🛡️ YOUR PRIVACY IS ABSOLUTE
        </AppText>
        <AppText variant="body" style={styles.cardBody}>
          Pytrix is engineered from the ground up as an offline-first learning platform. We do not track, collect, transmit, or monetize your personal data.
        </AppText>
      </AppCard>

      {/* Detailed Policy Sections */}
      <AppCard style={styles.card}>
        <AppText variant="h3" style={styles.sectionTitle}>1. Data Collection</AppText>
        <AppText variant="bodySmall" style={styles.sectionBody}>
          Pytrix does not collect personal identifiers, names, emails, device IDs, or IP addresses. No user registration or login account is required to use the app.
        </AppText>

        <AppText variant="h3" style={styles.sectionTitle}>2. Python Code Execution</AppText>
        <AppText variant="bodySmall" style={styles.sectionBody}>
          All Python code typed into the handwriting editor is executed locally on your device using an embedded WebAssembly runtime. Your code never leaves your device and is never sent to external servers.
        </AppText>

        <AppText variant="h3" style={styles.sectionTitle}>3. Local Persistence</AppText>
        <AppText variant="bodySmall" style={styles.sectionBody}>
          Learner progress, completed checkpoints, and XP counts are stored exclusively in your local SQLite database on your device. You can clear this data at any time via Settings.
        </AppText>

        <AppText variant="h3" style={styles.sectionTitle}>4. Offline Independence</AppText>
        <AppText variant="bodySmall" style={styles.sectionBody}>
          The application requires no active internet connection or cellular data permissions. You may run Pytrix completely in Airplane Mode.
        </AppText>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  backBtn: {
    paddingHorizontal: 0,
    minHeight: 36,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    paddingVertical: 16,
  },
  cardBody: {
    marginTop: 6,
    lineHeight: 22,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
  },
  sectionBody: {
    lineHeight: 20,
  },
});

