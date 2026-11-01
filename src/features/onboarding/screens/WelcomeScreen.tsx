/**
 * Welcome & Onboarding Screen
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';

interface WelcomeScreenProps {
  navigation: any;
}

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable>
      <View style={styles.centerBox}>
        {/* Python Mascot Badge */}
        <View style={styles.mascotCircle}>
          <AppText variant="display">🐍</AppText>
        </View>

        <Badge label="OFFLINE PYTHON LEARNING" variant="python" style={styles.badge} />
        <AppText variant="h1" align="center" style={styles.title}>
          Welcome to Pytrix
        </AppText>
        <AppText variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtitle}>
          Master Python from scratch with handwriting-inspired practice and live execution visualizers.
        </AppText>

        {/* Feature Highlights */}
        <AppCard elevated style={styles.featureCard}>
          <View style={styles.featureRow}>
            <AppText variant="h3">✍️</AppText>
            <View style={styles.featureTextCol}>
              <AppText variant="body" weight="bold">Handwriting Copybook Editor</AppText>
              <AppText variant="bodySmall" color={theme.colors.textMuted}>
                Trace ghost code on screen to build muscle memory for brackets, colons, and indentation.
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.featureRow}>
            <AppText variant="h3">🔍</AppText>
            <View style={styles.featureTextCol}>
              <AppText variant="body" weight="bold">Line-by-Line Visualizer</AppText>
              <AppText variant="bodySmall" color={theme.colors.textMuted}>
                Step through Python code line by line with live memory variable inspection.
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.featureRow}>
            <AppText variant="h3">🏆</AppText>
            <View style={styles.featureTextCol}>
              <AppText variant="body" weight="bold">3-Problem Checkpoints</AppText>
              <AppText variant="bodySmall" color={theme.colors.textMuted}>
                Earn topic completion by proving real mastery on 3 distinct coding challenges.
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.featureRow}>
            <AppText variant="h3">✈️</AppText>
            <View style={styles.featureTextCol}>
              <AppText variant="body" weight="bold">100% Offline Freedom</AppText>
              <AppText variant="bodySmall" color={theme.colors.textMuted}>
                Embedded Pyodide WebAssembly runtime executes Python directly on your phone without internet.
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Get Started Button */}
        <AppButton
          title="Start Learning Python ➔"
          variant="primary"
          size="lg"
          onPress={() => navigation.navigate('MainTabs')}
          style={styles.startBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  mascotCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 212, 59, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badge: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    paddingHorizontal: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  featureCard: {
    width: '100%',
    paddingVertical: 14,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 14,
  },
  featureTextCol: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  startBtn: {
    width: '100%',
    marginBottom: 16,
  },
});

