/* Hero circuit traces — the hero laid out like a PCB.
   Traces are routed live around the real positions of the headline, status
   pill, CTAs, portrait, and featured card, so the type and photo read as
   components on the board. Orange "current" pulses travel the traces;
   hovering the portrait sends a signal back down the bus.
   Honors prefers-reduced-motion (static traces, no pulses/parallax). */

(function () {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const COLOR = {
    trace: "#D8DDE2",
    warm: "#EFCBB6",
    pad: "#C2C9CF",
    accent: "#E84E1B",
    bg: "#FAFBFC",
  };

  let state = null;

  // ---------- svg helpers ----------

  function make(name, attrs) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // Replace each corner of an orthogonal polyline with a 45° chamfer
  function chamfer(pts, cut) {
    if (pts.length < 3) return pts.slice();
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i - 1], [px, py] = pts[i], [bx, by] = pts[i + 1];
      const d1 = Math.hypot(px - ax, py - ay), d2 = Math.hypot(bx - px, by - py);
      const c = Math.min(cut, d1 / 2, d2 / 2);
      if (d1 < 1 || d2 < 1) { out.push(pts[i]); continue; }
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

  // drawing-style clearance dimension across the text↔portrait gap
  function dimension(svg, x0, x1, y, voltage) {
    if (x1 - x0 < 26) return;
    const g = make("g", { class: "ckt-pad" });
    const ln = (a, b, c, d) => g.appendChild(make("line", { x1: a, y1: b, x2: c, y2: d, stroke: COLOR.pad, "stroke-width": 1.2, "stroke-linecap": "round" }));
    ln(x0, y - 7, x0, y + 7);
    ln(x1, y - 7, x1, y + 7);
    ln(x0, y, x1, y);
    const ar = (d) => g.appendChild(make("path", { d, fill: "none", stroke: COLOR.pad, "stroke-width": 1.2, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    ar(`M${x0 + 5},${y - 3} L${x0},${y} L${x0 + 5},${y + 3}`);
    ar(`M${x1 - 5},${y - 3} L${x1},${y} L${x1 - 5},${y + 3}`);
    const t = make("text", {
      transform: `translate(${(x0 + x1) / 2 - 5}, ${y}) rotate(-90)`,
      "text-anchor": "middle",
      "font-family": "'JetBrains Mono', monospace",
      "font-size": "9.5",
      "letter-spacing": "0.8",
      fill: "#8A929A",
      "paint-order": "stroke",
      stroke: COLOR.bg,
      "stroke-width": 3.5,
    });
    t.appendChild(document.createTextNode(`${((x1 - x0) / 3.7795).toFixed(1)} MM · `));
    const tv = make("tspan", { fill: "#AD3D10" });
    tv.textContent = voltage;
    t.appendChild(tv);
    g.appendChild(t);
    svg.appendChild(g);
  }

  // ---------- pulses (orange current travelling a path) ----------

  function makePulse(svg, path, opts) {
    const halo = make("circle", { r: 7.5, fill: COLOR.accent, opacity: 0 });
    const core = make("circle", { r: 2.6, fill: COLOR.accent, opacity: 0 });
    svg.append(halo, core);
    return {
      path, halo, core,
      len: path.getTotalLength(),
      dur: opts.dur || 3600,
      idle: opts.idle || [600, 1600],
      dir: 1,
      t: -(opts.delay || 0),
      fire(reverse) { this.t = 0; this.dir = reverse ? -1 : 1; },
      rest() {
        this.t = -(this.idle[0] + Math.random() * (this.idle[1] - this.idle[0]));
        this.dir = 1;
        this.halo.setAttribute("opacity", 0);
        this.core.setAttribute("opacity", 0);
      },
      step(dt) {
        this.t += dt;
        if (this.t < 0) return;
        const f = this.t / this.dur;
        if (f >= 1) { this.rest(); return; }
        const at = this.dir > 0 ? f * this.len : (1 - f) * this.len;
        const p = this.path.getPointAtLength(at);
        const fade = Math.min(1, f * 8, (1 - f) * 8);
        this.halo.setAttribute("cx", p.x); this.halo.setAttribute("cy", p.y);
        this.core.setAttribute("cx", p.x); this.core.setAttribute("cy", p.y);
        this.halo.setAttribute("opacity", 0.16 * fade);
        this.core.setAttribute("opacity", 0.95 * fade);
      },
    };
  }

  // ---------- layout + build ----------

  function rel(elm, hero) {
    const r = elm.getBoundingClientRect(), h = hero.getBoundingClientRect();
    return {
      left: r.left - h.left, top: r.top - h.top,
      right: r.right - h.left, bottom: r.bottom - h.top,
      width: r.width, height: r.height,
      cx: r.left - h.left + r.width / 2, cy: r.top - h.top + r.height / 2,
    };
  }

  function build(st) {
    const hero = st.hero, svg = st.svg;
    svg.innerHTML = "";
    st.pulses = [];

    const q = (sel) => hero.querySelector(sel);
    const els = {
      text: q(".hero-top-text"), portrait: q(".hero-portrait"),
      status: q(".status"), ctas: q(".hero-ctas"), feature: q(".hero-feature"),
    };
    for (const k in els) if (!els[k]) return;

    const W = hero.clientWidth, H = hero.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);

    const text = rel(els.text, hero), portrait = rel(els.portrait, hero);
    const status = rel(els.status, hero), ctas = rel(els.ctas, hero), feature = rel(els.feature, hero);

    const gap = portrait.left - text.right;
    if (gap < 30) return; // stacked or cramped — sit this one out

    const s = Math.min(8, gap / 4 - 2);     // bus line spacing
    const c = text.right + gap / 2;          // bus vertical x (mid-gap)
    const b = status.cy;                      // bus horizontal y (status pill level)
    const startX = status.right + 26;

    const traces = [];

    // bus line 1 (top) — runs the whitespace beside the headline, plugs into the portrait
    const portPadY = portrait.top + portrait.height * 0.3;
    const t1 = trace(svg, [
      [startX, b - s], [c + s, b - s], [c + s, portPadY], [portrait.left - 8, portPadY],
    ]);
    pad(svg, portrait.left - 8, portPadY, true);
    traces.push(t1);

    // bus line 2 (mid) — dives down the column gap and lands on the featured card
    const featPadX = feature.left + feature.width * 0.22;
    const featBendY = Math.max(feature.top - 34, ctas.bottom + 16);
    const t2 = trace(svg, [
      [startX, b], [c, b], [c, featBendY], [featPadX, featBendY], [featPadX, feature.top - 9],
    ]);
    pad(svg, featPadX, feature.top - 9, true);
    traces.push(t2);

    // bus line 3 (bottom) — short stub, ends in a via beside the CTAs
    const t3 = trace(svg, [
      [startX, b + s], [c - s, b + s], [c - s, ctas.cy],
    ]);
    via(svg, c - s, ctas.cy);
    traces.push(t3);

    // connector footprint where the bus leaves the status pill
    svg.appendChild(make("rect", {
      x: startX - 7, y: b - s - 8, width: 11, height: 2 * s + 16,
      rx: 3, fill: COLOR.bg, stroke: COLOR.pad, "stroke-width": 1.4,
    }));
    [b - s, b, b + s].forEach((y) => via(svg, startX - 1.5, y));

    // decor: trace in from the right edge onto the top of the portrait
    const dY = Math.max(14, portrait.top - 18);
    if (portrait.top > 30) {
      const prx = portrait.right - 30;
      traces.push(trace(svg, [[W, dY], [prx, dY], [prx, portrait.top - 8]]));
      pad(svg, prx, portrait.top - 8, false);
    }

    // decor: warm trace bleeding in from the left edge under the CTAs
    const lbY = ctas.bottom + 30;
    if (lbY < feature.top - 24) {
      traces.push(trace(svg, [[0, lbY], [text.left + 96, lbY]], COLOR.warm, 2));
      via(svg, text.left + 96, lbY);
    }

    // clearance spec on the isolation gap between the copy and the portrait —
    // rated for the 96 V flagship build
    const dimY = ctas.bottom + 14;
    if (dimY < feature.top - 26 && dimY < portrait.bottom - 20) {
      dimension(svg, text.right + 4, portrait.left - 4, dimY, "96 V");
    }

    if (!REDUCED) {
      // draw the board in once, then let the current flow
      if (!st.drawn) {
        traces.forEach((p, i) => {
          const len = p.getTotalLength();
          p.setAttribute("stroke-dasharray", len);
          p.animate(
            [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
            { duration: 1100, delay: 180 + i * 160, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" }
          );
        });
        svg.querySelectorAll(".ckt-pad").forEach((g, i) => {
          g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 700 + i * 90, fill: "both" });
        });
        st.drawn = true;
      }
      st.pulses.push(makePulse(svg, t2, { dur: 4200, delay: 1600 }));
      st.pulses.push(makePulse(svg, t1, { dur: 3400, delay: 3200 }));
      st.portrait = els.portrait;
    }
  }

  // ---------- lifecycle ----------

  function mount(root) {
    const hero = root.closest(".hero-v2");
    if (!hero) return;

    const svg = make("svg", { class: "ckt-svg", "aria-hidden": "true" });
    root.appendChild(svg);

    const st = {
      root, hero, svg,
      pulses: [], drawn: false, raf: 0, t: 0,
      mouse: { x: 0, y: 0 }, px: 0, py: 0,
      listeners: [], portrait: null,
    };

    build(st);

    if (!REDUCED) {
      const onMouse = (e) => {
        st.mouse.x = e.clientX / window.innerWidth - 0.5;
        st.mouse.y = e.clientY / window.innerHeight - 0.5;
      };
      window.addEventListener("mousemove", onMouse, { passive: true });
      st.listeners.push([window, "mousemove", onMouse]);

      // hovering the portrait sends a signal back down the bus
      if (st.portrait) {
        const onEnter = () => st.pulses[1] && st.pulses[1].fire(true);
        st.portrait.addEventListener("mouseenter", onEnter);
        st.listeners.push([st.portrait, "mouseenter", onEnter]);
      }

      const loop = (now) => {
        st.raf = requestAnimationFrame(loop);
        const dt = Math.min(now - (st.t || now), 50);
        st.t = now;
        st.pulses.forEach((p) => p.step(dt));
        st.px += (st.mouse.x * -7 - st.px) * 0.04;
        st.py += (st.mouse.y * -5 - st.py) * 0.04;
        svg.style.transform = `translate(${st.px.toFixed(2)}px, ${st.py.toFixed(2)}px)`;
      };
      st.raf = requestAnimationFrame(loop);
    }

    let timer = 0;
    const rebuild = () => { clearTimeout(timer); timer = setTimeout(() => state === st && build(st), 150); };
    const ro = new ResizeObserver(rebuild);
    ro.observe(hero);
    st.ro = ro;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);

    state = st;
  }

  function unmount() {
    const st = state;
    if (!st) return;
    state = null;
    if (st.raf) cancelAnimationFrame(st.raf);
    st.ro && st.ro.disconnect();
    st.listeners.forEach(([target, type, fn]) => target.removeEventListener(type, fn));
    st.svg.remove();
  }

  // React owns the DOM — poll for the mount point coming and going with routes
  setInterval(() => {
    const root = document.getElementById("hero-circuit");
    if (root && !state) mount(root);
    else if (state && !state.root.isConnected) unmount();
  }, 400);
})();
