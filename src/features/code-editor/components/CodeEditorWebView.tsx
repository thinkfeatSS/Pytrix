/**
 * CodeEditorWebView Component
 * Bridges React Native with the embedded offline handwriting editor.
 */

import React, {
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { getEditorHtml } from '../html/editorBundle';
import { EditorValidationEngine, ValidationResult } from '../validator/EditorValidationEngine';
import { useTheme } from '../../../shared/theme';

export interface CodeEditorHandle {
  resetCode: (code?: string) => void;
}

interface CodeEditorWebViewProps {
  initialCode?: string;
  referenceCode?: string;
  mode?: 'A' | 'B' | 'C';
  onCodeChange?: (code: string) => void;
  onValidationChange?: (result: ValidationResult) => void;
  onEditorReady?: () => void;
}

const WebViewComponent: any = WebView;

export const CodeEditorWebView = forwardRef<CodeEditorHandle, CodeEditorWebViewProps>(
  function CodeEditorWebViewComponent(
    {
      initialCode = '',
      referenceCode = '',
      mode = 'A',
      onCodeChange,
      onValidationChange,
      onEditorReady,
    },
    ref
  ) {
    const { theme } = useTheme();
    const webViewRef = useRef<any>(null);

    const htmlContent = React.useMemo(() => {
      return getEditorHtml(
        initialCode,
        referenceCode,
        mode,
        theme.isDark ? 'dark' : 'light'
      );
    }, [initialCode, referenceCode, mode, theme.isDark]);

    const resetCode = useCallback((code: string = '') => {
      if (webViewRef.current && typeof webViewRef.current.postMessage === 'function') {
        webViewRef.current.postMessage(
          JSON.stringify({ type: 'SET_CODE', code })
        );
      }
    }, []);

    useImperativeHandle(ref, () => ({
      resetCode,
    }));

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'EDITOR_READY') {
            if (onEditorReady) onEditorReady();
          } else if (data.type === 'CODE_CHANGED') {
            const code = data.payload.code;
            if (onCodeChange) onCodeChange(code);

            if (onValidationChange && referenceCode) {
              let validation: ValidationResult;
              if (mode === 'A') {
                validation = EditorValidationEngine.validateTrace(code, referenceCode);
              } else if (mode === 'B') {
                validation = EditorValidationEngine.validateFillIn(code, referenceCode);
              } else {
                const syntax = EditorValidationEngine.checkSyntax(code);
                validation = {
                  isValid: syntax.isValid,
                  isComplete: code.trim().length > 0 && syntax.isValid,
                  progressPercent: syntax.isValid ? 100 : 50,
                  matchedLength: code.length,
                  expectedLength: referenceCode.length,
                  ghostSuffix: '',
                  error: syntax.errors.length > 0 ? {
                    line: syntax.errors[0].line,
                    column: 1,
                    expected: '',
                    actual: '',
                    message: syntax.errors[0].message,
                    type: 'BRACKET',
                  } : null,
                };
              }
              onValidationChange(validation);
            }
          }
        } catch {
          // Ignore malformed message
        }
      },
      [mode, referenceCode, onCodeChange, onValidationChange, onEditorReady]
    );

    useEffect(() => {
      if (webViewRef.current && typeof webViewRef.current.postMessage === 'function') {
        webViewRef.current.postMessage(
          JSON.stringify({ type: 'SET_REFERENCE', reference: referenceCode })
        );
        webViewRef.current.postMessage(
          JSON.stringify({ type: 'SET_MODE', mode })
        );
        webViewRef.current.postMessage(
          JSON.stringify({ type: 'SET_CODE', code: initialCode })
        );
      }
    }, [referenceCode, mode, initialCode]);

    const containerBg = theme.isDark ? '#0F111A' : '#F8FAFC';

    return (
      <View style={[styles.container, { borderColor: theme.colors.border, backgroundColor: containerBg }]}>
        <WebViewComponent
          key={`${mode}_${initialCode}`}
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={[styles.webView, { backgroundColor: containerBg }]}
          scrollEnabled={true}
          keyboardDisplayRequiresUserAction={false}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 280,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  webView: {
    flex: 1,
  },
});
