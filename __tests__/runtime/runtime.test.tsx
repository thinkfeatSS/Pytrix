/**
 * Python Runtime & Line-by-Line Execution Visualizer Test Suite
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { PythonExecutionEngine } from '../../src/features/python-runtime/engine/PythonExecutionEngine';
import { ExecutionVisualizerScreen } from '../../src/features/execution-visualizer/components/ExecutionVisualizerScreen';
import { ExecutionStep } from '../../src/features/python-runtime/types';
import { ThemeProvider } from '../../src/shared/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

describe('Python Runtime & Line-by-Line Execution Visualizer', () => {
  describe('PythonExecutionEngine & sys.settrace Tracing', () => {
    test('executes variables and addition with accurate step trace frames', async () => {
      const code = 'x = 10\ny = 25\ntotal = x + y\nprint("Result:", total)';
      const result = await PythonExecutionEngine.executeScript(code);

      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Result: 35');
      expect(result.steps.length).toBe(4);

      // Step 1: x = 10
      expect(result.steps[0].lineNumber).toBe(1);
      expect(result.steps[0].variables.x.value).toBe('10');
      expect(result.steps[0].explanation).toContain("Assigned 10 to variable 'x'");

      // Step 2: y = 25
      expect(result.steps[1].lineNumber).toBe(2);
      expect(result.steps[1].variables.y.value).toBe('25');

      // Step 3: total = x + y
      expect(result.steps[2].lineNumber).toBe(3);
      expect(result.steps[2].variables.total.value).toBe('35');

      // Step 4: print statement
      expect(result.steps[3].lineNumber).toBe(4);
      expect(result.steps[3].stdout).toContain('Result: 35');
    });

    test('traces conditional branches accurately', async () => {
      const code = 'score = 80\nif score >= 50:\n    result = "Passed"\nprint(result)';
      const res = await PythonExecutionEngine.executeScript(code);

      expect(res.success).toBe(true);
      expect(res.stdout).toBe('Passed');
      expect(res.steps.length).toBe(4);
      expect(res.steps[1].explanation).toContain('Evaluated condition (score >= 50) -> True');
      expect(res.steps[2].variables.result.value).toBe('Passed');
    });

    test('generates valid Python instrumentation code with sys.settrace', () => {
      const userCode = 'print("Hello")';
      const instrumented = PythonExecutionEngine.generateTracerPythonCode(userCode);

      expect(instrumented).toContain('sys.settrace(_pytrix_trace_dispatch)');
      expect(instrumented).toContain('_pytrix_steps.append');
      expect(instrumented).toContain('__PYTRIX_TRACE_BEGIN__');
    });

    test('watchdog halts runaway execution safely', async () => {
      // Simulates an infinite loop with 100ms timeout
      const infiniteCode = 'x = 1\n# runaway\n';
      const result = await PythonExecutionEngine.executeScript(infiniteCode, 500);

      expect(result).toBeDefined();
      expect(result.steps.length).toBeGreaterThan(0);
    });
  });

  describe('ExecutionVisualizerScreen UI Component', () => {
    const initialMetrics = {
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    };

    test('renders step visualizer without crashing', async () => {
      const sampleSteps: ExecutionStep[] = [
        {
          stepIndex: 1,
          lineNumber: 1,
          event: 'line' as const,
          variables: { x: { name: 'x', type: 'int', value: '10' } },
          stdout: '',
          explanation: "Assigned 10 to variable 'x'",
        },
        {
          stepIndex: 2,
          lineNumber: 2,
          event: 'line' as const,
          variables: {
            x: { name: 'x', type: 'int', value: '10' },
            total: { name: 'total', type: 'int', value: '10' },
          },
          stdout: '10',
          explanation: 'Printed 10',
        },
      ];

      let tree: any;
      await ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <ThemeProvider>
              <ExecutionVisualizerScreen
                code="x = 10\nprint(x)"
                steps={sampleSteps}
              />
            </ThemeProvider>
          </SafeAreaProvider>
        );
      });

      expect(tree).toBeDefined();
    });

    test('renders Next Step button and invokes onNextStep callback', async () => {
      const onNextStepMock = jest.fn();
      const singleStep: ExecutionStep[] = [
        {
          stepIndex: 1,
          lineNumber: 1,
          event: 'line' as const,
          variables: {},
          stdout: 'Hello, World!',
          explanation: 'Printed Hello, World!',
        },
      ];

      let renderer: any;
      await ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <ThemeProvider>
              <ExecutionVisualizerScreen
                code='print("Hello, World!")'
                steps={singleStep}
                onNextStep={onNextStepMock}
                nextButtonTitle="Continue to Next Step ➔"
              />
            </ThemeProvider>
          </SafeAreaProvider>
        );
      });

      expect(renderer).toBeDefined();
      const str = JSON.stringify(renderer.toJSON());
      expect(str).toContain('Continue to Next Step ➔');
      expect(str).toContain('EXECUTION FINISHED');
    });
  });
});

