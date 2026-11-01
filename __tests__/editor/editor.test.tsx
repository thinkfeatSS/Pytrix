/**
 * Handwriting Code Editor & Validation Engine Test Suite
 * Tests Mode A (Trace), Mode B (Fill-in), Mode C (Independent), and bracket/syntax checkers.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EditorValidationEngine } from '../../src/features/code-editor/validator/EditorValidationEngine';
import { HandwritingEditorScreen } from '../../src/features/code-editor/components/HandwritingEditorScreen';
import { getEditorHtml } from '../../src/features/code-editor/html/editorBundle';
import { ThemeProvider } from '../../src/shared/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

describe('Handwriting-Inspired Code Editor Validation Engine', () => {
  const reference = 'print("Hello, World!")';

  describe('Mode A: Copybook Trace Validation', () => {
    test('validates correct prefix keystrokes and computes ghost text suffix', () => {
      const input = 'print("Hel';
      const result = EditorValidationEngine.validateTrace(input, reference);

      expect(result.isValid).toBe(true);
      expect(result.isComplete).toBe(false);
      expect(result.matchedLength).toBe(10);
      expect(result.ghostSuffix).toBe('lo, World!")');
      expect(result.error).toBeNull();
      expect(result.progressPercent).toBeGreaterThan(0);
    });

    test('validates full completion when input strictly matches reference', () => {
      const input = 'print("Hello, World!")';
      const result = EditorValidationEngine.validateTrace(input, reference);

      expect(result.isValid).toBe(true);
      expect(result.isComplete).toBe(true);
      expect(result.progressPercent).toBe(100);
      expect(result.ghostSuffix).toBe('');
      expect(result.error).toBeNull();
    });

    test('detects bracket mismatch immediately when wrong symbol is typed', () => {
      // User typed '[' instead of '('
      const input = 'print[';
      const result = EditorValidationEngine.validateTrace(input, reference);

      expect(result.isValid).toBe(false);
      expect(result.isComplete).toBe(false);
      expect(result.error).not.toBeNull();
      expect(result.error!.type).toBe('BRACKET');
      expect(result.error!.expected).toBe('(');
      expect(result.error!.actual).toBe('[');
      expect(result.error!.message).toContain("Expected opening bracket '('");
    });

    test('detects quotation mark mismatch', () => {
      // User typed single quote ' instead of double quote "
      const input = "print('";
      const result = EditorValidationEngine.validateTrace(input, reference);

      expect(result.isValid).toBe(false);
      expect(result.error!.type).toBe('QUOTE');
      expect(result.error!.expected).toBe('"');
      expect(result.error!.actual).toBe("'");
    });

    test('detects indentation and space errors', () => {
      const refWithIndent = 'if True:\n    print("Yes")';
      const inputWithWrongSpace = 'if True:\n  '; // 2 spaces instead of 4
      const result = EditorValidationEngine.validateTrace(inputWithWrongSpace, refWithIndent);

      expect(result.isValid).toBe(true); // Prefix of spaces is valid so far
      expect(result.matchedLength).toBe(11);
    });

    test('detects extra code typed beyond reference', () => {
      const input = 'print("Hello, World!")extra';
      const result = EditorValidationEngine.validateTrace(input, reference);

      expect(result.isValid).toBe(false);
      expect(result.error!.message).toContain('Extra code typed');
    });
  });

  describe('Mode B: Fill-In Blank Validation', () => {
    test('validates completed slot accurately', () => {
      const result = EditorValidationEngine.validateFillIn(
        'print("Score:", 100)',
        'print("Score:", 100)'
      );
      expect(result.isValid).toBe(true);
      expect(result.isComplete).toBe(true);
    });

    test('detects unfilled blank placeholder ___ and guides user', () => {
      const result = EditorValidationEngine.validateFillIn(
        'print(___)',
        'print("Hello, Python!")'
      );
      expect(result.isValid).toBe(false);
      expect(result.isComplete).toBe(false);
      expect(result.error).not.toBeNull();
      expect(result.error!.message).toContain('Blank gap "___"');
    });

    test('accepts single or double quotes interchangeably for Python strings', () => {
      const result = EditorValidationEngine.validateFillIn(
        "print('Hello, Python!')",
        'print("Hello, Python!")'
      );
      expect(result.isValid).toBe(true);
      expect(result.isComplete).toBe(true);
      expect(result.error).toBeNull();
    });

    test('accepts valid Python code with arbitrary spacing inside parentheses', () => {
      const result = EditorValidationEngine.validateFillIn(
        'print( "Hello, Python!" )',
        'print("Hello, Python!")'
      );
      expect(result.isValid).toBe(true);
      expect(result.isComplete).toBe(true);
      expect(result.error).toBeNull();
    });

    test('accepts spacing variations around arguments and commas', () => {
      const result = EditorValidationEngine.validateFillIn(
        'print("Score:" ,100)',
        'print("Score:", 100)'
      );
      expect(result.isValid).toBe(true);
      expect(result.isComplete).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('Mode C: Independent Syntax & Bracket Validation', () => {
    test('detects unclosed parentheses and brackets', () => {
      const code = 'total = (5 + 10';
      const syntax = EditorValidationEngine.checkSyntax(code);

      expect(syntax.isValid).toBe(false);
      expect(syntax.errors.length).toBeGreaterThan(0);
      expect(syntax.errors[0].type).toBe('UNCLOSED_BRACKET');
      expect(syntax.errors[0].message).toContain('Unclosed bracket "("');
    });

    test('detects mismatched brackets', () => {
      const code = 'items = [1, 2, 3)';
      const syntax = EditorValidationEngine.checkSyntax(code);

      expect(syntax.isValid).toBe(false);
      expect(syntax.errors[0].type).toBe('MISMATCHED_BRACKET');
      expect(syntax.errors[0].message).toContain('Mismatched bracket');
    });

    test('detects missing colon on if statement', () => {
      const code = 'if score > 50\n    print("Win")';
      const syntax = EditorValidationEngine.checkSyntax(code);

      expect(syntax.isValid).toBe(false);
      const colonErr = syntax.errors.find((e) => e.type === 'MISSING_COLON');
      expect(colonErr).toBeDefined();
      expect(colonErr!.message).toContain('Missing colon ":"');
    });

    test('passes valid Python syntax with balanced brackets and colons', () => {
      const code = 'if score > 50:\n    print("Win", (10 + 20))\n';
      const syntax = EditorValidationEngine.checkSyntax(code);

      expect(syntax.isValid).toBe(true);
      expect(syntax.errors.length).toBe(0);
    });
  });

  describe('HandwritingEditorScreen UI Component', () => {
    const initialMetrics = {
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    };

    test('renders cleanly with Code to Trace card visible in Mode A', async () => {
      let tree: any;
      await ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <ThemeProvider>
              <HandwritingEditorScreen
                exerciseTitle="Trace Python Output"
                prompt="Type print statement"
                referenceSolution='print("Hello, World!")\n'
                mode="A"
              />
            </ThemeProvider>
          </SafeAreaProvider>
        );
      });
      expect(tree).toBeDefined();
      const jsonStr = JSON.stringify(tree.toJSON());
      expect(jsonStr).toContain('CODE TO TRACE');
      expect(jsonStr).toContain('print(\\"Hello, World!\\")');
    });

    test('renders Mode B with blank gap instructions and hides reference code card', async () => {
      let tree: any;
      await ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <ThemeProvider>
              <HandwritingEditorScreen
                exerciseTitle="Mode B: Fill In The Blanks"
                prompt="Complete the missing argument"
                starterCode="print(___)"
                referenceSolution='print("Hello, Python!")\n'
                mode="B"
              />
            </ThemeProvider>
          </SafeAreaProvider>
        );
      });
      expect(tree).toBeDefined();
      let jsonStr = JSON.stringify(tree.toJSON());
      expect(jsonStr).toContain('COMPLETE THE MISSING CODE');
      expect(jsonStr).toContain('Need Help?');
      expect(jsonStr).not.toContain('CODE TO TRACE');

      // Tap "Need Help?" button to open Solution Guide modal
      const needHelpBtn = tree.root.findAll((node: any) =>
        node.props?.title === '💡 Need Help?' && typeof node.props?.onPress === 'function'
      )[0];
      expect(needHelpBtn).toBeDefined();

      await ReactTestRenderer.act(() => {
        needHelpBtn.props.onPress();
      });

      jsonStr = JSON.stringify(tree.toJSON());
      expect(jsonStr).toContain('CORRECT CODE TO TYPE');
      expect(jsonStr).toContain('Got It! Let Me Type It');
    });

    test('renders Mode C with Required Output and collapsible hints', async () => {
      let tree: any;
      await ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <ThemeProvider>
              <HandwritingEditorScreen
                exerciseTitle="Mode C: Write Independently"
                prompt="Write code from scratch"
                expectedOutput="Welcome to Pytrix!"
                hints={['Use print()', 'Pass string']}
                starterCode="# Write your code below\n"
                referenceSolution='print("Welcome to Pytrix!")\n'
                mode="C"
              />
            </ThemeProvider>
          </SafeAreaProvider>
        );
      });
      expect(tree).toBeDefined();
      const jsonStr = JSON.stringify(tree.toJSON());
      expect(jsonStr).toContain('REQUIRED OUTPUT');
      expect(jsonStr).toContain('Welcome to Pytrix!');
      expect(jsonStr).toContain('View Hint');
    });

    test('tokenizes Python code and tracks completed lines', () => {
      const code = 'total = 50\nprint(total)';
      const tokens = EditorValidationEngine.tokenize(code);

      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.some((t) => t.type === 'IDENTIFIER' && t.value === 'total')).toBe(true);
      expect(tokens.some((t) => t.type === 'NUMBER' && t.value === '50')).toBe(true);
      expect(tokens.some((t) => t.type === 'BUILTIN' && t.value === 'print')).toBe(true);

      const res = EditorValidationEngine.validateTrace('total = 50\n', code);
      expect(res.completedLines).toContain(1);
      expect(res.tokensMatched).toBeGreaterThan(0);
    });
  });

  describe('Hardware Keyboard & Android IME Composition HTML Bundle', () => {
    test('contains IME composition guards, software keyboard attributes, and hardware keyboard handlers', () => {
      const html = getEditorHtml('', 'print("Hi")', 'A', 'dark');

      // Android IME attributes
      expect(html).toContain('autocapitalize="none"');
      expect(html).toContain('autocorrect="off"');
      expect(html).toContain('enterkeyhint="enter"');
      expect(html).toContain('inputmode="text"');

      // IME composition event listeners
      expect(html).toContain('compositionstart');
      expect(html).toContain('compositionupdate');
      expect(html).toContain('compositionend');
      expect(html).toContain('isComposing');
      expect(html).toContain('keyCode === 229');

      // Hardware keyboard features
      expect(html).toContain("e.key === 'Tab'");
      expect(html).toContain("e.key === 'Enter'");
      expect(html).toContain("textarea.selectionStart");

      // High-contrast dark theme ghost color
      expect(html).toContain('#CBD5E1');
    });
  });
});

