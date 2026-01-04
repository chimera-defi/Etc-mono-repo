# Cadence API

Backend API server for the Cadence voice coding assistant.

## Purpose

This API serves as the backend for the iOS app, handling:
- Voice transcription (via OpenAI Whisper)
- Command parsing (voice → structured intent)
- Task management (CRUD operations)
- VPS bridge (forwarding tasks to user's VPS running Claude Code)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev

# Run tests
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create new task |
| DELETE | `/api/tasks/:id` | Cancel task |
| POST | `/api/voice/transcribe` | Transcribe audio to text |
| POST | `/api/voice/parse` | Parse text into command |
| POST | `/api/voice/command` | Transcribe + parse in one call |

## Environment Variables

```bash
# Required for voice transcription
OPENAI_API_KEY=sk-...

# Optional: VPS connection (for real Claude Code execution)
VPS_ENDPOINT=http://your-vps:3000
VPS_API_KEY=your-api-key

# Server config
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Architecture

```
cadence-api/
├── src/
│   ├── index.ts           # App entry point
│   ├── types.ts           # TypeScript types + Zod schemas
│   ├── routes/
│   │   ├── health.ts      # Health check endpoint
│   │   ├── tasks.ts       # Task CRUD operations
│   │   └── voice.ts       # Voice transcription/parsing
│   ├── services/
│   │   ├── whisper.ts     # OpenAI Whisper integration
│   │   ├── command-parser.ts  # Voice → intent parsing
│   │   └── vps-bridge.ts  # Bridge to user's VPS
│   └── tests/
│       ├── health.test.ts
│       ├── tasks.test.ts
│       └── command-parser.test.ts
└── package.json
```

## Development

The API runs in mock mode when `VPS_ENDPOINT` is not set. This allows testing the iOS app without a real VPS.

To test with a real VPS:
1. Set up Claude Code on your VPS
2. Deploy the cadence-bridge (see ../cadence-setup/)
3. Set `VPS_ENDPOINT` and `VPS_API_KEY`
