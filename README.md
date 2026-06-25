# AI Agent Test App

A full-stack AI agent playground built with **Next.js 16 (App Router)**, **Vercel AI SDK v6**, and **ethers.js**. It demonstrates two core capabilities side-by-side:

1. **AI Agent with Tool Use** — Send natural-language prompts to a GPT-5-powered agent that can call real-world tools (weather, Google Calendar) and return structured, step-by-step reasoning.
2. **MetaMask Wallet Integration** — Connect/disconnect an Ethereum wallet, read the connected account address, and detect the active chain — all via the browser's injected `window.ethereum` provider.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js `16.2.9` (App Router) |
| Language | TypeScript `5.x` |
| Runtime | React `19.2.4` |
| AI SDK | `ai@6.0.209` (Vercel AI SDK v6) |
| LLM Provider | Vercel AI Gateway (`openai/gpt-5`) |
| Calendar API | Google Calendar REST API v3 (OAuth 2.0) |
| Ethereum | `ethers@6` + MetaMask (`window.ethereum`) |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v4 |
| Toasts | Sonner |
| Schema Validation | Zod `3.25.76` |
| Package Manager | **pnpm** |

---

## Project Structure

```
agent-test-app/
├── app/
│   ├── api/
│   │   └── agent/
│   │       └── route.ts        # POST /api/agent — AI agent endpoint
│   ├── globals.css             # Global Tailwind styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page (renders WalletConnect / UserPrompt)
│
├── components/
│   ├── User-Prompt.tsx         # Chat UI: sends prompts, renders agent steps & final answer
│   ├── WalletConnect.tsx       # MetaMask connect/disconnect + chain detection
│   └── ui/                     # shadcn/ui primitives (Button, Input, Label, Spinner…)
│
├── interfaces/
│   └── steps.ts                # AgentStep, ToolCall, ToolResult TypeScript interfaces
│
├── lib/
│   ├── agents.ts               # calendarSearchTool — Google Calendar tool definition
│   └── utils.ts                # Shared utility helpers (cn, etc.)
│
├── types/
│   └── ethereum.ts             # Global Window.ethereum type augmentation
│
├── AGENTS.md                   # Project-scoped AI coding rules
└── package.json
```

---

## Features

### 🤖 AI Agent (`POST /api/agent`)

- Accepts a natural-language `prompt` from the frontend.
- Runs `generateText` from `ai@6` with `stopWhen: stepCountIs(5)` to cap agentic loops.
- Ships with a **weather tool** that resolves a city name → coordinates → live temperature via Open-Meteo (no API key required).
- A separate **Google Calendar search tool** (`lib/agents.ts`) lets the agent look up the user's private calendar events by keyword and date range.
- Returns the full `steps` array (tool calls + results) and the `finalAnswer` string so the frontend can render the agent's reasoning chain.

### 🦊 MetaMask Wallet Connect (`WalletConnect`)

- Auto-detects if MetaMask (or any EIP-1193 provider) is injected.
- Reads already-connected accounts on load without re-prompting.
- Exposes **Connect / Disconnect** buttons with live status labels.
- Listens to `accountsChanged` and `chainChanged` events to stay in sync with the wallet.
- Shows toast notifications (via Sonner) for every state change.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** — install with `npm i -g pnpm`
- A **MetaMask** extension in your browser (for the wallet feature)
- A **Vercel AI Gateway** API key (for the AI agent)
- Google OAuth credentials (for the Calendar tool, optional)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example below into a `.env` file at the project root:

```env
# Vercel AI Gateway — required for the agent endpoint
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key

# Google OAuth — required for the Calendar search tool
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Google Calendar API key (optional, used as fallback)
GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
```

> **Note:** `AI_GATEWAY_API_KEY` is automatically read by `ai@6`'s Vercel AI Gateway integration — no extra provider package needed.

### 3. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Reference

### `POST /api/agent`

Sends a prompt to the AI agent and returns a structured response.

**Request body:**
```json
{ "prompt": "What's the weather in Tokyo?" }
```

**Response:**
```json
{
  "finalAnswer": "The current temperature in Tokyo is 28.4°C.",
  "steps": [
    {
      "stepType": "initial",
      "toolCalls": [{ "toolCallId": "...", "toolName": "weather", "args": { "location": "Tokyo" } }]
    },
    {
      "stepType": "tool-result",
      "toolResults": [{ "toolCallId": "...", "toolName": "weather", "result": { "location": "Tokyo", "temperature": 28.4 } }],
      "text": "The current temperature in Tokyo is 28.4°C."
    }
  ]
}
```

---

## Available Tools

| Tool | Defined In | Description |
|---|---|---|
| `weather` | `app/api/agent/route.ts` | Resolves city name → lat/lng → live temperature (Open-Meteo, free) |
| `calendarSearchTool` | `lib/agents.ts` | Searches the user's primary Google Calendar by keyword & date range |

---

## Key Implementation Notes

- **`ai@6` breaking changes**: This project uses `ai@6`, which differs significantly from `ai@4`. The `tool()` API uses `inputSchema` (not `parameters`), and `generateText` uses `stopWhen: stepCountIs(n)` (not `maxSteps`). See `AGENTS.md` for a full diff.
- **Zod pinning**: `zod` is pinned to `^3.25.76` via a `pnpm.overrides` entry in `package.json` because `ai@6` requires `^3.25.76 || ^4.x`.
- **No `@ai-sdk/openai` needed**: Models are specified as plain strings (`'openai/gpt-5'`) and routed through the Vercel AI Gateway automatically.
- **Ethereum type safety**: `types/ethereum.ts` augments the global `Window` interface to type `window.ethereum` and its `request` / event listener methods.

---

## Scripts

```bash
pnpm dev      # Start development server (Next.js + Turbopack)
pnpm build    # Create production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

---

## License

Private — not licensed for redistribution.
