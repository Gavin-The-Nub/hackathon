# DECISIONS LOG

This file logs all non-trivial technical, product, and design decisions made during the hackathon implementation.

| Date | ID | Decision | Rationale |
|---|---|---|---|
| 2026-10-09 | DEC-001 | Focus MVP on JavaScript Basics roadmap only; Python marked stretch. | With ~12 hours to submission, JavaScript has the lowest runtime risk (native Web Worker) and maximizes technical stability for demo. |
| 2026-10-09 | DEC-002 | Brand name chosen as "CodeChamp". | Clean, punchy name oriented towards coding practice and mastery. Logo deferred for wordmark. |
| 2026-10-09 | DEC-003 | Target device configured as Tecno Camon 40 (8GB RAM, 128GB Storage, MediaTek Helio G100). | CPU inference default (`n_gpu_layers: 0`, 4 threads) matches Mali GPU profile and PRD D15. |
| 2026-10-09 | DEC-004 | Keep `READY_THRESHOLD = 70` and author ~5 problems per concept (25 total). | Allows learners to reach "Ready to build" state authentically through repeated practice variants without artificial score inflation. |
| 2026-10-09 | DEC-005 | Implement "Show where I can improve" option in soft gate as deterministic, rule-based analysis. | Accurately explains missing constructs or non-contributing loops using prewritten hints and parser data without relying on unreliable small-model evaluation. |
| 2026-10-09 | DEC-006 | Prewritten-first hint display with crossfade to on-device streaming. | Prevents demo lag while small model generates tokens; learner always gets instant feedback even under cold-start latency. |
| 2026-10-10 | DEC-007 | Omit GBNF regex grammar in llama.rn completion, relying on post-generation guards G1-G6 and smart question trimming. | PRD §12.5 (Decision H12): GBNF character repetition `{40,400}` and character class exclusions conflicted with BPE token boundaries on Qwen2.5-Coder, causing premature truncation and sampling errors. Post-generation guards with sanitization provide robust leak prevention without choking the sampler. |
