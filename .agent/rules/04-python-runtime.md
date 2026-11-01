# 04 - Python Runtime, Editor & Execution Visualizer Rules

**Project:** Pytrix — Python Learning Mobile Application  
**Document Type:** Mandatory Code Editor, Pyodide Execution, Visualizer & Security Rules  
**Scope:** Embedded CodeMirror 6, offline Pyodide runtime, line trace visualizer, and execution sandboxing.

---

## 1. Handwriting-Inspired Code Editor Rules

The guided coding editor is a core product differentiator and must be engineered as an independent subsystem.

### Reference Code System
1. **Separation of Reference & Input:** Maintain the reference code model strictly separated from learner input.
2. **Immutable Reference:** Never overwrite, mutate, or truncate the original reference solution.
3. **Faded Reference Layer:** Display reference characters in a faded visual ghost state beneath or ahead of the learner's typing.
4. **Active Syntax Highlighting:** Display correctly typed characters using normal syntax highlighting tokens.
5. **Indentation Preservation:** Preserve correct Python indentation levels automatically.
6. **Whitespace Handling:** Correctly handle spaces, tabs, and newline characters without misaligning the ghost reference.
7. **Empty Lines:** Gracefully support empty lines and multiline spacing.
8. **Multiline Strings:** Accurately parse and match triple-quoted multiline strings.
9. **Bracket Balancing:** Gracefully manage nested brackets, parentheses, and braces `()`, `[]`, `{}`.
10. **Quotation Matching:** Handle single and double quotation marks accurately.
11. **Python Indentation Semantics:** Respect Python block colons `:` and indentation blocks.
12. **Missing Character Detection:** Detect and highlight missing characters immediately.
13. **Unexpected Character Detection:** Flag unexpected or erroneous characters with clear visual cues.
14. **Character Order Verification:** Detect incorrect character sequences instantly.
15. **Contextual Typing Feedback:** Provide meaningful feedback explaining typing mistakes without frustrating the learner.
16. **Cursor Stability:** Preserve accurate cursor positioning during on-the-fly validation.
17. **No Unprompted Cursor Jumps:** Never unexpectedly jump or reset the cursor position while the learner types.
18. **Support Deletion:** Full support for Backspace, Delete, and multi-character text corrections.
19. **Support Selection:** Full support for cursor movement, selection highlighting, and cut/copy operations.
20. **Paste Handling by Mode:** Restrict or validate paste operations according to the active learning mode (e.g., disabled in transcription mode).
21. **Optimized Typing Render:** Prevent full component re-rendering during keystrokes; keep keystroke latency under 16ms.
22. **Decoupled Editor State:** Keep internal editor state independent from navigation parameters.
23. **Persist Drafts:** Persist unfinished coding exercises to SQLite so no learner effort is lost.
24. **Restore Editor State:** Restore editor cursor, scroll position, and typed code when reopening an exercise.

### Validation Layers & Modes
Implement independent validation layers:
- **Character-Level Matching:** Immediate keystroke-by-keystroke accuracy.
- **Token-Level Matching:** Keyword, identifier, operator, and literal verification.
- **Syntax Validation:** AST parsing to detect Python syntax errors.
- **Indentation Validation:** Tab/space consistency and block alignment.
- **Bracket Matching:** Paired closure check.
- **Reference Solution Comparison:** Canonical structural comparison.
- **Execution-Based Correctness:** Runtime input/output and behavior test suite execution.

> **Crucial Distinction:** Never confuse a learner's typing mistake with a Python interpreter syntax error. Do not use simple string equality as the only validation mechanism.

#### Practice Modes
- **MODE A (Complete Code Transcription):** Guided muscle-memory typing over a full ghost reference template.
- **MODE B (Missing-Code Completion):** Fill-in-the-blank code completion with syntax-checked slots.
- **MODE C (Guided Coding with Hints):** Step-by-step problem solving with revealed hints and scaffolding.
- **MODE D (Independent Coding):** Blank canvas problem solving evaluated purely via test cases and AST checks.

