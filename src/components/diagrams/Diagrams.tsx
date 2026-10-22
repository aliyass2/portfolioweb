"use client";

import type { DiagramKind } from "@/content/site";
import { useScenario } from "./useScenario";

// Each diagram runs a short script that explains the pattern, ending on a
// resting state that reads on its own (and is what the server renders).

function Frame({
  frameRef,
  replay,
  running,
  label,
  status,
  children,
}: {
  frameRef: React.RefObject<HTMLDivElement | null>;
  replay: () => void;
  running: boolean;
  label: string;
  status: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={frameRef}
      className="relative flex flex-col justify-between gap-4 rounded-panel border border-line bg-ground px-5 pt-8 pb-3.5 sm:px-6"
    >
      <div role="img" aria-label={label} className="flex min-h-[88px] flex-col justify-center">
        {children}
      </div>
      {/* two-line slot: status text wraps instead of truncating or jumping */}
      <div
        aria-hidden
        className="min-h-[47px] border-t border-line pt-3 font-mono text-[10.5px] leading-[1.6] text-muted"
      >
        {status}
      </div>
      <button
        type="button"
        onClick={replay}
        disabled={running}
        aria-label={`Replay: ${label}`}
        className="absolute top-1.5 right-1.5 min-h-7 rounded-[3px] px-2 font-mono text-[10.5px] tracking-[0.06em] text-muted hover:text-accent disabled:opacity-0"
      >
        ↻ replay
      </button>
    </div>
  );
}

const monoLabel = "w-[52px] shrink-0 font-mono text-[10px] text-muted";

// ── Make state explicit ───────────────────────────────────────────────────

const FSM_STATES = ["DRAFT", "SUBMITTED", "REVIEW", "APPROVED"];
const FSM_STEPS = [700, 800, 800, 900] as const;
const FSM_LOG = [
  "new()       → DRAFT",
  "submit()    DRAFT → SUBMITTED",
  "assign()    SUBMITTED → REVIEW",
  "approve()   guard ok · REVIEW → APPROVED",
  "audit: 3 transitions, 3 rows written",
];

export function FsmStrip() {
  const { ref, replay, running, ...s } = useScenario(FSM_STEPS, { kind: "fsm" });
  const current = s.step < 0 ? -1 : Math.min(s.step, FSM_STATES.length - 1);
  return (
    <Frame
      frameRef={ref}
      replay={replay}
      running={running}
      label="State machine: a request moves Draft, Submitted, Review, Approved; every transition is recorded"
      status={s.step >= 0 ? FSM_LOG[s.step] : " "}
    >
      <div className="flex items-center gap-1.5">
        {FSM_STATES.map((name, i) => (
          <div key={name} className="contents">
            {i > 0 && (
              <div className="relative h-px min-w-1 flex-1 bg-line-2">
                <div
                  className={`absolute inset-0 origin-left bg-accent transition-transform duration-500 ${
                    i <= current ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </div>
            )}
            <div
              className={`rounded-chip border px-2 py-2 font-mono text-[10px] transition-colors duration-300 lg:px-2.5 ${
                i === current
                  ? "border-accent text-accent"
                  : i < current
                    ? "border-line-2 text-text"
                    : "border-line-2 text-muted"
              }`}
            >
              {name}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

// ── Write once, deliver reliably ─────────────────────────────────────────

const OUTBOX_STEPS = [500, 1000, 1500] as const;
const OUTBOX_LOG = [
  "begin tx",
  "commit: row + event, one tx",
  "relay ✕ broker down · event kept",
  "retry → delivered · consumer dedupes",
];

export function OutboxBars() {
  const { ref, replay, running, ...s } = useScenario(OUTBOX_STEPS, { kind: "outbox" });
  const committed = s.step >= 1;
  const crashed = s.step === 2;
  const delivered = s.step >= 3;
  const publishWidth = delivered ? 38 : crashed ? 16 : 0;
  const rows = [
    { label: "DB TX", width: committed ? 62 : 0, from: 0, color: "bg-accent" },
    { label: "OUTBOX", width: committed ? 62 : 0, from: 0, color: "bg-accent" },
    {
      label: "PUBLISH",
      width: publishWidth,
      from: 62,
      color: delivered ? "bg-accent" : "bg-dim",
    },
  ];
  return (
    <Frame
      frameRef={ref}
      replay={replay}
      running={running}
      label="Outbox relay: data and event commit in one transaction; when the relay fails the event stays in the outbox and is published on retry"
      status={s.step >= 0 ? OUTBOX_LOG[s.step] : " "}
    >
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <div className={monoLabel}>{r.label}</div>
            <div className="relative h-1.5 flex-1 rounded-[3px] bg-line">
              <div
                className={`h-full rounded-[3px] ${r.color} ${s.step >= 0 ? "transition-[width,background-color] duration-700 ease-out" : ""}`}
                style={{ marginLeft: `${r.from}%`, width: `${r.width}%` }}
              />
              {r.label === "PUBLISH" && crashed && (
                <span
                  className="absolute -top-[5px] font-mono text-[10px] leading-none text-text"
                  style={{ left: `calc(${r.from + publishWidth}% + 4px)` }}
                >
                  ✕
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

// ── If it isn't traced, it isn't done ────────────────────────────────────

// Spans in % of the request; 1% ≈ 20ms of animation.
const SPANS = [
  { label: "api", from: 0, width: 90, hot: false },
  { label: "auth", from: 4, width: 18, hot: false },
  { label: "db", from: 26, width: 46, hot: true },
  { label: "publish", from: 76, width: 10, hot: false },
];
const MS_PER_PCT = 20;
// step boundaries line up with each span's start, then the summary
const TRACE_STEPS = [80, 440, 1000, 380] as const;
const TRACE_LOG = [
  "POST /applications",
  "auth.validate  3ms",
  "db.tx insert + outbox.append  21ms",
  "publish rabbitmq  4ms",
  "202 · 54ms · slowest span: db.tx",
];

export function TraceWaterfall() {
  const { ref, replay, running, ...s } = useScenario(TRACE_STEPS, { kind: "trace" });
  return (
    <Frame
      frameRef={ref}
      replay={replay}
      running={running}
      label="Trace waterfall: an api span containing auth, db (the slowest) and publish spans"
      status={
        s.step >= 0 ? (
          <span className={s.step === s.final ? "text-accent" : ""}>{TRACE_LOG[s.step]}</span>
        ) : (
          " "
        )
      }
    >
      <div className="flex flex-col gap-2">
        {SPANS.map((sp) => (
          <div key={sp.label} className="flex items-center gap-2">
            <div className={monoLabel}>{sp.label}</div>
            <div className="flex-1">
              <div
                className={`h-1.5 rounded-[3px] ${sp.hot ? "bg-accent" : "bg-line-2"} ${s.step >= 0 ? "transition-[width] ease-linear" : ""}`}
                style={{
                  marginLeft: `${sp.from}%`,
                  width: s.step >= 0 ? `${sp.width}%` : 0,
                  transitionDuration: `${sp.width * MS_PER_PCT}ms`,
                  transitionDelay: `${sp.from * MS_PER_PCT}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

const diagrams: Record<DiagramKind, () => React.ReactNode> = {
  fsm: FsmStrip,
  outbox: OutboxBars,
  trace: TraceWaterfall,
};

// Server components can only pass props across the client boundary, so pick
// the diagram here rather than exporting the map.
export function Diagram({ kind }: { kind: DiagramKind }) {
  const Component = diagrams[kind];
  return <Component />;
}
