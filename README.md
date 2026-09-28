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
