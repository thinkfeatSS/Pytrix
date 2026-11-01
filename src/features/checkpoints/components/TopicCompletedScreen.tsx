/**
 * Topic Completed Celebration Screen
 * Displays earned XP rewards, streak increments, and unlocked topic transition.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';

interface TopicCompletedScreenProps {
  topicTitle?: string;
  unlockedTopicTitle?: string;
  earnedXp?: number;
  streakDays?: number;
  onContinue?: () => void;
}

export function TopicCompletedScreen({
  topicTitle = 'Output & Syntax Mastery',
  unlockedTopicTitle = 'Module 2: Variables & Data Types',
  earnedXp = 250,
  streakDays = 4,
  onContinue,
}: TopicCompletedScreenProps) {
  const { theme } = useTheme();

  return (
    <ScreenContainer withHeaderPadding={true} style={styles.screen}>
      <View style={styles.centerContainer}>
        {/* Celebration Trophy Badge */}
        <View style={styles.trophyCircle}>
          <AppText variant="display">🏆</AppText>
        </View>

        <Badge label="CHECKPOINT MASTERED" variant="success" style={styles.badge} />
        <AppText variant="h1" align="center" style={styles.title}>
          Topic Completed!
        </AppText>
        <AppText variant="body" align="center" color={theme.colors.textSecondary} style={styles.topicName}>
          {topicTitle}
        </AppText>

        {/* Rewards Card */}
        <AppCard elevated style={styles.rewardsCard}>
          <View style={styles.rewardRow}>
            <View style={styles.rewardItem}>
              <AppText variant="h2" color={theme.colors.pythonYellow}>+{earnedXp}</AppText>
              <AppText variant="caption">XP EARNED</AppText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.rewardItem}>
              <AppText variant="h2" color={theme.colors.primaryLight}>🔥 {streakDays}</AppText>
              <AppText variant="caption">DAY STREAK</AppText>
            </View>
          </View>
        </AppCard>

        {/* Unlocked Next Topic Card */}
        <AppCard style={styles.unlockedCard}>
          <Badge label="NEW TOPIC UNLOCKED" variant="python" />
          <AppText variant="h3" style={styles.unlockedTitle}>
            {unlockedTopicTitle}
          </AppText>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Available now in your learning dashboard.
          </AppText>
        </AppCard>

        {/* Continue Button */}
        <AppButton
          title="Continue to Next Topic ➔"
          variant="primary"
          size="lg"
          onPress={onContinue}
          style={styles.continueBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
  centerContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 212, 59, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badge: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 6,
  },
  topicName: {
    marginBottom: 24,
  },
  rewardsCard: {
    width: '100%',
    paddingVertical: 18,
    marginBottom: 16,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rewardItem: {
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 36,
  },
  unlockedCard: {
    width: '100%',
    marginBottom: 28,
  },
  unlockedTitle: {
    marginTop: 8,
    marginBottom: 4,
  },
  continueBtn: {
    width: '100%',
  },
});
