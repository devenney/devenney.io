# Writing a blog post

## Creating the file

Add a `.md` file to `src/content/blog/`:

```
src/content/blog/YYYY-MM-DD-your-slug.md
```

The URL will be `https://devenney.io/blog/YYYY-MM-DD-your-slug/`.

## Frontmatter

```markdown
---
title: "Post Title"
description: "One sentence. Shown in SEO meta, RSS, and the blog index."
date: "YYYY-MM-DD"
---
```

`author` is optional and defaults to `Brendan Devenney`.

## Syntax-highlighted code

Fenced code blocks are highlighted with Shiki (night-owl theme). Specify a language:

````markdown
```typescript
const greeting = 'hello';
```
````

Works with TypeScript, Go, YAML, JSON, Bash, and any other Shiki-supported language. For plain terminal output, use `bash` or no language tag.

## Images

Drop images in `public/assets/images/posts/` and reference them in markdown:

```markdown
![Description of image](/assets/images/posts/your-image.png)
```

For a captioned image, use a figure block directly in the markdown:

```html
<figure>
  <img src="/assets/images/posts/your-image.png" alt="Description" />
  <figcaption>Caption text.</figcaption>
</figure>
```

## Diagrams

ASCII-style diagrams inside a plain code block work well and fit the site aesthetic:

````markdown
```
Before: Build → S3 → CloudFront → check DNS
After:  git push
```
````

Mermaid is not currently configured. If you want proper flowcharts, `rehype-mermaid` can be added to `astro.config.mjs`.

## Prose elements

Standard markdown works throughout:

- `##` / `###` — section headings (Geist Mono, accent colour)
- `**bold**`, `*italic*`
- `[link text](url)` — accent colour with underline
- `> blockquote` — left border in accent colour
- `` `inline code` `` — monospace, subtle background
- `---` — horizontal rule
- Bullet and numbered lists

## Publishing

Push to main (or merge a PR). Cloudflare Pages builds and deploys automatically. The post will appear in `/blog/`, `/rss.xml`, and `/sitemap-0.xml` with no extra configuration.
