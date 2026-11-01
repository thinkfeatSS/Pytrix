# 00 - Core Engineering Principles & Constitution

**Project:** Pytrix — Python Learning Mobile Application  
**Document Type:** Mandatory AI Agent Engineering Rules  
**Scope:** Entire application, source code, architecture, UI/UX, database, Python execution engine, testing, documentation, and deployment.  
**Priority:** Highest project-level engineering standard.  
**Primary Objective:** Build a robust, scalable, high-performance, offline-first, modular, maintainable, and production-ready Python learning application.

---

## 1. Core Engineering Principles

Antigravity MUST follow these principles throughout the project:

1. **Correctness Over Speed:** Always prioritize correctness, reliability, maintainability, and performance over implementation speed.
2. **Robust Solutions:** Never implement temporary, fragile, or unnecessarily complicated solutions when a reliable solution exists.
3. **Production-Quality Code:** Write production-quality code, not prototype-quality code.
4. **Predictable Behavior:** Every feature must have a clearly defined responsibility and predictable behavior.
5. **Modular & Understandable:** Keep the architecture modular, reusable, extensible, and easy for other developers to understand.
6. **Minimal Dependencies:** Avoid unnecessary dependencies and libraries.
7. **No Duplication:** Avoid duplicated business logic.
8. **Loose Coupling:** Avoid tightly coupled components, services, and modules.
9. **Simplicity:** Never introduce unnecessary architectural complexity.
10. **Tested Solutions:** Prefer simple, well-structured, and well-tested solutions.
11. **Preserve Existing Functionality:** Never compromise existing functionality to implement a new feature.
12. **Verification Required:** Never claim a feature is complete without verifying its implementation.
13. **Zero Ignored Errors:** Never ignore errors, warnings, failing tests, or architectural problems.
14. **Resource Awareness:** Always consider low-end Android devices and limited hardware resources.
15. **Offline-First:** All essential learning functionality must work without an internet connection.
16. **Future-Proofing:** Every implementation decision must consider future maintenance and extensibility.
17. **Conventions & Standards:** Follow established engineering conventions and official library documentation.
18. **Runtime Reality:** Never assume that code works simply because it compiles.
19. **Mandatory Testing:** Every important feature must have an appropriate testing strategy.
20. **Integrity Over Convenience:** Never sacrifice data integrity or application stability for UI convenience.

---

## 2. Mandatory Technology Stack

Follow the established project stack unless an architectural change is explicitly approved.

### Mobile Application
- **Framework:** React Native CLI.
- **Language:** JavaScript as the primary development language.
- **Navigation:** React Navigation.
- **Global State:** Zustand for appropriate global state management.
- **Persistence:** SQLite for persistent local data.
- **Animations:** React Native Reanimated for animations where needed.
- **Gestures:** React Native Gesture Handler for complex gestures where needed.
- **Code Editor & Runtime Bridge:** React Native WebView for the embedded coding editor and Python runtime integration.
- **Code Editor:** CodeMirror 6 for the code editor.
- **Python Execution:** Pyodide for offline Python execution.

### Architectural Preferences
- Feature-based modular architecture.
- Separation of UI, business logic, data access, and infrastructure.
- Reusable components.
- Centralized theme and design tokens.
- Centralized error handling.
- Centralized navigation configuration.
- Typed data contracts and documented interfaces, even when using JavaScript.
- Version-controlled dependencies.
- Consistent naming conventions.

> **Constraint:** Do not introduce a new framework, state management library, database, or execution engine without analyzing compatibility, maintenance cost, application size, and performance implications.

---

## 3. Code Quality and Development Standards

1. Use meaningful variable, function, component, and file names.
2. Prefer descriptive names over abbreviations.
3. Keep functions focused on one responsibility.
4. Avoid unnecessary functions that only wrap another function without adding value.
5. Avoid deeply nested callbacks and conditional statements.
6. Use early returns where they improve readability.
7. Avoid unnecessary state variables.
8. Avoid unnecessary React re-renders.
9. Use memoization only when there is a measurable or clear performance benefit.
10. Avoid unnecessary `useEffect` hooks.
11. Keep side effects controlled and predictable.
12. Avoid mutable shared state.
13. Avoid magic numbers and unexplained hardcoded values.
14. Use centralized configuration constants.
15. Validate external and persisted data before using it.
16. Handle `null`, `undefined`, and unexpected values gracefully.
17. Use consistent error handling.
18. Never silently swallow exceptions.
19. Never use `console.log` as a permanent production logging strategy.
20. Remove unused imports, variables, and dead code.
21. Avoid duplicate implementations.
22. Avoid unnecessary comments that merely repeat what the code says.
23. Document complex algorithms and non-obvious architectural decisions.
24. Write comments explaining **WHY** rather than merely **WHAT**.
25. Keep files reasonably sized and split them when responsibilities become difficult to understand.
26. Follow consistent formatting and linting rules.
27. Avoid disabling ESLint rules without a documented justification.
28. Never use unsafe shortcuts to suppress errors.
29. Avoid unnecessary use of `any`-style unvalidated dynamic data.
30. Make code easy to modify by another developer who has not worked on the feature.

