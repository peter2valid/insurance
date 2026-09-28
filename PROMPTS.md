# PROMPTS.md — paste these into Claude Code, one stage at a time

**Setup (once):**
1. Make a new empty folder for the project, e.g. `insurance-portal`.
2. Put `CLAUDE.md` in the root of that folder.
3. Open a terminal in that folder and run `claude`.
4. Paste the prompts below **in order**. After each one, review the result (open the app, look at the screenshots) and only then move on.

**A good prompt has four parts:** the goal, the constraints (point at CLAUDE.md), what "done" looks like, and "stop and show me". Keep that shape when you write your own.

---

## Stage 0 — Kickoff (paste first)

```
Read CLAUDE.md fully. Summarise back to me in 10 lines: what we are
building, the current slice, the stack, and the 3 rules you consider
most important. Then list any questions or conflicts you see in
CLAUDE.md. Do not write any code yet.
```

## Stage 1 — Foundation

```
Do Stage 1 from CLAUDE.md: create the Next.js + TypeScript + Tailwind +
shadcn/ui project (pnpm), set up the folder structure from section 3,
the design tokens from section 4 as CSS variables and Tailwind theme
with light and dark themes, load IBM Plex Serif and Plex Sans, and
create lib/brand.ts with placeholder brand details. Make sure type-check,
lint and build pass. Stop and show me what you created before Stage 2.
```

## Stage 2 — Design system

```
Do Stage 2: build every component listed in section 5 using shadcn/ui
primitives styled only with tokens. Create the /styles page showing
every component in every state (default, hover, focus, disabled,
loading, error). Run the app and give me screenshots of /styles at 375px
and 1280px. Then list anything that looks inconsistent and fix it.
Stop for review.
```

## Stage 3 — Templates and shell

```
Do Stage 3: site header and footer, and the templates FlowStep,
StatusPage, AdminBoard, AdminDetail and SitePage, each with placeholder
content built only from the kit. Header must work on mobile (simple
menu, WhatsApp button always visible). Screenshots at 375px and 1280px,
then stop for review.
```

## Stage 4 — Data layer

```
Do Stage 4: types, the repo interface, a mock repo with realistic seed
data (section 6), the notify interface with a simulated outbox, and the
extractLogbook interface with a simulated version returning fixtures.
Screens must never import mock.ts directly. Add a short README section
explaining how to swap in Supabase later. Stop for review.
```

## Stage 5 — Site and hero

```
Do Stage 5: the marketing site with the hero as the first step of the
application (headline, "What do you want to cover?", product cards with
Motor active and the rest marked "coming next"). Add about, insurers and
FAQ sections. All facts (licence number, insurer names, stats, reviews)
must be obvious placeholders like [Licence no.]. Copy goes in lib/copy.
Screenshots at 375px and 1280px, then stop for review.
```

## Stage 6 — Client flow

```
Do Stage 6: the client flow in section 8.1 (phone + simulated code
123456, vehicle, snap logbook with a confirm screen showing editable
extracted fields, remaining details, review and send, confirmation).
One question per screen, progress indicator, resumable link per
application, image compression before upload. Include loading, error
and empty states. Walk me through the flow with screenshots of each
step at 375px, then stop for review.
```

## Stage 7 — Status page

```
Do Stage 7: the client status page in section 8.2 at /my/[ref]:
timeline, "Still needed" checklist with upload actions, and a Message us
button that builds a pre-filled WhatsApp link with the reference and
current step. It must reflect changes made in admin immediately.
Screenshots, then stop for review.
```

## Stage 8 — Admin

```
Do Stage 8: the admin in section 8.3: the four-bucket board (Needs me
now, Waiting on client, Quotes out, Done), stalled-application nudges,
the detail view with documents beside answers, one-click actions that
send simulated messages and update the client status page, and the
Outbox panel. Show me the demo path: client submits, admin sees it,
admin acts, client status changes. Stop for review.
```

## Stage 9 — Polish pass

```
Audit every screen against the Definition of done in section 10 of
CLAUDE.md. List every violation: raw values, hardcoded strings, missing
states, more than one primary action, inconsistent spacing or wording,
small touch targets, contrast problems. Fix them all, re-run type-check,
lint and build, and show before and after screenshots of the worst
offenders.
```

## Stage 10 — Demo rehearsal

```
Do Stage 10: add an admin-only "Reset demo data" button, then walk the
full demo path end to end as if presenting to a broker who has never
seen it. Report anything confusing, slow, or rough, and fix it. Do not
add new features.
```

---

## Prompts for later changes (keep changes small)

**Change one thing:**
```
Change [X] on [screen]. Follow CLAUDE.md. Do not touch other screens.
If this needs a new token or component, tell me first.
```

**Update the brand once his real details arrive:**
```
Here are the real brand details: [name, logo file, colours, licence
number, phone, WhatsApp number]. Update lib/brand.ts and the tokens
only. Then check every screen at 375px and 1280px and fix anything
that no longer looks right.
```

**Add a new insurance product (after the demo):**
```
Add [health/travel] following the same pattern as motor: new fields
config, document requirements, flow steps, and copy in lib/copy. Reuse
existing templates and kit components; do not create new layouts.
```

**When the AI drifts (it will, occasionally):**
```
Re-read CLAUDE.md. Audit what you just built against sections 4, 5 and
7 and list where you broke the rules. Fix those before anything else.
```
