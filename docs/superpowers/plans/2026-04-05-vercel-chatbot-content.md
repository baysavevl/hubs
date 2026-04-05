# Vercel Migration, Chatbot Redesign & New Content Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt the Astro site for Vercel deployment with hybrid SSR, redesign chatbot to Gemini-style, and add three new content pages (Why Google Ads, Tips & Tricks, News).

**Architecture:** Hybrid SSR via `@astrojs/vercel` — all pages static except `/news` which is server-rendered. Chatbot UI restyled in-place (same ChatEngine, new CSS). New content collection for tips, new static page for "Why Google Ads", new SSR page for news feeds.

**Tech Stack:** Astro 5.x, @astrojs/vercel, Tailwind CSS 4.x, MDX, vanilla JS

---

## File Structure

### New Files
- `vercel.json` — Vercel deployment config
- `src/pages/why-google-ads.astro` — Static value proposition page
- `src/pages/tips-and-tricks/index.astro` — Tips listing page
- `src/pages/tips-and-tricks/[id].astro` — Individual tip detail page
- `src/pages/news.astro` — SSR news page (fetches RSS feeds)
- `src/content/tips/` — Directory for tip MDX articles (5 seed files)
- `src/lib/feed-fetcher.ts` — RSS feed fetching utility for news page

### Modified Files
- `package.json` — Add `@astrojs/vercel` dependency
- `astro.config.mjs` — Switch to hybrid output, add Vercel adapter, env-based base path
- `src/content.config.ts` — Add `tips` collection schema
- `src/components/Header.astro` — Add new nav items (Why Google Ads, Tips & Tricks, News)
- `src/components/ChatBot.astro` — Gemini-style CSS redesign

---

## Task 1: Vercel Adapter & Config

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Create: `vercel.json`

- [ ] **Step 1: Install Vercel adapter**

```bash
cd /Users/lap14894/Documents/VinhL/Code/Personal/google-mindful-solution-architect
npm install @astrojs/vercel
```

- [ ] **Step 2: Update astro.config.mjs**

Replace the entire content of `astro.config.mjs` with:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

const isVercel = process.env.VERCEL === '1';

// https://astro.build/config
export default defineConfig({
  site: isVercel ? 'https://your-app.vercel.app' : 'https://baysavevl.github.io',
  base: isVercel ? '/' : '/google-mindful-solution-architect/',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()]
  }
});
```

- [ ] **Step 3: Create vercel.json**

```json
{
  "framework": "astro"
}
```

- [ ] **Step 4: Verify build works**

```bash
npm run build
```

Expected: Build succeeds with hybrid output.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs vercel.json
git commit -m "feat: add Vercel adapter with hybrid SSR, keep GitHub Pages compat"
```

---

## Task 2: Chatbot Gemini-Style Redesign

**Files:**
- Modify: `src/components/ChatBot.astro`

- [ ] **Step 1: Replace the `<style>` block in ChatBot.astro**

Replace the entire `<style>...</style>` section (lines 30-261) with the Gemini-inspired styles below. The HTML structure and `<script>` stay the same.

