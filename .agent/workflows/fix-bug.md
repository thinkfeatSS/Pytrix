# Workflow: Fix Bug

**Purpose:** Root-cause investigation, targeted bug fixing, and regression prevention for Pytrix.

---

## Phase 1: Reproduction & Diagnosis
1. **Reproduce the Bug:**
   - Identify the exact user action sequence, screen state, or input that triggers the failure.
   - Inspect device logs, console output, and error stack traces.
2. **Trace the Root Cause:**
   - Trace the execution path through React Native components, hooks, services, or SQLite repositories.
   - For editor/runtime issues, distinguish between typing mistakes, AST syntax errors, Pyodide initialization errors, and Python execution failures.
   - For progression bugs, trace SQLite transactions and unlock condition services.
3. **Isolate Failure Boundary:**
   - Determine whether the fault is in presentation, bridge serialization, state mutation, or persistence.

## Phase 2: Regression Test Creation
1. Write a failing unit or integration test that reproduces the bug before writing the fix.
2. Verify that the test fails consistently against the existing implementation.

## Phase 3: Targeted Implementation
1. Implement the minimal and complete fix addressing the true root cause.
2. Avoid broad refactorings or modifying unrelated files.
3. Maintain existing contracts, interfaces, and backwards compatibility.
4. Ensure no new side effects or memory leaks are introduced.

## Phase 4: Verification & Regression Gate
1. Execute the reproduction test and confirm it now passes.
2. Run the entire existing test suite to ensure zero regressions across other features.
3. Verify the fix in offline mode (airplane mode) if relevant.
4. Verify error handling gracefully catches boundary conditions (null/undefined inputs, empty states).

## Phase 5: Documentation & Report
1. Record root cause, affected files, and fix mechanism.
2. Document the regression test added.
3. Update `CHANGELOG.md` with the bug fix details.

