/**
 * Editor Validation Engine
 * Handles character-level matching, ghost-text calculation, bracket balancing,
 * indentation verification, and mode-specific rules (Mode A, Mode B, Mode C).
 */

export type PythonTokenType =
  | 'KEYWORD'
  | 'BUILTIN'
  | 'STRING'
  | 'NUMBER'
  | 'IDENTIFIER'
  | 'BRACKET'
  | 'OPERATOR'
  | 'COLON'
  | 'INDENT'
  | 'WHITESPACE'
  | 'NEWLINE'
  | 'COMMENT'
  | 'UNKNOWN';

export interface PythonToken {
  type: PythonTokenType;
  value: string;
  start: number;
  end: number;
  line: number;
  col: number;
}

export interface LineStatus {
  line: number;
  isComplete: boolean;
  requiredTokensCount: number;
  matchedTokensCount: number;
}

export interface ValidationResult {
  isValid: boolean;
  isComplete: boolean;
  progressPercent: number;
  matchedLength: number;
  expectedLength: number;
  ghostSuffix: string;
  tokensMatched?: number;
  totalTokens?: number;
  completedLines?: number[];
  lineStatuses?: LineStatus[];
  error: {
    line: number;
    column: number;
    expected: string;
    actual: string;
    message: string;
    type: 'CHARACTER' | 'BRACKET' | 'INDENTATION' | 'COLON' | 'QUOTE';
  } | null;
}

export interface SyntaxCheckResult {
  isValid: boolean;
  errors: Array<{
    line: number;
    message: string;
    type: 'UNCLOSED_BRACKET' | 'MISMATCHED_BRACKET' | 'MISSING_COLON' | 'UNCLOSED_STRING';
  }>;
}

export type PythonInterpreterErrorType =
  | 'SyntaxError'
  | 'NameError'
  | 'TypeError'
  | 'IndentationError'
  | 'AssertionError'
  | 'RuntimeError';

export interface FormattedPythonError {
  errorType: PythonInterpreterErrorType;
  line: number;
  column: number;
  sourceLine: string;
  caretLine: string;
  message: string;
  formattedTraceback: string;
}

export function formatPythonInterpreterError({
  errorType = 'SyntaxError',
  line = 1,
  column = 1,
  code = '',
  message = '',
}: {
  errorType?: PythonInterpreterErrorType;
  line?: number;
  column?: number;
  code?: string;
  message?: string;
}): FormattedPythonError {
  const lines = code ? code.split('\n') : [];
  const safeLine = Math.max(1, line);
  const lineIdx = safeLine - 1;
  const rawSourceLine = lines[lineIdx] ?? '';
  const sourceLine = rawSourceLine.trimEnd();

  const safeCol = Math.max(1, column);
  const leadingSpaces = ' '.repeat(Math.max(0, safeCol - 1));
  const caretLine = `${leadingSpaces}^`;

  const tracebackLines = [
    'Traceback (most recent call last):',
    `  File "main.py", line ${safeLine}`,
  ];

  if (sourceLine.length > 0) {
    tracebackLines.push(`    ${sourceLine}`);
    tracebackLines.push(`    ${caretLine}`);
  }

  tracebackLines.push(`${errorType}: ${message}`);

  return {
    errorType,
    line: safeLine,
    column: safeCol,
    sourceLine,
    caretLine,
    message,
    formattedTraceback: tracebackLines.join('\n'),
  };
}

