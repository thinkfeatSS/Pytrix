/**
 * Progress Repository
 * Manages user progress, submission logs, and 3-problem checkpoint unlock transactions.
 */

import { IDatabaseConnection } from '../../shared/types/database';
import { UserTopicProgress, UserSubmission, TopicStatus } from '../../shared/types/curriculum';

export interface CheckpointResult {
  topicId: string;
  problemsSolvedCount: number;
  isTopicCompleted: boolean;
  unlockedTopicId: string | null;
  message: string;
}

export class ProgressRepository {
  constructor(private db: IDatabaseConnection) {}

  public async getTopicProgress(topicId: string): Promise<UserTopicProgress | null> {
    const row = await this.db.querySingle<any>(
      `SELECT id, topic_id as topicId, status,
              checkpoint_problems_solved as checkpointProblemsSolved,
              completed_at as completedAt, updated_at as updatedAt
       FROM user_topic_progress
       WHERE topic_id = ?;`,
      [topicId]
    );

    return row || null;
  }

  public async recordSubmission(
    submission: Omit<UserSubmission, 'id'>
  ): Promise<string> {
    const id = `sub_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    await this.db.execute(
      `INSERT INTO user_submissions (
        id, exercise_id, topic_id, submitted_code, is_passed,
        error_message, execution_time_ms, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        submission.exerciseId,
        submission.topicId,
        submission.submittedCode,
        submission.isPassed ? 1 : 0,
        submission.errorMessage || null,
        submission.executionTimeMs || 0,
        submission.createdAt || new Date().toISOString(),
      ]
    );

    return id;
  }

  /**
   * Records a successful problem solution within a checkpoint session.
   * Anti-Spam & 3-Problem Rule:
   * Only distinct successful exercises count towards the 3 required checkpoint problems.
   * Once 3 distinct exercises are validated, the topic is marked COMPLETED and the next topic is unlocked.
   */
  public async recordCheckpointSuccess(
    topicId: string,
    exerciseId: string
  ): Promise<CheckpointResult> {
    return await this.db.transaction(async (tx) => {
      // 1. Fetch current progress
      const current = await tx.querySingle<any>(
        `SELECT id, status, checkpoint_problems_solved as solved
         FROM user_topic_progress WHERE topic_id = ?;`,
        [topicId]
      );

      if (!current) {
        throw new Error(`Topic progress record not found for topic ${topicId}`);
      }

      // 2. Count DISTINCT passed checkpoint exercises for this topic
      const distinctPassedRows = await tx.query<{ exercise_id: string }>(
        `SELECT DISTINCT exercise_id
         FROM user_submissions
         WHERE topic_id = ? AND is_passed = 1;`,
        [topicId]
      );

      const passedExerciseIds = new Set(distinctPassedRows.map((r) => r.exercise_id));
      passedExerciseIds.add(exerciseId);

      const totalExercisesRow = await tx.querySingle<{ count: number }>(
        `SELECT COUNT(*) as count FROM exercises WHERE topic_id = ?;`,
        [topicId]
      );
      const totalTopicExercises = totalExercisesRow?.count || 3;
      const requiredCount = Math.min(3, totalTopicExercises);

      const distinctCount = passedExerciseIds.size;
      const isCompleted = distinctCount >= requiredCount;
      let unlockedTopicId: string | null = null;

      const now = new Date().toISOString();

      if (isCompleted) {
        // Mark current topic COMPLETED
        await tx.execute(
          `UPDATE user_topic_progress
           SET status = 'COMPLETED', checkpoint_problems_solved = ?, completed_at = ?, updated_at = ?
           WHERE topic_id = ?;`,
          [distinctCount, now, now, topicId]
        );

        // Find next dependent topic to unlock
        const nextTopic = await tx.querySingle<{ id: string }>(
          `SELECT id FROM topics WHERE prerequisite_topic_id = ? LIMIT 1;`,
          [topicId]
        );

        if (nextTopic) {
          unlockedTopicId = nextTopic.id;
          await tx.execute(
            `UPDATE user_topic_progress
             SET status = 'AVAILABLE', updated_at = ?
             WHERE topic_id = ? AND status = 'LOCKED';`,
            [now, nextTopic.id]
          );
        }
      } else {
        // Update in-progress count
        await tx.execute(
          `UPDATE user_topic_progress
           SET status = 'IN_PROGRESS', checkpoint_problems_solved = ?, updated_at = ?
           WHERE topic_id = ?;`,
          [distinctCount, now, topicId]
        );
      }

      return {
        topicId,
        problemsSolvedCount: distinctCount,
        isTopicCompleted: isCompleted,
        unlockedTopicId,
        message: isCompleted
          ? `Checkpoint passed! ${distinctCount} distinct problem${distinctCount === 1 ? '' : 's'} solved. Topic completed!`
          : `Problem solved! (${distinctCount}/${requiredCount} distinct problems completed).`,
      };
    });
  }

  public async getAllProgressSummary(): Promise<{
    completedTopics: number;
    inProgressTopics: number;
    availableTopics: number;
    lockedTopics: number;
  }> {
    const rows = await this.db.query<{ status: TopicStatus; count: number }>(
      `SELECT status, COUNT(*) as count FROM user_topic_progress GROUP BY status;`
    );

    const summary = {
      completedTopics: 0,
      inProgressTopics: 0,
      availableTopics: 0,
      lockedTopics: 0,
    };

    for (const r of rows) {
      if (r.status === 'COMPLETED') summary.completedTopics = r.count;
      if (r.status === 'IN_PROGRESS') summary.inProgressTopics = r.count;
      if (r.status === 'AVAILABLE') summary.availableTopics = r.count;
      if (r.status === 'LOCKED') summary.lockedTopics = r.count;
    }

    return summary;
  }
}

