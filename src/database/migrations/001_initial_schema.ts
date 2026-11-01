/**
 * Migration 001: Initial Schema
 * Creates tables for courses, modules, topics, exercises, user progress, and submission records.
 */

import { IDatabaseConnection, IMigration } from '../../shared/types/database';

export const migration001: IMigration = {
  version: 1,
  name: '001_initial_schema',
  async up(db: IDatabaseConnection): Promise<void> {
    // 1. Courses Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        description TEXT
      );
    `);

    // 2. Modules Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        number INTEGER NOT NULL,
        title TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        description TEXT,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);`);

    // 3. Topics Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        module_id TEXT NOT NULL,
        title TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        learning_objective TEXT NOT NULL,
        theory_markdown TEXT NOT NULL,
        pitfalls_markdown TEXT,
        prerequisite_topic_id TEXT,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
      );
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_topics_module ON topics(module_id);`);

    // 4. Exercises Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        topic_id TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        exercise_type TEXT NOT NULL,
        title TEXT NOT NULL,
        prompt TEXT NOT NULL,
        logic_explanation TEXT NOT NULL,
        step_by_step_json TEXT,
        starter_code TEXT NOT NULL,
        reference_solution TEXT NOT NULL,
        test_cases_json TEXT NOT NULL,
        hints_json TEXT,
        is_checkpoint INTEGER DEFAULT 0,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_exercises_topic ON exercises(topic_id);`);

    // 5. User Topic Progress Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_topic_progress (
        id TEXT PRIMARY KEY,
        topic_id TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL, -- LOCKED | AVAILABLE | IN_PROGRESS | COMPLETED
        checkpoint_problems_solved INTEGER DEFAULT 0,
        completed_at TEXT,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_topic_progress(status);`);

    // 6. User Exercise Submissions History Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_submissions (
        id TEXT PRIMARY KEY,
        exercise_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        submitted_code TEXT NOT NULL,
        is_passed INTEGER NOT NULL,
        error_message TEXT,
        execution_time_ms INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_submissions_exercise ON user_submissions(exercise_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_submissions_topic ON user_submissions(topic_id);`);
  },

  async down(db: IDatabaseConnection): Promise<void> {
    await db.execute(`DROP TABLE IF EXISTS user_submissions;`);
    await db.execute(`DROP TABLE IF EXISTS user_topic_progress;`);
    await db.execute(`DROP TABLE IF EXISTS exercises;`);
    await db.execute(`DROP TABLE IF EXISTS topics;`);
    await db.execute(`DROP TABLE IF EXISTS modules;`);
    await db.execute(`DROP TABLE IF EXISTS courses;`);
  },
};

