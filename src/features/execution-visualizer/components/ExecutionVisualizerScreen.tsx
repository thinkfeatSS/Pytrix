/**
 * Line-by-Line Python Execution Visualizer Screen
 * Steppable execution inspector with code highlighting, live variable table, and synchronized terminal output.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { ExecutionStep } from '../../python-runtime/types';
import { useTheme } from '../../../shared/theme';

interface ExecutionVisualizerScreenProps {
  code: string;
  steps: ExecutionStep[];
  onClose?: () => void;
  onRestart?: () => void;
  onNextStep?: () => void;
  nextButtonTitle?: string;
}

export function ExecutionVisualizerScreen({
  code = 'x = 10\ny = 20\ntotal = x + y\nprint("Total:", total)',
  steps = [],
  onClose,
  onRestart,
  onNextStep,
  nextButtonTitle,
}: ExecutionVisualizerScreenProps) {
  const { theme } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const codeLines = code.split('\n');
  const currentStep = steps[currentStepIndex] || null;
  const currentLineNumber = currentStep?.lineNumber || 1;
  const isLastStep = steps.length <= 1 || currentStepIndex >= steps.length - 1;

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setTimeout(() => {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1200);
    } else if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length]);

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else if (onNextStep) {
      onNextStep();
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    if (onRestart) onRestart();
  };

  const togglePlay = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const activeVariables = currentStep ? Object.values(currentStep.variables) : [];

  return (
    <ScreenContainer withHeaderPadding={true} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Navigation */}
        <View style={styles.headerRow}>
          <AppButton
            title="← Back to Editor"
            variant="ghost"
            size="sm"
            onPress={onClose}
            style={styles.backBtn}
          />
          <Badge label="LINE-BY-LINE TRACE" variant="python" />
        </View>

        <AppText variant="h2" style={styles.title}>Execution Visualizer</AppText>
        <AppText variant="bodySmall" color={theme.colors.textMuted} style={styles.subtitle}>
          Step through your Python code to see variable assignments and output in real time.
        </AppText>

        {/* Step Scrubber Controller Bar */}
        <AppCard elevated style={styles.controlsCard}>
          <View style={styles.stepCounterRow}>
            <AppText variant="caption" weight="bold">
              STEP {steps.length > 0 ? currentStepIndex + 1 : 0} OF {steps.length}
            </AppText>
            <AppText variant="caption" color={theme.colors.pythonYellow}>
              LINE {currentLineNumber}
            </AppText>
          </View>

          <View style={styles.buttonControlsRow}>
            <TouchableOpacity onPress={handleReset} style={styles.ctrlBtn}>
              <AppText variant="body">|◁</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentStepIndex === 0}
              style={[styles.ctrlBtn, currentStepIndex === 0 && styles.disabledBtn]}
            >
              <AppText variant="body" color={currentStepIndex === 0 ? theme.colors.textMuted : theme.colors.textPrimary}>
                ◀ Prev
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlay} style={[styles.ctrlBtn, styles.playBtn, { backgroundColor: theme.colors.primary }]}>
              <AppText variant="body" weight="bold" color="#FFF">
                {isPlaying ? '⏸ Pause' : '▷ Play'}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              disabled={!onNextStep && isLastStep}
              style={[
                styles.ctrlBtn,
                !onNextStep && isLastStep && styles.disabledBtn,
                isLastStep && onNextStep && { backgroundColor: theme.colors.primary },
              ]}
            >
              <AppText
                variant="body"
                weight={isLastStep && onNextStep ? 'bold' : 'regular'}
                color={
                  !onNextStep && isLastStep
                    ? theme.colors.textMuted
                    : isLastStep && onNextStep
                    ? '#FFF'
                    : theme.colors.textPrimary
                }
              >
                {isLastStep && onNextStep ? 'Next Step ➔' : 'Next ▶'}
              </AppText>
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* Step Explanation Banner */}
        {currentStep?.explanation && (
          <AppCard style={[styles.explanationCard, { borderColor: theme.colors.primary }]}>
            <AppText variant="caption" weight="bold" color={theme.colors.primaryLight}>
              STEP EXPLANATION
            </AppText>
            <AppText variant="body" style={styles.explanationText}>
              {currentStep.explanation}
            </AppText>
          </AppCard>
        )}

        {/* Highlighted Code Display */}
        <AppText variant="h3" style={styles.sectionHeading}>Code Execution</AppText>
        <AppCard style={styles.codeCard}>
          {codeLines.map((line, idx) => {
            const lineNum = idx + 1;
            const isCurrentLine = lineNum === currentLineNumber;

            return (
              <View
                key={lineNum}
                style={[
                  styles.codeLineRow,
                  isCurrentLine && [styles.activeCodeLine, { backgroundColor: 'rgba(255, 212, 59, 0.15)' }],
                ]}
              >
                <AppText
                  variant="caption"
                  color={isCurrentLine ? theme.colors.pythonYellow : theme.colors.textMuted}
                  style={styles.lineNumber}
                >
                  {isCurrentLine ? '▶ ' : '  '}
                  {lineNum}
                </AppText>
                <AppText
                  variant="code"
                  color={isCurrentLine ? '#FFF' : theme.colors.textPrimary}
                  style={styles.codeLineText}
                >
                  {line || ' '}
                </AppText>
              </View>
            );
          })}
        </AppCard>

        {/* Live Memory Variables Table */}
        <AppText variant="h3" style={styles.sectionHeading}>Variables in Memory</AppText>
        <AppCard style={styles.variablesCard}>
          {activeVariables.length === 0 ? (
            <AppText variant="bodySmall" color={theme.colors.textMuted}>
              No active variables at this step.
            </AppText>
          ) : (
            activeVariables.map((v) => (
              <View key={v.name} style={styles.variableRow}>
                <View style={styles.varNameCol}>
                  <AppText variant="body" weight="medium" color={theme.colors.pythonYellow}>
                    {v.name}
                  </AppText>
                  <Badge label={v.type} variant="info" style={styles.varBadge} />
                </View>
                <View style={styles.varValCol}>
                  <AppText variant="body" weight="bold">
                    {v.value}
                  </AppText>
                </View>
              </View>
            ))
          )}
        </AppCard>

        {/* Synchronized Terminal Console Output */}
        <AppText variant="h3" style={styles.sectionHeading}>Terminal Output</AppText>
        <View style={styles.terminalBox}>
          <AppText variant="code" color={theme.colors.syntax.string}>
            {currentStep?.stdout || '> (No output generated yet)'}
          </AppText>
        </View>

        {/* Execution Completion Card */}
        {isLastStep && (
          <AppCard style={[styles.completedCard, { borderColor: theme.colors.success }]}>
            <View style={styles.completedHeader}>
              <Badge label="EXECUTION FINISHED" variant="python" />
            </View>
            <AppText variant="bodySmall" weight="bold" color={theme.colors.success} style={styles.completedTitle}>
              ✓ Program executed successfully!
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted} style={styles.completedSubtext}>
              Review variable memory and terminal output above, then proceed to the next step.
            </AppText>
          </AppCard>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <AppButton
            title={nextButtonTitle || (isLastStep ? 'Continue to Next Step ➔' : 'Next Step ▶')}
            variant="primary"
            size="lg"
            onPress={() => {
              if (isLastStep && onNextStep) {
                onNextStep();
              } else if (!isLastStep) {
                handleNext();
              } else if (onNextStep) {
                onNextStep();
              } else if (onClose) {
                onClose();
              }
            }}
            style={styles.continueBtn}
          />
          {onClose && (
            <AppButton
              title="← Return to Editor"
              variant="ghost"
              size="sm"
              onPress={onClose}
              style={styles.bottomBackBtn}
            />
          )}
        </View>
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
  controlsCard: {
    marginBottom: 16,
    paddingVertical: 14,
  },
  stepCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  buttonControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  ctrlBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    flex: 1,
    paddingVertical: 10,
  },
  disabledBtn: {
    opacity: 0.35,
  },
  explanationCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    paddingVertical: 12,
  },
  explanationText: {
    marginTop: 4,
    fontWeight: '500',
  },
  sectionHeading: {
    marginTop: 12,
    marginBottom: 8,
  },
  codeCard: {
    padding: 10,
    marginBottom: 16,
  },
  codeLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  activeCodeLine: {
    borderRadius: 4,
  },
  lineNumber: {
    width: 36,
    fontFamily: 'monospace',
  },
  codeLineText: {
    flex: 1,
  },
  variablesCard: {
    marginBottom: 16,
    paddingVertical: 10,
  },
  variableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  varNameCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  varBadge: {
    marginLeft: 4,
  },
  varValCol: {
    alignItems: 'flex-end',
  },
  terminalBox: {
    backgroundColor: '#05070B',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E2235',
    minHeight: 80,
    marginBottom: 16,
  },
  completedCard: {
    marginBottom: 20,
    borderLeftWidth: 4,
    paddingVertical: 14,
  },
  completedHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  completedTitle: {
    marginTop: 6,
  },
  completedSubtext: {
    marginTop: 4,
  },
  bottomActions: {
    marginTop: 8,
    marginBottom: 24,
    gap: 10,
  },
  continueBtn: {
    width: '100%',
  },
  bottomBackBtn: {
    width: '100%',
  },
});

