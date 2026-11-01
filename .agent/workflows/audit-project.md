# Workflow: Audit Project

**Purpose:** Comprehensive architectural, code quality, performance, offline, and compliance audit against the Pytrix Engineering Constitution.

---

## Phase 1: Architectural & Modular Boundary Audit
1. **Separation of Concerns:**
   - Audit screens and components: verify no direct SQL queries in UI components.
   - Audit editor components: verify Python execution logic is decoupled from CodeMirror rendering.
   - Audit course content: verify lessons and curriculum are not hardcoded in UI components.
   - Audit progression logic: verify topic unlock conditions are in dedicated services, not navigation components.
2. **Circular Dependencies & Couplings:**
   - Detect circular imports between features or shared modules.
   - Verify features expose clear public interfaces.

## Phase 2: Offline & Pyodide Runtime Integrity Audit
1. **Offline Capability:**
   - Verify zero external CDN links or live network requirements for core execution.
   - Verify bundled Pyodide WebAssembly assets exist and are functional offline.
2. **Execution Sandboxing & Security:**
   - Audit WebView messaging bridge: verify payload schemas and origin validation.
   - Verify untrusted Python code cannot access React Native bridge, host filesystem, or network sockets.
   - Check execution timeouts (protection against infinite loops) and memory limits.
3. **Execution Visualizer Authenticity:**
   - Verify tracing uses authentic Python runtime trace events (`sys.settrace()`), not fabricated animations.

## Phase 3: Database & Progression Integrity Audit
1. **SQLite & Repositories:**
   - Verify all database access is channeled through repositories with parameterized queries (`?`).
   - Audit migrations: verify all schema mutations use sequential migration files.
   - Check transaction usage for checkpoint completion and topic unlock updates.
2. **Checkpoint & Progression Rules:**
   - Verify checkpoint enforcement requires 3 distinct successful problems.
   - Verify repeated execution of the same problem does not count as multiple solutions.
   - Verify progress restores completely after app restart.

## Phase 4: UI/UX & Responsive Layout Audit
1. **Responsive Layouts:**
   - Audit styling for hardcoded fixed screen dimensions (e.g., fixed widths/heights).
   - Verify safe area handling and keyboard avoidance.
   - Test layout scaling across small, medium, and large phone resolutions.
2. **UI State Handling:**
   - Verify components handle all states: Initial, Loading, Ready, Empty, Error, Disabled, Offline, and Restored.
   - Verify touch targets are at least 44x44 points.
   - Audit color contrast and accessibility labels on interactive elements.

## Phase 5: Code Quality & Dependency Audit
1. **Linting & Code Hygiene:**
   - Run linter: check for disabled ESLint rules or unvalidated `any` types.
   - Audit `console.log` statements: ensure no permanent debug logging in production code.
2. **Dependencies & Security:**
   - Run dependency audit for vulnerabilities (`npm audit`).
   - Check for redundant or abandoned libraries in `package.json`.

## Phase 6: Audit Report Compilation
1. Generate an audit report highlighting:
   - Compliant systems and passing criteria.
   - Identified architectural violations or code smells.
   - Offline, security, or performance risks.
   - Prioritized remediation roadmap.

