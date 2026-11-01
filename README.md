# Pytrix — Mobile App for Learning Basic Python

> **Offline-first, handwriting-inspired mobile application for mastering basic Python with line-by-line execution visualizers and 3-problem checkpoints.**

---

## 🌟 Key Product Innovations

1. **✍️ Handwriting-Inspired Copybook Editor:**
   - Analogous to calligraphy dotted-line copybooks: beginner students see reference code rendered as a faded gray ghost layer (`#555A70`).
   - As characters are typed correctly on the keyboard, code transforms into vibrant, syntax-highlighted tokens.
   - Detects character order, bracket mismatches (`print[` vs `print(`), quote errors, and indentation issues in real time.
   - Offers **Mode A (Trace the Code)**, **Mode B (Fill in Missing Code)**, and **Mode C (Independent Coding)**.

2. **🔍 Line-by-Line Python Execution Visualizer:**
   - Steppable execution controller: `|◁ Reset`, `◀ Prev`, `▷ Play / ⏸ Pause`, `Next ▶`.
   - Real-time `sys.settrace()` frame capture: highlights the actively running line with a pointer `▶`.
   - Live Memory Inspector displaying variable names, data types (`int`, `str`, `float`), and value changes.
   - Live synchronized terminal console output reflecting text printed up to each step.
   - 5-second watchdog timer guarding against infinite loops.

3. **🏆 3-Distinct-Problem Checkpoint Mastery:**
   - To unlock the next topic, learners must pass **3 distinct, unique problems** in the topic checkpoint.
   - Anti-spam deduplication guarantees that repeatedly executing the same solution does not count as multiple solutions.
   - Atomic SQLite transactions commit completions and unlock subsequent topics.

4. **✈️ 100% Offline Independence:**
   - Bundled Pyodide WebAssembly runtime, SQLite database, and complete curriculum.
   - Operates in Airplane Mode with 0 KB network requirements.
   - 100% on-device data processing with zero telemetry or tracking.

---

## 📱 Navigation Architecture

### Bottom Tabs (4)
- **Home:** Daily streak, Python XP, active topic continue card, feature highlight.
- **Learn:** 6-module syllabus breakdown across 24 topics with lock/available badges.
- **Practice:** Sandbox arena toggling Mode A (Trace), Mode B (Fill-in), and Mode C (Independent).
- **Profile:** Learner level, offline system diagnostics, theme switch, settings navigation.

### Specialized Screens (13)
- `WelcomeScreen`: Onboarding introduction and feature showcase.
- `TopicLearningScreen`: Reading theory, learning objectives, code breakdowns, common pitfalls.
- `KnowledgeCheckScreen`: Pre-practice micro-quizzes with instant answer feedback.
- `ProblemExplanationScreen`: 4-step logic framework (Problem, Logic, Steps, Editor).
- `HandwritingEditorScreen`: CodeMirror 6 copybook editor with live progress percentage.
- `ExecutionVisualizerScreen`: Steppable debugger and variable inspector.
- `CheckpointScreen`: 3-problem assessment gating.
- `TopicCompletedScreen`: Celebration screen with XP rewards and streak increments.
- `SettingsScreen`: Theme toggle, offline diagnostics, progress reset guard.
- `PrivacyPolicyScreen`: Complete on-device privacy guarantee.

---

## 🛠️ Technology Stack

- **Framework:** React Native CLI (0.88+)
- **Language:** TypeScript & JavaScript
- **Navigation:** React Navigation (Bottom Tabs + Native Stack)
- **Database:** Local SQLite with parameterized queries, transactions, and migration runner
- **Editor Engine:** Embedded CodeMirror 6 with custom ghost-text overlay
- **Python Runtime:** Offline Pyodide WebAssembly with `sys.settrace()` instrumentation
- **State Management:** Zustand & local React state

---

## 🧪 Testing & Quality Assurance

To execute all test suites:
```bash
npm test
```

To run TypeScript type checks:
```bash
npx tsc --noEmit
```

To run ESLint style and formatting checks:
```bash
npm run lint
```
