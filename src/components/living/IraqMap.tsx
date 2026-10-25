import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import countries from "world-atlas/countries-50m.json";

// Server-only: the outline is projected at build time from Natural Earth
// (public domain); the client receives a plain SVG. The CORE hub in Baghdad
// dispatches to each governorate capital. Animation is CSS, gated on the
// band's `data-landed` (see .map-* rules in globals.css).

const HUB = { name: "BAGHDAD", lon: 44.36, lat: 33.31 };
const CITIES: { name: string; lon: number; lat: number; label?: boolean }[] = [
  { name: "MOSUL", lon: 43.13, lat: 36.34, label: true },
  { name: "DUHOK", lon: 42.99, lat: 36.87 },
  { name: "ERBIL", lon: 44.01, lat: 36.19, label: true },
  { name: "SULAYMANIYAH", lon: 45.43, lat: 35.56 },
  { name: "KIRKUK", lon: 44.39, lat: 35.47 },
  { name: "TIKRIT", lon: 43.68, lat: 34.61 },
  { name: "BAQUBAH", lon: 44.64, lat: 33.75 },
  { name: "RAMADI", lon: 43.3, lat: 33.42 },
  { name: "KARBALA", lon: 44.02, lat: 32.62 },
  { name: "HILLAH", lon: 44.43, lat: 32.48 },
  { name: "KUT", lon: 45.82, lat: 32.51 },
  { name: "NAJAF", lon: 44.34, lat: 32.0 },
  { name: "DIWANIYAH", lon: 44.92, lat: 31.99 },
  { name: "AMARAH", lon: 47.15, lat: 31.84 },
  { name: "SAMAWAH", lon: 45.29, lat: 31.31 },
  { name: "NASIRIYAH", lon: 46.26, lat: 31.04 },
  { name: "BASRA", lon: 47.78, lat: 30.51, label: true },
];

const W = 420;
const PAD = 12;

function projection() {
  const topo = countries as unknown as Topology<{ countries: GeometryCollection }>;
  const iraq = feature(topo, topo.objects.countries).features.find((f) => f.id === "368");
  if (!iraq || iraq.geometry.type !== "Polygon") throw new Error("Iraq outline missing");
  const ring = iraq.geometry.coordinates[0] as [number, number][];
  const lons = ring.map((p) => p[0]);
  const lats = ring.map((p) => p[1]);
  const minLon = Math.min(...lons);
  const maxLat = Math.max(...lats);
  const kx = Math.cos((33 * Math.PI) / 180); // equirectangular, true at ~33°N
  const spanX = (Math.max(...lons) - minLon) * kx;
  const scale = (W - PAD * 2) / spanX;
  const project = (lon: number, lat: number) =>
    [PAD + (lon - minLon) * kx * scale, PAD + (maxLat - lat) * scale] as const;
  const height = Math.ceil(PAD * 2 + (maxLat - Math.min(...lats)) * scale);
  const outline =
    ring.map(([lon, lat], i) => `${i ? "L" : "M"}${project(lon, lat).map((v) => v.toFixed(1)).join(" ")}`).join("") + "Z";
  return { project, outline, height };
}

export function IraqMap() {
  const { project, outline, height } = projection();
  const [hx, hy] = project(HUB.lon, HUB.lat);
  const cities = CITIES.map((c) => {
    const [x, y] = project(c.lon, c.lat);
    return { ...c, x, y, d: Math.hypot(x - hx, y - hy) };
  });
  const maxD = Math.max(...cities.map((c) => c.d));

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      role="img"
      aria-label="Map of Iraq: a core system in Baghdad dispatching to operations in every governorate"
      className="iraq-map h-auto w-full overflow-visible"
    >
      <path d={outline} className="fill-raised/60 stroke-line-2" strokeWidth={1} strokeLinejoin="round" />
      {cities.map((c, i) => {
        // spokes draw in nearest-first, then carry a looping packet
        const delay = 0.15 + (c.d / maxD) * 0.9;
        const path = `M${hx.toFixed(1)} ${hy.toFixed(1)}L${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
        const style = {
          "--d": `${delay}s`,
          "--p": `${2.4 + (i % 5) * 0.55}s`,
          "--pd": `${delay + 0.9 + (i % 7) * 0.37}s`,
        } as React.CSSProperties;
        return (
          <g key={c.name} style={style}>
            <path d={path} pathLength={100} className="map-spoke stroke-line-2" strokeWidth={1} fill="none" />
            <path d={path} pathLength={100} className="map-packet stroke-accent" strokeWidth={2} strokeLinecap="round" fill="none" />
            <circle cx={c.x} cy={c.y} r={2.6} className="map-city fill-line-2" />
            {c.label && (
              <text
                x={c.x + 6}
                y={c.y + 3}
                className="fill-muted font-mono"
                fontSize={8.5}
                letterSpacing="0.08em"
              >
                {c.name}
              </text>
            )}
          </g>
        );
      })}
      <circle cx={hx} cy={hy} r={11} className="map-hub-glow fill-accent/15" />
      <circle cx={hx} cy={hy} r={4.2} className="fill-accent" />
      <text x={hx + 10} y={hy + 3.5} className="fill-text font-mono" fontSize={9} letterSpacing="0.08em">
        CORE · BAGHDAD
      </text>
    </svg>
  );
}