```css
<style>
  /* ═══ Container ═══ */
  .messenger {
    display: flex; height: 580px;
    border: 1px solid #e8eaed; border-radius: 16px;
    overflow: hidden; background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
    font-family: var(--font-sans);
    position: relative;
  }

  /* ═══ Sidebar ═══ */
  .ms-side {
    width: 160px; flex-shrink: 0;
    background: #f8f9fa; border-right: 1px solid #e8eaed;
    display: flex; flex-direction: column;
  }
  .ms-side-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 0.75rem 0.6rem; border-bottom: 1px solid #e8eaed;
  }
  .ms-side-title { font-size: 0.8rem; font-weight: 600; color: #202124; }
  .ms-new {
    width: 26px; height: 26px; border-radius: 50%;
    border: 1px solid #dadce0; background: #fff; color: #1a73e8;
    font-size: 1rem; font-weight: 500; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .ms-new:hover { background: #e8f0fe; border-color: #1a73e8; }

  .ms-threads {
    flex: 1; overflow-y: auto; padding: 0.35rem;
    display: flex; flex-direction: column; gap: 2px;
  }
  .ms-th {
    display: flex; align-items: center; gap: 0.25rem;
    padding: 0.45rem 0.6rem; border-radius: 8px;
    cursor: pointer; font-size: 0.75rem; color: #5f6368;
    transition: background 0.15s;
  }
  .ms-th:hover { background: #e8eaed; }
  .ms-th.on { background: #e8f0fe; color: #1a73e8; font-weight: 500; }
  .ms-th-t { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ms-th-x {
    width: 16px; height: 16px; border-radius: 50%; border: none;
    background: transparent; color: #aaa; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.55rem; opacity: 0; transition: all 0.15s; padding: 0;
  }
  .ms-th:hover .ms-th-x { opacity: 1; }
  .ms-th-x:hover { background: #dadce0; color: #d93025; }

  .ms-side-foot {
    padding: 0.4rem 0.75rem; border-top: 1px solid #e8eaed;
    font-size: 0.65rem; color: #9aa0a6;
  }

  /* ═══ Main chat ═══ */
  .ms-main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #fff; }

  .ms-messages {
    flex: 1; overflow-y: auto;
    padding: 1.25rem 1.5rem 0.75rem;
    display: flex; flex-direction: column;
    scroll-behavior: smooth;
  }

  /* ═══ Messages — Gemini style ═══ */

  /* User: right-aligned, no background, subtle text */
  .bub-user {
    align-self: flex-end;
    background: none;
    color: #202124;
    border: none;
    border-radius: 0;
    padding: 0.5rem 0;
    max-width: 78%;
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 2px;
    animation: fadeIn 0.2s ease;
    word-wrap: break-word;
    text-align: right;
    font-weight: 500;
  }

  /* Bot: left-aligned, clean, no background */
  .bub-bot {
    align-self: flex-start;
    background: none;
    color: #202124;
    border: none;
    border-radius: 0;
    padding: 0.5rem 0;
    max-width: 88%;
    font-size: 0.9rem;
    line-height: 1.75;
    margin-bottom: 2px;
    animation: fadeIn 0.3s ease;
    word-wrap: break-word;
  }

  /* Speaker change gap */
  .bub-gap { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f3f4; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ═══ Rich text in bot message ═══ */
  .bub-bot p { margin: 0 0 0.5rem; }
  .bub-bot p:last-child { margin-bottom: 0; }
  .bub-bot strong { font-weight: 600; color: #202124; }
  .bub-bot em { color: #5f6368; }
  .bub-bot code {
    font-family: var(--font-mono); font-size: 0.84em;
    background: #f1f3f4; padding: 0.15em 0.35em; border-radius: 4px;
    color: #d93025;
  }
  .bub-bot ul, .bub-bot ol { margin: 0.4rem 0; padding-left: 1.2rem; }
  .bub-bot li { margin-bottom: 0.25rem; line-height: 1.6; }
  .bub-bot li:last-child { margin-bottom: 0; }

  /* ═══ Resource links: outlined pills ═══ */
  .bub-links {
    display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.75rem;
  }
  .bub-link {
    display: inline-block;
    font-size: 0.78rem; color: #1a73e8; text-decoration: none;
    font-weight: 500; padding: 0.3rem 0.75rem;
    border: 1px solid #dadce0; border-radius: 100px;
    background: #fff; transition: all 0.15s;
  }
  .bub-link:hover { background: #e8f0fe; border-color: #1a73e8; }

  /* ═══ Related questions: outlined pills ═══ */
  .bub-related {
    margin-top: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.4rem;
  }
  .bub-rel-btn {
    display: inline-block; font-size: 0.78rem; color: #5f6368;
    font-family: var(--font-sans); font-weight: 500;
    padding: 0.3rem 0.75rem; border: 1px solid #dadce0;
    border-radius: 100px; background: #fff; cursor: pointer;
    transition: all 0.15s;
  }
  .bub-rel-btn:hover { background: #f1f3f4; color: #202124; border-color: #bdc1c6; }

  /* ═══ Initial suggestion chips: outlined pills ═══ */
  .bub-chips {
    align-self: flex-start;
    display: flex; flex-wrap: wrap; gap: 0.4rem;
    margin-bottom: 2px; margin-top: 12px;
    max-width: 88%;
  }
  .bub-chip {
    display: inline-block; font-size: 0.78rem; color: #1a73e8;
    font-family: var(--font-sans); font-weight: 500;
    padding: 0.3rem 0.75rem; border: 1px solid #dadce0;
    border-radius: 100px; background: #fff; cursor: pointer;
    transition: all 0.15s;
  }
  .bub-chip:hover { background: #e8f0fe; border-color: #1a73e8; }

  /* ═══ Typing indicator — shimmer pulse ═══ */
  .bub-typing {
    align-self: flex-start;
    padding: 0.6rem 0; margin-bottom: 2px; margin-top: 16px;
  }
  .td {
    display: flex; gap: 5px; align-items: center;
  }
  .td span {
    width: 8px; height: 8px; border-radius: 50%;
    background: #dadce0;
    animation: pulse 1.4s ease-in-out infinite;
  }
  .td span:nth-child(2) { animation-delay: 0.2s; }
  .td span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes pulse {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
    40% { opacity: 1; transform: scale(1); }
  }

  /* Streaming cursor */
  .sc {
    display: inline-block; width: 2px; height: 1em; background: #1a73e8;
    margin-left: 1px; vertical-align: text-bottom;
    animation: bl 0.7s step-end infinite;
  }
  @keyframes bl { 0%,100%{opacity:1} 50%{opacity:0} }

  /* ═══ Input ═══ */
  .ms-input-wrap {
    padding: 0.65rem 1rem; border-top: 1px solid #e8eaed; background: #fff;
  }
  .ms-input-row {
    display: flex; align-items: center; gap: 0.5rem;
    background: #f1f3f4; border-radius: 24px;
    padding: 0.4rem 0.5rem 0.4rem 1.1rem;
    border: 1px solid transparent; transition: all 0.2s;
  }
  .ms-input-row:focus-within {
    background: #fff; border-color: #1a73e8;
    box-shadow: 0 1px 6px rgba(26,115,232,0.12);
  }
  #ms-input {
    flex: 1; border: none; background: none;
    font-size: 0.88rem; color: #202124; outline: none;
    font-family: var(--font-sans);
  }
  #ms-input::placeholder { color: #9aa0a6; }
  #ms-send {
    width: 34px; height: 34px; border-radius: 50%; border: none;
    background: #1a73e8; color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: background 0.15s;
  }
  #ms-send:hover { background: #1557b0; }

  /* ═══ Inline notification ═══ */
  .ms-notice {
    position: absolute; top: 50px; left: 50%; transform: translateX(-50%);
    background: #fce8e6; border: 1px solid #f5b7b1; color: #a50e0e;
    padding: 0.5rem 1rem; border-radius: 100px; font-size: 0.78rem;
    font-family: var(--font-sans); font-weight: 500;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08); z-index: 10;
    animation: fadeIn 0.2s ease;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .ms-side { display: none; }
    .messenger { height: 480px; }
  }
</style>
```

