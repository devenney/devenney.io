# devenney.io — Website Refresh Design

**Date:** 2026-06-12  
**Status:** Approved  
**Scope:** Full rebuild of devenney.io as a personal brand / digital CV site

---

## 1. Overview

The current site (Webpack + Handlebars + PicoCSS) is functionally correct but visually dated and architecturally heavy for what it does. This spec covers a full rebuild on a modern stack with improved design, content depth, and AI discoverability — while preserving the personal character that already exists (easter egg, ARG, "Bag of Holding" nav, blinking cursor aesthetic).

**Goals:**
- Modern, personal-feeling digital CV that does not look like a template
- Improved SEO and AI discoverability (llms.txt, structured data, RSS)
- About/Now page surfacing the person behind the job titles
- Better reading experience for blog posts
- Dramatically simpler build and deployment

**Non-goals:**
- A portfolio of projects (not enough to show yet)
- A CMS or admin interface
- Server-side rendering

---

## 2. Stack

| Concern | Choice | Replaces |
|---|---|---|
| Framework | Astro 5 (static output) | Webpack + Handlebars |
| Styling | Tailwind CSS v4 | SCSS + PicoCSS v1 |
| Blog content | Astro Content Collections | Manual webpack glob + front-matter |
| Sitemap | `@astrojs/sitemap` | sitemap-webpack-plugin |
| RSS | `@astrojs/rss` | none |
| Syntax highlighting | Shiki (built into Astro) | Prismjs |
| Icons | Astro Icon + Iconify | Font Awesome full bundle |
| Deployment | Cloudflare Pages | AWS S3 + CloudFront |
| CI | GitHub Actions (push-to-deploy) | existing (simplified) |

**Rationale:**
- Astro's Content Collections give type-safe frontmatter and zero-config markdown rendering — no custom glob logic needed
- Tailwind v4 is well-suited to the Terminal Noir custom theme; dark mode via `dark:` variants, custom CSS properties for the colour palette
- Cloudflare Pages replaces S3 + CloudFront + invalidation scripts with a single push-to-deploy; free tier is more capable than the current setup
- Astro Icon replaces the full Font Awesome bundle (~1MB) with per-icon imports; significant payload reduction
- Shiki produces better syntax highlighting than Prismjs with zero config and no separate theme CSS files

---

## 3. Project Structure

```
src/
  pages/
    index.astro              # home — terminal hero + work history
    about.astro              # about + now combined
    blog/
      index.astro            # blog listing
      [slug].astro           # individual post
    privacy.astro            # migrated as-is
    rss.xml.ts               # RSS feed endpoint
  content/
    blog/                    # existing .md files, unchanged
      config.ts              # content collection schema
  components/
    Nav.astro                # sticky top bar (appears on scroll via CSS position:sticky)
    Hero.astro               # terminal hero section
    Footer.astro             # easter egg preserved
    TerminalBlock.astro      # reusable terminal-styled section with accent border
    WorkEntry.astro          # single work history row
  layouts/
    Base.astro               # HTML shell, JSON-LD, meta, OG tags, canonical
    BlogPost.astro           # blog post layout with serif body
  styles/
    global.css               # Tailwind base + CSS custom properties

public/
  llms.txt                   # AI discoverability
  robots.txt                 # updated — allows all, points to sitemap
  assets/                    # images, favicon, audio (copied as-is)
```

---

## 4. Visual Design System

### Aesthetic

**Terminal Noir** — dark-first, monospace type, minimal chrome. The existing blinking cursor (`_`) and terminal prompt aesthetic are elevated and made intentional throughout rather than being incidental.

### Colour Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#0d0d0d` | Page background |
| Surface | `#111111` | Nav bar, cards |
| Border | `#1e1e1e` | Dividers, card borders |
| Text primary | `#f5f5f5` | Headings, emphasis |
| Text body | `#cccccc` | Body copy |
| Text secondary | `#aaaaaa` | Secondary content |
| Text muted | `#666666` | Labels, dates, metadata |
| Text subtle | `#555555` | Decorative only — never sole content |
| Accent | `#EC5578` | Links, active states, cursor, borders |
| Accent hover | `#EF6C8A` | Hover state |

