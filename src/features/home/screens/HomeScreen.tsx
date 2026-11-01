import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { DatabaseClient } from '../../../database/DatabaseClient';

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { theme } = useTheme();
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const dbClient = DatabaseClient.getInstance();
        await dbClient.initialize();
        const summary = await dbClient.progressRepo.getAllProgressSummary();
        if (isMounted) {
          setCompletedCount(summary.completedTopics);
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScreenContainer scrollable>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <AppText variant="caption">WELCOME BACK</AppText>
          <AppText variant="h1">Pytrix Python</AppText>
        </View>
        <Badge label="OFFLINE READY" variant="python" />
      </View>

      {/* Streak and Stats Banner */}
      <AppCard elevated style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <AppText variant="h2" color={theme.colors.pythonYellow}>🔥 3</AppText>
            <AppText variant="caption">DAY STREAK</AppText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <AppText variant="h2" color={theme.colors.primaryLight}>⭐ {completedCount * 100 + 120}</AppText>
            <AppText variant="caption">PYTHON XP</AppText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <AppText variant="h2" color={theme.colors.success}>{completedCount} / 24</AppText>
            <AppText variant="caption">TOPICS DONE</AppText>
          </View>
        </View>
      </AppCard>

      {/* Current Topic Resume Card */}
      <AppText variant="h3" style={styles.sectionTitle}>Continue Learning</AppText>
      <AppCard style={styles.resumeCard}>
        <View style={styles.topicHeader}>
          <Badge label="MODULE 1 • SYNTAX" variant="info" />
          <AppText variant="caption">Topic 1.1</AppText>
        </View>
        <AppText variant="h2" style={styles.topicTitle}>
          What is Programming & Hello World
        </AppText>
        <AppText variant="bodySmall" style={styles.topicDescription}>
          Learn how computers read Python instructions and write your very first program using the handwriting trace editor.
        </AppText>
        <View style={styles.cardActions}>
          <AppButton
            title="Continue Lesson"
            variant="primary"
            onPress={() => navigation.navigate('Learn')}
          />
        </View>
      </AppCard>

      {/* Handwriting Editor Feature Spotlight */}
      <AppText variant="h3" style={styles.sectionTitle}>Handwriting Code Editor</AppText>
      <AppCard elevated style={styles.featureCard}>
        <AppText variant="body" weight="medium">
          ✍️ Trace Before You Code
        </AppText>
        <AppText variant="bodySmall" style={styles.featureText}>
          Just like early handwriting practice books, trace faded code on screen to build real muscle memory for Python brackets, colons, and indentation.
        </AppText>
        <View style={styles.codeSnippetBox}>
          <AppText variant="code">
            print("Hello, Python!")
          </AppText>
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  statsCard: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  resumeCard: {
    marginBottom: 24,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicTitle: {
    marginBottom: 8,
  },
  topicDescription: {
    marginBottom: 16,
  },
  cardActions: {
    marginTop: 4,
  },
  featureCard: {
    marginBottom: 24,
  },
  featureText: {
    marginTop: 6,
    marginBottom: 12,
  },
  codeSnippetBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFE873',
  },
});
