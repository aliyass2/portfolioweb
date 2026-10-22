# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Ali Yass — Portfolio: design handoff

Build target: a personal portfolio for Ali Yass Khudhair, .NET backend engineer (Baghdad, open to relocate to the EU).
Audience: international hiring managers and engineers. Must be readable in 30 seconds without touching the terminal.

## Repo state and commands

Scaffolded with create-next-app 16.4.2: Next 16 (App Router, `src/` dir, `@/*` alias), React 19, Tailwind v4 (CSS-first config, no `tailwind.config`), TypeScript. `next.config.ts` enables `cacheComponents`. Next 16 differs from older versions, so read `AGENTS.md` and check `node_modules/next/dist/docs/` before using an API from memory.

- `npm run dev`: local dev server
- `npm run build`: production build (the verification gate)
- `npm run lint`: ESLint

No test runner yet. If you add one, document the single-test command here.

Where things live: the identity tokens are CSS variables on `:root` in `src/app/globals.css`, exposed to Tailwind via `@theme` (`bg-ground`, `text-muted`, `border-line`, `text-accent`, `font-mono`, …). The fonts are IBM Plex via `next/font` in `src/app/layout.tsx`. The content data files from the build plan go in `src/content/`. The CV is served from `public/cv.pdf`.

How the page is wired:

- `src/content/site.ts` holds all copy. `src/content/fs.ts` derives the terminal's filesystem from it and exports pure `run(input, cwd)` and `complete()` functions. They return lines plus an optional effect (scroll/open/clear) that the component applies. To add a terminal file or command, edit fs.ts. To add a project, add it to `work` in site.ts and the card, `ls work` and `cd work/<slug>` (anchor `#work-<slug>`) all follow.
- `ConsoleProvider` (client) owns the cross-cutting state: scroll-spy `active` section (the nav's active link and the terminal's cwd), the persisted terminal view (`terminal:state`), and the ⌘K open signal.
- `Terminal` is rendered once, inside a slot in the hero. An IntersectionObserver on the slot switches it between inline (hero) and `position: fixed` (docked). It never remounts, so history and cwd persist. Below 900px (`md`, overridden in globals.css) it is always docked as a bottom bar, and the hero shows `EventFlow` instead. Don't give any ancestor of the slot a `transform`/`filter`, which would break the fixed docking.
- Footer BUILD/DEPLOYED come from `env` in `next.config.ts` (Vercel SHA, else `git rev-parse`), fixed at build time.

Git: the remote is `aliyass2/portfolioweb` (personal account) over the `github-personal` SSH host alias. The commit identity is set repo-locally to the aliyass2 noreply email. Never use the work account (`ali-kareem_ISCQI`), which is the globally active `gh` account. For `gh` calls on this repo, prefix them with `GH_TOKEN=$(gh auth token --user aliyass2)`.

## Reading the artboards

- `support.js` is not in the repo, so the artboards render without the design tool. Any `{{accent}}` placeholder (in Main and Docked) stays literal and those accent fills don't show. Substitute `#F0A23B` in your head.
- `reference/Main.dc.html` ends with a `<script type="text/x-dc">` prototype (`class Component extends DCLogic`). It is the reference implementation of the terminal's `run()` command parser, the fs map, the help text, and the exact `stack` / `trace` / `README.md` output strings. Port its copy verbatim, but build it on the spec below. The prototype lacks history, tab-completion, scroll-spy, placements and persistence. It also lowercases the whole input, so its `cat README.md` case is dead code.

Reference artboards (open in a browser; they are self-contained HTML, read them for exact layout, copy and spacing):

- `reference/Main.dc.html` — full desktop home page, 1440 wide, fluid (this is the page to build)
- `reference/Docked.dc.html` — mid-scroll state with the terminal docked bottom-right, plus collapsed pill
- `reference/Mobile.dc.html` — phone (390) version of the top of the page
- `reference/Identity.dc.html` — palette, type, rules, components

Ignore the `<x-dc>`, `<helmet>`, `<sc-for>` wrappers and the `support.js` script: they belong to the design tool. The markup, inline styles and copy are the spec. `{{accent}}` means the accent token.

## Hard content rules

