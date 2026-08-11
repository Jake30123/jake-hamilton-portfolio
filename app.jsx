/* global React, ReactDOM */
const { useState, useEffect, useMemo } = React;
const CFG = window.SITE_CONFIG || {};

// ---------- tiny syntax highlighter for C ----------
function highlightC(src) {
  const KEYWORDS = new Set(["if","else","return","static","bool","true","false","int","void","while","for","continue","break","define","include","struct","enum","const","volatile","sizeof","typedef","extern","switch","case","default","goto"]);
  const TYPES = new Set(["int16_t","int1hundred_t","uint16_t","uint8_t","int8_t","uint32_t","int32_t","size_t","float","double","char"]);
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  let out = "", i = 0, len = src.length;
  while (i < len) {
    const c = src[i];
    if (c === "/" && src[i+1] === "/") { let j = i; while (j < len && src[j] !== "\n") j++; out += `<span class="tok-com">${esc(src.slice(i, j))}</span>`; i = j; continue; }
    if (c === "/" && src[i+1] === "*") { let j = i + 2; while (j < len && !(src[j] === "*" && src[j+1] === "/")) j++; j = Math.min(j + 2, len); out += `<span class="tok-com">${esc(src.slice(i, j))}</span>`; i = j; continue; }
    if (c === "#" && (i === 0 || src[i-1] === "\n")) { let j = i; while (j < len && src[j] !== "\n") j++; out += `<span class="tok-pp">${esc(src.slice(i, j))}</span>`; i = j; continue; }
    if (c === '"' || c === "'") { const q = c; let j = i + 1; while (j < len && src[j] !== q) { if (src[j] === "\\") j++; j++; } j = Math.min(j + 1, len); out += `<span class="tok-str">${esc(src.slice(i, j))}</span>`; i = j; continue; }
    if (/[0-9]/.test(c)) { let j = i; while (j < len && /[0-9a-fA-Fx.]/.test(src[j])) j++; out += `<span class="tok-num">${esc(src.slice(i, j))}</span>`; i = j; continue; }
    if (/[A-Za-z_]/.test(c)) { let j = i; while (j < len && /[A-Za-z0-9_]/.test(src[j])) j++; const word = src.slice(i, j); let cls = null;
      if (KEYWORDS.has(word)) cls = "tok-kw";
      else if (TYPES.has(word)) cls = "tok-typ";
      else if (word === word.toUpperCase() && word.length > 1) cls = "tok-num";
      else if (src[j] === "(") cls = "tok-fn";
      out += cls ? `<span class="${cls}">${esc(word)}</span>` : esc(word);
      i = j; continue;
    }
    out += esc(c); i++;
  }
  return out;
}

// ---------- copy-email button ----------
function CopyEmailButton({ className, children }) {
  const [copied, setCopied] = useState(false);
  function copy(e) {
    e.preventDefault();
    navigator.clipboard.writeText(CFG.email || "jhamilton@olin.edu").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <a href={`mailto:${CFG.email || "jhamilton@olin.edu"}`} className={className} onClick={copy}>
      {copied ? "Copied!" : children}
    </a>
  );
}

// ---------- nav ----------
function Nav({ goTo }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-inner">
        <button className="nav-mark" onClick={() => goTo("top")} aria-label="Home">
          <span className="dot"></span>
          <span>Jake Hamilton</span>
        </button>
        <nav className="nav-links">
          <a href="#projects" onClick={(e) => { e.preventDefault(); goTo("projects"); }}>Projects</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); goTo("about"); }}>About</a>
          <CopyEmailButton>Email</CopyEmailButton>
          <a href={CFG.linkedin || "#"} target="_blank" rel="noopener">LinkedIn</a>
        </nav>
      </div>
    </header>
  );
}

