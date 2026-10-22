import { featuredWork, work, workGroup, workIntro } from "@/content/site";
import { Eyebrow, H2, sectionPad, wrap } from "./ui";

export function Work() {
  return (
    <section id="work" className={`${wrap} ${sectionPad} flex scroll-mt-16 flex-col gap-10 md:gap-12`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Eyebrow>~/work</Eyebrow>
          <H2>{workIntro.heading}</H2>
        </div>
        <p className="max-w-[380px] text-sm leading-[1.55] text-muted">{workIntro.aside}</p>
      </div>
      <WorkFeatured />
      <div className="flex flex-col gap-4">
        <div className="font-mono text-[10px] tracking-[0.12em] text-muted md:text-[11px]">
          {workGroup}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {work.map((w) => (
            <WorkCard key={w.slug} {...w} />
          ))}
        </div>
      </div>
    </section>
  );
}

const highlightable =
  "scroll-mt-24 outline-offset-2 data-[highlight=on]:outline data-[highlight=on]:outline-1 data-[highlight=on]:outline-accent";

function WorkFeatured() {
  const f = featuredWork;
  return (
    <article
      id={`work-${f.slug}`}
      className={`group grid grid-cols-1 rounded-panel border border-line bg-surface hover:border-line-2 md:grid-cols-2 ${highlightable}`}
    >
      <div className="flex flex-col gap-5 p-6 md:border-r md:border-line md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-[10px] tracking-[0.12em] text-muted md:text-[11px]">
            {f.org}
          </div>
          <div className="rounded-[3px] border border-accent px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-accent md:text-[11px]">
            CURRENT
          </div>
        </div>
        <h3 className="text-[21px] leading-[1.2] font-medium tracking-[-0.01em] md:text-[28px]">
          {f.title}
        </h3>
        <p className="text-sm leading-[1.6] text-muted md:text-[15px]">{f.summary}</p>
        <ul className="flex flex-col gap-2.5 text-sm leading-normal">
          {f.points.map((p) => (
            <li key={p} className="flex gap-3">
              <span className="text-accent" aria-hidden>
                —
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <StackLine>{f.stack}</StackLine>
      </div>
      <div className="hidden flex-col justify-center gap-3.5 p-10 md:flex">
        <div className="font-mono text-[11px] tracking-[0.12em] text-muted">TENANT TOPOLOGY</div>
        <TenantTopology />
      </div>
    </article>
  );
}

function WorkCard({ slug, title, summary, stack }: (typeof work)[number]) {
  return (
    <article
      id={`work-${slug}`}
      className={`group flex flex-col gap-3.5 rounded-panel border border-line p-6 hover:border-line-2 md:p-8 ${highlightable}`}
    >
      <h3 className="text-[19px] font-semibold md:text-[21px]">{title}</h3>
      <p className="text-sm leading-[1.6] text-muted md:text-[14.5px]">{summary}</p>
      <StackLine>{stack}</StackLine>
    </article>
  );
}

// On card hover the stack line lights up: the one hover accessory.
function StackLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-auto border-t border-line pt-2.5 font-mono text-[11px] tracking-[0.04em] text-muted transition-colors group-hover:text-accent md:text-[11.5px]">
      {children}
    </div>
  );
}

function Node({
  children,
  w,
  hot = false,
  dashed = false,
}: {
  children: React.ReactNode;
  w: string;
  hot?: boolean;
  dashed?: boolean;
}) {
  return (
    <div
      className={`flex h-[34px] shrink-0 items-center justify-center rounded-chip border font-mono text-[11px] ${w} ${
        hot ? "border-accent text-xs text-text" : "border-line-2 text-muted"
      } ${dashed ? "border-dashed" : ""}`}
    >
      {children}
    </div>
  );
}

function TenantTopology() {
  const rows: { core: string; hot?: boolean; tenants?: string[]; app?: string }[] = [
    { core: "CORE", hot: true, tenants: ["T-01", "T-02", "T-03"] },
    { core: "WAREHOUSE", tenants: ["T-04", "T-05", "…"] },
    { core: "COUPON", app: "SUPERQI MINI APP" },
  ];
  return (
    <div
      role="img"
      aria-label="Tenant topology: core and warehouse services fan out to tenants; the Coupon service runs as a SuperQi mini app"
      className="flex flex-col gap-2.5"
    >
      {rows.map((r) => (
        <div key={r.core} className="flex items-center gap-3">
          <Node w="w-[120px]" hot={r.hot}>
            {r.core}
          </Node>
          <div className="h-px flex-1 bg-line-2" />
          {r.tenants ? (
            <div className="flex gap-2">
              {r.tenants.map((t) => (
                <Node key={t} w="w-[68px]">
                  {t}
                </Node>
              ))}
            </div>
          ) : (
            <Node w="w-[220px]" dashed>
              {r.app}
            </Node>
          )}
        </div>
      ))}
    </div>
  );
}
