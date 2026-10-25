"use client";

import { useEffect, useRef } from "react";

// Full-bleed hero background: a routed network with events (packets) moving
// hop to hop. The cursor lights nearby nodes and injects traffic; every
// terminal command fires a burst ("console:event"). Canvas 2D, paused when
// off screen or the tab is hidden; reduced motion draws one still frame.

type Node = { x: number; y: number; n: number[] };
type Packet = { a: number; b: number; t: number; speed: number; hops: number };

const C = {
  edge: "31, 40, 51", // line
  node: "42, 53, 66", // line-2
  accent: "240, 162, 59",
};

export const CONSOLE_EVENT = "console:event";

function build(w: number, h: number): Node[] {
  const cell = w < 700 ? 64 : 92;
  const nodes: Node[] = [];
  // deterministic jitter so the layout is stable across resizes
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = cell / 2; y < h + cell; y += cell)
    for (let x = cell / 2; x < w + cell; x += cell)
      if (rand() > 0.22)
        nodes.push({ x: x + (rand() - 0.5) * cell * 0.8, y: y + (rand() - 0.5) * cell * 0.8, n: [] });
  // link each node to its 2-3 nearest neighbours
  nodes.forEach((p, i) => {
    const near = nodes
      .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, rand() > 0.5 ? 3 : 2);
    for (const { j } of near) {
      if (!p.n.includes(j)) p.n.push(j);
      if (!nodes[j].n.includes(i)) nodes[j].n.push(i);
    }
  });
  return nodes;
}

export function EventField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    const heat: number[] = []; // per-node glow, decays each frame
    const pointer = { x: -1e4, y: -1e4, active: false };
    let frame = 0;
    let visible = true;
    let lastSpawn = 0;
    let lastDraw = 0;
    let ready = false; // animation waits until the page is idle after load
    const minFrame = window.matchMedia("(max-width: 899px)").matches ? 1000 / 30 : 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // soft decoration: 1.5x is plenty and keeps fill-rate cheap on phones
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = build(w, h);
      packets = [];
      heat.length = 0;
      nodes.forEach(() => heat.push(0));
      if (reduced) draw(0);
    };

    const nearest = (x: number, y: number) => {
      let best = 0;
      let bd = Infinity;
      nodes.forEach((p, i) => {
        const d = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    };

    const spawn = (from?: number, hops = 2 + Math.floor(Math.random() * 3)) => {
      if (!nodes.length) return;
      const a = from ?? Math.floor(Math.random() * nodes.length);
      const ns = nodes[a].n;
      if (!ns.length) return;
      const b = ns[Math.floor(Math.random() * ns.length)];
      packets.push({ a, b, t: 0, speed: 0.012 + Math.random() * 0.01, hops });
      heat[a] = 1;
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      // ambient + cursor-driven traffic
      const interval = pointer.active ? 90 : 260;
      if (!reduced && now - lastSpawn > interval && packets.length < 70) {
        lastSpawn = now;
        spawn(pointer.active && Math.random() < 0.7 ? nearest(pointer.x, pointer.y) : undefined);
      }

      // edges
      ctx.lineWidth = 1;
      nodes.forEach((p, i) => {
        for (const j of p.n) {
          if (j < i) continue;
          const q = nodes[j];
          const mx = (p.x + q.x) / 2;
          const my = (p.y + q.y) / 2;
          const near = Math.max(0, 1 - Math.hypot(mx - pointer.x, my - pointer.y) / 220);
          ctx.strokeStyle = near > 0 ? `rgba(${C.accent}, ${0.05 + near * 0.22})` : `rgba(${C.edge}, 0.9)`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      });

      // nodes
      nodes.forEach((p, i) => {
        const near = Math.max(0, 1 - Math.hypot(p.x - pointer.x, p.y - pointer.y) / 180);
        const glow = Math.max(heat[i], near * 0.8);
        heat[i] *= 0.94;
        if (glow > 0.05) {
          ctx.fillStyle = `rgba(${C.accent}, ${glow * 0.18})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4 + glow * 8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = glow > 0.05 ? `rgba(${C.accent}, ${0.35 + glow * 0.65})` : `rgba(${C.node}, 1)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 + glow * 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // packets: short streak along the edge. The glow is a wide translucent
      // stroke under a thin bright one; shadowBlur is far too slow here.
      ctx.save();
      ctx.lineCap = "round";
      const next: Packet[] = [];
      for (const k of packets) {
        if (!reduced) k.t += k.speed;
        const p = nodes[k.a];
        const q = nodes[k.b];
        if (!p || !q) continue;
        const t = Math.min(k.t, 1);
        const tail = Math.max(0, t - 0.18);
        ctx.beginPath();
        ctx.moveTo(p.x + (q.x - p.x) * tail, p.y + (q.y - p.y) * tail);
        ctx.lineTo(p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t);
        ctx.lineWidth = 7;
        ctx.strokeStyle = `rgba(${C.accent}, 0.16)`;
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(${C.accent}, 0.95)`;
        ctx.stroke();
        if (k.t >= 1) {
          heat[k.b] = 1;
          if (k.hops > 1) {
            const choices = nodes[k.b].n.filter((j) => j !== k.a);
            if (choices.length)
              next.push({ ...k, a: k.b, b: choices[Math.floor(Math.random() * choices.length)], t: 0, hops: k.hops - 1 });
          }
        } else next.push(k);
      }
      packets = next;
      ctx.restore();
    };

    const loop = (now: number) => {
      frame = 0;
      if (now - lastDraw >= minFrame) {
        lastDraw = now;
        draw(now);
      }
      if (visible && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (ready && !reduced && !frame) frame = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = pointer.y >= 0 && pointer.y <= r.height && e.pointerType === "mouse";
      if (reduced && pointer.active) draw(0);
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e4;
      pointer.active = false;
    };
    // a terminal command: burst of events out of the node nearest the terminal
    const onConsole = (e: Event) => {
      const origin = (e as CustomEvent<{ x: number; y: number }>).detail;
      const r = canvas.getBoundingClientRect();
      const from = origin ? nearest(origin.x - r.left, origin.y - r.top) : undefined;
      for (let i = 0; i < 6; i++) spawn(from, 3 + Math.floor(Math.random() * 3));
      start();
    };

    resize();
    if (reduced) {
      // a few frozen packets so the still frame reads as traffic
      for (let i = 0; i < 14; i++) spawn();
      packets.forEach((k) => (k.t = 0.3 + Math.random() * 0.6));
      draw(0);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const onVis = () => !document.hidden && start();
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener(CONSOLE_EVENT, onConsole);
    document.addEventListener("visibilitychange", onVis);
    // one still frame now; motion once the main thread is free
    draw(0);
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200));
    const begin = () => {
      ready = true;
      start();
    };
    const idleId = idle(begin, { timeout: 2500 });
    return () => {
      ready = false;
      (window.cancelIdleCallback ?? clearTimeout)(idleId as number);
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener(CONSOLE_EVENT, onConsole);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />;
}