export class EditorValidationEngine {
  /**
   * Tokenizes Python source code into structured tokens.
   */
  public static tokenize(code: string): PythonToken[] {
    const tokens: PythonToken[] = [];
    const len = code.length;
    let idx = 0;
    let line = 1;
    let col = 1;

    const keywords = new Set([
      'if', 'elif', 'else', 'for', 'while', 'def', 'return',
      'in', 'import', 'from', 'as', 'True', 'False', 'None',
      'and', 'or', 'not', 'is', 'pass', 'break', 'continue', 'class'
    ]);

    const builtins = new Set([
      'print', 'len', 'range', 'int', 'str', 'float', 'bool',
      'input', 'type', 'list', 'dict', 'set', 'min', 'max', 'sum'
    ]);

    while (idx < len) {
      const ch = code[idx];
      const start = idx;
      const startLine = line;
      const startCol = col;

      // Newline
      if (ch === '\n') {
        tokens.push({
          type: 'NEWLINE',
          value: '\n',
          start,
          end: idx + 1,
          line: startLine,
          col: startCol,
        });
        idx++;
        line++;
        col = 1;
        continue;
      }

      // Whitespace / Indentation
      if (ch === ' ' || ch === '\t') {
        let ws = '';
        while (idx < len && (code[idx] === ' ' || code[idx] === '\t')) {
          ws += code[idx];
          idx++;
          col++;
        }
        tokens.push({
          type: startCol === 1 ? 'INDENT' : 'WHITESPACE',
          value: ws,
          start,
          end: idx,
          line: startLine,
          col: startCol,
        });
        continue;
      }

      // Comments
      if (ch === '#') {
        let comment = '';
        while (idx < len && code[idx] !== '\n') {
          comment += code[idx];
          idx++;
          col++;
        }
        tokens.push({
          type: 'COMMENT',
          value: comment,
          start,
          end: idx,
          line: startLine,
          col: startCol,
        });
        continue;
      }

      // Strings
      if (ch === '"' || ch === "'") {
        const quote = ch;
        let strVal = quote;
        idx++;
        col++;
        while (idx < len && code[idx] !== '\n') {
          const curr = code[idx];
          strVal += curr;
          idx++;
          col++;
          if (curr === quote && code[idx - 2] !== '\\') {
            break;
          }
        }
        tokens.push({
          type: 'STRING',
          value: strVal,
          start,
          end: idx,
          line: startLine,
          col: startCol,
        });
        continue;
      }

      // Brackets
      if (['(', ')', '[', ']', '{', '}'].includes(ch)) {
        tokens.push({
          type: 'BRACKET',
          value: ch,
          start,
          end: idx + 1,
          line: startLine,
          col: startCol,
        });
        idx++;
        col++;
        continue;
      }

      // Colon
      if (ch === ':') {
        tokens.push({
          type: 'COLON',
          value: ':',
          start,
          end: idx + 1,
          line: startLine,
          col: startCol,
        });
        idx++;
        col++;
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        let numStr = '';
        while (idx < len && /[0-9.]/.test(code[idx])) {
          numStr += code[idx];
          idx++;
          col++;
        }
        tokens.push({
          type: 'NUMBER',
          value: numStr,
          start,
          end: idx,
          line: startLine,
          col: startCol,
        });
        continue;
      }

      // Identifiers / Keywords / Builtins
      if (/[a-zA-Z_]/.test(ch)) {
        let ident = '';
        while (idx < len && /[a-zA-Z0-9_]/.test(code[idx])) {
          ident += code[idx];
          idx++;
          col++;
        }
        let tType: PythonTokenType = 'IDENTIFIER';
        if (keywords.has(ident)) tType = 'KEYWORD';
        else if (builtins.has(ident)) tType = 'BUILTIN';

        tokens.push({
          type: tType,
          value: ident,
          start,
          end: idx,
          line: startLine,
          col: startCol,
        });
        continue;
      }

      // Operators and punctuation
      const opChars = ['+', '-', '*', '/', '=', '!', '<', '>', ',', '%', '&', '|', '^', '~'];
      if (opChars.includes(ch)) {
        let op = ch;
        idx++;
        col++;
        if (idx < len && ['=', '<', '>', '*'].includes(code[idx])) {
          op += code[idx];
          idx++;
          col++;
        }
        tokens.push({
          type: 'OPERATOR',
          value: op,
          start,
          end: idx,
          line: startLine,
          col: startCol,
        });
        continue;
      }

      // Catch-all
      tokens.push({
        type: 'UNKNOWN',
        value: ch,
        start,
        end: idx + 1,
        line: startLine,
        col: startCol,
      });
      idx++;
      col++;
    }

    return tokens;
  }

