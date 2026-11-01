# 07 - Testing, Performance & Reliability Rules

**Project:** Pytrix — Python Learning Mobile Application  
**Document Type:** Mandatory QA, Testing, Performance Optimization & Reliability Rules  
**Scope:** Test suites (Unit, Integration, E2E, Regression), performance thresholds, resource management, and error handling.

---

## 1. Testing and Quality Assurance Rules

Testing is mandatory for every feature and fix.

### Unit Testing
Write focused unit tests covering:
- Pure utility and helper functions.
- Input and parameter validation.
- Progress calculation and unlocked state logic.
- Topic unlocking rules and prerequisite evaluation.
- Checkpoint 3-distinct-problem validation rules.
- Course content parsing, schema verification, and metadata loaders.
- Database repositories and query builders.
- Editor character, token, bracket, and indentation validation.
- Execution trace parsing and step-by-step state reducers.
- Exercise grading rules and AST evaluation.

### Integration Testing
Write integration tests covering:
- SQLite migrations, CRUD queries, and transactional updates.
- React Native to WebView bidirectional messaging bridge.
- Editor interaction and real-time validation engine.
- Pyodide engine initialization and readiness signaling.
- Python code execution, stdout/stderr capture, and interactive `input()`.
- Execution visualizer state transitions and variable tracking.
- Lesson reading to coding practice navigation flow.
- Checkpoint completion, transactional commits, and subsequent topic unlock.
- App restart progress restoration from SQLite.

### End-to-End Testing (User Journeys)
Verify complete end-to-end user workflows:
1. Fresh app install.
2. Launch app completely offline (airplane mode).
3. Open course catalog and start the first Python module.
4. Read introductory lesson content and code examples.
5. Answer knowledge-check questions.
6. Open the handwriting-inspired guided coding practice.
7. Type ghost reference code and receive live keystroke feedback.
8. Correct intentional typing errors and verify cursor stability.
9. Execute Python code and observe terminal output.
10. Step through line-by-line execution in the visualizer.
11. Solve independent coding challenges.
12. Pass all 3 distinct checkpoint problems.
13. Verify the next topic unlocks automatically.
14. Force close and restart the application.
15. Verify that progress, completed topics, and scores are accurately restored.

### Regression Testing Rules
1. **Mandatory Regression Tests:** Every resolved bug must include an automated regression test reproducing and preventing the issue.
2. **Zero Test Regressions:** All existing tests must pass before merging code.
3. **No Silent Breakages:** New feature implementations must not break older functional paths.
4. **Platform Verification:** Test Android and iOS execution independently.
5. **Screen Size Range:** Test on both low-dpi small screens and high-dpi large phones.
6. **Offline Mode:** Always test in airplane mode to guarantee zero network dependency.
7. **Interruption Testing:** Test during phone calls, notifications, screen lock, and app backgrounding.
8. **Lifecycle Resumption:** Test app restoration after OS kills background processes.
9. **Migration Scenarios:** Test database schema upgrade paths with legacy data fixtures.
10. **Clean vs. Upgrade:** Test both clean install and in-place application update scenarios.

> **Absolute Rule:** Never mark work complete while relevant tests are failing or skipped.

---

## 2. Error Handling and Reliability Rules

1. **Explicit Asynchronous Handling:** Every asynchronous operation (`async/await`, Promise) must have explicit `try/catch` or `.catch()` error handling.
2. **No Unhandled Rejections:** Never allow unhandled promise rejections.
3. **No Stuck Spinners:** Never leave loading indicators or spinners running indefinitely on failure.
4. **User-Friendly Error Messages:** Provide clear, friendly, and actionable error messages to the learner.
5. **Classify Errors Accurately:** Distinguish between user mistakes (typo, wrong answer) and application errors (database write failure, crash).
6. **Syntax vs. Runtime:** Clearly distinguish Python syntax errors from runtime exceptions.
7. **Initialization vs. Execution:** Distinguish Pyodide runtime initialization errors from code execution errors.
8. **Graceful Degraded States:** Handle missing assets or unavailable resources gracefully.
9. **Retry Mechanisms:** Provide an intuitive "Retry" button when recoverable operations fail.
10. **Prevent App Crashes:** Catch and isolate exceptions to prevent unhandled fatal app crashes.
11. **Lifecycle Resilience:** Handle unexpected backgrounding or app pauses during long-running tasks.
12. **Navigation Guards:** Guard navigation against invalid route parameters or race conditions.
13. **Database Fallbacks:** Handle SQLite lock contention and database errors safely.
14. **WebView Crash Recovery:** Detect and handle WebView crashes by offering a clean reload mechanism.
15. **Pyodide Recovery:** Catch WebAssembly crashes and provide an engine reload button.
16. **Execution Timeouts:** Abort runaway execution gracefully with a timeout warning.
17. **Diagnostic Logging:** Record useful diagnostic context in development builds without exposing sensitive data.
18. **No Raw Stack Traces to Learners:** Never display raw Java/Objective-C/JS stack traces to students.
19. **Preserve User Input:** Save unsaved user code drafts before displaying error states.
20. **Error Boundaries:** Use React Error Boundaries so that a crash in one screen does not take down the entire application.

---

## 3. Performance Optimization Rules

Performance must be empirically measured rather than assumed.

### Application Performance
1. **Cold Start Optimization:** Minimize application startup time to ensure fast launch on low-end phones.
2. **Lean Startup:** Avoid unnecessary initialization routines during the launch path.
3. **Lazy Loading:** Code-split and lazy-load non-critical screens and features.
4. **Keep JS Thread Free:** Avoid heavy synchronous computations on the JavaScript thread.
5. **FlatList Optimization:** Use `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, and `getItemLayout` where appropriate.
6. **Render Optimization:** Prevent unnecessary component re-renders using `React.memo`, `useCallback`, and `useMemo` when profiling shows measurable gains.
7. **Optimized Assets:** Compress images, strip metadata, and use webp/svg where applicable.
8. **Lightweight Animations:** Use native-driven transforms and opacity with Reanimated.
9. **Garbage Collection:** Avoid excessive allocations in high-frequency loops (e.g., editor typing).
10. **Resource Cleanup:** Unregister listeners, clear intervals, and discard unneeded objects promptly.
11. **Prevent Leaks:** Continuously monitor memory usage to detect retain cycles and leaks.
12. **Query Caching:** Avoid redundant SQL queries for static course curriculum.
13. **Cache Content:** Keep loaded lesson chapters in memory while active; evict when memory is low.
14. **Limit Trace Storage:** Avoid storing massive execution traces indefinitely in memory.
15. **Efficient Bridge Serialization:** Minimize payload sizes when communicating with the WebView.
16. **Debounced Editor Validation:** Debounce heavy AST validation passes while keeping typing feedback instant.
17. **Incremental Parsing:** Use incremental parsing techniques for large code files.
18. **Responsive Typing:** Maintain keystroke-to-screen response under 16 milliseconds.
19. **Benchmark Boot Times:** Track cold start and warm start metrics across development iterations.
20. **Test on Low-End Devices:** Regularly benchmark performance on low-memory Android hardware.

### Resource Management
- Avoid running background services when the app is suspended.
- Clear inactive timers and animation loops immediately.
- Clean up event subscriptions when components unmount.
- Cancel abandoned Python execution runs immediately.
- Release WebView resources when the editor screen is closed.
- Avoid loading unused Python standard libraries into Pyodide.
- Limit retained terminal output lines to prevent memory exhaustion.
- Avoid redundant deep copies of large course trees.

*Never introduce performance optimizations that compromise code maintainability or correctness without verified, measurable gains.*