---

## 2. Offline Python Execution Engine Rules

The offline Python interpreter (Pyodide in WebView) is a critical core dependency.

1. **Strictly Offline:** Python execution MUST work 100% without internet access.
2. **Bundled Runtime:** Bundle all Pyodide WebAssembly binaries, standard libraries, and runtime scripts directly in the app bundle.
3. **No CDN Dependency:** Never rely on an external CDN for interpreter binaries, scripts, or core execution dependencies.
4. **Pinned Runtime Version:** Pin the Pyodide runtime version deterministically in source control.
5. **Document Runtime Capabilities:** Document the exact runtime version, standard libraries included, and unsupported packages.
6. **Isolated Engine:** Keep the execution engine completely isolated from the React Native UI layer.
7. **Controlled Messaging Bridge:** All communication between React Native and WebView must pass through a validated, typed messaging protocol.
8. **Validate Bridge Messages:** Enforce schema validation on both outgoing commands and incoming execution messages.
9. **Graceful Initialization:** Handle WebAssembly or interpreter initialization failures with clear diagnostic UI.
10. **Initialization Progress:** Display a clear loading/initialization progress indicator during cold boot.
11. **No Redundant Inits:** Avoid re-initializing the Python interpreter on every screen render or navigation transition.
12. **Runtime Reusability:** Reuse the warm interpreter instance across exercises while safely resetting execution scope.
13. **Environment Reset:** Support clearing variables, modules, and user state between runs (`reset_environment()`).
14. **Capture stdout:** Capture all standard output streams accurately in real time.
15. **Capture stderr:** Capture standard error streams, tracebacks, and warnings accurately.
16. **Interactive `input()`:** Support Python's `input()` function interactively via a coordinated bridge request/response dialog.
17. **Syntax Error Handling:** Parse and display syntax errors with line and column highlighting.
18. **Runtime Error Handling:** Catch and display runtime exceptions with user-friendly explanations.
19. **Infinite Loop Protection:** Enforce execution timeouts (e.g., 5-10 seconds) to prevent infinite loops from hanging the app.
20. **Resource Limits:** Enforce memory and execution step limits to safeguard low-end devices.
21. **Network Isolation:** Disable or block network calls inside learner Python scripts.
22. **Defense in Depth:** Never assume WebAssembly alone provides sufficient sandboxing; restrict bridge interfaces.
23. **Protect App Internals:** Untrusted learner code must never access mobile filesystem, storage, or React Native bridge internals.
24. **Execution Cancellation:** Provide a responsive "Stop / Cancel" button to abort running executions immediately.
25. **Concurrency Control:** Prevent concurrent execution runs; queue or reject new executions while a script is running.
26. **Responsive UI:** Maintain 60 FPS UI responsiveness while Python code executes in the background WebView thread.
27. **Output Throttling:** Limit total captured output characters (e.g., max 10,000 characters) to prevent memory exhaustion from runaway `print()` loops.
28. **Graceful Package Errors:** Display helpful messages if learner code attempts to import unsupported external packages.
29. **Cross-Platform Verification:** Test Pyodide performance and compatibility on both Android (various API levels) and iOS.
30. **Clean Install Availability:** Verify that runtime assets are fully functional immediately after a fresh, clean install without network connectivity.
31. **Airplane Mode Verification:** Explicitly test code execution in airplane mode to guarantee zero network leakage.
32. **No Native `eval()`:** Never execute Python or JavaScript code through `eval()` or `Function()` in the React Native application thread.
33. **Trusted vs. Untrusted Separation:** Maintain a strict physical boundary between trusted application logic and untrusted student code.

---

## 3. Line-by-Line Execution Visualizer Rules