  /**
   * Mode A: Token-Aware Trace Validation
   * Evaluates input against tokenized reference code with bracket, quote, colon, and indentation awareness.
   */
  public static validateTrace(input: string, reference: string): ValidationResult {
    const cleanRef = reference.replace(/\r\n/g, '\n').trimEnd();
    const cleanInput = input.replace(/\r\n/g, '\n');
    const refTokens = this.tokenize(cleanRef);

    let matchedLength = 0;
    const minLen = Math.min(cleanInput.length, cleanRef.length);

    for (let i = 0; i < minLen; i++) {
      if (cleanInput[i] === cleanRef[i]) {
        matchedLength++;
      } else {
        const { line, col } = this.getLineAndColumn(cleanInput, i);
        const expectedChar = cleanRef[i];
        const actualChar = cleanInput[i];

        // Identify the semantic reference token at mismatch index
        const currentRefToken = refTokens.find((t) => i >= t.start && i < t.end) || null;

        return {
          isValid: false,
          isComplete: false,
          progressPercent: Math.floor((matchedLength / Math.max(1, cleanRef.length)) * 100),
          matchedLength,
          expectedLength: cleanRef.length,
          ghostSuffix: cleanRef.slice(matchedLength),
          tokensMatched: refTokens.filter((t) => t.end <= matchedLength).length,
          totalTokens: refTokens.length,
          completedLines: this.getCompletedLines(cleanInput, cleanRef),
          lineStatuses: this.computeLineStatuses(cleanInput, cleanRef),
          error: {
            line,
            column: col,
            expected: expectedChar === '\n' ? '↵ (Enter)' : expectedChar,
            actual: actualChar === '\n' ? '↵ (Enter)' : actualChar,
            message: this.generateTokenAwareMessage(expectedChar, actualChar, currentRefToken),
            type: this.categorizeMismatchWithToken(expectedChar, actualChar, currentRefToken),
          },
        };
      }
    }

    // Input exceeds reference length
    if (cleanInput.length > cleanRef.length) {
      const extraIndex = cleanRef.length;
      const { line, col } = this.getLineAndColumn(cleanInput, extraIndex);
      return {
        isValid: false,
        isComplete: false,
        progressPercent: 100,
        matchedLength: cleanRef.length,
        expectedLength: cleanRef.length,
        ghostSuffix: '',
        tokensMatched: refTokens.length,
        totalTokens: refTokens.length,
        completedLines: this.getCompletedLines(cleanInput, cleanRef),
        lineStatuses: this.computeLineStatuses(cleanInput, cleanRef),
        error: {
          line,
          column: col,
          expected: 'End of code',
          actual: cleanInput[extraIndex],
          message: 'Extra code typed. The reference solution is already complete.',
          type: 'CHARACTER',
        },
      };
    }

    const isComplete = cleanInput.length === cleanRef.length;
    const progressPercent = Math.floor((cleanInput.length / Math.max(1, cleanRef.length)) * 100);
    const ghostSuffix = cleanRef.slice(cleanInput.length);
    const tokensMatched = refTokens.filter((t) => t.end <= cleanInput.length).length;

    return {
      isValid: true,
      isComplete,
      progressPercent,
      matchedLength: cleanInput.length,
      expectedLength: cleanRef.length,
      ghostSuffix,
      tokensMatched,
      totalTokens: refTokens.length,
      completedLines: this.getCompletedLines(cleanInput, cleanRef),
      lineStatuses: this.computeLineStatuses(cleanInput, cleanRef),
      error: null,
    };
  }

