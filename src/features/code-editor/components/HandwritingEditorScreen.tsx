/**
 * Handwriting Guided Code Editor Screen
 * Provides copybook tracing, fill-in blanks, and independent practice with real-time feedback.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { CodeEditorWebView } from './CodeEditorWebView';
import {
  ValidationResult,
  EditorValidationEngine,
  FormattedPythonError,
  formatPythonInterpreterError,
} from '../validator/EditorValidationEngine';
import { PythonExecutionEngine } from '../../python-runtime/engine/PythonExecutionEngine';
import { useTheme } from '../../../shared/theme';

interface HandwritingEditorScreenProps {
  exerciseTitle?: string;
  prompt?: string;
  referenceSolution?: string;
  starterCode?: string;
  expectedOutput?: string;
  hints?: string[];
  mode?: 'A' | 'B' | 'C';
  onRunCode?: (code: string) => void;
  onBack?: () => void;
}

export function HandwritingEditorScreen({
  exerciseTitle = 'Trace Python Output',
  prompt = 'Type the exact Python code to output "Hello, World!" to the console.',
  referenceSolution = 'print("Hello, World!")\n',
  starterCode = '',
  expectedOutput,
  hints,
  mode = 'A',
  onRunCode,
  onBack,
}: HandwritingEditorScreenProps) {
  const { theme } = useTheme();
  const initialEditorCode = mode === 'A' ? '' : starterCode;
  const [currentCode, setCurrentCode] = useState(initialEditorCode);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [modeBError, setModeBError] = useState<string | null>(null);
  const [pythonError, setPythonError] = useState<FormattedPythonError | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    setCurrentCode(mode === 'A' ? '' : starterCode);
    setModeBError(null);
    setPythonError(null);
    setShowGuideModal(false);
    setValidation(null);
  }, [starterCode, mode, referenceSolution]);

  const handleCodeChange = useCallback((code: string) => {
    setCurrentCode(code);
    if (modeBError) {
      setModeBError(null);
    }
    if (pythonError) {
      setPythonError(null);
    }
  }, [modeBError, pythonError]);

  const handleValidationChange = useCallback((res: ValidationResult) => {
    setValidation(res);
    if (mode === 'A') {
      if (res.error) {
        const pErr = formatPythonInterpreterError({
          errorType: res.error.type === 'INDENTATION' ? 'IndentationError' : 'SyntaxError',
          line: res.error.line,
          column: res.error.column,
          code: currentCode,
          message: res.error.message,
        });
        setPythonError(pErr);
      } else {
        setPythonError(null);
      }
    }
  }, [mode, currentCode]);

  const isReadyToRun =
    mode === 'A'
      ? Boolean(validation?.isComplete)
      : currentCode.trim().length > 0;

  const handleRunPress = useCallback(async () => {
    if (mode === 'A') {
      if (validation?.isComplete && onRunCode) {
        setPythonError(null);
        onRunCode(currentCode);
      }
    } else if (mode === 'B') {
      // 1. Check for unfilled blank gaps (___)
      if (currentCode.includes('___')) {
        const col = currentCode.indexOf('___') + 1;
        const pErr = formatPythonInterpreterError({
          errorType: 'NameError',
          line: 1,
          column: col,
          code: currentCode,
          message: "name '___' is not defined. Replace the blank gap with your code.",
        });
        setPythonError(pErr);
        setModeBError(pErr.message);
        return;
      }

      // 2. Syntax check
      const syntax = EditorValidationEngine.checkSyntax(currentCode);
      if (!syntax.isValid && syntax.errors.length > 0) {
        const err = syntax.errors[0];
        const pErr = formatPythonInterpreterError({
          errorType: 'SyntaxError',
          line: err.line,
          column: 1,
          code: currentCode,
          message: err.message,
        });
        setPythonError(pErr);
        setModeBError(pErr.message);
        return;
      }

      // 3. Check token-aware normalized validation
      const res = EditorValidationEngine.validateFillIn(currentCode, referenceSolution, expectedOutput);
      if (res.isComplete) {
        setPythonError(null);
        setModeBError(null);
        if (onRunCode) {
          onRunCode(currentCode);
        }
        return;
      }

      // 4. Dynamic execution check: if code produces expected output, it passes!
      try {
        const execResult = await PythonExecutionEngine.executeScript(currentCode);
        const cleanStdout = execResult.stdout.trim();
        const cleanExpected = (expectedOutput || '').trim();

        if (execResult.success && cleanExpected.length > 0 && cleanStdout === cleanExpected) {
          setPythonError(null);
          setModeBError(null);
          if (onRunCode) {
            onRunCode(currentCode);
          }
          return;
        }

        if (!execResult.success && execResult.stderr) {
          let errLine = 1;
          const lineMatch = execResult.stderr.match(/line\s+(\d+)/i);
          if (lineMatch) errLine = parseInt(lineMatch[1], 10);

          const pErr = formatPythonInterpreterError({
            errorType: 'RuntimeError',
            line: errLine,
            column: 1,
            code: currentCode,
            message: execResult.stderr,
          });
          setPythonError(pErr);
          setModeBError(pErr.message);
          return;
        }

        if (cleanExpected.length > 0 && cleanStdout !== cleanExpected) {
          const pErr = formatPythonInterpreterError({
            errorType: 'AssertionError',
            line: 1,
            column: 1,
            code: currentCode,
            message: `Output mismatch: expected "${cleanExpected}" but got "${cleanStdout || '<nothing>'}"`,
          });
          setPythonError(pErr);
          setModeBError(pErr.message);
          return;
        }
      } catch {}

      // 5. If neither passed, report error message
      const pErr = formatPythonInterpreterError({
        errorType: 'AssertionError',
        line: 1,
        column: 1,
        code: currentCode,
        message: res.error?.message || 'Your completed code does not produce the expected result.',
      });
      setPythonError(pErr);
      setModeBError(pErr.message);
    } else {
      // Mode C: Write independently
      const syntax = EditorValidationEngine.checkSyntax(currentCode);
      if (!syntax.isValid && syntax.errors.length > 0) {
        const err = syntax.errors[0];
        const pErr = formatPythonInterpreterError({
          errorType: 'SyntaxError',
          line: err.line,
          column: 1,
          code: currentCode,
          message: err.message,
        });
        setPythonError(pErr);
        setModeBError(pErr.message);
        return;
      }

      try {
        const execResult = await PythonExecutionEngine.executeScript(currentCode);
        if (!execResult.success && execResult.stderr) {
          let errLine = 1;
          const lineMatch = execResult.stderr.match(/line\s+(\d+)/i);
          if (lineMatch) errLine = parseInt(lineMatch[1], 10);

          const pErr = formatPythonInterpreterError({
            errorType: 'RuntimeError',
            line: errLine,
            column: 1,
            code: currentCode,
            message: execResult.stderr,
          });
          setPythonError(pErr);
          setModeBError(pErr.message);
          return;
        }
      } catch {}

      setPythonError(null);
      setModeBError(null);
      if (onRunCode) {
        onRunCode(currentCode);
      }
    }
  }, [mode, validation?.isComplete, currentCode, referenceSolution, expectedOutput, onRunCode]);

  return (
    <ScreenContainer withHeaderPadding={true} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Navigation Bar */}
        <View style={styles.headerRow}>
          <AppButton
            title="← Back"
            variant="ghost"
            size="sm"
            onPress={onBack}
            style={styles.backBtn}
          />
          <Badge
            label={
              mode === 'A'
                ? 'MODE A: TRACE'
                : mode === 'B'
                ? 'MODE B: FILL-IN'
                : 'MODE C: INDEPENDENT'
            }
            variant="python"
          />
        </View>

        {/* Title and Problem Prompt */}
        <AppText variant="h2" style={styles.title}>{exerciseTitle}</AppText>
        <AppCard style={styles.promptCard}>
          <AppText variant="bodySmall">{prompt}</AppText>
        </AppCard>

        {/* Mode A: Target Code To Trace Reference Card */}
        {mode === 'A' && referenceSolution ? (
          <AppCard elevated style={styles.referenceCard}>
            <View style={styles.referenceHeader}>
              <Badge label="CODE TO TRACE" variant="python" />
              <AppText variant="caption" color={theme.colors.textMuted}>
                Type this code into the copybook editor:
              </AppText>
            </View>
            <View style={styles.referenceCodeBox}>
              <AppText variant="code" color={theme.colors.pythonYellow} style={styles.referenceCodeText}>
                {referenceSolution.replace(/\r\n/g, '\n').trimEnd()}
              </AppText>
            </View>
          </AppCard>
        ) : null}

        {/* Mode B: Complete the Missing Code Instructions (No Reference Card) */}
        {mode === 'B' && (
          <AppCard style={[styles.modeBCard, { borderColor: theme.colors.primary }]}>
            <View style={styles.modeBHeader}>
              <Badge label="COMPLETE THE MISSING CODE" variant="python" />
              <AppButton
                title="💡 Need Help?"
                variant="ghost"
                size="sm"
                onPress={() => setShowGuideModal(true)}
                style={styles.needHelpBtn}
              />
            </View>
            <AppText variant="bodySmall" style={styles.modeBText}>
              Complete the code in the editor where blank gaps appear. Type your solution freely and click Run to test!
            </AppText>
          </AppCard>
        )}

        {/* Mode C: Write Independently (Required Output + Hints) */}
        {mode === 'C' && (
          <>
            {expectedOutput ? (
              <AppCard style={styles.expectedCard}>
                <View style={styles.expectedHeader}>
                  <Badge label="REQUIRED OUTPUT" variant="info" />
                </View>
                <View style={styles.expectedCodeBox}>
                  <AppText variant="code" color={theme.colors.syntax.string}>
                    {expectedOutput}
                  </AppText>
                </View>
              </AppCard>
            ) : null}

            {hints && hints.length > 0 && (
              <View style={styles.hintsWrapper}>
                <AppButton
                  title={showHint ? '💡 Hide Hint' : '💡 View Hint'}
                  variant="ghost"
                  size="sm"
                  onPress={() => setShowHint(!showHint)}
                  style={styles.hintToggleBtn}
                />
                {showHint && (
                  <AppCard style={styles.hintCard}>
                    <AppText variant="caption" weight="bold" color={theme.colors.pythonYellow}>
                      HINT
                    </AppText>
                    {hints.map((h, i) => (
                      <AppText key={i} variant="bodySmall" style={styles.hintText}>
                        • {h}
                      </AppText>
                    ))}
                  </AppCard>
                )}
              </View>
            )}
          </>
        )}

        {/* Progress Bar for Mode A */}
        {mode === 'A' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <AppText variant="caption">COPYBOOK TRACE ACCURACY</AppText>
              <AppText variant="caption" weight="bold" color={theme.colors.pythonYellow}>
                {validation?.progressPercent || 0}%
              </AppText>
            </View>
            <View style={[styles.progressBarTrack, { backgroundColor: theme.colors.surfaceElevated }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: validation?.error ? theme.colors.error : theme.colors.pythonYellow,
                    width: `${Math.min(validation?.progressPercent || 0, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Python Interpreter Traceback Error Display */}
        {pythonError && (
          <AppCard style={[styles.feedbackCard, { borderColor: theme.colors.error, backgroundColor: '#07090E' }]}>
            <View style={styles.interpreterErrorHeader}>
              <View style={styles.errorBadgeRow}>
                <Badge label={pythonError.errorType} variant="error" />
                <Badge label={`Line ${pythonError.line}`} variant="python" />
              </View>
              <AppText variant="caption" color={theme.colors.error} weight="bold">
                Python Traceback
              </AppText>
            </View>

            <View style={styles.tracebackTerminal}>
              <AppText variant="code" color="#F87171" style={styles.tracebackCode}>
                {pythonError.formattedTraceback}
              </AppText>
            </View>

            {mode !== 'A' && (
              <View style={styles.errorActionRow}>
                <AppButton
                  title="💡 View Correct Code Guide"
                  variant="primary"
                  size="sm"
                  onPress={() => setShowGuideModal(true)}
                  style={styles.viewGuideBtn}
                />
              </View>
            )}
          </AppCard>
        )}

        {/* Mode A Real-Time Completion Success */}
        {mode === 'A' && validation?.isComplete && !pythonError && (
          <AppCard style={[styles.feedbackCard, { borderColor: theme.colors.success, backgroundColor: theme.colors.successBg }]}>
            <AppText variant="bodySmall" weight="bold" color={theme.colors.success}>
              ✓ Perfect match! Code is ready for execution.
            </AppText>
          </AppCard>
        )}

        {/* CodeMirror 6 Handwriting Webview */}
        <View style={styles.editorWrapper}>
          <CodeEditorWebView
            initialCode={initialEditorCode}
            referenceCode={referenceSolution}
            mode={mode}
            onCodeChange={handleCodeChange}
            onValidationChange={handleValidationChange}
          />
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsRow}>
          <AppButton
            title={
              mode === 'A'
                ? 'Run & Step Through ▷'
                : mode === 'B'
                ? 'Run & Verify Solution ▷'
                : 'Run & Check Code ▷'
            }
            variant="primary"
            size="lg"
            disabled={!isReadyToRun}
            onPress={handleRunPress}
            style={styles.runBtn}
          />
        </View>

        {/* Solution Guide & Correct Code Popup Modal */}
        <Modal
          visible={showGuideModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowGuideModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Badge label="SOLUTION GUIDE" variant="python" />
                  <AppText variant="h3" style={styles.modalTitle}>
                    Correct Code Guide
                  </AppText>
                </View>
                <AppButton
                  title="✕"
                  variant="ghost"
                  size="sm"
                  onPress={() => setShowGuideModal(false)}
                  style={styles.modalCloseBtn}
                />
              </View>

              {/* Problem Prompt */}
              <AppText variant="bodySmall" color={theme.colors.textSecondary} style={styles.modalPrompt}>
                {prompt}
              </AppText>

              {/* Correct Code Display Box */}
              <View style={styles.correctCodeSection}>
                <AppText variant="caption" weight="bold" color={theme.colors.pythonYellow} style={styles.correctCodeLabel}>
                  CORRECT CODE TO TYPE:
                </AppText>
                <View style={styles.modalCodeBox}>
                  <AppText variant="code" color={theme.colors.pythonYellow} style={styles.modalCodeText}>
                    {referenceSolution.replace(/\r\n/g, '\n').trim()}
                  </AppText>
                </View>
              </View>

              {/* Guidance Instructions */}
              <View style={[styles.modalStepsCard, { backgroundColor: theme.colors.surfaceElevated }]}>
                <AppText variant="caption" weight="bold" color={theme.colors.textPrimary}>
                  💡 HOW TO COMPLETE:
                </AppText>
                <AppText variant="bodySmall" color={theme.colors.textSecondary} style={styles.modalStepText}>
                  • Study the correct code above.
                </AppText>
                <AppText variant="bodySmall" color={theme.colors.textSecondary} style={styles.modalStepText}>
                  • Close this guide and type the solution into the editor.
                </AppText>
                <AppText variant="bodySmall" color={theme.colors.textSecondary} style={styles.modalStepText}>
                  • Click "Run & Verify Solution" to move ahead to the next step!
                </AppText>
              </View>

              {/* Close Modal Button */}
              <AppButton
                title="Got It! Let Me Type It ✍️"
                variant="primary"
                size="lg"
                onPress={() => setShowGuideModal(false)}
                style={styles.modalDoneBtn}
              />
            </View>
          </View>
        </Modal>
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
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    paddingHorizontal: 0,
    minHeight: 36,
  },
  title: {
    marginBottom: 8,
  },
  promptCard: {
    marginBottom: 16,
  },
  referenceCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD43B',
    paddingVertical: 12,
  },
  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  referenceCodeBox: {
    backgroundColor: '#05070B',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2235',
  },
  referenceCodeText: {
    fontSize: 16,
    lineHeight: 22,
  },
  modeBCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    paddingVertical: 12,
  },
  modeBHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  needHelpBtn: {
    paddingHorizontal: 0,
    minHeight: 28,
  },
  modeBText: {
    lineHeight: 20,
  },
  expectedCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    paddingVertical: 12,
  },
  expectedHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  expectedCodeBox: {
    backgroundColor: '#05070B',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2235',
  },
  hintsWrapper: {
    marginBottom: 16,
  },
  hintToggleBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    minHeight: 32,
    marginBottom: 6,
  },
  hintCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EAB308',
    paddingVertical: 10,
  },
  hintText: {
    marginTop: 4,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  feedbackCard: {
    marginBottom: 16,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  interpreterErrorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tracebackTerminal: {
    backgroundColor: '#05070B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    padding: 10,
    marginVertical: 6,
  },
  tracebackCode: {
    fontSize: 12,
    lineHeight: 18,
  },
  errorHeaderRow: {
    marginBottom: 4,
  },
  errorSubtext: {
    marginTop: 4,
  },
  errorActionRow: {
    marginTop: 10,
  },
  viewGuideBtn: {
    alignSelf: 'flex-start',
  },
  editorWrapper: {
    height: 320,
    marginBottom: 20,
  },
  actionsRow: {
    marginTop: 8,
  },
  runBtn: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    marginLeft: 8,
  },
  modalCloseBtn: {
    minHeight: 32,
    paddingHorizontal: 8,
  },
  modalPrompt: {
    marginBottom: 14,
    lineHeight: 20,
  },
  correctCodeSection: {
    marginBottom: 14,
  },
  correctCodeLabel: {
    marginBottom: 6,
  },
  modalCodeBox: {
    backgroundColor: '#05070B',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2235',
  },
  modalCodeText: {
    fontSize: 16,
    lineHeight: 22,
  },
  modalStepsCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalStepText: {
    marginTop: 4,
    lineHeight: 18,
  },
  modalDoneBtn: {
    width: '100%',
  },
});

