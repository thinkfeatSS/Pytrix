import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer, AppText, AppCard, AppButton, Badge } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';

export function PracticeScreen() {
  const { theme } = useTheme();
  const [activeMode, setActiveMode] = useState<'A' | 'B' | 'C'>('A');

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <AppText variant="h1">Practice Arena</AppText>
        <AppText variant="bodySmall">
          Hone your Python muscle memory with handwriting-style guided editors.
        </AppText>
      </View>

      {/* Mode Selector Tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          onPress={() => setActiveMode('A')}
          style={[
            styles.modeTab,
            activeMode === 'A' && { backgroundColor: theme.colors.primary },
          ]}
        >
          <AppText
            variant="bodySmall"
            weight="medium"
            color={activeMode === 'A' ? '#FFF' : theme.colors.textSecondary}
          >
            Mode A: Trace
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveMode('B')}
          style={[
            styles.modeTab,
            activeMode === 'B' && { backgroundColor: theme.colors.primary },
          ]}
        >
          <AppText
            variant="bodySmall"
            weight="medium"
            color={activeMode === 'B' ? '#FFF' : theme.colors.textSecondary}
          >
            Mode B: Fill In
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveMode('C')}
          style={[
            styles.modeTab,
            activeMode === 'C' && { backgroundColor: theme.colors.primary },
          ]}
        >
          <AppText
            variant="bodySmall"
            weight="medium"
            color={activeMode === 'C' ? '#FFF' : theme.colors.textSecondary}
          >
            Mode C: Free Code
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Practice Sandbox Card */}
      <AppCard elevated style={styles.sandboxCard}>
        <View style={styles.cardHeader}>
          <Badge
            label={
              activeMode === 'A'
                ? 'TRACE THE CODE'
                : activeMode === 'B'
                ? 'FILL MISSING CODE'
                : 'INDEPENDENT'
            }
            variant="python"
          />
          <AppText variant="caption">Problem #101</AppText>
        </View>

        <AppText variant="h3" style={styles.exerciseTitle}>
          {activeMode === 'A'
            ? 'Print Formatting & Values'
            : activeMode === 'B'
            ? 'Complete the String Concatenation'
            : 'Write a Custom Greeter'}
        </AppText>

        <AppText variant="bodySmall" style={styles.exerciseDesc}>
          {activeMode === 'A'
            ? 'Type over the ghost code character by character. Notice how commas separate items inside print().'
            : activeMode === 'B'
            ? 'Fill in the blanks to join first_name and last_name with a space.'
            : 'Write a program that takes user input and prints a formatted greeting.'}
        </AppText>

        {/* Visual Mock of Handwriting Ghost Editor */}
        <View style={styles.editorPreviewBox}>
          <View style={styles.editorLine}>
            <AppText variant="code" color={theme.colors.syntax.keyword}>name </AppText>
            <AppText variant="code" color={theme.colors.syntax.bracket}>= </AppText>
            <AppText variant="code" color={theme.colors.syntax.string}>"Alice"</AppText>
          </View>
          <View style={styles.editorLine}>
            {activeMode === 'A' ? (
              <>
                <AppText variant="code" color={theme.colors.syntax.function}>print</AppText>
                <AppText variant="code" color={theme.colors.syntax.bracket}>(</AppText>
                <AppText variant="code" color={theme.colors.syntax.ghost}>"Welcome, ", name)</AppText>
              </>
            ) : activeMode === 'B' ? (
              <>
                <AppText variant="code" color={theme.colors.syntax.function}>print</AppText>
                <AppText variant="code" color={theme.colors.syntax.bracket}>(</AppText>
                <View style={styles.slotBox}>
                  <AppText variant="code" color={theme.colors.pythonYellow}>[ . . . . . ]</AppText>
                </View>
                <AppText variant="code" color={theme.colors.syntax.bracket}>)</AppText>
              </>
            ) : (
              <AppText variant="code" color={theme.colors.syntax.comment}># Write your Python code here</AppText>
            )}
          </View>
        </View>

        <AppButton
          title="Launch Interactive Editor ▷"
          variant="primary"
          style={styles.launchBtn}
        />
      </AppCard>

      {/* Visualizer Feature Card */}
      <AppCard style={styles.visualizerCard}>
        <AppText variant="body" weight="medium">
          🔍 Line-by-Line Execution Visualizer
        </AppText>
        <AppText variant="bodySmall" style={styles.visualizerDesc}>
          Step through every line of Python code with live memory inspection. See variables change in real time!
        </AppText>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: 16,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  sandboxCard: {
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseTitle: {
    marginBottom: 8,
  },
  exerciseDesc: {
    marginBottom: 16,
  },
  editorPreviewBox: {
    backgroundColor: '#0A0C12',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#242838',
    marginBottom: 16,
  },
  editorLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  slotBox: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#FFD43B',
    paddingHorizontal: 4,
  },
  launchBtn: {
    marginTop: 4,
  },
  visualizerCard: {
    marginBottom: 24,
  },
  visualizerDesc: {
    marginTop: 4,
  },
});

