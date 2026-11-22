"use client";

import { useEffect, useRef } from "react";

type MonitorProps = {
  live: boolean;
};

function wave(phase: number) {
  const p = phase - Math.floor(phase);
  if (p < 0.1) return 0;
  if (p < 0.18) return Math.sin(((p - 0.1) / 0.08) * Math.PI) * 0.16;
  if (p < 0.3) return 0;
  if (p < 0.34) return -Math.sin(((p - 0.3) / 0.04) * Math.PI) * 0.22;
  if (p < 0.4) return Math.sin(((p - 0.34) / 0.06) * Math.PI);
  if (p < 0.46) return -Math.sin(((p - 0.4) / 0.06) * Math.PI) * 0.36;
  if (p < 0.54) return 0;
  if (p < 0.7) return Math.sin(((p - 0.54) / 0.16) * Math.PI) * 0.26;
  return 0;
}

export function Monitor({ live }: MonitorProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const bw = Math.round(width * dpr);
      const bh = Math.round(height * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const paint = (now: number) => {
      resize();
      const offset = live && !reduce ? (now / 1000) * 92 : 40;
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255, 26, 26, 0.16)";
      ctx.lineWidth = 1;
      for (let y = 16; y < height; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let x = 0; x < width; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const mid = height * 0.56;
      const amp = height * 0.34;
      const beat = 168;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const y = mid - wave((x + offset) / beat) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255, 26, 26, 0.35)";
      ctx.lineWidth = 5;
      ctx.lineJoin = "miter";
      ctx.lineCap = "square";
      ctx.stroke();
      ctx.strokeStyle = "#ff1a1a";
      ctx.lineWidth = 1.7;
      ctx.stroke();
    };

    const loop = (now: number) => {
      if (!alive) return;
      paint(now);
      if (live && !reduce) raf = requestAnimationFrame(loop);
    };

    if (live && !reduce) raf = requestAnimationFrame(loop);
    else paint(0);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [live]);

  return <canvas ref={ref} className="monitor" aria-hidden="true" />;
}
