/**
 * Centralized Database Client & Initialization Entrypoint
 */

import { IDatabaseConnection } from '../shared/types/database';
import { MobileDatabaseConnection } from './MobileDatabaseConnection';
import { MigrationRunner } from './MigrationRunner';
import { SeedEngine } from './SeedEngine';
import { CourseRepository } from './repositories/CourseRepository';
import { ExerciseRepository } from './repositories/ExerciseRepository';
import { ProgressRepository } from './repositories/ProgressRepository';

export class DatabaseClient {
  private static instance: DatabaseClient | null = null;
  private connection: IDatabaseConnection | null = null;
  private initialized: boolean = false;

  public courseRepo!: CourseRepository;
  public exerciseRepo!: ExerciseRepository;
  public progressRepo!: ProgressRepository;

  private constructor() {}

  public static getInstance(): DatabaseClient {
    if (!this.instance) {
      this.instance = new DatabaseClient();
    }
    return this.instance;
  }

  public static resetInstance(): void {
    if (this.instance) {
      this.instance.connection = null;
      this.instance.initialized = false;
      this.instance = null;
    }
  }

  public async initialize(customConnection?: IDatabaseConnection): Promise<void> {
    if (customConnection) {
      this.connection = customConnection;
      this.initialized = false;
    } else if (this.initialized && this.connection) {
      return;
    } else {
      const mobileConn = new MobileDatabaseConnection();
      this.connection = mobileConn;
    }

    // 1. Run migrations
    await MigrationRunner.runMigrations(this.connection);

    // 2. Seed initial curriculum
    await SeedEngine.seedCurriculum(this.connection);

    // 3. Initialize Repositories
    this.courseRepo = new CourseRepository(this.connection);
    this.exerciseRepo = new ExerciseRepository(this.connection);
    this.progressRepo = new ProgressRepository(this.connection);

    this.initialized = true;
  }

  public getConnection(): IDatabaseConnection {
    if (!this.connection) {
      throw new Error('DatabaseClient is not initialized. Call initialize() first.');
    }
    return this.connection;
  }

  public async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.initialized = false;
    }
  }
}
