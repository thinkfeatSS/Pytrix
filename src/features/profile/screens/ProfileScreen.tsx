import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';

interface ProfileScreenProps {
  navigation?: any;
}

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme, setThemeMode } = useTheme();

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <AppText variant="h1">Learner Profile</AppText>
        <AppText variant="bodySmall">Your Python learning milestones & offline environment.</AppText>
      </View>

      {/* User Milestone Card */}
      <AppCard elevated style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary }]}>
            <AppText variant="h2" color="#FFF">🐍</AppText>
          </View>
          <View style={styles.avatarInfo}>
            <AppText variant="h2">Python Novice</AppText>
            <AppText variant="caption">LEVEL 1 • 120 XP</AppText>
          </View>
        </View>
      </AppCard>

      {/* Offline Status Card */}
      <AppText variant="h3" style={styles.sectionTitle}>Offline System Status</AppText>
      <AppCard style={styles.statusCard}>
        <View style={styles.statusRow}>
          <AppText variant="body">Python Runtime (Pyodide Wasm)</AppText>
          <Badge label="BUNDLED" variant="success" />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statusRow}>
          <AppText variant="body">Offline Curriculum</AppText>
          <Badge label="SYNCED" variant="success" />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statusRow}>
          <AppText variant="body">Local Database (SQLite)</AppText>
          <Badge label="ACTIVE" variant="success" />
        </View>
      </AppCard>

      {/* Preferences Card */}
      <AppText variant="h3" style={styles.sectionTitle}>App Preferences</AppText>
      <AppCard style={styles.preferencesCard}>
        <View style={styles.statusRow}>
          <View>
            <AppText variant="body">Dark Mode (Code Friendly)</AppText>
            <AppText variant="caption">Optimized syntax contrast</AppText>
          </View>
          <Switch
            value={theme.isDark}
            onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </AppCard>

      {/* Settings Navigation Action */}
      <AppButton
        title="Settings & Diagnostics ⚙️"
        variant="secondary"
        onPress={() => navigation?.navigate('Settings')}
        style={styles.settingsBtn}
      />

      {/* Legal & Version Info */}
      <View style={styles.footer}>
        <AppText variant="caption" align="center">
          Pytrix v0.0.1 • 100% Offline Python Learning
        </AppText>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: 16,
  },
  profileCard: {
    marginBottom: 24,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarInfo: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statusCard: {
    marginBottom: 24,
    paddingVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  divider: {
    height: 1,
  },
  preferencesCard: {
    marginBottom: 20,
  },
  settingsBtn: {
    marginBottom: 24,
  },
  footer: {
    marginTop: 8,
    marginBottom: 32,
  },
});
