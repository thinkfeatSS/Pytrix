# 05 - Course Content, Practice & Progression Rules

**Project:** Pytrix — Python Learning Mobile Application  
**Document Type:** Mandatory Curriculum, Pedagogy, Practice Engine & Progression Rules  
**Scope:** Course JSON/SQLite schemas, pedagogical sequencing, exercise grading, checkpoints, and topic unlocking.

---

## 1. Python Course Content Engineering Rules

Course content is a first-class product feature and must be engineered with the same rigor as code.

1. **No Hardcoded Lessons in UI:** Never hardcode individual lessons or educational copy inside React components.
2. **Structured Content Storage:** Store course content in structured, schema-validated JSON data files or SQLite tables.
3. **Decoupled from Presentation:** Keep content data completely independent of UI components and styling.
4. **Extensible Course Catalog:** Support adding new courses without modifying the underlying application architecture.
5. **Independent Modules:** Support adding new modules without modifying or breaking existing modules.
6. **Stable Unique IDs:** Assign every course, module, topic, and exercise an immutable, stable unique ID (e.g., `course_py_basics`, `topic_variables_01`).
7. **Explicit Ordering:** Maintain explicit numerical `order_index` fields for sequencing topics rather than relying on file or array order.
8. **Pre-Publishing Validation:** Validate all content schemas with automated test scripts before bundling into the app.
9. **Defined Learning Objectives:** Every topic must define a clear, concise learning objective.
10. **Beginner-Friendly Explanations:** Every topic must present clear, approachable conceptual explanations.
11. **Practical Code Examples:** Every topic must include real-world, intuitive Python code snippets.
12. **Explicit Expected Outputs:** Every code example must specify its expected terminal output.
13. **Line-by-Line Breakdown:** Provide line-by-line code breakdowns where educationally appropriate for beginners.
14. **Common Mistakes Included:** Explicitly highlight common beginner pitfalls, bugs, and misconceptions.
15. **Knowledge-Check Questions:** Include interactive multiple-choice or fill-in-the-blank questions to verify concept retention.
16. **Guided Coding Exercises:** Provide scaffolded, guided coding exercises before independent challenges.
17. **Independent Practice:** Include independent problem-solving challenges testing applied knowledge.
18. **Comprehensive Test Cases:** Include explicit expected results and automated test cases for every exercise.
19. **No Unexplained Jargon:** Avoid introducing advanced concepts or unexplained syntax in beginner lessons.
20. **Prerequisite Consistency:** Ensure exercises test strictly the concepts that have already been taught.
21. **Unambiguous Problem Prompts:** Avoid ambiguous or confusing exercise instructions.
22. **Edge Cases in Test Suites:** Include boundary and edge cases (e.g., empty strings, zero, negative numbers) in test suites.
23. **Consistent Terminology:** Maintain uniform terminology throughout all lessons (e.g., "parameter" vs. "argument").
24. **Technical Correctness:** Verify the technical accuracy of every Python code snippet against official Python documentation.
25. **Strict Prerequisite Flow:** Never introduce concepts before their prerequisites have been mastered.
26. **Hot-Editable Content:** Keep lesson text and exercises editable without changing rendering logic.
27. **Schema Versioning:** Support content schema versioning and schema migrations.
28. **Progress Preservation:** Preserve learner progress when course content is refreshed or expanded.
29. **No Index-Based IDs:** Never identify topics or exercises solely by their array index.
30. **Independent Course Testing:** Ensure every course content bundle can be validated independently via automated scripts.

---

## 2. Logic-Building and Practice Engine Rules

1. **Clear Problem Statements:** Every exercise must articulate the problem clearly with inputs, outputs, and constraints.
2. **Problem Before Solution:** Thoroughly explain the problem context before showing any solution.
3. **Conceptual Logic Explanation:** Explain the algorithmic reasoning behind the solution.
4. **Step-by-Step Breakdown:** Break the algorithmic steps down into bite-sized mental steps.
5. **Pseudocode Support:** Provide pseudocode or structured logic flows where appropriate.
6. **Progressive Guided Code:** Reveal guided solutions progressively to encourage active problem solving.
7. **Interactive Guided Execution:** Allow learners to run and visualize guided solutions step by step.
8. **Guided to Independent Progression:** Follow each guided example with an independent practice variation.
9. **Conceptual Variations:** Test the same core concept across different problem scenarios.
10. **Anti-Memorization:** Avoid superficial copy-paste exercises that test only rote memorization.
11. **Helpful Hints:** Provide tiered, beginner-friendly hints that guide without spoiling the answer.
12. **No Eager Solution Spoilers:** Never reveal the complete reference solution prematurely.
13. **Actionable Error Feedback:** Provide meaningful, friendly explanations when an attempt fails.
14. **Hidden Test Cases:** Include hidden evaluation test cases to prevent hardcoding specific outputs.
15. **Edge Case Validation:** Verify boundary conditions in test cases.
16. **Behavioral & Output Validation:** Validate both stdout outputs and internal state/variable values where relevant.
17. **Multiple Valid Solutions:** Support multiple valid coding approaches (e.g., `x += 1` vs `x = x + 1`).
18. **No Rigid Formatting Checks:** Do not fail independent exercises over trivial whitespace or comment formatting differences.
19. **Semantic Validation:** Use AST comparison and test execution rather than fragile raw string matching for independent problems.
20. **Attempt History:** Track and store exercise attempt history, error counts, and completion timestamps in SQLite.

---

## 3. Topic Unlocking and Progress Rules

The learning progression must be deterministic, tamper-resistant, and 100% reliable.

1. **Immutable Topic IDs:** Every topic must have a stable, immutable unique ID.
2. **Deterministic Course Sequence:** Topic sequencing must be driven by course data, not ad-hoc UI navigation.
3. **Dedicated Progress Service:** All unlocking logic must reside in a dedicated progress service/domain model.
4. **No Unlocking in UI:** Never implement topic completion or unlocking criteria directly inside UI components.
5. **Track Reading Completion:** Track whether the lesson reading content has been completed.
6. **Track Guided Practice:** Track completion of all guided coding steps.
7. **Track Visualizer Steps:** Track execution visualizer completion where required by the lesson.
8. **Validate Independent Practice:** Verify that all required independent practice exercises pass validation.
9. **Checkpoint Criteria (3 Distinct Problems):** A checkpoint requires passing three distinct, successful problems.
10. **Anti-Spam Checkpoint Rule:** Repeatedly executing the same problem solution must NOT count as three distinct problems.
11. **Failed Attempts Block Progression:** Failed or incomplete attempts must never unlock subsequent topics.
12. **Transactional Checkpoints:** Checkpoint completion and topic unlocking must be written to SQLite in a single transaction.
13. **Strict Unlock Gate:** The next topic must unlock ONLY after all prerequisites and criteria are completely satisfied.
14. **Idempotent Updates:** Prevent duplicate completion records or double-counted achievements.
15. **Persistent Restoration:** Reliably restore learner progress from SQLite on application startup.
16. **Interrupted Checkpoints:** Gracefully handle interrupted or aborted checkpoint sessions without corrupting state.
17. **Crash-Proof Progress:** Ensure no learner progress is lost if the application crashes or is closed abruptly.
18. **Clear Entity Taxonomy:** Maintain a clear distinction between:
    - *Attempt:* A single submission or run.
    - *Successful Exercise:* A validated solution to a specific problem.
    - *Completed Topic:* All topic requirements fulfilled.
19. **Extensible Unlock Rules:** Support future adjustments to progression rules without refactoring the application.
20. **Protected User Data:** Never reset, truncate, or overwrite existing user progress without explicit confirmation.

