# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build

```
npm install   # once, installs esbuild
node scripts/build.js
```

This is the only build step. It reads `projects/*.md`, `site.yaml` and `app.jsx` and writes three generated files that must be committed:
- `data.js` — exports `window.PROJECTS` (array of project objects)
- `site-config.js` — exports `window.SITE_CONFIG` (email, LinkedIn, skim stats, about text)
- `app.js` — `app.jsx` compiled to plain JS by esbuild (transform only, no bundling)

Run after any change to `projects/*.md`, `site.yaml` or `app.jsx`. There is no test suite and no linter.

## Architecture

There is no bundler. React 18 and ReactDOM (production UMD builds) are loaded from CDN in `index.html`. JSX is precompiled at build time — the browser never runs Babel, because in-browser compilation contributed to the domain being flagged as Grayware by Palo Alto URL filtering.

**Content pipeline:**
- `site.yaml` — site-wide config (email, LinkedIn, status line, skim stats, about paragraphs)
- `projects/NN-slug.md` — one file per project; YAML front matter + Markdown body. Files are sorted by filename, so the `NN-` prefix controls display order.
- `scripts/build.js` — a Node script with its own minimal YAML parser and Markdown-to-block converter (its only dependency is esbuild, for the JSX step). It produces the two `window.*` globals consumed by the React app.

**Front-end:**
- `index.html` — loads scripts in order: `data.js`, `site-config.js`, `app.js`
- `app.jsx` — single-file React SPA; all components are defined here inline. Hash-based routing: `#/p/<slug>` renders the `Detail` view, any other hash renders the home page (Hero → Skim → ProjectGrid → About).
- `tweaks-panel.jsx` — **not loaded by the live site** (its unrestricted cross-origin `postMessage` traffic looks like hijacker behaviour to URL-filtering scanners); `app.jsx` uses `TWEAK_DEFAULTS` as fixed values. Reusable floating panel that exposes `useTweaks`, `TweaksPanel`, and a set of `Tweak*` controls as globals on `window`. The panel is activated by a `postMessage(__activate_edit_mode)` from a host frame and persists changes by posting `__edit_mode_set_keys` back to the host, which rewrites the `/*EDITMODE-BEGIN*/.../*EDITMODE-END*/` block in `app.jsx`.

**Deployment:** GitHub Actions (`/.github/workflows/jekyll.yml`) runs `npm ci` and `node scripts/build.js`, removes `node_modules`, then deploys the repo root to GitHub Pages on every push to `main`.

## Adding or editing a project

1. Create or edit `projects/NN-slug.md`. The front matter fields are: `slug`, `category` (Personal | FSAE | Professional), `title`, `subtitle`, `thumbnail`, `hero`, `tags`, `status`, `role`, `year`, and optionally `featured` and `specs` (array of `["Key", "Value"]` pairs). `Professional` is for paid customer work and internships. The category filter pills are hardcoded in `app.jsx` (`ProjectGrid`'s `cats` array) — adding a new category value requires adding it there too.
2. The Markdown body supports: `## / ### / ####` headings, paragraphs, `![alt](src)` images (optional `*italic caption*` on the next line), `<!-- pair --> ... <!-- /pair -->` for side-by-side images, `<!-- specs: Title --> ... <!-- /specs -->` for key-value tables, `<!-- rules --> ... <!-- /rules -->` for FSAE rule citations, fenced code blocks (defaults to `c`), `> blockquote` for standalone captions, and `| table |` syntax.
3. Run `node scripts/build.js` and commit `data.js` (and `app.js` if `app.jsx` changed) alongside the content changes.

## Editing site-wide content

Edit `site.yaml` and run `node scripts/build.js`. The `status` field sets the hero status pill. The `skim` array drives the four-stat strip below the hero. The `about` array is one paragraph per item.
