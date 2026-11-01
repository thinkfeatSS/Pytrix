# Topic Unlocking & Checkpoint Progression System

---

## 1. Topic Progression State Machine

```
[ LOCKED ] ──Prerequisites Met──▶ [ AVAILABLE ]
                                        │
                               User Opens Lesson
                                        ▼
                                [ IN_PROGRESS ]
                                        │
                         Pass 3 Distinct Checkpoint Problems
                                        ▼
                                 [ COMPLETED ] ──▶ (Unlocks Next Topic)
```

---

## 2. Checkpoint Assessment Rules

1. **3 Distinct Problems Required:** Progression requires passing three distinct, unique challenge problems.
2. **Anti-Spam / Anti-Duplicate Rule:** Repeatedly executing or submitting the same problem counts as only 1 solution.
3. **Atomic Commit:** When the 3rd distinct problem passes, updating the current topic to `COMPLETED` and unlocking the next topic to `AVAILABLE` occurs in a single SQLite transaction.
4. **Scoring:**
   - Guided exercise: +50 XP
   - Checkpoint completion: +250 XP
   - User Level: $\lfloor \text{XP} / 300 \rfloor + 1$
   - Streak: Increments on daily active topic completion.