- Do NOT mention: Spawn (any side venture), Earthlink, ISP/network support work.
- Do NOT publish numbers for Qi Card / OPDC work (no transaction counts, tenants, users). ScopeSky scale is described as "nationwide", not with exact counts.
- No emoji, no stock illustrations, no gradients, no drop shadows, no 3D models.
- Copy is terse and declarative. Use the copy in the artboards verbatim unless it is a placeholder in [BRACKETS].
- Placeholders to wire to real values: [GIT SHA], [DATE] in the footer (from the build), CV link → `/cv.pdf`.

## Identity tokens

Concept: "a console, not a brochure" — the site behaves like a well-run backend system.

Colors (dark only; no light theme in v1):

| token    | value   | use |
|----------|---------|-----|
| ground   | #0A0D12 | page background |
| surface  | #0E1218 | panels, alternating sections |
| raised   | #11161D | diagram node fill |
| line     | #1F2833 | hairline borders, grid gaps |
| line-2   | #2A3542 | stronger borders, button outline |
| text     | #E6EBF0 | primary text |
| muted    | #8A96A3 | secondary text (passes 4.5:1 on ground) |
| dim      | #4E5A66 | tertiary mono labels, timestamps |
| accent   | #F0A23B | "signal amber" — the ONLY accent. Marks active state, live span, CTA. Never a large fill except the primary button. |

Type:

- Sans: IBM Plex Sans (400, 500, 600) — display and body. Headings weight 500, tracking -0.02 to -0.025em. Never bold headings.
- Mono: IBM Plex Mono (400, 500) — every label, eyebrow, stack line, log line, terminal, diagram node.
- Scale: H1 64 / H2 40 / H3 20–28 / body 15–19 (line-height 1.55–1.65) / eyebrow 12 uppercase tracking 0.12em / mono label 10–11.5.
- Phone: H1 38, H2 28, section padding 56–72.

Spacing & shape: radius 4 (buttons, chips) and 6 (cards, panels). Gaps 8 / 12 / 24 / 48. Section padding 112 desktop. Max content width 1200 with 32px gutters. Structure comes from 1px hairlines and grid gaps, not shadows.

Section eyebrows are paths: `~/work`, `~/approach`, `~/about`, `~/contact`.

## Page structure (desktop, top to bottom)

1. Nav (64px, hairline bottom): "ALI YASS" · status line `● BAGHDAD · UTC+3 · OPEN TO RELOCATE (EU)` (mono) · links Work / Approach / About / Contact · `⌘K` hint chip. Sticky; a 2px accent scroll-progress bar along its top edge once scrolled.
2. Hero (2-column 7/5): eyebrow, H1 "I build the backend systems that Iraqi institutions run on.", sub, CTAs [See the work] (accent) [Get in touch] (outline). Right column: the terminal (see below).
3. Capability strip: 4 cells separated by 1px lines — 01 Workflow engines / 02 Event-driven integration / 03 Production observability / 04 Architecture that lasts. Copy in Main.dc.html.
4. `~/work`: H2 "Systems with a country behind them." Featured card: Qi Card / OPDC (CURRENT badge) with the tenant-topology diagram on the right. Then 2×2 ScopeSky cards: Office Management Platform, Biometric HR System, eVisa Platform, Ticketing & Observability. Each has a mono stack line.
5. `~/approach` (surface background): H2 "Three patterns I reach for, and why." Three columns, each a small true diagram + heading + paragraph: Make state explicit (FSM strip) / Write once, deliver reliably (outbox relay bars) / If it isn't traced, it isn't done (trace waterfall).
6. `~/about`: H2 "An engineer first, a programmer second." Two paragraphs (aeronautical engineering → backend) + stack chips.
7. `~/contact` (surface): H2 "Let's build something that has to work." email, GitHub, Download CV. Footer status line: name · BUILD [GIT SHA] · DEPLOYED [DATE] · ● ALL SYSTEMS NOMINAL.

## The terminal (the one "special" element)

A real shell that is a second interface to the same content. It must never be the only way in — nav and buttons always work.

Component: one `<Terminal>` client component rendered once, in three placements/states:

