// Single source of truth for page copy. The terminal's virtual filesystem
// (fs.ts) is derived from this, so sections and `ls` never drift.

export const profile = {
  name: "Ali Yass",
  fullName: "Ali Yass Khudhair",
  location: "Baghdad, Iraq",
  status: "BAGHDAD · UTC+3 · OPEN TO RELOCATE (EU)",
  statusShort: "BAGHDAD · OPEN TO RELOCATE (EU)",
  eyebrow: "BACKEND ENGINEER · .NET · DISTRIBUTED SYSTEMS",
  eyebrowShort: "BACKEND ENGINEER · .NET",
  headline: "I build the backend systems that Iraqi institutions run on.",
  sub: "Workflow engines, event-driven services and production observability for government and financial platforms — designed to be audited, traced and extended.",
  whoami: "ali yass khudhair — backend engineer, .NET, distributed systems",
  readme: [
    "# ali yass — backend engineer",
    "builds workflow engines, event-driven services and observability",
    "for government and financial platforms. .NET, PostgreSQL, RabbitMQ.",
  ],
  email: "yass39656@gmail.com",
  github: "github.com/aliyass2",
  githubUrl: "https://github.com/aliyass2",
  cv: "/cv.pdf",
};

export type SectionId = "work" | "approach" | "about" | "contact";

export const sections: { id: SectionId; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "approach", label: "Approach" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export const capabilities = [
  {
    title: "Workflow engines",
    body: "FSM-driven processes with explicit states, multi-level approvals, escalation and a full audit trail.",
  },
  {
    title: "Event-driven integration",
    body: "RabbitMQ and MassTransit with outbox/inbox and idempotency, so services agree even when things fail.",
  },
  {
    title: "Production observability",
    body: "OpenTelemetry traces and metrics, Grafana, Loki, Tempo — stood up end to end and used to debug live incidents.",
  },
  {
    title: "Architecture that lasts",
    body: "DDD, clean architecture and schema-per-module monoliths designed for service extraction without a rewrite.",
  },
];

export const workIntro = {
  heading: "Systems with a country behind them.",
  aside:
    "Government and financial platforms where correctness, traceability and uptime are the product.",
};

export const featuredWork = {
  slug: "opdc-distribution",
  org: "QI CARD · 2026 — PRESENT",
  title: "National oil-distribution systems for OPDC",
  summary:
    "eGov backend systems for the Oil Products Distribution Company, Iraq's state-owned fuel distributor, built inside the country's largest payment infrastructure.",
  points: [
    "A multi-tenant distribution system serving operations across all of Iraq",
    "A warehouse distribution system for tracking stock and movement",
    "The Coupon mini app, a citizen-facing service inside the SuperQi app",
  ],
  stack: ".NET · ASP.NET Core · PostgreSQL · RabbitMQ · Multi-tenancy",
};

export const workGroup = "SCOPESKY COMMUNICATIONS · 2024 — 2026";

export const work = [
  {
    slug: "office-management",
    title: "Office Management Platform",
    summary:
      "Document workflow system deployed across Iraqi passport offices nationwide. RBAC, FSM-driven document processing and multi-level approval chains.",
    stack: "ASP.NET Core · FSM · RBAC · PostgreSQL",
  },
  {
    slug: "biometric-hr",
    title: "Biometric HR System",
    summary:
      "Event-driven microservices with face-recognition attendance. Outbox/inbox over RabbitMQ and MassTransit, pgvector embedding search, SignalR notifications, Hangfire jobs, MinIO storage.",
    stack: "Microservices · RabbitMQ · pgvector · SignalR · MinIO",
  },
  {
    slug: "evisa",
    title: "eVisa Platform",
    summary:
      "Automated visa application workflow with Audit.NET event tracking, multilingual data modeling and government-facing notification pipelines.",
    stack: ".NET · Audit.NET · Multilingual data · Notifications",
  },
  {
    slug: "ticketing-observability",
    title: "Ticketing & Observability",
    summary:
      "An FSM ticketing engine with dozens of transitions and escalation logic, plus the full OpenTelemetry / Grafana / Loki / Tempo stack used to trace a live rate-limiting incident to its root cause.",
    stack: "OpenTelemetry · Prometheus · Grafana · Loki · Tempo · Seq",
  },
];

export type DiagramKind = "fsm" | "outbox" | "trace";

export const approachHeading = "Three patterns I reach for, and why.";

export const principles: {
  slug: string;
  diagram: DiagramKind;
  title: string;
  body: string;
}[] = [
  {
    slug: "explicit-state",
    diagram: "fsm",
    title: "Make state explicit",
    body: "Government processes are state machines whether you model them or not. I model them: every transition named, guarded and recorded, so the audit trail is a by-product, not a feature.",
  },
  {
    slug: "outbox-relay",
    diagram: "outbox",
    title: "Write once, deliver reliably",
    body: "Events are committed in the same transaction as the data, then relayed. Consumers de-duplicate. The result is at-least-once delivery that behaves like exactly-once, with no lost messages during a crash.",
  },
  {
    slug: "trace-everything",
    diagram: "trace",
    title: "If it isn't traced, it isn't done",
    body: "Every service ships with traces, metrics and structured logs from day one. That stack is how a 429 storm became a one-line fix instead of a week of guessing.",
  },
];

export const about = {
  heading: "An engineer first, a programmer second.",
  paragraphs: [
    "I studied aeronautical engineering at the University of Baghdad, a discipline where a system that mostly works is a system that fails. I carried that standard into backend software: model the states, prove the invariants, instrument everything, assume the network will drop.",
    "Today I design and ship .NET platforms for Iraqi government and financial institutions, and I'm preparing to bring that experience to a team in Europe.",
  ],
  chips: [
    "C# / .NET 10",
    "ASP.NET Core",
    "EF Core",
    "PostgreSQL",
    "RabbitMQ",
    "MassTransit",
    "OpenTelemetry",
    "Grafana · Loki · Tempo",
    "Docker",
    "DDD",
  ],
};

// `stack` command / about/stack.txt
export const stackTable: [string, string][] = [
  ["lang", "C# · .NET 10"],
  ["web", "ASP.NET Core · EF Core · SignalR · Hangfire"],
  ["msg", "RabbitMQ · MassTransit · outbox/inbox · idempotency"],
  ["data", "PostgreSQL · pgvector · MongoDB · MinIO"],
  ["observe", "OpenTelemetry · Prometheus · Grafana · Loki · Tempo · Seq"],
  ["arch", "DDD · clean · modular monolith · FSM workflows"],
];

// `trace` command
export const sampleTrace = [
  "POST /applications                 202  54ms",
  "├─ auth.validate                          3ms",
  "├─ db.tx  insert + outbox.append        21ms",
  "├─ publish rabbitmq applications          4ms",
  "└─ inbox.dedupe → Submitted → Reviewed   9ms",
];

export const contact = {
  heading: "Let's build something that has to work.",
  sub: "Open to backend and platform roles in Europe. Remote-friendly, relocation-ready.",
};
