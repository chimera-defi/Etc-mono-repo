# Cadence Web Frontend

A web-based interface for Cadence, the voice-enabled AI coding assistant.

## Features

- **Voice Interface**: Record voice commands using the browser's MediaRecorder API
- **Task Management**: View, create, and manage coding tasks
- **Real-time Updates**: WebSocket connection for live task progress
- **GitHub Integration**: View connected repositories and webhook setup
- **Settings**: Configure API endpoints and preferences

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Cadence API running (default: `http://localhost:3001`)

### Installation

```bash
cd cadence-web-frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Configuration

The app stores settings in localStorage. Configure the following in the Settings page:

- **API Endpoint**: URL of your Cadence API server
- **API Key**: (Optional) Authentication key for the API
- **OpenAI API Key**: Required for voice transcription using Whisper

## Project Structure

```
cadence-web-frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main page
│   ├── components/       # React components
│   │   ├── Navigation.tsx
│   │   ├── VoiceInterface.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskDetail.tsx
│   │   ├── Settings.tsx
│   │   └── Repos.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useVoiceRecorder.ts
│   │   └── useWebSocket.ts
│   └── lib/              # Utilities and services
│       ├── api.ts        # API client
│       ├── store.ts      # Zustand store
│       ├── types.ts      # TypeScript types
│       └── websocket.ts  # WebSocket client
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API Compatibility

This frontend is designed to work with the Cadence API (`cadence-api/`). The following endpoints are used:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/tasks` | GET | List all tasks |
| `/api/tasks` | POST | Create a new task |
| `/api/tasks/:id` | GET | Get task details |
| `/api/tasks/:id` | DELETE | Cancel a task |
| `/api/voice/transcribe` | POST | Transcribe audio |
| `/api/voice/parse` | POST | Parse command text |
| `/api/ws/stream` | WS | Real-time task events |

## Voice Recording

The app uses the browser's MediaRecorder API for voice input. Audio is recorded in WebM format and can be transcribed using:

1. **OpenAI Whisper** (direct): If an OpenAI API key is configured
2. **Backend API**: Falls back to the Cadence API transcription endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and type checking:
   ```bash
   npm run lint
   npm run type-check
   ```
5. Submit a pull request

## License

MIT
