# Offline Python Runtime & Execution Visualizer

---

## 1. Pyodide WebAssembly Execution

- **100% Offline:** Pyodide Wasm is bundled locally in the mobile application.
- **Isolated Thread:** Runs inside a background worker / hidden WebView context with a validated messaging bridge.
- **Watchdog Protection:** Enforces a 5-second execution timeout guard and a 500-step ceiling to abort runaway infinite loops safely without freezing the React Native UI.

---

## 2. Line-by-Line Execution Visualizer

- **Authentic Instrumentation:** Uses Python's native `sys.settrace()` to intercept `line` events.
- **Step Frames Capture:**
  - `lineNumber`: Actively executing line in the code viewer.
  - `variables`: Snapshot of active variables with types and values.
  - `stdout`: Real-time text printed up to each step.
  - `explanation`: Plain-English narrative describing variable assignments, math operations, and condition evaluations.
- **Scrubber Controls:** Reset (`|◁`), Previous (`◀`), Auto-Play/Pause (`▷ / ⏸`), Next (`Next ▶`).

