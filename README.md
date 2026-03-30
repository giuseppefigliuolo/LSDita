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
timer-based workouts, 4-week programs, progress tracking, voice cues, and confetti.

**[Live App →](https://giuseppefigliuolo.github.io/LSDita/)**

</div>

---

## What it does

| Feature | Details |
|---|---|
| **Timer Workouts** | Countdown-based execution with exercise intervals, sets & reps |
| **4-Week Program** | Structured progression across finger strength, pull strength, power endurance, mobility |
| **Dual Programs** | Home program (hangboard) + Travel program (Metolius Simulator 3D + 8kg dumbbell) |
| **Progress Tracking** | Streak counter, completion calendar, workout history with feeling ratings (1–5) |
| **Voice Cues** | Italian Web Speech API announces exercise transitions |
| **Screen Wake Lock** | Keeps your screen on during active workouts |
| **Offline Ready** | Full PWA with service worker — train without a signal |
| **Data Export / Import** | JSON export/import of all your workout history |

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
Canvas Confetti             →  celebration 🎉
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

### Home Program
Full hangboard sessions using: hangboard, pull-up bar, wooden balls, fitness band, dumbbells.
Focused on finger strength with half crimp, open hand, and repeater protocols.

### Travel Program
Designed for training anywhere with minimal kit: Metolius Simulator 3D + 8kg dumbbell.
Same 4-week structure, adapted exercises with bodyweight and portable equipment.

---

<div align="center">

*Built for climbers, by a climber.*
*Send hard.*

</div>
