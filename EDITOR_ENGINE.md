# Handwriting-Inspired Code Editor Engine

---

## 1. Core Concept

The editor simulates a handwriting copybook (such as calligraphy books with dotted lines for learning writing letters). In Pytrix, beginner learners see the reference program in a soft, faded gray ghost layer (`#555A70`). As they type upon it:
- Correct characters illuminate in syntax colors.
- Incorrect characters halt typing and trigger real-time error guidance.
- Brackets, quotes, colons, and indentation are verified character by character.

---

## 2. Practice Modes

### Mode A: Trace the Code
- Complete code transcription over the ghost reference.
- Live progress percentage bar $(0\% \rightarrow 100\%)$.
- Calculates matching prefix and remaining ghost text.

### Mode B: Complete Missing Code
- Structure of the program is visible; learners fill in specific missing expression slots.

### Mode C: Independent Coding
- Full blank canvas editor.
- Live syntax checks:
  - Bracket balancing (`()`, `[]`, `{}`).
  - Colon validation on `if`, `elif`, `else`, `while`, `for`, `def`.
  - Unclosed string detection.

