/** Decorative ECG geometry. Timing is an animation parameter, not a measured heart rate. */
export const BEAT_MS = 833;
export const R_PHASE = 0.36;
export const ECG_BEATS = 8;
export const ECG_VIEW_W = 1000;
export const ECG_VIEW_H = 64;

type Point = { x: number; y: number };

/** One beat, x and y in 0–1. The trace starts and ends on the same baseline. */
const BEAT: Point[] = [
  { x: 0, y: 0.62 },
  { x: 0.1, y: 0.62 },
  { x: 0.14, y: 0.52 },
  { x: 0.18, y: 0.45 },
  { x: 0.22, y: 0.62 },
  { x: 0.3, y: 0.62 },
  { x: 0.33, y: 0.72 },
  { x: R_PHASE, y: 0.07 },
  { x: 0.4, y: 0.84 },
  { x: 0.44, y: 0.62 },
  { x: 0.52, y: 0.62 },
  { x: 0.58, y: 0.52 },
  { x: 0.66, y: 0.42 },
  { x: 0.74, y: 0.62 },
  { x: 1, y: 0.62 },
];

export function sampleBeat(phase: number): number {
  const t = ((phase % 1) + 1) % 1;
  for (let i = 1; i < BEAT.length; i += 1) {
    const prev = BEAT[i - 1];
    const next = BEAT[i];
    if (t <= next.x) {
      const span = next.x - prev.x;
      const mix = span === 0 ? 0 : (t - prev.x) / span;
      return prev.y + (next.y - prev.y) * mix;
    }
  }
  return 0.62;
}

export function buildEcgPath(beats = ECG_BEATS, width = ECG_VIEW_W, height = ECG_VIEW_H): string {
  const beatWidth = width / beats;
  let path = "";
  for (let beat = 0; beat < beats; beat += 1) {
    BEAT.forEach((point, index) => {
      const x = ((beat + point.x) * beatWidth).toFixed(2);
      const y = (point.y * height).toFixed(2);
      path += `${index === 0 && beat === 0 ? "M" : "L"}${x} ${y}`;
    });
  }
  return path;
}

export const ECG_PATH = buildEcgPath();

/** 1 at the decorative R peak, falling off quickly on either side. */
export function beatPulse(phase: number): number {
  const delta = Math.abs(phase - R_PHASE);
  const distance = Math.min(delta, 1 - delta);
  return Math.exp(-(distance * distance) / 0.0036);
}
