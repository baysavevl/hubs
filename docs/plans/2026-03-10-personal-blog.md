# Personal Blog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal blog with Astro, hosted on GitHub Pages, with Blog and Projects categories, including a comprehensive Google Ads project page.

**Architecture:** Astro static site with MDX content collections, Tailwind CSS for styling, GitHub Actions for deployment. Content organized into blog posts and project pages with a clean, minimal design.

**Tech Stack:** Astro v5, MDX, Tailwind CSS v4, GitHub Actions, GitHub Pages

---

### Task 1: Scaffold Astro Project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`

**Step 1: Initialize Astro project**

Run: `npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict`

**Step 2: Install dependencies**

Run: `npm install`

**Step 3: Add integrations**

Run: `npx astro add mdx tailwind --yes`

**Step 4: Configure for GitHub Pages**

Update `astro.config.mjs` to set `site` and `output: 'static'`.

**Step 5: Verify build**

Run: `npm run build`

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro project with MDX and Tailwind"
```

---

### Task 2: Create Base Layout and Components

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/styles/global.css`

**Step 1: Create global CSS with Tailwind directives and custom styles**

Minimal, clean typography with system font stack.

**Step 2: Create BaseLayout with HTML structure, meta tags, Header, Footer**

**Step 3: Create Header with navigation (Home, Blog, Projects)**

**Step 4: Create Footer with copyright**

**Step 5: Update index.astro to use BaseLayout**

**Step 6: Verify dev server**

Run: `npm run dev` — check homepage renders

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add base layout, header, footer components"
```

---

### Task 3: Set Up Content Collections

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/blog/` (directory)
- Create: `src/content/projects/` (directory)

**Step 1: Define blog and projects collections with schemas**

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    featured: z.boolean().optional(),
  }),
});

export const collections = { blog, projects };
```

**Step 2: Create a sample blog post**

**Step 3: Verify build**

Run: `npm run build`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add content collections for blog and projects"
```

---

### Task 4: Create Blog Pages

**Files:**
- Create: `src/pages/blog/index.astro` — blog listing
- Create: `src/pages/blog/[id].astro` — individual post
- Create: `src/components/PostCard.astro` — reusable card

**Step 1: Create PostCard component**

**Step 2: Create blog listing page that queries all blog posts**

**Step 3: Create dynamic [id].astro page for individual posts**

**Step 4: Verify with sample post**

Run: `npm run dev` — navigate to /blog and /blog/sample-post

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add blog listing and post pages"
```

---

### Task 5: Create Projects Pages

**Files:**
- Create: `src/pages/projects/index.astro` — projects listing
- Create: `src/components/ProjectCard.astro` — project card

**Step 1: Create ProjectCard component**

**Step 2: Create projects listing page**

**Step 3: Verify**

Run: `npm run dev`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add projects listing page"
```

---

### Task 6: Create Google Ads Comprehensive Guide

**Files:**
- Create: `src/content/projects/google-ads.mdx` — full guide content
- Create: `src/pages/projects/[id].astro` — project detail page
- Create: `src/components/TableOfContents.astro` — sidebar navigation

**Step 1: Create project detail page with sidebar TOC layout**

**Step 2: Create TableOfContents component**

**Step 3: Write Google Ads guide with all 11 sections:**
1. Overview
2. Account Setup
3. Campaign Types
4. Keyword Research
5. Ad Creation
6. Bidding Strategies
7. Audience Targeting
8. Technical Integration
9. Analytics & Reporting
10. Optimization & Troubleshooting
11. Best Practices

**Step 4: Verify page renders with TOC navigation**

Run: `npm run dev` — navigate to /projects/google-ads

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Google Ads comprehensive guide"
```

---

### Task 7: Create Home Page

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Build home page with intro section and recent posts**

**Step 2: Verify**

Run: `npm run dev`

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: build home page with intro and recent posts"
```

---

### Task 8: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create GitHub Actions workflow for GitHub Pages**

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add GitHub Actions deployment workflow"
```

---

### Task 9: Final Polish and Verification

**Step 1: Run full build**

Run: `npm run build`

**Step 2: Preview built site**

Run: `npm run preview`

**Step 3: Commit any fixes**
