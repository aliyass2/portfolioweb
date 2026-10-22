"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { sections, type DiagramKind, type SectionId } from "@/content/site";

export type TerminalView = "expanded" | "collapsed" | "hidden";
export type Active = "top" | SectionId;

type Ctx = {
  active: Active; // section currently under the nav (scroll-spy)
  view: TerminalView; // docked terminal preference
  setView: (v: TerminalView) => void;
  openSignal: number; // bumps on ⌘K / nav chip; terminal focuses on change
  openTerminal: () => void;
  diagramSignal: { kind: DiagramKind | null; n: number }; // bumps to replay a diagram
  playDiagram: (kind: DiagramKind) => void;
};

const ConsoleContext = createContext<Ctx | null>(null);

export const useConsole = () => {
  const ctx = useContext(ConsoleContext);
  if (!ctx) throw new Error("useConsole outside ConsoleProvider");
  return ctx;
};

const STORAGE_KEY = "terminal:state";

function readStoredView(): TerminalView | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "expanded" || v === "collapsed" || v === "hidden" ? v : null;
  } catch {
    return null;
  }
}

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<Active>("top");
  const [view, setViewState] = useState<TerminalView>("collapsed");
  const [openSignal, setOpenSignal] = useState(0);
  const [diagramSignal, setDiagramSignal] = useState<Ctx["diagramSignal"]>({ kind: null, n: 0 });

  // Restore preference; below 1280px the dock defaults to collapsed.
  useEffect(() => {
    const stored = readStoredView();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
    setViewState(stored ?? (window.innerWidth >= 1280 ? "expanded" : "collapsed"));
  }, []);

  const setView = useCallback((v: TerminalView) => {
    setViewState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {}
  }, []);

  const openTerminal = useCallback(() => {
    setView("expanded");
    setOpenSignal((n) => n + 1);
  }, [setView]);

  const playDiagram = useCallback(
    (kind: DiagramKind) => setDiagramSignal((s) => ({ kind, n: s.n + 1 })),
    [],
  );

  // Scroll-spy: the active section is the last one whose top has passed
  // a line just below the sticky nav.
  useEffect(() => {
    const ids: Active[] = ["top", ...sections.map((s) => s.id)];
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = 120;
      let current: Active = "top";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // at the very bottom, the last section wins even if it is short
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4)
        current = ids[ids.length - 1];
      setActive(current);
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

  // ⌘K / Ctrl+K brings the terminal back expanded and focused.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openTerminal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openTerminal]);

  const value = useMemo(
    () => ({ active, view, setView, openSignal, openTerminal, diagramSignal, playDiagram }),
    [active, view, setView, openSignal, openTerminal, diagramSignal, playDiagram],
  );
  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}
