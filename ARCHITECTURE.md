# Pytrix System Architecture Specification

---

## 1. High-Level Modular Structure

```
src/
├── app/
│   ├── navigation/         # BottomTabNavigator, RootNavigator, Route Types
│   ├── providers/          # SafeAreaProvider, ThemeProvider, NavigationContainer
│   └── configuration/      # Global constants and feature flags
│
├── features/
│   ├── home/               # Dashboard summary, streak cards, active resume
│   ├── learn/              # Curriculum syllabus, module listings, topic trees
│   ├── lessons/            # Theory readers, objectives, pitfalls callouts
│   ├── knowledge-check/    # Pre-practice comprehension quizzes
│   ├── problem-explanation/# 4-step logic framework (Problem, Logic, Steps, Code)
│   ├── code-editor/        # CodeMirror 6 copybook engine, ghost layer, validators
│   ├── python-runtime/     # Pyodide Wasm runner, sys.settrace tracer, watchdog
│   ├── execution-visualizer/# Steppable execution debugger and variable inspector
│   ├── checkpoints/        # 3-problem assessment engine, celebration screens
│   ├── progress/           # ProgressService domain logic, XP & streak calculators
│   ├── settings/           # Theme preferences, offline diagnostics, reset guards
│   ├── legal/              # Privacy policy and on-device data guarantees
│   └── onboarding/         # Welcome introduction
│
├── shared/
│   ├── theme/              # Centralized colors, typography, spacing, useTheme hook
│   ├── components/         # AppText, AppButton, AppCard, Badge, ScreenContainer
│   └── types/              # Domain entities, curriculum schemas, database contracts
│
└── database/
    ├── migrations/         # 001_initial_schema.ts
    ├── repositories/       # CourseRepository, ExerciseRepository, ProgressRepository
    ├── seeds/              # pythonBasicsCurriculum.ts
    ├── MigrationRunner.ts  # Versioned migration manager
    ├── SeedEngine.ts       # Idempotent curriculum and progress initializer
    └── DatabaseClient.ts   # Unified singleton database client
```

---

## 2. Separation of Concerns & Clean Architecture

1. **Zero Raw SQL in UI:** Components communicate exclusively through repositories (`courseRepo`, `exerciseRepo`, `progressRepo`).
2. **Decoupled Execution & Editor:** CodeMirror 6 handles typing and ghost-text visual overlays; Pyodide handles Python execution and tracing.
3. **Decoupled Content & Presentation:** All course curriculum (theory, exercises, test cases) is stored in structured SQLite tables and JSON seeds, never hardcoded into React components.
4. **Deterministic Topic Progression:** Unlocking logic lives in `ProgressService` and `ProgressRepository`, committing updates atomically within SQLite transactions.

