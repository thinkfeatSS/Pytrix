# 03 - Responsive UI/UX, State, and Animation Rules

**Project:** Pytrix — Python Learning Mobile Application  
**Document Type:** Mandatory UI/UX, Design Tokens, State, and Interaction Rules  
**Scope:** Mobile visual design, responsive layouts, accessibility, UI state transitions, and animations.

---

## 1. Responsive Layout Rules

1. **Multi-Screen Design:** Never design for only one screen size or aspect ratio.
2. **No Hardcoded Dimensions:** Never hardcode fixed screen dimensions (e.g., `width: 375`, `height: 812`) for general layouts.
3. **Flexbox Layouts:** Use Flexbox and responsive layout techniques as the foundation of all layouts.
4. **Relative Dimensions:** Use percentages, flex ratios, and calculated relative dimensions where appropriate.
5. **Dynamic Dimension Hooks:** Use `useWindowDimensions` or equivalent responsive hooks to adapt layouts dynamically.
6. **Screen Sizes:** Support small, medium, and large mobile phone displays cleanly.
7. **Aspect Ratios & Densities:** Support diverse aspect ratios (e.g., 16:9, 19.5:9, 20:9) and pixel densities (mdpi, hdpi, xhdpi, xxhdpi).
8. **Orientation:** Support portrait orientation primarily, ensuring layouts remain stable.
9. **Safe Areas:** Handle safe areas correctly on notched devices and devices with home indicator bars (use `react-native-safe-area-context`).
10. **Notch & Nav Bar Avoidance:** Avoid content or interactive buttons being obscured behind navigation bars, status bars, or device notches.
11. **No Horizontal Overflow:** Avoid unintentional horizontal overflow or horizontal page scrolling on standard screens.
12. **Accessible Hit Targets:** Ensure touch targets are at least 44x44 points for reliable finger tapping.
13. **Text Wrapping & Scaling:** Handle long text, dynamic strings, and localized content without clipping or breaking layouts.
14. **System Font Scaling:** Support Android system font scaling without breaking critical UI containers.
15. **Readable Typography:** Maintain readable font sizes, line heights, and letter spacing across all devices.
16. **Resolution Testing:** Test on both low-resolution (small/budget phones) and high-resolution screens.
17. **Keyboard Awareness:** Ensure the on-screen keyboard never obscures active input fields, action buttons, or editor controls.
18. **Adaptive Spacing:** Use responsive spacing tokens that scale reasonably between small and large phone screens.
19. **Conflict-Free Scrolling:** Ensure nested scrollable views (e.g., editor within a lesson screen) do not suffer from gesture conflicts.
20. **Explicit Layout States:** Ensure empty, loading, error, and success states have robust, intentional layouts.

---

## 2. Visual Design Rules

1. **Centralized Design System:** Use a centralized design token system for colors, spacing, typography, and elevations.
2. **Design Consistency:** Maintain strict visual consistency across buttons, cards, typography, borders, and shadows.
3. **No Ad-Hoc Styling:** Never introduce random colors, arbitrary padding, or inconsistent styling outside design tokens.
4. **Modern, Restrained Aesthetic:** Maintain a clean, modern, and uncluttered visual language suited for educational focus.
5. **Clarity Over Decoration:** Prioritize educational clarity over decorative visual fluff.
6. **Subtle Effects:** Avoid excessive gradients, heavy shadows, and flashy animations.
7. **Visual Hierarchy:** Establish clear typographic hierarchy (H1, H2, body, caption, code).
8. **Consistent Iconography:** Use a consistent icon family and sizing scale.
9. **Accessible Contrast:** Ensure text and interactive elements satisfy WCAG AA contrast standards.
10. **Touch Friendly:** Keep interactive controls spaced sufficiently apart to prevent accidental taps.
11. **Uncluttered Screens:** Avoid overcrowded screens; provide appropriate whitespace.
12. **Code Readability:** Ensure code snippets and editor text use a legible monospace font with proper line height.
13. **Consistent Feedback:** Provide standardized feedback patterns for user actions (snackbars, toast banners, inline error text).
14. **Intentional Blank States:** Design loading skeletons, empty states, and error cards deliberately.
15. **No Alert Overuse:** Avoid triggering native system alert dialogs for minor or routine interactions.
16. **Clear Outcome Feedback:** Provide immediate, unmistakable visual feedback for correct solutions and errors.
17. **Non-Disruptive Editor:** Avoid disruptive animations or layout jumps while the user is actively typing.
18. **Predictable Interactions:** Maintain identical interaction rules across all screens.

