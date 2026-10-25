import { about } from "@/content/site";
import { Chip, Eyebrow, H2, sectionPad, wrap } from "./ui";

export function About() {
  return (
    <section id="about" className={`${wrap} ${sectionPad} scroll-mt-16`}>
      <div data-port className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3 md:sticky md:top-28" data-reveal>
          <div data-port-anchor>
            <Eyebrow>~/about</Eyebrow>
          </div>
          <H2 className="max-w-[520px]">{about.heading}</H2>
        </div>
        <div className="flex flex-col gap-6 text-base leading-[1.65] text-muted md:text-[16.5px]">
          {about.paragraphs.map((p, i) => (
            <p key={p} data-reveal style={{ "--i": i + 1 } as React.CSSProperties}>
              {p}
            </p>
          ))}
          <ul
            aria-label="Stack"
            data-reveal
            style={{ "--i": 3 } as React.CSSProperties}
            className="flex flex-wrap gap-2 pt-2"
          >
            {about.chips.map((c) => (
              <li key={c}>
                <Chip>{c}</Chip>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
