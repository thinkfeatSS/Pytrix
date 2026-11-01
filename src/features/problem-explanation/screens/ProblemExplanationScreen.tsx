/**
 * Problem Explanation Screen
 * 4-Step Logic-Building Framework:
 * 1. Problem Statement
 * 2. Logic Behind the Solution
 * 3. Step-by-Step Algorithm (Pseudocode)
 * 4. Launch Code Editor Action
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { DatabaseClient } from '../../../database/DatabaseClient';
import { Exercise } from '../../../shared/types/curriculum';
import { useTheme } from '../../../shared/theme';

interface ProblemExplanationScreenProps {
  route: { params: { topicId: string } };
  navigation: any;
}

export function ProblemExplanationScreen({ route, navigation }: ProblemExplanationScreenProps) {
  const { topicId } = route.params;
  const { theme } = useTheme();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadExercise() {
      try {
        const dbClient = DatabaseClient.getInstance();
        await dbClient.initialize();
        const exercises = await dbClient.exerciseRepo.getExercisesForTopic(topicId);
        if (isMounted) {
          setExercise(exercises[0] || null);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }
    loadExercise();
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

  if (!exercise) {
    return (
      <ScreenContainer style={styles.center}>
        <AppText variant="h2">Exercise Not Found</AppText>
        <AppButton title="Go Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      {/* Header */}
      <View style={styles.headerRow}>
        <AppButton
          title="← Quiz"
          variant="ghost"
          size="sm"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <Badge label="LOGIC BUILDING" variant="python" />
      </View>

      <AppText variant="h1" style={styles.title}>{exercise.title}</AppText>
      <AppText variant="bodySmall" color={theme.colors.textMuted} style={styles.subtitle}>
        Understand the algorithmic problem before typing the solution.
      </AppText>

      {/* 1. Problem Statement */}
      <AppCard elevated style={styles.card}>
        <AppText variant="caption" weight="bold" color={theme.colors.primaryLight}>
          1. PROBLEM STATEMENT
        </AppText>
        <AppText variant="body" style={styles.cardText}>
          {exercise.prompt}
        </AppText>
      </AppCard>

      {/* 2. Logic Behind the Solution */}
      <AppCard style={styles.card}>
        <AppText variant="caption" weight="bold" color={theme.colors.pythonYellow}>
          2. LOGIC BEHIND SOLUTION
        </AppText>
        <AppText variant="body" style={styles.cardText}>
          {exercise.logicExplanation}
        </AppText>
      </AppCard>

      {/* 3. Step-by-Step Algorithm */}
      {exercise.stepByStepGuide && (
        <AppCard style={styles.card}>
          <AppText variant="caption" weight="bold" color={theme.colors.success}>
            3. STEP-BY-STEP ALGORITHM
          </AppText>
          <View style={styles.stepsList}>
            {exercise.stepByStepGuide.map((step, idx) => (
              <View key={idx} style={styles.stepItem}>
                <AppText variant="bodySmall" style={styles.stepText}>
                  {step}
                </AppText>
              </View>
            ))}
          </View>
        </AppCard>
      )}

      {/* 4. Action Button */}
      <View style={styles.actionRow}>
        <AppButton
          title="Launch Handwriting Editor ✍️"
          variant="primary"
          size="lg"
          onPress={() =>
            navigation.navigate('GuidedEditor', {
              topicId,
              exerciseId: exercise.id,
              exerciseTitle: exercise.title,
              prompt: exercise.prompt,
              referenceSolution: exercise.referenceSolution,
              starterCode: exercise.starterCode,
              expectedOutput: exercise.testCases[0]?.expectedOutput,
              hints: exercise.hints,
              mode:
                exercise.exerciseType === 'MODE_A_TRACE'
                  ? 'A'
                  : exercise.exerciseType === 'MODE_B_FILL_IN'
                  ? 'B'
                  : 'C',
            })
          }
          style={styles.launchBtn}
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
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    paddingVertical: 16,
  },
  cardText: {
    marginTop: 6,
    lineHeight: 22,
  },
  stepsList: {
    marginTop: 8,
    gap: 6,
  },
  stepItem: {
    paddingVertical: 2,
  },
  stepText: {
    lineHeight: 20,
  },
  actionRow: {
    marginTop: 8,
    marginBottom: 32,
  },
  launchBtn: {
    width: '100%',
  },
});