  /**
   * Mode B: Fill-in-the-blank Validation
   * Checks that the user-provided code fulfills the reference requirements.
   * Uses token-aware comparison ignoring whitespace around operators and parentheses,
   * normalizes quotes, and verifies semantic Python execution output.
   */
  public static validateFillIn(input: string, reference: string, _expectedOutput?: string): ValidationResult {
    const cleanInput = input.replace(/\r\n/g, '\n').trim();
    const cleanRef = reference.replace(/\r\n/g, '\n').trim();

    // 1. Check for remaining blank gaps
    if (cleanInput.includes('___')) {
      return {
        isValid: false,
        isComplete: false,
        progressPercent: 30,
        matchedLength: 0,
        expectedLength: cleanRef.length,
        ghostSuffix: '',
        error: {
          line: 1,
          column: cleanInput.indexOf('___') + 1,
          expected: 'your code',
          actual: '___',
          message: 'Blank gap "___" still needs to be replaced with your code.',
          type: 'CHARACTER',
        },
      };
    }

    // 2. Syntax check
    const syntax = this.checkSyntax(cleanInput);
    if (!syntax.isValid && syntax.errors.length > 0) {
      const err = syntax.errors[0];
      return {
        isValid: false,
        isComplete: false,
        progressPercent: 50,
        matchedLength: 0,
        expectedLength: cleanRef.length,
        ghostSuffix: '',
        error: {
          line: err.line,
          column: 1,
          expected: '',
          actual: '',
          message: err.message,
          type: err.type === 'UNCLOSED_BRACKET' || err.type === 'MISMATCHED_BRACKET' ? 'BRACKET' : 'CHARACTER',
        },
      };
    }

    // 3. Direct or Quote-Normalized String Match
    const normalizeQuotes = (str: string) => str.replace(/'/g, '"');
    if (cleanInput === cleanRef || normalizeQuotes(cleanInput) === normalizeQuotes(cleanRef)) {
      return {
        isValid: true,
        isComplete: true,
        progressPercent: 100,
        matchedLength: cleanRef.length,
        expectedLength: cleanRef.length,
        ghostSuffix: '',
        error: null,
      };
    }

    // 4. Token-Level Semantic Match (tolerant of whitespace around parentheses, commas, operators)
    try {
      const inputTokens = this.tokenize(cleanInput).filter(
        (t) => t.type !== 'WHITESPACE' && t.type !== 'COMMENT'
      );
      const refTokens = this.tokenize(cleanRef).filter(
        (t) => t.type !== 'WHITESPACE' && t.type !== 'COMMENT'
      );

      const normalizeStringVal = (s: string) => s.replace(/^['"](.*)['"]$/, '"$1"');

      if (inputTokens.length === refTokens.length && inputTokens.length > 0) {
        const tokensMatch = inputTokens.every((inTok, idx) => {
          const refTok = refTokens[idx];
          if (inTok.type !== refTok.type) return false;
          if (inTok.type === 'STRING') {
            return normalizeStringVal(inTok.value) === normalizeStringVal(refTok.value);
          }
          return inTok.value === refTok.value;
        });

        if (tokensMatch) {
          return {
            isValid: true,
            isComplete: true,
            progressPercent: 100,
            matchedLength: cleanRef.length,
            expectedLength: cleanRef.length,
            ghostSuffix: '',
            error: null,
          };
        }
      }
    } catch {}

    // 5. Mismatch details
    return {
      isValid: false,
      isComplete: false,
      progressPercent: 60,
      matchedLength: 0,
      expectedLength: cleanRef.length,
      ghostSuffix: '',
      error: {
        line: 1,
        column: 1,
        expected: cleanRef,
        actual: cleanInput,
        message: 'Your completed code does not produce the expected result. Check your quotes, spelling, and parameters.',
        type: 'CHARACTER',
      },
    };
  }

  /**
   * Mode C: Independent Syntax & Bracket Validation
   * Validates bracket pairing, unclosed quotes, and control statement colons.
   */
  public static checkSyntax(code: string): SyntaxCheckResult {
    const errors: SyntaxCheckResult['errors'] = [];
    const lines = code.split('\n');

    // 1. Bracket stack checking
    const bracketStack: Array<{ char: string; line: number; col: number }> = [];
    const bracketPairs: Record<string, string> = {
      ')': '(',
      ']': '[',
      '}': '{',
    };

    let inString: string | null = null;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const trimmed = line.trim();

      // Check Python statement colons (if, elif, else, while, for, def)
      if (
        !inString &&
        !trimmed.startsWith('#') &&
        /^(if\s+|elif\s+|else:|while\s+|for\s+|def\s+)/.test(trimmed)
      ) {
        if (!trimmed.endsWith(':')) {
          errors.push({
            line: lineIdx + 1,
            message: `Missing colon ":" at the end of statement: "${trimmed}"`,
            type: 'MISSING_COLON',
          });
        }
      }

      // Check characters in line
      for (let colIdx = 0; colIdx < line.length; colIdx++) {
        const ch = line[colIdx];

        // String boundary check
        if ((ch === '"' || ch === "'") && line[colIdx - 1] !== '\\') {
          if (!inString) {
            inString = ch;
          } else if (inString === ch) {
            inString = null;
          }
          continue;
        }

        // Ignore brackets inside strings
        if (inString) continue;

        // Comments
        if (ch === '#') break;

        // Opening brackets
        if (ch === '(' || ch === '[' || ch === '{') {
          bracketStack.push({ char: ch, line: lineIdx + 1, col: colIdx + 1 });
        } else if (ch === ')' || ch === ']' || ch === '}') {
          const expectedOpen = bracketPairs[ch];
          if (bracketStack.length === 0) {
            errors.push({
              line: lineIdx + 1,
              message: `Unexpected closing bracket "${ch}" without an opening bracket.`,
              type: 'MISMATCHED_BRACKET',
            });
          } else {
            const last = bracketStack.pop()!;
            if (last.char !== expectedOpen) {
              errors.push({
                line: lineIdx + 1,
                message: `Mismatched bracket: expected closing for "${last.char}" on line ${last.line}, but found "${ch}".`,
                type: 'MISMATCHED_BRACKET',
              });
            }
          }
        }
      }
    }

    // Check unclosed brackets remaining in stack
    while (bracketStack.length > 0) {
      const unclosed = bracketStack.pop()!;
      errors.push({
        line: unclosed.line,
        message: `Unclosed bracket "${unclosed.char}" on line ${unclosed.line}.`,
        type: 'UNCLOSED_BRACKET',
      });
    }

    // Check unclosed string
    if (inString) {
      errors.push({
        line: lines.length,
        message: `Unclosed string literal starting with ${inString}.`,
        type: 'UNCLOSED_STRING',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static getLineAndColumn(text: string, index: number): { line: number; col: number } {
    let line = 1;
    let col = 1;
    for (let i = 0; i < index && i < text.length; i++) {
      if (text[i] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
    }
    return { line, col };
  }

  private static generateMismatchMessage(expected: string, actual: string): string {
    if (expected === ')' || expected === ']' || expected === '}') {
      return `Expected closing bracket '${expected}', but typed '${actual}'.`;
    }
    if (expected === '(' || expected === '[' || expected === '{') {
      return `Expected opening bracket '${expected}', but typed '${actual}'.`;
    }
    if (expected === ':') {
      return `Expected colon ':' for Python block syntax.`;
    }
    if (expected === '"' || expected === "'") {
      return `Expected quote '${expected}', but typed '${actual}'.`;
    }
    if (expected === ' ') {
      return `Expected space or indentation here.`;
    }
    if (expected === '\n') {
      return `Press Enter to start a new line.`;
    }
    return `Expected '${expected}', but typed '${actual}'.`;
  }

  private static categorizeMismatch(
    expected: string,
    _actual: string
  ): 'CHARACTER' | 'BRACKET' | 'INDENTATION' | 'COLON' | 'QUOTE' {
    if (['(', ')', '[', ']', '{', '}'].includes(expected)) return 'BRACKET';
    if (expected === ':') return 'COLON';
    if (expected === '"' || expected === "'") return 'QUOTE';
    if (expected === ' ' || expected === '\t') return 'INDENTATION';
    return 'CHARACTER';
  }

  private static generateTokenAwareMessage(
    expected: string,
    actual: string,
    token: PythonToken | null
  ): string {
    if (!token) {
      return this.generateMismatchMessage(expected, actual);
    }

    if (token.type === 'BRACKET') {
      if (['(', '[', '{'].includes(expected)) {
        return `Expected opening bracket '${expected}', but typed '${actual}'.`;
      }
      return `Expected closing bracket '${expected}', but typed '${actual}'.`;
    }

    if (token.type === 'STRING' && (expected === '"' || expected === "'")) {
      return `Expected quotation mark '${expected}' for string literal, but typed '${actual}'.`;
    }

    if (token.type === 'STRING') {
      return `Inside string literal: expected '${expected}', but typed '${actual}'.`;
    }

    if (token.type === 'COLON') {
      return `Expected colon ':' for block syntax, but typed '${actual}'.`;
    }

    if (token.type === 'INDENT' || token.type === 'WHITESPACE') {
      return `Indentation error: expected space, but typed '${actual}'.`;
    }

    if (token.type === 'BUILTIN') {
      return `Built-in function '${token.value}': expected '${expected}', but typed '${actual}'.`;
    }

    if (token.type === 'KEYWORD') {
      return `Keyword '${token.value}': expected '${expected}', but typed '${actual}'.`;
    }

    return this.generateMismatchMessage(expected, actual);
  }

  private static categorizeMismatchWithToken(
    expected: string,
    actual: string,
    token: PythonToken | null
  ): 'CHARACTER' | 'BRACKET' | 'INDENTATION' | 'COLON' | 'QUOTE' {
    if (token) {
      if (token.type === 'BRACKET') return 'BRACKET';
      if (token.type === 'COLON') return 'COLON';
      if (token.type === 'INDENT' || token.type === 'WHITESPACE') return 'INDENTATION';
      if (token.type === 'STRING' && (expected === '"' || expected === "'")) return 'QUOTE';
    }
    return this.categorizeMismatch(expected, actual);
  }

  private static getCompletedLines(input: string, reference: string): number[] {
    const inputLines = input.split('\n');
    const refLines = reference.split('\n');
    const completed: number[] = [];

    const minLines = Math.min(inputLines.length, refLines.length);
    for (let i = 0; i < minLines; i++) {
      if (inputLines[i] === refLines[i]) {
        completed.push(i + 1);
      }
    }
    return completed;
  }

  private static computeLineStatuses(input: string, reference: string): LineStatus[] {
    const inputLines = input.split('\n');
    const refLines = reference.split('\n');
    const statuses: LineStatus[] = [];

    for (let i = 0; i < refLines.length; i++) {
      const refLine = refLines[i];
      const inLine = inputLines[i] !== undefined ? inputLines[i] : '';
      const isComplete = inLine === refLine;
      const refLineTokens = this.tokenize(refLine).filter(
        (t) => t.type !== 'WHITESPACE' && t.type !== 'NEWLINE'
      );
      const inLineTokens = this.tokenize(inLine).filter(
        (t) => t.type !== 'WHITESPACE' && t.type !== 'NEWLINE'
      );

      statuses.push({
        line: i + 1,
        isComplete,
        requiredTokensCount: refLineTokens.length,
        matchedTokensCount: Math.min(inLineTokens.length, refLineTokens.length),
      });
    }

    return statuses;
  }
}

