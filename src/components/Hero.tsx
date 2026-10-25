import { profile } from "@/content/site";
import { EventField } from "./living/EventField";
import { EventFlow } from "./EventFlow";
import { Terminal } from "./terminal/Terminal";
import { wrap } from "./ui";

export function Hero() {
  return (
    <section
      id="top"
      className="relative scroll-mt-16 overflow-hidden md:flex md:min-h-[calc(100svh-64px)] md:items-center"
    >
      {/* full-bleed live network; the vignette keeps the copy readable.
          No z-index/isolation here: the docked terminal is a fixed descendant
          and must stack against the whole page, not inside the hero. */}
      <div className="absolute inset-0">
        <EventField />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_28%_50%,var(--ground)_25%,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-ground" />
      </div>
      <div className={`${wrap} relative w-full pt-14 pb-10 md:py-24`}>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
          <div className="flex flex-col gap-5 md:gap-7">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-muted lg:hidden">
              <span className="size-[7px] rounded-full bg-accent" aria-hidden />
              {profile.statusShort}
            </div>
            <div className="font-mono text-[11px] tracking-[0.12em] text-accent md:text-xs">
              <span className="md:hidden">{profile.eyebrowShort}</span>
              <span className="hidden md:inline">{profile.eyebrow}</span>
            </div>
            <h1 className="text-[40px] leading-[1.02] font-medium tracking-[-0.025em] md:text-[clamp(56px,5.3vw,78px)] md:leading-[0.98] md:tracking-[-0.035em]">
              {profile.headline}
            </h1>
            <p className="max-w-[560px] text-base leading-[1.55] text-muted md:text-[19px]">
              {profile.sub}
            </p>
            <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:gap-3 md:pt-2">
              <a
                href="#work"
                className="inline-flex h-12 items-center justify-center rounded-chip bg-accent px-[22px] text-[15px] font-semibold text-ground transition-shadow hover:text-ground hover:shadow-[0_0_0_1px_rgba(240,162,59,0.6),0_0_32px_-4px_rgba(240,162,59,0.7)]"
              >
                See the work
              </a>
              <a
                href="#contact"
                className="inline-flex h-12 items-center justify-center rounded-chip border border-line-2 bg-ground/60 px-[22px] text-[15px] backdrop-blur-sm hover:border-accent"
              >
                Get in touch
              </a>
            </div>
          </div>
          <div className="md:hidden">
            <EventFlow />
          </div>
          <Terminal />
        </div>
      </div>
    </section>
  );
}
