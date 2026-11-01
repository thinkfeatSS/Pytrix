/**
 * Database Layer Abstraction Interfaces
 */

export interface IDatabaseConnection {
  execute(sql: string, params?: any[]): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  querySingle<T = any>(sql: string, params?: any[]): Promise<T | null>;
  transaction<T>(action: (tx: IDatabaseConnection) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface IMigration {
  version: number;
  name: string;
  up(db: IDatabaseConnection): Promise<void>;
  down?(db: IDatabaseConnection): Promise<void>;
}