---

## 3. Accessibility Standards

1. Provide accessibility labels (`accessibilityLabel`, `accessibilityRole`, `accessibilityHint`) for interactive controls and icons.
2. Ensure readable text contrast in both light and dark display modes.
3. Do not communicate state or errors using color alone (pair colors with icons or descriptive text).
4. Support screen readers (TalkBack on Android, VoiceOver on iOS) where practical.
5. Maintain a logical and intuitive navigation focus order.
6. Support dynamic system font scaling without text truncation.
7. Provide descriptive text for visual diagrams and code output badges.
8. Ensure essential interactions do not depend exclusively on complex multi-finger gestures.

---

## 4. UI State Management Rules

Every screen must explicitly define and handle:
- **Initial State:** Screen opened before data loads.
- **Loading State:** Data retrieval or engine initialization in progress.
- **Success / Ready State:** Content loaded and interactive.
- **Empty State:** No records or data available.
- **Error State:** Failure occurred with a clear retry mechanism.
- **Disabled State:** Interactive controls temporarily deactivated during operations.
- **Offline State:** UI indicates local-only operations.
- **Restored State:** Preserved drafts or incomplete exercises restored.

### State Principles
1. **Single Source of Truth:** Avoid duplicate sources of truth across components.
2. **Local State First:** Keep state local whenever possible (`useState`, `useReducer`).
3. **Selective Global State:** Use Zustand global stores strictly for truly app-wide state (user session, theme, active progress).
4. **Persistent Data in SQLite:** Keep durable user records in SQLite; do not use in-memory stores as persistent storage.
5. **Transient UI Separation:** Keep transient UI states (e.g., modal visibility, scroll offsets) out of SQLite.
6. **Decoupled Sync:** Avoid redundant or tight synchronization loops between Zustand and SQLite.
7. **Deterministic Transitions:** State transitions must follow predictable state-machine patterns.
8. **Prevent Stale Updates:** Discard asynchronous callback results if the screen or component has unmounted.
9. **Race Condition Prevention:** Guard against race conditions from rapid concurrent user taps or async operations.
10. **No Invalid State Combinations:** Never permit contradictory states (e.g., `isLoading = true` and `hasError = true` simultaneously).

---

## 5. Animation and Interaction Rules

1. **Usability First:** Animations must enhance understanding and navigation, never distract from learning.
2. **Lightweight & Smooth:** Use React Native Reanimated to run animations smoothly on the UI thread (60 FPS).
3. **Subtle Transitions:** Avoid jarring or overly long screen transitions.
4. **No Heavy Editor Animations:** Keep the code editor free from heavy or laggy animations that hinder typing responsiveness.
5. **Reduced Motion:** Respect system accessibility settings for reduced motion preferences.
6. **Immediate Feedback:** Provide instant visual acknowledgment when buttons or keys are pressed.
7. **Zero Artificial Delays:** Never add artificial delays or loaders to simulate "thinking" time.
8. **Non-Blocking Transitions:** Never block touch input during basic transitions.
9. **Predictable Gestures:** Ensure gestures (swipes, drag-to-dismiss) behave consistently with native platform expectations.
10. **Low-End Performance:** Verify that animations run smoothly on low-end hardware without dropping frames.

