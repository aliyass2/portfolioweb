"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConsole } from "@/components/ConsoleProvider";
import type { DiagramKind } from "@/content/site";

/**
 * Steps a diagram through a scripted run. `durations[i]` is how long step i
 * lasts; step === durations.length is the resting final state, which is also
 * what the server renders and what reduced-motion users see. Step -1 is the
 * blank frame before a run starts.
 *
 * Plays once when first scrolled into view, whenever the terminal asks for
 * this diagram (`kind`), and on replay(). With `loop`, repeats while visible.
 */
export function useScenario(
  durations: readonly number[],
  { kind, loop = false, loopPause = 1600 }: { kind?: DiagramKind; loop?: boolean; loopPause?: number } = {},
) {
  const final = durations.length;
  const [step, setStep] = useState(final);
  const ref = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const inView = useRef(false);
  const playRef = useRef<(delay?: number) => void>(() => {});
  const { diagramSignal } = useConsole();

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const play = useCallback(
    (delay = 0) => {
      clear();
      const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        at(0, () => setStep(final));
        return;
      }
      at(delay, () => setStep(-1));
      // one blank frame so CSS transitions start from zero
      let t = delay + 60;
      at(t, () => setStep(0));
      durations.forEach((d, i) => {
        t += d;
        at(t, () => setStep(i + 1));
      });
      if (loop) at(t + loopPause, () => inView.current && playRef.current());
    },
    [durations, final, loop, loopPause],
  );

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  // First time in view: play. For loops, resume whenever it comes back.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let played = false;
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        if (e.isIntersecting && (!played || loop)) {
          played = true;
          play(250);
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [play, loop]);

  // Terminal-triggered replay; wait for the smooth scroll to land.
  useEffect(() => {
    if (kind && diagramSignal.kind === kind && diagramSignal.n) play(500);
  }, [diagramSignal, kind, play]);

  useEffect(() => clear, []);

  return { ref, step, final, running: step < final, replay: () => play() };
}
