# Enabler

**Enabler** is an AI-powered accessibility platform that breaks communication barriers through speech, sign language, and live conversation tools.

This repository is a static single-page application ready to deploy on [Vercel](https://vercel.com).

## Features

| Tool | Description |
|------|-------------|
| **Speech → Sign** | Microphone input, live transcript, sign animation output, translation history |
| **Sign → Text** | Camera, video recording, file upload, convert & download transcripts |
| **Live Conversation** | Split-screen chat with language selector and mock real-time translation |
| **Video Translation** | MP4/MOV upload, progress indicator, transcript export (.txt, .srt) |
| **Emergency Communication** | Large tap-to-display cards for critical messages |
| **Sound Alerts** | Toggle alerts for doorbell, fire alarm, baby crying, phone, car horn |

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to preview locally.

## Build

```bash
npm run build
```

Outputs static files to `dist/` for deployment.

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects settings from `vercel.json`
4. Click **Deploy**

No environment variables required for the frontend demo.

## Project Structure

```
├── index.html              # App shell
├── assets/                 # Logo, favicon, brand SVGs
├── css/styles.css          # Design system & components
├── js/
│   ├── app.js              # Entry point, theme, nav
│   ├── router.js           # Hash-based SPA router
│   ├── utils/              # Toast notifications, local state
│   └── views/              # Feature page modules
├── scripts/build.js        # Copies assets to dist/
└── vercel.json
```

## Stack

HTML · CSS · JavaScript · Vercel Static Hosting

## Brand

Logo colors drive the design system:
- Primary: `#4B4DFF`
- Dark: `#0B0B13`
- Light: `#F8F9FC`

Light and dark themes are supported with a toggle in the navigation bar.
