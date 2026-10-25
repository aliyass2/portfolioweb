import { featuredWork, work, workGroup, workIntro } from "@/content/site";
import { IraqMap } from "./living/IraqMap";
import { Eyebrow, H2, sectionPad, wrap } from "./ui";

const reveal = (i: number) => ({ "data-reveal": "", style: { "--i": i } as React.CSSProperties });

export function Work() {
  return (
    <section id="work" className={`${sectionPad} scroll-mt-16`}>
      <div data-port className={`${wrap} flex flex-wrap items-end justify-between gap-4`}>
        <div className="flex flex-col gap-3" {...reveal(0)}>
          <div data-port-anchor>
            <Eyebrow>~/work</Eyebrow>
          </div>
          <H2>{workIntro.heading}</H2>
        </div>
        <p className="max-w-[380px] text-sm leading-[1.55] text-muted" {...reveal(1)}>
          {workIntro.aside}
        </p>
      </div>
      <WorkFeatured />
      <div data-port className={`${wrap} flex flex-col gap-4`}>
        <div
          data-port-anchor
          className="font-mono text-[10px] tracking-[0.12em] text-muted md:text-[11px]"
          {...reveal(0)}
        >
          {workGroup}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:[&>*:nth-child(even)]:mt-14">
          {work.map((w, i) => (
            <WorkCard key={w.slug} {...w} i={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

const highlightable =
  "scroll-mt-24 outline-offset-2 data-[highlight=on]:outline data-[highlight=on]:outline-1 data-[highlight=on]:outline-accent";

// Full-bleed band; the map column overflows the band's edges.
function WorkFeatured() {
  const f = featuredWork;
  return (
    <div data-port className="relative my-14 border-y border-line bg-surface md:my-28">
      <article
        id={`work-${f.slug}`}
        className={`${wrap} grid grid-cols-1 gap-10 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:py-0 ${highlightable}`}
      >
        <div className="flex flex-col gap-5 md:py-20">
          <div data-port-anchor className="flex flex-wrap items-center justify-between gap-2" {...reveal(0)}>
            <div className="font-mono text-[10px] tracking-[0.12em] text-muted md:text-[11px]">{f.org}</div>
            <div className="rounded-[3px] border border-accent px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-accent shadow-[0_0_14px_-2px_rgba(240,162,59,0.6)] md:text-[11px]">
              CURRENT
            </div>
          </div>
          <h3
            className="text-[24px] leading-[1.15] font-medium tracking-[-0.015em] md:text-[34px]"
            {...reveal(1)}
          >
            {f.title}
          </h3>
          <p className="text-sm leading-[1.6] text-muted md:text-[15px]" {...reveal(2)}>
            {f.summary}
          </p>
          <ul className="flex flex-col gap-2.5 text-sm leading-normal" {...reveal(3)}>
            {f.points.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="text-accent" aria-hidden>
                  —
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div
            className="border-t border-line pt-2.5 font-mono text-[11px] tracking-[0.04em] text-muted md:text-[11.5px]"
            {...reveal(4)}
          >
            {f.stack}
          </div>
        </div>
        <div className="relative flex flex-col justify-center md:-my-16" {...reveal(2)}>
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] tracking-[0.12em] text-muted md:text-[11px]">
            <span>TENANT TOPOLOGY · ALL OF IRAQ</span>
            <span className="text-accent">● LIVE</span>
          </div>
          <div className="rounded-panel border border-line-2 bg-ground/80 p-4 shadow-[0_30px_120px_-40px_rgba(240,162,59,0.35)] md:p-8">
            <IraqMap />
          </div>
        </div>
      </article>
    </div>
  );
}

function WorkCard({ slug, title, summary, stack, i }: (typeof work)[number] & { i: number }) {
  return (
    <article
      id={`work-${slug}`}
      data-spotlight
      className={`group flex flex-col gap-3.5 rounded-panel border border-line bg-ground p-6 md:p-8 ${highlightable}`}
      {...reveal(i)}
    >
      <h3 className="text-[19px] font-semibold md:text-[21px]">{title}</h3>
      <p className="text-sm leading-[1.6] text-muted md:text-[14.5px]">{summary}</p>
      <div className="mt-auto border-t border-line pt-2.5 font-mono text-[11px] tracking-[0.04em] text-muted transition-colors group-hover:text-accent md:text-[11.5px]">
        {stack}
      </div>
    </article>
  );
}
