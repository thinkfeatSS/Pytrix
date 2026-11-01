/**
 * Topic Learning Screen
 * Displays learning objectives, theory explanations, practical code examples, and pitfalls callouts.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { DatabaseClient } from '../../../database/DatabaseClient';
import { Topic } from '../../../shared/types/curriculum';
import { useTheme } from '../../../shared/theme';

interface TopicLearningScreenProps {
  route: { params: { topicId: string } };
  navigation: any;
}

export function TopicLearningScreen({ route, navigation }: TopicLearningScreenProps) {
  const { topicId } = route.params;
  const { theme } = useTheme();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTopic() {
      try {
        const dbClient = DatabaseClient.getInstance();
        await dbClient.initialize();
        const data = await dbClient.courseRepo.getTopicDetails(topicId);
        if (isMounted) {
          setTopic(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }
    loadTopic();
    return () => {
      isMounted = false;
    };
  }, [topicId]);

  if (loading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenContainer>
    );
  }

  if (!topic) {
    return (
      <ScreenContainer style={styles.center}>
        <AppText variant="h2">Topic Not Found</AppText>
        <AppButton title="Go Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <AppButton
          title="← Topics"
          variant="ghost"
          size="sm"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <Badge label="THEORY & CONCEPTS" variant="python" />
      </View>

      <AppText variant="h1" style={styles.title}>{topic.title}</AppText>

      {/* Learning Objective Card */}
      <AppCard elevated style={styles.objectiveCard}>
        <AppText variant="caption" weight="bold" color={theme.colors.primaryLight}>
          🎯 LEARNING OBJECTIVE
        </AppText>
        <AppText variant="body" style={styles.objectiveText}>
          {topic.learningObjective}
        </AppText>
      </AppCard>

      {/* Theory Content Card */}
      <AppCard style={styles.contentCard}>
        <AppText variant="body" style={styles.theoryText}>
          {topic.theoryMarkdown.replace(/#+ /g, '')}
        </AppText>
      </AppCard>

      {/* Common Pitfalls / Watch Out Box */}
      {topic.pitfallsMarkdown && (
        <AppCard style={[styles.pitfallsCard, { borderColor: theme.colors.warning }]}>
          <AppText variant="caption" weight="bold" color={theme.colors.warning}>
            ⚠️ COMMON PITFALLS & BUGS
          </AppText>
          <AppText variant="bodySmall" style={styles.pitfallsText}>
            {topic.pitfallsMarkdown}
          </AppText>
        </AppCard>
      )}

      {/* Navigation to Knowledge Check */}
      <View style={styles.actionRow}>
        <AppButton
          title="Continue to Knowledge Check ➔"
          variant="primary"
          size="lg"
          onPress={() => navigation.navigate('KnowledgeCheck', { topicId })}
          style={styles.continueBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    marginBottom: 16,
  },
  objectiveCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  objectiveText: {
    marginTop: 6,
    fontWeight: '500',
  },
  contentCard: {
    marginBottom: 16,
    paddingVertical: 18,
  },
  theoryText: {
    lineHeight: 24,
  },
  pitfallsCard: {
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  pitfallsText: {
    marginTop: 6,
    lineHeight: 20,
  },
  actionRow: {
    marginBottom: 32,
  },
  continueBtn: {
    width: '100%',
  },
});

