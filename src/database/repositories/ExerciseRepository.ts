/**
 * Exercise Repository
 * Encapsulates read access for exercises, test cases, and prompts.
 */

import { IDatabaseConnection } from '../../shared/types/database';
import { Exercise, ExerciseType } from '../../shared/types/curriculum';

export class ExerciseRepository {
  constructor(private db: IDatabaseConnection) {}

  public async getExercisesForTopic(topicId: string): Promise<Exercise[]> {
    const rows = await this.db.query<any>(
      `SELECT id, topic_id as topicId, order_index as orderIndex,
              exercise_type as exerciseType, title, prompt,
              logic_explanation as logicExplanation,
              step_by_step_json as stepByStepJson,
              starter_code as starterCode,
              reference_solution as referenceSolution,
              test_cases_json as testCasesJson,
              hints_json as hintsJson,
              is_checkpoint as isCheckpoint
       FROM exercises
       WHERE topic_id = ?
       ORDER BY order_index ASC;`,
      [topicId]
    );

    return rows.map((r) => this.mapRowToExercise(r));
  }

  public async getExerciseById(exerciseId: string): Promise<Exercise | null> {
    const row = await this.db.querySingle<any>(
      `SELECT id, topic_id as topicId, order_index as orderIndex,
              exercise_type as exerciseType, title, prompt,
              logic_explanation as logicExplanation,
              step_by_step_json as stepByStepJson,
              starter_code as starterCode,
              reference_solution as referenceSolution,
              test_cases_json as testCasesJson,
              hints_json as hintsJson,
              is_checkpoint as isCheckpoint
       FROM exercises
       WHERE id = ?;`,
      [exerciseId]
    );

    return row ? this.mapRowToExercise(row) : null;
  }

  private mapRowToExercise(row: any): Exercise {
    return {
      id: row.id,
      topicId: row.topicId || row.topic_id,
      orderIndex: row.orderIndex !== undefined ? row.orderIndex : row.order_index,
      exerciseType: (row.exerciseType || row.exercise_type) as ExerciseType,
      title: row.title,
      prompt: row.prompt,
      logicExplanation: row.logicExplanation || row.logic_explanation,
      stepByStepGuide: row.stepByStepJson
        ? JSON.parse(row.stepByStepJson)
        : row.step_by_step_json
        ? JSON.parse(row.step_by_step_json)
        : undefined,
      starterCode: row.starterCode !== undefined ? row.starterCode : row.starter_code,
      referenceSolution: row.referenceSolution !== undefined ? row.referenceSolution : row.reference_solution,
      testCases: row.testCasesJson
        ? JSON.parse(row.testCasesJson)
        : row.test_cases_json
        ? JSON.parse(row.test_cases_json)
        : [],
      hints: row.hintsJson
        ? JSON.parse(row.hintsJson)
        : row.hints_json
        ? JSON.parse(row.hints_json)
        : undefined,
      isCheckpoint: row.isCheckpoint === 1 || row.is_checkpoint === 1,
    };
  }
}

