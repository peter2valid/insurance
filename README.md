# Beacon Cover (placeholder name)

Website and client system for a Kenyan insurance agency. See `CLAUDE.md`
for the full brief, rules and build stages.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000  ·  /styles shows the design tokens
pnpm check        # typecheck + lint + build — must pass before a stage is done
```

## Where things live

- `lib/tokens/tokens.css` — every colour, size, radius and shadow (light + dark)
- `lib/brand.ts` — name, contact and licence details (placeholders in `[brackets]`)
- `lib/copy/` — every user-facing string

## Data layer (mock now, Supabase later)

Everything the screens read or write goes through three interfaces. Each
has a **simulated** implementation today, clearly labelled in code:

| Interface | Entry point | Simulated by |
|---|---|---|
| Data (`Repo`) | `getRepo()` in `lib/data/repo.ts` | `lib/data/mock.ts` — in-memory store, seeded from `lib/data/seed.ts` |
| Notifications (`Notifier`) | `getNotifier()` in `lib/notify` | `lib/notify/simulated.ts` — writes to an Outbox, sends nothing |
| Logbook reading | `extractLogbook()` in `lib/extract` | `lib/extract/simulated.ts` — fixture results after a short delay |
| Quotes (`QuoteProvider`) | `getQuoteProvider()` in `lib/data/quote-provider.ts` | fixture rates, placeholder insurer names |

Screens may not import the simulated files (ESLint blocks it). Business
rules — what counts as stalled, which admin list an application is in —
live in `lib/data/rules.ts` as pure functions, independent of storage.

**Live sync.** Every write publishes an event on `lib/events.ts`. Open pages
subscribe to it (Stage 7), so the client status page and admin board
update together. This works while the app runs as **one Node process**
(`pnpm dev` or `pnpm build && pnpm start`). It will not work on serverless
hosting, where each request may hit a different instance — that is the
point where Supabase takes over.

**Demo data** resets when the server restarts (and via the admin reset
button, Stage 10). Times in the seed are relative, so "stopped 12 minutes
ago" stays true after a reset.

### Swapping in Supabase

Only `lib/data/` (plus `lib/events.ts`) changes. Screens stay as they are.

1. **Tables** mirroring `lib/data/types.ts`: `clients`, `applications`
   (with `details jsonb`), `documents`, `quotes`, `messages`. Enable row
   level security: a client sees only rows where `client_id = auth.uid()`;
   the broker role sees everything.
2. **Auth**: Supabase phone OTP replaces the simulated code `123456`. The
   client's `id` becomes the Supabase user id.
3. **Storage**: a private `documents` bucket; `DocumentItem.fileUrl` holds
   the storage path, served through short-lived signed URLs.
4. **Repo**: write `lib/data/supabase.ts` implementing `Repo`, then change
   one line in `getRepo()`:
   ```ts
   repo ??= createSupabaseRepo(); // was createMockRepo()
   ```
5. **Real-time**: replace the `lib/events.ts` bus with Supabase Realtime
   subscriptions on `applications` and `messages`.
6. **Keep** `rules.ts`, `queries.ts` and all screens unchanged; delete
   `mock.ts` and `seed.ts` (or keep the seed for a staging project).
