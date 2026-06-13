# devenney.io

The public website code for https://devenney.io.

Built with [Astro 5](https://astro.build), [Tailwind CSS v4](https://tailwindcss.com), and deployed via [Cloudflare Pages](https://pages.cloudflare.com).

## Setup

Requires Node 20+.

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Available at http://localhost:4321 with hot reload.

## Build

```bash
npm run build
```

Output is written to `dist/`. Cloudflare Pages runs this automatically on every push to `main`.

## Type Checking

```bash
npm run check
```

## Blog Posts

Blog posts live in `src/content/blog/`.

Required frontmatter:

```yaml
title: Post title
description: Short synopsis shown on the blog listing page.
date: 2025-01-01  # ISO 8601
author: Brendan Devenney
```

File names: `YYYY-MM-DD-short-description.md`.

## Credits

### Sprite sheet

**Mega Man (NES)** — ripped by [MisterMike](https://www.spriters-resource.com/profile/MisterMike/) and hosted on [The Spriters Resource](https://www.spriters-resource.com). Used under The Spriters Resource's standard non-commercial fan-use terms.

### Music

**"No Copyright Music Mega Man opening Theme"** — [Blinding Beats](https://www.youtube.com/watch?v=VtNx8nIrUL4) (YouTube: @blindingbeats3299, 2020). Published as no-copyright/royalty-free music.

### Libraries and tooling

| Library | Licence |
|---|---|
| [Astro](https://astro.build) | MIT |
| [Tailwind CSS](https://tailwindcss.com) | MIT |
| [astro-icon](https://github.com/natemoo-re/astro-icon) | MIT |
| [Font Awesome 6](https://fontawesome.com) (icons via Iconify) | CC BY 4.0 (icons), SIL OFL (fonts) |
| [Geist Mono](https://vercel.com/font) | SIL OFL |
