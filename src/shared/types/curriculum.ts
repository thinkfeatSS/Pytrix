/**
 * Curriculum and Pedagogical Data Contracts
 */

export type TopicStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';

export type ExerciseType =
  | 'MODE_A_TRACE'
  | 'MODE_B_FILL_IN'
  | 'MODE_C_INDEPENDENT'
  | 'CHECKPOINT';

export interface ExerciseTestCase {
  id: string;
  input?: string;
  expectedOutput: string;
  description?: string;
  isHidden?: boolean;
}

export interface Exercise {
  id: string;
  topicId: string;
  orderIndex: number;
  exerciseType: ExerciseType;
  title: string;
  prompt: string;
  logicExplanation: string;
  stepByStepGuide?: string[];
  starterCode: string;
  referenceSolution: string;
  testCases: ExerciseTestCase[];
  hints?: string[];
  isCheckpoint: boolean;
}

export interface Topic {
  id: string;
  moduleId: string;
  title: string;
  orderIndex: number;
  learningObjective: string;
  theoryMarkdown: string;
  pitfallsMarkdown?: string;
  prerequisiteTopicId?: string | null;
  exercises?: Exercise[];
  status?: TopicStatus;
}

export interface Module {
  id: string;
  courseId: string;
  number: number;
  title: string;
  orderIndex: number;
  description: string;
  topics?: Topic[];
}

export interface Course {
  id: string;
  title: string;
  orderIndex: number;
  description: string;
  modules?: Module[];
}

export interface UserTopicProgress {
  id: string;
  topicId: string;
  status: TopicStatus;
  checkpointProblemsSolved: number;
  completedAt?: string | null;
  updatedAt: string;
}

export interface UserSubmission {
  id: string;
  exerciseId: string;
  topicId: string;
  submittedCode: string;
  isPassed: boolean;
  errorMessage?: string | null;
  executionTimeMs?: number;
  createdAt: string;
}

