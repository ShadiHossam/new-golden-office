# Service pages redesign — from "article layout" to landing-page layout

Date: 2026-08-05
Status: approved (user confirmed approach 1, and "نفذ كله" — proceed with implementation)

## Problem

The live site (`astro/` subfolder of this repo, source of truth since the 2026-07-26 Astro cutover — verified against `astro/src/pages`, not the separate stale `new-golden-office-astro` directory) has 39 service pages across 6 categories (`ac`, `printing`, `office-supplies`, `cameras`, `cash-machines`, `copiers` — each with a hub `index.astro` + several detail pages).

Each detail page already has good bookend sections (`PageHero`, `steps-grid`, `faq-list`, `cta-banner`, sidebar) copied from a working pattern. The problem is the middle content column: `h2`/`h3` headings followed by long `<ul><li>` bullet lists — 30-47 `<li>` per page across the worst offenders (`cameras/dvr-nvr.astro`: 47, `cameras/ip-wifi.astro`: 45, `cash-machines/counting.astro`: 43, etc.). Only 7 of 39 pages already use a card-grid (`features-grid`) anywhere, and even there it's inconsistent — same content type (e.g. brand comparisons) is sometimes a `features-grid`, sometimes a hand-rolled `<div>` grid with hardcoded inline `border-top` colors (see `ac/index.astro`'s brand comparison block). This reads as a blog article, not a service/landing page.

**Out of scope:** blog posts (`src/pages/blog/`) and geo pages (`src/pages/alexandria/`, `src/pages/cairo/`) — these are legitimately article-format content and should stay that way. Root pages (`index.astro`, `about.astro`, `contact.astro`, `portfolio.astro`) already use a proper visual layout (hero, service cards, stats, testimonials, image banner) and don't need changes.

## Goals

- Replace repeated bullet-list blocks in the 39 category pages with card/icon grids, using a small set of new reusable Astro components.
- Normalize the ad hoc inline-styled comparison blocks (e.g. brand comparison cards) into the same reusable component, dropping hardcoded per-item colors.
- Do this without rewriting the actual copy — the Arabic content, keyword targeting, and SEO phrasing on these pages were already tuned (see project memory on the SEO audit and geo-scope corrections) and must be preserved. This is a **restructuring** task, not a rewrite: existing `<li>` text becomes `{title, text}` items fed into a grid component.
- Keep `PageHero`, `steps-grid`, `faq-list`, `cta-banner`, sidebar, and the `schema.org` JSON-LD exactly as they are — they aren't part of the problem.
- Ship incrementally to the live site (batch by batch), not as one big-bang deploy.

## Non-goals

- No CMS/data-file migration (each page stays a hand-authored `.astro` file — decision from the earlier Astro migration plan already established this pattern).
- No new visual design system, colors, or fonts — reuse the existing `global.css` classes (`feature-card`, `features-grid`, `stat-item`, etc.) that the homepage already uses successfully.
- No touching blog/geo pages, `BaseLayout.astro`, `Navbar`, `Footer`, or the `.htaccess`-in-`public/` deploy fix.

## New components (`astro/src/components/`)

1. **`IconCardGrid.astro`** — props: `items: {icon: string, title: string, text: string}[]`, `columns?: 2|3|4` (default 3). Renders the existing `.features-grid` / `.feature-card` markup (same classes the homepage uses), one card per item. Replaces `<ul><li>` blocks that list benefits, warning signs, what's-included, etc.
2. **`ComparisonGrid.astro`** — props: `items: {title: string, text: string}[]`. Renders a card grid styled consistently (no per-item hardcoded colors — a single accent style from `global.css`, following the same visual language as `feature-card`). Replaces the ad hoc inline-styled brand/type comparison blocks.
3. **`ContentIntro.astro`** — props: `heading: string, text: string` (single paragraph, 2-3 sentences max). A short framing paragraph before the grids — keeps *some* prose for SEO/context but caps it, instead of the current multi-paragraph article opener.

