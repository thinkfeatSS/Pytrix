# 06 - Database and Data Integrity Rules

**Project:** Pytrix — Python Learning Mobile Application  
**Document Type:** Mandatory SQLite Database, Migration & Data Integrity Rules  
**Scope:** SQLite schemas, repositories, migrations, transactions, concurrency, and persistence.

---

## 1. Database and Data Integrity Rules

1. **SQLite as Single Truth:** Use SQLite as the primary offline relational database for persistent application and user data.
2. **Repository Pattern:** Encapsulate all database queries inside dedicated repository classes or modules. No raw SQL inside components or hooks.
3. **Parameterized Queries:** Always use parameterized SQL queries (`?` placeholders).
4. **Zero SQL Concatenation:** Never concatenate dynamic or user-supplied strings directly into SQL queries to prevent SQL injection.
5. **Atomic Transactions:** Wrap multi-step mutations and related updates (e.g., exercise completion + checkpoint update + topic unlock) inside database transactions (`BEGIN TRANSACTION ... COMMIT`).
6. **Versioned Migrations:** Manage schema changes using sequential, numbered migration scripts (e.g., `001_initial_schema.sql`, `002_add_checkpoints.sql`).
7. **No Ad-Hoc Schema Changes:** Never modify live or existing SQLite tables without planning, testing, and documenting a migration.
8. **Targeted Indices:** Add indexes to columns frequently queried or joined (e.g., `topic_id`, `course_id`, `status`, `user_id`).
9. **Foreign Key Integrity:** Enable and enforce foreign keys (`PRAGMA foreign_keys = ON;`) to protect referential integrity.
10. **Enforce Unique Identifiers:** Use explicit `PRIMARY KEY` and `UNIQUE` constraints to prevent accidental duplication.
11. **Pre-Persistence Validation:** Validate domain models and payload schemas in JavaScript before passing them to the database layer.
12. **Initialization Resilience:** Handle database initialization errors gracefully, logging diagnostics and providing recovery options.
13. **Corruption & Recovery:** Implement safe recovery paths if SQLite database files become corrupted or unreadable.
14. **Avoid Redundant Reads:** Cache immutable data in memory where appropriate; do not re-query unchanged records repeatedly in tight loops.
15. **Avoid Unnecessary Writes:** Only persist dirty or mutated records. Avoid writing identical data repeatedly.
16. **Pagination for Large Queries:** Use `LIMIT` and `OFFSET` or cursor-based pagination for large query results (e.g., execution history or logs).
17. **Atomic Progress Updates:** Ensure learner progress counters, timestamps, and completion flags update atomically.
18. **Duplicate Record Prevention:** Use `INSERT OR IGNORE` or `INSERT OR REPLACE` with clear intention, preventing phantom duplicates.
19. **Interrupted Writes:** Handle interrupted disk writes and process termination safely using WAL (Write-Ahead Logging) mode if supported.
20. **Migration Regression Tests:** Always test schema migrations against realistic pre-existing user data fixtures to verify non-destructive updates.
21. **Upgrade Data Preservation:** Guarantee zero loss of user progress or custom preferences when the app binary is updated.
22. **Lifecycle Distinction:** Never assume that bundled read-only course content and dynamic user progress share the same lifecycle. Keep them separated.
23. **Efficient Operations:** Profile slow queries, minimize table locks, and execute heavy read/write operations off the main thread.
24. **Document Schema Changes:** Maintain an up-to-date `DATABASE.md` documenting table schemas, column types, relationships, and migration history.

