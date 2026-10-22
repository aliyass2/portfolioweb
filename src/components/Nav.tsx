"use client";

import { useEffect, useState } from "react";
import { profile, sections } from "@/content/site";
import { useConsole } from "./ConsoleProvider";

export function Nav() {
  const { active, openTerminal } = useConsole();
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ground">
      {progress > 0 && (
        <div
          aria-hidden
          className="absolute top-0 left-0 h-0.5 bg-accent"
          style={{ width: `${progress * 100}%` }}
        />
      )}
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-5 md:h-16 md:px-8">
        <a href="#top" className="text-sm font-semibold tracking-[0.02em] md:text-[15px]">
          ALI YASS
        </a>
        <div className="hidden items-center gap-2.5 font-mono text-xs tracking-[0.06em] text-muted lg:flex">
          <span className="size-2 rounded-full bg-accent" aria-hidden />
          <span>{profile.status}</span>
        </div>
        <nav aria-label="Sections" className="hidden items-center gap-7 text-sm md:flex">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={active === s.id ? "text-text" : "text-muted"}
            >
              {s.label}
            </a>
          ))}
          <button
            type="button"
            onClick={openTerminal}
            aria-label="Open terminal (Command K)"
            className="rounded-[3px] border border-line px-2 py-1 font-mono text-[10.5px] tracking-[0.06em] text-dim hover:border-line-2 hover:text-accent"
          >
            ⌘K
          </button>
        </nav>
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex size-11 flex-col items-end justify-center gap-[5px] md:hidden"
        >
          <span className="h-[1.5px] w-5 bg-text" />
          <span className="h-[1.5px] w-3.5 bg-text" />
        </button>
      </div>
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Sections"
          className="flex flex-col border-t border-line px-5 py-2 md:hidden"
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-11 items-center ${active === s.id ? "text-text" : "text-muted"}`}
            >
              {s.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openTerminal();
            }}
            className="flex min-h-11 items-center font-mono text-sm text-muted"
          >
            <span className="mr-2 text-accent">➜</span>terminal
          </button>
        </nav>
      )}
    </header>
  );
}
