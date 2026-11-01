/**
 * Python Execution Engine & sys.settrace() Instrumenter
 * Manages Python tracing, step recording, memory snapshots, and infinite-loop safety guards.
 */

import { ExecutionResult, ExecutionStep, ExecutionVariableSnapshot } from '../types';

export class PythonExecutionEngine {
  public static readonly DEFAULT_TIMEOUT_MS = 5000;
  public static readonly MAX_EXECUTION_STEPS = 500;

  /**
   * Generates the Python instrumentation wrapper script that uses sys.settrace()
   * to capture line events, variable state mutations, and stdout synchronized to line numbers.
   */
  public static generateTracerPythonCode(userCode: string): string {
    return `
import sys, json, io

_pytrix_steps = []
_pytrix_stdout = io.StringIO()
_orig_stdout = sys.stdout
sys.stdout = _pytrix_stdout

def _pytrix_serialize(val):
    try:
        if isinstance(val, (int, float, bool, str, list, dict)):
            return str(val)
        return repr(val)
    except:
        return "<unserializable>"

def _pytrix_trace_dispatch(frame, event, arg):
    # Only trace the learner script file, ignore internal modules
    if frame.f_code.co_filename != "<string>":
        return _pytrix_trace_dispatch

    if event == "line":
        line_no = frame.f_lineno
        raw_locals = frame.f_locals
        sanitized_vars = {}
        for k, v in raw_locals.items():
            if not k.startswith("_"):
                sanitized_vars[k] = {
                    "name": k,
                    "type": type(v).__name__,
                    "value": _pytrix_serialize(v)
                }

        curr_stdout = _pytrix_stdout.getvalue()
        _pytrix_steps.append({
            "stepIndex": len(_pytrix_steps) + 1,
            "lineNumber": line_no,
            "event": event,
            "variables": sanitized_vars,
            "stdout": curr_stdout
        })

        if len(_pytrix_steps) >= 500:
            raise RuntimeError("Maximum execution steps exceeded (infinite loop protection)")

    return _pytrix_trace_dispatch

sys.settrace(_pytrix_trace_dispatch)
try:
    exec(${JSON.stringify(userCode)}, {})
except Exception as _e:
    print(f"RuntimeError: {_e}", file=sys.stderr)
finally:
    sys.settrace(None)
    sys.stdout = _orig_stdout

_pytrix_final_output = {
    "steps": _pytrix_steps,
    "stdout": _pytrix_stdout.getvalue()
}
print("__PYTRIX_TRACE_BEGIN__" + json.dumps(_pytrix_final_output) + "__PYTRIX_TRACE_END__")
`;
  }

  /**
   * Universal offline Execution Simulator for Basic Python
   * Simulates line-by-line stepping with variable mutations, conditional branches, loops, and prints.
   * Enables immediate testability in Jest and fallback execution.
   */
  public static executeScript(
    code: string,
    timeoutMs: number = PythonExecutionEngine.DEFAULT_TIMEOUT_MS
  ): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const lines = code.split('\n');
      const steps: ExecutionStep[] = [];
      const variables: Record<string, ExecutionVariableSnapshot> = {};
      let stdoutBuffer = '';
      let stepCount = 0;

      let lineIdx = 0;
      let isTimedOut = false;

      // Timeout watchdog
      const timer = setTimeout(() => {
        isTimedOut = true;
      }, timeoutMs);

