import { approachHeading, principles, type DiagramKind } from "@/content/site";
import { Eyebrow, H2, sectionPad, wrap } from "./ui";

export function Approach() {
  return (
    <section id="approach" className="scroll-mt-16 border-t border-line bg-surface">
      <div className={`${wrap} ${sectionPad} flex flex-col gap-10 md:gap-12`}>
        <div className="flex max-w-[640px] flex-col gap-3">
          <Eyebrow>~/approach</Eyebrow>
          <H2>{approachHeading}</H2>
        </div>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6">
          {principles.map((p) => (
            <Principle key={p.slug} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}

const diagrams: Record<DiagramKind, () => React.ReactNode> = {
  fsm: FsmStrip,
  outbox: OutboxBars,
  trace: TraceWaterfall,
};

function Principle({ diagram, title, body }: (typeof principles)[number]) {
  const Diagram = diagrams[diagram];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex h-28 flex-col justify-center rounded-panel border border-line bg-ground p-6">
        <Diagram />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-[14.5px] leading-[1.6] text-muted">{body}</p>
    </div>
  );
}

const monoLabel = "w-[52px] shrink-0 font-mono text-[10px] text-muted";

function FsmStrip() {
  const states = ["DRAFT", "SUBMITTED", "REVIEW", "APPROVED"];
  const current = "REVIEW";
  return (
    <div
      role="img"
      aria-label="State machine: Draft, Submitted, Review (current), Approved"
      className="flex items-center gap-1.5"
    >
      {states.map((s, i) => (
        <div key={s} className="contents">
          {i > 0 && <div className="h-px min-w-1 flex-1 bg-line-2" />}
          <div
            className={`rounded-chip border px-2 py-2 font-mono text-[10px] lg:px-2.5 ${
              s === current ? "border-accent text-accent" : "border-line-2 text-muted"
            }`}
          >
            {s}
          </div>
        </div>
      ))}
    </div>
  );
}

function OutboxBars() {
  const rows = [
    { label: "DB TX", from: 0, width: 62, hot: true },
    { label: "OUTBOX", from: 0, width: 62, hot: true },
    { label: "PUBLISH", from: 62, width: 38, hot: false },
  ];
  return (
    <div
      role="img"
      aria-label="Outbox relay: the database transaction and outbox append commit together, publish follows"
      className="flex flex-col gap-2.5"
    >
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <div className={monoLabel}>{r.label}</div>
          <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-line">
            <div
              className={`h-full ${r.hot ? "bg-accent" : "bg-dim"}`}
              style={{ marginLeft: `${r.from}%`, width: `${r.width}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TraceWaterfall() {
  const spans = [
    { label: "api", from: 0, width: 90, hot: false },
    { label: "auth", from: 4, width: 18, hot: false },
    { label: "db", from: 26, width: 46, hot: true },
    { label: "publish", from: 76, width: 10, hot: false },
  ];
  return (
    <div
      role="img"
      aria-label="Trace waterfall: api span containing auth, db (slowest) and publish spans"
      className="flex flex-col gap-2"
    >
      {spans.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className={monoLabel}>{s.label}</div>
          <div className="flex-1">
            <div
              className={`h-1.5 rounded-[3px] ${s.hot ? "bg-accent" : "bg-line-2"}`}
              style={{ marginLeft: `${s.from}%`, width: `${s.width}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
