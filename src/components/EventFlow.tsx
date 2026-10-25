"use client";

import { useScenario } from "./diagrams/useScenario";

// Phone-only hero panel: one event walking the outbox flow, looped while
// visible, in place of the inline terminal.
const nodes = [
  { label: "API", round: false },
  { label: "OUTBOX", round: false },
  { label: "BROKER", round: true },
  { label: "WORKER", round: false },
];

// [timestamp, message, highlighted suffix, step at which the line appears]
const log: [string, string, string, number][] = [
  ["12.006", "outbox.append ", "idem=7f3a", 1],
  ["12.058", "inbox.dedupe → Submitted → Reviewed", "", 3],
  ["12.061", "trace 54ms · 0 retries", "", 4],
];

const STEPS = [600, 700, 700, 700] as const;

export function EventFlow() {
  const { ref, step, final } = useScenario(STEPS, { loop: true, loopPause: 1800 });
  const hot = step >= 0 && step < final ? step : -1;
  return (
    <figure
      ref={ref}
      aria-label="Event flow: API writes to the outbox, the broker relays, the worker consumes"
      className="overflow-hidden rounded-panel border border-line bg-surface font-mono"
    >
      <div className="flex justify-between border-b border-line px-3 py-2.5 text-[10px] tracking-[0.1em] text-muted">
        <span>EVENT FLOW</span>
        <span className="text-accent">● LIVE</span>
      </div>
      <div className="flex items-center justify-between gap-1 px-3.5 py-[22px]" aria-hidden>
        {nodes.map((n, i) => (
          <div key={n.label} className="contents">
            {i > 0 && (
              <div className="relative h-px flex-1 bg-line-2">
                <div
                  className={`absolute inset-0 origin-left bg-accent transition-transform duration-500 ${
                    step >= i ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </div>
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`size-10 border transition-colors duration-300 ${n.round ? "rounded-full" : "rounded-[5px]"} ${
                  i === hot ? "border-accent bg-accent/10" : "border-line-2 bg-raised"
                }`}
              />
              <div
                className={`text-[9px] transition-colors duration-300 ${i === hot ? "text-accent" : "text-muted"}`}
              >
                {n.label}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col border-t border-line px-3.5 py-3 text-[10.5px] leading-[1.7] text-muted">
        {log.map(([t, msg, suffix, at]) => (
          <div
            key={t}
            className={step >= at ? "visible" : "invisible"}
          >
            <span>{t}</span> <span className="text-text">{msg}</span>
            {suffix && <span className="text-accent">{suffix}</span>}
          </div>
        ))}
      </div>
    </figure>
  );
}
