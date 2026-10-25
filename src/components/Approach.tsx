import { approachHeading, principles } from "@/content/site";
import { Diagram } from "./diagrams/Diagrams";
import { Eyebrow, H2, sectionPad, wrap } from "./ui";

export function Approach() {
  return (
    <section id="approach" className="scroll-mt-16 border-t border-line bg-surface">
      <div className={`${wrap} ${sectionPad} flex flex-col gap-10 md:gap-12`}>
        <div data-port className="flex max-w-[760px] flex-col gap-3">
          <div data-port-anchor data-reveal>
            <Eyebrow>~/approach</Eyebrow>
          </div>
          <H2>
            <span data-reveal style={{ "--i": 1 } as React.CSSProperties} className="block">
              {approachHeading}
            </span>
          </H2>
        </div>
        <div data-port className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6">
          {principles.map((p, i) => (
            <Principle key={p.slug} {...p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Principle({ slug, diagram, title, body, i }: (typeof principles)[number] & { i: number }) {
  return (
    <div
      id={`approach-${slug}`}
      data-reveal
      style={{ "--i": i } as React.CSSProperties}
      className="flex scroll-mt-24 flex-col gap-5"
    >
      <Diagram kind={diagram} />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-[14.5px] leading-[1.6] text-muted">{body}</p>
    </div>
  );
}