// ---------- hero ----------
function Hero({ tweaks, onOpen }) {
  return (
    <section className="hero-v2">
      <div id="hero-circuit" className="hero-circuit" aria-hidden="true"></div>
      <div className="hv-label" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 3.4 22 20.6H2L12 3.4Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M12.8 9.2l-3.6 5.2h2.5l-1.1 4.4 4-5.9h-2.5l1.7-3.7z" fill="currentColor" />
        </svg>
        <span>Warning: High Voltage</span>
      </div>
      <div className="container hero-top">
        <div className="hero-top-text">
          <div className="status">
            <span className="pulse"></span>
            <span>{tweaks.statusLine}</span>
          </div>
          <h1 className="hero-headline">
            Building&nbsp;<span className="amp">EVs</span>, batteries, and the firmware that runs them.
          </h1>
          <div className="hero-byline">
            <span>Electrical Engineering · Olin College, '28</span>
            <span className="sep">·</span>
            <span>Battery R&D Intern, BETA Technologies</span>
          </div>
          <div className="hero-ctas">
            <a className="btn btn-primary" href="#projects" onClick={(e) => { e.preventDefault(); document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
              View projects <span className="arrow">→</span>
            </a>
            <CopyEmailButton className="btn btn-ghost">Email</CopyEmailButton>
          </div>
        </div>
        <div className="hero-portrait">
          <img src="assets/img/portrait.jpg" alt="Portrait of Jake Hamilton" loading="lazy" />
          <div className="frame-line"></div>
        </div>
      </div>
      <div className="container hero-stage">
        <button className="hero-feature" onClick={() => onOpen("blueberry")}>
          <div className="hero-feature-img">
            <img src="assets/img/blu/blu1.jpg" alt="Blueberry, the e-bike that started it all" />
          </div>
          <div className="hero-feature-meta">
            <div className="hero-feature-eyebrow">Origin · 2021</div>
            <div className="hero-feature-title">Blueberry — the bike that started it all.</div>
            <div className="hero-feature-sub">A well loved e-bike, a garage fire, and my Olin application essay.</div>
            <div className="hero-feature-cta">Read the story <span className="arrow">→</span></div>
          </div>
        </button>
      </div>
    </section>
  );
}

// ---------- skim strip ----------
function Skim() {
  const items = (CFG.skim || []).map(it => ({
    eyebrow: it.eyebrow,
    title: it.titleNum ? <>{<span className="num">{it.titleNum}</span>}{it.titleText}</> : it.title,
    sub: it.sub,
  }));
  return (
    <section className="skim">
      <div className="container">
        <div className="skim-inner">
          {items.map((it, idx) => (
            <div className="skim-item" key={idx}>
              <div className="skim-eyebrow">{it.eyebrow}</div>
              <div className="skim-title">{it.title}</div>
              <div className="skim-sub">{it.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- project grid ----------
function ProjectGrid({ onOpen }) {
  const [filter, setFilter] = useState("All");
  const cats = ["All", "FSAE", "Personal"];
  const counts = useMemo(() => {
    const c = { All: window.PROJECTS.length };
    cats.slice(1).forEach((k) => (c[k] = window.PROJECTS.filter((p) => p.category === k).length));
    return c;
  }, []);
  const filtered = useMemo(
    () => filter === "All" ? window.PROJECTS : window.PROJECTS.filter((p) => p.category === filter),
    [filter]
  );

  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">Selected work</div>
            <h2 className="section-title">Projects</h2>
          </div>
          <div className="filters">
            {cats.map((c) => (
              <button
                key={c}
                className={`filter-pill ${filter === c ? "active" : ""}`}
                onClick={() => setFilter(c)}
              >
                <span>{c}</span>
                <span className="count">{counts[c]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid">
          {filtered.map((p, i) => (
            <button className="card reveal" key={p.slug} onClick={() => onOpen(p.slug)}>
              <div className="card-thumb">
                <span className="card-index">{String(i + 1).padStart(2, "0")}</span>
                <img src={p.thumbnail} alt={p.title} loading="lazy" />
                <div className="card-cat">{p.category}</div>
                {p.status && <div className="card-status">{p.status}</div>}
              </div>
              <div className="card-body">
                <div className="card-meta">
                  <span>{p.year}</span>
                  <span className="dot"></span>
                  <span>{p.role}</span>
                </div>
                <h3>{p.title}</h3>
                <div className="sub">{p.subtitle}</div>
                <div className="tags">
                  {p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
                <div className="card-cta">
                  <span>View case study</span>
                  <span className="read">Read <span className="arrow">→</span></span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- about ----------
function About() {
  return (
    <section className="section about-section" id="about">
      <div className="container about-layout">
        <div className="section-eyebrow">About</div>
        <h2 className="section-title">Bio</h2>
        <div className="about-body-wrap">
          {(CFG.about || []).map((para, i) => <p key={i} className="about-body">{para}</p>)}
          <div className="about-ctas">
            <CopyEmailButton className="btn btn-primary">Get in touch <span className="arrow">→</span></CopyEmailButton>
            <a className="btn btn-ghost" href={CFG.linkedin || "#"} target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- detail blocks ----------
function Block({ b }) {
  switch (b.type) {
    case "h2": return <h2>{b.text}</h2>;
    case "h3": return <h3>{b.text}</h3>;
    case "h4": return <h4>{b.text}</h4>;
    case "p":  return <p>{b.text}</p>;
    case "caption": return <span className="standalone-cap">{b.text}</span>;
    case "img":
      return (
        <figure className="figure">
          <img src={b.src} alt={b.alt || ""} loading="lazy" />
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );
    case "pair":
      return (
        <div>
          <div className="pair">
            <img src={b.left.src} alt={b.left.alt || ""} loading="lazy" />
            <img src={b.right.src} alt={b.right.alt || ""} loading="lazy" />
          </div>
          {b.caption && <span className="pair-cap">{b.caption}</span>}
        </div>
      );
    case "code": return <CodeBlock text={b.text} lang={b.lang || "c"} />;
    case "specs":
      return (
        <div className="specs-block">
          {b.title && <div className="specs-title">{b.title}</div>}
          <dl>{b.items.map(([k, v], i) => (<React.Fragment key={i}><dt>{k}</dt><dd>{v}</dd></React.Fragment>))}</dl>
        </div>
      );
    case "rules":
      return (
        <div className="rules">
          {b.items.map((r, i) => (
            <div className="rule-row" key={i}>
              <div className="rule-id">{r.id}</div>
              <div className="rule-text">{r.text}</div>
            </div>
          ))}
        </div>
      );
    case "table":
      return (
        <div className="tbl-wrap">
          <table>
            <thead><tr>{b.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>{b.rows.map((row, i) => (<tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>))}</tbody>
          </table>
        </div>
      );
    default: return null;
  }
}

function CodeBlock({ text, lang }) {
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => highlightC(text), [text]);
  return (
    <div className="codeblock">
      <div className="codeblock-head">
        <span className="lang">{lang.toUpperCase()}</span>
        <button className="copy" onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </div>
  );
}

function Detail({ slug, onHome, onOpen }) {
  const idx = window.PROJECTS.findIndex((p) => p.slug === slug);
  const p = window.PROJECTS[idx];
  const prev = idx > 0 ? window.PROJECTS[idx - 1] : null;
  const next = idx < window.PROJECTS.length - 1 ? window.PROJECTS[idx + 1] : null;

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!p) return null;
  return (
    <main className="detail-shell">
      <div className="container">
        <button className="crumb" onClick={() => onHome("projects")}>
          <span className="arrow">→</span> Back to projects
        </button>

        <header className="detail-header">
          <div className="detail-meta">
            <span className="cat">{p.category}</span>
            <span className="dot"></span>
            <span>{p.year}</span>
            <span className="dot"></span>
            <span>{p.role}</span>
            {p.status && <><span className="dot"></span><span style={{ color: "var(--accent-2)" }}>{p.status}</span></>}
          </div>
          <h1>{p.title}</h1>
          <p className="detail-sub">{p.subtitle}</p>
          <div className="detail-tags">{p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
        </header>

        <div className="detail-hero">
          <img src={p.hero} alt={p.title} />
        </div>

        <article className="prose">
          {p.specs && (
            <div className="specs-block">
              <div className="specs-title">Specs</div>
              <dl>{p.specs.map(([k, v], i) => (<React.Fragment key={i}><dt>{k}</dt><dd>{v}</dd></React.Fragment>))}</dl>
            </div>
          )}
          {p.body.map((b, i) => <Block key={i} b={b} />)}
        </article>

        <nav className="detail-nav">
          <button className={`detail-nav-card ${!prev ? "disabled" : ""}`} onClick={() => prev && onOpen(prev.slug)} aria-disabled={!prev}>
            <span className="label">← Previous</span>
            <span className="ttl">{prev ? prev.title : "—"}</span>
          </button>
          <button className={`detail-nav-card right ${!next ? "disabled" : ""}`} onClick={() => next && onOpen(next.slug)} aria-disabled={!next}>
            <span className="label">Next →</span>
            <span className="ttl">{next ? next.title : "—"}</span>
          </button>
        </nav>
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>© 2026 Jake Hamilton</div>
        <div className="footer-links">
          <a href={CFG.linkedin || "#"} target="_blank" rel="noopener">LinkedIn</a>
          <CopyEmailButton>Email</CopyEmailButton>
        </div>
      </div>
    </footer>
  );
}

function useReveal(deps) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, deps || []);
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "ember",
  "statusLine": CFG.status || "May 2026 — running Mk7 BMS bring-up; open to Summer 2026 internships."
}/*EDITMODE-END*/;

function TweaksUI({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Accent palette">
        <TweakRadio
          value={tweaks.accent}
          onChange={(v) => setTweak("accent", v)}
          options={[
            { value: "ember", label: "Ember" },
            { value: "steel", label: "Steel" },
            { value: "seafoam", label: "Seafoam" },
            { value: "sky", label: "Sky" },
            { value: "pine", label: "Pine" },
          ]}
        />
      </TweakSection>
      <TweakSection title="Hero status line">
        <TweakText
          value={tweaks.statusLine}
          onChange={(v) => setTweak("statusLine", v)}
          placeholder="May 2026 — running Mk7 BMS bring-up..."
        />
      </TweakSection>
    </TweaksPanel>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState(() => parseHash());

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", tweaks.accent || "ember");
  }, [tweaks.accent]);

  useReveal([route]);

  function open(slug) {
    window.location.hash = `/p/${slug}`;
    window.scrollTo(0, 0);
  }

  function goTo(target) {
    if (route.kind === "detail") {
      window.location.hash = "";
      setTimeout(() => {
        if (target === "top") window.scrollTo({ top: 0, behavior: "smooth" });
        else document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    } else {
      if (target === "top") window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  const onDetail = route.kind === "detail";

  return (
    <>
      <Nav goTo={goTo} />
      {onDetail ? (
        <Detail slug={route.slug} onHome={goTo} onOpen={open} />
      ) : (
        <main>
          <Hero tweaks={tweaks} onOpen={open} />
          <Skim />
          <ProjectGrid onOpen={open} />
          <About />
        </main>
      )}
      <Footer />
      <TweaksUI tweaks={tweaks} setTweak={setTweak} />
    </>
  );
}

function parseHash() {
  const h = window.location.hash || "";
  const m = h.match(/^#\/p\/([\w-]+)/);
  if (m) return { kind: "detail", slug: m[1] };
  return { kind: "home" };
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
