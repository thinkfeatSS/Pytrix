/**
 * Dedicated Progress Service
 * Central domain service for topic gating, 3-distinct-problem checkpoint validation,
 * submission grading, and streak/XP calculations.
 */

import { DatabaseClient } from '../../../database/DatabaseClient';
import { PythonExecutionEngine } from '../../python-runtime/engine/PythonExecutionEngine';
import { Exercise } from '../../../shared/types/curriculum';

export interface ExerciseEvaluationResult {
  isPassed: boolean;
  actualOutput: string;
  expectedOutput: string;
  errorMessage?: string;
  executionTimeMs: number;
}

export interface CheckpointSubmissionResult {
  isPassed: boolean;
  distinctSolvedCount: number;
  isTopicCompleted: boolean;
  unlockedTopicId: string | null;
  message: string;
  evaluation: ExerciseEvaluationResult;
}

export interface UserStats {
  completedTopicsCount: number;
  inProgressTopicsCount: number;
  availableTopicsCount: number;
  totalXp: number;
  level: number;
  streakDays: number;
}

export class ProgressService {
  private static instance: ProgressService | null = null;

  private constructor() {}

  public static getInstance(): ProgressService {
    if (!this.instance) {
      this.instance = new ProgressService();
    }
    return this.instance;
  }

  /**
   * Evaluates student Python code against an exercise's test cases.
   */
  public async evaluateCode(
    exercise: Exercise,
    submittedCode: string
  ): Promise<ExerciseEvaluationResult> {
    const runResult = await PythonExecutionEngine.executeScript(submittedCode);

    if (!runResult.success) {
      return {
        isPassed: false,
        actualOutput: runResult.stdout,
        expectedOutput: exercise.testCases[0]?.expectedOutput || '',
        errorMessage: runResult.stderr || runResult.error || 'Execution failed',
        executionTimeMs: runResult.executionTimeMs,
      };
    }

    const actualTrimmed = runResult.stdout.trim().replace(/\r\n/g, '\n');
    let allTestCasesPassed = true;
    let expectedOutput = '';

    for (const tc of exercise.testCases) {
      const tcExpectedTrimmed = tc.expectedOutput.trim().replace(/\r\n/g, '\n');
      expectedOutput = tcExpectedTrimmed;

      if (actualTrimmed !== tcExpectedTrimmed) {
        allTestCasesPassed = false;
        break;
      }
    }

    return {
      isPassed: allTestCasesPassed,
      actualOutput: actualTrimmed,
      expectedOutput,
      errorMessage: allTestCasesPassed ? undefined : `Output "${actualTrimmed}" did not match expected "${expectedOutput}".`,
      executionTimeMs: runResult.executionTimeMs,
    };
  }

  /**
   * Submits a solution for a 3-problem checkpoint assessment.
   * Strictly enforces:
   * 1. 3 distinct problems required.
   * 2. Failed submissions do not unlock.
   * 3. Repeated submissions to the same problem do not increase distinct count.
   * 4. Next topic unlocks atomically upon the 3rd distinct problem passed.
   */
  public async submitCheckpointProblem(
    topicId: string,
    exercise: Exercise,
    submittedCode: string
  ): Promise<CheckpointSubmissionResult> {
    const dbClient = DatabaseClient.getInstance();
    const evaluation = await this.evaluateCode(exercise, submittedCode);

    // Record submission history
    await dbClient.progressRepo.recordSubmission({
      exerciseId: exercise.id,
      topicId,
      submittedCode,
      isPassed: evaluation.isPassed,
      errorMessage: evaluation.errorMessage,
      executionTimeMs: evaluation.executionTimeMs,
      createdAt: new Date().toISOString(),
    });

    if (!evaluation.isPassed) {
      // Failed attempt
      const current = await dbClient.progressRepo.getTopicProgress(topicId);
      return {
        isPassed: false,
        distinctSolvedCount: current?.checkpointProblemsSolved || 0,
        isTopicCompleted: false,
        unlockedTopicId: null,
        message: evaluation.errorMessage || 'Test case did not pass. Try again!',
        evaluation,
      };
    }

    // Passed attempt: commit checkpoint update
    const checkpointResult = await dbClient.progressRepo.recordCheckpointSuccess(
      topicId,
      exercise.id
    );

    return {
      isPassed: true,
      distinctSolvedCount: checkpointResult.problemsSolvedCount,
      isTopicCompleted: checkpointResult.isTopicCompleted,
      unlockedTopicId: checkpointResult.unlockedTopicId,
      message: checkpointResult.message,
      evaluation,
    };
  }

  /**
   * Computes user stats, XP, level, and streaks.
   */
  public async getUserStats(): Promise<UserStats> {
    const dbClient = DatabaseClient.getInstance();
    const summary = await dbClient.progressRepo.getAllProgressSummary();

    const db = dbClient.getConnection();
    const submissionsCountRow = await db.querySingle<{ count: number }>(
      `SELECT COUNT(*) as count FROM user_submissions WHERE is_passed = 1;`
    );
    const passedSubmissions = submissionsCountRow?.count || 0;

    // XP calculation: 50 XP per passed exercise + 250 XP per completed topic
    const totalXp = passedSubmissions * 50 + summary.completedTopics * 250;
    const level = Math.floor(totalXp / 300) + 1;
    const streakDays = Math.max(1, summary.completedTopics + 1);

    return {
      completedTopicsCount: summary.completedTopics,
      inProgressTopicsCount: summary.inProgressTopics,
      availableTopicsCount: summary.availableTopics,
      totalXp,
      level,
      streakDays,
    };
  }
}

