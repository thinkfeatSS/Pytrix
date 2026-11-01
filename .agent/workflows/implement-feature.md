# Workflow: Implement Feature

**Purpose:** Standard operating procedure for adding new features or capabilities to Pytrix while complying with the Project Engineering Constitution.

---

## Phase 1: Inspection & Analysis
1. **Inspect Codebase:**
   - Locate relevant modules under `src/features/` or `src/shared/`.
   - Check existing dependencies in `package.json` to prevent unnecessary new libraries.
   - Review related database tables in `src/database/` and existing test suites.
2. **Pedagogical & Technical Analysis:**
   - Define exact user experience and offline requirements.
   - Determine whether state belongs in component local state, Zustand, or SQLite persistence.
   - Check impact on low-end Android hardware (memory, render cycles).

## Phase 2: Implementation Plan
1. Outline modified or new files across:
   - UI / Components (`src/features/<feature>/components`)
   - Business Logic / Hooks (`src/features/<feature>/hooks`)
   - Services & Repositories (`src/services/` or `src/database/repositories/`)
2. Define acceptance criteria and test plan (Unit, Integration).
3. If database changes are needed, design a numbered SQLite migration script.

## Phase 3: Implementation
1. Adhere to modular architecture: keep UI decoupled from database, Python runtime, and business logic.
2. Implement responsive layout using Flexbox and dynamic dimension hooks (`useWindowDimensions`).
3. Handle all mandatory UI states: Initial, Loading, Ready, Empty, Error, Disabled, Offline, and Restored.
4. Implement proper error handling with explicit `try/catch` and user-friendly messaging.
5. Write unit tests alongside implementation in `tests/` or `__tests__/`.

## Phase 4: Verification & Quality Gate
1. **Lint & Code Style:**
   - Run linter and ensure zero new warnings or errors.
2. **Automated Testing:**
   - Run unit and integration tests.
3. **Manual / Device Checks:**
   - Verify layout responsiveness across different screen sizes.
   - Test offline functionality in airplane mode.
   - Test app pause/resume and process restoration.
4. **Definition of Done Review:**
   - Check all items in the Constitution's Definition of Done checklist.

## Phase 5: Documentation & Report
1. Update relevant project documentation (`ARCHITECTURE.md`, `COURSE_CONTENT_GUIDE.md`, etc.).
2. Document the implementation details, verification results, and any limitations in the final report.

