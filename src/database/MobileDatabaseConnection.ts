/**
 * Mobile In-Memory Database Connection
 * Pure JavaScript relational store implementing IDatabaseConnection.
 * Zero Node.js dependencies, zero WebAssembly dependencies, 100% compatible with Metro and Hermes.
 */

import { IDatabaseConnection } from '../shared/types/database';

export class MobileDatabaseConnection implements IDatabaseConnection {
  private tables: Map<string, Map<string, Record<string, any>>> = new Map();
  private inTransaction: boolean = false;

  public async execute(sql: string, params: any[] = []): Promise<void> {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    // 1. CREATE TABLE
    const createMatch = cleanSql.match(/^CREATE TABLE IF NOT EXISTS (\w+)/i);
    if (createMatch) {
      const tableName = createMatch[1];
      if (!this.tables.has(tableName)) {
        this.tables.set(tableName, new Map());
      }
      return;
    }

    // 2. CREATE INDEX (No-op in-memory)
    if (/^CREATE INDEX/i.test(cleanSql)) {
      return;
    }

    // 3. INSERT OR REPLACE INTO / INSERT OR IGNORE INTO / INSERT INTO
    const insertMatch = cleanSql.match(
      /^INSERT (?:OR (REPLACE|IGNORE) )?INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i
    );
    if (insertMatch) {
      const mode = (insertMatch[1] || 'REPLACE').toUpperCase();
      const tableName = insertMatch[2];
      const cols = insertMatch[3].split(',').map((c) => c.trim());

      let table = this.tables.get(tableName);
      if (!table) {
        table = new Map();
        this.tables.set(tableName, table);
      }

      const row: Record<string, any> = {};
      cols.forEach((col, idx) => {
        row[col] = params[idx] !== undefined ? params[idx] : null;
      });

      // Primary key is usually first column ('id' or 'version')
      const pkCol = cols[0];
      const pkVal = String(row[pkCol]);

      if (mode === 'IGNORE' && table.has(pkVal)) {
        return;
      }

      table.set(pkVal, row);
      return;
    }

    // 4. UPDATE table SET col1 = ?, ... WHERE topic_id = ?
    const updateMatch = cleanSql.match(/^UPDATE (\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
    if (updateMatch) {
      const tableName = updateMatch[1];
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];

      const table = this.tables.get(tableName);
      if (!table) return;

      const setAssignments = setClause.split(',').map((s) => s.trim());
      let paramIdx = 0;
      const updates: Record<string, any> = {};

      for (const assignment of setAssignments) {
        const parts = assignment.split('=').map((p) => p.trim());
        const col = parts[0];
        updates[col] = params[paramIdx++];
      }

      for (const [, row] of table.entries()) {
        let matches = true;
        if (whereClause) {
          if (whereClause.includes('topic_id = ?')) {
            const expectedTopicId = params[paramIdx];
            if (row.topic_id !== expectedTopicId) matches = false;
          }
        }

        if (matches) {
          Object.assign(row, updates);
        }
      }
      return;
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    // 1. SELECT version FROM schema_migrations
    if (/SELECT version FROM schema_migrations/i.test(cleanSql)) {
      const table = this.tables.get('schema_migrations') || new Map();
      return Array.from(table.values()) as T[];
    }

    // 2. SELECT id, title, order_index as orderIndex, description FROM courses WHERE id = ?
    if (/SELECT id, title, order_index as orderIndex, description FROM courses WHERE id = \?/i.test(cleanSql)) {
      const courseId = params[0];
      const table = this.tables.get('courses') || new Map();
      const course = table.get(String(courseId));
      if (!course) return [];
      return [
        {
          id: course.id,
          title: course.title,
          orderIndex: course.order_index,
          description: course.description,
        } as T,
      ];
    }

    // 3. SELECT modules + topics overview join
    if (/SELECT m\.id as moduleId/i.test(cleanSql)) {
      const courseId = params[0];
      const modulesTable = this.tables.get('modules') || new Map();
      const topicsTable = this.tables.get('topics') || new Map();
      const progressTable = this.tables.get('user_topic_progress') || new Map();

      const results: any[] = [];
      const courseModules = Array.from(modulesTable.values())
        .filter((m) => m.course_id === courseId)
        .sort((a, b) => a.order_index - b.order_index);

      for (const m of courseModules) {
        const moduleTopics = Array.from(topicsTable.values())
          .filter((t) => t.module_id === m.id)
          .sort((a, b) => a.order_index - b.order_index);

        if (moduleTopics.length === 0) {
          results.push({
            moduleId: m.id,
            course_id: m.course_id,
            number: m.number,
            moduleTitle: m.title,
            moduleOrder: m.order_index,
            moduleDescription: m.description,
            topicId: null,
          });
        } else {
          for (const t of moduleTopics) {
            let userProg: any = null;
            for (const p of progressTable.values()) {
              if (p.topic_id === t.id) {
                userProg = p;
                break;
              }
            }

            results.push({
              moduleId: m.id,
              course_id: m.course_id,
              number: m.number,
              moduleTitle: m.title,
              moduleOrder: m.order_index,
              moduleDescription: m.description,
              topicId: t.id,
              topicTitle: t.title,
              topicOrder: t.order_index,
              learningObjective: t.learning_objective,
              topicStatus: userProg ? userProg.status : 'LOCKED',
              checkpointProblemsSolved: userProg ? userProg.checkpoint_problems_solved : 0,
            });
          }
        }
      }
      return results as T[];
    }

    // 4. SELECT topic details by ID
    if (/SELECT t\.id.*FROM topics t/i.test(cleanSql)) {
      const topicId = params[0];
      const topicsTable = this.tables.get('topics') || new Map();
      const progressTable = this.tables.get('user_topic_progress') || new Map();

      let foundTopic: any = null;
      for (const t of topicsTable.values()) {
        if (t.id === topicId) {
          foundTopic = t;
          break;
        }
      }
      if (!foundTopic) return [];

      let userProg: any = null;
      for (const p of progressTable.values()) {
        if (p.topic_id === topicId) {
          userProg = p;
          break;
        }
      }

      return [
        {
          id: foundTopic.id,
          moduleId: foundTopic.module_id,
          title: foundTopic.title,
          orderIndex: foundTopic.order_index,
          learningObjective: foundTopic.learning_objective,
          theoryMarkdown: foundTopic.theory_markdown,
          pitfallsMarkdown: foundTopic.pitfalls_markdown,
          prerequisiteTopicId: foundTopic.prerequisite_topic_id,
          status: userProg ? userProg.status : 'LOCKED',
        } as T,
      ];
    }

    // 5. SELECT exercises WHERE topic_id = ?
    if (/SELECT id.*FROM exercises WHERE topic_id = \?/i.test(cleanSql)) {
      const topicId = params[0];
      const table = this.tables.get('exercises') || new Map();
      const exercises = Array.from(table.values())
        .filter((e) => e.topic_id === topicId)
        .sort((a, b) => a.order_index - b.order_index);
      return exercises.map((e) => ({
        id: e.id,
        topicId: e.topic_id,
        topic_id: e.topic_id,
        orderIndex: e.order_index,
        order_index: e.order_index,
        exerciseType: e.exercise_type,
        exercise_type: e.exercise_type,
        title: e.title,
        prompt: e.prompt,
        logicExplanation: e.logic_explanation,
        logic_explanation: e.logic_explanation,
        stepByStepJson: e.step_by_step_json,
        step_by_step_json: e.step_by_step_json,
        starterCode: e.starter_code,
        starter_code: e.starter_code,
        referenceSolution: e.reference_solution,
        reference_solution: e.reference_solution,
        testCasesJson: e.test_cases_json,
        test_cases_json: e.test_cases_json,
        hintsJson: e.hints_json,
        hints_json: e.hints_json,
        isCheckpoint: e.is_checkpoint,
        is_checkpoint: e.is_checkpoint,
      })) as T[];
    }

    // 6. SELECT single exercise WHERE id = ?
    if (/SELECT id.*FROM exercises WHERE id = \?/i.test(cleanSql)) {
      const id = params[0];
      const table = this.tables.get('exercises') || new Map();
      const e = table.get(String(id));
      if (!e) return [];
      return [
        {
          id: e.id,
          topicId: e.topic_id,
          topic_id: e.topic_id,
          orderIndex: e.order_index,
          order_index: e.order_index,
          exerciseType: e.exercise_type,
          exercise_type: e.exercise_type,
          title: e.title,
          prompt: e.prompt,
          logicExplanation: e.logic_explanation,
          logic_explanation: e.logic_explanation,
          stepByStepJson: e.step_by_step_json,
          step_by_step_json: e.step_by_step_json,
          starterCode: e.starter_code,
          starter_code: e.starter_code,
          referenceSolution: e.reference_solution,
          reference_solution: e.reference_solution,
          testCasesJson: e.test_cases_json,
          test_cases_json: e.test_cases_json,
          hintsJson: e.hints_json,
          hints_json: e.hints_json,
          isCheckpoint: e.is_checkpoint,
          is_checkpoint: e.is_checkpoint,
        } as T,
      ];
    }

    // 7. SELECT user_topic_progress WHERE topic_id = ?
    if (/SELECT id.*FROM user_topic_progress WHERE topic_id = \?/i.test(cleanSql)) {
      const topicId = params[0];
      const table = this.tables.get('user_topic_progress') || new Map();
      for (const p of table.values()) {
        if (p.topic_id === topicId) {
          return [
            {
              id: p.id,
              topicId: p.topic_id,
              status: p.status,
              checkpointProblemsSolved: p.checkpoint_problems_solved,
              completedAt: p.completed_at,
              updatedAt: p.updated_at,
            } as T,
          ];
        }
      }
      return [];
    }

    // 8. SELECT DISTINCT exercise_id FROM user_submissions
    if (/SELECT DISTINCT exercise_id FROM user_submissions/i.test(cleanSql)) {
      const topicId = params[0];
      const table = this.tables.get('user_submissions') || new Map();
      const distinctSet = new Set<string>();

      for (const s of table.values()) {
        if (s.topic_id === topicId && s.is_passed === 1) {
          distinctSet.add(s.exercise_id);
        }
      }
      return Array.from(distinctSet).map((exId) => ({ exercise_id: exId })) as T[];
    }

    // 9. SELECT id FROM topics WHERE prerequisite_topic_id = ?
    if (/SELECT id FROM topics WHERE prerequisite_topic_id = \?/i.test(cleanSql)) {
      const prereqId = params[0];
      const table = this.tables.get('topics') || new Map();
      for (const t of table.values()) {
        if (t.prerequisite_topic_id === prereqId) {
          return [{ id: t.id } as T];
        }
      }
      return [];
    }

    // 10. SELECT status, COUNT(*) as count FROM user_topic_progress GROUP BY status
    if (/SELECT status, COUNT\(\*\) as count FROM user_topic_progress/i.test(cleanSql)) {
      const table = this.tables.get('user_topic_progress') || new Map();
      const counts: Record<string, number> = {};
      for (const p of table.values()) {
        counts[p.status] = (counts[p.status] || 0) + 1;
      }
      return Object.entries(counts).map(([status, count]) => ({ status, count })) as T[];
    }

    // 11. SELECT COUNT(*) as count FROM user_submissions
    if (/SELECT COUNT\(\*\) as count FROM user_submissions/i.test(cleanSql)) {
      const table = this.tables.get('user_submissions') || new Map();
      let count = 0;
      for (const s of table.values()) {
        if (s.is_passed === 1) count++;
      }
      return [{ count } as T];
    }

    return [];
  }

  public async querySingle<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  public async transaction<T>(action: (tx: IDatabaseConnection) => Promise<T>): Promise<T> {
    if (this.inTransaction) {
      return await action(this);
    }
    this.inTransaction = true;
    try {
      return await action(this);
    } finally {
      this.inTransaction = false;
    }
  }

  public async close(): Promise<void> {
    this.tables.clear();
  }
}

