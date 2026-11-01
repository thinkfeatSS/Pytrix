import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { WelcomeScreen } from '../../features/onboarding/screens/WelcomeScreen';
import { TopicLearningScreen } from '../../features/lessons/screens/TopicLearningScreen';
import { KnowledgeCheckScreen } from '../../features/knowledge-check/screens/KnowledgeCheckScreen';
import { ProblemExplanationScreen } from '../../features/problem-explanation/screens/ProblemExplanationScreen';
import { HandwritingEditorScreen } from '../../features/code-editor/components/HandwritingEditorScreen';
import { ExecutionVisualizerScreen } from '../../features/execution-visualizer/components/ExecutionVisualizerScreen';
import { CheckpointScreen } from '../../features/checkpoints/components/CheckpointScreen';
import { TopicCompletedScreen } from '../../features/checkpoints/components/TopicCompletedScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { PrivacyPolicyScreen } from '../../features/legal/screens/PrivacyPolicyScreen';
import { PythonExecutionEngine } from '../../features/python-runtime/engine/PythonExecutionEngine';
import { DatabaseClient } from '../../database/DatabaseClient';
import { useTheme } from '../../shared/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function GuidedEditorWrapper({ route, navigation }: any) {
  const {
    topicId,
    exerciseId,
    exerciseTitle,
    prompt,
    referenceSolution,
    starterCode,
    expectedOutput,
    hints,
    mode,
  } = route.params;

  const handleRunCode = async (code: string) => {
    const result = await PythonExecutionEngine.executeScript(code);
    navigation.navigate('ExecutionVisualizer', {
      code,
      steps: result.steps,
      topicId,
      exerciseId,
      exerciseTitle,
    });
  };

  return (
    <HandwritingEditorScreen
      exerciseTitle={exerciseTitle}
      prompt={prompt}
      referenceSolution={referenceSolution}
      starterCode={starterCode}
      expectedOutput={expectedOutput}
      hints={hints}
      mode={mode}
      onRunCode={handleRunCode}
      onBack={() => navigation.goBack()}
    />
  );
}

function VisualizerWrapper({ route, navigation }: any) {
  const { code, steps, topicId, exerciseId, exerciseTitle } = route.params || {};
  const [nextButtonTitle, setNextButtonTitle] = React.useState('Continue to Next Step ➔');

  React.useEffect(() => {
    let isMounted = true;
    async function determineNextLabel() {
      if (!topicId) return;
      try {
        const dbClient = DatabaseClient.getInstance();
        await dbClient.initialize();
        const exercises = await dbClient.exerciseRepo.getExercisesForTopic(topicId);
        const idx = exercises.findIndex((e) => e.id === exerciseId);
        if (isMounted) {
          if (idx >= 0 && idx < exercises.length - 1) {
            const nextEx = exercises[idx + 1];
            if (nextEx.exerciseType === 'MODE_B_FILL_IN') {
              setNextButtonTitle('Continue to Mode B: Complete Missing Code ➔');
            } else if (nextEx.exerciseType === 'MODE_C_INDEPENDENT') {
              setNextButtonTitle('Continue to Mode C: Write Independently ➔');
            } else if (nextEx.isCheckpoint || nextEx.exerciseType === 'CHECKPOINT') {
              setNextButtonTitle('Continue to Checkpoint Assessment ➔');
            }
          } else {
            setNextButtonTitle('Continue to Checkpoint Assessment ➔');
          }
        }
      } catch {}
    }
    determineNextLabel();
    return () => {
      isMounted = false;
    };
  }, [topicId, exerciseId]);

  const handleNextStep = async () => {
    if (!topicId) {
      navigation.goBack();
      return;
    }

    try {
      const dbClient = DatabaseClient.getInstance();
      await dbClient.initialize();

      // Record exercise submission
      if (exerciseId) {
        await dbClient.progressRepo.recordSubmission({
          exerciseId,
          topicId,
          submittedCode: code,
          isPassed: true,
          executionTimeMs: 40,
          createdAt: new Date().toISOString(),
        });
      }

      // Check if there is a next exercise in this topic
      const exercises = await dbClient.exerciseRepo.getExercisesForTopic(topicId);
      const currentIndex = exercises.findIndex((e) => e.id === exerciseId);

      if (currentIndex >= 0 && currentIndex < exercises.length - 1) {
        const nextEx = exercises[currentIndex + 1];
        if (nextEx.isCheckpoint || nextEx.exerciseType === 'CHECKPOINT') {
          navigation.navigate('Checkpoint', { topicId, topicTitle: exerciseTitle || 'Topic Checkpoint' });
        } else {
          navigation.navigate('GuidedEditor', {
            topicId,
            exerciseId: nextEx.id,
            exerciseTitle: nextEx.title,
            prompt: nextEx.prompt,
            referenceSolution: nextEx.referenceSolution,
            starterCode: nextEx.starterCode,
            expectedOutput: nextEx.testCases[0]?.expectedOutput,
            hints: nextEx.hints,
            mode: nextEx.exerciseType === 'MODE_A_TRACE' ? 'A' : nextEx.exerciseType === 'MODE_B_FILL_IN' ? 'B' : 'C',
          });
        }
      } else {
        navigation.navigate('Checkpoint', {
          topicId,
          topicTitle: exerciseTitle || 'Topic Checkpoint',
        });
      }
    } catch {
      navigation.navigate('Checkpoint', {
        topicId,
        topicTitle: exerciseTitle || 'Topic Checkpoint',
      });
    }
  };

  return (
    <ExecutionVisualizerScreen
      code={code}
      steps={steps || []}
      onClose={() => navigation.goBack()}
      onNextStep={handleNextStep}
      nextButtonTitle={nextButtonTitle}
    />
  );
}

