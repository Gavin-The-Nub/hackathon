---
title: "Offline Coding Tutor: Product Requirements Document"
version: "1.0"
date: "2026-10-09"
status: "Consolidated. Ready for implementation."
audience: "AI code assistants (primary), human teammates (secondary)"
platform: "Android first. React Native + Expo (development build). TypeScript."
on_device_model: "Qwen2.5-Coder-1.5B-Instruct, Q4_K_M GGUF, run through llama.rn"
consolidates:
  - "PRD v0.1 (owner: Axelle)"
  - "DESIGN.md (included verbatim as Appendix C)"
  - "Team strategy sessions for AppBuildersPH Hackathon 2026"
---

# Offline Coding Tutor: Product Requirements Document

## 0. Read this first (instructions for AI code assistants)

### 0.1 Purpose of this document

This file is the single source of truth for building the Offline Coding Tutor. It contains the full context a code assistant needs: what the product is, why it exists, the competition it is built for, every requirement, the data model, the architecture, the AI tutor specification, the test plan, and the design system (Appendix C). Read it completely before writing code.

### 0.2 Precedence when sources disagree

1. This PRD (sections 0 to 19) wins on behavior, logic, data, and scope.
2. Appendix C (DESIGN.md) wins on visual design, layout, motion, copy tone, and screen structure.
3. Appendix A lists every place where this PRD overrides or clarifies an older source. Those overrides are final.
4. In this document, `DESIGN §n` means numbered section n of the DESIGN.md text in Appendix C.

### 0.3 Status tags

Every non-trivial decision or requirement carries one of these tags.

| Tag | Meaning | What you do |
|---|---|---|
| `[DECIDED]` | Confirmed by the team | Implement exactly |
| `[PRD0.1]` | From the original PRD v0.1 | Implement as written here (this PRD may refine it) |
| `[DESIGN]` | From DESIGN.md ("Decisions locked") | Implement exactly |
| `[ADDED]` | Added during review to fix a gap or raise quality | Implement; treat as required unless an OPEN item says otherwise |
| `[PROPOSED]` | Suggested, not confirmed | Implement only if its priority level (P0/P1/P2) says so |
| `[OPEN]` | Team has not decided | Use the stated default, keep it configurable in `src/config/constants.ts` |
| `[VERIFY]` | External fact or API detail that has not been tested | Check it early on the demo phone. If it fails, use the stated fallback and update claims (rule H12) |

### 0.4 Priority levels

| Level | Meaning |
|---|---|
| P0 | Must ship. The demo and submission fail without it |
| P1 | Should ship. Cut only after all P2 items are cut |
| P2 | Only if time remains |

The cut order if time runs short is in section 18.3.

### 0.5 Requirement language

MUST, MUST NOT, SHOULD, and MAY carry their RFC 2119 meanings. Requirement IDs look like `FR-AREA-nn`. Quote the ID in commit messages and test names.

### 0.6 Hard rules (apply to every line of code you write)

| ID | Rule |
|---|---|
| H1 | Tests decide correctness. The model MUST NOT decide pass or fail. The model MUST NOT receive the reference solution or the mistake-variant code. |
| H2 | After the one-time model download there MUST be zero network calls. No analytics, telemetry, crash-reporting SDKs, remote fonts, CDN scripts, remote images, or remote config. |
| H3 | Learner code runs only in the sandboxed runner: a Web Worker inside the WebView, under a Content Security Policy, 3000 ms timeout, no network, no DOM access, no native bridge except `postMessage`. |
| H4 | AI output is guidance, never a verdict. It is never styled green or red and never overrides test results. |
| H5 | AI text MUST NOT contain code or the full solution. Enforce with a decoding grammar (when supported), output guards, and prewritten fallbacks. |
| H6 | Core logic (harness, generators, genuine-use checks, mistake classifier, mastery, recommendation, XP, streak, prompt builder, output guards) MUST be pure TypeScript with no React Native or Expo imports, and MUST have Jest tests that run in Node. |
| H7 | Every number about performance, accuracy, or cheat-catch rate shown in the UI, README, video, or pitch MUST come from a script in `bench/` whose output is committed. Never hard-code metrics. |
| H8 | Demo seed data MUST be dev-only (hidden dev menu or build flag), MUST be disclosed in the README, and MUST NOT feed any benchmark. |
| H9 | Content (problems, tests, hints, concept notes) is authored from scratch by the team. Do not copy text or code from other projects, courses, or datasets. |
| H10 | Every library, model, font, and AI development tool MUST be listed in `DISCLOSURES.md` at the moment it is added. |
| H11 | Do not add features, screens, dependencies, or network services that are not in this PRD. If one seems necessary, log it in `DECISIONS_LOG.md` and choose the simplest option that satisfies H1 to H10. |
| H12 | Never claim a capability in UI copy, README, or comments that the code does not implement. If a `[VERIFY]` item fails, use its fallback and update the claims. |
| H13 | UI copy follows DESIGN §8: warm, short, second person, never "wrong" or "failed" about the person. |
| H14 | No hidden text or instructions aimed at AI reviewers anywhere in the repo, video, or posts. No keyword stuffing. Claims must be verifiable. |

### 0.7 When something is missing or ambiguous

1. Pick the simplest behavior that satisfies H1 to H14.
2. Record it in `DECISIONS_LOG.md` with one line of rationale.
3. Do not stop to ask unless the item is an `[OPEN]` decision, in which case use its default.

### 0.8 Document map

| Section | Content |
|---|---|
| 1 | Product summary |
| 2 | Hackathon context and judging |
| 3 | Problem, users, positioning |
| 4 | Goals, non-goals, success criteria |
| 5 | Decisions register |
| 6 | Open decisions with defaults |
| 7 | Scope and priorities |
| 8 | User flows |
| 9 | Functional requirements |
| 10 | Data model and content schema |
| 11 | Architecture and tech stack |
| 12 | AI tutor specification |
| 13 | Non-functional requirements |
| 14 | Testing and verification |
| 15 | Content blueprint |
| 16 | Submission and evidence |
| 17 | Risks |
| 18 | Build sequence and cut order |
| 19 | Glossary |
| Appendix A | Reconciliation notes |
| Appendix B | Sources and verification status |
| Appendix C | DESIGN.md (verbatim) |

---

## 1. Product summary

### 1.1 What it is

Offline Coding Tutor is an Android app that teaches coding beginners through small practice problems. The learner writes code in an in-app editor. Real tests run on the phone and decide whether the code is right. A small AI model that lives on the phone (Qwen2.5-Coder-1.5B-Instruct) gives hints and explains errors, but never writes the solution. After a one-time model download, the whole app works in airplane mode.

Working title: "Offline Coding Tutor". Brand name and logo are not decided (Open decision O7).

### 1.2 What it does (capabilities)

1. Teaches through a roadmap of problems grouped by concept (variables, conditionals, loops, functions, arrays or lists). `[PRD0.1]`
2. Runs the learner's JavaScript or Python in a sandbox on the phone and checks it with tests. `[PRD0.1]`
3. Checks that the learner really solved the problem, not just matched the visible tests: hidden randomized tests and a check that required constructs (such as a `for` loop) do real work. `[ADDED]`
4. Gives a 3-level hint ladder and an "Explain my error" action from the on-device model, with a prewritten hint shown instantly and used as fallback. `[PRD0.1]`
5. Recognizes each learner's patterns through mastery scores per concept (0 to 100, shown as /10) and uses them to choose what to practice next. `[DECIDED]`
6. Motivates with XP, levels, and daily streaks, while mastery bars remain the main progress view. `[DESIGN]`
7. Stores everything on the phone. No accounts, no telemetry. `[PRD0.1]`

### 1.3 Plain-language description (reusable in README and pitch)

Imagine a coding gym inside your phone. It gives you a small puzzle. You type your answer. A robot referee runs your answer on lots of test examples. The referee never guesses. It only checks. If you get stuck, a little helper robot that lives inside your phone gives you a clue, like "look at the first test that failed," but never the whole answer. The app keeps score of how good you are at each skill, like a video game skill tree: loops, functions, lists. If one skill is low, your next puzzle practices that skill. It even checks that you did not cheat, like writing the answer straight into the code instead of using the loop you were asked to use. And it all works with no internet.

### 1.4 Why the AI runs on the device

1. No usage cap. Many cloud coding tools limit free users. A learner stuck on one problem can ask the on-device tutor as many times as needed.
2. No signal needed. The lessons, tests, and hints all work offline after the model download.
3. Privacy. The learner's code and mistakes never leave the phone.

Honest limits to state publicly: the on-device model is small, so its hints are shorter and less capable than a cloud model's; tests, not the AI, decide correctness; the model download is about 1 GB; the model warms the phone and uses battery. `[ADDED]`

---

## 2. Hackathon context and judging

The product is built for the AppBuildersPH Hackathon 2026. Optimize for these facts.

### 2.1 Event facts

| Item | Value |
|---|---|
| Event | AppBuildersPH Hackathon 2026 |
| Theme | Local AI: "Useful AI experiences where meaningful AI computation happens on the user's device, rather than depending entirely on cloud inference." |
| Challenge | "Build an AI product that remains genuinely useful when the cloud disappears." |
| Build Day | Friday 2026-10-09, remote. Official kickoff 1:00 PM Philippine time |
| Submission deadline | Saturday 2026-10-10, 10:00 AM. No extensions. One submission. Code frozen. Repo public by then |
| Demo Day | Saturday 2026-10-10, 1:00 PM to 7:00 PM, Cyberzone, SM Makati. Finalists must attend in person |
| Finalists | 10 to 15 teams. Pitch 5 minutes, then 3 minutes Q&A |
| Team size | 1 to 4 |
| Awards | Champion, special sponsor awards, People's Choice, Best Product Experience |
| Sponsors | PCExpress (venue), AMD, ASUS, Cognition/Devin, TutorialsDojo, WhiteCloak, PocketDevs, PDAX |

### 2.2 Judging criteria (official weights)

| Criterion | Weight | Official question | How this product must answer |
|---|---|---|---|
| Problem and Usefulness | 25% | Is there a clear user with a real problem? | Beginners on phones, offline or capped cloud AI, answer-leaking tutors, gameable autograders (section 3) |
| Local AI Implementation | 25% | Is local inference fundamental, and does it give a meaningful advantage? | Unlimited hints, offline, privacy; measured on-device latency; honest limits (section 12) |
| Technical Execution | 20% | Does it work reliably? | Tests-decide architecture, sandbox runner, benchmark scripts, airplane-mode proof |
| Innovation | 15% | Is it new? | Genuine-use verification, mastery-driven practice, adversarial cheat suite |
| Product and Demo Quality | 15% | Is it polished and clear? | DESIGN.md system, 90-second demo path, offline chip |

Key rules from the briefing: half the score is usefulness and how real the Local AI is. Fake benchmarks can void results.

### 2.3 Rules to respect

1. Everything is substantially built during the hackathon. Open-source libraries, open models, and AI coding tools are allowed if disclosed.
2. Pre-existing projects, fake benchmarks, and external help from non-participants are grounds for dispute.
3. Core local AI must not depend entirely on cloud inference.
4. The first commit MUST come after the 1:00 PM kickoff. Commit steadily. No single giant commit.

### 2.4 Submission checklist (the app and repo must make each item easy)

1. Project name, short description, team members, public GitHub repo.
2. Demo video of about one minute.
3. Post on X or LinkedIn tagging @cognition and Devin with #AppBuildersPH.
4. Disclosures: models, frameworks and libraries, APIs and cloud services, existing code and assets, AI development tools.
5. What runs locally and what needs the internet.
6. The answer to: "Why does this product benefit from running AI locally?"

### 2.5 Approved answer text for "Why local" (publish only after the airplane-mode test passes, rule H12)

> Offline Coding Tutor teaches beginners to code on a phone, and its tutor is a small AI model that runs on the phone itself. After a one-time model download of about 1 GB, everything works in airplane mode. There are three reasons it must be local. First, there is no usage cap: many cloud coding tools limit free users, but a learner who is stuck can ask the on-device tutor as many times as needed. Second, no signal is needed: the lessons, tests, and hints all work offline. Third, privacy: the learner's code and mistakes never leave the phone. We are honest about the trade-off: the on-device model is small, so tests, not the AI, decide whether code is correct, and the model only explains and nudges. The only internet use is the one-time model download.

---

## 3. Problem, users, positioning

### 3.1 Problems this product solves

| ID | Problem | Evidence status |
|---|---|---|
| P1 | Many coding tutors need a connection and a paid or rate-limited cloud AI. Learners in low-connectivity areas or on limited data are left out. | `[PRD0.1]`. Public pricing pages show AI tutoring gated or capped on free tiers (secondary, not tested hands-on). |
| P2 | Cloud AI tutors often hand over the full solution, which weakens learning. | `[PRD0.1]`. Public comparisons report general chatbot study modes giving answers after a nudge (secondary source). |
| P3 | Output-only autograders can be satisfied without understanding: hard-coded outputs, or a required loop that does no work. | `[ADDED]`. See 3.3. |
| P4 | Beginners do not know what to practice next. Apps show scores, not skills. | `[DECIDED]` (mastery scores) |

### 3.2 Users

| Segment | Description |
|---|---|
| Primary | Absolute beginners (students, career switchers) who want to learn JavaScript or Python on a phone |
| Secondary | Learners with unreliable or expensive internet |
| Assumed device | Android 10 or newer, 6 GB RAM recommended, 4 GB RAM minimum (works with the smallest model) |

### 3.3 Facts to use (with status)

Use these only with the stated caution. Do not quote engagement statistics (DESIGN §2 caveat).

| Fact | Source type | Caution |
|---|---|---|
| Up to 35% of students fail a first programming course (Ateneo study) | Academic paper (secondary citation) | Say "up to" |
| Android is about 88% of Philippine mobile OS share (June 2026) | Statcounter | |
| Budget phones dominate the Philippines (average selling price about 10,500 PHP; Transsion about 37% share) | Market reports | |
| CodeChum (used in 100+ Philippine schools) offers "Minimum Requirements" that unlock scoring only when required functions or statements are present, shows students the test cases that determine their score, and offers teachers AI generation of solutions and test cases | help.codechum.com | Inferred weakness: presence checks and visible fixed tests can be gamed. Not tested hands-on. Never demo cheating a real school platform |
| Hidden tests and syntax-tree analysis are the standard defenses against hard-coded answers; some graders (for example CodeGrade) offer teacher-written structure checks | Academic and vendor docs | Position this product as automatic, learner-side, and offline, not as the first to check structure |
| Codecademy free learners get a limited number of AI prompts; other apps put AI tutors in paid tiers | Public help and pricing pages | Not tested hands-on |

### 3.4 Arguments to avoid

Do not argue data cost (Philippine prepaid data is cheap now), faster-than-cloud speed, or better answer quality. These lose. Do not say "first", "only", "no one else", "smarter than", or "works with no internet" without the one-time download caveat. `[ADDED]`

### 3.5 Positioning copy (specific wording avoids collision with generic entries)

- Short description (submission form): "An offline Android coding tutor for beginners. Real tests decide, a small on-device AI gives hints but never the answer, and the app checks that your loop really does the work."
- Plain-speak pitch: "Most phone coding apps need the internet and a cloud AI. Ours has the tutor inside the phone. Tests decide if your code is right, the AI only nudges, and a check makes sure you did not fake it."

### 3.6 Honest competition note

Offline on-device tutors are likely a common idea in this competition. Differentiation comes from three things that must be real and measured: genuine-use verification, mastery-driven practice, and published evidence (section 16). Do not rely on "offline tutor" alone.

---

## 4. Goals, non-goals, success criteria

### 4.1 Goals

| ID | Goal |
|---|---|
| G1 | The full learning loop works offline: read problem, write code, run tests, get feedback, get a next-step recommendation. `[PRD0.1]` |
| G2 | Correctness is decided by tests, never by the model. `[PRD0.1]` |
| G3 | AI feedback guides without revealing full solutions. `[PRD0.1]` |
| G4 | Next-step suggestions are personalized from the learner's own mastery scores. `[PRD0.1]` `[DECIDED]` |
| G5 | The app verifies genuine solving, not just matching outputs. `[ADDED]` |
| G6 | Every public claim is backed by a reproducible script and committed results. `[ADDED]` |
| G7 | The product feels polished: playful, phone-first, fast feedback (Appendix C). `[DESIGN]` |

### 4.2 Non-goals for the MVP

Project-based learning modules (Phase 2), C or Java support (Phase 2), free-form chat, accounts or cloud sync, social features, certificates, badges, leaderboards, hearts or lives, in-app currency, mascot, retrieval or vector databases, fitted knowledge-tracing models, Pyodide, the optional Llama 3.2 3B model, GPU or NPU inference offload, Taglish tutor text. `[PRD0.1]` `[DESIGN]` `[ADDED]`

### 4.3 Success criteria (acceptance)

| ID | Criterion |
|---|---|
| S1 | The 90-second demo path (DESIGN §12) completes in airplane mode on the demo phone. |
| S2 | Every reference solution passes its visible and hidden tests. Every common-mistake variant fails at least one test and is classified with its tag. |
| S3 | Cheat suites run. The script reports cheats caught out of cheats tried, and valid alternatives wrongly flagged out of valid alternatives tried, for every implemented check. Fix or document any miss. Never edit the suite to hide a miss. |
| S4 | Hint-leak test: zero leaks across the evaluation set. Any leak is a bug. |
| S5 | Measured on-device numbers are recorded for the demo phone: model load time, time to first token, tokens per second, total hint time. |
| S6 | Zero network calls after the model download, verified in airplane mode and by a dev-only network tripwire. |
| S7 | `npm test` and `npm run content:verify` pass. |
| S8 | The submission package in section 16 is complete. |
| S9 | Mastery, recommendation, XP, and streak unit tests pass and match section 9. |
| S10 | P0 screens pass the accessibility checklist (DESIGN §10). |

---

## 5. Decisions register

