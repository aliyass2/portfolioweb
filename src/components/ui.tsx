export const wrap = "mx-auto w-full max-w-[1200px] px-5 md:px-8";
export const sectionPad = "py-14 md:py-28";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] tracking-[0.12em] text-accent md:text-xs">
      {children}
    </div>
  );
}

export function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-[28px] leading-tight font-medium tracking-[-0.02em] md:text-[40px] ${className}`}>
      {children}
    </h2>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[3px] border border-line-2 px-2.5 py-1.5 font-mono text-[11.5px] text-text">
      {children}
    </span>
  );
}
