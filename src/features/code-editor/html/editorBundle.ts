/**
 * Offline CodeMirror 6 Handwriting Copybook Editor HTML Bundle
 * Token-aware reference system with ghost tracing layer, syntax coloring,
 * hardware keyboard support, IME predictive composition guards (Gboard/Samsung),
 * and real-time line completion with zero network overhead.
 */

export function getEditorHtml(
  initialCode: string = '',
  referenceCode: string = '',
  mode: 'A' | 'B' | 'C' = 'A',
  theme: 'dark' | 'light' = 'dark'
): string {
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0F111A' : '#F8FAFC';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const ghostColor = isDark ? '#CBD5E1' : '#475569';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
      background-color: ${bgColor};
      color: ${textColor};
      font-family: 'Menlo', 'Consolas', 'Courier New', monospace;
      font-size: 16px;
      line-height: 24px;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }
    #editor-container {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: ${bgColor};
      overflow: hidden;
    }
    .editor-pane {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 16px;
      margin: 0;
      border: none;
      outline: none;
      box-sizing: border-box;
      font-family: 'Menlo', 'Consolas', 'Courier New', monospace;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: 0px;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
      tab-size: 4;
      overflow-y: auto;
      overflow-x: hidden;
    }
    #code-input {
      z-index: 1;
      background: transparent !important;
      background-color: transparent !important;
      -webkit-appearance: none !important;
      appearance: none !important;
      outline: none !important;
      border: none !important;
      color: transparent !important;
      -webkit-text-fill-color: transparent !important;
      caret-color: #FFD43B !important;
      resize: none;
    }
    #display-layer {
      z-index: 2;
      pointer-events: none;
      user-select: none;
      background: transparent !important;
      background-color: transparent !important;
      color: ${textColor};
    }
    .syntax-kw { color: #C678DD !important; font-weight: bold; }
    .syntax-fn { color: #61AFEF !important; font-weight: 600; }
    .syntax-str { color: #98C379 !important; }
    .syntax-num { color: #D19A66 !important; }
    .syntax-comment { color: #7F848E !important; font-style: italic; }
    .syntax-bracket { color: #E5C07B !important; }
    .syntax-op { color: #56B6C2 !important; }
    .syntax-colon { color: #E5C07B !important; font-weight: bold; }
    .syntax-ident { color: ${textColor} !important; }
    .syntax-plain { color: ${textColor} !important; }
    .syntax-ghost {
      color: ${ghostColor} !important;
      opacity: 0.88;
      font-weight: 500;
      text-decoration: underline dotted rgba(148, 163, 184, 0.45);
      text-underline-offset: 4px;
    }
    .syntax-err {
      color: #FFFFFF !important;
      -webkit-text-fill-color: #FFFFFF !important;
      background: rgba(239, 68, 68, 0.65) !important;
      border-bottom: 2px solid #EF4444;
      border-radius: 2px;
      font-weight: bold;
    }
    ::selection {
      background: rgba(255, 212, 59, 0.35);
    }
  </style>
</head>
<body>
  <div id="editor-container">
    <textarea
      id="code-input"
      class="editor-pane"
      spellcheck="false"
      autocapitalize="none"
      autocomplete="off"
      autocorrect="off"
      enterkeyhint="enter"
      inputmode="text"
      data-gramm="false"
      data-gramm_editor="false"
      data-enable-grammarly="false"
      placeholder=""
    ></textarea>
    <div id="display-layer" class="editor-pane"></div>
  </div>

  <script>
    (function() {
      var textarea = document.getElementById('code-input');
      var displayLayer = document.getElementById('display-layer');
      var currentMode = "${mode}";
      var referenceText = ${JSON.stringify(referenceCode)};
      var initialCode = currentMode === 'A' ? '' : ${JSON.stringify(initialCode)};
      var isComposing = false;

      textarea.value = initialCode;

      // Tap anywhere in container focuses textarea
      document.getElementById('editor-container').addEventListener('click', function() {
        textarea.focus();
      });

      // Synchronize scroll offsets between textarea and display layer
      function syncScroll() {
        displayLayer.scrollTop = textarea.scrollTop;
        displayLayer.scrollLeft = textarea.scrollLeft;
      }
      textarea.addEventListener('scroll', syncScroll);
      textarea.addEventListener('select', syncScroll);
      document.addEventListener('selectionchange', function() {
        if (document.activeElement === textarea) {
          syncScroll();
        }
      });

      var KEYWORDS = {
        'if':1, 'elif':1, 'else':1, 'for':1, 'while':1, 'def':1, 'return':1,
        'in':1, 'import':1, 'from':1, 'as':1, 'True':1, 'False':1, 'None':1,
        'and':1, 'or':1, 'not':1, 'is':1, 'pass':1, 'break':1, 'continue':1, 'class':1
      };
      var BUILTINS = {
        'print':1, 'len':1, 'range':1, 'int':1, 'str':1, 'float':1, 'bool':1,
        'input':1, 'type':1, 'list':1, 'dict':1, 'set':1, 'min':1, 'max':1, 'sum':1
      };

      function escapeHtml(str) {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }

      function tokenizePythonString(code) {
        var tokens = [];
        var i = 0, len = code.length;
        while (i < len) {
          var ch = code[i];
          if (ch === '"' || ch === "'") {
            var q = ch, s = q;
            i++;
            while (i < len && code[i] !== '\\n') {
              var c = code[i];
              s += c;
              i++;
              if (c === q && code[i-2] !== '\\\\') break;
            }
            tokens.push({ type: 'str', val: s });
            continue;
          }
          if (/[0-9]/.test(ch)) {
            var num = '';
            while (i < len && /[0-9.]/.test(code[i])) { num += code[i]; i++; }
            tokens.push({ type: 'num', val: num });
            continue;
          }
          if (/[a-zA-Z_]/.test(ch)) {
            var id = '';
            while (i < len && /[a-zA-Z0-9_]/.test(code[i])) { id += code[i]; i++; }
            var t = 'ident';
            if (KEYWORDS[id]) t = 'kw';
            else if (BUILTINS[id]) t = 'fn';
            tokens.push({ type: t, val: id });
            continue;
          }
          if (['(', ')', '[', ']', '{', '}'].indexOf(ch) !== -1) {
            tokens.push({ type: 'bracket', val: ch });
            i++;
            continue;
          }
          if (ch === ':') {
            tokens.push({ type: 'colon', val: ':' });
            i++;
            continue;
          }
          if (ch === '#') {
            var comm = '';
            while (i < len && code[i] !== '\\n') { comm += code[i]; i++; }
            tokens.push({ type: 'comment', val: comm });
            continue;
          }
          if (['+', '-', '*', '/', '=', '!', '<', '>', ','].indexOf(ch) !== -1) {
            tokens.push({ type: 'op', val: ch });
            i++;
            continue;
          }
          tokens.push({ type: 'plain', val: ch });
          i++;
        }
        return tokens;
      }

      function renderTokenizedHtml(code) {
        var tokens = tokenizePythonString(code);
        var html = '';
        for (var k = 0; k < tokens.length; k++) {
          var tk = tokens[k];
          if (tk.type === 'plain') {
            html += escapeHtml(tk.val);
          } else {
            html += '<span class="syntax-' + tk.type + '">' + escapeHtml(tk.val) + '</span>';
          }
        }
        return html;
      }

      function updateEditorDisplay() {
        var typed = textarea.value;
        var cleanRef = (referenceText || '').replace(/\\r\\n/g, '\\n').trimEnd();

        if (currentMode === 'A') {
          // Mode A: Token-Aware Copybook Tracing Layer
          var html = '';
          var minLen = Math.min(typed.length, cleanRef.length);

          var refTokens = tokenizePythonString(cleanRef);
          var charTokenTypes = [];
          for (var t = 0; t < refTokens.length; t++) {
            var tok = refTokens[t];
            for (var c = 0; c < tok.val.length; c++) {
              charTokenTypes.push(tok.type);
            }
          }

          for (var i = 0; i < minLen; i++) {
            var tCh = typed[i];
            var rCh = cleanRef[i];
            if (tCh === rCh) {
              var tType = charTokenTypes[i] || 'plain';
              if (tType === 'plain') {
                html += escapeHtml(tCh);
              } else {
                html += '<span class="syntax-' + tType + '">' + escapeHtml(tCh) + '</span>';
              }
            } else {
              // Mismatched character highlighted in red
              html += '<span class="syntax-err">' + escapeHtml(tCh) + '</span>';
            }
          }

          // Untyped reference characters remain clearly visible in light grey ghost style
          if (typed.length < cleanRef.length) {
            var remainingGhost = cleanRef.slice(typed.length);
            html += '<span class="syntax-ghost">' + escapeHtml(remainingGhost) + '</span>';
          }

          // Extra characters typed beyond reference length
          if (typed.length > cleanRef.length) {
            for (var j = cleanRef.length; j < typed.length; j++) {
              html += '<span class="syntax-err">' + escapeHtml(typed[j]) + '</span>';
            }
          }

          displayLayer.innerHTML = html;

        } else {
          // Mode B & Mode C
          displayLayer.innerHTML = renderTokenizedHtml(typed);
        }
      }

      function postToApp(type, payload) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: type,
            payload: payload
          }));
        }
      }

      // IME Composition Handlers for Android Software Keyboards (Gboard / Samsung)
      textarea.addEventListener('compositionstart', function() {
        isComposing = true;
      });

      textarea.addEventListener('compositionupdate', function() {
        updateEditorDisplay();
      });

      textarea.addEventListener('compositionend', function() {
        isComposing = false;
        updateEditorDisplay();
        postToApp('CODE_CHANGED', {
          code: textarea.value,
          mode: currentMode
        });
      });

      // Hardware and Software Keyboard Keydown Handler
      textarea.addEventListener('keydown', function(e) {
        // Skip shortcut overrides during active IME composition (Gboard / Samsung keyboard suggestions)
        if (isComposing || e.isComposing || e.keyCode === 229) {
          return;
        }

        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var val = textarea.value;

        // Auto-close pairs: ( -> (), [ -> [], { -> {}, " -> "", ' -> ''
        var pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
        var cleanRef = (referenceText || '').replace(/\\r\\n/g, '\\n').trimEnd();

        // Auto-close when appropriate
        if (pairs[e.key] && start === end) {
          var closeChar = pairs[e.key];
          var shouldAutoClose = currentMode !== 'A' || cleanRef[start + 1] === closeChar;

          if (shouldAutoClose) {
            e.preventDefault();
            textarea.value = val.substring(0, start) + e.key + closeChar + val.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 1;
            updateEditorDisplay();
            postToApp('CODE_CHANGED', { code: textarea.value, mode: currentMode });
            return;
          }
        }

        // Overtyping closing brackets or quotes
        var closers = [')', ']', '}', '"', "'"];
        if (closers.indexOf(e.key) !== -1 && start === end && val[start] === e.key) {
          e.preventDefault();
          textarea.selectionStart = textarea.selectionEnd = start + 1;
          return;
        }

        // Backspace pair deletion
        if (e.key === 'Backspace' && start === end && start > 0) {
          var prev = val[start - 1];
          var next = val[start];
          if (pairs[prev] && pairs[prev] === next) {
            e.preventDefault();
            textarea.value = val.substring(0, start - 1) + val.substring(start + 1);
            textarea.selectionStart = textarea.selectionEnd = start - 1;
            updateEditorDisplay();
            postToApp('CODE_CHANGED', { code: textarea.value, mode: currentMode });
            return;
          }
        }

        // Tab indentation (4 spaces) - supports Hardware Keyboards
        if (e.key === 'Tab') {
          e.preventDefault();
          textarea.value = val.substring(0, start) + '    ' + val.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 4;
          updateEditorDisplay();
          postToApp('CODE_CHANGED', { code: textarea.value, mode: currentMode });
          return;
        }

        // Smart Python Auto-Indentation on Enter (Mode B and Mode C)
        if (e.key === 'Enter' && currentMode !== 'A') {
          var lineStart = val.lastIndexOf('\\n', start - 1) + 1;
          var currentLine = val.substring(lineStart, start);
          var indentMatch = currentLine.match(/^[ ]*/);
          var currentIndent = indentMatch ? indentMatch[0] : '';
          var extraIndent = currentLine.trimEnd().endsWith(':') ? '    ' : '';
          var totalIndent = currentIndent + extraIndent;

          if (totalIndent.length > 0) {
            e.preventDefault();
            var insertText = '\\n' + totalIndent;
            textarea.value = val.substring(0, start) + insertText + val.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
            updateEditorDisplay();
            postToApp('CODE_CHANGED', { code: textarea.value, mode: currentMode });
            return;
          }
        }
      });

      // Standard input event (authoritative for typed text and clipboard operations)
      textarea.addEventListener('input', function() {
        if (!isComposing) {
          updateEditorDisplay();
          postToApp('CODE_CHANGED', {
            code: textarea.value,
            mode: currentMode
          });
        }
      });

      function handleIncoming(event) {
        try {
          var msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (msg.type === 'SET_CODE') {
            textarea.value = msg.code || '';
            updateEditorDisplay();
          } else if (msg.type === 'SET_REFERENCE') {
            referenceText = msg.reference || '';
            updateEditorDisplay();
          } else if (msg.type === 'SET_MODE') {
            currentMode = msg.mode;
            updateEditorDisplay();
          }
        } catch(e) {}
      }

      window.addEventListener('message', handleIncoming);
      document.addEventListener('message', handleIncoming);

      updateEditorDisplay();
      postToApp('EDITOR_READY', { mode: currentMode });
    })();
  </script>
</body>
</html>`;
}
