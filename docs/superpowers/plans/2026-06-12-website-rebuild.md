# devenney.io Website Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild devenney.io as a static Astro 5 site with Terminal Noir design, About/Now page, RSS, and AI discoverability — deployed to Cloudflare Pages.

**Architecture:** Astro 5 static output with Tailwind v4 (via Vite plugin) for layout utilities and CSS custom properties for the colour system. Content Collections handle the blog. All personal elements (easter egg, ARG, blinking cursor, Bag of Holding) are preserved.

**Tech Stack:** Astro 5, Tailwind CSS v4, `@astrojs/sitemap`, `@astrojs/rss`, Shiki (built-in, theme: `night-owl`), `@fontsource-variable/geist-mono`, Cloudflare Pages. Icons replaced with unicode — no icon library needed.

**Spec:** `docs/superpowers/specs/2026-06-12-website-refresh-design.md`

---

## File Map

| File | Responsibility |
|---|---|
| `astro.config.mjs` | Astro config — site URL, integrations, Vite plugins |
| `src/styles/global.css` | Tailwind import, CSS custom properties (colour palette, typography), blink keyframe, ARG CRT styles, dialog styles |
| `src/layouts/Base.astro` | HTML shell, `<head>` (meta, OG, JSON-LD, font preload, skip link, inline theme-init script) |
| `src/layouts/BlogPost.astro` | Blog post layout — extends Base, adds serif body styles |
| `src/components/Nav.astro` | Sticky nav bar — `> bd_` logo, page links, Bag of Holding dropdown |
| `src/components/Hero.astro` | Terminal hero — prompt line, name, role, inline nav links |
| `src/components/Footer.astro` | Footer — city icon (easter egg trigger), MIT, privacy link, theme toggle |
| `src/components/TerminalBlock.astro` | Section block with accent left-border and label |
| `src/components/WorkEntry.astro` | Single work history row |
| `src/pages/index.astro` | Home page — Hero + work history |
| `src/pages/about.astro` | About + Now combined page |
| `src/pages/blog/index.astro` | Blog listing |
| `src/pages/blog/[slug].astro` | Individual blog post |
| `src/pages/privacy.astro` | Privacy page |
| `src/pages/rss.xml.ts` | RSS feed endpoint |
| `src/content/config.ts` | Blog content collection Zod schema |
| `public/js/switch.js` | Theme toggle (simplified — no Prism) |
| `public/js/arg.js` | ARG (migrated as-is from `src/js/direct/arg.js`) |
| `public/llms.txt` | AI discoverability |
| `public/robots.txt` | Updated robots.txt pointing to sitemap |
| `public/_redirects` | Cloudflare Pages redirect rules |
| `.github/workflows/deploy.yml` | Retired — Cloudflare Pages GitHub integration handles builds |

---

## Task 1: Bootstrap Astro project

**Files:**
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Modify: `package.json`

- [ ] **Step 1: Initialise Astro in the existing repo**

From the project root (the existing repo — do NOT create a subdirectory):

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
```

When prompted about existing files, choose to keep them. This writes `astro.config.mjs`, `tsconfig.json`, and scaffolds `src/`.

- [ ] **Step 2: Replace package.json**

```json
{
  "name": "devenney.io",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/sitemap": "^3.0.0",
    "@astrojs/rss": "^4.0.0",
    "@astrojs/check": "^0.9.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@fontsource-variable/geist-mono": "^5.1.0",
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected: clean install, no peer dependency errors.

- [ ] **Step 4: Write astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://devenney.io',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'night-owl',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: Astro dev server running at `http://localhost:4321`. A blank page is fine at this stage.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs tsconfig.json package.json package-lock.json
git commit -m "feat: bootstrap Astro 5 project"
```

---

## Task 2: Migrate static assets

**Files:**
- Create: `public/assets/` (from `src/assets/`)
- Create: `public/js/switch.js`
- Create: `public/js/arg.js`
- Create: `public/js/modal.js`

- [ ] **Step 1: Copy asset directories to public/**

```bash
cp -r src/assets/images public/assets/images
cp -r src/assets/audio public/assets/audio
```

- [ ] **Step 2: Write public/js/switch.js** (simplified — Prism removed)

```js
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const lightswitch = document.getElementById('lightswitch');
  if (lightswitch) {
    lightswitch.setAttribute(
      'title',
      theme === 'light' ? 'Cast: Darkness (Evocation)' : 'Cast: Light (Evocation)'
    );
  }
}

const switchTheme = (event) => {
  event.preventDefault();
  const theme = localStorage.getItem('theme');
  setTheme(theme === 'light' ? 'dark' : 'light');
};
```

- [ ] **Step 3: Copy arg.js unchanged**

```bash
cp src/js/direct/arg.js public/js/arg.js
```

- [ ] **Step 4: Write public/js/modal.js** (rewritten to use native `<dialog>` — no PicoCSS dependency)

```js
const modal = document.getElementById('modal-easter-egg');
const trigger = document.querySelector('[data-target="modal-easter-egg"]');

