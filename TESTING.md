# Quality Assurance & Testing Guide

---

## 1. Test Architecture

The test suite covers unit, integration, and UI component layers:

1. **`__tests__/App.test.tsx`:** App root mounting, theme provider, and bottom tab navigation.
2. **`__tests__/database/database.test.ts`:**
   - Sequential schema migrations.
   - Curriculum seeding.
   - Course structure & topic queries.
   - 3-problem checkpoint assessment & anti-spam deduplication.
3. **`__tests__/editor/editor.test.tsx`:**
   - Mode A copybook trace matching.
   - Ghost-text suffix calculation.
   - Real-time bracket mismatch interception (`[` vs `(`).
   - Mode B fill-in validation.
   - Mode C unclosed bracket and missing colon detection.
4. **`__tests__/runtime/runtime.test.tsx`:**
   - Variable assignment and arithmetic step-by-step tracing.
   - Conditional branch tracing.
   - Watchdog timeout guard against infinite loops.
   - `ExecutionVisualizerScreen` rendering and step scrubbing.
5. **`__tests__/progress/progress.test.tsx`:**
   - Test case output evaluation.
   - Checkpoint gating and automatic next topic unlock.
   - User stats, level, and XP calculation.

---

## 2. Running Verification Commands

Execute all Jest tests:
```bash
npm test
```

Execute TypeScript type checking:
```bash
npx tsc --noEmit
```

Execute ESLint static analysis:
```bash
npm run lint
```

