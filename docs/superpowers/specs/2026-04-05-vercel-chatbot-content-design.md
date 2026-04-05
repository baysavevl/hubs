# Design: Vercel Migration, Chatbot Redesign & New Content Pages

**Date:** 2026-04-05
**Status:** Approved

## 1. Vercel Deployment (Hybrid SSR)

### Changes
- Install `@astrojs/vercel` adapter
- Set `output: 'hybrid'` in `astro.config.mjs` — all pages static by default
- Base path: use env variable to switch between `/google-mindful-solution-architect/` (GitHub Pages) and `/` (Vercel)
- Add `vercel.json` with clean config
- Keep `.github/workflows/deploy.yml` for GitHub Pages compatibility

### How base path works
- `DEPLOY_TARGET=vercel` → `base: '/'`
- Default (GitHub Pages) → `base: '/google-mindful-solution-architect/'`

## 2. Chatbot Gemini-Style Redesign

### Keep unchanged
- Floating widget trigger (bottom-right)
- Thread management & localStorage persistence
- ChatEngine logic (chat-engine.js)

### Restyle
- **User messages:** right-aligned, no background color, subtle or no border
- **Bot messages:** left-aligned, no background, clean text, larger font
- **No avatars** — text-first, minimal
- **Wider message area** — less padding, more breathing room
- **Typing indicator:** subtle shimmer/pulse instead of bouncing dots
- **Suggestion chips:** outlined rounded pills, not filled
- **Input bar:** clean, rounded, subtle shadow at bottom
- **Thread sidebar:** thinner, less visual noise
- **Animations:** fade-in instead of bubble pop

## 3. New Content Pages

### 3a. "Why Google Ads" — `/why-google-ads`
- Static page (prerendered)
- Sections: ROI benefits, audience reach, measurability, scalability, vs traditional ads
- Infographic-style layout with stats/numbers
- CTA linking to `/let-us-help`

### 3b. Tips & Tricks — `/tips-and-tricks`
- New Astro content collection (`src/content/tips/`)
- Zod schema: title, description, pubDate, category, tags
- Listing page at `/tips-and-tricks/index.astro` — card grid
- Detail page at `/tips-and-tricks/[id].astro`
- Seed with 3-5 MDX articles (bidding, ad copy, quality score, audience targeting, budget optimization)

### 3c. News — `/news`
- SSR page (`export const prerender = false`)
- Server-side fetches Google Ads blog RSS + community forum feeds
- Displays cards: title, source, date, snippet, external link
- Simple caching (in-memory with TTL) to reduce feed requests
- Fallback UI when feeds are unreachable
- All links open original source in new tab

### 3d. Navigation
- Update Header.astro to include: Home, Why Google Ads, Knowledge Base, Tips & Tricks, Success Stories, News, Let Us Help

## 4. Out of Scope
- No changes to ChatEngine scoring/intent logic
- No changes to existing MDX content
- No changes to SeaMap component
- No backend database
