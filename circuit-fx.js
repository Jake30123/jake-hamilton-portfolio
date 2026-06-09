/* Site-wide circuit effects.
   1) Spine — a power rail traced down the page margin. On the home page it
      leaves the hero's featured card, taps the Projects and Bio headings with
      pads, stitches vias down the rail, and terminates in a ground symbol at
      the footer. On project pages it runs a harness rail with a connector
      stub at every h2. Current pulses flow the rail continuously; section
      taps flash as they scroll into view.
   2) Sparks — electric bolts crackle off the edges of whatever interactive
      element the cursor enters (canvas overlay, zero idle cost).
   Both honor prefers-reduced-motion (static spine, no pulses, no sparks). */

(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const COLOR = {
    trace: "#D8DDE2",
    pad: "#C2C9CF",
    accent: "#E84E1B",
    glow: "#FFB38A",
    hot: "#FFEDE2",
    bg: "#FAFBFC",
  };

  // ---------- shared svg helpers ----------

  function make(name, attrs) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function chamfer(pts, cut) {
    if (pts.length < 3) return pts.slice();
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i - 1], [px, py] = pts[i], [bx, by] = pts[i + 1];
      const d1 = Math.hypot(px - ax, py - ay), d2 = Math.hypot(bx - px, by - py);
      if (d1 < 1 || d2 < 1) { out.push(pts[i]); continue; }
      const c = Math.min(cut, d1 / 2, d2 / 2);
      out.push([px - ((px - ax) / d1) * c, py - ((py - ay) / d1) * c]);
      out.push([px + ((bx - px) / d2) * c, py + ((by - py) / d2) * c]);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function pathD(pts) {
    return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  }

  function trace(svg, pts, color, width) {
    const p = make("path", {
      d: pathD(chamfer(pts, 12)),
      fill: "none",
      stroke: color || COLOR.trace,
      "stroke-width": width || 1.5,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    svg.appendChild(p);
    return p;
  }

  function pad(svg, x, y, accent) {
    const g = make("g", { class: "ckt-pad" });
    g.appendChild(make("circle", { cx: x, cy: y, r: 4.5, fill: COLOR.bg, stroke: COLOR.pad, "stroke-width": 1.5 }));
    g.appendChild(make("circle", { cx: x, cy: y, r: 1.8, fill: accent ? COLOR.accent : COLOR.pad }));
    svg.appendChild(g);
    return g;
  }

  function via(svg, x, y) {
    const g = make("g", { class: "ckt-pad" });
    g.appendChild(make("circle", { cx: x, cy: y, r: 2.8, fill: COLOR.bg, stroke: COLOR.trace, "stroke-width": 1.4 }));
    g.appendChild(make("circle", { cx: x, cy: y, r: 1, fill: COLOR.pad }));
    svg.appendChild(g);
    return g;
  }

  function gndSymbol(svg, x, y) {
    const g = make("g", { class: "ckt-pad" });
    [[18, 0], [11, 5], [5, 10]].forEach(([w, dy]) => {
      g.appendChild(make("line", {
        x1: x - w / 2, y1: y + dy, x2: x + w / 2, y2: y + dy,
        stroke: COLOR.pad, "stroke-width": 1.6, "stroke-linecap": "round",
      }));
    });
    svg.appendChild(g);
    return g;
  }

  // engineering-drawing dimension callouts (cheeky clearance specs)

  const PX_PER_MM = 3.7795;

  // real system voltages, from the case studies themselves — plus the FSAE EV
  // rule that accumulator segments stay ≤ 120 VDC (PT board lives on one) and
  // the 5 V APPS sensor rail the throttle firmware reads
  const PROJECT_VOLTS = {
    "Off-Road Super Bike": "96 V",
    "City Ripper": "76 V",
    "Mom-Mobile": "60 V",
    "Power and Thermistor Board": "120 V",
    "Throttle Firmware": "5 V",
    "Fox Robot Electrical System": "12 V",
  };

  // IPC-2221B Table 6-1, column B2 (external, uncoated, sea level–3050 m)
  function ipcMinMM(voltStr) {
    const v = parseInt(voltStr, 10);
    if (!v) return null;
    if (v <= 30) return "0.1";
    if (v <= 150) return "0.6";
    if (v <= 300) return "1.25";
    if (v <= 500) return "2.5";
    return (v * 0.005).toFixed(2);
  }

  function dimLine(g, a, b, c, d) {
    g.appendChild(make("line", { x1: a, y1: b, x2: c, y2: d, stroke: COLOR.pad, "stroke-width": 1.2, "stroke-linecap": "round" }));
  }

  function dimArrow(g, d) {
    g.appendChild(make("path", { d, fill: "none", stroke: COLOR.pad, "stroke-width": 1.2, "stroke-linecap": "round", "stroke-linejoin": "round" }));
  }

  function dimText(g, attrs, mm, voltage) {
    const t = make("text", Object.assign({
      "font-family": "'JetBrains Mono', monospace",
      "font-size": "9.5",
      "letter-spacing": "0.8",
      fill: "#8A929A",
      "paint-order": "stroke",
      stroke: COLOR.bg,
      "stroke-width": 3.5,
    }, attrs));
    t.appendChild(document.createTextNode(`${mm} MM · `));
    const tv = make("tspan", { fill: "#AD3D10" });
    tv.textContent = voltage;
    t.appendChild(tv);
    g.appendChild(t);
  }

  // across the column gap — label runs vertically inside the gap
  function dimensionH(svg, A, B, voltage) {
    const x0 = A.right + 3, x1 = B.left - 3;
    if (x1 - x0 < 22) return;
    const yTop = Math.max(A.top, B.top), yBot = Math.min(A.bottom, B.bottom);
    if (yBot - yTop < 140) return;
    const y = yTop + (yBot - yTop) * 0.42;
    const g = make("g", { class: "ckt-pad" });
    dimLine(g, x0, y - 7, x0, y + 7);
    dimLine(g, x1, y - 7, x1, y + 7);
    dimLine(g, x0, y, x1, y);
    dimArrow(g, `M${x0 + 5},${y - 3} L${x0},${y} L${x0 + 5},${y + 3}`);
    dimArrow(g, `M${x1 - 5},${y - 3} L${x1},${y} L${x1 - 5},${y + 3}`);
    dimText(g, {
      transform: `translate(${(x0 + x1) / 2 - 5}, ${y}) rotate(-90)`,
      "text-anchor": "middle",
    }, ((x1 - x0) / PX_PER_MM).toFixed(1), voltage);
    svg.appendChild(g);
  }

  // down the row gap — label sits beside the line, with the IPC minimum
  // underneath so the margin reads as gloriously overbuilt
  function dimensionV(svg, A, B, voltage) {
    const y0 = A.bottom + 3, y1 = B.top - 3;
    if (y1 - y0 < 22) return;
    const x = Math.max(A.left, B.left) + Math.min(A.width, B.width) * 0.5;
    const g = make("g", { class: "ckt-pad" });
    dimLine(g, x - 7, y0, x + 7, y0);
    dimLine(g, x - 7, y1, x + 7, y1);
    dimLine(g, x, y0, x, y1);
    dimArrow(g, `M${x - 3},${y0 + 5} L${x},${y0} L${x + 3},${y0 + 5}`);
    dimArrow(g, `M${x - 3},${y1 - 5} L${x},${y1} L${x + 3},${y1 - 5}`);
    const midY = (y0 + y1) / 2;
    dimText(g, {
      x: x + 9, y: midY - 1.5,
      "text-anchor": "start",
    }, ((y1 - y0) / PX_PER_MM).toFixed(1), voltage);
    const ipc = ipcMinMM(voltage);
    if (ipc) {
      const sub = make("text", {
        x: x + 9, y: midY + 10,
        "text-anchor": "start",
        "font-family": "'JetBrains Mono', monospace",
        "font-size": "8",
        "letter-spacing": "0.6",
        fill: "#A8B0B8",
        "paint-order": "stroke",
        stroke: COLOR.bg,
        "stroke-width": 3,
      });
      sub.textContent = `IPC-2221B MIN ${ipc} MM`;
      g.appendChild(sub);
    }
    svg.appendChild(g);
  }

  // doc-coordinate rect (page space, not viewport)
  function docRect(el) {
    const r = el.getBoundingClientRect();
    const sy = window.scrollY, sx = window.scrollX;
    return {
      left: r.left + sx, top: r.top + sy, right: r.right + sx, bottom: r.bottom + sy,
      width: r.width, height: r.height,
      cx: r.left + sx + r.width / 2, cy: r.top + sy + r.height / 2,
    };
  }

  // ================= SPINE =================

  const spine = {
    layer: null, svg: null, sig: "", drawn: false,
    rail: null, railLen: 0,
    flow: [],        // ambient pulses always travelling the rail
    branches: [], io: null, raf: 0, t: 0,
  };

  const FLOW_SPEED = 0.22; // px per ms — steady current drift

  function routeSig() {
    if (window.innerWidth < 760) return "off";
    const detail = document.querySelector(".detail-shell");
    const home = document.getElementById("projects");
    if (!detail && !home) return "off";
    const h = Math.round(document.documentElement.scrollHeight / 40);
    const w = Math.round(window.innerWidth / 60);
    return (detail ? "d:" + window.location.hash : "home") + ":" + h + ":" + w;
  }

  function ensureLayer() {
    if (spine.layer) return;
    spine.layer = document.createElement("div");
    spine.layer.id = "circuit-spine";
    spine.layer.setAttribute("aria-hidden", "true");
    spine.svg = make("svg", {});
    spine.layer.appendChild(spine.svg);
    document.body.appendChild(spine.layer);
  }

  function clearSpine() {
    if (!spine.svg) return;
    spine.svg.innerHTML = "";
    spine.rail = null;
    spine.flow = [];
    spine.branches = [];
    if (spine.io) { spine.io.disconnect(); spine.io = null; }
  }

  function buildSpine() {
    ensureLayer();
    clearSpine();
    const sig = spine.sig;
    if (sig === "off") { spine.layer.style.display = "none"; return; }
    spine.layer.style.display = "";

    const svg = spine.svg;
    const W = window.innerWidth;
    const H = document.documentElement.scrollHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);

    const container = document.querySelector("main .container") || document.querySelector(".container");
    if (!container) return;
    const cs = getComputedStyle(container);
    const contentLeft = docRect(container).left + parseFloat(cs.paddingLeft || "0");
    const railX = Math.max(12, contentLeft * 0.5);

    const newTraces = [];
    const branchSpecs = []; // { path, watchEl }
    let railPts = null;

    if (sig.startsWith("home")) {
      const feature = document.querySelector(".hero-feature");
      const skim = document.querySelector(".skim");
      const projHead = document.querySelector("#projects .section-title");
      const aboutHead = document.querySelector("#about .section-title");
      const footer = document.querySelector(".footer-inner");
      if (!feature || !projHead || !footer) return;

      const fr = docRect(feature);
      const startY = fr.top + fr.height * 0.42;
      const gndY = docRect(footer).cy;

      railPts = [[fr.left - 7, startY], [railX, startY], [railX, gndY]];

      pad(svg, fr.left - 7, startY, true);

      const usedY = [startY];

      // taps into section landmarks
      const tap = (el, accent) => {
        if (!el) return;
        const r = docRect(el);
        const endX = r.left - 20;
        if (endX - railX < 16) { via(svg, railX, r.cy); usedY.push(r.cy); return; }
        const p = trace(svg, [[railX, r.cy], [endX, r.cy]]);
        pad(svg, endX, r.cy, accent);
        newTraces.push(p);
        branchSpecs.push({ path: p, watchEl: el });
        usedY.push(r.cy);
      };
      tap(projHead, true);
      tap(aboutHead, true);

      if (skim) {
        const sr = docRect(skim);
        const stubEnd = Math.min(railX + 40, contentLeft - 12);
        if (stubEnd - railX > 14) {
          newTraces.push(trace(svg, [[railX, sr.cy], [stubEnd, sr.cy]]));
          via(svg, stubEnd, sr.cy);
        }
        usedY.push(sr.cy);
      }

      // stitching vias down the quiet stretches of the rail
      for (let y = startY + 220; y < gndY - 120; y += 300) {
        if (usedY.some((u) => Math.abs(u - y) < 70)) continue;
        via(svg, railX, y);
      }

      gndSymbol(svg, railX, gndY + 4);

      // cheeky: annotate a couple of card gaps like an HV layout drawing —
      // true measured distance, the project's real voltage, IPC minimum
      const cardEls = Array.from(document.querySelectorAll("#projects .grid .card"));
      if (cardEls.length >= 2) {
        const rects = cardEls.map((c) => docRect(c));
        const volt = (i) => {
          const h3 = cardEls[i].querySelector("h3");
          const byTitle = h3 && PROJECT_VOLTS[h3.textContent.trim()];
          if (byTitle) return byTitle;
          const tags = Array.from(cardEls[i].querySelectorAll(".tag"), (t) => t.textContent).join(" ");
          const m = tags.match(/(\d+)\s*V\b/i);
          return m ? m[1] + " V" : null;
        };
        // only dimension gaps whose neighbouring project has a known rating
        const hRows = [];
        for (let r = 0; 2 * r + 1 < rects.length; r++) {
          if (volt(2 * r) || volt(2 * r + 1)) hRows.push(r);
        }
        if (hRows.length) {
          const r = hRows[(Math.random() * hRows.length) | 0];
          dimensionH(svg, rects[2 * r], rects[2 * r + 1], volt(2 * r) || volt(2 * r + 1));
        }
        const vIdx = [];
        for (let i = 0; i + 2 < rects.length; i++) {
          if (volt(i) || volt(i + 2)) vIdx.push(i);
        }
        if (vIdx.length) {
          const k = vIdx[(Math.random() * vIdx.length) | 0];
          dimensionV(svg, rects[k], rects[k + 2], volt(k) || volt(k + 2));
        }
      }
    } else {
      const shell = document.querySelector(".detail-shell");
      const detailNav = document.querySelector(".detail-nav");
      if (!shell) return;
      const sr = docRect(shell);
      const startY = sr.top + 16;
      const gndY = detailNav ? docRect(detailNav).top + 24 : sr.bottom - 80;

      railPts = [[railX, startY], [railX, gndY]];

      via(svg, railX, startY);

      // connector stub at every section heading in the article
      const heads = shell.querySelectorAll(".prose h2");
      const stubEnd = Math.min(railX + 36, contentLeft - 10);
      heads.forEach((h) => {
        const r = docRect(h);
        if (stubEnd - railX > 12) {
          newTraces.push(trace(svg, [[railX, r.cy], [stubEnd, r.cy]]));
          pad(svg, stubEnd, r.cy, true);
        } else {
          via(svg, railX, r.cy);
        }
      });

      gndSymbol(svg, railX, gndY + 4);
    }

    // rail goes in last so pulses (appended after) ride above everything
    const rail = trace(svg, railPts);
    spine.rail = rail;
    spine.railLen = rail.getTotalLength();
    newTraces.unshift(rail);

    if (!REDUCED) {
      // ambient current — home only; project pages stay static so the
      // traces don't compete with the reading
      if (sig.startsWith("home")) {
        const count = Math.max(2, Math.min(5, Math.round(spine.railLen / 900)));
        for (let i = 0; i < count; i++) {
          spine.flow.push({
            phase: (i + Math.random() * 0.3) / count,
            halo: svg.appendChild(make("circle", { r: 6.5, fill: COLOR.accent, opacity: 0 })),
            core: svg.appendChild(make("circle", { r: 2.4, fill: COLOR.accent, opacity: 0 })),
          });
        }
      }

      // section taps flash when their section scrolls into view
      if (branchSpecs.length) {
        spine.branches = branchSpecs.map((b) => ({
          path: b.path, len: b.path.getTotalLength(), t: Infinity, lastFire: 0,
          halo: svg.appendChild(make("circle", { r: 6.5, fill: COLOR.accent, opacity: 0 })),
          core: svg.appendChild(make("circle", { r: 2.4, fill: COLOR.accent, opacity: 0 })),
        }));
        spine.io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const i = branchSpecs.findIndex((b) => b.watchEl === entry.target);
            const br = spine.branches[i];
            const now = performance.now();
            if (br && now - br.lastFire > 9000) { br.t = 0; br.lastFire = now; }
          });
        }, { threshold: 0.6 });
        branchSpecs.forEach((b) => spine.io.observe(b.watchEl));
      }

      if (!spine.drawn) {
        newTraces.forEach((p, i) => {
          const len = p.getTotalLength();
          p.setAttribute("stroke-dasharray", len);
          p.animate(
            [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
            { duration: i === 0 ? 1500 : 700, delay: 250 + i * 140, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" }
          );
        });
        spine.svg.querySelectorAll(".ckt-pad").forEach((g, i) => {
          g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: 600 + i * 70, fill: "both" });
        });
        spine.drawn = true;
      }
    }
  }

  function spineFrame(now) {
    spine.raf = requestAnimationFrame(spineFrame);
    if (!spine.rail || document.hidden) { spine.t = now; return; }
    const dt = Math.min(now - (spine.t || now), 50);
    spine.t = now;

    // steady current down the rail
    const df = (dt * FLOW_SPEED) / Math.max(1, spine.railLen);
    for (const fl of spine.flow) {
      fl.phase = (fl.phase + df) % 1;
      const at = fl.phase * spine.railLen;
      const p = spine.rail.getPointAtLength(at);
      const fade = Math.min(1, at / 90, (spine.railLen - at) / 90);
      fl.halo.setAttribute("cx", p.x); fl.halo.setAttribute("cy", p.y);
      fl.core.setAttribute("cx", p.x); fl.core.setAttribute("cy", p.y);
      fl.halo.setAttribute("opacity", (0.14 * fade).toFixed(3));
      fl.core.setAttribute("opacity", (0.9 * fade).toFixed(3));
    }

    for (const br of spine.branches) {
      if (br.t === Infinity) continue;
      br.t += dt;
      const f = br.t / 900;
      if (f >= 1) {
        br.t = Infinity;
        br.halo.setAttribute("opacity", 0); br.core.setAttribute("opacity", 0);
        continue;
      }
      const pt = br.path.getPointAtLength(f * br.len);
      const fade = Math.min(1, f * 6, (1 - f) * 6);
      br.halo.setAttribute("cx", pt.x); br.halo.setAttribute("cy", pt.y);
      br.core.setAttribute("cx", pt.x); br.core.setAttribute("cy", pt.y);
      br.halo.setAttribute("opacity", 0.16 * fade);
      br.core.setAttribute("opacity", 0.9 * fade);
    }
  }

  // route/layout watcher — React re-renders, images load, filters change height
  setInterval(() => {
    const sig = routeSig();
    if (sig !== spine.sig) {
      spine.sig = sig;
      buildSpine();
    }
  }, 500);

  if (!REDUCED) spine.raf = requestAnimationFrame(spineFrame);

  // ================= SPARKS =================
  // Electric bolts that crackle off the edges of the hovered element.

  if (!REDUCED) {
    const canvas = document.createElement("canvas");
    canvas.id = "spark-fx";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let dpr = 1, bolts = [], raf = 0, last = 0;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    }
    size();
    window.addEventListener("resize", size, { passive: true });

    const SEL = "a, button, .hero-portrait";
    let hoverEl = null, nextCrackle = 0;

    document.addEventListener("pointerover", (e) => {
      if (!e.target || !e.target.closest) return;
      const t = e.target.closest(SEL);
      if (!t || t === hoverEl) return;
      if (t.closest('[class*="twk"]')) return; // leave the tweaks panel alone
      hoverEl = t;
      crackle(t, 1); // entry burst, then tick() keeps it arcing
      nextCrackle = performance.now() + 320 + Math.random() * 300;
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }, { passive: true });

    document.addEventListener("pointerout", (e) => {
      if (!hoverEl) return;
      if (!e.relatedTarget || !hoverEl.contains(e.relatedTarget)) {
        hoverEl = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest(SEL) : null;
      }
    }, { passive: true });

    // point + outward normal at distance d around a rect's perimeter
    function perimeterPoint(x0, y0, x1, y1, d) {
      const w = x1 - x0, h = y1 - y0;
      if (d < w) return [x0 + d, y0, -Math.PI / 2];
      d -= w;
      if (d < h) return [x1, y0 + d, 0];
      d -= h;
      if (d < w) return [x1 - d, y1, Math.PI / 2];
      d -= w;
      return [x0, y1 - d, Math.PI];
    }

    // a jagged lightning bolt: local-space points, rotated into place at draw
    function makeBolt(x, y, angle, scale) {
      const pts = [[0, 0]];
      const segs = 3 + ((Math.random() * 3) | 0);
      let dx = 0;
      for (let i = 0; i < segs; i++) {
        dx += (4.5 + Math.random() * 5) * scale;
        pts.push([dx, (Math.random() - 0.5) * 6 * scale]);
      }
      return {
        x, y,
        cos: Math.cos(angle), sin: Math.sin(angle),
        pts, t: 0, dur: 220 + Math.random() * 170,
      };
    }

    function crackle(el, intensity) {
      const r = el.getBoundingClientRect();
      const x0 = Math.max(r.left, 0), y0 = Math.max(r.top, 0);
      const x1 = Math.min(r.right, window.innerWidth), y1 = Math.min(r.bottom, window.innerHeight);
      if (x1 - x0 <= 0 || y1 - y0 <= 0) return;

      const per = 2 * ((x1 - x0) + (y1 - y0));
      const count = Math.max(2, Math.round(Math.min(8, Math.max(3, Math.round(per / 150))) * intensity));

      if (bolts.length > 36) bolts.splice(0, bolts.length - 36);
      for (let i = 0; i < count; i++) {
        // spread spawn points around the perimeter with a little randomness
        const d = ((i + Math.random() * 0.8) / count) * per;
        const [px, py, normal] = perimeterPoint(x0, y0, x1, y1, d);
        const a = normal + (Math.random() - 0.5) * 0.9;
        // nudge the origin just off the edge so the bolt visibly leaves the element
        const ox = px + Math.cos(normal) * 2, oy = py + Math.sin(normal) * 2;
        bolts.push(makeBolt(ox, oy, a, 1));
        if (Math.random() < 0.35) bolts.push(makeBolt(ox, oy, a + (Math.random() - 0.5) * 1.3, 0.55)); // fork
        bolts.push({ flash: true, x: ox, y: oy, t: 0, dur: 160 });
      }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }

    function drawBolt(b, f) {
      const flick = 0.6 + Math.random() * 0.4;               // electric flicker
      const alpha = Math.pow(1 - f, 1.5) * flick;
      const reveal = Math.min(1, f * 3);                     // bolt shoots out fast
      const nVis = Math.max(2, Math.ceil(b.pts.length * reveal));

      ctx.beginPath();
      for (let k = 0; k < nVis; k++) {
        const [lx, ly] = b.pts[k];
        const wx = b.x + lx * b.cos - ly * b.sin;
        const wy = b.y + lx * b.sin + ly * b.cos;
        k === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
      }
      // orange glow pass
      ctx.globalAlpha = alpha * 0.75;
      ctx.strokeStyle = COLOR.accent;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = "rgba(232, 78, 27, 0.65)";
      ctx.shadowBlur = 9;
      ctx.stroke();
      // white-hot core pass
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = COLOR.hot;
      ctx.lineWidth = 0.9;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }

    function tick(now) {
      const dt = Math.min(now - last, 50);
      last = now;

      // keep arcing for as long as the cursor stays on the element
      if (hoverEl) {
        if (!hoverEl.isConnected) {
          hoverEl = null;
        } else if (now >= nextCrackle) {
          crackle(hoverEl, 0.65);
          nextCrackle = now + 300 + Math.random() * 340;
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      bolts = bolts.filter((b) => (b.t += dt) < b.dur);
      for (const b of bolts) {
        const f = b.t / b.dur;
        if (b.flash) {
          ctx.globalAlpha = (1 - f) * 0.8;
          ctx.fillStyle = COLOR.glow;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 1.8 + f * 2.6, 0, 7);
          ctx.fill();
          continue;
        }
        drawBolt(b, f);
      }
      ctx.globalAlpha = 1;

      if (bolts.length || hoverEl) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        raf = 0;
      }
    }
  }
})();