- [ ] **Step 2: Verify chatbot renders correctly**

```bash
npm run dev
```

Open `http://localhost:4321` and verify:
- User messages: right-aligned, no background, clean text
- Bot messages: left-aligned, no background, spacious
- Typing indicator: subtle pulse instead of colored bouncing dots
- Chips and related questions: outlined pills
- Input bar: clean rounded bar
- Thread sidebar: simplified

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatBot.astro
git commit -m "feat: redesign chatbot UI to Gemini-style (clean, minimal, text-first)"
```

---

## Task 3: Update Navigation

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Add new nav items to Header.astro**

Replace the nav `<div class="flex gap-5 text-sm font-medium">` block (lines 24-68) with:

```astro
    <button class="nav-toggle md:hidden" id="nav-toggle" aria-label="Toggle menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <div class="nav-links" id="nav-links">
      <a
        href={base}
        class:list={[
          "transition-colors",
          isActive(base) && !isActive(`${base}why-google-ads`) && !isActive(`${base}projects`) && !isActive(`${base}tips-and-tricks`) && !isActive(`${base}success-story`) && !isActive(`${base}news`) && !isActive(`${base}let-us-help`)
            ? "text-[var(--color-google-blue)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
        ]}
      >
        Home
      </a>
      <a
        href={`${base}why-google-ads`}
        class:list={[
          "transition-colors",
          isActive(`${base}why-google-ads`)
            ? "text-[var(--color-google-blue)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
        ]}
      >
        Why Google Ads
      </a>
      <a
        href={`${base}projects`}
        class:list={[
          "transition-colors",
          isActive(`${base}projects`)
            ? "text-[var(--color-google-blue)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
        ]}
      >
        Knowledge Base
      </a>
      <a
        href={`${base}tips-and-tricks`}
        class:list={[
          "transition-colors",
          isActive(`${base}tips-and-tricks`)
            ? "text-[var(--color-google-blue)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
        ]}
      >
        Tips & Tricks
      </a>
      <a
        href={`${base}success-story`}
        class:list={[
          "transition-colors",
          isActive(`${base}success-story`)
            ? "text-[var(--color-google-blue)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
        ]}
      >
        Success Stories
      </a>
      <a
        href={`${base}news`}
        class:list={[
          "transition-colors",
          isActive(`${base}news`)
            ? "text-[var(--color-google-blue)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
        ]}
      >
        News
      </a>
      <a
        href={`${base}let-us-help`}
        class:list={[
          "transition-colors",
          isActive(`${base}let-us-help`)
            ? "text-[var(--color-google-blue)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
        ]}
      >
        Let Us Help
      </a>
    </div>