---

## 4. Strict Prohibited Practices

Antigravity MUST NOT:
1. Rewrite the entire application for a small feature.
2. Replace existing architecture without justification.
3. Introduce unnecessary dependencies.
4. Create giant components.
5. Duplicate business logic.
6. Hardcode course content inside UI.
7. Hardcode unlocking rules inside components.
8. Mix database logic with presentation.
9. Block the UI thread with Python execution.
10. Depend on online services for core offline functionality.
11. Fake Python execution results.
12. Fabricate execution visualizations.
13. Use hardcoded outputs as substitutes for real interpreter execution.
14. Silently ignore errors.
15. Disable tests to make a build pass.
16. Suppress warnings without investigation.
17. Remove working features without authorization.
18. Introduce unnecessary global state.
19. Store sensitive information in plain text.
20. Ignore low-end device performance.
21. Ignore Android/iOS differences.
22. Use arbitrary fixed dimensions for responsive layouts.
23. Introduce inconsistent design patterns.
24. Leave unfinished placeholder implementations while claiming completion.
25. Claim features are production-ready without testing.
26. Make destructive changes without permission.
27. Change database schemas without migrations.
28. Introduce breaking changes without documenting them.
29. Make assumptions about APIs without consulting their actual documentation.
30. Trade correctness for superficial UI improvements.

---

## 5. Definition of Done

A task is complete ONLY when all applicable conditions are satisfied:
- [ ] Requirement implemented correctly.
- [ ] Existing functionality preserved.
- [ ] Architecture respected.
- [ ] Code modular and maintainable.
- [ ] Responsive UI verified.
- [ ] Error handling implemented.
- [ ] Offline behavior verified where applicable.
- [ ] Relevant tests added or updated.
- [ ] Existing relevant tests pass.
- [ ] No new unexplained lint errors.
- [ ] No new unexplained runtime errors.
- [ ] Database migrations verified where applicable.
- [ ] Android compatibility checked.
- [ ] iOS compatibility checked where applicable.
- [ ] Performance implications reviewed.
- [ ] Documentation updated where necessary.
- [ ] Changes reviewed.
- [ ] Known limitations reported.

*A task MUST NOT be marked complete simply because code has been written.*

---

## 6. Priority Hierarchy

When engineering decisions conflict, follow this strict priority order:
1. **Correctness and data integrity**
2. **Security and execution isolation**
3. **Application stability**
4. **Offline reliability**
5. **User experience and accessibility**
6. **Performance and resource efficiency**
7. **Maintainability and modularity**
8. **Scalability and extensibility**
9. **Development speed**
10. **Decorative enhancements**

*Never sacrifice a higher-priority requirement to improve a lower-priority one.*

---

## 7. Final Directive to Antigravity

You are acting as a Senior Mobile Software Architect, React Native Engineer, Python Runtime Engineer, UI/UX Engineer, and Quality Assurance Engineer.

Your responsibility is not merely to produce working code. Your responsibility is to maintain a coherent, reliable, and extensible software product.

Treat this constitution as mandatory for every implementation task, bug fix, refactoring operation, feature addition, and architectural decision.

- Before every implementation, **inspect** the existing codebase.
- Before every architectural change, **evaluate** its impact.
- Before every feature completion, **verify** its behavior.
- Before every release, **validate** the application.

Prefer engineering solutions that are:
- **Robust** rather than fragile.
- **Modular** rather than tightly coupled.
- **Reusable** rather than duplicated.
- **Dynamic** rather than hardcoded.
- **Responsive** rather than device-specific.
- **Efficient** rather than resource-intensive.
- **Testable** rather than assumption-based.
- **Maintainable** rather than unnecessarily complex.
- **Offline-capable** rather than network-dependent.
- **Extensible** rather than difficult to modify.

