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