**Contrast compliance:** Accent (#EC5578) on background (#0d0d0d) = **5.9:1** — passes WCAG AA for normal text and AAA for large text. All text colours on background pass AA minimum (4.5:1) at their intended size. Light mode inverts background/text; accent unchanged.

**Light mode:** `#f5f5f5` background, `#0d0d0d` text, same accent. Triggered by `prefers-color-scheme: light` and a manual toggle (retained from current site). Toggle preference persisted in `localStorage` as `data-theme` attribute on `<html>` — set before first paint to prevent flash.

### Typography

- **UI, headings, nav, labels:** Geist Mono — free, Google Fonts or self-hosted. Preloaded in `<head>` to prevent FOUT.
- **Blog post body:** System serif stack (`Georgia, 'Times New Roman', serif`) — monospace is distinctive but fatiguing at reading length. Same dark theme, different typeface.
- **Base size:** 16px. Scale: 0.75rem labels → 0.875rem body → 1rem prose → 1.5–2rem hero headings.
- **Line height:** 1.7 for body prose, 1.85 for blog posts, 1.2 for display headings.
- **Max content width:** 680px, centred. Optimal reading line length.

### Accessibility

- WCAG 2.1 AA target throughout
- `prefers-reduced-motion`: blinking cursor animation disabled; no other motion used
- `prefers-color-scheme`: dark/light respected; manual toggle overrides
- Skip-to-main-content link in every page (visually hidden, visible on focus)
- All interactive elements have visible focus indicators (accent-coloured outline)
- Semantic HTML: one `<h1>` per page, correct heading hierarchy, landmark elements (`<main>`, `<nav>`, `<footer>`, `<article>`)
- All images have descriptive `alt` attributes
- No information conveyed by colour alone

---

## 5. Pages

### 5.1 Home (`/`)

**Layout:** Terminal hero fills the viewport on load. Sticky nav (`position: sticky; top: 0`) appears as the hero scrolls out of view — no JS scroll listener, no layout shift.

**Hero section:**
- Terminal prompt line: `devenney@io:~$` in muted colour
- Name in large bold monospace with blinking accent cursor
- Role + location in small spaced caps
- Inline nav links: `about`, `work`, `blog`, `↗ cv`

**Work history section (below hero):**
- Current role in a `TerminalBlock` with accent left-border
- Previous roles in a `WorkEntry` list — all roles visible by default, no accordion
- Each entry: year range (muted) + title + company + one-line description
- Earlier roles (2013–2014) have reduced visual weight but are not hidden

**Sticky nav:**
- `> bd_` monospace logo left, nav links right
- Active page link in accent colour
- `↗ cv` opens GitHub releases in new tab
- "Bag of Holding" dropdown retained with links: Blog (`/blog`), CV (GitHub releases, new tab), GitHub (`https://github.com/devenney`, new tab), LinkedIn (`https://uk.linkedin.com/in/brendan-devenney`, new tab)

### 5.2 About / Now (`/about`)

**Structure:**
```
── ABOUT ───
Bio paragraph (written by Brendan — placeholder in implementation)

↗ github  ↗ linkedin  ↗ cv

── NOW ─────
work      | [current focus]
playing   | Elden Ring Nightreign · WoW: Midnight (AOTC ×2)
running   | [D&D campaign detail — ask Brendan]
location  | Edinburgh, Scotland

Last updated [auto: git commit date of file]
```

**Notes:**
- Bio copy to be written by Brendan — do not generate placeholder content
- "Last updated" derived from `git log --follow -1 --format=%as -- src/pages/about.astro` executed via Astro's `execSync` in the page's frontmatter script at build time — never needs manual updating
- JSON-LD on this page extends the Person schema with `description` and `knowsAbout`

### 5.3 Blog Listing (`/blog`)

- Section label: `── WRITING ─────`
- Posts listed chronologically descending: title + date, no excerpt by default
- `description` frontmatter field optional — renders below title if present
- `→` arrow right-aligned on each row
- RSS feed link at bottom (`↗ RSS feed`)
- Each post generates `BlogPosting` JSON-LD: `headline`, `datePublished`, `author`, `url`

### 5.4 Blog Post (`/blog/[slug]`)

- Post meta (date, title, back link) in monospace
- Body in system serif — same dark theme
- `← back to writing` link above body (not relying on browser back)
- Shiki syntax highlighting — theme matches dark palette
- Existing three posts migrate with slugs preserved (no broken links)

### 5.5 Privacy (`/privacy`)

Migrated as-is. No design changes needed.

---

## 6. AI Discoverability

### `llms.txt` (`/llms.txt`)

Plain-text file at the root, formatted for LLM consumption. Covers: who Brendan is, current role, career summary, links to key pages, blog post list. Updated manually when major changes occur.

```
# Brendan Devenney

Staff Software Engineer based in Edinburgh, Scotland.
Currently at Approov, building mobile security products.
Previously Head of Engineering at Form3 (European payments, SWIFT).

## Links
- Home: https://devenney.io
- About: https://devenney.io/about
- Blog: https://devenney.io/blog
- CV: https://github.com/devenney/cv/releases/latest
- GitHub: https://github.com/devenney
- LinkedIn: https://uk.linkedin.com/in/brendan-devenney

## Writing
[auto-generated list of blog posts with titles and URLs]
```

### JSON-LD Structured Data

Retained and expanded from current implementation:

| Schema | Page | Fields |
|---|---|---|
| `Person` | All (Base layout) | name, jobTitle, address, worksFor, sameAs, url, knowsAbout |
| `WebSite` | All (Base layout) | url, name, publisher |
| `WebPage` | Each page | url, name, isPartOf, about |
| `BlogPosting` | Each post | headline, datePublished, author, url, description |

### RSS Feed (`/rss.xml`)

Generated by `@astrojs/rss`. Consumed by RSS readers, Feedly, and increasingly by AI crawlers and search engines (Perplexity, You.com). Each post entry includes title, date, description, and link.

### `robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://devenney.io/sitemap-index.xml
```

No AI crawler blocking — discoverability is a goal, not a concern.

---

## 7. Preserved Personal Elements

These are not optional — they are part of the site's identity:

| Element | Current location | Status |
|---|---|---|
| Blinking `_` cursor | Nav, hero | Preserved; `prefers-reduced-motion` disables animation |
| "Bag of Holding" dropdown | Nav | Preserved in sticky nav |
| Easter egg letter | Footer (double-click city icon) | Preserved exactly — content unchanged |
| ARG (`arg.js` / `arg.scss`) | Loaded globally | `arg.js` moved to `public/js/arg.js` (static copy); styles inlined into `global.css`; loaded via `<script>` tag in Base layout |
| Edinburgh city icon | Footer | Preserved |
| Light/dark toggle | Footer | Preserved |
| Pink accent (`#EC5578`) | Throughout | Retained as primary accent |

---

## 8. Deployment

**Platform:** Cloudflare Pages  
**Build command:** `npm run build` (Astro static output to `dist/`)  
**Output directory:** `dist/`  
**Node version:** 20 (LTS)

**GitHub Actions workflow (simplified):**
- Push to `main` → Cloudflare Pages builds and deploys automatically via the Cloudflare Pages GitHub integration (no custom action needed)
- Preview deployments on PRs (free, automatic)
- Existing deploy-master and deploy-release workflows retired

**DNS:** Existing domain (`devenney.io`) pointed to Cloudflare Pages via CNAME. Cloudflare handles SSL, CDN, and edge caching automatically.

**Redirects:** Cloudflare Pages `_redirects` file to handle any URL changes (e.g., if `.html` extensions were previously indexed).

---

## 9. Out of Scope

- Comments on blog posts
- Search functionality  
- Contact form
- Analytics (Cloudflare Web Analytics can be added later — one script tag, no cookies)
- Projects / portfolio page
- `/uses` page
