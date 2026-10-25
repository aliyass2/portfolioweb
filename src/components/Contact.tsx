import { contact, profile } from "@/content/site";
import { Eyebrow, wrap } from "./ui";

const links = [
  { href: `mailto:${profile.email}`, label: profile.email },
  { href: profile.githubUrl, label: profile.github },
  { href: profile.cv, label: "Download CV (PDF)", download: true },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 border-t border-line bg-surface">
      <div data-port className={`${wrap} flex flex-wrap items-end justify-between gap-8 py-14 md:py-28`}>
        <div className="flex flex-col gap-4" data-reveal>
          <div data-port-anchor>
            <Eyebrow>~/contact</Eyebrow>
          </div>
          <h2 className="max-w-[760px] text-[32px] leading-[1.02] font-medium tracking-[-0.03em] md:text-[clamp(48px,5.4vw,76px)]">
            {contact.heading}
          </h2>
          <p className="text-[15px] text-muted">{contact.sub}</p>
        </div>
        <ul
          data-reveal
          style={{ "--i": 2 } as React.CSSProperties}
          className="flex flex-col gap-2.5 font-mono text-[15px] md:text-base"
        >
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                download={l.download || undefined}
                className={`flex min-h-11 items-center gap-3 ${l.download ? "text-muted" : ""}`}
              >
                <span className="text-accent" aria-hidden>
                  →
                </span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </section>
  );
}

function Footer() {
  const sha = process.env.BUILD_SHA ?? "local";
  const date = process.env.BUILD_DATE ?? "—";
  return (
    <footer className="border-t border-line pb-12 md:pb-0">
      <div
        className={`${wrap} flex flex-wrap justify-between gap-3 py-5 font-mono text-[11px] tracking-[0.08em] text-muted`}
      >
        <span>{profile.fullName.toUpperCase()} · {profile.location.toUpperCase()}</span>
        <span className="flex flex-wrap gap-[18px]">
          <span>
            BUILD <span className="text-text">{sha}</span>
          </span>
          <span>
            DEPLOYED <span className="text-text">{date}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            ALL SYSTEMS NOMINAL
          </span>
        </span>
      </div>
    </footer>
  );
}
