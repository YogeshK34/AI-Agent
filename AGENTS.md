<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-memory -->
## Project Stack

- **Framework**: Next.js `16.2.9` (App Router) — read `node_modules/next/dist/docs/` before touching routing or APIs
- **Package manager**: `pnpm` — always use `pnpm` instead of `npm` or `yarn`
- **AI SDK**: `ai@6.0.209` (latest stable v6) — NOT v4. v6 has significant breaking changes (see below)
- **Zod**: `3.25.76` — pinned via pnpm override; `ai@6` requires `^3.25.76 || ^4.x`
- **React**: `19.2.4`
- **Model provider**: Vercel AI Gateway via `AI_GATEWAY_API_KEY` env var

## ai@6 vs ai@4 — Breaking Changes (learned the hard way)

### `tool()` API
```ts
// ❌ ai@4 (OLD — do NOT use)
tool({
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }) => { ... },
})

// ✅ ai@6 (CORRECT)
tool({
  inputSchema: z.object({ query: z.string() }),
  execute: async (input) => {
    const { query } = input;  // destructure inside, not in signature
    ...
  },
})
```

### `generateText()` — step limits
```ts
// ❌ ai@4 (OLD)
generateText({ model: ..., maxSteps: 5 })

// ✅ ai@6 (CORRECT) — stepCountIs is a named export from 'ai'
import { generateText, stepCountIs } from 'ai';
generateText({ model: ..., stopWhen: stepCountIs(5) })
```

### Model strings (Vercel AI Gateway)
In `ai@6`, `generateText` accepts a **plain string** for AI Gateway models:
```ts
// ✅ No provider package needed — AI_GATEWAY_API_KEY is read automatically
generateText({ model: 'openai/gpt-4o', ... })
```
Format: `'provider/model-name'` (e.g. `'openai/gpt-4o'`, `'anthropic/claude-3-5-sonnet'`)

### Do NOT install `@ai-sdk/openai@1.x` with `ai@6`
- `@ai-sdk/openai@1.x` is for `ai@4` — it returns `LanguageModelV1` which is incompatible with `ai@6`'s `LanguageModel` type
- `@ai-sdk/openai@3.x` is for `ai@6` (dist-tag: `ai-v6`)
- Since this project uses Vercel AI Gateway, no `@ai-sdk/openai` package is needed at all

## Environment Variables (`.env`)
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway key (used automatically by `ai@6`)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` — Google OAuth for Calendar API
- `GOOGLE_CALENDAR_API_KEY` — Google Calendar API key

## Key Files
- `lib/agents.ts` — Calendar search tool (uses `tool()` from `ai`)
- `app/api/agent/route.ts` — POST handler that calls `generateText` with the calendar tool
<!-- END:project-memory -->
