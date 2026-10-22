import { approachHeading, principles } from "@/content/site";
import { Diagram } from "./diagrams/Diagrams";
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

function Principle({ slug, diagram, title, body }: (typeof principles)[number]) {
  return (
    <div id={`approach-${slug}`} className="flex scroll-mt-24 flex-col gap-5">
      <Diagram kind={diagram} />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-[14.5px] leading-[1.6] text-muted">{body}</p>
    </div>
  );
}