if (trigger && modal) {
  trigger.addEventListener('dblclick', () => modal.showModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}
```

Note: Escape key closes native `<dialog>` automatically — no handler needed.

- [ ] **Step 5: Commit**

```bash
git add public/
git commit -m "feat: migrate static assets and JS files to public/"
```

---

## Task 3: Design system — global styles

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create src/styles/global.css**

```css
@import "tailwindcss";
@import "@fontsource-variable/geist-mono";

/* ── Colour tokens ─────────────────────────────── */
:root {
  --bg:          #0d0d0d;
  --surface:     #111111;
  --border:      #1e1e1e;
  --text-1:      #f5f5f5;
  --text-2:      #cccccc;
  --text-3:      #aaaaaa;
  --text-muted:  #666666;
  --text-subtle: #555555;
  --accent:      #EC5578;
  --accent-h:    #EF6C8A;
  --font-mono:   'Geist Mono Variable', 'Courier New', monospace;
  --font-serif:  Georgia, 'Times New Roman', serif;
  --width-prose: 680px;
}

/* Light mode overrides */
[data-theme="light"] {
  --bg:      #f5f5f5;
  --surface: #ebebeb;
  --border:  #d0d0d0;
  --text-1:  #0d0d0d;
  --text-2:  #222222;
  --text-3:  #444444;
  --text-muted:  #666666;
  --text-subtle: #888888;
}

/* ── Base styles ───────────────────────────────── */
@layer base {
  html {
    background-color: var(--bg);
    color: var(--text-2);
    font-family: var(--font-mono);
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: var(--accent);
    text-decoration: none;
  }

  a:hover {
    color: var(--accent-h);
  }

  a:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* Skip-to-main — visually hidden until focused */
  .skip-link {
    position: absolute;
    top: -100%;
    left: 1rem;
    background: var(--accent);
    color: var(--bg);
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    z-index: 9999;
    border-radius: 0 0 4px 4px;
  }
  .skip-link:focus {
    top: 0;
  }

  /* Native dialog styles (easter egg modal) */
  dialog {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-2);
    border-radius: 4px;
    padding: 1.5rem;
    max-width: 40rem;
    width: 90%;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    line-height: 1.7;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.75);
  }
  dialog p { margin-bottom: 0.75rem; }
  dialog p:last-child { margin-bottom: 0; }
}

/* ── Blink cursor animation ────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .blink {
    animation: blink 1s step-start infinite;
  }
}

@keyframes blink {
  50% { opacity: 0; }
}

/* ── ARG CRT effect ────────────────────────────── */
@keyframes flicker {
  0%   { opacity: 0.27861; }
  5%   { opacity: 0.34769; }
  10%  { opacity: 0.23604; }
  15%  { opacity: 0.90626; }
  20%  { opacity: 0.18128; }
  25%  { opacity: 0.83891; }
  30%  { opacity: 0.65583; }
  35%  { opacity: 0.67807; }
  40%  { opacity: 0.26559; }
  45%  { opacity: 0.84693; }
  50%  { opacity: 0.96019; }
  55%  { opacity: 0.08594; }
  60%  { opacity: 0.20313; }
  65%  { opacity: 0.71988; }
  70%  { opacity: 0.53455; }
  75%  { opacity: 0.37288; }
  80%  { opacity: 0.71428; }
  85%  { opacity: 0.70419; }
  90%  { opacity: 0.7003;  }
  95%  { opacity: 0.36108; }
  100% { opacity: 0.24387; }
}

