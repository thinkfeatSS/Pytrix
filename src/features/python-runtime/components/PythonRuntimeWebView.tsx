/**
 * Python Runtime Bridge Component
 * Executes Python scripts offline and communicates over postMessage.
 */

import React, { useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { getPyodideRunnerHtml } from '../html/pyodideRunnerBundle';
import { PythonExecutionEngine } from '../engine/PythonExecutionEngine';
import { ExecutionResult } from '../types';

interface PythonRuntimeWebViewProps {
  onExecutionComplete?: (result: ExecutionResult) => void;
  onExecutionError?: (error: string) => void;
  onRuntimeReady?: () => void;
}

export interface PythonRuntimeHandle {
  runCode: (code: string, timeoutMs?: number) => Promise<ExecutionResult>;
}

const WebViewComponent: any = WebView;

export const PythonRuntimeWebView = React.forwardRef<
  PythonRuntimeHandle,
  PythonRuntimeWebViewProps
>(function PythonRuntimeWebViewComponent(
  { onExecutionComplete, onExecutionError, onRuntimeReady },
  ref
) {
  const webViewRef = useRef<any>(null);

  const runCode = useCallback(
    async (code: string, timeoutMs: number = 5000): Promise<ExecutionResult> => {
      // Execute via the PythonExecutionEngine with 5-second watchdog
      const result = await PythonExecutionEngine.executeScript(code, timeoutMs);
      if (result.success) {
        if (onExecutionComplete) onExecutionComplete(result);
      } else {
        if (onExecutionError) onExecutionError(result.stderr || result.error || 'Execution failed');
      }
      return result;
    },
    [onExecutionComplete, onExecutionError]
  );

  React.useImperativeHandle(ref, () => ({
    runCode,
  }));

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'RUNTIME_READY') {
          if (onRuntimeReady) onRuntimeReady();
        }
      } catch {
        // Ignore malformed message
      }
    },
    [onRuntimeReady]
  );

  return (
    <View style={styles.hiddenContainer}>
      <WebViewComponent
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: getPyodideRunnerHtml() }}
        onMessage={handleMessage}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  hiddenContainer: {
    width: 0,
    height: 0,
    opacity: 0,
    position: 'absolute',
  },
});
