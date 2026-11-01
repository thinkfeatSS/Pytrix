# 08 - Development Workflow, Documentation & Git Rules

**Project:** Pytrix — Python Learning Mobile Application  
**Document Type:** Mandatory Antigravity Workflow, Documentation & Git Rules  
**Scope:** Developer workflow steps, mandatory documentation, git practices, and change review.

---

## 1. Mandatory Antigravity Development Workflow

For every task, bug fix, refactor, or feature, Antigravity MUST follow this rigorous 6-step lifecycle:

```
[ STEP 1: INSPECT ] ──▶ [ STEP 2: ANALYZE ] ──▶ [ STEP 3: PLAN ]
         │                                            │
         ▼                                            ▼
[ STEP 6: REPORT  ] ◀── [ STEP 5: VERIFY  ] ◀── [ STEP 4: IMPLEMENT ]
```

### STEP 1 — INSPECT
Before writing or changing code:
- Inspect the existing project directory structure.
- Inspect relevant source files and existing implementations.
- Inspect package dependencies in `package.json`.
- Inspect existing architecture and module boundaries.
- Inspect existing automated tests and fixtures.
- Inspect SQLite database schemas and migrations.
- Identify current bugs, quirks, and technical limitations.
- Identify all affected modules and dependent consumers.
> *Rule: Never assume the project is empty or that existing code can be safely replaced without inspection.*

### STEP 2 — ANALYZE
Before proposing changes:
- Understand the real, core user and pedagogical requirements.
- Identify the root cause of issues rather than treating symptoms.
- Identify all affected screens, components, and services.
- Trace dependencies and data flows.
- Evaluate possible regressions across existing features.
- Evaluate Android and iOS cross-platform compatibility.
- Ensure strict offline capability.
- Evaluate performance impacts on low-end mobile devices.
- Evaluate security and execution sandboxing implications.
- Consider future extensibility and maintenance cost.

### STEP 3 — PLAN
Create a concise, structured implementation plan covering:
- **Objective:** Clear target state and measurable outcome.
- **Affected Files & Modules:** Specific files to create, modify, or delete.
- **Proposed Changes:** High-level summary of architecture, logic, or UI modifications.
- **Dependencies:** Any new internal imports or verified packages.
- **Database Implications:** Schemas, migrations, or query changes.
- **UI Implications:** Screen layouts, responsiveness, and state handling.
- **Testing Strategy:** Unit, integration, and E2E test plan.
- **Potential Risks & Regressions:** What could break and mitigation strategy.
- **Acceptance Criteria:** Verifiable conditions for completion.
> *Rule: For complex tasks, divide the plan into small, verifiable milestones.*

### STEP 4 — IMPLEMENT
During code execution:
- Adhere strictly to the established modular architecture.
- Reuse existing shared components, hooks, and utilities.
- Avoid unnecessary refactoring of working code.
- Maintain clean modular boundaries and public interfaces.
- Follow code quality, formatting, and naming conventions.
- Implement comprehensive error handling and fallbacks.
- Preserve all existing functionality and working features.
- Write corresponding automated tests alongside the code.
- Update project documentation as code contracts evolve.
> *Rule: Never modify unrelated modules merely for convenience.*

### STEP 5 — VERIFY
After making changes:
- Run lint and syntax checks (`npm run lint` or equivalent).
- Run unit test suites.
- Run integration tests.
- Run applicable end-to-end user journeys.
- Verify Android build status (`npx react-native run-android` or Gradle checks).
- Verify iOS build status where supported by the host environment.
- Inspect application logs for unhandled warnings or errors.
- Verify database data integrity and migration correctness.
- Test offline behavior in airplane mode.
- Test responsive layouts on small and large screen viewports.
- Measure performance and responsiveness.
- Review the complete `git diff` before declaring done.
> *Rule: Never assume that code works simply because a build succeeded.*

### STEP 6 — REPORT
Every completed task report must include:
1. **What was implemented:** Concise description of the solution.
2. **Files changed:** List of added, modified, or deleted files with brief rationale.
3. **Architectural impact:** Structural changes, new contracts, or schemas.
4. **Commands executed:** Exact verification commands and test scripts run.
5. **Verification results:** Concrete test outcomes (passed, failed, skipped).
6. **Build verification status:** Mobile compilation and bundler status.
7. **Known limitations:** Any edge cases or constraints.
8. **Remaining work:** Follow-up items or next planned stages.

---

## 2. Documentation Rules

Maintain clear, accurate, and continually updated documentation.

### Required Project Documentation Files
- `README.md`: Project overview, setup, running instructions, and architecture summary.
- `AGENTS.md`: Agent configuration, rules index, and autonomous workflow guide.
- `ARCHITECTURE.md`: High-level system architecture, module boundaries, and folder structure.
- `DATABASE.md`: SQLite schemas, table relationships, and migration history.
- `COURSE_CONTENT_GUIDE.md`: Content schema guide, exercise authoring, and validation standards.
- `EDITOR_ENGINE.md`: CodeMirror 6 configuration, ghost text engine, and validation layers.
- `PYTHON_RUNTIME.md`: Pyodide integration, WebAssembly bundle, and bridge protocol.
- `EXECUTION_VISUALIZER.md`: Line-by-line tracing mechanism, variable tracking, and AST parsing.
- `PROGRESS_SYSTEM.md`: Topic unlocking rules, checkpoint requirements, and progression state machine.
- `TESTING.md`: Test strategy, running unit/integration/e2e tests, and writing new tests.
- `BUILD_AND_RELEASE.md`: Android and iOS build steps, signing, and release guidelines.
- `CHANGELOG.md`: Chronological log of notable additions, changes, and fixes.

### Documentation Content Requirements
Every major technical document must explain:
1. **What** the module or system does.
2. **Why** it exists and the design rationale.
3. **How** it works internally.
4. **How** it communicates with other components and services.
5. **How** to extend or modify it.
6. **How** to test it thoroughly.
7. **Important dependencies** and technical constraints.
8. **Known limitations** and edge cases.

*Rule: Update documentation whenever architectural decisions, public interfaces, or database schemas change.*

---

## 3. Git and Change Management Rules

1. **Protect Unrelated Work:** Never overwrite, delete, or modify unrelated developer code.
2. **Inspect Git Status First:** Always inspect `git status` and `git diff` before and after modifying files.
3. **Check File Intent Before Deleting:** Never delete files without verifying their historical purpose and usage.
4. **No Destructive Operations:** Never perform destructive Git operations (`git reset --hard`, `git push --force`) without explicit user permission.
5. **No Generated Blobs in Git:** Never commit build artifacts, node_modules, generated bundles, or temporary caches.
6. **Focused Commits:** Keep commits atomic, cohesive, and focused on a single logical change.
7. **Conventional Commit Messages:** Use descriptive commit messages (e.g., `feat(editor): implement ghost reference character matching`).
8. **Zero Secret Leaks:** Never commit `.env`, private keys, keystores, or auth credentials.
9. **Build Artifacts in `.gitignore`:** Ensure build directories (`android/app/build`, `ios/Pods`) are properly ignored.
10. **Backward Compatibility:** Preserve backward compatibility for database schemas and saved user data.
11. **Comprehensive Diff Review:** Audit the entire change set before declaring a task finished.
12. **Verification Before Claims:** Never claim a commit, build, or deployment succeeded without empirical evidence.

