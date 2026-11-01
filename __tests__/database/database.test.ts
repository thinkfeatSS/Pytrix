/**
 * Database & Progression Integration Test Suite
 * Tests migrations, curriculum seeding, repositories, and the 3-distinct-problem checkpoint rule.
 */

import { InMemorySqliteConnection } from '../../src/database/InMemorySqliteConnection';
import { MigrationRunner } from '../../src/database/MigrationRunner';
import { SeedEngine } from '../../src/database/SeedEngine';
import { CourseRepository } from '../../src/database/repositories/CourseRepository';
import { ExerciseRepository } from '../../src/database/repositories/ExerciseRepository';
import { ProgressRepository } from '../../src/database/repositories/ProgressRepository';

describe('Database, Content & Progression Engine Integration', () => {
  let db: InMemorySqliteConnection;
  let courseRepo: CourseRepository;
  let exerciseRepo: ExerciseRepository;
  let progressRepo: ProgressRepository;

  beforeEach(async () => {
    db = new InMemorySqliteConnection();
    await db.initialize();

    // Run migrations
    const appliedCount = await MigrationRunner.runMigrations(db);
    expect(appliedCount).toBeGreaterThan(0);

    // Seed curriculum
    await SeedEngine.seedCurriculum(db);

    courseRepo = new CourseRepository(db);
    exerciseRepo = new ExerciseRepository(db);
    progressRepo = new ProgressRepository(db);
  });

  afterEach(async () => {
    await db.close();
  });

  test('curriculum is seeded with modules, topics, and initial progression state', async () => {
    const course = await courseRepo.getCourseOverview('course_python_basics');
    expect(course).not.toBeNull();
    expect(course!.title).toBe('Python Basics for Beginners');
    expect(course!.modules!.length).toBe(6);

    // Module 1 check
    const mod1 = course!.modules![0];
    expect(mod1.title).toContain('First Steps with Python');
    expect(mod1.topics!.length).toBe(4);

    // Topic 1.1 should be AVAILABLE by default
    const topic1 = mod1.topics![0];
    expect(topic1.id).toBe('topic_1_1');
    expect(topic1.status).toBe('AVAILABLE');

    // Topic 1.2 should be LOCKED initially
    const topic2 = mod1.topics![1];
    expect(topic2.id).toBe('topic_1_2');
    expect(topic2.status).toBe('LOCKED');
  });

  test('exercise repository retrieves exercises and test cases accurately', async () => {
    const exercises = await exerciseRepo.getExercisesForTopic('topic_1_1');
    expect(exercises.length).toBe(6);

    const traceEx = exercises[0];
    expect(traceEx.exerciseType).toBe('MODE_A_TRACE');
    expect(traceEx.referenceSolution).toContain('print("Hello, World!")');
    expect(traceEx.testCases.length).toBe(1);
    expect(traceEx.testCases[0].expectedOutput).toBe('Hello, World!');
  });

  test('anti-spam: repeated solutions to the same exercise do NOT advance checkpoint count', async () => {
    const topicId = 'topic_1_4';
    const exerciseId = 'chk_1_4_1';

    // First submission for problem 1
    await progressRepo.recordSubmission({
      exerciseId,
      topicId,
      submittedCode: 'print("Python 3")',
      isPassed: true,
      createdAt: new Date().toISOString(),
    });

    const res1 = await progressRepo.recordCheckpointSuccess(topicId, exerciseId);
    expect(res1.problemsSolvedCount).toBe(1);
    expect(res1.isTopicCompleted).toBe(false);

    // Duplicate submission for the SAME problem 1 (repeated execution)
    await progressRepo.recordSubmission({
      exerciseId,
      topicId,
      submittedCode: 'print("Python 3")',
      isPassed: true,
      createdAt: new Date().toISOString(),
    });

    const resDuplicate = await progressRepo.recordCheckpointSuccess(topicId, exerciseId);
    // Count MUST remain 1 because it is not a distinct problem
    expect(resDuplicate.problemsSolvedCount).toBe(1);
    expect(resDuplicate.isTopicCompleted).toBe(false);
  });

  test('checkpoint requires 3 DISTINCT problems to mark topic COMPLETED and unlock next topic', async () => {
    const topicId = 'topic_1_4'; // Checkpoint 1
    const nextDependentTopicId = 'topic_2_1'; // Topic 2.1 depends on Checkpoint 1

    // Verify next topic is LOCKED before checkpoint
    const nextTopicBefore = await courseRepo.getTopicDetails(nextDependentTopicId);
    expect(nextTopicBefore!.status).toBe('LOCKED');

    // Problem 1 passed
    await progressRepo.recordSubmission({
      exerciseId: 'chk_1_4_1',
      topicId,
      submittedCode: 'print("Python 3")',
      isPassed: true,
      createdAt: new Date().toISOString(),
    });
    const r1 = await progressRepo.recordCheckpointSuccess(topicId, 'chk_1_4_1');
    expect(r1.problemsSolvedCount).toBe(1);
    expect(r1.isTopicCompleted).toBe(false);

    // Problem 2 passed
    await progressRepo.recordSubmission({
      exerciseId: 'chk_1_4_2',
      topicId,
      submittedCode: 'print("Item count:", 42)',
      isPassed: true,
      createdAt: new Date().toISOString(),
    });
    const r2 = await progressRepo.recordCheckpointSuccess(topicId, 'chk_1_4_2');
    expect(r2.problemsSolvedCount).toBe(2);
    expect(r2.isTopicCompleted).toBe(false);

    // Problem 3 passed
    await progressRepo.recordSubmission({
      exerciseId: 'chk_1_4_3',
      topicId,
      submittedCode: 'print("Line 1")\nprint("Line 2")',
      isPassed: true,
      createdAt: new Date().toISOString(),
    });
    const r3 = await progressRepo.recordCheckpointSuccess(topicId, 'chk_1_4_3');
    expect(r3.problemsSolvedCount).toBe(3);
    expect(r3.isTopicCompleted).toBe(true);
    expect(r3.unlockedTopicId).toBe(nextDependentTopicId);

    // Verify current topic is COMPLETED in database
    const currentTopicAfter = await courseRepo.getTopicDetails(topicId);
    expect(currentTopicAfter!.status).toBe('COMPLETED');

    // Verify next topic is now unlocked to AVAILABLE
    const nextTopicAfter = await courseRepo.getTopicDetails(nextDependentTopicId);
    expect(nextTopicAfter!.status).toBe('AVAILABLE');
  });

  test('progress summary counts topic statuses accurately', async () => {
    const summary = await progressRepo.getAllProgressSummary();
    expect(summary.availableTopics).toBe(1); // Topic 1.1
    expect(summary.lockedTopics).toBeGreaterThan(5); // Remainder locked
    expect(summary.completedTopics).toBe(0);
  });
});