```

- [ ] **Step 2: Add mobile nav styles and script at the bottom of Header.astro**

Add after the closing `</header>` tag:

```astro
<style>
  .nav-toggle { display: none; background: none; border: none; color: var(--color-text); cursor: pointer; padding: 0.25rem; }
  .nav-links { display: flex; gap: 1.25rem; text-decoration: none; font-size: 0.85rem; font-weight: 500; }

  @media (max-width: 768px) {
    .nav-toggle { display: flex; align-items: center; }
    .nav-links {
      display: none; position: absolute; top: 100%; left: 0; right: 0;
      flex-direction: column; background: white; border-bottom: 1px solid var(--color-border);
      padding: 0.75rem 1.5rem; gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .nav-links.open { display: flex; }
    .nav-links a { padding: 0.4rem 0; }
  }
</style>

<script>
  document.getElementById('nav-toggle')?.addEventListener('click', () => {
    document.getElementById('nav-links')?.classList.toggle('open');
  });
</script>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: add new nav items and mobile hamburger menu"
```

---

## Task 4: "Why Google Ads" Static Page

**Files:**
- Create: `src/pages/why-google-ads.astro`

- [ ] **Step 1: Create the page**

Create `src/pages/why-google-ads.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
const base = import.meta.env.BASE_URL;
---

<BaseLayout title="Why Google Ads" wide={true}>
  <!-- Hero -->
  <section class="text-center py-12">
    <div class="google-bar mx-auto mb-6" style="max-width:80px"><span></span><span></span><span></span><span></span></div>
    <h1 class="text-4xl font-bold tracking-tight text-[var(--color-text)] mb-4">
      Why <span class="bg-gradient-to-r from-[#4285f4] to-[#34a853] bg-clip-text text-transparent">Google Ads</span>?
    </h1>
    <p class="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto leading-relaxed">
      Reach the right customers at the right moment. Google Ads puts your business in front of billions of daily searches.
    </p>
  </section>

  <!-- Stats -->
  <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
    <div class="text-center p-6 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)]">
      <div class="text-3xl font-bold text-[var(--color-google-blue)]">8.5B+</div>
      <div class="text-sm text-[var(--color-text-muted)] mt-1">Daily Google searches</div>
    </div>
    <div class="text-center p-6 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)]">
      <div class="text-3xl font-bold text-[var(--color-google-red)]">200%</div>
      <div class="text-sm text-[var(--color-text-muted)] mt-1">Average ROI on Google Ads</div>
    </div>
    <div class="text-center p-6 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)]">
      <div class="text-3xl font-bold text-[var(--color-google-yellow)]">80%</div>
      <div class="text-sm text-[var(--color-text-muted)] mt-1">Of businesses use PPC</div>
    </div>
    <div class="text-center p-6 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border)]">
      <div class="text-3xl font-bold text-[var(--color-google-green)]">65%</div>
      <div class="text-sm text-[var(--color-text-muted)] mt-1">Click rate on purchase-intent queries</div>
    </div>
  </section>

  <!-- Benefits -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-8 text-center">The Value of Google Ads for Your Business</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-6 border border-[var(--color-border)] rounded-xl">
        <div class="text-2xl mb-3">🎯</div>
        <h3 class="text-lg font-semibold mb-2">Intent-Based Targeting</h3>
        <p class="text-[var(--color-text-muted)] text-sm leading-relaxed">Unlike social media ads, Google Ads targets people actively searching for your products or services. This means higher conversion rates because you're reaching customers with purchase intent.</p>
      </div>
      <div class="p-6 border border-[var(--color-border)] rounded-xl">
        <div class="text-2xl mb-3">📊</div>
        <h3 class="text-lg font-semibold mb-2">Measurable Results</h3>
        <p class="text-[var(--color-text-muted)] text-sm leading-relaxed">Every click, impression, and conversion is tracked. You know exactly what your ad spend produces — no guesswork. Integrate with Google Analytics for full-funnel visibility.</p>
      </div>
      <div class="p-6 border border-[var(--color-border)] rounded-xl">
        <div class="text-2xl mb-3">💰</div>
        <h3 class="text-lg font-semibold mb-2">Budget Control</h3>
        <p class="text-[var(--color-text-muted)] text-sm leading-relaxed">Set daily budgets and bid caps. Only pay when someone clicks (PPC). No minimum spend requirements. Scale up or down anytime based on performance.</p>
      </div>
      <div class="p-6 border border-[var(--color-border)] rounded-xl">
        <div class="text-2xl mb-3">⚡</div>
        <h3 class="text-lg font-semibold mb-2">Immediate Visibility</h3>
        <p class="text-[var(--color-text-muted)] text-sm leading-relaxed">While SEO takes months, Google Ads puts you at the top of search results within hours. Ideal for new product launches, seasonal promotions, or competitive markets.</p>
      </div>
      <div class="p-6 border border-[var(--color-border)] rounded-xl">
        <div class="text-2xl mb-3">🌍</div>
        <h3 class="text-lg font-semibold mb-2">Global & Local Reach</h3>
        <p class="text-[var(--color-text-muted)] text-sm leading-relaxed">Target by country, city, radius, or even specific zip codes. Run multilingual campaigns across Southeast Asia or focus on a single neighborhood.</p>
      </div>
      <div class="p-6 border border-[var(--color-border)] rounded-xl">
        <div class="text-2xl mb-3">🔄</div>
        <h3 class="text-lg font-semibold mb-2">Remarketing Power</h3>
        <p class="text-[var(--color-text-muted)] text-sm leading-relaxed">Re-engage visitors who didn't convert. Show targeted ads across Google Display Network, YouTube, and Gmail to bring them back and close the sale.</p>
      </div>
    </div>
  </section>

  <!-- Google Ads vs Traditional -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-6 text-center">Google Ads vs Traditional Advertising</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-[var(--color-google-blue)] text-white">
            <th class="p-3 text-left rounded-tl-lg">Feature</th>
            <th class="p-3 text-left">Google Ads</th>
            <th class="p-3 text-left rounded-tr-lg">Traditional (TV/Print/Radio)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-[var(--color-border)]">
            <td class="p-3 font-medium">Targeting</td>
            <td class="p-3 text-[var(--color-google-green)]">Precise — keywords, demographics, intent</td>
            <td class="p-3 text-[var(--color-text-muted)]">Broad — mass audience</td>
          </tr>
          <tr class="border-b border-[var(--color-border)]">
            <td class="p-3 font-medium">Measurement</td>
            <td class="p-3 text-[var(--color-google-green)]">Real-time analytics, conversion tracking</td>
            <td class="p-3 text-[var(--color-text-muted)]">Estimated reach, surveys</td>
          </tr>
          <tr class="border-b border-[var(--color-border)]">
            <td class="p-3 font-medium">Cost Model</td>
            <td class="p-3 text-[var(--color-google-green)]">Pay per click/conversion</td>
            <td class="p-3 text-[var(--color-text-muted)]">Fixed upfront cost</td>
          </tr>
          <tr class="border-b border-[var(--color-border)]">
            <td class="p-3 font-medium">Speed</td>
            <td class="p-3 text-[var(--color-google-green)]">Live in hours</td>
            <td class="p-3 text-[var(--color-text-muted)]">Weeks to months</td>
          </tr>
          <tr>
            <td class="p-3 font-medium">Flexibility</td>
            <td class="p-3 text-[var(--color-google-green)]">Adjust anytime</td>
            <td class="p-3 text-[var(--color-text-muted)]">Locked-in commitment</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- CTA -->
  <section class="text-center py-12 bg-[var(--color-bg-subtle)] rounded-2xl border border-[var(--color-border)] mb-8">
    <h2 class="text-2xl font-bold mb-3">Ready to Grow with Google Ads?</h2>
    <p class="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
      Let our Solutions Architect team help you plan, launch, and optimize your campaigns.
    </p>
    <a href={`${base}let-us-help`} class="inline-block bg-[var(--color-google-blue)] text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-[#1557b0] transition-colors">
      Get Started
    </a>
  </section>
</BaseLayout>

<style>
  .google-bar { display:flex; height:4px; border-radius:2px; overflow:hidden; }
  .google-bar span { flex:1; }
  .google-bar span:nth-child(1) { background:var(--color-google-blue); }
  .google-bar span:nth-child(2) { background:var(--color-google-red); }
  .google-bar span:nth-child(3) { background:var(--color-google-yellow); }
  .google-bar span:nth-child(4) { background:var(--color-google-green); }
</style>
```

- [ ] **Step 2: Verify page renders**

```bash
npm run dev
```

Open `http://localhost:4321/why-google-ads` and verify layout, stats, table, and CTA.

- [ ] **Step 3: Commit**

```bash
git add src/pages/why-google-ads.astro
git commit -m "feat: add Why Google Ads value proposition page"
```

---

## Task 5: Tips & Tricks Content Collection + Pages

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/tips/` (5 MDX files)
- Create: `src/pages/tips-and-tricks/index.astro`
- Create: `src/pages/tips-and-tricks/[id].astro`

- [ ] **Step 1: Add tips collection to content.config.ts**

Add after the `projects` collection definition (line 32), before `export const collections`:

```typescript
const tips = defineCollection({
  loader: glob({ base: './src/content/tips', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});
```

Update the export to:

```typescript
export const collections = { blog, projects, tips };
```

- [ ] **Step 2: Create seed tip articles**

Create `src/content/tips/` directory with 5 MDX files.

**File: `src/content/tips/smart-bidding-strategies.mdx`**
```mdx
---
title: "5 Smart Bidding Strategies That Actually Work"
description: "Learn which automated bidding strategies deliver results and when to use each one."
pubDate: 2026-04-01
category: "Bidding"
tags: ["bidding", "automation", "smart bidding"]
---

## Why Smart Bidding?

Smart Bidding uses machine learning to optimize for conversions in each auction — a feature known as **auction-time bidding**. It considers signals like device, location, time of day, remarketing list, and more.

## The 5 Strategies

### 1. Target CPA (Cost Per Acquisition)

Best for: Advertisers with clear conversion goals and sufficient historical data (30+ conversions/month).

Set your target cost per conversion, and Google adjusts bids to hit that average. Start with a CPA ~20% above your historical average, then tighten gradually.

### 2. Target ROAS (Return on Ad Spend)

Best for: E-commerce with variable product values.

Set a target return percentage (e.g., 400% means $4 revenue per $1 spent). Requires revenue tracking via conversion values.

### 3. Maximize Conversions

Best for: New campaigns or when you want to spend your full budget efficiently.

Google sets bids to get the most conversions within your budget. No target CPA needed — just set your daily budget.

### 4. Maximize Conversion Value

Best for: E-commerce wanting to maximize revenue rather than conversion count.

Similar to Maximize Conversions but optimizes for total value. Pair with a target ROAS once you have enough data.

### 5. Enhanced CPC (eCPC)

Best for: Advertisers who want partial automation while keeping manual control.

Adjusts your manual bids up or down based on conversion likelihood. A good stepping stone before full Smart Bidding.

## Pro Tips

- **Give it time:** Smart Bidding needs 2-4 weeks to learn. Don't change targets during the learning period.
- **Feed it data:** More conversion data = better performance. Use micro-conversions if macro conversions are low volume.
- **Set realistic targets:** Aggressive targets cause underspend. Start conservatively.
```

**File: `src/content/tips/ad-copy-best-practices.mdx`**
```mdx
---
title: "Writing Google Ads Copy That Converts"
description: "Proven techniques for writing ad headlines and descriptions that drive clicks and conversions."
pubDate: 2026-03-28
category: "Creative"
tags: ["ad copy", "RSA", "headlines", "CTR"]
---

## The Anatomy of Great Ad Copy

Your ad has limited space — every word must earn its place. In Responsive Search Ads, you get 15 headlines (30 chars each) and 4 descriptions (90 chars each).

## 7 Rules for High-Performing Ads

### 1. Lead with Benefits, Not Features

**Weak:** "Cloud-based CRM software"
**Strong:** "Close 40% More Deals — Try Our CRM Free"

### 2. Include Numbers and Specifics

Ads with numbers get 36% higher CTR. Use exact figures: pricing, percentages, time savings.

### 3. Match Search Intent

Your headline should mirror what the user searched. If they searched "affordable accounting software," lead with price-related messaging.

### 4. Use Strong CTAs

- "Get Your Free Quote"
- "Start Your 14-Day Trial"
- "Shop Now — Free Shipping"

Avoid vague CTAs like "Learn More" or "Click Here."

### 5. Leverage Ad Extensions

Sitelinks, callouts, and structured snippets increase ad real estate by up to 20%. Always add at least 4 sitelinks and 4 callouts.

### 6. Pin Strategically

Pin your strongest headline to Position 1, but leave most headlines unpinned so Google can optimize combinations.

### 7. Test Continuously

Run at least 2 ad variations per ad group. Replace underperformers monthly. Use ad strength as a guide, not a goal.

## Quick Checklist

- Include primary keyword in Headline 1
- Add a number or statistic in at least one headline
- Clear CTA in description
- Include price or promotion if applicable
- Use all available ad extension types
```

**File: `src/content/tips/quality-score-optimization.mdx`**
```mdx
---
title: "How to Improve Your Quality Score (And Why It Matters)"
description: "Quality Score directly affects your ad costs and position. Here's how to optimize all three components."
pubDate: 2026-03-25
category: "Optimization"
tags: ["quality score", "CTR", "landing page", "relevance"]
---

## What Is Quality Score?

Quality Score is Google's 1-10 rating of your keyword's expected performance. Higher scores mean lower costs and better ad positions. A score of 7+ is good; below 5 needs work.

## The Three Components

### 1. Expected CTR

How likely your ad is to be clicked when shown for this keyword.

**How to improve:**
- Write compelling, keyword-relevant headlines
- Use ad customizers for dynamic insertion
- Test multiple RSA variations
- Remove low-CTR keywords (below 2%)

### 2. Ad Relevance

How closely your ad matches the searcher's intent.

**How to improve:**
- Include the keyword in at least one headline
- Organize ad groups tightly (10-20 keywords max)
- Create separate ad groups for different themes
- Use Single Theme Ad Groups (STAGs) for high-value terms

### 3. Landing Page Experience

How relevant and useful your landing page is after the click.

**How to improve:**
- Match landing page content to ad and keyword intent
- Ensure fast load time (under 3 seconds on mobile)
- Make the CTA clear and above the fold
- Use HTTPS and mobile-responsive design
- Include the keyword naturally on the page

## The Cost Impact

| Quality Score | CPC vs Average |
|--------------|----------------|
| 10 | -50% cheaper |
| 7 | Average CPC |
| 5 | +25% more expensive |
| 3 | +67% more expensive |
| 1 | +400% more expensive |

Improving from QS 5 to 7 can reduce your CPC by 20% — that's significant at scale.
```

**File: `src/content/tips/audience-targeting-guide.mdx`**
```mdx
---
title: "Google Ads Audience Targeting: The Complete Guide"
description: "From in-market to custom audiences — learn how to reach the right people at the right time."
pubDate: 2026-03-20
category: "Targeting"
tags: ["audiences", "targeting", "remarketing", "in-market"]
---

## Why Audiences Matter

Keywords tell you what people search. Audiences tell you who they are. Combining both gives you precision targeting that drives higher ROAS.

## Audience Types

### In-Market Audiences

People actively researching or comparing products in your category. Google identifies these users based on their recent search and browsing behavior.

**Best for:** Bottom-funnel targeting. Layer on top of search campaigns as bid adjustments (+20-50% for in-market users).

### Affinity Audiences

People with long-term interests and habits (e.g., "Cooking Enthusiasts," "Tech Savvy"). Broader than in-market.

**Best for:** Brand awareness campaigns on Display and YouTube.

### Custom Audiences

Build your own audience using:
- **Keywords:** People who searched these terms on Google
- **URLs:** People who browse similar websites
- **Apps:** People who use similar apps

**Best for:** Targeting competitors' customers or niche interests.

### Remarketing Lists

Your past website visitors, app users, or customer lists.

**Best for:** Re-engaging warm leads. Create segments by page visited, time since visit, or conversion status.

### Similar Audiences (Lookalikes)

Google finds new users who resemble your remarketing lists.

**Best for:** Expanding reach while maintaining quality. Use for prospecting campaigns.

## Layering Strategy

1. Start with keywords (Search) or placements (Display)
2. Add in-market audiences as **observation** (not targeting)
3. Review performance by audience segment
4. Increase bids for high-performing audiences
5. Create dedicated campaigns for top audiences

## Pro Tips

- **Start with observation mode** — it doesn't limit reach but gives you data
- **Combine audiences** — in-market + remarketing = highest intent
- **Exclude converters** — don't waste budget on people who already bought
- **Refresh remarketing lists** — 30-day windows for most products, 90 days for high-consideration purchases
```

**File: `src/content/tips/budget-optimization-tips.mdx`**
```mdx
---
title: "Google Ads Budget Optimization: Spend Smarter, Not More"
description: "Practical tips to maximize your Google Ads ROI without increasing budget."
pubDate: 2026-03-15
category: "Budget"
tags: ["budget", "ROI", "optimization", "cost reduction"]
---

## The Budget Mindset Shift

More budget doesn't mean more results. Optimizing what you already spend often delivers better returns than scaling up blindly.

## 10 Budget Optimization Tips

### 1. Audit Your Search Terms Report Weekly

Check Search Terms Report every week. Add irrelevant terms as negative keywords. Most accounts waste 15-25% of budget on irrelevant searches.

### 2. Use Dayparting

Analyze performance by hour and day. If conversions drop after 9 PM, schedule ads to run 6 AM - 9 PM only. Reinvest the savings into peak hours.

### 3. Geo-Target Aggressively

Don't target the entire country if you only serve specific regions. Use radius targeting around your service areas. Exclude underperforming locations.

### 4. Pause Low-Performing Keywords

Any keyword with 100+ clicks and zero conversions should be paused or restructured. Your budget is better spent on proven performers.

### 5. Use Shared Budgets Wisely

Shared budgets work well for campaigns with similar goals. But don't share budgets between brand and non-brand campaigns — brand will consume most of it.

### 6. Implement Bid Adjustments

- Device: If mobile converts at half the rate, reduce mobile bids by 50%
- Location: Boost bids in high-performing regions
- Demographics: Reduce bids for age/gender segments that don't convert

### 7. Focus on Impression Share for Brand

Your brand campaigns should have 90%+ impression share. Losing brand traffic to competitors is the most expensive leak.

### 8. Use Portfolio Bid Strategies

Group campaigns with similar goals under one portfolio strategy. The algorithm optimizes across all campaigns for better overall performance.

### 9. Check Your Network Settings

Opt out of Search Partners if it underperforms. Check Display Network placements — remove sites that waste budget.

### 10. Set Realistic Conversion Windows

If your sales cycle is 7 days, don't judge campaign performance on same-day conversions. Extend your conversion window and reporting lookback.

## Quick Wins

- Add negative keywords from Search Terms Report
- Pause keywords with high spend and zero conversions
- Remove underperforming Display placements
- Tighten geo-targeting to proven locations
- Schedule ads during business hours only
```

- [ ] **Step 3: Create tips listing page**

Create `src/pages/tips-and-tricks/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";

const base = import.meta.env.BASE_URL;
const tips = await getCollection("tips");
const sorted = tips.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

const categories = [...new Set(sorted.map(t => t.data.category))];
---

<BaseLayout title="Tips & Tricks" wide={true}>
  <section class="text-center py-8 mb-8">
    <h1 class="text-3xl font-bold tracking-tight text-[var(--color-text)] mb-3">Tips & Tricks</h1>
    <p class="text-[var(--color-text-muted)] max-w-lg mx-auto">
      Practical advice to get more from your Google Ads campaigns.
    </p>
  </section>

  <!-- Category filter -->
  <div class="flex flex-wrap gap-2 justify-center mb-8">
    <button class="cat-btn active" data-cat="all">All</button>
    {categories.map(cat => (
      <button class="cat-btn" data-cat={cat}>{cat}</button>
    ))}
  </div>

  <!-- Tips grid -->
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5" id="tips-grid">
    {sorted.map(tip => (
      <a href={`${base}tips-and-tricks/${tip.id}`} class="tip-card" data-cat={tip.data.category}>
        <span class="tip-category">{tip.data.category}</span>
        <h3 class="text-base font-semibold text-[var(--color-text)] mt-2 mb-2">{tip.data.title}</h3>
        <p class="text-sm text-[var(--color-text-muted)] leading-relaxed mb-3">{tip.data.description}</p>
        <time class="text-xs text-[var(--color-text-muted)]">
          {tip.data.pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </time>
      </a>
    ))}
  </div>
</BaseLayout>

<style>
  .cat-btn {
    padding: 0.35rem 0.85rem; border-radius: 100px;
    font-size: 0.8rem; font-weight: 500; cursor: pointer;
    border: 1px solid var(--color-border); background: #fff;
    color: var(--color-text-muted); transition: all 0.15s;
    font-family: var(--font-sans);
  }
  .cat-btn:hover, .cat-btn.active {
    background: #e8f0fe; color: #1a73e8; border-color: #1a73e8;
  }
  .tip-card {
    display: block; padding: 1.25rem 1.5rem;
    border: 1px solid var(--color-border); border-radius: 12px;
    text-decoration: none; transition: border-color 0.15s, box-shadow 0.15s;
    background: #fff;
  }
  .tip-card:hover {
    border-color: var(--color-google-blue);
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .tip-category {
    display: inline-block; font-size: 0.7rem; font-weight: 600;
    color: #1a73e8; background: #e8f0fe;
    padding: 0.15rem 0.55rem; border-radius: 100px;
    text-transform: uppercase; letter-spacing: 0.03em;
  }
</style>

<script>
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.tip-card').forEach(card => {
        (card as HTMLElement).style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
</script>
```

- [ ] **Step 4: Create tip detail page**

Create `src/pages/tips-and-tricks/[id].astro`:

```astro
---
import { getCollection, render } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";

export async function getStaticPaths() {
  const tips = await getCollection("tips");
  return tips.map((tip) => ({ params: { id: tip.id }, props: { tip } }));
}

const { tip } = Astro.props;
const { Content } = await render(tip);
const base = import.meta.env.BASE_URL;
---

<BaseLayout title={tip.data.title}>
  <a href={`${base}tips-and-tricks`} class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-google-blue)] mb-6 inline-block">
    &larr; Back to Tips & Tricks
  </a>

  <article>
    <header class="mb-8">
      <span class="inline-block text-xs font-semibold text-[#1a73e8] bg-[#e8f0fe] px-3 py-1 rounded-full uppercase tracking-wide mb-3">
        {tip.data.category}
      </span>
      <h1 class="text-3xl font-bold tracking-tight text-[var(--color-text)] mb-3">{tip.data.title}</h1>
      <p class="text-[var(--color-text-muted)]">{tip.data.description}</p>
      <time class="text-sm text-[var(--color-text-muted)] mt-2 block">
        {tip.data.pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </time>
    </header>

    <div class="prose">
      <Content />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 5: Verify tips pages render**

```bash
npm run dev
```

Open `http://localhost:4321/tips-and-tricks` — verify card grid, category filter, and detail page navigation.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/content/tips/ src/pages/tips-and-tricks/
git commit -m "feat: add Tips & Tricks content collection with 5 seed articles"
```

---

## Task 6: News Page (SSR)

**Files:**
- Create: `src/lib/feed-fetcher.ts`
- Create: `src/pages/news.astro`

- [ ] **Step 1: Create RSS feed fetcher utility**

Create `src/lib/feed-fetcher.ts`:

```typescript
export interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string;
  snippet: string;
}

interface RSSCache {
  items: NewsItem[];
  fetchedAt: number;
}

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
let cache: RSSCache | null = null;

const FEEDS = [
  { url: 'https://blog.google/products/ads-commerce/rss/', source: 'Google Ads Blog' },
  { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI Blog' },
  { url: 'https://support.google.com/google-ads/announcements/rss', source: 'Google Ads Announcements' },
];

function parseXML(text: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(text)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] || block.match(/<description>(.*?)<\/description>/)?.[1] || '';

    if (title && link) {
      items.push({
        title: title.replace(/<[^>]*>/g, '').trim(),
        link: link.trim(),
        source: '',
        date: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        snippet: desc.replace(/<[^>]*>/g, '').trim().slice(0, 200),
      });
    }
  }

  return items;
}

export async function fetchNews(): Promise<NewsItem[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.items;
  }

  const allItems: NewsItem[] = [];

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'GoogleAdsSolutionsArchitect/1.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      const items = parseXML(text);
      items.forEach(item => item.source = feed.source);
      allItems.push(...items);
    } catch {
      // Skip unreachable feeds silently
    }
  }

  // Sort by date descending, take top 30
  allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const result = allItems.slice(0, 30);

  cache = { items: result, fetchedAt: Date.now() };
  return result;
}
```

- [ ] **Step 2: Create the news page**

Create `src/pages/news.astro`:

```astro
---
export const prerender = false;