@keyframes textShadow {
  0%   { text-shadow: 0.4389924193300864px 0 1px rgba(0,30,255,0.5), -0.4389924193300864px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  5%   { text-shadow: 2.7928974010788217px 0 1px rgba(0,30,255,0.5), -2.7928974010788217px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  10%  { text-shadow: 0.02956275843481219px 0 1px rgba(0,30,255,0.5), -0.02956275843481219px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  15%  { text-shadow: 0.40218538552878136px 0 1px rgba(0,30,255,0.5), -0.40218538552878136px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  20%  { text-shadow: 3.4794037899852017px 0 1px rgba(0,30,255,0.5), -3.4794037899852017px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  25%  { text-shadow: 1.6125630401149584px 0 1px rgba(0,30,255,0.5), -1.6125630401149584px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  30%  { text-shadow: 0.7015590085143956px 0 1px rgba(0,30,255,0.5), -0.7015590085143956px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  35%  { text-shadow: 3.896914047650351px 0 1px rgba(0,30,255,0.5), -3.896914047650351px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  40%  { text-shadow: 3.870905614848819px 0 1px rgba(0,30,255,0.5), -3.870905614848819px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  45%  { text-shadow: 2.231056963361899px 0 1px rgba(0,30,255,0.5), -2.231056963361899px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  50%  { text-shadow: 0.08084290417898504px 0 1px rgba(0,30,255,0.5), -0.08084290417898504px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  55%  { text-shadow: 2.3758461067427543px 0 1px rgba(0,30,255,0.5), -2.3758461067427543px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  60%  { text-shadow: 2.202193051050636px 0 1px rgba(0,30,255,0.5), -2.202193051050636px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  65%  { text-shadow: 2.8638780614874975px 0 1px rgba(0,30,255,0.5), -2.8638780614874975px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  70%  { text-shadow: 0.48874025155497314px 0 1px rgba(0,30,255,0.5), -0.48874025155497314px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  75%  { text-shadow: 1.8948491305757957px 0 1px rgba(0,30,255,0.5), -1.8948491305757957px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  80%  { text-shadow: 0.0833037308038857px 0 1px rgba(0,30,255,0.5), -0.0833037308038857px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  85%  { text-shadow: 0.09769827255241735px 0 1px rgba(0,30,255,0.5), -0.09769827255241735px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  90%  { text-shadow: 3.443339761481782px 0 1px rgba(0,30,255,0.5), -3.443339761481782px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  95%  { text-shadow: 2.1841838852799786px 0 1px rgba(0,30,255,0.5), -2.1841838852799786px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
  100% { text-shadow: 2.6208764473832513px 0 1px rgba(0,30,255,0.5), -2.6208764473832513px 0 1px rgba(255,0,80,0.3), 0 0 3px; }
}

.crt {
  animation: textShadow 1.6s infinite;
}
.crt::after {
  content: " ";
  display: block;
  position: fixed;
  inset: 0;
  background: rgba(18, 16, 16, 0.1);
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  animation: flicker 0.15s infinite;
}
.crt::before {
  content: " ";
  display: block;
  position: fixed;
  inset: 0;
  background:
    linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%),
    linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06));
  z-index: 2;
  background-size: 100% 2px, 3px 100%;
  pointer-events: none;
}

iframe.fullscreen {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  z-index: 999999;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add design system — CSS custom properties and global styles"
```

---

## Task 4: Base layout

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Create src/layouts/Base.astro**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogType?: string;
}

const {
  title,
  description = 'Brendan Devenney, a Staff Software Engineer based in Edinburgh, Scotland.',
  canonicalPath = '/',
  ogType = 'website',
} = Astro.props;

const canonical = `https://devenney.io${canonicalPath}`;

const ogImage = 'https://devenney.io/assets/images/logo_sm.png';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href={canonical} />

    <title>{title}</title>
    <meta name="description" content={description} />

    <!-- Open Graph -->
    <meta property="og:site_name" content="Brendan Devenney" />
    <meta property="og:type" content={ogType} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1068" />
    <meta property="og:image:height" content="432" />
    <meta property="og:url" content={canonical} />

    <!-- Favicon -->
    <link rel="icon" href="/assets/images/favicon.ico" type="image/x-icon" />

    <!-- RSS -->
    <link
      rel="alternate"
      type="application/rss+xml"
      title="Brendan Devenney"
      href="/rss.xml"
    />

    <!-- Font preload -->
    <link
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossorigin
    />

    <!-- JSON-LD: Person -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Brendan Devenney",
        "jobTitle": "Staff Software Engineer",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Edinburgh",
          "addressRegion": "Scotland",
          "addressCountry": "GB"
        },
        "worksFor": {
          "@type": "Organization",
          "name": "Approov Mobile Security",
          "url": "https://approov.io"
        },
        "url": "https://devenney.io",
        "knowsAbout": ["Go", "Cloud", "Security", "Software Engineering", "Payments"],
        "sameAs": [
          "https://github.com/devenney",
          "https://uk.linkedin.com/in/brendan-devenney"
        ]
      }
    </script>

    <!-- JSON-LD: WebSite -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://devenney.io",
        "name": "devenney.io",
        "publisher": {
          "@type": "Person",
          "name": "Brendan Devenney"
        }
      }
    </script>

    <!-- JSON-LD: WebPage (per-page) -->
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "url": canonical,
      "name": title,
      "isPartOf": { "@type": "WebSite", "url": "https://devenney.io" },
      "about": { "@type": "Person", "name": "Brendan Devenney" }
    })} />

    <!-- Named slot for page-specific head content (e.g. BlogPosting JSON-LD) -->
    <slot name="head" />

    <!-- Inline theme init — runs before paint to prevent flash -->
    <script is:inline>
      (function () {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
      })();
    </script>
  </head>

  <body>
    <a href="#main" class="skip-link">Skip to main content</a>
    <slot />
    <script src="/js/switch.js" defer></script>
    <script src="/js/modal.js" defer></script>
    <script src="/js/arg.js" defer></script>
  </body>
</html>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run check && npm run build
```

Expected: no TypeScript errors, `dist/` generated.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat: add Base layout with meta, JSON-LD, and theme init"
```

---

## Task 5: Nav component

**Files:**
- Create: `src/components/Nav.astro`

The nav is `position: sticky; top: 0` so it sticks from the start on inner pages. On the home page, the Hero is above it in DOM order — when the user scrolls past the Hero, the Nav sticks. No JS scroll listener needed.

- [ ] **Step 1: Create src/components/Nav.astro**

```astro
---
interface Props {
  activePage?: 'home' | 'about' | 'blog';
}
const { activePage } = Astro.props;
---

<nav
  class="sticky top-0 z-10"
  style="background: var(--surface); border-bottom: 1px solid var(--border);"
  aria-label="Main navigation"
>
  <div
    style="max-width: var(--width-prose); margin: 0 auto; padding: 0.5rem 1.5rem; display: flex; justify-content: space-between; align-items: center;"
  >
    <a
      href="/"
      style="color: var(--accent); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;"
      aria-label="Home"
    >
      &gt; bd<span class="blink" aria-hidden="true">_</span>
    </a>

    <div style="display: flex; gap: 1.5rem; align-items: center;">
      <a
        href="/about"
        style={`font-size: 0.7rem; letter-spacing: 0.05em; color: ${activePage === 'about' ? 'var(--accent)' : 'var(--text-muted)'};`}
      >about</a>

      <a
        href="/"
        style={`font-size: 0.7rem; letter-spacing: 0.05em; color: ${activePage === 'home' ? 'var(--accent)' : 'var(--text-muted)'};`}
      >work</a>

      <a
        href="/blog"
        style={`font-size: 0.7rem; letter-spacing: 0.05em; color: ${activePage === 'blog' ? 'var(--accent)' : 'var(--text-muted)'};`}
      >blog</a>

      <!-- Bag of Holding dropdown -->
      <details style="position: relative;">
        <summary
          style="font-size: 0.7rem; letter-spacing: 0.05em; color: var(--text-muted); cursor: pointer; list-style: none; display: flex; align-items: center; gap: 0.35rem;"
          aria-label="Bag of Holding — more links"
        >
          <span aria-hidden="true">✦</span> Bag of Holding
        </summary>
        <ul
          style="position: absolute; right: 0; top: calc(100% + 0.5rem); background: var(--surface); border: 1px solid var(--border); border-radius: 4px; list-style: none; margin: 0; padding: 0.35rem 0; min-width: 160px; z-index: 20;"
        >
          <li>
            <a href="/blog" style="display: block; padding: 0.4rem 0.9rem; font-size: 0.7rem; color: var(--text-3);">
              Blog
            </a>
          </li>
          <li>
            <a href="https://github.com/devenney/cv/releases/latest" target="_blank" rel="noopener noreferrer" style="display: block; padding: 0.4rem 0.9rem; font-size: 0.7rem; color: var(--text-3);">
              CV ↗
            </a>
          </li>
          <li>
            <a href="https://github.com/devenney" target="_blank" rel="noopener noreferrer" style="display: block; padding: 0.4rem 0.9rem; font-size: 0.7rem; color: var(--text-3);">
              GitHub ↗
            </a>
          </li>
          <li>
            <a href="https://uk.linkedin.com/in/brendan-devenney" target="_blank" rel="noopener noreferrer" style="display: block; padding: 0.4rem 0.9rem; font-size: 0.7rem; color: var(--text-3);">
              LinkedIn ↗
            </a>
          </li>
        </ul>
      </details>
    </div>
  </div>
</nav>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Nav.astro
git commit -m "feat: add Nav component with sticky positioning and Bag of Holding"
```

---

## Task 6: Footer component

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create src/components/Footer.astro**

```astro
---
---

<footer style="border-top: 1px solid var(--border); margin-top: 4rem;">
  <div
    style="max-width: var(--width-prose); margin: 0 auto; padding: 0.85rem 1.5rem; display: flex; justify-content: space-between; align-items: center;"
  >
    <!-- Easter egg trigger: double-click the city icon -->
    <button
      data-target="modal-easter-egg"
      ondblclick="document.getElementById('modal-easter-egg').showModal()"
      style="background: none; border: none; cursor: pointer; color: var(--text-subtle); font-size: 1rem; padding: 0;"
      aria-label="Edinburgh (double-click for a secret)"
      title="Edinburgh"
    >🏙</button>

    <span style="font-size: 0.65rem; color: var(--text-subtle);">
      Code licensed <a href="https://github.com/devenney/devenney.io/blob/main/LICENSE" style="color: var(--text-muted);">MIT</a>
    </span>

    <div style="display: flex; gap: 0.75rem; align-items: center;">
      <a href="/privacy" aria-label="Privacy policy" style="color: var(--text-subtle); font-size: 0.8rem;">🔑</a>
      <abbr id="lightswitch" title="Cast: Light (Evocation)" style="cursor: pointer; text-decoration: none;">
        <button
          onclick="switchTheme(event)"
          style="background: none; border: none; cursor: pointer; color: var(--text-subtle); font-size: 0.8rem; padding: 0;"
          aria-label="Toggle light/dark theme"
        >💡</button>
      </abbr>
    </div>
  </div>
</footer>

<!-- Easter egg modal -->
<dialog id="modal-easter-egg" aria-labelledby="easter-egg-title">
  <p><strong id="easter-egg-title">My dearest Erin,</strong></p>
  <p></p>
  <p>
    Tonight will mark the end of a life long dream of mine.
    The completion of a labour I began as a child, even before I knew the words for it.
    Before I knew the ways to accomplish such a task.
    Even now my heart is heavy with dread;
    I fear I've built a great and powerful evil.
    Or rather, together, Albert and I have built it.
    I know that I am to blame.
    I allowed Albert to persuade me to change the designs.
    I allowed this perversion of my course.
  </p>
  <p>
    This new machine that we've built is unlike any I ever imagined.
    It looks... like a man.
    A lifeless steel man.
    Albert convinced me that even with the new <strong>Geological Unmanned Terraforming System</strong> we designed, the task of extracting the ore is still too dangerous for a human.
    He plans to completely replace human workers in the mining sector.
    The idea of displacing so many men... the annihilation of countless jobs in the name of safety seems an unbalanced trade off.
    What is worse, the latest prototypes have been revised to carry small firearms.
  </p>
  <p>
    Erin, I fear that I have put you and this entire city in danger.
    I will speak to him tonight on the matter.
    Perhaps I can persuade him to scrap the whole project.
    In the meantime, please be careful. This world is getting darker all the time.
  </p>
  <p>
    I weep at the thought of something terrible happening to you.
    I could not bear it.
  </p>
  <p></p>
  <p>
    All my love,<br />Brendan
  </p>
</dialog>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: add Footer with easter egg modal"
```

---

## Task 7: Hero component

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Create src/components/Hero.astro**

```astro
---
---

<header
  style="padding: 3rem 1.5rem 3rem; max-width: var(--width-prose); margin: 0 auto;"
  role="banner"
>
  <p style="color: var(--text-subtle); font-size: 0.65rem; letter-spacing: 0.1em; margin-bottom: 1.5rem;">
    devenney@io:~$<span style="color: var(--accent);">&#9646;</span>
  </p>

  <h1
    style="color: var(--text-1); font-size: clamp(1.75rem, 5vw, 2.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 0.5rem;"
  >
    BRENDAN<br />DEVENNEY<span class="blink" style="color: var(--accent);" aria-hidden="true">_</span>
  </h1>

  <p style="color: var(--text-muted); font-size: 0.68rem; letter-spacing: 0.14em; margin: 0 0 2.5rem;">
    STAFF SOFTWARE ENGINEER &middot; EDINBURGH, SCOTLAND
  </p>

  <nav aria-label="Quick navigation" style="display: flex; gap: 1.75rem; flex-wrap: wrap;">
    <a href="/about" style="font-size: 0.72rem; letter-spacing: 0.05em; color: var(--accent);">about</a>
    <a href="#work"  style="font-size: 0.72rem; letter-spacing: 0.05em; color: var(--text-muted);">work</a>
    <a href="/blog"  style="font-size: 0.72rem; letter-spacing: 0.05em; color: var(--text-muted);">blog</a>
    <a
      href="https://github.com/devenney/cv/releases/latest"
      target="_blank"
      rel="noopener noreferrer"
      style="font-size: 0.72rem; letter-spacing: 0.05em; color: var(--text-subtle);"
    >&#8599; cv</a>
  </nav>
</header>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: add Hero terminal component"
```

---

## Task 8: TerminalBlock and WorkEntry components

**Files:**
- Create: `src/components/TerminalBlock.astro`
- Create: `src/components/WorkEntry.astro`

- [ ] **Step 1: Create src/components/TerminalBlock.astro**

```astro
---
interface Props {
  label: string;
}
const { label } = Astro.props;
---

<section style="margin-bottom: 2rem;">
  <p style="color: var(--text-subtle); font-size: 0.6rem; letter-spacing: 0.12em; margin-bottom: 1rem;">
    ── {label} ───────────────────────
  </p>
  <div style="border-left: 2px solid var(--accent); padding-left: 0.85rem;">
    <slot />
  </div>
</section>
```

- [ ] **Step 2: Create src/components/WorkEntry.astro**

```astro
---
interface Props {
  years: string;
  title: string;
  company: string;
  companyUrl?: string;
  description?: string;
  muted?: boolean;
}
const { years, title, company, companyUrl, description, muted = false } = Astro.props;
---

<div style={`display: flex; gap: 1rem; align-items: baseline; margin-bottom: ${description ? '0.9rem' : '0.5rem'};`}>
  <span style={`font-size: 0.65rem; white-space: nowrap; min-width: 3.5rem; color: ${muted ? 'var(--text-subtle)' : 'var(--text-muted)'};`}>
    {years}
  </span>
  <div>
    <span style={`font-size: ${muted ? '0.72rem' : '0.78rem'}; color: ${muted ? 'var(--text-muted)' : 'var(--text-3)'};`}>
      {title}
    </span>
    {companyUrl ? (
      <a
        href={companyUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={`font-size: ${muted ? '0.68rem' : '0.72rem'}; color: var(--text-subtle); margin-left: 0.3rem;`}
      >
        &middot; {company}
      </a>
    ) : (
      <span style={`font-size: ${muted ? '0.68rem' : '0.72rem'}; color: var(--text-subtle); margin-left: 0.3rem;`}>
        &middot; {company}
      </span>
    )}
    {description && (
      <p style="font-size: 0.68rem; color: var(--text-muted); margin: 0.15rem 0 0; line-height: 1.6;">
        {description}
      </p>
    )}
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TerminalBlock.astro src/components/WorkEntry.astro
git commit -m "feat: add TerminalBlock and WorkEntry components"
```

---

## Task 9: Home page

**Files:**
- Create: `src/pages/index.astro`
- Delete (after confirming): old Handlebars templates (`src/templates/`)

- [ ] **Step 1: Create src/pages/index.astro**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import TerminalBlock from '../components/TerminalBlock.astro';
import WorkEntry from '../components/WorkEntry.astro';
---

<Base
  title="Brendan Devenney — Staff Software Engineer, Edinburgh"
  description="Brendan Devenney, a Staff Software Engineer based in Edinburgh, Scotland. Building security products at Approov."
  canonicalPath="/"
>
  <Hero />
  <Nav activePage="home" />

  <main id="main" style="max-width: var(--width-prose); margin: 0 auto; padding: 2rem 1.5rem 0;">
    <section id="work" aria-labelledby="work-heading">
      <TerminalBlock label="CURRENT">
        <h2
          id="work-heading"
          style="font-size: 0.95rem; font-weight: 600; color: var(--text-1); margin: 0 0 0.15rem;"
        >
          Staff Software Engineer
        </h2>
        <a
          href="https://approov.io"
          target="_blank"
          rel="noopener noreferrer"
          style="font-size: 0.78rem; color: var(--accent);"
        >Approov</a>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.4rem 0 0; line-height: 1.6;">
          Protecting leading brands with state-of-the-art mobile security solutions.
        </p>
      </TerminalBlock>

      <section aria-labelledby="previous-heading" style="margin-top: 1.5rem;">
        <p style="color: var(--text-subtle); font-size: 0.6rem; letter-spacing: 0.12em; margin-bottom: 1rem;">
          ── PREVIOUSLY ────────────────────
        </p>
        <h3 id="previous-heading" class="sr-only">Previous roles</h3>

        <WorkEntry
          years="2023–25"
          title="Head of Engineering (European Payments)"
          company="Form3"
          companyUrl="https://form3.tech"
          description="Delivering SEPA Instant, Credit Transfer, and Direct Debit at scale. Empowering household brands like Klarna."
        />
        <WorkEntry
          years="2022–23"
          title="Head of Engineering (International)"
          company="Form3"
          companyUrl="https://form3.tech"
          description="Launched Form3's SWIFT offering with Goldman Sachs, enabling cross-border payments in 124 currencies."
        />
        <WorkEntry
          years="2021–22"
          title="Lead Engineer"
          company="Form3"
          companyUrl="https://form3.tech"
          description="Delivered Mastercard's PayPort+, shaping the future of UK Faster Payments."
        />
        <WorkEntry
          years="2019–21"
          title="Senior Engineer"
          company="Form3"
          companyUrl="https://form3.tech"
          description="Built the foundations of the Form3 payments platform."
        />
        <WorkEntry
          years="2018–19"
          title="Cloud Improvement Engineer"
          company="Cloudreach"
          companyUrl="https://www.cloudreach.com"
          description="Guided enterprises through cloud transformations."
          muted
        />
        <WorkEntry
          years="2014–18"
          title="Software Engineer"
          company="Approov"
          companyUrl="https://approov.io"
          description="Developed and commercialised a mobile runtime protection (RASP) platform."
          muted
        />
        <WorkEntry
          years="2013–14"
          title="Software Test Engineer"
          company="Approov"
          companyUrl="https://approov.io"
          description="Industrial placement year, contributing to testing and early development of performance engineering tools."
          muted
        />
      </section>
    </section>
  </main>

  <Footer />
</Base>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    border: 0;
  }
</style>
```

- [ ] **Step 2: Run dev server and visually verify**

```bash
npm run dev
```

Open `http://localhost:4321`. Check:
- Hero renders with blinking cursor
- Nav sticks on scroll
- Work history renders correctly — current role with accent border, previous roles below
- Dark/light toggle works (double-click lightbulb in footer)
- No console errors

- [ ] **Step 3: Run build and check**

```bash
npm run check && npm run build
```

Expected: passes with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add home page"
```

---

## Task 10: Content collection and blog post migration

**Files:**
- Create: `src/content/config.ts`
- Migrate: `src/content/blog/*.md` (from existing `src/content/blog/`)

- [ ] **Step 1: Create src/content/config.ts**

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    author: z.string().default('Brendan Devenney'),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: Verify existing blog posts are already in place**

The existing `src/content/blog/*.md` files are already in the correct location for Astro Content Collections. No migration needed — Astro will pick them up automatically once `config.ts` is in place.

```bash
ls src/content/blog/
```

Expected output:
```
2022-02-21-thousand-days.md
2022-10-25-on-mental-health-as-a-manager.md
2025-10-26-hundred-days.md
```

- [ ] **Step 3: Verify collection schema validates**

```bash
npm run check
```

Expected: no errors. If frontmatter mismatches the schema (e.g. missing `title`), fix the specific post's frontmatter.

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: add blog content collection schema"
```

---

## Task 11: Blog listing page

**Files:**
- Create: `src/pages/blog/index.astro`

- [ ] **Step 1: Create src/pages/blog/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';

const posts = (await getCollection('blog')).sort(
  (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
);

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}
---

<Base
  title="Writing — Brendan Devenney"
  description="Writing by Brendan Devenney on software engineering, leadership, and more."
  canonicalPath="/blog"
>
  <Nav activePage="blog" />

  <main id="main" style="max-width: var(--width-prose); margin: 0 auto; padding: 2.5rem 1.5rem 0;">
    <p style="color: var(--text-subtle); font-size: 0.6rem; letter-spacing: 0.12em; margin-bottom: 1.5rem;">
      ── WRITING ──────────────────────
    </p>

    <ul style="list-style: none; margin: 0; padding: 0;" role="list">
      {posts.map((post) => (
        <li style="border-bottom: 1px solid var(--border);">
          <a
            href={`/blog/${post.slug}`}
            style="display: flex; justify-content: space-between; align-items: baseline; padding: 0.9rem 0; text-decoration: none; color: inherit;"
          >
            <span>
              <span style="font-size: 0.82rem; color: var(--text-2); display: block;">
                {post.data.title}
              </span>
              {post.data.description && (
                <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-top: 0.2rem;">
                  {post.data.description}
                </span>
              )}
              <span style="font-size: 0.65rem; color: var(--text-subtle); display: block; margin-top: 0.2rem;">
                {formatDate(post.data.date)}
              </span>
            </span>
            <span style="color: var(--accent); font-size: 0.8rem; margin-left: 1rem; flex-shrink: 0;">→</span>
          </a>
        </li>
      ))}
    </ul>

    <p style="margin-top: 1.5rem; font-size: 0.68rem;">
      <a href="/rss.xml" style="color: var(--text-muted);">↗ RSS feed</a>
    </p>
  </main>

  <Footer />
</Base>
```

- [ ] **Step 2: Verify in dev server**

Open `http://localhost:4321/blog`. Check: three posts listed in reverse chronological order, each with title, date, and right-arrow.

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: add blog listing page"
```

---

## Task 12: Blog post layout and post page

**Files:**
- Create: `src/layouts/BlogPost.astro`
- Create: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Create src/layouts/BlogPost.astro**

```astro
---
import Base from './Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  date: string;
  author: string;
  slug: string;
}

const { title, description, date, author, slug } = Astro.props;

const formattedDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date(date));
---

<Base
  title={`${title} — Brendan Devenney`}
  description={description}
  canonicalPath={`/blog/${slug}`}
  ogType="article"
>
  <!-- BlogPosting JSON-LD — rendered into Base's named head slot -->
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "datePublished": date,
    "author": {
      "@type": "Person",
      "name": author,
      "url": "https://devenney.io"
    },
    "url": `https://devenney.io/blog/${slug}`,
    "description": description ?? ''
  })} slot="head" />

  <Nav activePage="blog" />

  <main id="main" style="max-width: var(--width-prose); margin: 0 auto; padding: 2.5rem 1.5rem 0;">
    <!-- Post meta (monospace) -->
    <p style="color: var(--text-muted); font-size: 0.65rem; margin-bottom: 0.5rem;">{formattedDate}</p>
    <h1 style="color: var(--text-1); font-size: clamp(1.25rem, 3vw, 1.75rem); font-weight: 700; line-height: 1.25; margin: 0 0 1.5rem;">{title}</h1>
    <p style="margin-bottom: 1.75rem;">
      <a href="/blog" style="font-size: 0.68rem; color: var(--text-muted);">← back to writing</a>
    </p>

    <!-- Post body (serif) -->
    <article
      style="font-family: var(--font-serif); color: var(--text-2); font-size: 1rem; line-height: 1.85;"
      class="prose"
    >
      <slot />
    </article>
  </main>

  <Footer />
</Base>

<style is:global>
  /* Prose styles — scoped to article.prose */
  article.prose h2,
  article.prose h3 {
    font-family: var(--font-mono);
    color: var(--accent);
    margin: 2rem 0 0.75rem;
  }
  article.prose h2 { font-size: 1.15rem; }
  article.prose h3 { font-size: 1rem; }
  article.prose p { margin-bottom: 1.25rem; }
  article.prose a { color: var(--accent); }
  article.prose a:hover { color: var(--accent-h); }
  article.prose code {
    font-family: var(--font-mono);
    font-size: 0.875em;
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 0.1em 0.35em;
    border-radius: 3px;
    color: var(--text-1);
  }
  article.prose pre {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1rem;
    overflow-x: auto;
    margin-bottom: 1.25rem;
  }
  article.prose pre code {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.875rem;
  }
  article.prose blockquote {
    border-left: 2px solid var(--accent);
    padding-left: 1rem;
    color: var(--text-muted);
    margin: 1.5rem 0;
  }
  article.prose ul,
  article.prose ol {
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;
  }
  article.prose li { margin-bottom: 0.4rem; }
  article.prose hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 2rem 0;
  }
</style>
```

- [ ] **Step 2: Create src/pages/blog/[slug].astro**

```astro
---
import { getCollection } from 'astro:content';
import BlogPost from '../../layouts/BlogPost.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<BlogPost
  title={post.data.title}
  description={post.data.description}
  date={post.data.date}
  author={post.data.author}
  slug={post.slug}
>
  <Content />
</BlogPost>
```

- [ ] **Step 3: Verify all three posts render**

```bash
npm run dev
```

Visit:
- `http://localhost:4321/blog/2025-10-26-hundred-days`
- `http://localhost:4321/blog/2022-10-25-on-mental-health-as-a-manager`
- `http://localhost:4321/blog/2022-02-21-thousand-days`

Check: serif body text, monospace heading, back link, no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BlogPost.astro src/pages/blog/[slug].astro
git commit -m "feat: add blog post layout and dynamic route"
```

---

## Task 13: RSS feed

**Files:**
- Create: `src/pages/rss.xml.ts`

- [ ] **Step 1: Create src/pages/rss.xml.ts**

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: 'Brendan Devenney',
    description: 'Writing by Brendan Devenney — software engineering, leadership, and more.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description ?? '',
      link: `/blog/${post.slug}/`,
    })),
  });
}
```

- [ ] **Step 2: Verify RSS feed**

```bash
npm run build && cat dist/rss.xml | head -30
```

Expected: valid XML with `<channel>` and three `<item>` entries.

- [ ] **Step 3: Commit**

```bash
git add src/pages/rss.xml.ts
git commit -m "feat: add RSS feed"
```

---

## Task 14: About/Now page

**Files:**
- Create: `src/pages/about.astro`

The "Now" content below is placeholder structure — Brendan writes the actual bio and Now fields.

- [ ] **Step 1: Create src/pages/about.astro**

```astro
---
import { execSync } from 'child_process';
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';

let lastUpdated = '';
try {
  lastUpdated = execSync(
    'git log --follow -1 --format=%as -- src/pages/about.astro'
  ).toString().trim();
} catch {
  lastUpdated = '';
}

function formatLastUpdated(dateStr: string): string {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}
---

<Base
  title="About — Brendan Devenney"
  description="Brendan Devenney — Staff Software Engineer in Edinburgh, Scotland. Building security products, running D&D campaigns, playing games."
  canonicalPath="/about"
>
  <Nav activePage="about" />

  <main id="main" style="max-width: var(--width-prose); margin: 0 auto; padding: 2.5rem 1.5rem 0;">

    <section aria-labelledby="about-heading">
      <p style="color: var(--text-subtle); font-size: 0.6rem; letter-spacing: 0.12em; margin-bottom: 1.25rem;">
        ── ABOUT ────────────────────────
      </p>

      <!--
        CONTENT NEEDED: Write your bio here.
        Suggested structure: who you are + what you've done + what matters to you outside work.
        Keep it first-person, direct, not a LinkedIn summary.
        3-4 short paragraphs.
      -->
      <h1 id="about-heading" style="position: absolute; width: 1px; height: 1px; overflow: hidden;">About Brendan Devenney</h1>
      <p style="color: var(--text-2); font-size: 0.875rem; line-height: 1.85; margin-bottom: 1rem;">
        <!-- Your bio here -->
      </p>

      <nav aria-label="External profiles" style="display: flex; gap: 1.25rem; margin-top: 1rem; flex-wrap: wrap;">
        <a href="https://github.com/devenney" target="_blank" rel="noopener noreferrer" style="font-size: 0.72rem; color: var(--accent);">↗ github</a>
        <a href="https://uk.linkedin.com/in/brendan-devenney" target="_blank" rel="noopener noreferrer" style="font-size: 0.72rem; color: var(--text-muted);">↗ linkedin</a>
        <a href="https://github.com/devenney/cv/releases/latest" target="_blank" rel="noopener noreferrer" style="font-size: 0.72rem; color: var(--text-muted);">↗ cv</a>
      </nav>
    </section>

    <section aria-labelledby="now-heading" style="margin-top: 2.5rem;">
      <p style="color: var(--text-subtle); font-size: 0.6rem; letter-spacing: 0.12em; margin-bottom: 1.25rem;">
        ── NOW ──────────────────────────
      </p>
      <h2 id="now-heading" style="position: absolute; width: 1px; height: 1px; overflow: hidden;">Now</h2>

      <dl style="display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="display: flex; gap: 1rem;">
          <dt style="font-size: 0.65rem; color: var(--text-muted); min-width: 4.5rem; padding-top: 0.1rem;">work</dt>
          <dd style="font-size: 0.78rem; color: var(--text-3); line-height: 1.6; margin: 0;">
            <!-- CONTENT NEEDED: what are you focused on at work right now? -->
          </dd>
        </div>

        <div style="display: flex; gap: 1rem;">
          <dt style="font-size: 0.65rem; color: var(--text-muted); min-width: 4.5rem; padding-top: 0.1rem;">playing</dt>
          <dd style="font-size: 0.78rem; color: var(--text-3); line-height: 1.6; margin: 0;">
            <span style="color: var(--text-2);">Elden Ring Nightreign</span> and
            <span style="color: var(--text-2);">WoW: Midnight</span>
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-top: 0.15rem;">AOTC two expansions running</span>
          </dd>
        </div>

        <div style="display: flex; gap: 1rem;">
          <dt style="font-size: 0.65rem; color: var(--text-muted); min-width: 4.5rem; padding-top: 0.1rem;">running</dt>
          <dd style="font-size: 0.78rem; color: var(--text-3); line-height: 1.6; margin: 0;">
            <!-- CONTENT NEEDED: describe the D&D campaign -->
          </dd>
        </div>

        <div style="display: flex; gap: 1rem;">
          <dt style="font-size: 0.65rem; color: var(--text-muted); min-width: 4.5rem; padding-top: 0.1rem;">location</dt>
          <dd style="font-size: 0.78rem; color: var(--text-3); margin: 0;">Edinburgh, Scotland</dd>
        </div>
      </dl>

      {lastUpdated && (
        <p style="margin-top: 1.25rem; font-size: 0.62rem; color: var(--text-subtle);">
          Last updated {formatLastUpdated(lastUpdated)}
        </p>
      )}
    </section>

  </main>

  <Footer />
</Base>
```

- [ ] **Step 2: Fill in content**

The CONTENT NEEDED comments mark where Brendan's actual copy goes. Before considering this task done, fill in:
1. Bio paragraphs in the About section
2. Work focus line in the Now section
3. D&D campaign description in the running field

- [ ] **Step 3: Verify page renders**

```bash
npm run dev
```

Visit `http://localhost:4321/about`. Check: both sections render, Now table shows correctly, "Last updated" appears.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: add About/Now page"
```

---

## Task 15: Privacy page

**Files:**
- Create: `src/pages/privacy.astro`

- [ ] **Step 1: Read existing privacy content**

```bash
cat src/templates/privacy.hbs
```

Copy the body content from the existing template into the new page.

- [ ] **Step 2: Create src/pages/privacy.astro**

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
---

<Base
  title="Privacy — Brendan Devenney"
  canonicalPath="/privacy"
>
  <Nav />

  <main id="main" style="max-width: var(--width-prose); margin: 0 auto; padding: 2.5rem 1.5rem 0; font-size: 0.875rem; line-height: 1.8; color: var(--text-2);">
    <!-- Paste privacy content from src/templates/privacy.hbs here -->
  </main>

  <Footer />
</Base>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/privacy.astro
git commit -m "feat: migrate privacy page"
```

---

## Task 16: AI discoverability — llms.txt, robots.txt, sitemap

**Files:**
- Create: `public/llms.txt`
- Create: `public/robots.txt`
- Verify: `astro.config.mjs` already has sitemap integration (Task 1)

- [ ] **Step 1: Create public/llms.txt**

```
# Brendan Devenney

Staff Software Engineer based in Edinburgh, Scotland.
Currently at Approov, building mobile security products that protect leading brands.
Previously Head of Engineering (European Payments and International) at Form3,
delivering SEPA Instant, Credit Transfer, Direct Debit, and SWIFT with Goldman Sachs.

## Links
- Home: https://devenney.io
- About / Now: https://devenney.io/about
- Blog: https://devenney.io/blog
- CV: https://github.com/devenney/cv/releases/latest
- GitHub: https://github.com/devenney
- LinkedIn: https://uk.linkedin.com/in/brendan-devenney
- RSS: https://devenney.io/rss.xml

## Writing
- A hundred days: https://devenney.io/blog/2025-10-26-hundred-days
- On mental health as a manager: https://devenney.io/blog/2022-10-25-on-mental-health-as-a-manager
- A thousand days: https://devenney.io/blog/2022-02-21-thousand-days

## Skills and interests
Go, cloud infrastructure, mobile security, payments, software engineering leadership,
Elden Ring (Nightreign), World of Warcraft (AOTC), tabletop RPGs (D&D GM).
```

- [ ] **Step 2: Create public/robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://devenney.io/sitemap-index.xml
```

- [ ] **Step 3: Verify sitemap generates on build**

```bash
npm run build && ls dist/sitemap*
```

Expected: `dist/sitemap-index.xml` and `dist/sitemap-0.xml`.

- [ ] **Step 4: Commit**

```bash
git add public/llms.txt public/robots.txt
git commit -m "feat: add llms.txt and robots.txt for AI discoverability"
```

---

## Task 17: Cloudflare Pages deployment

**Files:**
- Create: `public/_redirects`
- Retire: `.github/workflows/deploy-master.yml`, `.github/workflows/deploy-release.yml`, `.github/workflows/webpack.yml`

- [ ] **Step 1: Create public/_redirects**

```
# Preserve any old .html extension URLs that may be indexed
/privacy.html  /privacy  301
/blog/index.html  /blog  301
```

- [ ] **Step 2: Connect Cloudflare Pages**

In the Cloudflare dashboard:
1. Go to Workers & Pages → Create → Pages → Connect to Git
2. Select the `devenney/devenney.io` repository
3. Set build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `20` (set in Environment Variables as `NODE_VERSION=20`)
4. Deploy

Cloudflare Pages will build and deploy on every push to `main` automatically — no GitHub Actions workflow needed.

- [ ] **Step 3: Update DNS**

In Cloudflare DNS for `devenney.io`:
- Add a CNAME record: `devenney.io` → `<project>.pages.dev`
- Or use Cloudflare's custom domain feature in the Pages dashboard (recommended — handles www redirect automatically)

- [ ] **Step 4: Retire old GitHub Actions workflows**

```bash
rm .github/workflows/deploy-master.yml
rm .github/workflows/deploy-release.yml
rm .github/workflows/webpack.yml
```

- [ ] **Step 5: Final build verification**

```bash
npm run check && npm run build
```

Expected: clean build, no TypeScript errors, `dist/` contains:
- `index.html`
- `about/index.html`
- `blog/index.html`
- `blog/2025-10-26-hundred-days/index.html`
- `blog/2022-10-25-on-mental-health-as-a-manager/index.html`
- `blog/2022-02-21-thousand-days/index.html`
- `privacy/index.html`
- `rss.xml`
- `sitemap-index.xml`
- `llms.txt`
- `robots.txt`

- [ ] **Step 6: Commit and push**

```bash
git add public/_redirects
git rm .github/workflows/deploy-master.yml .github/workflows/deploy-release.yml .github/workflows/webpack.yml
git commit -m "feat: configure Cloudflare Pages deployment, retire old workflows"
git push origin main
```

---

## Task 18: Cleanup — remove old source files

Once the new site is verified live on Cloudflare Pages:

- [ ] **Step 1: Remove old build tooling and templates**

```bash
git rm -r src/templates/
git rm -r src/sass/
git rm src/index.js
git rm webpack.config.js
```

- [ ] **Step 2: Remove old npm dependencies from package.json**

The following are no longer needed (already excluded from the new `package.json` in Task 1, but confirm they're absent):
`@picocss/pico`, `purecss`, `handlebars`, `handlebars-loader`, `html-webpack-plugin`, `copy-webpack-plugin`, `sass`, `sass-loader`, `style-loader`, `css-loader`, `file-loader`, `webpack`, `webpack-cli`, `webpack-dev-server`, `sitemap-webpack-plugin`, `prismjs`, `font-awesome`, `@fortawesome/fontawesome-free`, `front-matter`, `glob`, `fs-extra`, `acorn-import-assertions`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old Webpack/Handlebars build tooling"
```
