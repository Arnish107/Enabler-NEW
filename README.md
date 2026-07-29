# Enabler

**Enabler** is an AI-powered accessibility platform that helps deaf and hearing people communicate through speech-to-sign, sign-to-text, live conversation translation, video translation, emergency cards, and an AI assistant.

> Breaking Communication Barriers Through AI

## Stack

Next.js 15 · TypeScript · Tailwind CSS · Framer Motion · OpenAI · MediaPipe Hands · Web Speech API · Vercel

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your OpenAI key to `.env.local`:

```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit `.env.local`. The key is server-side only.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development |
| `npm run build` | Production build (outputs `.next/`) |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health + OpenAI status |
| `/api/speech-to-text` | POST | Transcript cleanup + sign mapping |
| `/api/sign-to-text` | POST | MediaPipe landmarks → text |
| `/api/translate` | POST | Multi-language / ASL gloss |
| `/api/conversation` | POST | Live conversation translation |
| `/api/ai-process` | POST | Assist / simplify / enhance / suggest |
| `/api/history` | GET/POST | Session history |

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Framework: **Next.js**
4. **Output Directory: leave blank** (uses `.next`, never `dist`)
5. Add `OPENAI_API_KEY` in Environment Variables
6. Deploy

`vercel.json` is minimal:

```json
{ "framework": "nextjs" }
```

## Features

- Splash intro → marketing homepage
- Accessibility dashboard with sidebar
- Speech → Sign (Web Speech + OpenAI)
- Sign → Text (MediaPipe + OpenAI)
- Live conversation (20 languages)
- Video translation
- Emergency cards
- Sound alerts UI
- AI assistant
- History & settings (theme, contrast, reduced motion)

## Security

- API keys only via `process.env.OPENAI_API_KEY`
- No keys in client bundles
- Graceful 503 when key is missing
