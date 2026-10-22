// Phone-only hero panel: the outbox flow, in place of the inline terminal.
const nodes = [
  { label: "API", round: false, hot: false },
  { label: "OUTBOX", round: false, hot: true },
  { label: "BROKER", round: true, hot: false },
  { label: "WORKER", round: false, hot: false },
];

const log: [string, string, string?][] = [
  ["12.006", "outbox.append ", "idem=7f3a"],
  ["12.058", "inbox.dedupe → Submitted → Reviewed"],
  ["12.061", "trace 54ms · 0 retries"],
];

export function EventFlow() {
  return (
    <figure
      aria-label="Event flow: API writes to the outbox, the broker relays, the worker consumes"
      className="overflow-hidden rounded-panel border border-line bg-surface font-mono"
    >
      <div className="flex justify-between border-b border-line px-3 py-2.5 text-[10px] tracking-[0.1em] text-muted">
        <span>EVENT FLOW</span>
        <span className="text-accent">● LIVE</span>
      </div>
      <div className="flex items-center justify-between gap-1 px-3.5 py-[22px]">
        {nodes.map((n, i) => (
          <div key={n.label} className="contents">
            {i > 0 && <div className="h-px flex-1 bg-line-2" />}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`size-10 border ${n.round ? "rounded-full" : "rounded-[5px]"} ${
                  n.hot ? "border-accent bg-accent/10" : "border-line-2 bg-raised"
                }`}
              />
              <div className={`text-[9px] ${n.hot ? "text-accent" : "text-muted"}`}>{n.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col border-t border-line px-3.5 py-3 text-[10.5px] leading-[1.7] text-muted">
        {log.map(([t, msg, hot]) => (
          <div key={t}>
            <span>{t}</span> <span className="text-text">{msg}</span>
            {hot && <span className="text-accent">{hot}</span>}
          </div>
        ))}
      </div>
    </figure>
  );
}
