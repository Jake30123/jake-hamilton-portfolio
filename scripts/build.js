#!/usr/bin/env node
// scripts/build.js — converts projects/*.md + site.yaml → data.js + site-config.js
// Run locally after editing content: node scripts/build.js
// Also runs in GitHub Actions before deployment.

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ── Minimal YAML parser ───────────────────────────────────────────────────────
// Handles the subset we use: scalars, inline arrays [a,b,c], block arrays with
// - items, and block arrays of ["k","v"] pairs (specs).
function parseYAML(text) {
  const result = {};
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimEnd();
    if (!trimmed || trimmed.startsWith('#')) { i++; continue; }

    const indent = trimmed.match(/^(\s*)/)[1].length;
    if (indent > 0) { i++; continue; } // top-level only; block children handled below

    const colon = trimmed.indexOf(':');
    if (colon === -1) { i++; continue; }

    const key = trimmed.slice(0, colon).trim();
    const rest = trimmed.slice(colon + 1).trimStart();

    if (rest === '') {
      // Block value on following lines
      i++;
      const children = [];
      while (i < lines.length) {
        const child = lines[i].trimEnd();
        if (!child.trim()) { i++; continue; }
        const childIndent = child.match(/^(\s*)/)[1].length;
        if (childIndent === 0) break; // back to top level
        const childTrimmed = child.trim();
        if (childTrimmed.startsWith('- ') || childTrimmed === '-') {
          const itemPart = childTrimmed.startsWith('- ') ? childTrimmed.slice(2).trim() : '';
          if (itemPart === '>-' || itemPart === '>') {
            // List item is a block scalar — collect continuation lines
            i++;
            const textLines = [];
            while (i < lines.length) {
              const cl = lines[i].trimEnd();
              if (!cl.trim()) { i++; continue; }
              const ci = cl.match(/^(\s*)/)[1].length;
              if (ci <= childIndent) break;
              textLines.push(cl.trim());
              i++;
            }
            children.push({ folded: textLines.join(' ') });
          } else {
            children.push(child);
            i++;
          }
        } else if (childTrimmed.startsWith('>-')) {
          // Block scalar — collect folded lines
          i++;
          const textLines = [];
          while (i < lines.length) {
            const cl = lines[i].trimEnd();
            if (!cl.trim()) { i++; continue; }
            const ci = cl.match(/^(\s*)/)[1].length;
            if (ci === 0) break;
            textLines.push(cl.trim());
            i++;
          }
          children.push({ folded: textLines.join(' ') });
        } else {
          children.push(child);
          i++;
        }
      }
      if (children.length > 0) {
        result[key] = children.map(c => {
          if (typeof c === 'object' && c.folded !== undefined) return c.folded;
          const ct = typeof c === 'string' ? c.trim() : c;
          if (typeof ct !== 'string') return ct;
          if (!ct.startsWith('- ') && ct !== '-') return parseScalar(ct);
          const item = ct.slice(ct.indexOf(' ') + 1).trim();
          // Array-of-arrays like ["k","v"]
          if (item.startsWith('[') && item.endsWith(']')) {
            return parseInlineArray(item);
          }
          // Object like {eyebrow: ..., title: ...}
          if (item.startsWith('{') && item.endsWith('}')) {
            return parseInlineObj(item);
          }
          return parseScalar(item);
        });
        // If block items are objects, merge them
        const isObjBlock = children.some(c => {
          if (typeof c !== 'string') return false;
          const t = c.trim();
          return !t.startsWith('- ') && t.includes(':');
        });
        if (isObjBlock) {
          // Multi-key object under this key (e.g. skim items)
          // Re-parse as array of objects
          result[key] = parseYAMLArray(children.map(c => (typeof c === 'string' ? c.trim() : c)));
        }
      }
      continue;
    }

    // Inline array
    if (rest.startsWith('[') && rest.endsWith(']')) {
      result[key] = parseInlineArray(rest);
      i++;
      continue;
    }

    result[key] = parseScalar(rest);
    i++;
  }
  return result;
}

// Parses a block of children (strings) that represent an array of objects.
// Each object starts with a `- key: val` line followed by `  key: val` lines.
function parseYAMLArray(children) {
  const objs = [];
  let cur = null;
  for (const child of children) {
    if (typeof child === 'object') {
      // folded scalar — belongs to current object's last list key? skip for now
      continue;
    }
    const t = child.trim();
    if (t.startsWith('- ')) {
      if (cur) objs.push(cur);
      cur = {};
      const rest = t.slice(2).trim();
      if (rest.includes(':')) {
        const ci = rest.indexOf(':');
        cur[rest.slice(0, ci).trim()] = parseScalar(rest.slice(ci + 1).trimStart());
      }
    } else if (t.includes(':') && cur) {
      const ci = t.indexOf(':');
      cur[t.slice(0, ci).trim()] = parseScalar(t.slice(ci + 1).trimStart());
    } else if (t.startsWith('>-') && cur) {
      // handled already
    }
  }
  if (cur) objs.push(cur);
  return objs;
}

