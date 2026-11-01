/**
 * Python Runtime & Step Execution Data Types
 */

export interface ExecutionVariableSnapshot {
  name: string;
  type: string;
  value: string;
  isModified?: boolean;
}

export interface ExecutionStep {
  stepIndex: number;
  lineNumber: number;
  event: 'line' | 'call' | 'return';
  variables: Record<string, ExecutionVariableSnapshot>;
  stdout: string;
  explanation: string;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  steps: ExecutionStep[];
  executionTimeMs: number;
  error?: string | null;
  isTimeout?: boolean;
}

export type RuntimeBridgeMessage =
  | { type: 'RUN_CODE'; code: string; timeoutMs?: number }
  | { type: 'INPUT_RESPONSE'; value: string }
  | { type: 'CANCEL_EXECUTION' }
  | { type: 'RUNTIME_READY' }
  | { type: 'INPUT_REQUEST'; prompt: string }
  | { type: 'EXECUTION_STEP'; step: ExecutionStep }
  | { type: 'EXECUTION_COMPLETE'; result: ExecutionResult }
  | { type: 'EXECUTION_ERROR'; error: string; isTimeout?: boolean };

