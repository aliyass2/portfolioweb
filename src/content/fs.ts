// Virtual filesystem + shell for the terminal. Pure: no DOM access. The
// Terminal component applies the returned effects (scroll, open, clear).
import {
  type DiagramKind,
  about,
  featuredWork,
  principles,
  profile,
  sampleTrace,
  stackTable,
  work,
} from "./site";

export type Tone = "text" | "muted" | "accent";
export type Line = { text: string; tone: Tone };

type FileNode = {
  kind: "file";
  name: string;
  lines?: string[];
  href?: string;
  play?: DiagramKind; // reading it runs that diagram in ~/approach
};
type DirNode = {
  kind: "dir";
  name: string;
  anchor: string; // element id `cd` scrolls to
  children: FsNode[];
};
type FsNode = FileNode | DirNode;

const stackLines = stackTable.map(([k, v]) => k.padEnd(9) + v);

const projectDir = (p: { slug: string; summary: string; stack: string }): DirNode => ({
  kind: "dir",
  name: p.slug,
  anchor: `work-${p.slug}`,
  children: [{ kind: "file", name: "README.md", lines: [p.summary, p.stack] }],
});

export const root: DirNode = {
  kind: "dir",
  name: "~",
  anchor: "top",
  children: [
    {
      kind: "dir",
      name: "work",
      anchor: "work",
      children: [featuredWork, ...work].map(projectDir),
    },
    {
      kind: "dir",
      name: "approach",
      anchor: "approach",
      children: principles.map((p) => ({
        kind: "file",
        name: `${p.slug}.md`,
        lines: [`# ${p.title.toLowerCase()}`, p.body],
        play: p.diagram,
      })),
    },
    {
      kind: "dir",
      name: "about",
      anchor: "about",
      children: [
        { kind: "file", name: "aeronautical-engineering.md", lines: about.paragraphs },
        { kind: "file", name: "stack.txt", lines: stackLines },
      ],
    },
    {
      kind: "dir",
      name: "contact",
      anchor: "contact",
      children: [
        { kind: "file", name: "email.txt", lines: [profile.email] },
        { kind: "file", name: "github.txt", lines: [profile.githubUrl] },
        { kind: "file", name: "cv.pdf", href: profile.cv },
      ],
    },
    { kind: "file", name: "cv.pdf", href: profile.cv },
    { kind: "file", name: "README.md", lines: profile.readme },
  ],
};

// cwd is a path relative to ~, e.g. [] or ["work", "evisa"].
export type Cwd = string[];

export const cwdLabel = (cwd: Cwd) => (cwd.length ? cwd.join("/") : "~");

function nodeAt(path: Cwd): FsNode | undefined {
  let node: FsNode = root;
  for (const seg of path) {
    if (node.kind !== "dir") return undefined;
    const next: FsNode | undefined = node.children.find(
      (c) => c.name.toLowerCase() === seg.toLowerCase(),
    );
    if (!next) return undefined;
    node = next;
  }
  return node;
}