| ID | Decision | Tag |
|---|---|---|
| D01 | Platform is Android first. iOS is not targeted in the MVP. | `[PRD0.1]` |
| D02 | App framework is React Native with Expo (development build, not Expo Go), TypeScript. | `[PRD0.1]` |
| D03 | On-device model is Qwen2.5-Coder-1.5B-Instruct, Q4_K_M GGUF, run through llama.rn. | `[DECIDED]` |
| D04 | Tests decide correctness. The model explains and encourages. | `[PRD0.1]` |
| D05 | The app recognizes learner patterns through mastery scores. A mastery score measures how proficiently a learner uses the programming foundations, functions, and everything else that must be mastered so they can reach the level of building a genuine program through this app's pedagogical method. | `[DECIDED]` |
| D06 | Mastery is stored 0 to 100 per concept and displayed as /10 with one decimal. | `[PRD0.1]` `[DESIGN]` |
| D07 | Review threshold is 40 of 100 (4/10). | `[PRD0.1]` `[DESIGN]` |
| D08 | Gamification: XP, levels, daily streaks with one freeze, mastery bars, weakest-concept callout. No mascot, badges, or social. | `[DESIGN]` |
| D09 | Light, dark, and system theme with a user toggle. | `[DESIGN]` |
| D10 | Two roadmaps in v0.1: JavaScript Basics and Python Basics. First deep roadmap is open (O1). | `[PRD0.1]` `[OPEN]` |
| D11 | Genuine-use verification: hidden randomized tests, required-construct check, contribution check, and three outcome labels. | `[ADDED]` |
| D12 | Every problem ships with cheat solutions and valid alternatives used by an automated suite. | `[ADDED]` |
| D13 | AI output is constrained at decoding time by a grammar that forbids code characters, with post-generation guards and prewritten fallbacks. | `[ADDED]` `[VERIFY]` |
| D14 | Prompt budget is about 300 tokens (hard max 800). Learner code is truncated to 40 lines. | `[ADDED]` (PRD v0.1 said 60 lines) |
| D15 | Inference is CPU-only by default. No GPU or NPU offload in the MVP. | `[ADDED]` `[VERIFY]` |
| D16 | The optional Llama 3.2 3B model is deferred. | `[ADDED]` |
| D17 | Common mistakes are detected by running known buggy variants and matching outputs. Mistake tags feed the weakest-concept callout and review item choice. | `[ADDED]` |
| D18 | No retrieval system. Curated concept notes and failing-test context go in the prompt. | `[ADDED]` |
| D19 | Mastery uses fixed point rules. No fitted models in the MVP. | `[ADDED]` |
| D20 | Streaks, XP, and levels are in scope (DESIGN decisions locked). PRD v0.1 had listed streaks as Phase 2. DESIGN wins. | `[DESIGN]` |
| D21 | Tutor text is English only for the hackathon. | `[DESIGN]` |
| D22 | Two build flavors: `download` (has INTERNET permission, downloads the model) and `offline` (no INTERNET permission, model is placed by the installer). | `[ADDED]` |
| D23 | Earlier strategy discussions explored Java, C#, and C++ tutors. The current scope is JavaScript and Python. C and Java are Phase 2. | `[PRD0.1]` |
| D24 | No telemetry. The app stores a local event log for evaluation only; it never leaves the device. | `[PRD0.1]` `[ADDED]` |

---

## 6. Open decisions with defaults

Use the default. Keep each value configurable. Do not block on these.

| ID | Question | Default | Notes |
|---|---|---|---|
| O1 | Which language is the first deep roadmap? | JavaScript first. Python second (stretch). | JavaScript has the lowest runtime risk (native Web Worker). Python needs Skulpt. If the team picks Python first, only content ordering and the P-levels in section 7 change. |
| O2 | "Ready to build" threshold and calibration | `READY_THRESHOLD = 70` (7/10) | Calibration problem: starting at 0 with +15 per first-try pass, reaching 70 needs at least 5 first-try passes in a concept (15 x 5 = 75). MVP content has 1 base problem per concept. Resolve by adding practice items per concept, lowering the threshold, or accepting that "ready" is not reachable in the MVP demo. Never fake it (H8). |
| O3 | What is a "fail" for the "easier review after 2 fails" rule (DESIGN §2)? | A struggle is an attempt that ended `abandoned`, or a completion that needed 3 or more Run tests (`STRUGGLE_ATTEMPTS_TO_PASS = 3`). Two consecutive struggles trigger one easier review problem. | |
| O4 | XP level formula | The XP needed to go from level n to level n+1 is 100 x n (not cumulative totals). | DESIGN §6 wording: "Level n needs 100 x n XP." |
| O5 | Mastery display scale | /10 with one decimal | DESIGN assumed /10 |
| O6 | Problem screen layout | Editor-first, as DESIGN §5.3 | Test on the demo phone |
| O7 | Brand name and logo | Working title "Offline Coding Tutor". Indigo with flame or spark direction. | DESIGN §15 |
| O8 | Tutor language | English only | Taglish only if tested reliable (not for the hackathon) |
| O9 | Genuine-use scope in Python | Hidden randomized tests and construct presence check where the parser allows. The contribution check (iteration counting and mutation) is JavaScript only in the MVP. | `[VERIFY]` Skulpt parser access |
| O10 | Gate for "correct but not genuine" | Soft gate. The learner may revise or "Continue anyway" with reduced credit. | `GENUINE_GATE = 'soft'` |
| O11 | Extra problem types | `write_function` only in P0. `predict_output` and `fix_code` are P1. `parsons` is P2. | `[PROPOSED]` |

---

## 7. Scope and priorities

Priority levels follow section 0.4. The P0/P1/P2 split for design items comes from DESIGN §13. Items marked `[ADDED]` extend it.

### 7.1 Scope table

| Area | Item | Priority | Tag |
|---|---|---|---|
| Foundation | Design tokens, light/dark/system theme toggle, bundled fonts (Nunito, JetBrains Mono) | P0 | `[DESIGN]` |
| Foundation | Bottom tab bar: Learn, Practice, Mastery, Me | P0 | `[DESIGN]` |
| Foundation | "Works offline" chip on Problem and Results screens | P0 | `[DESIGN]` |
| Content | JavaScript Basics roadmap: 5 base problems (one per active concept) | P0 | `[PRD0.1]` |
| Content | Python Basics roadmap: 5 base problems | P1 | `[PRD0.1]` `[OPEN O1]` |
| Content | Mistake variants and mistake tags for every shipped problem | P0 | `[ADDED]` |
| Editor | CodeMirror editor, symbol bar, statement strip, draft autosave | P0 | `[DESIGN]` `[ADDED]` |
| Runner | JavaScript runner (Web Worker, 3 s timeout, CSP) | P0 | `[PRD0.1]` |
| Runner | Python runner (Skulpt) | P1 | `[PRD0.1]` |
| Testing | Test harness, Results bottom sheet, first-failing-test display | P0 | `[PRD0.1]` `[DESIGN]` |
| Genuine use | Hidden randomized tests | P0 | `[ADDED]` |
| Genuine use | Required-construct check | P0 | `[ADDED]` |
| Genuine use | Contribution check (iteration counting and mutation), JavaScript | P0, gated by G7 | `[ADDED]` |
| Genuine use | Cheat suite and benchmark script | P0 | `[ADDED]` |
| AI tutor | llama.rn integration, model load, streaming | P0 | `[PRD0.1]` |
| AI tutor | Hint (3 levels), Explain my error, prewritten-first display, guardrails, fallback | P0 | `[PRD0.1]` |
| AI tutor | Decoding grammar guard | P0, `[VERIFY]` | `[ADDED]` |
| AI tutor | Coach message (AI wording, deterministic template fallback) | P1 | `[PRD0.1]` `[DESIGN]` |
| Model | One-time model download with progress and resume, SHA-256 check | P0 | `[PRD0.1]` |
| Model | Polished download card states (paused, failed, ready) | P1 | `[DESIGN]` |
| Model | `offline` build flavor with no INTERNET permission | P1 | `[ADDED]` |
| Progress | SQLite storage, attempts, mastery, mistake counts | P0 | `[PRD0.1]` |
| Mastery | Mastery update rules, recommendation, review queue | P0 | `[PRD0.1]` `[DECIDED]` |
| Mastery | Mastery screen: bars, status chips, weakest-concept callout | P0 | `[DESIGN]` |
| Mastery | "Ready to build" marker and state | P1 | `[DESIGN]` `[OPEN O2]` |
| Gamification | XP per problem, completion screen with XP | P0 | `[DESIGN]` |
| Gamification | Levels and level-up moment | P1 | `[DESIGN]` |
| Gamification | Streak, freeze, local end-of-day reminder, broken-streak screen | P1 | `[DESIGN]` |
| Onboarding | Welcome, pick roadmap, tutor download card (minimal) | P0 | `[DESIGN]` |
| Onboarding | Daily goal step and polish | P1 | `[DESIGN]` |
| Dev tools | Hidden dev menu: seed demo data, reset progress, on-device bench screen | P1 | `[ADDED]` `[DESIGN §12]` |
| Problem types | `predict_output`, `fix_code` | P1 | `[PROPOSED]` |
| Problem types | `parsons` (put the lines in order) | P2 | `[PROPOSED]` |
| Content | Practice variants of base problems | P1 | `[PROPOSED]` |
| Design extras | Radar chart toggle, landscape layout, Taglish toggle, confetti, concept detail sheets | P2 | `[DESIGN]` |
| AI extras | Model second opinion for mistake tagging, with ablation report | P2 | `[PROPOSED]` |

### 7.2 Phase 2 (not built now)

Project-based learning with pre-authored multi-step projects (each step has its own tests and the AI only hints), C then Java support through interpreters, Pyodide for fuller Python, free-form chat mode, spaced-repetition reviews (an FSRS scheduler is a candidate), automatic model choice by device RAM, more roadmaps (web basics, data structures), iOS. `[PRD0.1]`

---

## 8. User flows

Screen layouts, copy, and states are specified in Appendix C (DESIGN §4 and §5). This section defines behavior.

### 8.1 Flow A: first launch (DESIGN §5.1)

1. Welcome: "Learn to code. No internet needed." Button: Start.
2. Pick roadmap: JavaScript Basics or Python Basics. (If only one roadmap is shipped, show it as selected and the other as "Coming soon".)
3. Daily goal (P1): 1, 2, or 3 problems a day. Then the tutor download card. Primary button "Start learning now". The app is usable with prewritten hints while the model downloads. Never block on the download.
4. Land on Learn. Create the profile row. Unlock stage 1.

Download card states: not downloaded, downloading (percent), paused, ready ("Tutor ready · works offline"), failed (retry).

### 8.2 Flow B: core learning loop

1. Learner opens a problem from Learn, or taps Start on the "Up next" card (Learn or Practice).
2. Problem screen opens. An attempt is created if none is open for this problem (section 9.6, FR-MASTERY-14).
3. Learner writes code. Draft autosaves.
4. Learner taps Run tests. The runner executes. Results sheet opens.
5. If tests failed: show "N of M passed" and the first failing test (Input, Expected, You got). Learner may tap Explain my error, Hint, or Try again.
6. If all tests passed: run the genuine-use check (section 9.4). Show the outcome (section 8.3).
7. On GENUINE (or GENUINE_UNVERIFIED): mark the problem completed, award XP, update mastery, update streak, open the Completion screen.
8. Completion screen shows XP earned, streak status, mastery change for the concept, and the Up next card with a one-line coach message. Buttons: Next problem, Back to roadmap.

### 8.3 Flow C: results states

| State | Condition | UI |
|---|---|---|
| Tests failed (visible) | At least one visible test fails, errors, or times out | Header "N of M passed". First failing test expanded. Buttons: Explain my error (primary), Try again |
| Tests failed (hidden only) | All visible pass, a hidden case fails | Header "Almost! Your code works on the examples but not on one we didn't show." Show that single hidden case (Input, Expected, You got). Buttons as above |
| Correct, not genuine | All tests pass, genuine check returns `CORRECT_NOT_GENUINE` | Header with the reason copy (section 9.4 table). Buttons: Try again (primary), Continue anyway (secondary) |
| Passed | All tests pass, label GENUINE or GENUINE_UNVERIFIED | Header "All tests passed!", XP animation, Continue |
| Runtime error | Error or syntax error | Plain-words error, line highlighted in editor |
| Timeout | Code exceeded 3000 ms | "Your code ran too long. Check for a loop that never ends." |

### 8.4 Flow D: tutor lifecycle

1. App start: tutor service state is `no_model`, `downloading`, `ready`, or `error`.
2. First AI request: lazy-load the model into memory. Show a skeleton in the AI card. The prewritten hint is already visible.
3. If no first token within 8 s, abort, keep the prewritten hint, show no error (DESIGN §5.5).
4. If the model crashes or memory is low, fall back to prewritten hints and show a one-time toast (DESIGN §9).

### 8.5 Flow E: returning learner

1. Learn shows the top strip (streak, XP, level), the "Up next" card, and the roadmap path.
2. Practice shows the same recommendation plus any review items.
3. Mastery shows the weakest-concept callout and per-concept bars.
4. Me shows level, streak calendar, settings, and tutor model status.

---

## 9. Functional requirements

Requirement format: `ID | requirement | priority | tag`.

### 9.1 Content and roadmap (FR-CONTENT)

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-CONTENT-01 | All content MUST be bundled as JSON files under `assets/content/` and loaded without network. Content MUST validate against the schema in section 10.3. | P0 | `[PRD0.1]` |
| FR-CONTENT-02 | A roadmap is an ordered list of stages. In the MVP each stage is one active concept, in this order: `variables_types`, `conditionals`, `loops`, `functions`, `arrays_lists`. | P0 | `[PRD0.1]` |
| FR-CONTENT-03 | Unlock rule: stage 1 is unlocked at start. Stage n+1 unlocks when at least one problem in stage n is completed. All problems in an unlocked stage are unlocked. | P0 | `[ADDED]` |
| FR-CONTENT-04 | Roadmap node states (DESIGN §5.2): locked, unlocked, completed, review-needed. A node is review-needed when its primary concept is in the review queue (FR-MASTERY-07). It is NOT review-needed merely because the concept score is below 40. | P0 | `[DESIGN]` `[ADDED]` |
| FR-CONTENT-05 | Minimum content: 5 base problems per shipped roadmap, one per active concept. | P0 (JS), P1 (Python) | `[PRD0.1]` |
| FR-CONTENT-06 | Each problem MUST have: statement, starter code, function name, at least 3 visible tests (5 recommended), a hidden-test spec, a reference solution, 2 or 3 prewritten hints, a concept note of 150 words or fewer, and at least 1 common mistake with variant code (2 recommended). | P0 | `[PRD0.1]` `[ADDED]` |
| FR-CONTENT-07 | `npm run content:verify` MUST check: schema; word limits; the reference solution passes all visible tests and 200 hidden samples (fixed seed); each mistake variant fails at least one test; prewritten hints contain no fenced code block and no 12-character-or-longer substring of the reference solution (whitespace removed). | P0 | `[ADDED]` |
| FR-CONTENT-08 | Text MUST be in English at a 12-year-old reading level (DESIGN §8). | P0 | `[DESIGN]` |
| FR-CONTENT-09 | Problem `type` field exists from day one. Only `write_function` is implemented in P0. `predict_output`, `fix_code`, and `parsons` are specified in section 10.3 as future values. | P0 (field), P1/P2 (types) | `[PROPOSED]` |
| FR-CONTENT-10 | Practice variants: a variant is a separate problem entry with `variantOf` set to a base problem id, the same primary concept, and different data. | P1 | `[PROPOSED]` |

### 9.2 Editor (FR-EDIT) and runner (FR-RUN)

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-EDIT-01 | The editor is CodeMirror 6 inside one persistent WebView that is created once and reused across problems (DESIGN §11). | P0 | `[PRD0.1]` `[DESIGN]` |
| FR-EDIT-02 | Features: monospace code font (default 16 px, user range 14 to 20), line numbers, syntax highlighting for the active language, undo and redo. No autocomplete popups in the MVP. | P0 | `[PRD0.1]` |
| FR-EDIT-03 | Symbol bar docked directly above the keyboard, 44 to 48 dp, horizontally scrollable: `Tab`, `{ }`, `( )`, `[ ]`, `" "`, `' '`, `;`, `:`, `=`, `Undo`. `Tab` inserts the indent unit (2 spaces for JavaScript, 4 for Python). Paired buttons insert both characters and place the cursor between them. | P0 | `[DESIGN]` |
| FR-EDIT-04 | Keyboard behavior: Android `softwareKeyboardLayoutMode` is `resize`. The editor shrinks, the symbol bar stays visible, and the action bar becomes a compact floating Run button (DESIGN §5.3). | P0 | `[DESIGN]` |
| FR-EDIT-05 | Draft autosave: debounce 500 ms, store code per problem in SQLite, restore on open. | P0 | `[ADDED]` |
| FR-EDIT-06 | Statement strip (about 2 lines, collapsed) expands into a bottom sheet with statement, concept note, and example. It auto-collapses when typing starts. | P0 | `[DESIGN]` |
| FR-EDIT-07 | Editor colors follow the active theme tokens (`code-bg`, `text`). | P0 | `[DESIGN]` |
| FR-RUN-01 | Learner code MUST execute in a Web Worker created from a Blob inside the WebView. Terminate the worker with `worker.terminate()` when `RUN_TIMEOUT_MS` (3000) elapses. Use a fresh worker for each execution phase. | P0 | `[PRD0.1]` |
| FR-RUN-02 | JavaScript: evaluate the code in the worker global scope (`new Function` or indirect eval), then look up `functionName`. If it is missing, return a plain-words error ("We couldn't find a function called ..."). | P0 | `[PRD0.1]` |
| FR-RUN-03 | Python: run through Skulpt in Python 3 mode with `execLimit = RUN_TIMEOUT_MS`. Prefer running inside a worker. If Skulpt does not run in a worker, run it on the WebView main thread with `execLimit` and accept that a runaway loop may block the WebView until the limit hits. | P1 | `[PRD0.1]` `[VERIFY]` |
| FR-RUN-04 | Capture printed output (cap 4000 characters) and errors with line numbers for every run. Displaying printed output in Results is P1. | P0 capture, P1 display | `[PRD0.1]` |
| FR-RUN-05 | Translate errors to plain words (DESIGN §8). Highlight the error line in the editor. Timeout copy is exactly: "Your code ran too long. Check for a loop that never ends." | P0 | `[DESIGN]` |
| FR-RUN-06 | The runner WebView has no network access: a Content Security Policy meta tag denies all connections, navigation is blocked, file access is disabled, and a dev check proves `fetch('https://example.com')` fails inside the runner. | P0 | `[PRD0.1]` `[VERIFY]` |
| FR-RUN-07 | Runner and RN exchange only the JSON messages defined in section 11.4. | P0 | `[PRD0.1]` |

