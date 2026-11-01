# 01 - Architecture and Modular Code Rules

**Project:** Pytrix — Python Learning Mobile Application  
**Document Type:** Mandatory Architecture & Modularity Rules  
**Scope:** Folder organization, component boundaries, separation of concerns, and system structure.

---

## 1. Modular Architecture Rules

1. **Feature-Based Architecture:** Use feature-based architecture rather than placing every component in generic global folders.
2. **Feature Ownership:** Each feature must own its components, hooks, services, state, and relevant utilities.
3. **Separate UI from Business Logic:** Keep display presentation strictly separated from computation, validation, and domain logic.
4. **Separate Database from UI:** Separate all database operations from UI components. Never execute direct database queries within components.
5. **Separate Execution from Editor:** Separate Python execution logic from editor/input logic.
6. **Separate Content from Rendering:** Separate course content from rendering components.
7. **Separate Calculations from Display:** Separate progress calculations from progress presentation.
8. **Separate Unlocking Rules from Navigation:** Separate topic unlocking rules from navigation triggers.
9. **Clean Reusable Components:** Reusable components must not contain feature-specific business logic.
10. **Single Responsibility Utilities:** Shared utilities must have clearly defined, single responsibilities.
11. **No Circular Dependencies:** Avoid circular dependencies across modules and files.
12. **Compact File Size:** Avoid giant components and oversized service files; split by concern.
13. **Flat Conditional Rendering:** Avoid deeply nested conditional rendering.
14. **Composition Over Inheritance:** Prefer functional composition over unnecessary class inheritance.
15. **Dependency Injection / Explicit Interfaces:** Use dependency injection or explicit interfaces where it improves testability and decoupling.
16. **Focused & Testable:** Keep components small, focused, and independently testable.
17. **Encapsulation:** Avoid exposing internal implementation details across feature boundaries.
18. **Repository Pattern:** Route database operations through dedicated repositories; never access database drivers directly from components.
19. **No God Components:** Never mix navigation, persistence, execution, and business logic in a single component.
20. **Clear Public Interfaces:** Every module must expose a clear public interface (e.g., via index exports or documented contracts).

---

## 2. Recommended Folder Structure

```
src/
  app/
    navigation/          # Navigation stacks, tabs, and routing configuration
    providers/           # Context providers and root wrappers
    initialization/      # App bootstrap, engine initialization, and migrations
    configuration/       # Global constants, feature flags, runtime configurations

  features/
    onboarding/          # User introduction and setup flows
    dashboard/           # Main hub, summary cards, and quick actions
    courses/             # Course catalog, overview, and syllabus
    modules/             # Module listings and summaries
    lessons/             # Lesson content readers, theory renderers
    coding-practice/     # Practice screen orchestration
    code-editor/         # CodeMirror 6 integration and handwriting-inspired editor
    python-runtime/      # Pyodide offline engine & execution manager
    execution-visualizer/# Step-by-step trace & variable state visualizer
    exercises/           # Guided coding and independent problem runner
    checkpoints/         # 3-problem checkpoint assessment workflows
    progress/            # Progression engine and unlock rules
    achievements/        # Badges, streaks, and milestones
    settings/            # App preferences, theme, and data reset

  shared/
    components/          # General-purpose reusable UI primitives (Button, Card, etc.)
    hooks/               # Reusable non-feature hooks (useDimensions, useDebounce)
    constants/           # Global design tokens, keys, and values
    theme/               # Centralized colors, typography, spacing, and styles
    utilities/           # Pure formatting, math, and string utilities
    validators/          # Input, schema, and syntax validation helpers
    types/               # Global type definitions and data contracts
    errors/              # App-wide error classes and error boundaries

  database/
    migrations/          # Schema migrations in sequential version order
    repositories/        # Data access objects (UserProgress, Lessons, Settings)
    schemas/             # SQLite table definitions and indices
    seeds/               # Initial seed data for offline startup

  services/
    storage/             # Local storage abstractions
    python/              # Bridge services for Python execution
    analytics/           # Offline analytics / telemetry
    content/             # Content loader and validator services

  assets/
    images/              # Raster and vector graphics
    icons/               # Iconography assets
    fonts/               # Embedded typography fonts
    animations/          # Lottie or Reanimated animation assets

  content/
    courses/             # Structured course metadata
    modules/             # Module definitions
    lessons/             # Structured lesson data
    exercises/           # Exercise schemas, test cases, and reference solutions

  tests/
    unit/                # Unit tests for pure logic, utilities, reducers
    integration/         # Integration tests for repos, bridge, and visualizer
    performance/         # Benchmarks and startup measurements
```

> **Rule:** Each feature should have an appropriate internal structure. Do not create empty folders simply to follow this example without actual functional needs.

