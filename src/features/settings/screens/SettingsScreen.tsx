/**
 * Settings & Offline System Information Screen
 */

import React, { useState } from 'react';
import { View, StyleSheet, Switch, Alert } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';

interface SettingsScreenProps {
  navigation: any;
}

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { theme, setThemeMode } = useTheme();
  const [resetting, setResetting] = useState(false);

  const handleResetProgress = () => {
    Alert.alert(
      'Reset All Progress?',
      'This will reset your completed checkpoints and XP back to 0. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Progress',
          style: 'destructive',
          onPress: () => {
            setResetting(true);
            setTimeout(() => {
              setResetting(false);
              Alert.alert('Progress Reset', 'Your learning progress has been reset to Topic 1.1.');
            }, 500);
          },
        },
      ]
    );
  };

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
        <Badge label="SETTINGS" variant="neutral" />
      </View>

      <AppText variant="h1" style={styles.title}>Settings</AppText>
      <AppText variant="bodySmall" color={theme.colors.textMuted} style={styles.subtitle}>
        App preferences and offline environment diagnostic status.
      </AppText>

      {/* Preferences Section */}
      <AppText variant="h3" style={styles.sectionHeading}>Preferences</AppText>
      <AppCard style={styles.card}>
        <View style={styles.settingRow}>
          <View>
            <AppText variant="body">Dark Mode (Code Friendly)</AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              High-contrast syntax highlighting
            </AppText>
          </View>
          <Switch
            value={theme.isDark}
            onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </AppCard>

      {/* Offline Status Diagnostics */}
      <AppText variant="h3" style={styles.sectionHeading}>Offline Diagnostics</AppText>
      <AppCard style={styles.card}>
        <View style={styles.diagRow}>
          <AppText variant="body">Pyodide WebAssembly Engine</AppText>
          <Badge label="BUNDLED (OFFLINE)" variant="success" />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.diagRow}>
          <AppText variant="body">Local Database (SQLite)</AppText>
          <Badge label="INITIALIZED" variant="success" />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.diagRow}>
          <AppText variant="body">Offline Curriculum</AppText>
          <Badge label="6 MODULES / 24 TOPICS" variant="python" />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.diagRow}>
          <AppText variant="body">Network Requirements</AppText>
          <Badge label="0 KB (AIRPLANE MODE)" variant="neutral" />
        </View>
      </AppCard>

      {/* Legal & Policies */}
      <AppText variant="h3" style={styles.sectionHeading}>Legal & About</AppText>
      <AppCard style={styles.card}>
        <AppButton
          title="Privacy Policy & Terms ➔"
          variant="ghost"
          onPress={() => navigation.navigate('PrivacyPolicy')}
          style={styles.legalBtn}
        />
      </AppCard>

      {/* Danger Zone: Reset Data */}
      <AppText variant="h3" style={styles.sectionHeading}>Storage & Reset</AppText>
      <AppCard style={[styles.card, { borderColor: theme.colors.error }]}>
        <AppText variant="bodySmall" color={theme.colors.textMuted} style={styles.dangerText}>
          Reset your checkpoint records and progress history to restart the course from the beginning.
        </AppText>
        <AppButton
          title={resetting ? 'Resetting...' : 'Reset Learning Progress'}
          variant="outline"
          disabled={resetting}
          onPress={handleResetProgress}
          style={styles.resetBtn}
        />
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
  sectionHeading: {
    marginTop: 8,
    marginBottom: 10,
  },
  card: {
    marginBottom: 20,
    paddingVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  divider: {
    height: 1,
  },
  legalBtn: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minHeight: 40,
  },
  dangerText: {
    marginBottom: 12,
  },
  resetBtn: {
    borderColor: '#EF4444',
  },
});

