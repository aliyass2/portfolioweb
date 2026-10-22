import { capabilities } from "@/content/site";

export function CapabilityStrip() {
  return (
    <div className="border-y border-line">
      <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px bg-line min-[1200px]:border-x min-[1200px]:border-line md:grid-cols-4">
        {capabilities.map((c, i) => (
          <li
            key={c.title}
            className="flex flex-col gap-2 bg-ground px-5 py-[22px] md:gap-3 md:px-8 md:py-9"
          >
            <div className="font-mono text-[10px] tracking-[0.12em] text-accent md:text-[11px]">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="text-[15px] font-semibold md:text-lg">{c.title}</div>
            <p className="hidden text-sm leading-[1.55] text-muted md:block">{c.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
