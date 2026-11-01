/**
 * Database Seed Engine
 * Seeds curriculum content into SQLite and initializes topic progression states idempotently.
 */

import { IDatabaseConnection } from '../shared/types/database';
import { Course } from '../shared/types/curriculum';
import { pythonBasicsCourse } from './seeds/pythonBasicsCurriculum';

export class SeedEngine {
  public static async seedCurriculum(
    db: IDatabaseConnection,
    course: Course = pythonBasicsCourse
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Insert or Replace Course
      await tx.execute(
        `INSERT OR REPLACE INTO courses (id, title, order_index, description) VALUES (?, ?, ?, ?);`,
        [course.id, course.title, course.orderIndex, course.description]
      );

      let isFirstTopic = true;

      // 2. Iterate through modules
      for (const mod of course.modules || []) {
        await tx.execute(
          `INSERT OR REPLACE INTO modules (id, course_id, number, title, order_index, description)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [mod.id, mod.courseId, mod.number, mod.title, mod.orderIndex, mod.description]
        );

        // 3. Iterate through topics
        for (const topic of mod.topics || []) {
          await tx.execute(
            `INSERT OR REPLACE INTO topics (
              id, module_id, title, order_index, learning_objective,
              theory_markdown, pitfalls_markdown, prerequisite_topic_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              topic.id,
              topic.moduleId,
              topic.title,
              topic.orderIndex,
              topic.learningObjective,
              topic.theoryMarkdown,
              topic.pitfallsMarkdown || null,
              topic.prerequisiteTopicId || null,
            ]
          );

          // 4. Initialize User Topic Progress (Idempotent: preserves existing progress!)
          const initialStatus = isFirstTopic ? 'AVAILABLE' : 'LOCKED';
          isFirstTopic = false;

          await tx.execute(
            `INSERT OR IGNORE INTO user_topic_progress (
              id, topic_id, status, checkpoint_problems_solved, updated_at
            ) VALUES (?, ?, ?, 0, ?);`,
            [`prog_${topic.id}`, topic.id, initialStatus, new Date().toISOString()]
          );

          // 5. Insert Exercises
          for (const ex of topic.exercises || []) {
            await tx.execute(
              `INSERT OR REPLACE INTO exercises (
                id, topic_id, order_index, exercise_type, title, prompt,
                logic_explanation, step_by_step_json, starter_code,
                reference_solution, test_cases_json, hints_json, is_checkpoint
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
              [
                ex.id,
                ex.topicId,
                ex.orderIndex,
                ex.exerciseType,
                ex.title,
                ex.prompt,
                ex.logicExplanation,
                ex.stepByStepGuide ? JSON.stringify(ex.stepByStepGuide) : null,
                ex.starterCode,
                ex.referenceSolution,
                JSON.stringify(ex.testCases),
                ex.hints ? JSON.stringify(ex.hints) : null,
                ex.isCheckpoint ? 1 : 0,
              ]
            );
          }
        }
      }
    });
  }
}

