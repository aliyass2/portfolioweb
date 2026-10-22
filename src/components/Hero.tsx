import { profile } from "@/content/site";
import { EventFlow } from "./EventFlow";
import { Terminal } from "./terminal/Terminal";
import { wrap } from "./ui";

export function Hero() {
  return (
    <section id="top" className={`${wrap} scroll-mt-16 pt-14 pb-10 md:py-28`}>
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex flex-col gap-5 md:gap-7">
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-muted lg:hidden">
            <span className="size-[7px] rounded-full bg-accent" aria-hidden />
            {profile.statusShort}
          </div>
          <div className="font-mono text-[11px] tracking-[0.12em] text-accent md:text-xs">
            <span className="md:hidden">{profile.eyebrowShort}</span>
            <span className="hidden md:inline">{profile.eyebrow}</span>
          </div>
          <h1 className="text-[38px] leading-[1.05] font-medium tracking-[-0.02em] md:text-[64px] md:leading-[1.02] md:tracking-[-0.025em]">
            {profile.headline}
          </h1>
          <p className="max-w-[560px] text-base leading-[1.55] text-muted md:text-[19px]">
            {profile.sub}
          </p>
          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:gap-3 md:pt-2">
            <a
              href="#work"
              className="inline-flex h-12 items-center justify-center rounded-chip bg-accent px-[22px] text-[15px] font-semibold text-ground hover:bg-text hover:text-ground"
            >
              See the work
            </a>
            <a
              href="#contact"
              className="inline-flex h-12 items-center justify-center rounded-chip border border-line-2 px-[22px] text-[15px]"
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
    </section>
  );
}
