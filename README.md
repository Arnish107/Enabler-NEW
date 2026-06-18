# Enabler

**Enabler** is an AI-powered accessibility platform that breaks communication barriers through speech, sign language, and live conversation tools.

This repository is a static site ready to deploy on [Vercel](https://vercel.com).

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to preview the site locally.

## Build

```bash
npm run build
```

The build copies static assets into `dist/` for deployment.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel will auto-detect the settings from `vercel.json`:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.

No environment variables are required for the static landing page. Copy `.env.example` to `.env` only if you add API integrations later.

## Project Structure

```
├── index.html        # Landing page
├── css/styles.css    # Styles
├── js/main.js        # Client-side scripts
├── scripts/build.js  # Build script (copies to dist/)
├── vercel.json       # Vercel deployment config
└── package.json
```

## Features

- Speech to Sign Translation
- Sign to Text Translation
- Live Conversations
- Video Translation
- Sound Alerts
- Emergency Communication

## Stack

HTML · CSS · JavaScript · Vercel Static Hosting
