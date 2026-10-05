# CLAUDE.md — Insurance Agency Website + Client System

Read this file fully at the start of every session. It is the source of truth for what we are building, how it must look, and how to work. If a request conflicts with this file, say so before proceeding.

---

## 1. What we are building

A **website and a system in one** for a Kenyan insurance agency/broker (placeholder brand: "Beacon Cover" — replace with the real name in `lib/brand.ts`).

- **The website** tells people who the company is (about, licence, insurers, team, FAQ). It is *not* a brochure with a "contact us" button. The hero is the first step of the application, the way a travel site's search box is step one of booking.
- **The system** lets clients apply for insurance themselves (fill details, upload documents), lets the admin be notified instantly, and keeps both sides in sync through a status page.

### Core value (judge every decision against these)
1. **Efficiency for the broker** — fewer phone calls, no chasing documents over WhatsApp.
2. **Self-service for the client** — they can do it alone, and never wonder what to do next.
3. **Instant visibility for the admin** — the moment a client submits, answers, or stalls, the admin knows.

Two rules underneath everything:
- **The client never has to wonder what to do next.**
- **The broker never has to wonder what needs doing.**

If a feature does not serve one of these, do not build it.

### Users
- **Clients:** mostly on mid-range phones, mobile data, often on WhatsApp. Assume a 375px-wide screen first. Kenya context: currency KES, phone numbers +254, English with a Swahili toggle planned for later.
- **Admin/broker:** non-technical. Needs a to-do list, not a database.

---

## 2. Scope of the current slice

**One vertical slice, motor insurance only, end to end:**

```
Hero (pick Motor)
  -> phone number + code
  -> snap logbook -> confirm details
  -> submitted
  -> client status page   <-- same data -->   admin "needs me now" board
```

Health, travel and business appear on the hero as cards marked "coming next" and are **not** built. Do not add features outside this slice unless asked.

**Update (Oct 2026, decided by the owner):** stages 1–10 for motor are done. Health, travel and business are now being built as **full flows following the motor pattern** (own questions, documents, quotes, status page, admin handling). After that, data moves to **Supabase** so the demo can be shared from a **Vercel** link (deployed via GitHub). Phone login stays simulated unless an SMS provider is set up.

**Update (5 Oct 2026, broker feedback relayed by the owner) — "broker v2":**
- Motor is the core: vehicle use decides pricing — private, commercial (goods), PSV matatu/bus (per seat), PSV taxi/ride-hailing, boda boda, tuk-tuk. PSVs can buy monthly cover.
- Documents for motor are only **logbook, national ID and KRA PIN**. Contact is phone plus (optional) email.
- Journey: apply → **instant quotes** from the insurer panel (setting "autoQuote") → client chooses → **pays with M-Pesa** → broker verifies documents and **issues the cover** (policy number, certificate, dates) → automatic **renewal reminders**.
- Insurer panel: the names the broker gave (Britam, Pioneer, Liberty, Cannon) in `lib/data/insurers.ts`. Rates are **sample** rate cards plus statutory levies (training levy 0.2%, PHCF 0.25%, stamp duty KES 40), always labelled as sample in the UI until real rate cards arrive.
- **Agents**: sign up at `/agent/join`, broker approves, agent signs in with phone + code at `/agent`, shares `/r/CODE`. Commission (percent of basic premium, per agent) is earned when the client pays; broker pays out from Admin → Agents.
- **Automations** (`lib/automation`): stalled nudges, quote and payment reminders, renewal reminders 30/14/7/1 days, daily renewals list to the broker. Run hourly via `/api/cron` (Netlify scheduled function / Vercel cron) and on admin visits.
- Admin redesigned: sidebar shell with Today, Applications, Payments, Renewals, Agents, Automations, Messages. Optional `ADMIN_PASSWORD` gate.

