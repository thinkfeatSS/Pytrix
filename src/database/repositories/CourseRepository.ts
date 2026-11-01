/**
 * Course Repository
 * Encapsulates read access for curriculum courses, modules, and topics.
 */

import { IDatabaseConnection } from '../../shared/types/database';
import { Course, Module, Topic, TopicStatus } from '../../shared/types/curriculum';

export class CourseRepository {
  constructor(private db: IDatabaseConnection) {}

  public async getCourseOverview(courseId: string): Promise<Course | null> {
    const course = await this.db.querySingle<Course>(
      `SELECT id, title, order_index as orderIndex, description FROM courses WHERE id = ?;`,
      [courseId]
    );

    if (!course) return null;

    const moduleRows = await this.db.query<any>(
      `SELECT m.id as moduleId, m.course_id, m.number, m.title as moduleTitle,
              m.order_index as moduleOrder, m.description as moduleDescription,
              t.id as topicId, t.title as topicTitle, t.order_index as topicOrder,
              t.learning_objective as learningObjective,
              COALESCE(p.status, 'LOCKED') as topicStatus,
              COALESCE(p.checkpoint_problems_solved, 0) as checkpointProblemsSolved
       FROM modules m
       LEFT JOIN topics t ON t.module_id = m.id
       LEFT JOIN user_topic_progress p ON p.topic_id = t.id
       WHERE m.course_id = ?
       ORDER BY m.order_index ASC, t.order_index ASC;`,
      [courseId]
    );

    const modulesMap = new Map<string, Module>();

    for (const row of moduleRows) {
      if (!modulesMap.has(row.moduleId)) {
        modulesMap.set(row.moduleId, {
          id: row.moduleId,
          courseId: courseId,
          number: row.number,
          title: row.moduleTitle,
          orderIndex: row.moduleOrder,
          description: row.moduleDescription,
          topics: [],
        });
      }

      if (row.topicId) {
        const mod = modulesMap.get(row.moduleId)!;
        mod.topics!.push({
          id: row.topicId,
          moduleId: row.moduleId,
          title: row.topicTitle,
          orderIndex: row.topicOrder,
          learningObjective: row.learningObjective,
          theoryMarkdown: '',
          status: row.topicStatus as TopicStatus,
        });
      }
    }

    course.modules = Array.from(modulesMap.values());
    return course;
  }

  public async getTopicDetails(topicId: string): Promise<Topic | null> {
    const row = await this.db.querySingle<any>(
      `SELECT t.id, t.module_id as moduleId, t.title, t.order_index as orderIndex,
              t.learning_objective as learningObjective, t.theory_markdown as theoryMarkdown,
              t.pitfalls_markdown as pitfallsMarkdown, t.prerequisite_topic_id as prerequisiteTopicId,
              COALESCE(p.status, 'LOCKED') as status
       FROM topics t
       LEFT JOIN user_topic_progress p ON p.topic_id = t.id
       WHERE t.id = ?;`,
      [topicId]
    );

    if (!row) return null;

    return {
      id: row.id,
      moduleId: row.moduleId,
      title: row.title,
      orderIndex: row.orderIndex,
      learningObjective: row.learningObjective,
      theoryMarkdown: row.theoryMarkdown,
      pitfallsMarkdown: row.pitfallsMarkdown,
      prerequisiteTopicId: row.prerequisiteTopicId,
      status: row.status as TopicStatus,
    };
  }
}