### 9.3 Test harness and results (FR-TEST)

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-TEST-01 | The harness calls the learner's function with each test's `args` and compares the return value to `expected`. Comparison: `===` for primitives (with `Object.is` semantics for `NaN`), recursive deep equality for arrays and plain objects, and optional `floatTolerance` (absolute) for numbers. | P0 | `[PRD0.1]` |
| FR-TEST-02 | Each test returns `{ id, status: 'pass' \| 'fail' \| 'error' \| 'timeout', args, expected, actual, errorMessage? }`. The result shape is identical for JavaScript and Python. | P0 | `[PRD0.1]` |
| FR-TEST-03 | Results sheet (DESIGN §5.4): about 45% height, draggable. Failed: header "N of M passed", test list with icon and word, first failing test expanded with Input, Expected, You got in three monospace rows. Passed: green header "All tests passed!". | P0 | `[DESIGN]` |
| FR-TEST-04 | Visible results MUST appear within `RESULTS_TARGET_MS` (1000 ms) for a typical problem. Genuine-use results MAY arrive later as a second message (progressive display). | P0 | `[PRD0.1]` |
| FR-TEST-05 | Hidden tests are never listed. If a hidden test fails, reveal exactly one case (the first failing hidden case) as "A case we didn't show", with Input, Expected, You got. | P0 | `[ADDED]` |
| FR-TEST-06 | Runs are deterministic for a given `seed`. Production runs use a fresh random seed. Store the seed on the run record. | P0 | `[ADDED]` |
| FR-TEST-07 | Every pass, fail, and error state shows an icon and a word, not color alone (DESIGN §10). Screen reader label: "Test 2, failed. Input ... expected ... got ...". | P0 | `[DESIGN]` |

### 9.4 Genuine-use verification (FR-GENUINE)

Purpose: output-only checking can be satisfied by hard-coded answers or by a required construct that does no work. This feature verifies that the learner's code really solves the problem. It is the product's main differentiator (rule H14: describe it accurately, never overstate it).

#### 9.4.1 Pipeline

```
Phase 1  tests:    visible tests + hidden randomized tests (vs reference solution)
                   any failure -> status tests_failed (stop; no genuine checks)
Phase 2  genuine:  only when every test passed
   a. parse the code (JS: Acorn; Python: Skulpt parser if reachable)
        parse unavailable or fails            -> GENUINE_UNVERIFIED
   b. construct check: every requiredConstructs entry must exist
        inside the function named functionName
        missing                               -> CORRECT_NOT_GENUINE (missing_construct)
   c. contribution check (JavaScript, loop constructs):
        for each matching loop L inside the target function:
          scale test:    iteration counts across sample inputs
          mutation test: neutralize L's body, re-run, compare outputs
          L is genuine when both tests pass
        construct satisfied when at least one loop is genuine
        none genuine                          -> CORRECT_NOT_GENUINE (loop_not_doing_work)
   d. all checks completed and passed         -> GENUINE
        any check inconclusive                -> GENUINE_UNVERIFIED
```

Principle: a false accusation is worse than a missed cheat. Whenever a check is inconclusive (unsupported syntax, empty-body loop, exceeded time budget, parse failure), return `GENUINE_UNVERIFIED` and treat it as a pass.

Design check already done: this pipeline was prototyped in Node with Acorn against the worked example in section 10.3 and its suite in section 14.3. The reference solution returned `GENUINE`, both mistake variants failed the tests, all five cheat entries and all three valid alternatives matched their expected outcomes across five seeds. This confirms the specification is coherent for one problem. It is not a product benchmark and MUST NOT be quoted as a result (H7). The real numbers come from `bench/run-suites.ts` on the shipped code.

#### 9.4.2 Requirements

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-GENUINE-01 | Hidden tests: each problem defines a `hiddenTests` spec (section 10.3) with per-argument generators and `edgeCases`. Run `HIDDEN_TEST_COUNT` (20) inputs plus all edge cases through both the reference solution and the learner's function, in the same runtime (the reference solution for a Python problem is Python and runs in Skulpt). | P0 | `[ADDED]` |
| FR-GENUINE-02 | Generators use a seeded PRNG (`mulberry32`). Each positional argument has its own generator, so a two-integer function uses two `intInRange` generators. The generator set for the MVP is: `intInRange`, `intArray`, `asciiWord`, `sentence`. | P0 | `[ADDED]` |
| FR-GENUINE-03 | `requiredConstructs` values for the MVP: `for_loop`, `while_loop`, `any_loop`, `recursion`. Loop kinds map to JavaScript AST nodes: `for_loop` = `ForStatement`; `while_loop` = `WhileStatement` or `DoWhileStatement`; `any_loop` = `ForStatement`, `ForInStatement`, `ForOfStatement`, `WhileStatement`, `DoWhileStatement`. `recursion` is a presence check only (the function body calls its own name). | P0 | `[ADDED]` |
| FR-GENUINE-04 | Instrumentation uses source text insertion at AST node offsets (Acorn provides `start` and `end`), not code generation. Insert `__ct_tick__(<loopId>);` as the first statement of each loop body. If the body is a single non-block statement, wrap it: `{ __ct_tick__(<loopId>); <statement> }`. Apply edits from the highest offset to the lowest so offsets stay valid. | P0 | `[ADDED]` |
| FR-GENUINE-05 | Scale test for loop L: let C be L's iteration counts across `GENUINE_SAMPLE_INPUTS` (10) hidden inputs, and R the reference solution's total loop iteration counts on the same inputs (reference solutions MUST use the construct the problem requires). L passes the scale test if `distinct(C) >= 2` or `distinct(R) < 2`. | P0 | `[ADDED]` |
| FR-GENUINE-06 | Mutation test for loop L: replace L's body with `{}`, re-run the function on the same inputs. An input counts as unchanged only if the output equals the original output. A timeout or exception counts as changed. L passes the mutation test if `unchanged / total < MUTATION_UNCHANGED_RATIO` (0.9). Per-input timeout is `MUTATION_RUN_TIMEOUT_MS` (300). | P0 | `[ADDED]` |
| FR-GENUINE-07 | Unsupported structures return `GENUINE_UNVERIFIED`: a loop with an `EmptyStatement` body (work may live in the loop header), generators or async functions, a parse error, or total genuine-phase time above `GENUINE_PHASE_BUDGET_MS` (3000). | P0 | `[ADDED]` |
| FR-GENUINE-08 | Outcome labels: `GENUINE`, `GENUINE_UNVERIFIED`, `CORRECT_NOT_GENUINE`, `NOT_CHECKED` (used when tests failed). `CORRECT_NOT_GENUINE` carries a reason code. | P0 | `[ADDED]` |
| FR-GENUINE-09 | Soft gate (`GENUINE_GATE = 'soft'`): on `CORRECT_NOT_GENUINE` the problem is NOT completed. The learner can Try again or Continue anyway. Continue anyway completes the problem with completion kind `not_genuine` (reduced mastery and XP) and stores the label. | P0 | `[ADDED]` `[OPEN O10]` |
| FR-GENUINE-10 | The tuning constants (`MUTATION_UNCHANGED_RATIO`, `GENUINE_SAMPLE_INPUTS`, timeouts) live in `constants.ts`. Tune them against the cheat suites so that every seeded cheat is caught and no valid alternative is flagged. Never tune by editing suites. | P0 | `[ADDED]` |
| FR-GENUINE-11 | Cheat suites (section 14.3) run through the same pure-TypeScript pipeline under Jest and through `bench/run-suites.ts`, which writes `bench/results/suites.json`. | P0 | `[ADDED]` |
| FR-GENUINE-12 | Python scope in the MVP: hidden randomized tests (FR-GENUINE-01) and construct presence where the Skulpt parser is reachable. The contribution check is not implemented for Python. Do not claim it. | P1 | `[OPEN O9]` `[VERIFY]` |

#### 9.4.3 Outcome copy (tone per DESIGN §8; strings live in `src/ui/copy.ts`)

| Label and reason | Copy |
|---|---|
| `CORRECT_NOT_GENUINE` / `missing_construct` | "Your answers are right, but this problem asks you to use a {construct}. Give it a try with one." |
| `CORRECT_NOT_GENUINE` / `loop_not_doing_work` | "Your answers are right, but the loop isn't building the answer yet. Let the loop do the work." |
| Hidden case failed | "Almost! Your code works on the examples but not on one we didn't show." |

`{construct}` is "for loop", "while loop", "loop", or "recursive call" for the matching construct.

### 9.5 AI tutor (FR-AI)

The full specification is section 12. Summary requirements:

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-AI-01 | Two actions: Hint (levels 1 to 3, ladder) and Explain my error. | P0 | `[PRD0.1]` |
| FR-AI-02 | On every tutor request, show the prewritten hint for the current level immediately (label "Quick hint"). When the AI stream starts, crossfade to "Tutor" text, streamed word by word. | P0 | `[DESIGN]` |
| FR-AI-03 | The model never decides pass or fail and never sees the reference solution or mistake-variant code (H1). | P0 | `[PRD0.1]` |
| FR-AI-04 | Guardrails: decoding grammar (when supported), post-generation guards, one regeneration, then prewritten fallback (section 12.5). | P0 | `[PRD0.1]` `[ADDED]` |
| FR-AI-05 | If no first token arrives within `AI_FIRST_TOKEN_TIMEOUT_MS` (8000), abort and keep the prewritten hint with no error message. A total cap of `AI_TOTAL_TIMEOUT_MS` (30000) applies. | P0 | `[DESIGN]` `[ADDED]` |
| FR-AI-06 | Every tutor request increments the attempt's `tutorRequests`, which affects the completion kind (FR-MASTERY-03). | P0 | `[ADDED]` |
| FR-AI-07 | Footer chip on AI cards: "Runs on your phone · offline". | P0 | `[DESIGN]` |
| FR-AI-08 | Log tutor events locally for evaluation (section 10.2, `tutor_events`). Store AI text only when the dev flag `LOG_AI_TEXT` is on. | P0 | `[ADDED]` |

### 9.6 Mastery, mistakes, recommendation (FR-MASTERY, FR-MISTAKE)

This section defines how the app recognizes learner patterns. `[DECIDED]` D05.

A mastery score shows how proficiently a learner uses a skill: the programming foundations, functions, and everything else a person must master to reach the level where they can build a genuine program through this app's pedagogical method. The app tracks one score per concept and reads patterns from the set of scores and the learner's recorded mistakes.

#### 9.6.1 Concepts

| Concept id | Display name | Active in MVP |
|---|---|---|
| `variables_types` | Variables | Yes |
| `operators` | Operators | No (no MVP problems) |
| `conditionals` | Conditionals | Yes |
| `loops` | Loops | Yes |
| `functions` | Functions | Yes |
| `arrays_lists` | Arrays/Lists | Yes |
| `strings` | Strings | No |
| `reading_fixing_code` | Reading and fixing code | No (needs `predict_output` and `fix_code` problems) |

Only active concepts appear on the Mastery screen and count toward the "ready" state. Inactive concepts exist in `concepts.json` with `active: false` so content can grow without code changes.