function parseInlineArray(s) {
  const inner = s.slice(1, -1).trim();
  if (!inner) return [];
  const parts = [];
  let depth = 0, buf = '', inQ = false, qChar = '';
  for (let ci = 0; ci < inner.length; ci++) {
    const ch = inner[ci];
    if ((ch === '"' || ch === "'") && !inQ) { inQ = true; qChar = ch; buf += ch; }
    else if (ch === qChar && inQ) { inQ = false; buf += ch; }
    else if ((ch === '[' || ch === '{') && !inQ) { depth++; buf += ch; }
    else if ((ch === ']' || ch === '}') && !inQ) { depth--; buf += ch; }
    else if (ch === ',' && depth === 0 && !inQ) { parts.push(parseScalar(buf.trim())); buf = ''; }
    else buf += ch;
  }
  if (buf.trim()) parts.push(parseScalar(buf.trim()));
  return parts;
}

function parseInlineObj(s) {
  const inner = s.slice(1, -1).trim();
  const obj = {};
  inner.split(',').forEach(pair => {
    const ci = pair.indexOf(':');
    if (ci === -1) return;
    obj[pair.slice(0, ci).trim()] = parseScalar(pair.slice(ci + 1).trim());
  });
  return obj;
}

function parseScalar(val) {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (s === 'true')  return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~' || s === '') return null;
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
  if ((s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  }
  return s;
}

// ── Front matter splitter ─────────────────────────────────────────────────────
function splitFrontMatter(content) {
  if (!content.startsWith('---')) return { fm: '', body: content };
  const end = content.indexOf('\n---', 3);
  if (end === -1) return { fm: '', body: content };
  return {
    fm:   content.slice(4, end),
    body: content.slice(end + 4).trimStart(),
  };
}

// ── Markdown body → block array ───────────────────────────────────────────────
function parseBody(md) {
  const blocks = [];
  const lines = md.split('\n');
  let i = 0;

  function peek(offset = 1) { return lines[i + offset] || ''; }

  while (i < lines.length) {
    const raw  = lines[i];
    const line = raw.trimEnd();
    const t    = line.trim();

    if (!t) { i++; continue; }

    // Headings
    if (t.startsWith('#### ')) { blocks.push({ type: 'h4', text: t.slice(5).trim() }); i++; continue; }
    if (t.startsWith('### '))  { blocks.push({ type: 'h3', text: t.slice(4).trim() }); i++; continue; }
    if (t.startsWith('## '))   { blocks.push({ type: 'h2', text: t.slice(3).trim() }); i++; continue; }

    // Blockquote → caption
    if (t.startsWith('> ')) {
      blocks.push({ type: 'caption', text: t.slice(2).trim() });
      i++; continue;
    }

    // <!-- pair --> block
    if (t === '<!-- pair -->') {
      i++;
      const pair = { type: 'pair', left: null, right: null, caption: null };
      while (i < lines.length && lines[i].trim() !== '<!-- /pair -->') {
        const pl = lines[i].trim();
        if (pl.startsWith('![')) {
          const m = pl.match(/!\[([^\]]*)\]\(([^)]*)\)/);
          if (m) {
            const obj = { src: m[2], alt: m[1] };
            if (!pair.left) pair.left = obj; else pair.right = obj;
          }
        } else if ((pl.startsWith('*') && pl.endsWith('*')) || (pl.startsWith('_') && pl.endsWith('_'))) {
          pair.caption = pl.slice(1, -1);
        }
        i++;
      }
      i++; // consume <!-- /pair -->
      blocks.push(pair);
      continue;
    }

    // <!-- specs: Title --> block
    if (t.startsWith('<!-- specs')) {
      const tm = t.match(/<!-- specs(?::\s*(.+?))?\s*-->/);
      const title = tm ? (tm[1] || null) : null;
      const items = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '<!-- /specs -->') {
        const sl = lines[i].trim();
        if (sl) {
          const ci = sl.indexOf(':');
          if (ci !== -1) items.push([sl.slice(0, ci).trim(), sl.slice(ci + 1).trim()]);
        }
        i++;
      }
      i++; // consume <!-- /specs -->
      if (items.length) blocks.push({ type: 'specs', title, items });
      continue;
    }

    // <!-- rules --> block
    if (t === '<!-- rules -->') {
      const items = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '<!-- /rules -->') {
        const rl = lines[i].trim();
        if (rl) {
          const ci = rl.indexOf(':');
          if (ci !== -1) items.push({ id: rl.slice(0, ci).trim(), text: rl.slice(ci + 1).trim() });
        }
        i++;
      }
      i++; // consume <!-- /rules -->
      if (items.length) blocks.push({ type: 'rules', items });
      continue;
    }

    // Code fence ```lang
    if (t.startsWith('```')) {
      const lang = t.slice(3).trim() || 'c';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // consume closing ```
      blocks.push({ type: 'code', lang, text: codeLines.join('\n') });
      continue;
    }

    // Image  ![alt](src)  with optional *caption* on next non-empty line
    if (t.startsWith('![')) {
      const m = t.match(/!\[([^\]]*)\]\(([^)]*)\)/);
      if (m) {
        let caption = null;
        // Peek at next non-empty line for an italic caption
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (j < lines.length) {
          const nxt = lines[j].trim();
          if ((nxt.startsWith('*') && nxt.endsWith('*') && !nxt.startsWith('**')) ||
              (nxt.startsWith('_') && nxt.endsWith('_'))) {
            caption = nxt.slice(1, -1);
            i = j; // advance past caption line
          }
        }
        blocks.push({ type: 'img', src: m[2], alt: m[1], caption });
        i++; continue;
      }
    }

    // Markdown table  | ... |
    if (t.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = row => row.slice(1, -1).split('|').map(c => c.trim());
        const headers = parseRow(tableLines[0]);
        // tableLines[1] is the separator row — skip it
        const rows = tableLines.slice(2).map(parseRow);
        blocks.push({ type: 'table', headers, rows });
      }
      continue;
    }

    // Regular paragraph — collect until blank line or special line
    const paraLines = [];
    while (i < lines.length) {
      const pl = lines[i].trimEnd();
      const pt = pl.trim();
      if (!pt) break;
      // Stop if the next line would be a special block
      if (pt.startsWith('#') || pt.startsWith('> ') || pt.startsWith('![') ||
          pt.startsWith('<!--') || pt.startsWith('```') || pt.startsWith('|')) break;
      paraLines.push(pt);
      i++;
    }
    if (paraLines.length) blocks.push({ type: 'p', text: paraLines.join(' ') });
  }
  return blocks;
}