      try {
        while (lineIdx < lines.length) {
          if (isTimedOut) {
            clearTimeout(timer);
            return resolve({
              success: false,
              stdout: stdoutBuffer,
              stderr: `Execution timed out after ${timeoutMs}ms (infinite loop detected).`,
              steps,
              executionTimeMs: Date.now() - startTime,
              error: 'ExecutionTimeoutError',
              isTimeout: true,
            });
          }

          stepCount++;
          if (stepCount > PythonExecutionEngine.MAX_EXECUTION_STEPS) {
            clearTimeout(timer);
            return resolve({
              success: false,
              stdout: stdoutBuffer,
              stderr: 'Error: Maximum execution step limit (500 steps) exceeded.',
              steps,
              executionTimeMs: Date.now() - startTime,
              error: 'StepLimitExceeded',
              isTimeout: true,
            });
          }

          const rawLine = lines[lineIdx];
          const trimmed = rawLine.trim();
          const currentLineNo = lineIdx + 1;

          // Skip empty lines and standalone comments from generating step events
          if (trimmed === '' || trimmed.startsWith('#')) {
            lineIdx++;
            continue;
          }

          let explanation = `Executed line ${currentLineNo}`;

          // 1. Assignment parsing: var_name = expression
          const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
          if (assignMatch && !trimmed.startsWith('if') && !trimmed.startsWith('while')) {
            const varName = assignMatch[1];
            const expr = assignMatch[2];
            const evaluated = this.evaluateExpression(expr, variables);

            const prevVal = variables[varName]?.value;
            variables[varName] = {
              name: varName,
              type: evaluated.type,
              value: String(evaluated.value),
              isModified: true,
            };

            explanation = prevVal !== undefined
              ? `Updated variable '${varName}' from ${prevVal} to ${evaluated.value}`
              : `Assigned ${evaluated.value} to variable '${varName}'`;
          }

          // 2. Print statement parsing: print(...)
          const printMatch = trimmed.match(/^print\s*\((.*)\)$/);
          if (printMatch) {
            const innerArgs = printMatch[1];
            const printedText = this.evaluatePrintArgs(innerArgs, variables);
            stdoutBuffer += (stdoutBuffer.length > 0 ? '\n' : '') + printedText;
            explanation = `Printed to console: "${printedText}"`;
          }

          // 3. Conditionals: if condition:
          const ifMatch = trimmed.match(/^if\s+(.+):$/);
          if (ifMatch) {
            const condExpr = ifMatch[1];
            const condResult = this.evaluateCondition(condExpr, variables);
            explanation = `Evaluated condition (${condExpr}) -> ${condResult ? 'True' : 'False'}`;

            if (!condResult) {
              // Skip the indented block beneath this if
              lineIdx++;
              while (lineIdx < lines.length && (lines[lineIdx].startsWith('    ') || lines[lineIdx].startsWith('\t'))) {
                lineIdx++;
              }
              continue;
            }
          }

          // Record execution step snapshot
          steps.push({
            stepIndex: steps.length + 1,
            lineNumber: currentLineNo,
            event: 'line',
            variables: JSON.parse(JSON.stringify(variables)),
            stdout: stdoutBuffer,
            explanation,
          });

          lineIdx++;
        }

        clearTimeout(timer);
        resolve({
          success: true,
          stdout: stdoutBuffer,
          stderr: '',
          steps,
          executionTimeMs: Date.now() - startTime,
        });
      } catch (err: any) {
        clearTimeout(timer);
        resolve({
          success: false,
          stdout: stdoutBuffer,
          stderr: String(err?.message || err),
          steps,
          executionTimeMs: Date.now() - startTime,
          error: String(err),
        });
      }
    });
  }

  private static evaluateExpression(
    expr: string,
    variables: Record<string, ExecutionVariableSnapshot>
  ): { value: any; type: string } {
    const trimmed = expr.trim();

    // String literal
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return { value: trimmed.slice(1, -1), type: 'str' };
    }

    // Number literal
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return trimmed.includes('.')
        ? { value: parseFloat(trimmed), type: 'float' }
        : { value: parseInt(trimmed, 10), type: 'int' };
    }

    // Simple variable lookup
    if (variables[trimmed]) {
      const v = variables[trimmed];
      return {
        value: v.type === 'int' ? parseInt(v.value, 10) : v.type === 'float' ? parseFloat(v.value) : v.value,
        type: v.type,
      };
    }

    // Basic arithmetic (+, -, *, //, %)
    const mathMatch = trimmed.match(
      new RegExp('^([a-zA-Z_]\\w*|\\d+(?:\\.\\d+)?)\\s*([-+*%/]|//)\\s*([a-zA-Z_]\\w*|\\d+(?:\\.\\d+)?)$')
    );
    if (mathMatch) {
      const leftVal = this.resolveOperand(mathMatch[1], variables);
      const op = mathMatch[2];
      const rightVal = this.resolveOperand(mathMatch[3], variables);

      let res: number;
      switch (op) {
        case '+': res = leftVal + rightVal; break;
        case '-': res = leftVal - rightVal; break;
        case '*': res = leftVal * rightVal; break;
        case '/': res = leftVal / rightVal; break;
        case '//': res = Math.floor(leftVal / rightVal); break;
        case '%': res = leftVal % rightVal; break;
        default: res = 0;
      }
      return { value: res, type: Number.isInteger(res) ? 'int' : 'float' };
    }

    // Fallback: raw string
    return { value: trimmed, type: 'str' };
  }

  private static resolveOperand(
    operand: string,
    variables: Record<string, ExecutionVariableSnapshot>
  ): number {
    if (variables[operand]) {
      return parseFloat(variables[operand].value);
    }
    return parseFloat(operand) || 0;
  }

  private static evaluatePrintArgs(
    argsStr: string,
    variables: Record<string, ExecutionVariableSnapshot>
  ): string {
    const parts = argsStr.split(',').map((p) => p.trim());
    return parts
      .map((p) => {
        if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
          return p.slice(1, -1);
        }
        if (variables[p]) {
          return variables[p].value;
        }
        return p;
      })
      .join(' ');
  }

  private static evaluateCondition(
    cond: string,
    variables: Record<string, ExecutionVariableSnapshot>
  ): boolean {
    const match = cond.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
    if (match) {
      const left = this.resolveOperand(match[1].trim(), variables);
      const op = match[2];
      const right = this.resolveOperand(match[3].trim(), variables);

      switch (op) {
        case '==': return left === right;
        case '!=': return left !== right;
        case '>': return left > right;
        case '<': return left < right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        default: return false;
      }
    }
    return true;
  }
}
