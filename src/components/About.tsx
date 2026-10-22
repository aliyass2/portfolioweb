import { about } from "@/content/site";
import { Chip, Eyebrow, H2, sectionPad, wrap } from "./ui";

export function About() {
  return (
    <section id="about" className={`${wrap} ${sectionPad} scroll-mt-16`}>
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Eyebrow>~/about</Eyebrow>
          <H2 className="max-w-[460px]">{about.heading}</H2>
        </div>
        <div className="flex flex-col gap-6 text-base leading-[1.65] text-muted md:text-[16.5px]">
          {about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul aria-label="Stack" className="flex flex-wrap gap-2 pt-2">
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