// ── Build projects ────────────────────────────────────────────────────────────
const projDir = path.join(ROOT, 'projects');
const mdFiles = fs.readdirSync(projDir)
  .filter(f => f.endsWith('.md'))
  .sort(); // NN-slug.md natural order

const projects = mdFiles.map(f => {
  const content = fs.readFileSync(path.join(projDir, f), 'utf-8');
  const { fm, body } = splitFrontMatter(content);
  const meta = parseYAML(fm);
  const blocks = parseBody(body);

  const p = {
    slug:      meta.slug,
    category:  meta.category,
    title:     meta.title,
    subtitle:  meta.subtitle,
    thumbnail: meta.thumbnail,
    hero:      meta.hero,
    tags:      meta.tags || [],
    status:    meta.status === undefined ? null : meta.status,
    role:      meta.role,
    year:      meta.year,
    body:      blocks,
  };
  if (meta.featured) p.featured = true;
  if (meta.specs)    p.specs = meta.specs;
  return p;
});

// ── Write data.js ─────────────────────────────────────────────────────────────
const dataJs = `// Generated by scripts/build.js — edit projects/*.md instead.\n// ${new Date().toISOString()}\n\nwindow.PROJECTS = ${JSON.stringify(projects, null, 2)};\n`;
fs.writeFileSync(path.join(ROOT, 'data.js'), dataJs, 'utf-8');
console.log(`✓ data.js — ${projects.length} projects`);

// ── Parse site.yaml ───────────────────────────────────────────────────────────
const siteRaw = fs.readFileSync(path.join(ROOT, 'site.yaml'), 'utf-8');
const site    = parseYAML(siteRaw);

// ── Write site-config.js ──────────────────────────────────────────────────────
const siteJs = `// Generated by scripts/build.js — edit site.yaml instead.\n// ${new Date().toISOString()}\n\nwindow.SITE_CONFIG = ${JSON.stringify(site, null, 2)};\n`;
fs.writeFileSync(path.join(ROOT, 'site-config.js'), siteJs, 'utf-8');
console.log('✓ site-config.js');
console.log('\nDone. Commit data.js and site-config.js with your content changes.');