### Honesty rules for the demo
- Data is **mock** (see section 6). It must look and behave realistically.
- Logbook reading is **simulated** behind `extractLogbook()`. The UI must still always show a confirm screen, because real reading will not be perfect.
- Notifications (email/WhatsApp) are **simulated** and shown as toasts plus an "Outbox" panel in admin. Never claim in the UI that a real message was sent.
  - **Exception (Oct 2026):** emails are really sent through **Resend** when `RESEND_API_KEY` and `EMAIL_FROM` are set — never to seeded `example.com` addresses. Admin alerts go to the agency WhatsApp (Twilio) and `ADMIN_EMAIL`.
  - **Exception (Oct 2026, owner's decision):** for demos, client WhatsApps may be really sent through the **Twilio WhatsApp Sandbox** when `TWILIO_*` env vars are set, only to numbers that opted in and never to seeded sample numbers. The Outbox labels each message honestly: "Sent on WhatsApp", "Not delivered" or "Simulated".
- No real payments, no real insurer quotes yet. Quotes come from sample rate cards behind a `QuoteProvider` interface. M-Pesa is simulated behind `PaymentProvider` (`lib/payments`): the client page shows a clearly labelled "Demo: approve on my phone" button. A Daraja implementation replaces it later.

---

## 3. Tech stack (fixed — do not swap without asking)

- **Next.js (App Router) + TypeScript** (strict mode)
- **Tailwind CSS + shadcn/ui** for components
- **lucide-react** for icons
- **Zod** for validation, **React Hook Form** for forms
- Mock data layer now; **Supabase** (Postgres, storage, phone auth) later. The swap must touch only `lib/data/`.
- Package manager: `pnpm`. Node LTS.

Do not add new dependencies without saying why and getting a yes.

### Folder structure
```
app/
  (site)/page.tsx            marketing site + hero
  (site)/about, insurers, faq ...
  start/[step]/page.tsx      client application flow
  my/[ref]/page.tsx          client status page
  admin/                     admin board + application detail
  styles/page.tsx            kitchen-sink page (every component, every state)
components/
  ui/                        shadcn primitives + our kit (section 5)
  flow/  status/  admin/  site/
lib/
  brand.ts                   name, logo, contact, licence number
  tokens/                    design tokens (section 4)
  copy/                      ALL user-facing strings (section 7)
  data/                      types.ts, repo.ts (interface), mock.ts
  notify/                    notification interface + simulated outbox
  extract/                   extractLogbook() interface + simulated version
```

---

## 4. Design system — the rules that keep the UI clean

### 4.1 Tokens are the only source of visual values
All colours, font sizes, spacing, radii and shadows come from `lib/tokens` (exposed as CSS variables and Tailwind theme). **Never write raw hex codes, arbitrary pixel values (`w-[437px]`), or one-off inline styles in feature code.** If a value is missing, add a token first and explain why.

Placeholder brand palette (replace with the agency's real brand when known):

| Token | Light | Purpose |
|---|---|---|
| `bg` | #F5F6F3 | page background |
| `surface` | #FFFFFF | cards, inputs |
| `surface-alt` | #EDF1EE | subtle panels |
| `ink` | #16241F | main text |
| `ink-quiet` | #52645C | secondary text |
| `brand` | #175C54 | primary actions, key UI |
| `brand-dark` | #0F423C | hover/pressed |
| `accent` | #B9822A | highlights, "new" markers (use sparingly) |
| `border` | #DCE3DD | dividers, outlines |
| `success` | #3E7A5B | confirmed, done |
| `warn` | #B15A26 | needs attention |
| `danger` | #B3372F | errors |

- Provide **light and dark** themes via CSS variables. Body text contrast must meet WCAG AA.
- Colour is never the only carrier of meaning: statuses always have a text label or icon too.

**Typography:** IBM Plex Serif for headings (weight 600), IBM Plex Sans for body and UI. Scale: 12 / 14 / 16 / 18 / 22 / 28 / 36. Body 16px minimum on mobile (prevents iOS zoom on inputs). Line length under 75 characters. Sentence case everywhere, never ALL CAPS labels.

**Spacing:** 4px base scale (4, 8, 12, 16, 24, 32, 48, 64). **Radius:** 8 for controls, 14 for cards, full for pills. **Shadows:** at most two levels; prefer borders over shadows.

### 4.2 Layout principles
- **Mobile first.** Design at 375px, then scale up. Test 375, 768, 1280.
- **One primary action per screen.** One clear main button; everything else is secondary or a text link.
- **One question per screen** in the client flow, with a progress indicator ("Step 2 of 5").
- **Left-aligned** text and forms. Max content width ~720px for flow screens, ~1100px for admin.
- Touch targets **at least 44x44px**. Visible keyboard focus on everything.
- Respect `prefers-reduced-motion`. Motion only to confirm an action or show what changed. No decorative entrance animations.
- Avoid generic AI-template looks: no gradient washes as decoration, no identical card grids for everything, no emoji as icons (use lucide), no numbered "01 / 02 / 03" unless the content is genuinely a sequence.
- Spend visual boldness in **one** place (the hero). Everything else stays quiet and consistent.

### 4.3 Every screen must have designed states
Loading (skeletons, not spinners on blank pages), empty (says what to do next), error (says what went wrong and how to fix it, never blames the user, never vague), and success (visible confirmation of every action).

---

## 5. Component kit — only these may be used

`Button` (primary, secondary, ghost, danger) · `Input` · `PhoneInput` (+254) · `OtpInput` · `Select` · `FileUpload` (camera-first on mobile) · `StepHeader` (progress + back) · `Card` · `StatusBadge` · `StatusTimeline` · `ChecklistItem` (done / needed + upload action) · `Toast` · `EmptyState` · `Skeleton` · `Dialog` · `Tabs` · `Avatar` · `Switch` · `Table` (admin lists).

Rules:
- Build screens by composing these. If a screen needs something new, **add it to the kit and to `/styles` first**, then use it.
- Every kit component appears on `/styles` in every state (default, hover, focus, disabled, loading, error).
- No hand-rolled buttons, inputs or cards inside feature code.

### Page templates
`FlowStep` (one question per screen), `StatusPage`, `AdminBoard`, `AdminDetail`, `SitePage`. New screens fill in a template. They do not invent a layout.

---

## 6. Data layer (mock now, real later)

All data access goes through interfaces in `lib/data/repo.ts`. Screens never import `mock.ts` directly.

```ts
type ApplicationStatus =
  | 'received' | 'documents_checked' | 'preparing_quotes'
  | 'needs_info' | 'quotes_ready' | 'cover_chosen' | 'covered'

interface Application {
  ref: string                // e.g. "BC-4821"
  clientId: string
  product: 'motor'           // more later
  status: ApplicationStatus
  step: number               // last completed flow step (for resume + stall detection)
  details: Record<string, string>
  documents: DocumentItem[]  // each: type, required, status: needed|uploaded|verified|rejected
  updatedAt: string
  createdAt: string
}
```

Also define `Client`, `DocumentItem`, `Quote`, `Message`. Mock repo persists in memory and mirrors changes across the client and admin views so the demo shows real-time sync. Include realistic seed data: a mix of new, stalled, waiting-on-client and done applications with Kenyan names, plates like "KDA 123A", and KES amounts.

### Client-facing status labels (plain language)
received -> "Received" · documents_checked -> "Documents checked" · preparing_quotes -> "Preparing your quotes" · needs_info -> "We need one more thing" · quotes_ready -> "Choose your cover" · cover_chosen -> "Pay for your cover" · paid -> "Payment received" · covered -> "You're covered"

### Admin buckets
**Needs me now** (new submissions, stalled applications, replies received) · **Waiting on client** · **Quotes out** · **Done**. The admin home is these four lists, not a table of everything.

---

## 7. Copy and content rules

- **All user-facing strings live in `lib/copy/`.** No hardcoded text in components. This keeps tone consistent and makes the Swahili toggle later cheap.
- Plain language. Name things by what the user understands ("Upload your logbook"), not by system terms.
- Buttons say exactly what happens ("Send code", "Upload logbook", "Confirm details"), never "Submit" or "OK". The same action keeps the same name everywhere (button "Confirm details" -> toast "Details confirmed").
- Errors: say what happened and how to fix it. Example: "That code has expired. Send a new one."
- Reassurance appears **where people hesitate**, e.g. next to the ID upload: who sees it and how it is protected.
- Never write invented statistics, testimonials, insurer partnerships or licence numbers. Use clearly marked placeholders (e.g. `[Licence no.]`) that are easy to find.

---

## 8. The flows

### 8.1 Client flow
1. **Hero** — headline + "What do you want to cover?" with product cards. Picking Motor starts the flow directly on the hero page's next screen.
2. **Phone number** — enter +254 number, receive a code (simulated: `123456`). This is the login. No passwords, no account creation screen.
3. **Vehicle** — number plate, with "or snap the logbook instead".
4. **Snap logbook** — camera-first upload. Compress images on the client before upload. Then show a **confirm screen** with the extracted fields, each editable: "We read this from your logbook. Is it right?"
5. **Remaining details** — only what is actually needed (cover type, ID upload). Ask for the least first.
6. **Review and send** — summary, one primary button. Then a confirmation screen with the reference, a link to the status page, and what happens next.

Each application has its own resumable link. If a client leaves and returns, they land on the exact step they stopped at.

### 8.2 Client status page (`/my/[ref]`)
Timeline of stages, a "Still needed" checklist with upload buttons, and a "Message us" button that opens WhatsApp pre-filled with the reference and current step. The page always answers "what do I do now?".

### 8.3 Admin
- **Board** with the four buckets. Stalled applications ("stopped at step 3, 10 min ago") show a "Nudge on WhatsApp" action that uses a pre-written template.
- **Detail** with documents on the left and form answers on the right so the two can be checked against each other. One-click actions: Mark verified, Ask for re-upload, Add quote, Mark quotes ready. Each action sends a pre-written message (simulated) and updates the client's status page immediately.
- **Outbox panel** listing every simulated notification, so the demo can show "the client was notified".

### 8.4 Notifications (simulated)
Interface in `lib/notify/`: `send({ channel: 'email' | 'whatsapp' | 'sms', to, template, data })`. The simulated version writes to the outbox and triggers a toast. Events: application submitted (notify admin), application stalled (surface to admin), status changed (notify client), document requested (notify client).

---

## 9. Kenya and compliance context

- Currency KES, phone +254, date format day-month-year.
- Personal data (ID numbers, logbooks) is sensitive. Show a short privacy note near uploads. Never log personal data to the console. Mask ID numbers in list views.
- Do not state legal or regulatory claims in the UI. Licence details come from `lib/brand.ts` as placeholders until the real ones are provided.

---

## 10. How to work (process rules)

1. **Work in stages** (section 11). Finish a stage, then **stop and show me** before starting the next.
2. **Small, reviewable changes.** Do not rewrite unrelated files.
3. **Before building a screen:** confirm which template and which kit components it uses. State any new component you need.
4. **After building:** run the app, screenshot at 375px and 1280px, and list what looks inconsistent. Fix those before reporting done.
5. **Ask before** adding dependencies, changing the stack, changing tokens, or expanding scope.
6. **Never** fake success. If something is simulated, keep it behind its interface and label it in code comments.
7. Type-check, lint, and build must pass before saying a stage is complete.

### Definition of done for any screen
- [ ] Uses a template and kit components only
- [ ] No raw colours, arbitrary pixel values or hardcoded strings
- [ ] Works at 375, 768 and 1280 widths
- [ ] Loading, empty, error and success states exist
- [ ] One primary action; touch targets 44px+
- [ ] Keyboard navigable with visible focus; AA contrast
- [ ] Copy follows section 7
- [ ] Appears correctly on `/styles` if it added a component
- [ ] Type-check, lint and build pass

---

## 11. Build stages (stop for review after each)

1. **Foundation** — project setup, tokens, theme, fonts, folder structure, `lib/brand.ts`, this rules file honoured.
2. **Design system** — component kit and the `/styles` page showing every component in every state.
3. **Templates and shell** — site header/footer, `FlowStep`, `StatusPage`, `AdminBoard`, `AdminDetail` with placeholder content.
4. **Data layer** — types, repo interface, mock repo with seed data, notify and extract interfaces with simulated versions.
5. **Site and hero** — hero as first step, about/insurers/FAQ sections with clearly marked placeholders.
6. **Client flow** — steps 2 to 6 of section 8.1, resumable, with confirm screen.
7. **Status page** — section 8.2, live-synced with the admin.
8. **Admin** — board, detail, actions, outbox.
9. **Polish pass** — audit every screen against section 10's checklist, fix violations, screenshots.
10. **Demo rehearsal** — seed data reset button (admin only), walk through the demo path end to end, fix rough edges. No new features.

## 12. Later (do NOT build now)
Real Supabase phone auth (needs an SMS provider) · real M-Pesa (Daraja STK push + callback, B2C payouts to agents) · real insurer rate cards · real OCR/vision for documents · real email and production WhatsApp Business API (Meta-verified sender + templates; the Twilio sandbox is demo-only) · insurer API or rating-engine integration · Swahili translation · e-signatures.
