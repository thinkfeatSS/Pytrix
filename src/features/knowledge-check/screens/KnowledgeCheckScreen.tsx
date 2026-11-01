/**
 * Knowledge Check Screen
 * Interactive comprehension micro-quiz before entering the coding practice editor.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';

interface KnowledgeCheckScreenProps {
  route: { params: { topicId: string } };
  navigation: any;
}

const mockQuestions: Record<string, {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}> = {
  default: {
    question: 'How do you print text on the screen in Python?',
    options: [
      'print("Hello")',
      'Print("Hello")',
      'console.log("Hello")',
      'echo "Hello"',
    ],
    correctIndex: 0,
    explanation: 'Python uses the lowercase print() function with quotation marks around text.',
  },
};

export function KnowledgeCheckScreen({ route, navigation }: KnowledgeCheckScreenProps) {
  const { topicId } = route.params;
  const { theme } = useTheme();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const q = mockQuestions[topicId] || mockQuestions.default;
  const isAnswered = selectedIdx !== null;
  const isCorrect = selectedIdx === q.correctIndex;

  return (
    <ScreenContainer scrollable>
      {/* Header */}
      <View style={styles.headerRow}>
        <AppButton
          title="← Theory"
          variant="ghost"
          size="sm"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <Badge label="KNOWLEDGE CHECK" variant="python" />
      </View>

      <AppText variant="h1" style={styles.title}>Quick Quiz</AppText>
      <AppText variant="bodySmall" color={theme.colors.textMuted} style={styles.subtitle}>
        Verify your understanding before writing Python code.
      </AppText>

      {/* Question Card */}
      <AppCard elevated style={styles.questionCard}>
        <AppText variant="caption" weight="bold" color={theme.colors.primaryLight}>
          QUESTION 1 OF 1
        </AppText>
        <AppText variant="h3" style={styles.questionText}>
          {q.question}
        </AppText>

        {/* Options List */}
        <View style={styles.optionsList}>
          {q.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            let optBorder = theme.colors.border;
            let optBg = theme.colors.surfaceElevated;

            if (isSelected) {
              if (isCorrect) {
                optBorder = theme.colors.success;
                optBg = theme.colors.successBg;
              } else {
                optBorder = theme.colors.error;
                optBg = theme.colors.errorBg;
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedIdx(idx)}
                activeOpacity={0.7}
                style={[styles.optionItem, { borderColor: optBorder, backgroundColor: optBg }]}
              >
                <AppText
                  variant="body"
                  weight={isSelected ? 'bold' : 'regular'}
                  color={isSelected && isCorrect ? theme.colors.success : isSelected ? theme.colors.error : theme.colors.textPrimary}
                >
                  {opt}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </AppCard>

      {/* Feedback Banner */}
      {isAnswered && (
        <AppCard
          style={[
            styles.feedbackCard,
            {
              borderColor: isCorrect ? theme.colors.success : theme.colors.error,
              backgroundColor: isCorrect ? theme.colors.successBg : theme.colors.errorBg,
            },
          ]}
        >
          <AppText
            variant="bodySmall"
            weight="bold"
            color={isCorrect ? theme.colors.success : theme.colors.error}
          >
            {isCorrect ? '✓ Correct Answer!' : '✗ Not Quite!'}
          </AppText>
          <AppText variant="caption" style={styles.feedbackExp}>
            {q.explanation}
          </AppText>
        </AppCard>
      )}

      {/* Continue Button */}
      <View style={styles.actionRow}>
        <AppButton
          title="Enter Coding Practice ➔"
          variant="primary"
          size="lg"
          disabled={!isCorrect}
          onPress={() => navigation.navigate('ProblemExplanation', { topicId })}
          style={styles.continueBtn}
        />
      </View>
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
  questionCard: {
    marginBottom: 20,
    paddingVertical: 18,
  },
  questionText: {
    marginTop: 8,
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  feedbackCard: {
    marginBottom: 24,
    borderLeftWidth: 4,
    paddingVertical: 12,
  },
  feedbackExp: {
    marginTop: 4,
    lineHeight: 18,
  },
  actionRow: {
    marginBottom: 32,
  },
  continueBtn: {
    width: '100%',
  },
});

