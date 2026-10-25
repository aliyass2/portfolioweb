"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The message bus: a line down the left gutter of everything below the hero.
 * Its glowing head follows the scroll; each `[data-port]` element inside the
 * same parent is a port on the bus. When the head passes a port, the port
 * lights and the element gets `data-landed`, which reveals its
 * `[data-reveal]` children (CSS in globals.css). Updates go straight to the
 * DOM, so scrolling never re-renders React.
 */
export function Bus() {
  const busRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [ports, setPorts] = useState<number[]>([]);

  useEffect(() => {
    const bus = busRef.current;
    const host = bus?.parentElement;
    if (!bus || !host) return;
    let targets: HTMLElement[] = [];
    let ys: number[] = [];
    let frame = 0;

    const measure = () => {
      targets = [...host.querySelectorAll<HTMLElement>("[data-port]")];
      const top = host.getBoundingClientRect().top + window.scrollY;
      // a port sits level with its section's eyebrow (or the element's top)
      ys = targets.map((el) => {
        const anchor = el.querySelector<HTMLElement>("[data-port-anchor]") ?? el;
        const r = anchor.getBoundingClientRect();
        return r.top + window.scrollY - top + Math.min(r.height / 2, 10);
      });
      setPorts(ys);
      update();
    };

    const update = () => {
      frame = 0;
      const hostTop = host.getBoundingClientRect().top + window.scrollY;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const head = atBottom
        ? host.offsetHeight
        : Math.max(0, Math.min(host.offsetHeight, window.scrollY + window.innerHeight * 0.62 - hostTop));
      if (fillRef.current) fillRef.current.style.height = `${head}px`;
      if (headRef.current) {
        headRef.current.style.transform = `translateY(${head}px)`;
        headRef.current.style.opacity = head > 0 && head < host.offsetHeight ? "1" : "0";
      }
      ys.forEach((y, i) => {
        const landed = head >= y;
        targets[i]?.toggleAttribute("data-landed", landed);
        bus.querySelector(`[data-port-dot="${i}"]`)?.toggleAttribute("data-landed", landed);
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // measure after layout settles (and again once web fonts swap in)
    frame = requestAnimationFrame(measure);
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(host);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={busRef}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 z-20 w-px left-[max(8px,calc((100%-1200px)/2+8px))]"
    >
      <div className="absolute inset-0 bg-line" />
      <div ref={fillRef} className="absolute top-0 left-0 w-px bg-accent/45" />
      <div
        ref={headRef}
        className="absolute -top-[3px] -left-[3px] size-[7px] rounded-full bg-accent opacity-0 shadow-[0_0_10px_2px_rgba(240,162,59,0.7),0_0_28px_6px_rgba(240,162,59,0.25)]"
      />
      {ports.map((y, i) => (
        <div
          key={i}
          data-port-dot={i}
          className="bus-port absolute -left-[4px] size-[9px] rounded-full border border-line-2 bg-ground"
          style={{ top: y - 4.5 }}
        />
      ))}
    </div>
  );
}
