import { NavigatorScreenParams } from '@react-navigation/native';
import { ExecutionStep } from '../../features/python-runtime/types';

export type RootTabParamList = {
  Home: undefined;
  Learn: undefined;
  Practice: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  TopicLearning: { topicId: string };
  KnowledgeCheck: { topicId: string };
  ProblemExplanation: { topicId: string };
  GuidedEditor: {
    topicId: string;
    exerciseId?: string;
    exerciseTitle?: string;
    prompt?: string;
    referenceSolution?: string;
    starterCode?: string;
    expectedOutput?: string;
    hints?: string[];
    mode?: 'A' | 'B' | 'C';
  };
  ExecutionVisualizer: {
    code: string;
    steps?: ExecutionStep[];
    topicId?: string;
    exerciseId?: string;
    exerciseTitle?: string;
  };
  Checkpoint: {
    topicId: string;
    topicTitle?: string;
    checkpointExercises?: any[];
  };
  TopicCompleted: {
    topicTitle?: string;
    unlockedTopicTitle?: string;
    unlockedTopicId?: string | null;
    earnedXp?: number;
    streakDays?: number;
  };
  Settings: undefined;
  PrivacyPolicy: undefined;
};
