# Enabler

**Enabler** is an API-driven accessibility platform with real backend processing for speech, sign language, and translation.

## Architecture

```
Browser (public/js)              Next.js API (app/api/)
├── Web Speech API          →    POST /api/speech-to-text
├── MediaPipe Hands         →    POST /api/sign-to-text
├── Feature views           →    POST /api/translate
└── AI enhancement          →    POST /api/ai-process
```

All intelligence runs server-side. The frontend only captures input and renders API responses.

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Service status & capabilities |
| `/api/speech-to-text` | POST | Transcript validation + AI enhancement |
| `/api/sign-to-text` | POST | Gesture classification → text |
| `/api/translate` | POST | Sign mapping & language translation |
| `/api/ai-process` | POST | AI text enhancement (OpenAI or fallback) |

### Example: Speech → Sign

```bash
# 1. Validate transcript
curl -X POST http://localhost:3000/api/speech-to-text \
  -H "Content-Type: application/json" \
  -d '{"transcript": "hello I need help", "language": "en-US"}'

# 2. Map to signs
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "hello I need help", "direction": "speech-to-sign"}'
```

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Optional: OpenAI Enhancement

Add to `.env.local`:

```
OPENAI_API_KEY=sk-...
```

This enables:
- Whisper server-side audio STT (when audio is sent)
- GPT-powered transcript cleaning
- Improved gesture-to-sentence assembly
- Enhanced translations

Without an API key, the system uses **structured deterministic fallback** logic — never random output.

## Build & Deploy

```bash
npm run build
npm start
```

Deploy to Vercel as a Next.js project. Set `OPENAI_API_KEY` in Vercel environment variables if desired.

## Project Structure

```
app/api/           # Serverless API routes
lib/               # Backend processing logic
  data/            # Gesture dictionary & sign mapping
  sign-classifier.ts
  speech-processor.ts
  translate.ts
  ai-process.ts
  openai.ts
public/            # Frontend SPA (UI only)
```

## Stack

Next.js 15 · TypeScript · MediaPipe Hands · Web Speech API · OpenAI (optional) · Vercel Serverless