function CheckpointWrapper({ route, navigation }: any) {
  const { topicId, topicTitle, checkpointExercises } = route.params || {};

  return (
    <CheckpointScreen
      topicId={topicId}
      topicTitle={topicTitle}
      checkpointExercises={checkpointExercises || []}
      onComplete={async (unlockedId) => {
        let nextTopicTitle = 'Next Topic Unlocked';
        if (unlockedId) {
          try {
            const dbClient = DatabaseClient.getInstance();
            await dbClient.initialize();
            const nextTopic = await dbClient.courseRepo.getTopicDetails(unlockedId);
            if (nextTopic) {
              nextTopicTitle = nextTopic.title;
            }
          } catch {}
        }

        navigation.navigate('TopicCompleted', {
          topicTitle: topicTitle || 'Topic Completed',
          unlockedTopicTitle: nextTopicTitle,
          unlockedTopicId: unlockedId,
          earnedXp: 250,
          streakDays: 1,
        });
      }}
      onBack={() => navigation.goBack()}
    />
  );
}

function TopicCompletedWrapper({ route, navigation }: any) {
  const { topicTitle, unlockedTopicTitle, unlockedTopicId, earnedXp, streakDays } = route.params || {};

  return (
    <TopicCompletedScreen
      topicTitle={topicTitle}
      unlockedTopicTitle={unlockedTopicTitle}
      earnedXp={earnedXp}
      streakDays={streakDays}
      onContinue={() => {
        if (unlockedTopicId) {
          navigation.navigate('TopicLearning', { topicId: unlockedTopicId });
        } else {
          navigation.navigate('MainTabs');
        }
      }}
    />
  );
}

export function RootNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="TopicLearning" component={TopicLearningScreen} />
      <Stack.Screen name="KnowledgeCheck" component={KnowledgeCheckScreen} />
      <Stack.Screen name="ProblemExplanation" component={ProblemExplanationScreen} />
      <Stack.Screen name="GuidedEditor" component={GuidedEditorWrapper} />
      <Stack.Screen name="ExecutionVisualizer" component={VisualizerWrapper} />
      <Stack.Screen name="Checkpoint" component={CheckpointWrapper} />
      <Stack.Screen name="TopicCompleted" component={TopicCompletedWrapper} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}
