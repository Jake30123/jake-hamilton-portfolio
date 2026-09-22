# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git

Keep git use to a minimum. Don't commit, push, stash, checkout, reset or otherwise change
the working tree or history unless the user asks or the task can't be done without it.
Read-only commands (`git status`, `git diff`, `git log`) are fine. The user handles commits.

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
- `scripts/build.js` — a Node script with its own minimal YAML parser and Markdown-to-block converter (its only dependency is esbuild, for the JSX step). `parseMedia()` decides whether a `![alt](src)` link is an image, a local video or a YouTube embed. It produces the two `window.*` globals consumed by the React app.

**Front-end:**
- `index.html` — loads scripts in order: `data.js`, `site-config.js`, `app.js`
- `app.jsx` — single-file React SPA; all components are defined here inline. `Block` renders one body block; `Media` renders an image, `<video>` or YouTube iframe and is shared by standalone figures and `pair` cells. Hash-based routing: `#/p/<slug>` renders the `Detail` view, any other hash renders the home page (Hero → Skim → ProjectGrid → About).
- `tweaks-panel.jsx` — **not loaded by the live site** (its unrestricted cross-origin `postMessage` traffic looks like hijacker behaviour to URL-filtering scanners); `app.jsx` uses `TWEAK_DEFAULTS` as fixed values. Reusable floating panel that exposes `useTweaks`, `TweaksPanel`, and a set of `Tweak*` controls as globals on `window`. The panel is activated by a `postMessage(__activate_edit_mode)` from a host frame and persists changes by posting `__edit_mode_set_keys` back to the host, which rewrites the `/*EDITMODE-BEGIN*/.../*EDITMODE-END*/` block in `app.jsx`.

**Deployment:** GitHub Actions (`/.github/workflows/jekyll.yml`) runs `npm ci` and `node scripts/build.js`, removes `node_modules`, then deploys the repo root to GitHub Pages on every push to `main`.

## Adding or editing a project

1. Create or edit `projects/NN-slug.md`. The front matter fields are: `slug`, `category` (Personal | FSAE | Professional), `title`, `subtitle`, `thumbnail`, `hero`, `tags`, `status`, `role`, `year`, and optionally `featured` and `specs` (array of `["Key", "Value"]` pairs). `Professional` is for paid customer work and internships. The category filter pills are hardcoded in `app.jsx` (`ProjectGrid`'s `cats` array) — adding a new category value requires adding it there too.
2. The Markdown body supports: `## / ### / ####` headings, paragraphs, `![alt](src)` images and videos (optional `*italic caption*` on the next line; see **Media** below), `<!-- pair --> ... <!-- /pair -->` for side-by-side images or videos, `<!-- specs: Title --> ... <!-- /specs -->` for key-value tables, `<!-- rules --> ... <!-- /rules -->` for FSAE rule citations, fenced code blocks (defaults to `c`), `> blockquote` for standalone captions, and `| table |` syntax.
3. Run `node scripts/build.js`. The regenerated `data.js` (and `app.js` if `app.jsx` changed) must be committed alongside the content changes — the user does the committing (see **Git**).

### Media

The same `![alt](src)` syntax embeds video; `parseMedia()` in `scripts/build.js` picks the kind from the link:

```markdown
![Spin test](assets/img/isetta/first-spin.mp4)        <!-- <video> with controls, preload="metadata" -->
![Wheels](assets/img/isetta/clip.mp4 "loop")          <!-- muted autoplay loop, no controls (GIF-style) -->
![Walkthrough](https://youtu.be/VIDEO_ID?t=90)        <!-- YouTube iframe, starts at 90 s -->
```

- Local video: `.mp4`, `.webm`, `.mov`, `.m4v`. Block type `video`. Use H.264 (HEVC phone clips show a black box in many browsers), keep files well under GitHub's 100 MB limit, and prefer `-movflags +faststart` so playback starts without fetching the end of the file.
- YouTube: `watch?v=`, `youtu.be/`, `/shorts/` and `/embed/` URLs; `t=`/`start=` seconds is honoured. Block type `youtube`. Embeds use `youtube-nocookie.com` (keeps third-party cookie/tracker traffic down for URL-filtering scanners).
- Paths are relative to the repo root and must match the file on disk exactly — a wrong path just renders an empty player. Existing media lives under `assets/img/<project>/`.
- Styling is in `styles.css` next to the image rules: videos and `.embed` share the `.figure`/`.pair` look; `.embed` is 16:9.

## Editing site-wide content

Edit `site.yaml` and run `node scripts/build.js`. The `status` field sets the hero status pill. The `skim` array drives the four-stat strip below the hero. The `about` array is one paragraph per item.