// Resolve `arg` against cwd. `~`, `/` and leading `~/` mean root.
function resolve(cwd: Cwd, arg: string): Cwd | undefined {
  const absolute = arg === "~" || arg === "/" || arg.startsWith("~/") || arg.startsWith("/");
  const parts = arg.replace(/^~/, "").split("/").filter(Boolean);
  const out = absolute ? [] : [...cwd];
  for (const p of parts) {
    if (p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  const node = nodeAt(out);
  if (!node) return undefined;
  // normalise casing to the real names
  const real: Cwd = [];
  let cur: FsNode = root;
  for (const seg of out) {
    cur = (cur as DirNode).children.find((c) => c.name.toLowerCase() === seg.toLowerCase())!;
    real.push(cur.name);
  }
  return real;
}

const listing = (dir: DirNode) =>
  dir.children.map((c) => (c.kind === "dir" ? `${c.name}/` : c.name)).join("   ");

export type Effect =
  | { type: "scroll"; anchor: string; highlight: boolean }
  | { type: "open"; href: string }
  | { type: "play"; diagram: DiagramKind; anchor: string }
  | { type: "clear" };

export type Result = { lines: Line[]; cwd: Cwd; effect?: Effect };

export const commands = [
  "help",
  "cd",
  "ls",
  "pwd",
  "cat",
  "stack",
  "trace",
  "whoami",
  "cv",
  "work",
  "approach",
  "about",
  "contact",
  "clear",
];

const help: [string, string][] = [
  ["cd <dir>", "navigate: work, approach, about, contact"],
  ["ls", "list what is here · cd .. goes home"],
  ["pwd", "where you are"],
  ["cat <file>", "read a file · cat cv.pdf opens the cv"],
  ["stack", "what I build with"],
  ["trace", "sample request trace, played in ~/approach"],
  ["whoami", "one line"],
  ["clear", "clear screen"],
];

const playEffect = (diagram: DiagramKind): Effect => ({
  type: "play",
  diagram,
  anchor: `approach-${principles.find((p) => p.diagram === diagram)!.slug}`,
});

export function run(input: string, cwd: Cwd): Result {
  const raw = input.trim();
  const [verbRaw = "", ...args] = raw.split(/\s+/);
  const verb = verbRaw.toLowerCase();
  const arg = args.join(" ");
  const lines: Line[] = [];
  const out = (text: string, tone: Tone = "muted") => lines.push({ text, tone });

  const cd = (target: string): Result => {
    const path = target === "" ? [] : resolve(cwd, target);
    const node = path && nodeAt(path);
    if (!path || !node) {
      out(`cd: no such directory: ${target}`);
      return { lines, cwd };
    }
    if (node.kind !== "dir") {
      out(`cd: not a directory: ${target}`);
      return { lines, cwd };
    }
    if (path.length) out(`→ #${node.anchor}`, "accent");
    return {
      lines,
      cwd: path,
      effect: { type: "scroll", anchor: node.anchor, highlight: path.length > 1 },
    };
  };

  switch (verb) {
    case "":
      return { lines, cwd };
    case "help":
    case "?":
      out("commands:", "text");
      for (const [c, d] of help) out(`  ${c.padEnd(11)}${d}`);
      return { lines, cwd };
    case "cd":
      return cd(arg);
    case "work":
    case "approach":
    case "about":
    case "contact":
      return cd(`~/${verb}`);
    case "mail":
      return cd("~/contact");
    case "ls":
    case "dir": {
      const path = arg ? resolve(cwd, arg) : cwd;
      const node = path && nodeAt(path);
      if (!node) out(`ls: cannot access '${arg}': no such file or directory`);
      else if (node.kind === "dir") out(listing(node), "text");
      else out(node.name, "text");
      return { lines, cwd };
    }
    case "pwd":
      out(`/home/ali/${cwd.join("/")}`, "text");
      return { lines, cwd };
    case "cv":
      out("→ cv.pdf", "accent");
      return { lines, cwd, effect: { type: "open", href: profile.cv } };
    case "cat":
    case "open":
    case "less": {
      if (!arg) {
        out(`${verb}: missing file operand`);
        return { lines, cwd };
      }
      const path = resolve(cwd, arg);
      const node = path && nodeAt(path);
      if (!node) out(`${verb}: ${arg}: no such file or directory`);
      else if (node.kind === "dir") out(`${verb}: ${arg}: is a directory`);
      else if (node.href) {
        out(`→ ${node.name}`, "accent");
        return { lines, cwd, effect: { type: "open", href: node.href } };
      } else {
        node.lines?.forEach((l, i) => out(l, i === 0 ? "text" : "muted"));
        if (node.play) return { lines, cwd, effect: playEffect(node.play) };
      }
      return { lines, cwd };
    }
    case "stack":
      stackLines.forEach((l, i) => out(l, i === 0 ? "text" : "muted"));
      return { lines, cwd };
    case "trace":
      sampleTrace.forEach((l, i) =>
        out(l, i === 0 ? "text" : i === sampleTrace.length - 1 ? "accent" : "muted"),
      );
      return { lines, cwd, effect: playEffect("trace") };
    case "whoami":
      out(profile.whoami, "text");
      return { lines, cwd };
    case "clear":
    case "cls":
      return { lines, cwd, effect: { type: "clear" } };
    case "sudo":
    case "rm":
      out("nice try. permission denied.", "accent");
      return { lines, cwd };
    default:
      out(`command not found: ${verbRaw} — try help`);
      return { lines, cwd };
  }
}

// Tab completion: first token completes commands, later tokens complete paths.
export function complete(input: string, cwd: Cwd): string {
  const m = input.match(/^(\s*)(\S*)(\s+)?(\S*)$/);
  if (!m) return input;
  const [, lead, verb, space, partial] = m;
  if (!space) {
    const hits = commands.filter((c) => c.startsWith(verb.toLowerCase()));
    return hits.length === 1 ? `${lead}${hits[0]} ` : input;
  }
  const slash = partial.lastIndexOf("/");
  const dirPart = partial.slice(0, slash + 1);
  const stem = partial.slice(slash + 1).toLowerCase();
  const base = dirPart ? resolve(cwd, dirPart) : cwd;
  const dir = base && nodeAt(base);
  if (!dir || dir.kind !== "dir") return input;
  const dirsOnly = verb.toLowerCase() === "cd";
  const hits = dir.children.filter(
    (c) => c.name.toLowerCase().startsWith(stem) && (!dirsOnly || c.kind === "dir"),
  );
  if (hits.length !== 1) return input;
  const hit = hits[0];
  return `${lead}${verb}${space}${dirPart}${hit.name}${hit.kind === "dir" ? "/" : ""}`;
}