1. **Authentic Execution:** The visualizer must reflect real, actual Python execution events.
2. **No Fabricated Traces:** Never fabricate, mock, or fake execution lines, variables, or outputs.
3. **Trace Hooks:** Capture genuine line execution events using Python's tracing mechanisms (e.g., `sys.settrace()`).
4. **Local Variable Snapshots:** Record the state of local and global variables at each execution step.
5. **Active Line Highlighting:** Distinctly highlight the currently executing source line.
6. **Executed vs. Unexecuted:** Visually distinguish executed paths from unexecuted branches (e.g., untouched `else` blocks).
7. **Assignment Inspection:** Clearly explain variable assignments (`x = 5 -> x is now 5`).
8. **Arithmetic Inspection:** Explain arithmetic evaluations and state mutations step by step.
9. **Branching Decisions:** Explicitly explain condition evaluations (`if x > 3 -> True, branching inside`).
10. **Loop Iterations:** Track and display loop iteration counters, loop variable updates, and exit conditions.
11. **Call Stack Tracking:** Visualize function calls, argument passing, return values, and call stack depth.
12. **Synchronized Output:** Show `print()` output appearing synchronously with the line that generated it.
13. **Runtime Error Markers:** Pinpoint runtime exceptions directly onto the offending line with explanatory diagnostics.
14. **Deterministic Order:** Preserve chronological execution order throughout the step trace.
15. **No Per-Step Re-execution:** Capture the full trace in a single run; do not re-run the entire script for each visualizer step.
16. **Silent Line Clarification:** Clearly explain lines that perform operations without visible console output (e.g., allocations).
17. **Context Depth:** Support nested blocks, list comprehensions, and nested function scopes.
18. **Loop Trace Compression:** Support looping traces smoothly without freezing the UI.
19. **Recursion Handling:** Handle recursive function calls cleanly with visual stack frames.
20. **Trace Size Limits:** Enforce maximum trace steps (e.g., 500 steps) to prevent memory crashes on large loops.
21. **Visualizer Controls:** Provide intuitive controls: Step Forward, Step Backward, Play / Autoplay, Pause, and Reset.
22. **State Synchronization:** Keep the visualizer scrubber, editor line highlight, and variable table 100% in sync at all times.
23. **Interpreter Fidelity:** Never compromise or alter interpreter execution semantics merely to simplify an animation.

---

## 4. Security Rules

1. **No Hardcoded Secrets:** Never hardcode API keys, passwords, or private credentials in source code.
2. **No Committed Secrets:** Never commit `.env` files, keystores, or private certificates to version control.
3. **Input Validation:** Validate all input received from UI controls and external files before processing.
4. **Untrusted Code Policy:** Treat all learner Python code as untrusted, hostile input.
5. **Execution Sandboxing:** Isolate execution inside the WebView without access to host device APIs.
6. **Restrict Filesystem Access:** Prevent learner code from reading or writing host mobile filesystem directories.
7. **Restrict Network Access:** Block network sockets, `urllib`, `requests`, and outbound HTTP requests in learner scripts.
8. **Bridge Message Verification:** Validate WebView message origins, command types, and payloads against strict schemas.
9. **No Unsafe HTML:** Avoid `dangerouslySetInnerHTML` or unsanitized HTML injections inside the WebView or UI.
10. **No Exposed Native Bridges:** Never expose native Android/iOS bridge modules directly to the WebView context.
11. **Secure Storage:** Use encrypted storage (e.g., Keychain/Keystore) if sensitive credentials ever become necessary.
12. **Secure Defaults:** Configure all libraries and parsers with secure default settings.
13. **Minimal Permissions:** Request only essential Android/iOS permissions in application manifests.
14. **Dependency Auditing:** Regularly audit dependencies for known security vulnerabilities via security scanners.
15. **No Dynamic Remote Code:** Never download and execute unverified remote executable code or scripts.
16. **DoS Prevention:** Guard against CPU exhaustion and runaway execution through hard timeouts.
17. **Output Truncation:** Limit stdout/stderr buffer sizes to prevent memory flooding.
18. **Safe Database Ingestion:** Validate database rows thoroughly to protect against malformed or injected data.
19. **Sanitized Error Logs:** Never expose raw internal system exceptions or sensitive environment details in learner UI.
20. **Immutable Core Assets:** Mark bundled Pyodide and course content assets as read-only.

