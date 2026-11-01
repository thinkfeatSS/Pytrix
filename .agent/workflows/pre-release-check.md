# Workflow: Pre-Release Check

**Purpose:** Final quality gate and release readiness checklist before building production binaries for Android and iOS.

---

## Phase 1: Code Freeze & Static Analysis
- [ ] Working tree clean with all desired commits in Git.
- [ ] No secrets, API keys, or private keystores committed to version control.
- [ ] All `.env` and sensitive configurations properly excluded in `.gitignore`.
- [ ] Linting passes with zero errors: `npm run lint`.
- [ ] TypeScript / type checks pass with zero errors: `npx tsc --noEmit`.
- [ ] Dead code, temporary debug comments, and production `console.log` statements removed.

## Phase 2: Automated Test Verification
- [ ] All unit tests pass: `npm run test` (100% passing, 0 failing, 0 skipped).
- [ ] Integration tests pass for database repositories, migrations, and SQLite transactions.
- [ ] Python runtime bridge integration tests pass.
- [ ] Progression engine and checkpoint validation tests pass.

## Phase 3: Offline & Runtime Verification
- [ ] Put device / emulator in **Airplane Mode** (WiFi disabled, Cellular disabled).
- [ ] Cold launch application: confirm fast startup without network timeout warnings.
- [ ] Open lesson content: confirm all lessons, code snippets, and assets render offline.
- [ ] Open Code Editor: verify CodeMirror 6 initializes offline.
- [ ] Execute Python code: verify Pyodide WebAssembly runs offline and outputs to console.
- [ ] Run Line-by-Line Visualizer: verify real trace events step through accurately.
- [ ] Test infinite loop prevention: verify script execution times out without app crash.

## Phase 4: Data & Progression Restoration
- [ ] Complete a lesson, practice exercise, and checkpoint topic.
- [ ] Verify next topic unlocks immediately.
- [ ] Force quit the application completely.
- [ ] Reopen application: verify all progress, unlocked topics, and draft code are 100% restored.
- [ ] Test SQLite migration from previous app version database (if upgrading).

## Phase 5: Cross-Platform & Device Verification
- [ ] Android Release Build: `cd android && ./gradlew assembleRelease` (or bundleRelease) succeeds.
- [ ] Test on low-end Android device or emulator with constrained CPU/RAM.
- [ ] Test keyboard avoidance and editor typing responsiveness.
- [ ] Verify notch, status bar, and gesture navigation bar padding across multiple aspect ratios.
- [ ] iOS Build verification (if on macOS environment): `pod install` and Xcode archive check.

## Phase 6: Release Sign-Off & Documentation
- [ ] Version number bumped in `package.json`, `android/app/build.gradle`, and `ios/` project files.
- [ ] `CHANGELOG.md` updated with release highlights, features, and fixes.
- [ ] Release notes prepared.
- [ ] Definition of Done verified for all included features.
- [ ] Final sign-off logged and ready for distribution.

