---
title: "Rebuilding devenney.io with Claude and Cloudflare Pages"
description: "Every few years I rebuild this site. This one happened over a weekend, between World Cup matches. Here is what the stack looks like now, and what each piece taught me about protecting personal time."
date: "2026-06-14"
---

Every few years, I rebuild this site.

This one happened over a weekend, between World Cup matches.

The pattern is consistent: new technology arrives, I wait until the guilt about the old stack becomes unbearable, and I redo the whole thing. The previous site was webpack and Handlebars, which tells you roughly how long it had been sitting there. I have been busy. I also jumped straight past whatever the intermediate era is supposed to be (pick your flavour of React framework) and landed directly in the Claude and Astro 6 era. I did manage to keep Tailwind, as I love that framework.

The honest context: most of this rewrite was done by [Claude Code](https://claude.ai/code). The workflow was: write a spec, hand it to Claude, review the output, iterate. I contributed the judgment; Claude contributed the typing. That is a workflow you can fit between matches.

The reason I want to write about this is not the AI angle. It is the stack. Each technology I picked had the same criterion: does it remove a category of problem from my personal time, or add one? Every step closer to that answer being "remove" is a step closer to being able to focus on the things that are actually worth my time.

## Astro

[Astro](https://astro.build) is a static site framework with a simple idea: build once, serve flat files, no runtime. For a personal site it is the right default. Content collections give you typed and validated blog posts without a CMS. The island architecture means interactive pieces do not pull in JavaScript you do not need.

The previous stack was webpack and Handlebars. Getting a blog post onto the page required a build pipeline, a template, and enough manual wiring that I avoided touching it. The content schema for this blog is about as simple as it gets:

```typescript
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
  }),
});
```

Write a markdown file, push, done. No templates, no build configuration to maintain.

One category of problem removed: I no longer have to think about the build system.

## Cloudflare Pages

This is the part worth writing about.

Here is what deploying used to look like:

```
Build → S3 sync → CloudFront invalidate → check DNS → hope
```

Three AWS services, IAM policies that needed to be exactly right, and a mental overhead that meant I avoided shipping unless I had a good reason.

[Cloudflare Pages](https://pages.cloudflare.com) is configured with two fields:

```
Build command:  npm run build
Output dir:     dist
```

That is the entire configuration. Every pull request gets a preview deployment automatically, so before merging anything I can click a URL and check it looks right. When I merge, CI has already confirmed there are no broken links and accessibility has not regressed. Cloudflare deploys the result. GitHub Actions tags the release. I do nothing else.

I have been running things on AWS for years and I know how to navigate it. But there is a real difference between infrastructure you can use and infrastructure that stays out of your way. One category of problem removed: I no longer have to think about deployment.

It is also free.

## Lighthouse CI

[Lighthouse](https://github.com/GoogleChrome/lighthouse) is Google's tool for auditing accessibility, SEO, and performance. Running it in CI means any regression fails the build before it ships.

The configuration lives in `.lighthouserc.json`:

```json
{
  "ci": {
    "collect": { "staticDistDir": "./dist" },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:seo":           ["error", { "minScore": 0.9 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

The key detail for a statically built site: use `staticDistDir` rather than pointing Lighthouse at a live URL. Astro builds flat HTML files you can audit locally without a server. The `upload` block is optional but gives you a shareable report URL for every CI run at no cost.

It caught several accessibility issues I would not have noticed manually. One category of problem removed: quality regressions that used to slip through now do not.

## Lychee

[Lychee](https://lychee.cli.rs) checks every link in the built site. It is one step in the CI workflow:

```yaml
- name: Serve dist for link check
  run: npx --yes serve dist -l 4321 &

- name: Wait for server
  run: npx --yes wait-on http://localhost:4321 --timeout 15000

- name: Check links
  uses: lycheeverse/lychee-action@v2
  with:
    args: --verbose --no-progress --exclude 'linkedin\.com' http://localhost:4321/
    fail: true
```

The non-obvious thing: Lychee cannot resolve root-relative links (like `/blog/` or `/rss.xml`) from static HTML files directly. The fix is to serve `dist/` on a local port first and point Lychee at the running server. Two extra steps, but it means broken links fail the build.

One category of problem removed: I no longer ship broken links without noticing.

---

The full flow, from writing to live: open a PR, CI runs lint and type check and Lighthouse and Lychee, Cloudflare Pages builds a preview, I check it looks right, I merge. Cloudflare deploys. GitHub Actions tags the release. That is it.

Every step in this stack was chosen because it removed something from my mental overhead. Personal time is finite. I would rather spend mine watching the football.

The source is [on GitHub](https://github.com/devenney/devenney.io).