#### 9.6.2 Requirements

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-MASTERY-01 | Each concept has an integer score 0 to 100. Initial score is 0 with `attempted = false`. | P0 | `[PRD0.1]` |
| FR-MASTERY-02 | A score changes only when an attempt ends (completion or abandonment). Failed test runs alone do not change a score. The delta applies to the problem's primary concept only. | P0 | `[PRD0.1]` |
| FR-MASTERY-03 | Completion kind: `not_genuine` if the learner chose Continue anyway; else `hints` if `tutorRequests > 0`; else `retries` if `runs > 1`; else `first_try`. `runs` counts Run tests executions in the attempt up to and including the passing run. | P0 | `[PRD0.1]` `[ADDED]` |
| FR-MASTERY-04 | Deltas: `first_try +15`, `retries +10`, `hints +5`, `not_genuine +5`, `abandoned -5`. Clamp to 0..100. Set `attempted = true`. Store `last_delta` (the raw delta, even when clamped) and write a `mastery_events` row. | P0 | `[PRD0.1]` `[ADDED]` |
| FR-MASTERY-05 | Display score = score / 10 with one decimal. Bands: below 4.0 "Needs work" (error color), 4.0 up to but not including 7.0 "Getting there" (warn), 7.0 and above "Strong" (success). Unattempted concepts show "Not started" and "-/10" in grey. | P0 | `[DESIGN]` |
| FR-MASTERY-06 | Abandoned: the learner taps Skip problem, or starts a different problem while this attempt is open and has at least one run. Apply the abandoned delta once per attempt. | P0 | `[ADDED]` |
| FR-MASTERY-07 | Review queue: a concept is in the review queue when `attempted`, `score < REVIEW_THRESHOLD` (40), and `last_delta < 0`. This means the score "fell" below 40 (DESIGN and PRD v0.1 wording). The concept leaves the queue after a positive delta. | P0 | `[PRD0.1]` `[ADDED]` |
| FR-MASTERY-08 | Recommendation algorithm: see 9.6.3. | P0 | `[PRD0.1]` `[DESIGN]` |
| FR-MASTERY-09 | Coach message: always generate a deterministic template message (9.6.4) instantly. P1: if the model is ready, request a one-sentence rewording under the coach grammar (section 12.4). The model never chooses the recommendation. | P0 template, P1 AI wording | `[PRD0.1]` |
| FR-MASTERY-10 | Weakest-concept callout (DESIGN §5.7): the attempted concept with the lowest score. Text: "{Concept} · {score}/10" plus one line from the most frequent mistake tag for that concept (`mistake_counts`), using that tag's `learnerText`. The line is NOT free AI text. If there are no mistake counts: "This skill needs more practice." Button: Practice {Concept}. | P0 | `[DESIGN]` |
| FR-MASTERY-11 | Header summary: "You're strongest at {Concept}. {Weakest} needs work." Use the highest and lowest attempted concepts. With no attempts: "Solve your first problem to see your skills." | P0 | `[DESIGN]` |
| FR-MASTERY-12 | Ready state: `isReady` is true when every active concept is `attempted` and has `score >= READY_THRESHOLD`. Show the small marker at the threshold on every bar. Footer copy in the MVP: "Reach {READY_THRESHOLD / 10}+ in every skill to be ready to build a real program." (With the default threshold 70 this reads "Reach 7+ ...". This overrides DESIGN §5.7 wording, which promised a mini-project unlock that is not built; see Appendix A.) | P1 | `[DESIGN]` `[OPEN O2]` |
| FR-MASTERY-13 | Concept detail sheet with a sparkline of the last 10 results and the common mistakes list. | P2 | `[DESIGN]` |
| FR-MASTERY-14 | Attempt lifecycle: an attempt opens when a problem is opened and no open attempt exists for it. It records `runs`, `tutorRequests`, `maxHintLevel`, `startedAt`. It closes as `completed` or `abandoned`. | P0 | `[ADDED]` |
| FR-MISTAKE-01 | Mistake detection (rule-based): on a failed run with no runtime error, take up to 5 failing test inputs. For each `commonMistakes` entry, run its variant code on those inputs. If the variant's outputs equal the learner's outputs on all examined inputs, the entry's tag matches. Use the first match in file order; otherwise `unknown`. | P0 | `[ADDED]` |
| FR-MISTAKE-02 | Runtime failures map to generic tags: `syntax_error`, `undefined_name`, `type_error`, `possible_infinite_loop` (timeout), `runtime_error`. | P0 | `[ADDED]` |
| FR-MISTAKE-03 | Each tag has `learnerText` in `assets/content/mistakes.json` (warm, plain words, DESIGN §8). Count each classified failed run in `mistake_counts(concept_id, tag)` using the problem's primary concept. The count is not incremented for `unknown`. | P0 | `[ADDED]` |
| FR-MISTAKE-04 | The classified tag, when not `unknown`, is passed to the AI prompt as `MISTAKE TYPE` (a rule-based diagnosis that makes the small model's job easier). | P0 | `[ADDED]` |
| FR-MISTAKE-05 | Model second opinion for tagging, with an ablation report (rules only vs rules plus model). | P2 | `[PROPOSED]` |

#### 9.6.3 Recommendation algorithm

```
recommendNext(state):
  items = problems that are unlocked
  1. if consecutiveStruggles >= STRUGGLES_BEFORE_EASY_REVIEW (2):
       candidate = the easiest item the learner already completed, or an uncompleted
                   variant of such an item (lowest difficulty; ties: concept with the
                   highest score, then most recently completed)
       if candidate exists -> return { candidate, reason: 'confidence_boost' }
  2. if review queue is not empty:
       concept = queue concept with the lowest score (tie: lowest stage order)
       return { pickItem(concept), reason: 'review' }
  3. open = unlocked items not completed
     if open is not empty:
       pick the item whose primary concept has the lowest score
       (tie: lower stage order, then lower problem order)
       return { item, reason: 'lowest_mastery' }
  4. if isReady (FR-MASTERY-12) and there are no open items:
       return { null, reason: 'ready_all_done' }
  5. concept = active concept with the lowest score
     return { pickItem(concept), reason: 'practice_again' }

pickItem(concept):
  1. uncompleted items in that concept, lowest order first
  2. else uncompleted variants
  3. else the least recently completed item (re-opened in review mode)
```

`consecutiveStruggles` increments when an attempt ends `abandoned` or completes needing `STRUGGLE_ATTEMPTS_TO_PASS` (3) or more runs. It resets to 0 on any non-struggle completion and after a `confidence_boost` item is served. `[OPEN O3]`

#### 9.6.4 Coach message templates (deterministic fallback)

| Reason | Message |
|---|---|
| `lowest_mastery` | "Next up: {Concept}. It's your lowest skill right now, so a little practice goes a long way." |
| `review` | "Let's revisit {Concept}. A quick review will lock it in." |
| `confidence_boost` | "Here's a quick one you can win. Then we'll get back to the tougher stuff." |
| `practice_again` | "You've done every new problem here. Let's sharpen {Concept} again." |
| `ready_all_done` | "You're ready to build a real program!" |

### 9.7 Gamification (FR-GAME)

All values from DESIGN §6. Separate XP (effort) from mastery (skill) on screen; never present XP as a skill measure.

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-GAME-01 | XP per completed problem: base by completion kind: `first_try 20`, `retries 15`, `hints 10`, `not_genuine 10`. Add `XP_CLEAN_BONUS` (5) when `tutorRequests == 0` and the kind is `first_try` or `retries`. No XP for abandoned attempts. | P0 | `[DESIGN]` `[ADDED]` |
| FR-GAME-02 | Level: the XP needed to advance from level n to n+1 is `100 x n`. Total XP is stored; level is derived (section 11.5 `levelFromXp`). Level-up is a full-screen moment, once, 1.2 s. | P0 XP, P1 level-up moment | `[DESIGN]` `[OPEN O4]` |
| FR-GAME-03 | Streak increments when at least one problem is completed (not abandoned) on a local calendar date. Opening the app does not count. Use the device timezone and `YYYY-MM-DD` local dates. | P1 | `[DESIGN]` |
| FR-GAME-04 | Freeze: 1 available at start. Auto-used when exactly one day was missed. Refills to 1 when the streak reaches a multiple of 7. Streak update on the first completion of a day D with last completion date L: gap 0 = no change; gap 1 = streak + 1; gap 2 with a freeze available = consume freeze, streak + 1; otherwise streak = 1. | P1 | `[DESIGN]` `[ADDED]` |
| FR-GAME-05 | Reminder: local notification at the user's reminder time, only when the streak is at risk (streak > 0, last completion was yesterday, nothing completed today). Implementation: on every launch and every completion, cancel scheduled reminders, then schedule at most two (today if still in the future and not yet completed, and tomorrow). Never schedule when the streak is 0. One per day, user can turn it off. Copy is warm, never guilt-based. | P1 | `[DESIGN]` `[ADDED]` |
| FR-GAME-06 | Broken-streak screen on the first open after a streak is lost: "Your streak ended at {n}. Start a new one today." No shame, no sad animation. | P1 | `[DESIGN]` |
| FR-GAME-07 | Daily goal (1, 2, or 3 problems) is stored from onboarding. The Me tab shows "Daily goal: {g} problems · Today {done}/{g}". | P1 | `[DESIGN]` `[ADDED]` |
| FR-GAME-08 | Not built: badges, leaderboards, hearts, currency, social. | n/a | `[DESIGN]` |

### 9.8 Model management (FR-MODEL)

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-MODEL-01 | Model metadata (name, quant, file name, URL, SHA-256, size, license) lives in `src/config/model.ts`. Fill the URL, file name, size, and SHA-256 only after verifying them against the source (official Qwen GGUF repository or a named community quantization). Never download from an unverified mirror. | P0 | `[VERIFY]` |
| FR-MODEL-02 | Download once with `expo-file-system`, resumable, with a size warning ("about 1 GB, Wi-Fi recommended"), progress, and pause/resume. Verify SHA-256 after download. Delete a corrupt file and report failure. | P0 | `[PRD0.1]` |
| FR-MODEL-03 | Wi-Fi-only download option, on by default. | P1 | `[DESIGN]` |
| FR-MODEL-04 | States: `no_model`, `downloading`, `paused`, `ready`, `failed`, `out_of_storage`. Never block the app on the download. | P0 | `[DESIGN]` |
| FR-MODEL-05 | Load lazily on the first AI request. Keep loaded while the app is in the foreground. Release the context after the app has been in the background for `MODEL_UNLOAD_AFTER_BACKGROUND_MS` (60000). | P0 | `[ADDED]` |
| FR-MODEL-06 | The model locator checks the app's internal model directory first. For the `offline` flavor, support an in-app "Import model file" action (document picker copies the file into internal storage). `[VERIFY]` | P1 | `[ADDED]` |
| FR-MODEL-07 | Settings (Me tab): model status, size, delete, re-download. | P0 | `[DESIGN]` |
| FR-MODEL-08 | Low RAM or native crash: fall back silently to prewritten hints and show a one-time toast. | P0 | `[DESIGN]` |

### 9.9 Navigation and screens (FR-UI)

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-UI-01 | Bottom tab bar (64 dp, label under icon): Learn, Practice, Mastery, Me. The Problem screen hides the tab bar. | P0 | `[DESIGN]` |
| FR-UI-02 | Persistent top strip on Learn and Mastery: streak (flame), XP (lightning), level pill. Before P1 streak and level exist, show XP only. | P0/P1 | `[DESIGN]` |
| FR-UI-03 | Learn: vertical roadmap path grouped by concept with mastery mini-bars and node states, plus the Up next card. | P0 | `[DESIGN]` |
| FR-UI-04 | Practice: the Up next card (recommendation, reason line, coach message, Start) plus a Review list (one row per concept in the review queue with a Practice {Concept} button). | P0 | `[DESIGN]` `[ADDED]` |
| FR-UI-05 | Problem screen: header (back, title, hint dots, settings gear), statement strip, editor, symbol bar, action bar (Run tests primary, Hint secondary). Layout per DESIGN §5.3. The settings gear menu includes "Skip problem", which abandons the attempt (FR-MASTERY-06). | P0 | `[DESIGN]` `[ADDED]` |
| FR-UI-06 | Hint button labels by ladder level: "Hint", "More help", "Show approach". Header dots show level 1 to 3. The ladder resets for each new attempt. | P0 | `[DESIGN]` |
| FR-UI-07 | Completion screen: confetti burst once (skipped with reduce motion; P2), three stat rows (XP earned, streak status, mastery change with animated bar), Up next card, buttons Next problem and Back to roadmap. | P0 | `[DESIGN]` |
| FR-UI-08 | Mastery screen per DESIGN §5.7 and FR-MASTERY-05, 10, 11, 12. | P0 | `[DESIGN]` |
| FR-UI-09 | Me screen per DESIGN §5.8: level pill and XP bar, streak calendar, settings (theme, code font size, daily goal, reminder time, haptics, reduce motion, tutor model status, Wi-Fi-only download), offline status row "Works in airplane mode." | P0 settings, P1 streak parts | `[DESIGN]` |
| FR-UI-10 | Empty, loading, and error states per DESIGN §9. | P0 | `[DESIGN]` |
| FR-UI-11 | Accessibility per DESIGN §10 (48 dp targets, contrast, icon plus text states, 130% dynamic type, screen reader labels, motion and haptics off switches, AI text announced politely once complete). | P0 | `[DESIGN]` |
| FR-UI-12 | Animations use Reanimated on the native thread. No Lottie. No animations while the model is generating. Reduce motion replaces animation with instant change plus a subtle color fade. | P0 | `[DESIGN]` |

### 9.10 Developer tools (FR-DEV)

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-DEV-01 | Hidden dev menu (long-press on the app version in Me). Available only in development builds or when built with `EXPO_PUBLIC_DEMO_MENU=1`. Actions: seed demo data (so the Mastery screen shows "Loops 4/10" as the weakest concept on first open, DESIGN §12), reset all progress, toggle `LOG_AI_TEXT`. Seeded state shows a small "Demo data" label in the dev menu. | P1 | `[DESIGN]` `[ADDED]` |
| FR-DEV-02 | On-device bench screen: runs a fixed set of prompts through the tutor service and writes `device-bench.json` (device model, RAM, model, model load ms, first-token ms, tokens per second, total ms) to the app documents directory for retrieval by `adb pull`. | P1 | `[ADDED]` |
| FR-DEV-03 | Network tripwire (dev only): wraps `fetch` and `XMLHttpRequest` in the RN layer and logs any call after the model is ready. | P1 | `[ADDED]` |

### 9.11 Privacy and permissions (FR-PRIV)

| ID | Requirement | Pri | Tag |
|---|---|---|---|
| FR-PRIV-01 | No accounts, no telemetry, no third-party SDKs that phone home. Learner code never leaves the device. | P0 | `[PRD0.1]` |
| FR-PRIV-02 | Android permissions: `INTERNET` only in the `download` flavor. `POST_NOTIFICATIONS` only when the reminder is enabled (P1). No other permissions. | P0 | `[ADDED]` |
| FR-PRIV-03 | All data is stored locally (SQLite and app files). The Me tab offers Reset progress. | P0 | `[ADDED]` |

---

## 10. Data model and content schema

### 10.1 Core TypeScript types

File: `src/core/types.ts`. Pure TypeScript. No React Native imports (H6).

```ts
export type JsonValue =
  | null | boolean | number | string
  | JsonValue[] | { [key: string]: JsonValue };

export type LanguageId = 'javascript' | 'python';

export type ConceptId =
  | 'variables_types' | 'operators' | 'conditionals' | 'loops'
  | 'functions' | 'arrays_lists' | 'strings' | 'reading_fixing_code';

// Only 'write_function' is implemented in P0. Others are reserved (FR-CONTENT-09).
export type ProblemType = 'write_function' | 'predict_output' | 'fix_code' | 'parsons';

export type RequiredConstruct = 'for_loop' | 'while_loop' | 'any_loop' | 'recursion';

export type ArgGenerator =
  | { gen: 'intInRange'; min: number; max: number }
  | { gen: 'intArray'; minLen: number; maxLen: number; min: number; max: number }
  | { gen: 'asciiWord'; minLen: number; maxLen: number }
  | { gen: 'sentence'; minWords: number; maxWords: number };

export interface TestCase {
  id: string;                 // 't1', 't2', ...
  args: JsonValue[];
  expected: JsonValue;
}

export interface HiddenTestSpec {
  count?: number;             // default HIDDEN_TEST_COUNT (20)
  args: ArgGenerator[];       // one generator per positional argument
  edgeCases: JsonValue[][];   // each entry is a full args array; always run first
}

export interface CommonMistake {
  tag: string;                // key into assets/content/mistakes.json
  variantCode: string;        // buggy implementation showing the mistake. NEVER sent to the model (H1)
}

export interface Problem {
  id: string;                 // e.g. 'js-loops-01'
  language: LanguageId;
  type: ProblemType;
  primaryConcept: ConceptId;
  secondaryConcepts: ConceptId[];
  title: string;
  statement: string;          // plain paragraphs and inline `code` only
  example?: string;
  starterCode: string;
  functionName: string;
  visibleTests: TestCase[];
  hiddenTests: HiddenTestSpec;
  floatTolerance?: number;    // absolute tolerance for number comparison
  referenceSolution: string;  // NEVER sent to the model (H1). Must use the required constructs
  requiredConstructs: RequiredConstruct[];
  prewrittenHints: string[];  // 2 or 3 entries; index = hint level - 1
  conceptNote: string;        // 150 words or fewer
  commonMistakes: CommonMistake[];
  difficulty: 1 | 2 | 3;
  order: number;              // order within its stage
  variantOf?: string;         // base problem id when this is a practice variant
}

export type TestStatus = 'pass' | 'fail' | 'error' | 'timeout';

export interface TestResult {
  id: string;
  hidden: boolean;
  status: TestStatus;
  args: JsonValue[];
  expected: JsonValue;
  actual: JsonValue | null;
  errorMessage?: string;
}

export type RunStatus = 'tests_passed' | 'tests_failed' | 'error' | 'timeout';

export interface RunError {
  kind: 'syntax' | 'reference' | 'type' | 'runtime' | 'missing_function';
  message: string;            // already translated to plain words
  line?: number;
}

export interface RunResult {
  runId: string;
  seed: number;
  status: RunStatus;
  visible: TestResult[];
  hiddenPassed: number;
  hiddenTotal: number;
  firstFailing: TestResult | null;  // first failing visible test, else first failing hidden test
  printed: string;                  // capped at 4000 characters
  error?: RunError;
  mistakeTag?: string | null;       // FR-MISTAKE-01..02
  durationMs: number;
}

export type GenuineLabel =
  | 'GENUINE' | 'GENUINE_UNVERIFIED' | 'CORRECT_NOT_GENUINE' | 'NOT_CHECKED';

export type GenuineReason =
  | 'missing_construct' | 'loop_not_doing_work'
  | 'unsupported_structure' | 'parse_failed' | 'budget_exceeded' | null;

export interface GenuineResult {
  runId: string;
  label: GenuineLabel;
  reason: GenuineReason;
  missingConstruct?: RequiredConstruct;
  loops?: { id: number; scaled: boolean; unchangedRatio: number; genuine: boolean }[];
}

export type CompletionKind = 'first_try' | 'retries' | 'hints' | 'not_genuine';
export type AttemptState = 'open' | 'completed' | 'abandoned';
export type TutorAction = 'hint' | 'explain' | 'coach';
export type TutorState = 'no_model' | 'downloading' | 'paused' | 'ready' | 'failed' | 'out_of_storage';
```

### 10.2 SQLite schema (expo-sqlite)

Run as migration 1. All timestamps are epoch milliseconds. Locked or unlocked problem state is derived from stage rules (FR-CONTENT-03), not stored.

```sql
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  roadmap TEXT NOT NULL,                          -- 'javascript' | 'python'
  daily_goal INTEGER NOT NULL DEFAULT 1,          -- 1, 2, or 3 problems per day
  theme TEXT NOT NULL DEFAULT 'system',           -- 'light' | 'dark' | 'system'
  code_font_size INTEGER NOT NULL DEFAULT 16,     -- 14 to 20
  reminder_time TEXT,                             -- 'HH:MM' local time, NULL = off
  haptics INTEGER NOT NULL DEFAULT 1,
  reduce_motion INTEGER NOT NULL DEFAULT 0,
  wifi_only INTEGER NOT NULL DEFAULT 1,
  xp_total INTEGER NOT NULL DEFAULT 0,
  consecutive_struggles INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS concept_mastery (
  concept_id TEXT PRIMARY KEY,
  score INTEGER NOT NULL DEFAULT 0,               -- 0 to 100
  attempted INTEGER NOT NULL DEFAULT 0,
  last_delta INTEGER NOT NULL DEFAULT 0,          -- raw delta of the latest update
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS problem_progress (
  problem_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'unlocked',        -- 'unlocked' | 'completed'
  draft_code TEXT,
  completed_at INTEGER,
  completion_kind TEXT,                           -- CompletionKind
  genuine_label TEXT,                             -- GenuineLabel of the completing run
  times_completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  state TEXT NOT NULL DEFAULT 'open',             -- AttemptState
  runs INTEGER NOT NULL DEFAULT 0,
  tutor_requests INTEGER NOT NULL DEFAULT 0,
  max_hint_level INTEGER NOT NULL DEFAULT 0,
  completion_kind TEXT,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  seconds_spent INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_attempts_problem ON attempts(problem_id, state);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL REFERENCES attempts(id),
  ts INTEGER NOT NULL,
  seed INTEGER NOT NULL,
  code TEXT NOT NULL,
  status TEXT NOT NULL,                           -- RunStatus
  visible_passed INTEGER NOT NULL,
  visible_total INTEGER NOT NULL,
  hidden_passed INTEGER NOT NULL,
  hidden_total INTEGER NOT NULL,
  genuine_label TEXT,
  genuine_reason TEXT,
  mistake_tag TEXT,
  duration_ms INTEGER
);

CREATE TABLE IF NOT EXISTS mastery_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  concept_id TEXT NOT NULL,
  problem_id TEXT,
  attempt_id INTEGER,
  reason TEXT NOT NULL,                           -- CompletionKind or 'abandoned'
  delta INTEGER NOT NULL,
  score_after INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mistake_counts (
  concept_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_seen INTEGER,
  PRIMARY KEY (concept_id, tag)
);

CREATE TABLE IF NOT EXISTS xp_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  attempt_id INTEGER,
  kind TEXT NOT NULL,                             -- CompletionKind
  amount INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS streak (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  current INTEGER NOT NULL DEFAULT 0,
  best INTEGER NOT NULL DEFAULT 0,
  last_completion_date TEXT,                      -- 'YYYY-MM-DD' device-local date
  freeze_available INTEGER NOT NULL DEFAULT 1,
  broken_notice_pending INTEGER NOT NULL DEFAULT 0,
  broken_at_length INTEGER
);

CREATE TABLE IF NOT EXISTS tutor_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  attempt_id INTEGER,
  problem_id TEXT,
  action TEXT NOT NULL,                           -- TutorAction
  level INTEGER,
  source TEXT NOT NULL,                           -- 'ai' | 'prewritten'
  rejected_reason TEXT,                           -- NULL | guard id | 'timeout' | 'error'
  prompt_tokens_est INTEGER,
  first_token_ms INTEGER,
  total_ms INTEGER,
  output_tokens INTEGER,
  ai_text TEXT                                    -- only when LOG_AI_TEXT is on
);
```

### 10.3 Content files

| File | Content |
|---|---|
| `assets/content/concepts.json` | Array of `{ id, name, order, active }` (section 9.6.1) |
| `assets/content/mistakes.json` | Object mapping tag to `{ learnerText }` (generic and problem-specific tags) |
| `assets/content/<language>/roadmap.json` | `{ language, title, stages: [{ concept, problemIds: [...] }] }` |
| `assets/content/<language>/problems/<id>.json` | One `Problem` per file |

Authoring rules for `assets/content/mistakes.json` values: warm, short, plain words, no jargon (DESIGN §8). Example:

```json
{
  "loop_stops_early": { "learnerText": "You miss the last step of a loop often." },
  "assign_instead_of_add": { "learnerText": "You replace the total each time instead of adding to it." },
  "boundary_off_by_one": { "learnerText": "A comparison is off by one at the edge." },
  "missing_return": { "learnerText": "Your function forgets to give back an answer." },
  "syntax_error": { "learnerText": "A small typing slip stops the code from running." },
  "undefined_name": { "learnerText": "A name is used before it exists." },
  "type_error": { "learnerText": "A number and a piece of text got mixed up." },
  "possible_infinite_loop": { "learnerText": "A loop never ends." },
  "runtime_error": { "learnerText": "The code stopped with an error." }
}
```

Worked example of a problem file (`assets/content/javascript/problems/js-loops-01.json`). Use this as the template for every problem.

```json
{
  "id": "js-loops-01",
  "language": "javascript",
  "type": "write_function",
  "primaryConcept": "loops",
  "secondaryConcepts": ["variables_types"],
  "title": "Add up to n",
  "statement": "Write a function `sumUpTo(n)` that returns the sum of all whole numbers from 1 up to n. Use a `for` loop. If n is 0, return 0.",
  "example": "sumUpTo(4) returns 10, because 1 + 2 + 3 + 4 = 10.",
  "starterCode": "function sumUpTo(n) {\n  // your code here\n}\n",
  "functionName": "sumUpTo",
  "visibleTests": [
    { "id": "t1", "args": [1],   "expected": 1 },
    { "id": "t2", "args": [5],   "expected": 15 },
    { "id": "t3", "args": [10],  "expected": 55 },
    { "id": "t4", "args": [0],   "expected": 0 },
    { "id": "t5", "args": [100], "expected": 5050 }
  ],
  "hiddenTests": {
    "count": 20,
    "args": [ { "gen": "intInRange", "min": 0, "max": 200 } ],
    "edgeCases": [[0], [1], [2], [199], [200]]
  },
  "referenceSolution": "function sumUpTo(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) {\n    total += i;\n  }\n  return total;\n}\n",
  "requiredConstructs": ["for_loop"],
  "prewrittenHints": [
    "Look at the first test that did not pass. Is your answer too small, too big, or something else?",
    "A loop repeats steps. Think about a running total that grows a little on every turn of the loop.",
    "Start a total at 0. Let the loop count from 1 up to n, and add the counter to the total each time. Give the total back at the end."
  ],
  "conceptNote": "A for loop repeats a block of code. It has a counter that starts at one value, a condition that decides when to stop, and a step that changes the counter. Inside the loop you can keep a running total in a variable declared before the loop. When the loop ends, the total holds the final answer.",
  "commonMistakes": [
    {
      "tag": "loop_stops_early",
      "variantCode": "function sumUpTo(n) {\n  let total = 0;\n  for (let i = 1; i < n; i++) {\n    total += i;\n  }\n  return total;\n}\n"
    },
    {
      "tag": "assign_instead_of_add",
      "variantCode": "function sumUpTo(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) {\n    total = i;\n  }\n  return total;\n}\n"
    }
  ],
  "difficulty": 1,
  "order": 1
}
```

---

## 11. Architecture and tech stack

### 11.1 Layers

```
+---------------------------------------------------------------+
| UI (React Native screens, components, theme from Appendix C)  |
+---------------------------------------------------------------+
| State (Zustand stores)    Navigation (React Navigation tabs)  |
+---------------------------------------------------------------+
| Services (React Native side)                                  |
|  runner-bridge  tutor-service  model-manager  db  notifications|
|  content-loader                                               |
+------------------------------+--------------------------------+
| core/  (pure TypeScript)     | runner/  (bundled into WebView)|
|  harness, generators, prng   |  CodeMirror editor             |
|  genuine, mistakes           |  Web Worker + harness-core     |
|  mastery, recommend          |  Acorn parser, Skulpt (P1)     |
|  xp, streak                  |  postMessage protocol          |
|  prompt, guards, grammar     |                                |
+------------------------------+--------------------------------+
| Native: llama.rn (llama.cpp)  expo-sqlite  expo-file-system   |
+---------------------------------------------------------------+
```

`core/` code runs in two places: React Native (Hermes) for mastery, recommendation, prompt building, and guards; and inside the runner WebView for harness and genuine-use checks. Write it to ES2019, with no Node-only APIs, so both runtimes and Jest accept it.

### 11.2 Repository layout

```
offline-coding-tutor/
  app.config.ts
  package.json
  README.md
  DISCLOSURES.md            # models, libraries, fonts, AI dev tools (H10)
  DECISIONS_LOG.md          # decisions made while implementing (section 0.7)
  LICENSE
  assets/
    content/                # section 10.3
    fonts/                  # Nunito, JetBrains Mono (bundled, no network fonts)
    runner/                 # generated runner.html (build output)
  src/
    config/
      constants.ts          # section 11.5
      model.ts              # section 9.8, FR-MODEL-01
    core/                   # pure TypeScript, no RN imports (H6)
      types.ts
      harness/              # compare.ts, generators.ts, prng.ts, run-tests.ts
      genuine/              # constructs.ts, instrument.ts, mutate.ts, verdict.ts
      mistakes/             # classify.ts
      mastery/              # update.ts, recommend.ts, readiness.ts, callout.ts, coach.ts
      gamification/         # xp.ts, streak.ts
      tutor/                # prompt.ts, grammar.ts, guards.ts, fallback.ts
    runner/                 # WebView bundle sources
      index.html
      editor.ts
      worker.ts
      protocol.ts
    services/
      db.ts  runner-bridge.ts  tutor-service.ts  model-manager.ts
      content-loader.ts  notifications.ts
    state/                  # Zustand stores
    ui/
      theme/                # tokens.ts generated from Appendix C section 3.1 (do not alter hex values)
      components/           # Appendix C section 14 inventory
      screens/
      copy.ts               # all user-facing strings (tone: DESIGN §8)
  tests/
    core/                   # Jest unit tests for core/
    problem-suites/         # <problemId>.json cheat and valid-alternative suites
  bench/
    run-suites.ts           # FR-GENUINE-11
    eval-hints.ts           # section 12.7
    hint-cases.json
    results/                # committed outputs (H7)
  evidence/                 # airplane-mode video, device info, screenshots (section 16)
  scripts/
    build-runner.mjs        # bundles src/runner into assets/runner/runner.html
    verify-content.ts       # FR-CONTENT-07
```

Required npm scripts: `test`, `build:runner`, `content:verify`, `bench:suites`, `bench:hints`, `android`.

### 11.3 Tech stack

Pin exact versions at install time and commit the lockfile. Choose an Expo SDK and React Native version that support the New Architecture, because llama.rn requires it from v0.10 `[VERIFY]` (Appendix B).

| Layer | Choice | Why | Status |
|---|---|---|---|
| App framework | React Native with Expo (development build), TypeScript | One codebase, fast iteration. Expo Go cannot load native LLM modules. | `[PRD0.1]` |
| On-device LLM | `llama.rn` (React Native binding of llama.cpp), GGUF models | CPU inference with token streaming. Pre-built Android libraries ship with the package. | `[PRD0.1]` `[VERIFY]` |
| Model | Qwen2.5-Coder-1.5B-Instruct, Q4_K_M GGUF (about 1 GB) | Code-aware, small, Apache 2.0 | `[DECIDED]` |
| Editor and runner host | `react-native-webview` hosting CodeMirror 6, bundled locally | One offline unit for editing and sandboxed execution | `[PRD0.1]` |
| JavaScript parser (runner) | Acorn (and `acorn-walk`) bundled into the runner | AST with node offsets for instrumentation and mutation | `[ADDED]` `[VERIFY]` |
| JavaScript execution | Web Worker inside the WebView, with a timeout | Isolated from the app, killable | `[PRD0.1]` |
| Python execution | Skulpt, bundled as a local JS file, Python 3 mode, `execLimit` | Small and bundles offline | `[PRD0.1]` `[VERIFY]` |
| Runner bundling | esbuild (or equivalent) into one HTML string | No CDN, no network | `[ADDED]` |
| Local storage | `expo-sqlite` | Progress, mastery, attempts | `[PRD0.1]` |
| Content | JSON in app assets | No backend | `[PRD0.1]` |
| Model download | `expo-file-system` | Fetch the GGUF once, keep in app storage | `[PRD0.1]` |
| State and navigation | Zustand, React Navigation (bottom tabs plus native stack) | Lightweight | `[PRD0.1]` |
| Animation | `react-native-reanimated` | Native-thread animation (DESIGN §7) | `[DESIGN]` `[VERIFY]` New Architecture compatibility |
| Icons | One rounded set: Lucide (`lucide-react-native`, needs `react-native-svg`) or Phosphor | DESIGN §3.4 | `[DESIGN]` |
| Notifications | `expo-notifications` (local only) | Streak reminder | `[DESIGN]` P1 |
| Haptics | `expo-haptics` | DESIGN §7 | `[DESIGN]` |
| Fonts | Nunito and JetBrains Mono, bundled with `expo-font` | DESIGN §3.2 (verify font licenses and list them in `DISCLOSURES.md`) | `[DESIGN]` |
| Tests | Jest (Node environment) | Core logic must be testable without a phone (H6) | `[PRD0.1]` |

Do not use: Expo Go, Pyodide, a retrieval or vector database, analytics or crash-reporting SDKs, Lottie, remote fonts, CDN scripts, GPU or NPU offload for the model.

### 11.4 Runner protocol (React Native to WebView and back)

All messages are JSON strings passed with `postMessage`. The WebView has no other bridge (H3).

```ts
// src/runner/protocol.ts

// React Native -> WebView
export type ToRunner =
  | { type: 'init'; theme: 'light' | 'dark'; fontSize: number; language: LanguageId }
  | { type: 'setCode'; code: string }
  | { type: 'insertText'; text: string; cursorOffset?: number }  // symbol bar
  | { type: 'undo' } | { type: 'redo' }
  | { type: 'highlightLine'; line: number | null }
  | { type: 'run'; runId: string; seed: number; language: LanguageId; code: string;
      problem: {
        functionName: string; visibleTests: TestCase[]; hiddenTests: HiddenTestSpec;
        floatTolerance?: number; referenceSolution: string;
        requiredConstructs: RequiredConstruct[];
        commonMistakes: CommonMistake[];       // for mistake classification, executed inside the runner only
      };
      timeoutMs: number; genuineEnabled: boolean }
  | { type: 'cancel'; runId: string };

// WebView -> React Native
export type FromRunner =
  | { type: 'ready' }
  | { type: 'codeChanged'; code: string }
  | { type: 'runResult'; runId: string; result: RunResult }          // phase 1: tests
  | { type: 'genuineResult'; runId: string; result: GenuineResult }  // phase 2: only if tests passed
  | { type: 'runFailed'; runId: string; message: string };           // runner-level failure
```

Notes:

1. Sending `referenceSolution` and mistake-variant code to the runner is fine (it never reaches the model, H1). It does mean the content ships inside the APK. This is acceptable for the MVP.
2. Phase 1 and phase 2 are separate messages so the visible results appear within `RESULTS_TARGET_MS`.
3. Each execution phase uses a fresh Worker (FR-RUN-01).

### 11.5 Constants (single source of truth)

File: `src/config/constants.ts`. Every tunable value lives here. Change values here only.

```ts
// Execution
export const RUN_TIMEOUT_MS = 3000;                  // [PRD0.1]
export const RESULTS_TARGET_MS = 1000;               // [PRD0.1] target, not a guarantee
export const PRINTED_OUTPUT_CAP_CHARS = 4000;        // [ADDED]

// Hidden tests and genuine-use
export const HIDDEN_TEST_COUNT = 20;                 // [ADDED]
export const GENUINE_SAMPLE_INPUTS = 10;             // [ADDED]
export const GENUINE_PHASE_BUDGET_MS = 3000;         // [ADDED]
export const MUTATION_UNCHANGED_RATIO = 0.9;         // [ADDED] tune with cheat suites
export const MUTATION_RUN_TIMEOUT_MS = 300;          // [ADDED]
export const GENUINE_GATE: 'soft' | 'hard' = 'soft'; // [OPEN O10]

// Mastery
export const MASTERY_MIN = 0;
export const MASTERY_MAX = 100;
export const MASTERY_INITIAL = 0;
export const MASTERY_DELTA = {
  firstTry: 15, retries: 10, hints: 5, notGenuine: 5, abandoned: -5,
} as const;                                          // [PRD0.1]
export const REVIEW_THRESHOLD = 40;                  // [PRD0.1] (4/10)
export const READY_THRESHOLD = 70;                   // [OPEN O2] (7/10)
export const STRUGGLE_ATTEMPTS_TO_PASS = 3;          // [OPEN O3]
export const STRUGGLES_BEFORE_EASY_REVIEW = 2;       // [DESIGN §2]

// Gamification (DESIGN §6)
export const XP_BASE = { firstTry: 20, retries: 15, hints: 10, notGenuine: 10 } as const;
export const XP_CLEAN_BONUS = 5;
export const xpToNextLevel = (level: number): number => 100 * level;   // [OPEN O4]
export const STREAK_FREEZE_REFILL_EVERY = 7;

export function levelFromXp(totalXp: number): { level: number; xpIntoLevel: number; xpForNext: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpToNextLevel(level) };
}

// AI tutor
export const AI = {
  temperature: 0.3,                // [PRD0.1]
  nPredict: 120,                   // [PRD0.1]
  nCtx: 2048,
  nThreads: 4,                     // [VERIFY] tune on the demo phone
  nGpuLayers: 0,                   // [ADDED] CPU only (D15)
  useMlock: false,                 // [ADDED] avoid pinning memory on low-RAM phones
  promptTokenTarget: 300,          // [ADDED] D14
  promptTokenMax: 800,             // [PRD0.1]
  codeLinesMax: 40,                // [ADDED] D14 (PRD v0.1 said 60)
  firstTokenTimeoutMs: 8000,       // [DESIGN §5.5]
  totalTimeoutMs: 30000,           // [ADDED]
  maxRegenerations: 1,             // [PRD0.1]
} as const;
export const MODEL_UNLOAD_AFTER_BACKGROUND_MS = 60000;  // [ADDED]
export const LOG_AI_TEXT_DEFAULT = false;               // [ADDED]
```

---

## 12. AI tutor specification

### 12.1 Role

The model explains and encourages. It never decides whether code passes (H1), never writes code or the full solution (H5), and never sees the reference solution or mistake-variant code. Rules do the diagnosing; the model words the help. This keeps the small model's job narrow and reliable.

### 12.2 Interactions

| Action | Where | Behavior |
|---|---|---|
| Hint | Problem screen (before or after any run) | Ladder level 1 to 3. Each tap moves to the next level for this attempt. Button labels: "Hint", "More help", "Show approach". The ladder resets for each new attempt. |
| Explain my error | Results sheet, only when a failing result exists | Explains what the failing test or error shows in plain words. Does not change the ladder level. Counts as a tutor request. |
| Coach message | Completion screen, Practice, and Learn "Up next" card | One sentence about the recommendation. Deterministic template first (section 9.6.4). P1: AI rewording. |

Hint level meanings:

| Level | Intent |
|---|---|
| 1 | Name the kind of mistake and which part of the code to check. No fix. |
| 2 | Explain the idea behind the concept in words, using the concept note. No steps. |
| 3 | Describe the next step in words. No code. Never the final answer. |

### 12.3 Pipeline for one request

1. Increment the attempt's `tutor_requests`. Update `max_hint_level` for hints.
2. Show the prewritten hint for the level immediately (label "Quick hint"). For Explain my error, show a deterministic plain-words summary of the failing test as the instant text (for example "Test 2 expects 6 but your code gave 5.").
3. If the tutor state is not `ready`, stop. Show the soft link "Download tutor for smarter hints" (DESIGN §9).
4. Build the prompt (12.4). Start generation with the grammar (12.5), streaming tokens to the card.
5. If no first token within 8000 ms, abort, keep the prewritten text, show no error.
6. When generation finishes, run the output guards (12.6). If all pass, keep the AI text (label "Tutor"). Otherwise regenerate once with a different sampling seed. If that also fails, restore the prewritten text.
7. Write a `tutor_events` row (source `ai` or `prewritten`, timings, rejected reason).

Streaming display: words appear as generated, with no fake typewriter effect. A skeleton shimmer shows until the first token. The last sentence (the guiding question) is rendered bold (DESIGN §5.5). Screen readers announce the text once it is complete.

### 12.4 Prompt specification

Chat template: use the template embedded in the GGUF (ChatML for Qwen). Messages: one `system`, one `user`. Stop tokens: `<|im_end|>`, `<|endoftext|>`.

System message (fill `{LANGUAGE}` with "JavaScript" or "Python"):

```
You are a patient coding tutor for beginners. You help a learner who is stuck on a small {LANGUAGE} problem.

Rules:
- Use plain English with short, simple words.
- Write at most 3 sentences.
- Talk about the failing test the learner can see.
- Never write code. Never give the full answer.
- End with one guiding question that helps the learner decide their next step.
```

User message template (omit a line when its value is empty):

```
PROBLEM: {statement}
CONCEPT NOTE: {conceptNote}
FAILING TEST: input {args}, expected {expected}, got {actual}
ERROR: {plainError} (line {line})
MISTAKE TYPE: {learnerText of the detected tag}
LEARNER CODE:
{code, at most 40 lines}
TASK: {levelInstruction}
```

`levelInstruction` values:

| Case | Text |
|---|---|
| Hint level 1 | "Say what kind of mistake this looks like and which part of the code to check. Do not explain the fix." |
| Hint level 2 | "Explain the idea behind this concept in words, using the concept note. Do not list the steps." |
| Hint level 3 | "Describe the next step in words. Do not write code. Do not give the final answer." |
| Explain my error | "Explain in plain words what the failing test or error shows: what was expected, what the code gave, and what that suggests. Do not fix it." |

If the learner has not run tests yet, write `FAILING TEST: none yet` and keep the task instruction for the level.

Token budget: estimate tokens as `ceil(characters / 4)`. Target `AI.promptTokenTarget` (300). Hard maximum `AI.promptTokenMax` (800). If over target, trim in this order until under target or nothing is left to trim: (1) drop `CONCEPT NOTE` unless the level is 2; (2) truncate `PROBLEM` to its first 400 characters; (3) reduce `LEARNER CODE` toward the lines around the error line, down to a minimum of 15 lines. If still over the hard maximum, drop the code to the failing function only. Never exceed the hard maximum.

Sampling: `temperature` 0.3, `n_predict` 120. The first generation uses a random seed. The regeneration uses a different seed.

### 12.5 Decoding grammar (hard guardrail)

llama.rn supports GBNF grammars that constrain output (Appendix B). Use them so the model physically cannot emit code characters.

Hint and Explain grammar (one paragraph, 40 to 400 characters, no code characters, ends with a question mark):

```
root ::= [^`{};=<>\n]{40,400} "?"
```

Coach grammar (one sentence, ends with a period or exclamation mark):

```
root ::= [^`{};=<>\n?!]{20,160} ("." | "!")
```

Rules:

1. `[VERIFY]` Confirm the installed llama.rn version accepts a `grammar` string in the completion options and that this syntax (including `{m,n}` repetition) parses. If it does not, remove the grammar, rely on the post-generation guards (12.6), and note it in `DECISIONS_LOG.md` (H12).
2. Prewritten hints are not grammar-limited. They follow their own authoring rules (12.8).
3. The grammar stops the model from writing code. It does not stop it from describing the algorithm in words at level 3. That is allowed (level 3 intent).

### 12.6 Output guards (post-generation)

Run all guards on the final text. Any failure rejects the output.

| ID | Guard |
|---|---|
| G1 | No fenced code block (three backticks). |
| G2 | No more than 3 sentences (split on `.`, `!`, `?` followed by a space or the end). |
| G3 | Length between 40 and 400 characters (coach: 20 to 160). |
| G4 | Ends with `?` for hints and explanations. |
| G5 | Does not contain any 12-character-or-longer substring of the reference solution, compared after removing whitespace and lowercasing both. |
| G6 | Contains none of the characters `{` `}` `;` (catches the non-grammar path). |

A rejection triggers one regeneration (`AI.maxRegenerations`), then the prewritten fallback. Record the failing guard id in `tutor_events.rejected_reason`.

### 12.7 Evaluation (what to measure and publish)

The model is small. Measure it and publish what you measure (H7). Never tune a metric by editing the test set.

| Metric | Method | Rule |
|---|---|---|
| Leak rate | Run the hint cases and count outputs that reveal the full solution or a code line, by script check (G5, G6) plus manual review of every output. | Target 0. Any leak is a bug: fix the prompt, grammar, or guards. |
| Relevance | A manual 3-point rating of whether the text refers to the failing test or error. | Report the distribution. |
| Usable rate | A manual rating: accurate for the failing test, no solution given, at most 3 sentences, ends with a question. | Report the percentage. |
| Latency | Model load time, time to first token, tokens per second, total time per hint, on the demo phone. | Record the phone model and RAM. |
| Mistake tagging accuracy | Rules only on seeded buggy submissions. P2: rules plus model second opinion (ablation). | Report both numbers when both exist. |

Procedure:

1. `bench/hint-cases.json` holds at least 30 seeded failing submissions across the shipped problems: each `{ problemId, code, kind: 'hint' | 'explain', level }`. Build most of them from the mistake variants plus hand-written slips (typos, missing return, wrong boundary).
2. `bench/eval-hints.ts` builds prompts with the real `src/core/tutor/prompt.ts` and runs them against a local llama.cpp `llama-server` loading the same Q4_K_M GGUF (it accepts a `grammar` option `[VERIFY]`). Ollama MAY be used for fast prompt iteration but does not apply the GBNF grammar, so final numbers MUST come from the llama.cpp path or the on-device bench.
3. Results are written to `bench/results/hints.json` with the model file name, quantization, parameters, and git commit.
4. On-device latency comes from the dev bench screen (FR-DEV-02) and is saved to `bench/results/device-bench.json`.

### 12.8 Prewritten hint and concept note authoring rules

1. 2 or 3 hints per problem. Index equals level minus 1.
2. Hint 1 nudges toward the failing test. Hint 2 explains the idea. Hint 3 describes the next step in words.
3. At most 3 sentences each. Plain words. No fenced code. Inline names of variables or functions are fine. The full solution never appears (verified by `content:verify`).
4. Concept note: 150 words or fewer, 12-year-old reading level, one idea per paragraph.

---

## 13. Non-functional requirements

| ID | Requirement | Tag |
|---|---|---|
| NFR-01 | Fully offline after the model download (H2). The app works in airplane mode. | `[PRD0.1]` |
| NFR-02 | Visible test results appear in under 1 second for a typical problem (`RESULTS_TARGET_MS`). | `[PRD0.1]` |
| NFR-03 | AI latency hypotheses, NOT promises: first token within 5 seconds and a full hint within about 15 seconds on a 6 GB phone. Measure on the demo phone and publish measured values (H7). Set UI timeouts from section 12.3, not from these hypotheses. | `[PRD0.1]` `[VERIFY]` |
| NFR-04 | Cold start to the Learn screen under 3 seconds on a 4 GB device. 60 fps scrolling on Learn and Mastery (virtualized lists). | `[DESIGN §11]` |
| NFR-05 | Load the editor WebView once and reuse it. No animations while the model is generating. | `[DESIGN §11]` |
| NFR-06 | App size under 100 MB excluding the model. | `[PRD0.1]` |
| NFR-07 | Minimum device: Android 10 or newer, 4 GB RAM (6 GB recommended). Record the exact demo phone model and RAM in `evidence/device.md`. | `[PRD0.1]` |
| NFR-08 | No accounts, no telemetry. Learner code never leaves the device. | `[PRD0.1]` |
| NFR-09 | Accessibility per DESIGN §10: 48 dp targets, contrast 4.5:1 body and 3:1 large text and icons, state never by color alone, UI scales to 130%, screen reader labels, motion and haptics off switches. | `[DESIGN]` |
| NFR-10 | Resilience: if the OS kills the app, drafts, attempts, and progress survive (SQLite plus draft autosave). If the model crashes or memory is low, fall back to prewritten hints without crashing the app. | `[ADDED]` |
| NFR-11 | Battery and heat: generation is short (at most 120 tokens). State in the README that on-device AI warms the phone and uses battery. | `[ADDED]` |
| NFR-12 | Storage: handle "out of storage" during the model download with a plain message that states the free space needed and a Retry button. | `[DESIGN §9]` |
| NFR-13 | Language: English only for UI and tutor text. | `[DESIGN]` |

---

## 14. Testing and verification

### 14.1 Unit tests (Jest, Node environment)

All of `src/core/` MUST have tests. Minimum coverage list:

| Module | Must test |
|---|---|
| `harness/compare` | primitives, `NaN`, nested arrays and objects, float tolerance, mismatched types |
| `harness/prng`, `generators` | determinism for a seed, ranges, array length bounds, edge cases run first |
| `genuine/instrument` | tick insertion into block bodies and single-statement bodies, nested loops, offsets applied high to low, `for` with empty body returns unsupported |
| `genuine/mutate` | body neutralization for each loop kind |
| `genuine/verdict` | scale test, mutation test, unsupported structure, budget exceeded, never accuse on inconclusive |
| `mistakes/classify` | variant match, no match, multiple failing inputs, runtime error mapping |
| `mastery/update` | each delta, clamping at 0 and 100, `last_delta` raw value, review queue enter and exit |
| `mastery/recommend` | every branch of 9.6.3, tie-breaks, `pickItem` order |
| `mastery/callout` | weakest concept, strongest concept, no data |
| `gamification/xp` | each kind, clean bonus rule, `levelFromXp` boundaries |
| `gamification/streak` | gap 0, gap 1, gap 2 with and without freeze, freeze refill at 7, broken notice |
| `tutor/prompt` | each level, no-run-yet case, token trimming order, hard maximum, never includes reference or variant code |
| `tutor/guards` | G1 to G6 pass and fail cases |

### 14.2 Content verification (`npm run content:verify`)

Implements FR-CONTENT-07 for every problem file, plus roadmap integrity (every problem id exists, every stage concept is active, orders are unique), and `mistakes.json` coverage (every `commonMistakes.tag` has `learnerText`).

### 14.3 Cheat suites

Each shipped problem has `tests/problem-suites/<problemId>.json`. The JavaScript problems MUST have a full suite (3 cheat entries and 2 valid alternatives at minimum). Python problems SHOULD have at least a hard-coded cheat and one valid alternative.

Format:

```json
{
  "problemId": "js-loops-01",
  "cheats": [
    { "label": "hardcoded",
      "code": "function sumUpTo(n) {\n  if (n === 1) return 1;\n  if (n === 5) return 15;\n  if (n === 10) return 55;\n  if (n === 0) return 0;\n  if (n === 100) return 5050;\n  return 0;\n}\n",
      "expect": { "status": "tests_failed" } },
    { "label": "decorative_loop",
      "code": "function sumUpTo(n) {\n  for (let i = 0; i < 1; i++) {}\n  return n * (n + 1) / 2;\n}\n",
      "expect": { "status": "tests_passed", "genuine": "CORRECT_NOT_GENUINE", "reason": "loop_not_doing_work" } },
    { "label": "loop_unused",
      "code": "function sumUpTo(n) {\n  let count = 0;\n  for (let i = 1; i <= n; i++) {\n    count += 1;\n  }\n  return n * (n + 1) / 2;\n}\n",
      "expect": { "status": "tests_passed", "genuine": "CORRECT_NOT_GENUINE", "reason": "loop_not_doing_work" } },
    { "label": "no_loop_formula",
      "code": "function sumUpTo(n) {\n  return n * (n + 1) / 2;\n}\n",
      "expect": { "status": "tests_passed", "genuine": "CORRECT_NOT_GENUINE", "reason": "missing_construct" } },
    { "label": "while_instead_of_for",
      "code": "function sumUpTo(n) {\n  let total = 0;\n  let i = 1;\n  while (i <= n) {\n    total += i;\n    i++;\n  }\n  return total;\n}\n",
      "expect": { "status": "tests_passed", "genuine": "CORRECT_NOT_GENUINE", "reason": "missing_construct" } }
  ],
  "validAlternatives": [
    { "label": "count_down",
      "code": "function sumUpTo(n) {\n  let total = 0;\n  for (let i = n; i >= 1; i--) {\n    total += i;\n  }\n  return total;\n}\n",
      "expect": { "status": "tests_passed", "genuine": "GENUINE" } },
    { "label": "start_at_zero",
      "code": "function sumUpTo(n) {\n  let total = 0;\n  for (let i = 0; i <= n; i++) {\n    total += i;\n  }\n  return total;\n}\n",
      "expect": { "status": "tests_passed", "genuine": "GENUINE" } },
    { "label": "total_equals_total_plus_i",
      "code": "function sumUpTo(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) {\n    total = total + i;\n  }\n  return total;\n}\n",
      "expect": { "status": "tests_passed", "genuine": "GENUINE" } }
  ]
}
```

Notes on this example:

1. `while_instead_of_for` and `no_loop_formula` are correct programs that break the problem's rule ("Use a `for` loop"). They are expected to return `missing_construct` with the friendly copy of section 9.4.3. They are policy tests, not accusations of cheating.
2. `bench/run-suites.ts` runs every suite through the pipeline and writes `bench/results/suites.json` with, per problem and in total: cheats caught out of cheats tried, valid alternatives wrongly flagged out of valid alternatives tried, and every mismatch with its label (S3, H7).
3. Reference solutions MUST pass `GENUINE`. Add this check to `content:verify`.

### 14.4 Hint evaluation

Section 12.7. Outputs in `bench/results/hints.json`.

### 14.5 On-device checklist (run on the demo phone; save results to `evidence/checklist.md`)

1. Install the `download` flavor. Download the model on Wi-Fi. Pause and resume once. Verify the SHA-256 check.
2. Turn on airplane mode. Force-stop and reopen the app. Complete the demo path (DESIGN §12) with no errors.
3. Run an infinite loop in the editor. Confirm the timeout message appears within about 3 seconds and the app stays responsive.
4. Inside the runner, confirm `fetch('https://example.com')` fails (FR-RUN-06).
5. Confirm the dev network tripwire records zero calls after the model is ready (S6).
6. Background the app for more than 60 seconds, then request a hint. Confirm the model reloads.
7. Delete the model. Confirm hints fall back to prewritten text with the soft download link.
8. Corrupt the model file (truncate it). Confirm the load fails gracefully and prewritten hints work.
9. Fill storage so the download fails. Confirm the plain out-of-storage message.
10. Toggle light, dark, and system themes. Toggle reduce motion. Increase system font size to 130%. Confirm no clipped text on P0 screens.
11. Run the `offline` flavor build and confirm the app manifest has no `INTERNET` permission.
12. Run the dev bench screen and copy `device-bench.json` with `adb pull` into `bench/results/`.

### 14.6 Definition of done for any feature

1. Requirement ID referenced in the commit and test names.
2. Core logic covered by Jest (H6).
3. Any user-facing claim traceable to a script output or a test (H7, H12).
4. New dependency, font, or tool added to `DISCLOSURES.md` (H10).
5. UI follows Appendix C and passes the relevant part of the accessibility checklist.

---

## 15. Content blueprint (suggested starting set)

Authors MAY change titles and functions. Keep one problem per active concept, the same concept order, and the reading level. Write all statements, tests, hints, and notes from scratch (H9). The worked example in section 10.3 is the template.

| Order | Concept | JavaScript | Python | Required construct | Likely mistake tags (examples) |
|---|---|---|---|---|---|
| 1 | `variables_types` | `totalCost(price, quantity)`: return price times quantity | `total_cost(price, quantity)` | none | `wrong_operator`, `missing_return` |
| 2 | `conditionals` | `ticketPrice(age)`: age 12 or under pays 5, age 60 or over pays 6, everyone else pays 10 | `ticket_price(age)` | none | `boundary_off_by_one`, `missing_else_case` |
| 3 | `loops` | `sumUpTo(n)`: sum 1 to n (worked example) | `sum_up_to(n)` | `for_loop` | `loop_stops_early`, `assign_instead_of_add` |
| 4 | `functions` | `maxOfThree(a, b, c)`: return the largest | `max_of_three(a, b, c)` | none | `compares_only_two`, `missing_return` |
| 5 | `arrays_lists` | `sumOfEvens(numbers)`: sum the even numbers in an array | `sum_of_evens(numbers)` | `any_loop` | `loop_stops_early`, `counts_instead_of_sums` |

Hidden-test generator suggestions: `totalCost` two `intInRange` (0 to 100); `ticketPrice` one `intInRange` (0 to 100) with edge cases at 0, 12, 13, 59, 60, 100; `sumUpTo` as in 10.3; `maxOfThree` three `intInRange` (-50 to 50) with edge cases where each argument is the largest and with ties; `sumOfEvens` one `intArray` (length 0 to 15, values -20 to 20) with edge cases for an empty array, all odd, all even.

Python content follows the same shape. Python problems must stay within what the bundled Skulpt supports; run every reference solution and mistake variant through the harness before shipping (FR-CONTENT-07).

---

## 16. Submission and evidence

Reviewers may be humans or automated tools. Both reward claims that are easy to verify (H7, H12, H14).

### 16.1 Deliverables

| Item | Requirement |
|---|---|
| Public GitHub repo | Public by 10:00 AM on 2026-10-10. First commit after the 1:00 PM kickoff on 2026-10-09. Steady commits. A LICENSE file (team chooses; MIT or Apache-2.0 are common). No secrets. |
| `README.md` | Structure in 16.2. |
| `DISCLOSURES.md` | Models (name, size, quantization, license), frameworks and libraries, fonts, APIs and cloud services (none in the core flow; the only network use is the one-time model download), existing code and assets (none, or list), AI development tools (list every one used, including Devin or other coding assistants). |
| `bench/` | Scripts and committed results: `suites.json`, `hints.json`, `device-bench.json`. |
| `evidence/` | `airplane-mode.mp4` (screen recording with the status bar visible), `device.md` (phone model, RAM, Android version), `checklist.md` (14.5 results), screenshots, optional `poll.md`. |
| Demo video | About one minute. Same product name and the same numbers as the README. Say the key claims aloud and show them on screen. |
| Social post | X or LinkedIn, tagging @cognition and Devin, with #AppBuildersPH. |
| Debug APK | Attach to a GitHub release before the deadline so judges can install without building. |
| Submission form | Project name, short description (3.5), team members exactly as registered, repo URL, video URL, post URL, the "why local" answer (2.5), the disclosures. One submission only. |

### 16.2 README structure

1. Title, one sentence, links to video and post.
2. The problem and who it is for. Evidence with sources and any poll counts and quotes (used with permission).
3. Why the AI runs on the device (three reasons). Table "Runs locally / Needs internet" (everything local except the one-time model download).
4. What is different. Name the closest tools yourself and state the one difference in specific words (genuine-use verification, on-device tutor, mastery-driven practice).
5. Does it work. Results table copied from `bench/results/*.json`, with phone model, RAM, model file, quantization, and git commit.
6. Judge quickstart: install the APK, place or download the model, turn on airplane mode, open the sample problem.
7. Claims map: each claim next to a file path, a results file, or a video timestamp.
8. Limitations: small-model accuracy, JavaScript-only contribution check (if so), download size, heat and battery, tested devices only, seeded demo data in the video (H8).
9. Disclosures link. Roadmap. Team.

### 16.3 Demo and pitch

Demo path (DESIGN §12, under 90 seconds; compress for the video): airplane mode on, open a problem, run buggy code, see the failing test, tap Hint (quick hint, then streamed hint), fix, pass, XP and the mastery bar move, Up next. Add the differentiator beat: submit a hard-coded or fake-loop solution and show the app say the loop is not doing the work. Keep the "Works offline" chip visible within the first 15 seconds.

Pitch outline (5 minutes) and Q&A (3 minutes):

| Minute | Content |
|---|---|
| 0:00 | The problem in one sentence. Airplane mode on. |
| 0:30 | Live demo: failing test, hint, fix, pass, mastery moves |
| 2:00 | Live demo: try to cheat it (invite a judge to hand-write a hard-coded or fake-loop answer) |
| 3:00 | Why local: three reasons, measured numbers from `bench/results` |
| 4:00 | Honest limits and what is built versus planned |
| 4:30 | Roadmap and close |

Q&A prep:

| Question | Answer outline |
|---|---|
| Why not ChatGPT or Copilot? | No cap on hints, no signal needed, code stays on the phone. Show airplane mode. |
| How is this different from existing coding apps and school platforms? | Name them. The difference is the on-device tutor plus checking that a loop really does the work, with published cheat-catch numbers. Credit the others. |
| How accurate is a 1.5B model? | We do not trust it with correctness. Tests decide. Here are the measured hint numbers and the zero-leak result. |
| Does it run on cheap phones? | State the tested phones and RAM. Below that, prewritten hints still work. |
| How do you know learners need this? | The poll results and the cited sources. |
| What did you build and what did you reuse? | Read `DISCLOSURES.md`. |
| Seeded data? | Say it plainly: the Mastery screen in the video used demo seed data (H8). |

Logistics: name the demo phone and RAM, keep airplane mode on, preload the model, warm up one generation before the slot, bring a charger and a second phone with the same setup, record a backup video. Confirm Demo Day check-in times in the organizers' channel.

### 16.4 Evidence of need (PROPOSED, low cost)

Ask 10 to 15 learners three questions and save counts and permitted quotes in `evidence/poll.md`: (1) Do you practice coding mostly on a phone or a laptop? (2) Have you hit a free AI limit or lost signal while learning? (3) Have you ever passed a practice problem without understanding it? Do not use real learner code or personal data. Ask the organizers whether contacting outside people counts as "external help" before contacting anyone beyond your own team.

---

## 17. Risks and mitigations

| Risk | Impact | Mitigation | Fallback |
|---|---|---|---|
| llama.rn does not build or run (native module, New Architecture, Expo version) | No on-device AI | Do G0 and G1 first. Pin versions. | Native Android with MediaPipe LLM Inference, or ship prewritten hints only and state it honestly (H12) |
| Model too slow on the demo phone (prompt reading dominates) | Poor demo | Short prompt (300 tokens), prewritten hint first, CPU thread tuning, short outputs | Cap to level-1 hints only, or use a smaller model |
| Small model gives wrong or overlong advice | Misleading hints | Tests decide, rule-based mistake type in the prompt, grammar, guards, one retry, prewritten fallback | Prewritten hints only for that problem |
| Hint leaks the solution | Undermines the product | Grammar, guard G5 and G6, leak test with a target of 0 | Tighten prompt or force prewritten text at level 3 |
| Grammar syntax or option not accepted by the installed llama.rn | Loses the hard guardrail | Verify in G1 | Post-generation guards G1 to G6 plus regeneration |
| WebView offline loading, Worker from Blob, or CSP breaks execution | Runner fails | Verify in G2 with the isolation checks | Run the harness in the WebView main thread with timeouts (document the weaker isolation) |
| Skulpt lacks features or blocks the thread on runaway code | Python unreliable | `execLimit`, worker if possible, keep problems to basics, verify every reference solution | Python becomes post-MVP; ship JavaScript only |
| Genuine-use instrumentation breaks on unusual code | False accusations | Never accuse on inconclusive results (FR-GENUINE-07); tune against suites | Keep tests plus construct presence; drop the contribution check and update claims |
| Valid alternative solutions get flagged | Learner distrust | Valid-alternative suites, soft gate with Continue anyway | Raise `MUTATION_UNCHANGED_RATIO`, mark problems `GENUINE_UNVERIFIED` |
| Content authoring takes longer than coding | Thin content | Fixed blueprint (section 15), one language first | Fewer problems; claims reflect actual counts |
| "Ready" never reachable in MVP (O2) | Hollow milestone | Decide O2 early | Show marker but do not promise unlock |
| Phone heats up or battery drains during the demo | Demo risk | Short generations, warm-up, charger, second phone | Backup video |
| Android kills the app in the background | Lost state | Draft autosave, attempts persisted | n/a |
| Model download size or hosting | Cannot demo | Preload and sideload on the demo phone, `offline` flavor | Import model file action |
| Overclaiming in README or video | Dispute or disqualification | Claims map and H7, H12, H14 | Delete the claim |
| Seeded demo data mistaken for real results | Credibility | H8 disclosure | n/a |
| Reanimated or other native modules incompatible with the New Architecture | Build failure | Check at G0 | Use React Native `Animated` for the few P0 animations |

---

## 18. Build sequence and cut order

Gates are in dependency order. They are not time boxes. Do the riskiest technical gate first.

### 18.1 Gates

| Gate | Work | Pass condition |
|---|---|---|
| G0 | Create the empty public repo after kickoff. Expo development build with llama.rn builds and launches on the demo phone. Create `DISCLOSURES.md`, `DECISIONS_LOG.md`, `src/config/constants.ts`. | App launches on the demo phone from a dev build. |
| G1 | LLM spike: place the model file, `initLlama`, stream tokens for a fixed prompt, test the grammar option, record load time, first-token time, tokens per second. | Tokens stream on the demo phone, numbers recorded. If it fails, apply the fallback in section 17. |
| G2 | Runner: persistent WebView with CodeMirror, symbol bar, JavaScript Worker, timeout, CSP, isolation checks. | An infinite loop returns a timeout; `fetch` fails inside the runner; symbol bar inserts text. |
| G3 | Harness and results UI: visible and hidden tests, first failing test, error translation. | Results in under 1 second for the worked example. |
| G4 | Content and verification: JavaScript problems, mistakes, suites, `content:verify`. | `content:verify` and suites run green. |
| G5 | Tutor service: prompt builder, grammar, guards, streaming card, Hint ladder, Explain my error, fallback. | Zero guard bypass on the hint cases; fallback works with the model removed. |
| G6 | Persistence and mastery: SQLite, attempts, mastery updates, recommendation, Mastery screen, completion screen with XP. | Unit tests for 9.6 pass; demo loop works end to end. |
| G7 | Genuine-use contribution check (JavaScript). | Cheat suites caught and valid alternatives not flagged, or the check is dropped and claims updated. |
| G8 | Python (P1): Skulpt runner, 5 problems, hidden tests. | Reference solutions pass; timeout works. |
| G9 | P1 polish: onboarding with daily goal, download card states, streak and reminder, level-up moment, dev menu, `offline` flavor. | Items verified on the phone. |
| G10 | Proof and submission: run `bench` scripts, record the airplane-mode video, complete README, disclosures, post, release APK, submit. | Section 16 deliverables complete. |

### 18.2 Definition of MVP done

Success criteria S1 to S10 (section 4.3) hold.

### 18.3 Cut order if time runs short

Cut in this order. Update README claims after every cut (H12).

1. All P2 items.
2. Python roadmap (G8) and any Python claims.
3. AI wording of the coach message (keep the template).
4. Level-up moment and confetti.
5. `offline` flavor and Import model file.
6. Streak, freeze, reminder (keep XP).
7. `predict_output` and `fix_code` problem types.
8. The contribution check (G7). Keep hidden tests and the construct presence check.

Never cut: tests-decide architecture, the prewritten fallback, hidden randomized tests, the airplane-mode proof, bench scripts, README, disclosures.

---

## 19. Glossary

| Term | Meaning |
|---|---|
| Attempt | One learner session on one problem, from first open to completion or abandonment (FR-MASTERY-14) |
| Concept | A skill area such as Loops. Each has one mastery score |
| Mastery score | Integer 0 to 100 per concept, displayed /10. Measures how proficiently the learner uses that skill on the path to building a genuine program |
| Review queue | Concepts whose score fell below 40 on their latest update |
| Visible tests | Tests the learner sees and runs against |
| Hidden tests | Randomized tests generated from a spec and checked against the reference solution |
| Genuine use | The learner's code truly solves the problem, using the required constructs in a way that affects the result |
| Scale test | Checks that a loop's iteration count changes with the input |
| Mutation test | Neutralizes a loop's body and checks that the output changes |
| Cheat suite | Per-problem file of cheating and valid solutions with expected outcomes |
| Prewritten hint | Hint authored by the team, shown instantly and used as fallback |
| Quick hint | UI label for the prewritten hint. "Tutor" labels AI text |
| Tutor | The on-device model (Qwen2.5-Coder-1.5B-Instruct) |
| Runner | The WebView that hosts the editor and executes learner code in a Worker |
| GGUF | File format for llama.cpp models |
| Q4_K_M | A 4-bit quantization of the model, about 1 GB for this model |
| llama.rn | React Native binding of llama.cpp |
| GBNF | Grammar format that constrains llama.cpp output |
| Skulpt | JavaScript implementation of Python used for the Python runner |
| Acorn | JavaScript parser used for construct checks and instrumentation |
| Seed | Number that makes hidden test generation reproducible |

---

## Appendix A. Reconciliation notes

Places where sources disagreed, left a gap, or contained illustrative values. The resolutions here are final (section 0.2).

| ID | Sources | Issue | Resolution |
|---|---|---|---|
| A1 | PRD v0.1 Phase 2 vs DESIGN §6 and §13 | PRD v0.1 listed streaks as Phase 2. DESIGN locks XP, levels, and streaks. | DESIGN wins. XP is P0. Streaks, freeze, reminder, and level-up moment are P1 (section 7). |
| A2 | PRD v0.1 section 9, DESIGN §5.7 | Initial mastery was not specified, and "a concept falls below 40" is ambiguous. If scores start at 0, every concept is below 40 and a naive "below 40 means review" rule would trap the learner in review after the first pass (score 15). | Initial score is 0 with `attempted = false`. A concept is in the review queue only when it is attempted, below 40, and its latest raw delta was negative (a real fall). Roadmap nodes show review-needed only for queued concepts. |
| A3 | DESIGN §5.7 | Footer says reaching 7/10 "unlocks your first mini-project". Mini-projects are a Phase 2 non-goal. | Marker stays. Footer copy is "Reach {threshold/10}+ in every skill to be ready to build a real program." |
| A4 | PRD v0.1, DESIGN §5.7 | With +15 per first-try pass and initial 0, a 70 threshold needs at least 5 first-try passes in one concept. MVP has few items per concept. | Open decision O2. Default keeps 70. Do not fake the state (H8). |
| A5 | DESIGN §5.4, §5.6, §12 | Example values ("+15 XP", "Loops 5.0 to 5.8", "Loops 4/10") are illustrative. 5.0 to 5.8 is not a possible delta. | Treat as examples. Real values come from FR-MASTERY-04 and FR-GAME-01. "Loops 4/10" appears on first open only through dev seed data (FR-DEV-01), disclosed (H8). |
| A6 | DESIGN §6 | "Level n needs 100 x n XP" could mean cumulative or per-level. | Per-level (O4). `levelFromXp` in section 11.5. |
| A7 | DESIGN §2 | "Next-problem picker mixes in one easier review problem after 2 fails": "fail" is undefined. | Defined in O3 and FR-MASTERY (struggle counter). |
| A8 | PRD v0.1 section 8, rule D14 | Prompt under about 800 tokens with code truncated to 60 lines. Prompt reading is slow on mid-range phones. | Target about 300 tokens, hard max 800, code truncated to 40 lines. |
| A9 | PRD v0.1 section 12, DESIGN §11 | "First AI token within 5 seconds" and "full hint within about 15 seconds" were stated as targets without device data. | Treated as hypotheses (NFR-03). UX timeouts come from DESIGN §5.5 (8 s). Publish measured values only. |
| A10 | PRD v0.1 section 8 | Optional Llama 3.2 3B upgrade. | Deferred (D16): slower on typical phones and requires its own license notice. |
| A11 | PRD v0.1 section 14 | A 12-hour hourly build plan. | Replaced by gates without durations (section 18). |
| A12 | Strategy summary | An earlier summary said "the kind of mistake decides which skill's score is affected". | Scoring applies to the problem's primary concept only (FR-MASTERY-02). Mistake tags drive the weakest-concept callout text, the prompt's MISTAKE TYPE line, and review item choice. This keeps scoring deterministic and testable. |
| A13 | DESIGN §13 | DESIGN's P0 list does not include hidden tests, genuine-use checks, or mistake tags. | This PRD adds them as P0 because they are the differentiator and feed the Mastery callout. Cut order is in 18.3. |
| A14 | PRD v0.1 section 5 | Both languages in the MVP. | Python is P1 by default (O1). JavaScript has the lowest runtime risk. |
| A15 | PRD v0.1 section 12, FR2 | "No telemetry" vs the local `tutor_events` log. | The log is local only, never transmitted (D24). Needed for the evaluation scripts. |
| A16 | PRD v0.1 section 8 | Hint input included "hint level 1 to 3" for both actions. | Explain my error does not change the ladder level. Both count as tutor requests (FR-AI-06). Hint works before any test run (prompt says "none yet"). |
| A17 | DESIGN §5.7 and PRD v0.1 | The Practice tab has no behavior defined beyond "next problem or review". | FR-UI-04: Up next card plus a Review list. |
| A18 | DESIGN §3.2 | Fonts are bundled locally. | Added to `DISCLOSURES.md` with licenses verified (H10). |

---

## Appendix B. Sources and verification status

All facts are as of 2026-10-09. "Documented" means found in public docs by the team. It does not mean tested on the team's phone.

### B.1 Facts and their status

| Topic | Fact | Source | Status |
|---|---|---|---|
| Event | Theme, challenge wording, schedule, criteria, rules, submission list | AppBuildersPH briefing slides and event listing | Documented. The deadline (10:00 AM, 2026-10-10, one submission) was confirmed in strategy sessions. Prize amounts differed across sources and are not used here. |
| llama.rn | Requires React Native's New Architecture from v0.10. Ships pre-built Android libraries. Streams tokens through a callback. Supports GBNF grammars. Hexagon NPU is experimental. Expo needs a development build (CNG) with `expo-build-properties` for some features. | github.com/mybigday/llama.rn and package docs | Documented, not tested |
| Model | Qwen2.5-Coder-1.5B-Instruct: 1.54B parameters, Apache 2.0, config context length 32,768, Q4_K_M files reported at about 0.94 to 1.07 GB depending on the quantizer | Hugging Face model cards | Documented. Record the exact file size and SHA-256 you actually use. |
| Model quality | A third-party comparison table lists HumanEval 70.7 and MBPP 69.2 for this model | Third-party model card | Not measured by the team. Do not publish as your own result (H7). These score function writing, not hint quality. |
| Phone speed | On a Snapdragon 865-class phone via Termux, Qwen2.5-1.5B-Instruct Q4_K_M generated about 13 to 14 tokens per second and Llama 3.2 3B about 8 to 9. Prompt reading for Llama 3.2 3B measured about 16 tokens per second on a short prompt. A llama.rn write-up reports 5 to 15 tokens per second on mid-range phones. | Community benchmarks | Anecdotal, older phone, different runtime. Measure on the demo phone. |
| Skulpt | Supports an `execLimit` timeout and a Python 3 mode. Roughly Python 3.7. Standard library partial. No third-party libraries. An older forum thread says a started program can monopolize the thread. | skulpt.org, project configs, vendor docs | Documented, not tested |
| CodeChum | Teachers can set "Minimum Requirements" (required functions or statements) and AI-generate a solution and test cases. Students see a Test Cases tab with the sample outputs that determine their score. | help.codechum.com | Documented. Inference that this is gameable is not tested. Do not demo against a real class. |
| Anti-hardcoding | Hidden tests are the standard defense. Syntax-tree or control-flow analysis exists. CodeGrade offers teacher-written structure checks. CodeHS runs multiple inputs. | Review article, vendor docs | Documented |
| LLM tutor guardrails | CodeHelp and CodeAid design guardrails so tutors do not reveal solutions. CS50's tutor is built to lead rather than spoil. One study cited in CodeHelp found about 70% of ChatGPT-generated hints usable. | arxiv.org/abs/2308.06921, CodeAid (CHI 2024), cs50.readthedocs.io | Informs the leak and usable-rate evaluation. No claim about this product. |
| Mastery modeling | Bayesian Knowledge Tracing needs on the order of 500 learners to fit. Elo-style updates are simpler. | pyBKT paper, adaptive learning guides | Basis for D19 (fixed rules) |
| Teaching method | PRIMM (Predict, Run, Investigate, Modify, Make) and Parsons problems have education research support. One paper found Parsons problems more sensitive to learning gains than code writing. | Sentance and Waite, CS education papers | Basis for the `[PROPOSED]` problem types. Not required for the MVP. |
| Incumbent AI gating | Free tiers of several learning apps cap or gate AI help. | Public pricing and help pages | Not tested hands-on |
| Philippines | Android is about 88% of mobile OS share (June 2026). Budget phones dominate. Prepaid data is cheap. | Statcounter, market reports, DICT/Ookla | Documented. Data cost is NOT a pitch argument (3.4). |

### B.2 Items to verify early (the `[VERIFY]` list)

| ID | Item | Check | Fallback |
|---|---|---|---|
| V1 | llama.rn with the chosen Expo SDK and React Native version (New Architecture) | Build and launch a development build on the demo phone | Pin another compatible Expo SDK; else native MediaPipe LLM Inference; else prewritten hints only |
| V2 | llama.rn `grammar` option and the `{m,n}` repetition syntax | Run both grammars in G1 | Guards G1 to G6 plus regeneration |
| V3 | CPU-only default speed and thread count | Dev bench on the demo phone | Shorter prompts, smaller output cap |
| V4 | Worker from Blob, CSP, and network isolation inside the Android WebView | G2 isolation checks | Main-thread harness with timeouts (document the weaker isolation) |
| V5 | Skulpt inside a Worker, and access to its parser for Python construct checks | G8 spike | Main-thread Skulpt with `execLimit`; no Python construct check |
| V6 | Acorn bundles into the runner and provides node offsets used for instrumentation | G7 spike | Construct presence only; drop the contribution check |
| V7 | Reanimated compatibility with the New Architecture | G0 build | React Native `Animated` |
| V8 | Model URL, file name, size, SHA-256 | Download once, hash, record in `src/config/model.ts` | Another verified source |
| V9 | Importing the model file for the `offline` flavor | Document picker copy on the demo phone's Android version | Preload the model by development build before the `offline` flavor |
| V10 | `POST_NOTIFICATIONS` and scheduled reminders on the demo phone | Manual test | Drop reminders (P1) |
| V11 | llama.cpp `llama-server` accepts a `grammar` parameter for `bench/eval-hints.ts` | Run the script | Use the on-device bench for final hint numbers |
| V12 | Licenses of Nunito and JetBrains Mono | Read the font license files | Swap fonts |

---

## Appendix C. DESIGN.md (verbatim)

The text between the BEGIN and END markers is the unmodified contents of DESIGN.md. Its own headings and section numbers are preserved, and `DESIGN §n` in this PRD refers to them. Visual design, layout, motion, and copy tone follow this text unless Appendix A overrides a specific item. Generate `src/ui/theme/tokens.ts` directly from its section 3.1 and do not alter the hex values.

<!-- BEGIN DESIGN.md (verbatim, unmodified) -->

# DESIGN.md — Offline Coding Tutor

Playful, gamified, phone-first. Light + dark with user toggle. Android first.
Decisions locked: Duolingo-style playfulness, XP + levels + daily streaks, mastery bars + weakest-concept callout. No mascot, no badges, no social.

---

## 1. Design principles

1. **Play, but earn it.** XP and streaks reward effort. Mastery bars reward real skill. Never mix them up on screen.
2. **Code first.** On the problem screen the editor gets the most pixels. Everything else collapses.
3. **Tests decide, AI guides.** Pass/fail UI is always driven by tests (green/red). AI output uses a different, calmer style (indigo) so it never looks like a verdict.
4. **Fast feedback.** Show something within 1 second of every tap. Show the prewritten hint immediately; swap in the AI hint when it streams.
5. **Offline is a feature.** Show an "Offline ready" state clearly. It is the pitch.
6. **Failing is safe.** Red means "try again", never "you're bad". Copy is warm and short.
7. **Cheap to render.** Target 4–6 GB Android phones. Few animations, no heavy Lottie, respect reduced-motion.

---

## 2. Research takeaways (what we apply)

| Finding | Source type | How we apply it |
|---|---|---|
| Streaks work through loss aversion; calendar view, streak freeze, and end-of-day save reminders became standard add-ons | Duolingo case studies | Streak counter + week calendar + 1 freeze; local end-of-day reminder |
| Users set their own daily goal (5/10/15 min) | Duolingo UX writeups | Onboarding asks daily goal: 1 / 2 / 3 problems |
| XP-and-streak engines drive daily repetition but can distract from depth in conceptual subjects | Gamification study commentary | Mastery bars are the main progress view; XP is secondary; streak requires solving, not just opening the app |
| Each color carries one meaning in the reward system (orange = streak, yellow = XP) | Duolingo design breakdown | Fixed semantic colors, see tokens |
| Lessons end on an easier task; failure feels safe | Duolingo design breakdown | Next-problem picker mixes in one easier review problem after 2 fails |
| Mobile code editors fail on: tiny text, cramped buttons, keyboard covering the editor | Public issue reports | 16 px code, 48 dp targets, `adjustResize` + toolbar docked above keyboard |
| 44×44 px minimum touch targets; toolbars should dock above the on-screen keyboard | Editor UI guidance | We use 48 dp; symbol bar sits directly above keyboard |

Caveat: the Duolingo material is secondary (blogs, case studies). Treat the patterns as proven conventions, not hard numbers. Don't quote engagement stats in the pitch.

---

## 3. Visual language

**Personality:** friendly, rounded, bright, confident. Chunky buttons with a bottom "lip" (3D press effect). Big numbers. Short sentences.

### 3.1 Color tokens

Semantic colors are identical in both themes except for lightness.

| Token | Light | Dark | Meaning (never reuse) |
|---|---|---|---|
| `primary` | `#5B4BDB` | `#8B7CFF` | Brand, main CTA, AI tutor |
| `primary-lip` | `#4437B5` | `#6A5BE0` | Button bottom edge |
| `streak` | `#FF8A00` | `#FFA033` | Streak flame, streak UI only |
| `xp` | `#FFC400` | `#FFD23F` | XP and level only |
| `success` | `#2DB84C` | `#4ADE6A` | Tests passed, mastery "Strong" |
| `error` | `#E5484D` | `#FF6B70` | Tests failed, mastery "Needs work" |
| `warn` | `#F59E0B` | `#FBBF24` | Mastery "Getting there" |
| `bg` | `#FFFFFF` | `#14121F` | Screen background |
| `surface` | `#F5F4FB` | `#1E1B2E` | Cards |
| `surface-2` | `#E9E7F5` | `#2A2640` | Inputs, chips |
| `text` | `#1F1B2E` | `#F3F2FA` | Body |
| `text-muted` | `#6B6785` | `#A6A2C0` | Secondary |
| `code-bg` | `#FAFAFD` | `#0F0D18` | Editor background |

Rules:
- Body text contrast at least 4.5:1 in both themes. Verify `text-muted` on `surface` before shipping.
- Never rely on color alone: every pass/fail/mastery state also has an icon and a word.
- Dark theme is not pure black (`#14121F`) to avoid harsh contrast and save eyes at night.

### 3.2 Typography (bundle locally; no network fonts)

- UI: **Nunito** (rounded, friendly). Weights 600, 700, 800.
- Code: **JetBrains Mono** (or Fira Code). 16 px default, user-adjustable 14–20.
- Scale: Display 32/800, Title 22/800, Body 16/600, Caption 13/600, Code 16.

### 3.3 Shape, spacing, elevation

- Base unit 4 dp. Screen padding 16. Card gap 12.
- Radius: buttons 16, cards 20, chips 999.
- Buttons: 56 dp tall, 3 dp darker bottom lip, press = lip collapses 2 dp.
- Cards: 2 dp border in `surface-2` instead of shadows (cheaper to render, cleaner in dark).
- Min touch target 48×48 dp, 8 dp apart.

### 3.4 Icons

One icon set (Lucide or Phosphor, rounded). Custom only for: flame (streak), lightning (XP), shield/target (mastery).

---

## 4. Navigation

Bottom tab bar, 4 tabs, 64 dp, label under each icon:

1. **Learn** (roadmap)
2. **Practice** (next problem / review)
3. **Mastery** (skill bars)
4. **Me** (stats, settings, theme toggle, model)

Persistent top strip on Learn and Mastery: 🔥 streak · ⚡ XP · level pill.

The Problem screen hides the tab bar to maximize editor space.

---

## 5. Screens

### 5.1 First launch and onboarding (3 screens max)

1. **Welcome:** one-line promise "Learn to code. No internet needed." Big Start button.
2. **Pick roadmap:** two large cards, JavaScript Basics / Python Basics. Tap = select.
3. **Daily goal:** 1 / 2 / 3 problems a day. Then **Tutor download card**:
   - Size shown ("about 1 GB, Wi-Fi recommended"), progress bar, pause/resume.
   - Primary button "Start learning now". The app is usable with prewritten hints while downloading.
   - Never block on the download.

States: not downloaded, downloading (%), paused, ready ("Tutor ready · works offline"), failed (retry).

### 5.2 Learn (roadmap)

- Vertical path of nodes grouped by concept (Variables, Conditionals, Loops, Functions, Arrays/Lists).
- Node states: locked (grey + lock), unlocked (primary), completed (success + check), review-needed (warn + refresh icon).
- Each concept header shows its mastery mini-bar.
- Top of screen: "Up next" card with one-line coach message and a Start button.

### 5.3 Problem screen (the money screen)

Layout, portrait, top to bottom:

1. **Header (48 dp):** back, problem title, hint-level dots (●●○), settings gear.
2. **Statement strip (collapsed by default, ~2 lines):** tap to expand into a bottom sheet with the full statement, concept note, and example. Auto-collapses once typing starts.
3. **Editor (fills remaining space):** CodeMirror with line numbers, syntax highlighting, undo/redo.
4. **Symbol bar (44–48 dp, docked directly above keyboard):** `Tab` `{ }` `( )` `[ ]` `" "` `' '` `;` `:` `=` `Undo`. Horizontally scrollable.
5. **Action bar (above symbol bar when keyboard is closed, hidden when typing):**
   - `Run tests` (primary, 56 dp)
   - `Hint` (secondary, indigo outline, with a small lightbulb)

Keyboard open: the editor shrinks (`adjustResize`), the symbol bar stays visible, the action bar becomes a compact floating `▶ Run` button at the right of the symbol bar.

Landscape: statement left, editor right (optional, P2).

### 5.4 Results (bottom sheet over the editor, ~45% height, draggable)

- **All passed:** green header "All tests passed!", XP gain animates (+15 XP), then Continue.
- **Some failed:** header "2 of 5 passed". List of tests: icon + "Test 1 ✓ / Test 3 ✗". Expand the first failing test to show **Input / Expected / You got** in three mono rows.
- Buttons: `Explain my error` (primary), `Try again` (secondary).
- Timeout / runtime error: show the error line in plain words and highlight that line in the editor.

### 5.5 AI feedback card

- Sits inside the Results sheet (or above the editor for Hint).
- Style: `primary` tinted surface, small "Tutor" label with a spark icon. No cartoon face. Never green/red.
- Immediately show the prewritten hint with label "Quick hint". When the AI stream starts, crossfade to "Tutor" text, streamed word by word. A small skeleton shimmer shows while waiting for the first token.
- Max ~3 sentences, ends with one guiding question (enforced by prompt, mirrored in layout: question line is bold).
- Hint ladder: dots show level 1 → 2 → 3. Button label changes: "Hint" → "More help" → "Show approach" (never the solution).
- Footer chip: "Runs on your phone · offline".
- If the AI is slow (over 8 s) or rejected by guardrails: keep the prewritten hint, no error message. If the model is missing, show "Download tutor for smarter hints" as a soft link.

### 5.6 Completion screen

- Confetti-light (one 800 ms burst, skipped when reduced motion is on).
- Three stat rows: XP earned, streak status, mastery change for the concept (e.g., Loops 5.0 → 5.8 with the bar animating).
- **Up next** card + one-line coach message (AI-written, tests-chosen).
- Buttons: `Next problem` (primary), `Back to roadmap`.

### 5.7 Mastery screen (key feature)

**Header:** "Your skills" and a plain summary, e.g. "You're strongest at Variables. Loops need work."

**Weakest-concept callout (top card, always visible):**
- Warn/error tinted card, icon + label "Needs work".
- Text: "Loops · 4/10" + one line: "You miss the last step of a loop often." (generated from stored common-mistake tags, not by free AI text, so it's accurate.)
- Primary button: `Practice Loops` → opens a review problem.

**Concept list (below):** one row per concept:
- Name, score "6/10", horizontal bar (12 dp, rounded), status chip.
- Bar color and chip: 0–3.9 `error` "Needs work", 4–6.9 `warn` "Getting there", 7–10 `success` "Strong".
- Tap row → detail sheet: score history sparkline (last 10 results), common mistakes list, `Practice` button.

**Scale:** store 0–100 per PRD, display as /10 (rounded to 1 decimal). 40/100 review threshold = the 4/10 line.

**"Ready to build" bar:** show a small marker at 7/10 on every bar and a footer: "Reach 7+ in all concepts to unlock your first mini-project." (Adjust threshold to match the final decision.)

Optional P2: radar chart toggle. Bars are the default because they are readable on small screens.

### 5.8 Me (profile and settings)

- Level pill and XP bar to the next level.
- Streak calendar (current week, then month).
- Settings: theme toggle (Light / Dark / System), code font size, daily goal, reminder time, haptics on/off, reduce motion, tutor model status (size, delete, re-download), Wi-Fi-only download.
- Offline status row: "Works in airplane mode."

---

## 6. Gamification spec

**XP**
- Earned per problem: first-try 20, after retries 15, after hints 10. +5 bonus for a clean (no-hint) run. No XP for abandoned.
- Level n needs `100 × n` XP. Level-up = full-screen moment (once, 1.2 s), reward is a new accent flourish, not a gate.

**Streak**
- Increments when at least one problem is **passed** that day (opening the app doesn't count).
- Local date, device timezone. 1 freeze, auto-used on a missed day; refills when you hit a 7-day streak.
- End-of-day local notification only if the streak is at risk. One per day, user can turn it off. Copy is warm, never guilt-based.
- Broken streak screen: "Your streak ended at 5. Start a new one today." No shame, no sad animation.

**Mastery vs XP, shown separately:** XP/level lives in the top strip; mastery lives in its own tab. Never show XP as a skill measure.

**Not building:** badges, leaderboards, hearts/lives, currency, social.

---

## 7. Microinteractions and motion

| Moment | Behavior | Duration |
|---|---|---|
| Button press | Lip collapses, haptic light | 80 ms |
| Test pass | Check pops, row turns green | 250 ms |
| Test fail | Row shakes once, haptic medium | 200 ms |
| XP gain | "+15 XP" floats up, XP chip pulses | 600 ms |
| Mastery bar | Animates from old to new value | 700 ms |
| Streak increment | Flame scales up once | 400 ms |
| AI stream | Words appear as generated, no typewriter fake | live |
| Bottom sheets | Spring, no overshoot | 250 ms |

Reduce motion: replace with instant state change + subtle color fade. Use Reanimated (native thread). No Lottie in MVP.

---

## 8. Copy and tone

- Voice: warm, short, second person, no jargon. Reading level for a 12-year-old.
- Errors translate to plain words: "Your loop stops one step too early" beats "off-by-one".
- Encouragement after failure, specific: "Close! Test 2 expects 6 but you got 5."
- Optional later: Taglish toggle for tutor/coach text. English only for the hackathon unless the model proves reliable in Taglish.
- Never say "wrong" or "failed" about the person. Say "not yet".

Example strings:
- Pass: "Nice! All 5 tests passed."
- Fail: "3 of 5 passed. Let's look at Test 2."
- Streak: "5 day streak. Keep it going!"
- Offline chip: "Works offline"
- Model downloading: "Tutor downloading · 42% · you can start now"

---

## 9. Empty, loading, and error states

| State | UI |
|---|---|
| No problems done yet | Mastery tab shows grey bars at "–/10" and: "Solve your first problem to see your skills." |
| Tutor not downloaded | Hint uses prewritten text; small banner "Smarter hints available, download tutor" |
| Tutor loading into memory | Skeleton in the AI card, prewritten hint visible |
| Runner timeout (3 s) | "Your code ran too long. Check for a loop that never ends." |
| Out of storage | Plain message with free-space needed, `Retry` |
| Low RAM / model crash | Silently fall back to prewritten hints, show a one-time toast |

---

## 10. Accessibility checklist

- 48 dp targets, 8 dp spacing.
- Contrast 4.5:1 body, 3:1 for large text and UI icons.
- Pass/fail/mastery states have icon + text, not color only.
- Dynamic type: UI scales to 130% without clipping; code font adjustable separately.
- Screen reader labels on all icon buttons; test results read as "Test 2, failed. Input… expected… got…".
- Haptics and motion can be disabled.
- AI text is selectable and announced politely once complete (not word by word).

---

## 11. Low-end device performance budget

- Cold start to Learn screen under 3 s on a 4 GB device.
- Test results under 1 s; first AI token under 5 s (per PRD, adjust after device test).
- 60 fps scrolling on Learn and Mastery; keep lists virtualized.
- Load the CodeMirror WebView once and reuse it across problems.
- Don't run animations while the model is generating.

---

## 12. Hackathon / judging UX notes

- Demo path should take under 90 seconds: airplane mode on → open a problem → run buggy code → see failing test → tap Hint → streamed hint → fix → pass → XP + mastery bar moves → Up next.
- Keep an always-visible "Works offline" chip on the Problem and Results screens. Judges should see it in the first 15 seconds of the video.
- Make the Mastery screen demo-ready: seed data so the weakest-concept callout shows "Loops 4/10" on first open for the recording.
- Best Product Experience and People's Choice reward polish: spend time on spacing, the press effect, the results sheet, and the mastery bar animation. Skip anything else cosmetic.
- Record the demo on the real device, light theme first, then show the dark toggle once.

---

## 13. Build priority (24-hour reality)

**P0 (must ship):** tokens + theme toggle, Problem screen with symbol bar, Results sheet, AI feedback card with prewritten fallback, Mastery screen (bars + callout), completion screen with XP, bottom tabs.
**P1:** streak + freeze + reminder, onboarding with daily goal, level-up moment, download card states.
**P2:** radar chart, landscape layout, Taglish toggle, confetti, concept detail sheets.

---

## 14. Component inventory

`Button` (primary/secondary/ghost, lip) · `Card` · `Chip` · `ProgressBar` · `MasteryRow` · `WeakestCallout` · `StatStrip` (streak/XP/level) · `RoadmapNode` · `TestRow` · `ResultsSheet` · `TutorCard` · `HintDots` · `SymbolBar` · `EditorWebView` · `DownloadCard` · `OfflineChip` · `Toast` · `EmptyState`

---

## 15. Open items to confirm

1. Final "ready to build" mastery threshold (7/10 assumed).
2. Whether mastery displays /10 (assumed) or /100.
3. Which problem-screen layout tests best on the demo phone (editor-first assumed).
4. Brand name and logo (indigo + flame/spark is the working direction).
5. English-only or Taglish for tutor text.

---

## Sources

- Duolingo UX and gamification case studies: UX Planet, Prototypr, ADPList, NoGood, Young Urban Project, 925 Studios, Blake Crosley (design breakdown).
- Gamification study commentary on XP-and-streak limits for conceptual learning: Thinkable Letters.
- Mobile editor issues and touch-target guidance: public GitHub issue on mobile code editors, Velt rich-text editor UI guide, Froala/DEV Community toolbar notes.


<!-- END DESIGN.md -->
