# CruxTimer - Climbing Training PWA

App mobile-first per allenamento di arrampicata con timer stile Grippy, programma di 4 settimane, e tracciamento progressi.

## Stack

- React 19 + TypeScript
- Vite 8 + PWA (vite-plugin-pwa)
- Tailwind CSS 4
- Framer Motion
- Zustand (state + localStorage)
- Web Speech API (voce italiana)
- Screen Wake Lock API

## Dev

```bash
npm install
npm run dev
```

## Build + Deploy

Push su `main` triggera il deploy automatico su GitHub Pages via GitHub Actions.

```bash
npm run build
```

## Installazione su Android

1. Apri l'URL dell'app in Chrome
2. Tap sui tre puntini → "Aggiungi a schermata Home"
3. L'app si installa come una app nativa
