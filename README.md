<div align="center">

# 🧗 LSDita

### *Climbing Training PWA — Psychedelic Yosemite Edition*

[![Deploy](https://github.com/giuseppefigliuolo/LSDita/actions/workflows/deploy.yml/badge.svg)](https://github.com/giuseppefigliuolo/LSDita/actions/workflows/deploy.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&labelColor=20232A)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A2D82?logo=pwa&logoColor=white)

A mobile-first Progressive Web App for structured climbing training —
timer-based workouts, multi-week programs with benchmark-driven loads, a climbing logbook, voice cues, and confetti.

**[Live App →](https://giuseppefigliuolo.github.io/LSDita/)**

</div>

---

## What it does

| Feature | Details |
|---|---|
| **Timer Workouts** | Countdown-driven sessions: hangs, repeaters, reps, stretches, per-side exercises; resume an interrupted run |
| **Programs** | Five built-in plans (see below) plus your own, uploaded as JSON and validated before use |
| **Benchmark loads** | Test results (e.g. Critical Force) turn `load: { test, percent }` into "60 kg tot · togli 8 kg" for the day |
| **Warm-up & Tests** | Program warm-up with a finger ramp computed from the day's loads; a page to record each test phase |
| **Session editing** | Change any session's exercises, sets and times; saved as an override you can revert |
| **Free Timer** | Standalone repeaters timer (reps × work / rest) |
| **Logbook** | Routes and boulders with grade, style, ascent type, attempts, rating |
| **Progress** | Streak, completion calendar, history with feeling ratings (1–5) |
| **Voice & Haptics** | Italian Web Speech cues, beeps, vibration; screen kept awake during workouts |
| **Offline Ready** | Installable PWA with service worker — train without a signal |
| **Backup** | One JSON with everything: workouts, notes, tests, logbook, edited sessions, custom program |

---

## Stack

```
React 19 + TypeScript 5.9   →  UI & logic
Vite 8 + vite-plugin-pwa    →  build & service worker
Tailwind CSS 4              →  styling with custom design tokens
Framer Motion 12            →  animations
Zustand 5                   →  state management (persisted to localStorage)
React Router 7              →  navigation
Web Speech API              →  Italian voice cues
Screen Wake Lock API        →  display management
Vitest                      →  unit tests
Canvas confetti (in-house)  →  celebration 🎉
```

---

## Design

The app uses a **"Psychedelic Yosemite"** aesthetic — vintage 70s poster energy with organic shapes, hand-drawn borders, and a warm palette inspired by Yosemite granite and California sunsets.

| Token | Value | Use |
|---|---|---|
| Primary | `#D4541A` | Burnt orange — main actions |
| Secondary | `#17A8A8` | Teal — accents |
| Accent | `#E8B820` | Gold — highlights |
| Violet | `#7B3A9E` | Cosmic purple |
| Background | `#F4E8C4` | Parchment cream |
| Text | `#2D0E4A` | Deep plum |

Fonts: **Righteous** (display) · **Nunito** (body) · **Space Mono** (timer)

---

## Get started

```bash
npm install
npm run dev
```

```bash
npm run build     # production build
npm run typecheck # type-check without emitting
npm run lint      # ESLint
npm test          # unit tests (Vitest), once
npm run test:watch
```

Tests live next to the code (`src/**/*.test.ts`) and cover the pure logic: dates, streak, benchmark loads, program validation (including every bundled program), backup/restore. They run in the `Europe/Rome` timezone so date bugs around local midnight show up.

Every commit runs lint, tests and build (Husky pre-commit); CI runs the same before deploying.

---

## Project layout

```
src/
  data/          training programs (JSON)
  pages/         one component per route
  components/    UI; feature folders: settings/, workout-day/, edit-day/, timer/
  store/         Zustand stores, persisted to localStorage
  utils/         pure logic (dates, loads, validation, backup) + tests
  hooks/         audio, speech, timer, wake lock, element size
```

---

## Deploy

Push to `main` triggers automatic deploy to GitHub Pages via GitHub Actions.

The app is served at `/LSDita/` — configured in `vite.config.ts`.

---

## Install as native app

**Android (Chrome)**
1. Open the app URL in Chrome
2. Tap the three dots → *Add to Home Screen*
3. Done — it launches like a native app

**iOS (Safari)**
1. Open the app URL in Safari
2. Tap the Share button → *Add to Home Screen*

---

## Programs

| Program | Length | Notes |
|---|---|---|
| **Lead Ott–Dic 2026** (default) | 11 weeks | Fixed calendar from 5 Oct 2026: tests, fall practice, route endurance, CR-based finger strength, warm-up protocol |
| **Blocco Lead Endurance** | 4 weeks | Home hangboard plan: hangboard, pull-up bar, wooden balls, band, dumbbells |
| **Trasferta** | 2 weeks | Travel kit only: Metolius Simulator 3D + 8 kg dumbbell |
| **Ipertrofia** | 2 weeks | Full body without finger load (A2 pulley recovery) |
| **Girl Workout** | 6 weeks | Full body + climbing + athletics (bar, rings, backpack) |

A custom program is any JSON matching `TrainingProgram` in `src/types/index.ts`; Settings → *Carica un programma* checks it field by field and points at the first error.

---

<div align="center">

*Built for climbers, by a climber.*
*Send hard.*

</div>
