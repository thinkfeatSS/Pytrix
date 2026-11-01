/**
 * CheckpointScreen Component
 * 3-Problem assessment screen that validates distinct problem solutions before unlocking the next topic.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { CodeEditorWebView } from '../../code-editor/components/CodeEditorWebView';
import { ProgressService, CheckpointSubmissionResult } from '../../progress/services/ProgressService';
import { DatabaseClient } from '../../../database/DatabaseClient';
import { Exercise } from '../../../shared/types/curriculum';
import { useTheme } from '../../../shared/theme';

interface CheckpointScreenProps {
  topicId: string;
  topicTitle?: string;
  checkpointExercises?: Exercise[];
  onComplete?: (unlockedTopicId: string | null) => void;
  onBack?: () => void;
}

export function CheckpointScreen({
  topicId,
  topicTitle = 'Output & Syntax Checkpoint',
  checkpointExercises = [],
  onComplete,
  onBack,
}: CheckpointScreenProps) {
  const { theme } = useTheme();
  const [exercisesList, setExercisesList] = useState<Exercise[]>(checkpointExercises);
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [typedCode, setTypedCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<CheckpointSubmissionResult | null>(null);
  const [solvedExerciseIds, setSolvedExerciseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    async function loadExercises() {
      if (checkpointExercises && checkpointExercises.length > 0) {
        setExercisesList(checkpointExercises);
        return;
      }
      try {
        const dbClient = DatabaseClient.getInstance();
        await dbClient.initialize();
        const allTopicEx = await dbClient.exerciseRepo.getExercisesForTopic(topicId);
        if (isMounted) {
          const chkOnly = allTopicEx.filter((e) => e.isCheckpoint || e.exerciseType === 'CHECKPOINT');
          setExercisesList(chkOnly.length > 0 ? chkOnly : allTopicEx);
        }
      } catch {
        // graceful fallback
      }
    }
    loadExercises();
    return () => {
      isMounted = false;
    };
  }, [topicId, checkpointExercises]);

  const currentExercise = exercisesList[currentProblemIdx] || null;
  const distinctSolvedCount = solvedExerciseIds.size;

  const handleSubmit = async () => {
    if (!currentExercise || !typedCode.trim()) return;

    setSubmitting(true);
    setSubmissionFeedback(null);

    try {
      const progressService = ProgressService.getInstance();
      const result = await progressService.submitCheckpointProblem(
        topicId,
        currentExercise,
        typedCode
      );

      setSubmissionFeedback(result);

      if (result.isPassed) {
        const nextSolved = new Set(solvedExerciseIds);
        nextSolved.add(currentExercise.id);
        setSolvedExerciseIds(nextSolved);

        if (result.isTopicCompleted && onComplete) {
          // All required distinct problems solved!
          setTimeout(() => {
            onComplete(result.unlockedTopicId);
          }, 1000);
        } else if (currentProblemIdx < exercisesList.length - 1) {
          // Advance to next problem in the checkpoint pool
          setTimeout(() => {
            setCurrentProblemIdx((prev) => prev + 1);
            setTypedCode('');
            setSubmissionFeedback(null);
          }, 1200);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer withHeaderPadding={true} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Navigation Header */}
        <View style={styles.headerRow}>
          <AppButton
            title="← Exit Checkpoint"
            variant="ghost"
            size="sm"
            onPress={onBack}
            style={styles.backBtn}
          />
          <Badge label="CHECKPOINT ASSESSMENT" variant="python" />
        </View>

        <AppText variant="h2" style={styles.title}>{topicTitle}</AppText>
        <AppText variant="bodySmall" color={theme.colors.textMuted} style={styles.subtitle}>
          Solve 3 distinct coding problems independently to earn topic completion and unlock the next module.
        </AppText>

        {/* 3-Problem Distinct Progress Stepper */}
        <AppCard elevated style={styles.stepperCard}>
          <View style={styles.stepperHeader}>
            <AppText variant="caption" weight="bold">
              CHECKPOINT PROGRESS ({distinctSolvedCount}/3 DISTINCT SOLVED)
            </AppText>
          </View>
          <View style={styles.stepBadgesRow}>
            {[0, 1, 2].map((idx) => {
              const isDone = idx < distinctSolvedCount;
              const isCurrent = idx === distinctSolvedCount;

              return (
                <View
                  key={idx}
                  style={[
                    styles.stepBadgeBox,
                    isDone
                      ? { backgroundColor: theme.colors.successBg, borderColor: theme.colors.success }
                      : isCurrent
                      ? [styles.currentStepBadge, { borderColor: theme.colors.pythonYellow }]
                      : { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                  ]}
                >
                  <AppText
                    variant="bodySmall"
                    weight="bold"
                    color={
                      isDone
                        ? theme.colors.success
                        : isCurrent
                        ? theme.colors.pythonYellow
                        : theme.colors.textMuted
                    }
                  >
                    {isDone ? `✓ Problem ${idx + 1}` : `Problem ${idx + 1}`}
                  </AppText>
                </View>
              );
            })}
          </View>
        </AppCard>

        {/* Current Problem Prompt Card */}
        {currentExercise && (
          <AppCard style={styles.problemCard}>
            <View style={styles.problemHeader}>
              <Badge label={`PROBLEM ${currentProblemIdx + 1} OF ${exercisesList.length}`} variant="info" />
              <AppText variant="caption">100 XP</AppText>
            </View>
            <AppText variant="h3" style={styles.problemTitle}>{currentExercise.title}</AppText>
            <AppText variant="body" style={styles.problemPrompt}>{currentExercise.prompt}</AppText>

            {currentExercise.testCases[0] && (
              <View style={styles.expectedBox}>
                <AppText variant="caption" color={theme.colors.textMuted}>EXPECTED OUTPUT:</AppText>
                <AppText variant="code" color={theme.colors.syntax.string}>
                  {currentExercise.testCases[0].expectedOutput}
                </AppText>
              </View>
            )}
          </AppCard>
        )}

        {/* Submission Feedback Banner */}
        {submissionFeedback && (
          <AppCard
            style={[
              styles.feedbackCard,
              {
                borderColor: submissionFeedback.isPassed ? theme.colors.success : theme.colors.error,
                backgroundColor: submissionFeedback.isPassed ? theme.colors.successBg : theme.colors.errorBg,
              },
            ]}
          >
            <AppText
              variant="bodySmall"
              weight="bold"
              color={submissionFeedback.isPassed ? theme.colors.success : theme.colors.error}
            >
              {submissionFeedback.isPassed ? '✓ Correct Solution!' : '✗ Test Failed'}
            </AppText>
            <AppText variant="caption" style={styles.feedbackMsg}>
              {submissionFeedback.message}
            </AppText>
          </AppCard>
        )}

        {/* Embedded Code Editor */}
        <View style={styles.editorBox}>
          <CodeEditorWebView
            initialCode={currentExercise?.starterCode || '# Write your solution below\n'}
            referenceCode={currentExercise?.referenceSolution || ''}
            mode="C"
            onCodeChange={(code) => setTypedCode(code)}
          />
        </View>

        {/* Action Button */}
        <AppButton
          title={submitting ? 'Evaluating...' : 'Submit Problem Solution ▷'}
          variant="primary"
          size="lg"
          disabled={submitting || !typedCode.trim()}
          loading={submitting}
          onPress={handleSubmit}
          style={styles.submitBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    paddingHorizontal: 0,
    minHeight: 36,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
  },
  stepperCard: {
    marginBottom: 16,
  },
  stepperHeader: {
    marginBottom: 10,
  },
  stepBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBadgeBox: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentStepBadge: {
    backgroundColor: 'rgba(255, 212, 59, 0.15)',
  },
  problemCard: {
    marginBottom: 16,
  },
  problemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  problemTitle: {
    marginBottom: 6,
  },
  problemPrompt: {
    marginBottom: 12,
  },
  expectedBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 6,
  },
  feedbackCard: {
    marginBottom: 16,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  feedbackMsg: {
    marginTop: 4,
  },
  editorBox: {
    height: 280,
    marginBottom: 20,
  },
  submitBtn: {
    width: '100%',
  },
});