- **hero** — inline in the hero's right column (min-height 420).
- **docked** — after the hero scrolls out of view (IntersectionObserver), the same component animates to `position: fixed; right: 28px; bottom: 28px; width: 460px`. History and cwd carry over. On phones it docks as a bottom bar.
- **collapsed** — header "—" button → a 40px pill `● ➜ <cwd>   ⌘K`. Click to expand.
- **hidden** — header "✕" → removed. `⌘K` / `Ctrl+K`, or clicking the nav `⌘K` chip, brings it back expanded and focused.
- Preference (expanded/collapsed/hidden) persists in localStorage (`terminal:state`). Below 1280px viewport, dock collapsed by default.
- The prompt's cwd follows scroll position (scroll-spy over sections) even if the user never types: in Approach the pill reads `➜ approach`.

Virtual filesystem (define as data; adding a section = adding one entry):

```
~            work/  approach/  about/  contact/  cv.pdf  README.md
work/        opdc-distribution/  office-management/  biometric-hr/  evisa/  ticketing-observability/
approach/    explicit-state.md  outbox-relay.md  trace-everything.md
about/       aeronautical-engineering.md  stack.txt
contact/     email.txt  github.txt  cv.pdf
```

Commands (case-insensitive, trimmed):

- `help`, `?` — list commands
- `cd <dir>` — scroll to that section (smooth), set cwd, print `→ #<dir>` in accent. `cd ..`, `cd ~`, `cd /`, bare `cd` → top. Unknown → `cd: no such directory: x`.
  Stretch: `cd work/opdc-distribution` scrolls to and highlights that card (1px accent ring for ~1.5s).
- `ls [dir]` — list entries, directories with trailing `/`
- `pwd` — `/home/ali/<cwd>`
- `cat README.md` — 3-line pitch; `cat cv.pdf` / `cv` — open `/cv.pdf`; stretch: `cat <any .md in approach/>` prints that principle's paragraph
- `stack` — aligned table: lang / web / msg / data / observe / arch (copy in Main.dc.html logic)
- `trace` — sample waterfall (copy in Main.dc.html logic), last line in accent
- `whoami` — "ali yass khudhair — backend engineer, .NET, distributed systems"
- `work` / `approach` / `about` / `contact` — shortcuts for cd
- `clear` / `cls`
- `sudo`, `rm -rf /` → "nice try. permission denied."
- unknown → `command not found: x — try help`

Behaviour: echo the command line as `➜ <cwd> <cmd>` in text color, outputs in muted, highlights in accent. Keep the last ~14 lines. ↑/↓ cycle history. Tab completes commands and directory names. On load, the hero terminal "types" `ls` by itself (≈40ms/char) and prints the listing, so it is visibly alive. Quick-command chips under the prompt: work · approach · stack · contact · trace.

Accessibility: real `<input>` with `aria-label`, `aria-live="polite"` on the output region, visible focus ring in accent, buttons ≥ 28×32 with `aria-label`. Respect `prefers-reduced-motion` (no auto-typing, no dock animation).

## Small accessories (keep to these)

- Scroll-progress hairline in accent at the top of the sticky nav.
- Hover on a work card: mono tooltip/underline with its stack line.
- Footer build SHA and deploy date from the build (Vercel env or git).
- Section eyebrows as paths.

Nothing else. No particle backgrounds, no cursors, no 3D.

## Build plan

- Next.js (App Router) + TypeScript + Tailwind. Fonts via `next/font/google` (IBM Plex Sans, IBM Plex Mono). Static export is fine.
- Tailwind theme extends colors with the tokens above; expose them also as CSS variables on `:root`.
- Content as data: `src/content/site.ts` (profile, capabilities, work entries, principles, stack) and `src/content/fs.ts` (virtual filesystem + command outputs). Sections render from this data; the terminal reads the same data so `ls work` and the Work section never drift.
- Components: `Nav`, `Hero`, `Terminal` (+ `useTerminal` hook: state machine for cwd/history/placement), `CapabilityStrip`, `WorkFeatured`, `WorkCard`, `Principle` with three small diagram components built from divs (`FsmStrip`, `OutboxBars`, `TraceWaterfall`), `TenantTopology`, `About`, `Contact`, `Footer`.
- Diagrams are DOM/CSS (flex + 1px lines), as in the artboards — no SVG illustrations needed.
- Put `cv.pdf` in `/public`.
- Lighthouse targets: ≥95 performance/accessibility on desktop and mobile. No layout shift from the font load.
- Verify: `npm run build`, then check 1440 and 390 widths; the page must read fully with the terminal hidden.
