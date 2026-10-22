"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useConsole } from "@/components/ConsoleProvider";
import {
  complete,
  cwdLabel,
  run,
  type Cwd,
  type Effect,
  type Line,
} from "@/content/fs";
import { usePrefersReducedMotion, useMediaQuery } from "./hooks";

const MAX_LINES = 14;
const QUICK = ["work", "approach", "stack", "contact", "trace"];
const INTRO: Line[] = [
  { text: "portfolio v3.0 · .NET backend · Baghdad", tone: "muted" },
  { text: "try: ls · cd work · cd about · help", tone: "muted" },
  { text: "", tone: "muted" },
];

const toneClass = { text: "text-text", muted: "text-muted", accent: "text-accent" };

type Placement = "hero" | "docked";

/**
 * One terminal, rendered once inside the hero slot. When the slot scrolls out
 * of view it switches to position:fixed (docked), so history and cwd survive.
 * On phones it is always docked, as a bottom bar.
 */
export function Terminal() {
  const { active, view, setView, openSignal, openTerminal, playDiagram } = useConsole();
  const reducedMotion = usePrefersReducedMotion();
  const isPhone = useMediaQuery("(max-width: 899px)");

  const [lines, setLines] = useState<Line[]>(INTRO);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState<Cwd>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const [heroVisible, setHeroVisible] = useState(true);

  const slotRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const typedByUser = useRef(false);
  const spyPausedUntil = useRef(0);
  const inputId = useId();

  const placement: Placement = isPhone || !heroVisible ? "docked" : "hero";

  // Hero slot visibility decides hero vs docked.
  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // cwd follows scroll position, unless a `cd` scroll is in flight.
  useEffect(() => {
    if (Date.now() < spyPausedUntil.current) return;
    setCwd((cur) => {
      const top = cur[0] ?? "top";
      if (top === active) return cur;
      return active === "top" ? [] : [active];
    });
  }, [active]);

  const applyEffect = useCallback(
    (effect: Effect) => {
      if (effect.type === "clear") return;
      if (effect.type === "open") {
        window.open(effect.href, "_blank", "noopener");
        return;
      }
      const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
      if (effect.type === "play") {
        // cwd keeps following the scroll here; only `cd` pins it
        document.getElementById(effect.anchor)?.scrollIntoView({ behavior, block: "center" });
        playDiagram(effect.diagram);
        return;
      }
      spyPausedUntil.current = Date.now() + 1200;
      if (effect.anchor === "top") {
        window.scrollTo({ top: 0, behavior });
        return;
      }
      const el = document.getElementById(effect.anchor);
      if (!el) return;
      el.scrollIntoView({ behavior, block: "start" });
      if (effect.highlight) {
        el.dataset.highlight = "on";
        setTimeout(() => delete el.dataset.highlight, 1500);
      }
    },
    [reducedMotion, playDiagram],
  );

  const submit = useCallback(
    (raw: string) => {
      const result = run(raw, cwd);
      const echo: Line = { text: `➜ ${cwdLabel(cwd)} ${raw}`.trimEnd(), tone: "text" };
      setLines((prev) =>
        result.effect?.type === "clear"
          ? []
          : [...prev, echo, ...result.lines].slice(-MAX_LINES),
      );
      setCwd(result.cwd);
      setInput("");
      setHistIdx(null);
      if (raw.trim()) setHistory((h) => [...h, raw.trim()].slice(-50));
      if (result.effect) applyEffect(result.effect);
    },
    [cwd, applyEffect],
  );

  // On load the hero terminal types `ls` by itself, so it is visibly alive.
  useEffect(() => {
    // read media directly: the hooks report false until after hydration
    if (window.matchMedia("(max-width: 899px)").matches) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const cmd = "ls";
    // reduced motion: print the listing, skip the typing
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timers.push(setTimeout(() => submit(cmd), 0));
      return () => timers.forEach(clearTimeout);
    }
    const start = 700;
    [...cmd].forEach((_, i) =>
      timers.push(
        setTimeout(() => !typedByUser.current && setInput(cmd.slice(0, i + 1)), start + i * 40),
      ),
    );
    timers.push(
      setTimeout(() => !typedByUser.current && submit(cmd), start + cmd.length * 40 + 220),
    );
    return () => timers.forEach(clearTimeout);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⌘K / nav chip: focus the prompt once it is rendered.
  useEffect(() => {
    if (!openSignal) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [openSignal]);

  // Keep the newest output in view.
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, placement, view]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    typedByUser.current = true;
    if (e.key === "Enter") {
      submit(input);
    } else if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      const i = histIdx === null ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      if (histIdx === null) return;
      e.preventDefault();
      const i = histIdx + 1;
      if (i >= history.length) {
        setHistIdx(null);
        setInput("");
      } else {
        setHistIdx(i);
        setInput(history[i]);
      }
    } else if (e.key === "Tab" && input.trim()) {
      // empty prompt: let Tab move focus as usual
      e.preventDefault();
      setInput(complete(input, cwd));
    } else if (e.key === "Escape" && placement === "docked") {
      setView("collapsed");
    }
  };

  const label = cwdLabel(cwd);

  const output = (
    <div
      ref={outputRef}
      aria-live="polite"
      className="flex flex-col gap-0.5 overflow-y-auto"
    >
      {lines.map((l, i) => (
        <div key={i} className={`whitespace-pre-wrap break-words ${toneClass[l.tone]}`}>
          {l.text || " "}
        </div>
      ))}
    </div>
  );

  const prompt = (
    <div className="flex items-center gap-2 rounded-chip pt-1.5 focus-within:outline focus-within:outline-1 focus-within:outline-offset-2 focus-within:outline-accent">
      <label htmlFor={inputId} className="text-accent">
        ➜
      </label>
      <span className="text-muted">{label}</span>
      <input
        ref={inputRef}
        id={inputId}
        aria-label="Portfolio command line"
        value={input}
        onChange={(e) => {
          typedByUser.current = true;
          setInput(e.target.value);
        }}
        onKeyDown={onKeyDown}
        placeholder="help"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className="h-8 min-w-0 flex-1 bg-transparent text-text caret-accent outline-none placeholder:text-dim focus-visible:outline-none"
      />
    </div>
  );

  const iconButton = "h-7 w-8 rounded-[3px] text-[13px] text-muted hover:text-accent";

  const chips = (
    <div className="flex flex-wrap gap-1.5 border-t border-line px-3.5 py-2.5 text-[10.5px] tracking-[0.06em]">
      {QUICK.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => submit(c)}
          className="min-h-7 rounded-[3px] border border-line px-2.5 py-1.5 text-muted hover:border-line-2 hover:text-accent"
        >
          {c}
        </button>
      ))}
    </div>
  );

  let body: React.ReactNode = null;
  if (placement === "hero") {
    body = (
      <div className="flex min-h-[420px] flex-col overflow-hidden rounded-panel border border-line bg-surface font-mono">
        <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5 text-[11px] tracking-[0.1em] text-muted">
          <span className="flex items-center gap-2" aria-hidden>
            <span className="size-2 rounded-full bg-line-2" />
            <span className="size-2 rounded-full bg-line-2" />
            <span className="size-2 rounded-full bg-accent" />
          </span>
          <span>ali@portfolio — zsh</span>
          <span>type help</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-end p-4 text-[12.5px] leading-[1.75]">
          {output}
          {prompt}
        </div>
        {chips}
      </div>
    );
  } else if (view === "collapsed") {
    body = (
      <button
        type="button"
        onClick={openTerminal}
        className={
          "fixed z-40 flex h-10 items-center gap-2.5 border border-line-2 bg-surface px-3.5 font-mono text-xs text-muted hover:border-accent motion-safe:animate-dock " +
          (isPhone
            ? "inset-x-0 bottom-0 h-12 rounded-none border-x-0 border-b-0 px-5"
            : "right-7 bottom-7 rounded-[20px]")
        }
      >
        <span className="sr-only">Open terminal, current directory</span>
        <span className="size-[7px] rounded-full bg-accent" aria-hidden />
        <span className="text-accent" aria-hidden>➜</span>
        <span>{label}</span>
        <span className="pl-1.5 text-[10.5px] tracking-[0.06em]">
          {isPhone ? "tap to open" : "⌘K"}
        </span>
      </button>
    );
  } else if (view === "expanded") {
    body = (
      <section
        aria-label="Terminal"
        className={
          "fixed z-40 flex flex-col overflow-hidden border border-line-2 bg-surface font-mono motion-safe:animate-dock " +
          (isPhone
            ? "inset-x-0 bottom-0 max-h-[60vh] border-x-0 border-b-0"
            : "right-7 bottom-7 w-[460px] max-w-[calc(100vw-56px)] rounded-panel")
        }
      >
        <div className="flex items-center justify-between border-b border-line py-2 pr-2.5 pl-3.5 text-[11px] tracking-[0.1em] text-muted">
          <span className="flex items-center gap-2">
            <span className="size-[7px] rounded-full bg-accent" aria-hidden />
            ali@portfolio
          </span>
          <span className="flex gap-1">
            <button
              type="button"
              aria-label="Collapse terminal"
              onClick={() => setView("collapsed")}
              className={iconButton}
            >
              —
            </button>
            <button
              type="button"
              aria-label="Hide terminal"
              onClick={() => setView("hidden")}
              className={iconButton}
            >
              ✕
            </button>
          </span>
        </div>
        <div className="flex max-h-[260px] min-h-0 flex-col px-3.5 py-3 text-xs leading-[1.7]">
          {output}
          {prompt}
        </div>
        {isPhone && chips}
      </section>
    );
  }

  // The slot holds the hero's space so docking causes no layout shift.
  return (
    <div ref={slotRef} className="md:min-h-[420px]">
      {body}
    </div>
  );
}
