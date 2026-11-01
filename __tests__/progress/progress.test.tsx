/**
 * ProgressService & 3-Problem Checkpoint Integration Test Suite
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ProgressService } from '../../src/features/progress/services/ProgressService';
import { CheckpointScreen } from '../../src/features/checkpoints/components/CheckpointScreen';
import { TopicCompletedScreen } from '../../src/features/checkpoints/components/TopicCompletedScreen';
import { DatabaseClient } from '../../src/database/DatabaseClient';
import { InMemorySqliteConnection } from '../../src/database/InMemorySqliteConnection';
import { ThemeProvider } from '../../src/shared/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Exercise } from '../../src/shared/types/curriculum';

describe('ProgressService & Checkpoint System Integration', () => {
  let db: InMemorySqliteConnection;
  let progressService: ProgressService;

  beforeEach(async () => {
    db = new InMemorySqliteConnection();
    await db.initialize();

    const dbClient = DatabaseClient.getInstance();
    await dbClient.initialize(db);

    progressService = ProgressService.getInstance();
  });

  afterEach(async () => {
    await db.close();
    DatabaseClient.resetInstance();
  });

  test('evaluateCode validates matching test case output accurately', async () => {
    const mockExercise: Exercise = {
      id: 'test_ex_1',
      topicId: 'topic_1_1',
      orderIndex: 1,
      exerciseType: 'MODE_A_TRACE',
      title: 'Test Ex',
      prompt: 'Print hello',
      logicExplanation: 'call print',
      starterCode: '',
      referenceSolution: 'print("Hello")',
      testCases: [{ id: 'tc1', expectedOutput: 'Hello' }],
      isCheckpoint: false,
    };

    const passResult = await progressService.evaluateCode(mockExercise, 'print("Hello")');
    expect(passResult.isPassed).toBe(true);
    expect(passResult.actualOutput).toBe('Hello');

    const failResult = await progressService.evaluateCode(mockExercise, 'print("Wrong")');
    expect(failResult.isPassed).toBe(false);
    expect(failResult.actualOutput).toBe('Wrong');
    expect(failResult.errorMessage).toContain('did not match expected');
  });

  test('submitCheckpointProblem enforces 3 distinct problems before topic completion', async () => {
    const topicId = 'topic_1_4';
    const exercises = await DatabaseClient.getInstance().exerciseRepo.getExercisesForTopic(topicId);
    expect(exercises.length).toBe(3);

    const [ex1, ex2, ex3] = exercises;

    // 1. Submit Wrong Code for Problem 1 -> Fails and does NOT increment
    const failRes = await progressService.submitCheckpointProblem(topicId, ex1, 'print("Wrong")');
    expect(failRes.isPassed).toBe(false);
    expect(failRes.distinctSolvedCount).toBe(0);
    expect(failRes.isTopicCompleted).toBe(false);

    // 2. Submit Correct Code for Problem 1 -> Count = 1
    const pass1 = await progressService.submitCheckpointProblem(topicId, ex1, ex1.referenceSolution);
    expect(pass1.isPassed).toBe(true);
    expect(pass1.distinctSolvedCount).toBe(1);
    expect(pass1.isTopicCompleted).toBe(false);

    // 3. Anti-Spam: Submit Problem 1 AGAIN -> Count MUST stay 1
    const dup1 = await progressService.submitCheckpointProblem(topicId, ex1, ex1.referenceSolution);
    expect(dup1.isPassed).toBe(true);
    expect(dup1.distinctSolvedCount).toBe(1);
    expect(dup1.isTopicCompleted).toBe(false);

    // 4. Submit Problem 2 -> Count = 2
    const pass2 = await progressService.submitCheckpointProblem(topicId, ex2, ex2.referenceSolution);
    expect(pass2.isPassed).toBe(true);
    expect(pass2.distinctSolvedCount).toBe(2);
    expect(pass2.isTopicCompleted).toBe(false);

    // 5. Submit Problem 3 -> Count = 3 -> TOPIC COMPLETED & NEXT TOPIC UNLOCKED!
    const pass3 = await progressService.submitCheckpointProblem(topicId, ex3, ex3.referenceSolution);
    expect(pass3.isPassed).toBe(true);
    expect(pass3.distinctSolvedCount).toBe(3);
    expect(pass3.isTopicCompleted).toBe(true);
    expect(pass3.unlockedTopicId).toBe('topic_2_1');

    // 6. Verify User Stats XP and Level
    const stats = await progressService.getUserStats();
    expect(stats.completedTopicsCount).toBe(1);
    expect(stats.totalXp).toBeGreaterThan(0);
    expect(stats.level).toBeGreaterThanOrEqual(1);
  });

  describe('UI Component Rendering', () => {
    test('renders CheckpointScreen cleanly', async () => {
      let tree: any;
      await ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <SafeAreaProvider>
            <ThemeProvider>
              <CheckpointScreen
                topicId="topic_1_4"
                checkpointExercises={[]}
              />
            </ThemeProvider>
          </SafeAreaProvider>
        );
      });
      expect(tree).toBeDefined();
    });

    test('renders TopicCompletedScreen cleanly', async () => {
      let tree: any;
      await ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <SafeAreaProvider>
            <ThemeProvider>
              <TopicCompletedScreen
                topicTitle="Output & Syntax"
                unlockedTopicTitle="Module 2: Variables"
                earnedXp={250}
              />
            </ThemeProvider>
          </SafeAreaProvider>
        );
      });
      expect(tree).toBeDefined();
    });
  });
});