import BaseLayout from "../layouts/BaseLayout.astro";
import { fetchNews } from "../lib/feed-fetcher";

let news = [];
let error = false;

try {
  news = await fetchNews();
} catch {
  error = true;
}
---

<BaseLayout title="News" wide={true}>
  <section class="text-center py-8 mb-8">
    <h1 class="text-3xl font-bold tracking-tight text-[var(--color-text)] mb-3">Google Ads News</h1>
    <p class="text-[var(--color-text-muted)] max-w-lg mx-auto">
      Latest updates from Google Ads blog, announcements, and community.
    </p>
  </section>

  {error || news.length === 0 ? (
    <div class="text-center py-16 text-[var(--color-text-muted)]">
      <p class="text-lg mb-2">Unable to load news right now.</p>
      <p class="text-sm">Please try again later. News is fetched from official Google feeds.</p>
    </div>
  ) : (
    <div class="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
      {news.map((item) => (
        <a href={item.link} target="_blank" rel="noopener noreferrer" class="news-card">
          <span class="news-source">{item.source}</span>
          <h3 class="text-base font-semibold text-[var(--color-text)] mt-2 mb-2 leading-snug">{item.title}</h3>
          {item.snippet && (
            <p class="text-sm text-[var(--color-text-muted)] leading-relaxed mb-3">{item.snippet}</p>
          )}
          {item.date && (
            <time class="text-xs text-[var(--color-text-muted)]">{item.date}</time>
          )}
        </a>
      ))}
    </div>
  )}
