# SQLite Database & Data Integrity Specification

---

## 1. Schema Overview

### `courses`
- `id` (TEXT, PK): Unique course ID (e.g. `course_python_basics`)
- `title` (TEXT, NOT NULL)
- `order_index` (INTEGER, NOT NULL)
- `description` (TEXT)

### `modules`
- `id` (TEXT, PK): Module ID (e.g. `mod_1`)
- `course_id` (TEXT, FK -> courses.id)
- `number` (INTEGER, NOT NULL)
- `title` (TEXT, NOT NULL)
- `order_index` (INTEGER, NOT NULL)
- `description` (TEXT)

### `topics`
- `id` (TEXT, PK): Topic ID (e.g. `topic_1_1`)
- `module_id` (TEXT, FK -> modules.id)
- `title` (TEXT, NOT NULL)
- `order_index` (INTEGER, NOT NULL)
- `learning_objective` (TEXT, NOT NULL)
- `theory_markdown` (TEXT, NOT NULL)
- `pitfalls_markdown` (TEXT)
- `prerequisite_topic_id` (TEXT, nullable)

### `exercises`
- `id` (TEXT, PK): Exercise ID (e.g. `ex_1_1_1`)
- `topic_id` (TEXT, FK -> topics.id)
- `order_index` (INTEGER, NOT NULL)
- `exercise_type` (TEXT, NOT NULL): `MODE_A_TRACE`, `MODE_B_FILL_IN`, `MODE_C_INDEPENDENT`, `CHECKPOINT`
- `title` (TEXT, NOT NULL)
- `prompt` (TEXT, NOT NULL)
- `logic_explanation` (TEXT, NOT NULL)
- `step_by_step_json` (TEXT)
- `starter_code` (TEXT, NOT NULL)
- `reference_solution` (TEXT, NOT NULL)
- `test_cases_json` (TEXT, NOT NULL)
- `hints_json` (TEXT)
- `is_checkpoint` (INTEGER, DEFAULT 0)

### `user_topic_progress`
- `id` (TEXT, PK)
- `topic_id` (TEXT, UNIQUE, FK -> topics.id)
- `status` (TEXT, NOT NULL): `LOCKED`, `AVAILABLE`, `IN_PROGRESS`, `COMPLETED`
- `checkpoint_problems_solved` (INTEGER, DEFAULT 0)
- `completed_at` (TEXT)
- `updated_at` (TEXT, NOT NULL)

### `user_submissions`
- `id` (TEXT, PK)
- `exercise_id` (TEXT, FK -> exercises.id)
- `topic_id` (TEXT, FK -> topics.id)
- `submitted_code` (TEXT, NOT NULL)
- `is_passed` (INTEGER, NOT NULL)
- `error_message` (TEXT)
- `execution_time_ms` (INTEGER)
- `created_at` (TEXT, NOT NULL)

---

## 2. Integrity Protections

- **Parameterized Queries:** All SQL queries use `?` parameter placeholders.
- **Foreign Keys:** Enforced via `PRAGMA foreign_keys = ON;`.
- **Atomic Transactions:** Multi-table mutations (such as checkpoint completion and dependent topic unlocking) execute within `BEGIN TRANSACTION ... COMMIT` blocks.
- **Data Preservation:** Seed operations use `INSERT OR IGNORE` on user progress, guaranteeing user progress is never overwritten when course content is refreshed.

