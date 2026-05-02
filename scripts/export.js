#!/usr/bin/env node
// scripts/export.js — run ONCE to bootstrap projects/*.md from the existing data.js
// After running, edit the .md files and use scripts/build.js to regenerate data.js.

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ── Load existing data ───────────────────────────────────────────────────────
const window = {};
eval(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf-8'));
const projects = window.PROJECTS;

// ── Block → Markdown ─────────────────────────────────────────────────────────
function blockToMd(b) {
  switch (b.type) {
    case 'h2':      return `\n## ${b.text}`;
    case 'h3':      return `\n### ${b.text}`;
    case 'h4':      return `\n#### ${b.text}`;
    case 'p':       return `\n${b.text}`;
    case 'caption': return `\n> ${b.text}`;
    case 'img': {
      let s = `\n![${b.alt || ''}](${b.src})`;
      if (b.caption) s += `\n*${b.caption}*`;
      return s;
    }
    case 'pair': {
      const lines = ['\n<!-- pair -->'];
      if (b.left)  lines.push(`![${b.left.alt  || ''}](${b.left.src})`);
      if (b.right) lines.push(`![${b.right.alt || ''}](${b.right.src})`);
      if (b.caption) lines.push(`*${b.caption}*`);
      lines.push('<!-- /pair -->');
      return lines.join('\n');
    }
    case 'code':
      return `\n\`\`\`${b.lang || 'c'}\n${b.text}\n\`\`\``;
    case 'specs': {
      const lines = [`\n<!-- specs${b.title ? ': ' + b.title : ''} -->`];
      for (const [k, v] of b.items) lines.push(`${k}: ${v}`);
      lines.push('<!-- /specs -->');
      return lines.join('\n');
    }
    case 'rules': {
      const lines = ['\n<!-- rules -->'];
      for (const r of b.items) lines.push(`${r.id}: ${r.text}`);
      lines.push('<!-- /rules -->');
      return lines.join('\n');
    }
    case 'table': {
      const sep = b.headers.map(() => '---');
      const rows = b.rows.map(r => `| ${r.join(' | ')} |`);
      return [
        '',
        `| ${b.headers.join(' | ')} |`,
        `| ${sep.join(' | ')} |`,
        ...rows,
      ].join('\n');
    }
    default: return '';
  }
}

// ── Project → front matter string ────────────────────────────────────────────
function toFrontMatter(p, order) {
  const lines = ['---'];
  lines.push(`slug: ${p.slug}`);
  lines.push(`order: ${order}`);
  lines.push(`category: ${p.category}`);
  if (p.featured) lines.push(`featured: true`);
  lines.push(`title: "${esc(p.title)}"`);
  lines.push(`subtitle: "${esc(p.subtitle)}"`);
  lines.push(`thumbnail: ${p.thumbnail}`);
  lines.push(`hero: ${p.hero}`);
  lines.push(`tags: [${p.tags.join(', ')}]`);
  lines.push(`status: ${p.status === null || p.status === undefined ? 'null' : `"${esc(p.status)}"`}`);
  lines.push(`role: "${esc(p.role)}"`);
  lines.push(`year: "${esc(p.year)}"`);
  if (p.specs && p.specs.length) {
    lines.push('specs:');
    for (const [k, v] of p.specs) lines.push(`  - ["${esc(k)}", "${esc(v)}"]`);
  }
  lines.push('---');
  return lines.join('\n');
}

function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }

// ── Write project Markdown files ─────────────────────────────────────────────
projects.forEach((p, idx) => {
  const fm = toFrontMatter(p, idx + 1);
  const body = p.body.map(blockToMd).join('\n');
  const content = fm + '\n' + body.trimStart() + '\n';
  const num = String(idx + 1).padStart(2, '0');
  const filename = `${num}-${p.slug}.md`;
  fs.writeFileSync(path.join(ROOT, 'projects', filename), content, 'utf-8');
  console.log(`  wrote projects/${filename}`);
});

// ── Write site.yaml ───────────────────────────────────────────────────────────
// Pull the hardcoded values from app.jsx context (we just hardcode them here
// since they are known constants extracted manually from app.jsx).
const siteYaml = `# Site-wide configuration — edit here, then run: node scripts/build.js
# The email and LinkedIn link appear in the nav, hero, about section, and footer.

email: canaanjake9@gmail.com
linkedin: https://www.linkedin.com/in/james-keller-hamilton-2593b1328/

# Status pill in the hero section.
status: "May 2026 — running Mk7 BMS bring-up; open to Summer 2026 internships."

# Four-stat skim strip below the hero.
# The "Built" item uses titleNum + titleText to render the big serif number.
skim:
  - eyebrow: Education
    title: "Olin College, '28"
    sub: B.S. Electrical Engineering
  - eyebrow: Now
    title: Project Manager
    sub: Olin Electric Motorsports (FSAE)
  - eyebrow: Built
    titleNum: "5"
    titleText: EV builds
    sub: "E-bikes, motorcycles, an ATV"
  - eyebrow: From
    title: "Washington, DC"
    sub: Currently in Needham, MA

# About section body paragraphs (one item per paragraph).
about:
  - >-
    I am an Electrical Engineering student at Olin College of Engineering with
    a focused passion for electric vehicles, battery technology, and power
    electronics. I combine my academic pursuits with extensive hands-on
    experience.
  - >-
    My practical skills have been honed through numerous personal DIY projects,
    running my own business, and designing and manufacturing custom printed
    circuit boards for the Olin Electric Motorsports (FSAE) team, where I am
    now the project manager.
  - >-
    I'm originally from Washington, DC, and plan to graduate Olin in 2028.
`;

fs.writeFileSync(path.join(ROOT, 'site.yaml'), siteYaml, 'utf-8');
console.log('  wrote site.yaml');
console.log(`\nDone. ${projects.length} projects exported.`);
console.log('Next: node scripts/build.js');