</BaseLayout>

<style>
  .news-card {
    display: block; padding: 1.25rem 1.5rem;
    border: 1px solid var(--color-border); border-radius: 12px;
    text-decoration: none; transition: border-color 0.15s, box-shadow 0.15s;
    background: #fff;
  }
  .news-card:hover {
    border-color: var(--color-google-blue);
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .news-source {
    display: inline-block; font-size: 0.7rem; font-weight: 600;
    color: var(--color-google-green); background: #e6f4ea;
    padding: 0.15rem 0.55rem; border-radius: 100px;
    text-transform: uppercase; letter-spacing: 0.03em;
  }
</style>
```

- [ ] **Step 3: Verify news page renders**

```bash
npm run dev
```

Open `http://localhost:4321/news` — verify cards render with source labels, titles, snippets, and dates. Links should open in new tabs.

- [ ] **Step 4: Commit**

```bash
git add src/lib/feed-fetcher.ts src/pages/news.astro
git commit -m "feat: add SSR news page with Google Ads RSS feed aggregation"
```

---

## Task 7: Final Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Full build test**

```bash
npm run build
```

Expected: Build succeeds. Static pages prerendered, news page marked as server-rendered.

- [ ] **Step 2: Preview locally**

```bash
npm run preview
```

Verify all pages work: Home, Why Google Ads, Knowledge Base, Tips & Tricks, Success Stories, News, Let Us Help.

- [ ] **Step 3: Verify chatbot works**

Open home page, test chatbot:
- Send a message
- Verify Gemini-style (clean, no bubble backgrounds)
- Verify suggestion chips and related questions work
- Verify thread sidebar works

- [ ] **Step 4: Commit any fixes if needed, then final commit**

```bash
git add -A
git commit -m "chore: final verification and fixes"
```
