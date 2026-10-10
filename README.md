# CodeChamp — Offline Coding Tutor

A beginner-friendly coding tutor for phones (JavaScript and Python paths) whose AI tutor runs **entirely on-device**. Built for the AppBuildersPH Hackathon 2026 (theme: Local AI).

## Why local AI?

- **No usage cap** – a stuck learner can ask the tutor unlimited times.
- **No signal needed** – lessons, tests, hints and the tutor all work in airplane mode.
- **Private** – code and mistakes never leave the device.

The only network use is the one-time model download (~1 GB).

## What runs where

| Capability | Runs |
|---|---|
| Tutor model (Qwen2.5-Coder-1.5B, Q4_K_M via `llama.rn`) | On device |
| Code execution + tests (JS Web Worker, Python via Skulpt) | On device |
| Lessons, hints, mastery, streaks (SQLite) | On device |
| Model download | Internet, once |

## Key design decisions

- **Tests decide, AI explains.** Correctness comes from deterministic visible + hidden tests, never the small model.
- **Anti-leak tutoring.** Prewritten hints are verified not to contain solution code; model output passes post-generation guards.
- **Genuine-use verification.** AST checks (acorn) reject hard-coded outputs and no-op required constructs.
- **Mastery-driven practice.** Per-concept scores drive "what to practice next" and a readiness gate.

See [DECISIONS_LOG.md](DECISIONS_LOG.md), [DESIGN.md](DESIGN.md), [DISCLOSURES.md](DISCLOSURES.md).

## Run it

```bash
npm install
npx expo run:android        # native modules (llama.rn) need a dev build, not Expo Go
npm test                    # 49 unit tests (core logic)
npx tsc --noEmit            # typecheck
npm run content:verify      # verifies all 50 problems (reference passes, mistake variants fail, hints don't leak)
```

## Structure

```
src/core/      pure TypeScript: test harness, genuine-use checks, mastery, tutor guards
src/content/   JS + Python lessons and problems
src/services/  on-device LLM, sandbox runners
src/state/     zustand store + SQLite persistence
src/ui/        screens, components, theme tokens
tests/         jest suites (harness, adversarial cheats, mastery, tutor, python, lessons)
```

## License

MIT