This mirrors the existing precedent of `MidPageCTA.astro` — the codebase already extracts repeated page furniture into small components, this extends the same pattern to the content column.

## Page pattern (applies to all 39 pages)

```
PageHero
ContentIntro          (short intro paragraph)
IconCardGrid           (benefits / warning signs / what's included — one grid per former <ul>)
ComparisonGrid         (only on pages that have a brand/type comparison, e.g. hub pages)
[existing <table> if any — stays as-is, it already reads fine visually]
MidPageCTA              (unchanged, where already present)
steps-grid section      (unchanged)
faq-list section        (unchanged)
cta-banner section       (unchanged)
```

Sidebar and schema JSON-LD: untouched.

## Rollout mechanics (this runs as a self-paced `/loop`)

- **Order:** one category at a time — `ac`, `printing`, `office-supplies`, `cameras`, `cash-machines`, `copiers`. Within a category: hub `index.astro` first (it has the most ad hoc inline-style content), then its detail pages.
- **Batch size:** 2-3 pages per loop iteration (small enough to review/verify, large enough to make real progress).
- **Progress tracking:** `astro/.redesign-progress.md` — a checklist of all 39 pages, checked off as each is converted and deployed. (Follows the same pattern as `.rollout-schedule.md` used for the indexing rollout — see project memory.)
- **Per-iteration steps:**
  1. Convert 2-3 pages: replace bullet blocks with `IconCardGrid`/`ComparisonGrid`, preserving existing copy verbatim (re-bucketed into items, not reworded).
  2. `cd astro && npm run build` locally to confirm no build errors (watch for the CloudLinux npm-wrapper gotcha if building on the server instead — use the real node bin dir on PATH, not the sourced nodevenv activate, per project memory).
  3. `git add`/`commit` (small, descriptive commit per batch), push to `origin master`.
  4. Deploy to production: SSH to the o2switch box, `git pull`, build Astro, `rsync -a --delete astro/dist/ /home/zash7309/newgoldenoffice.com/` (the established `ASTRO_DEPLOY_TARGET` — same mechanism the admin CMS's `triggerAstroRebuild()` uses). `.htaccess` lives in `astro/public/` already so it survives `--delete`.
  5. **Verify the deploy landed** with a real `curl` against the live URL checking for a known new string — per project memory, rsync's exit code alone is not sufficient evidence on this host (a wrong doc-root path has silently no-op'd before).
  6. Update `.redesign-progress.md`, commit that too.
  7. Schedule the next wakeup (fallback heartbeat ~20-30 min) and continue automatically — per explicit user instruction, no need to ask permission each batch.
- **Stop condition:** all 39 pages converted, deployed, and verified — or the user interrupts.

## Risks & mitigations

- **Live production site:** every batch is deployed immediately (user's explicit choice). Mitigation: build-before-deploy check, curl verification after every deploy, git history as rollback (each batch is a separate commit, easy to `git revert` a specific one if a page breaks).
- **SEO regression:** the pages' existing copy was already tuned for keywords per the 2026-07 SEO audit. Mitigation: this task restructures HTML, it does not rewrite Arabic copy — bullet text moves into `{title, text}` props near-verbatim.
- **Doc-root/build gotchas:** both the CloudLinux npm-wrapper issue and the `.htaccess`-survives-`--delete` fix are known, already-solved gotchas from project memory — the deploy step follows the already-verified working sequence, not a newly-invented one.

## Testing

- `npm run build` must succeed locally before every push (Astro build errors would otherwise only surface after a broken deploy).
- After each live deploy: one `curl` check per changed page for a known new string (e.g. a class name introduced by the new components), confirming the batch is actually live and not silently no-op'd.
- Visual spot-check not required per batch (would slow the loop down); a final pass at the end reviews a sample of pages in a real browser across categories.
