"use client";

import { useEffect, useRef } from "react";

type Channel = {
  x: number;
  amp: number;
  phase: number;
  width: number;
  speed: number;
  offset: number;
  length: number;
};

const channels: Channel[] = [
  { x: 0.18, amp: 0.028, phase: 0.4, width: 0.062, speed: 0.07, offset: 0.12, length: 0.46 },
  { x: 0.4, amp: 0.034, phase: 1.7, width: 0.074, speed: 0.052, offset: 0.55, length: 0.52 },
  { x: 0.62, amp: 0.026, phase: 2.5, width: 0.056, speed: 0.08, offset: 0.3, length: 0.4 },
  { x: 0.82, amp: 0.032, phase: 0.9, width: 0.066, speed: 0.06, offset: 0.78, length: 0.48 },
];

function point(channel: Channel, u: number, w: number, h: number) {
  return {
    x: w * channel.x + Math.sin(u * Math.PI * 1.35 + channel.phase) * w * channel.amp,
    y: h * (1.14 - u * 1.28),
  };
}

function trace(
  ctx: CanvasRenderingContext2D,
  channel: Channel,
  from: number,
  to: number,
  w: number,
  h: number,
) {
  const steps = 36;
  ctx.beginPath();
  for (let i = 0; i <= steps; i += 1) {
    const u = from + ((to - from) * i) / steps;
    const p = point(channel, u, w, h);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
}

export function HeartCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let onScreen = true;
    let pageVisible = true;
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

    const draw = (now: number) => {
      resize();
      const t = reduce ? 4.2 : now / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const paintDye = (channel: Channel, from: number, to: number, dye: number) => {
        if (to - from < 0.02) return;
        const tail = point(channel, from, width, height);
        const tip = point(channel, to, width, height);
        trace(ctx, channel, from, to, width, height);
        const gradient = ctx.createLinearGradient(tail.x, tail.y, tip.x, tip.y);
        gradient.addColorStop(0, "rgba(255, 26, 26, 0)");
        gradient.addColorStop(0.28, "rgba(255, 26, 26, 0.28)");
        gradient.addColorStop(0.72, "rgba(255, 26, 26, 0.92)");
        gradient.addColorStop(1, "rgba(255, 26, 26, 1)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = dye;
        ctx.stroke();
        const core = ctx.createLinearGradient(tail.x, tail.y, tip.x, tip.y);
        core.addColorStop(0, "rgba(255, 210, 204, 0)");
        core.addColorStop(0.6, "rgba(255, 210, 204, 0.2)");
        core.addColorStop(1, "rgba(255, 228, 224, 0.75)");
        ctx.strokeStyle = core;
        ctx.lineWidth = Math.max(1.5, dye * 0.18);
        ctx.stroke();
      };

      channels.forEach((channel) => {
        const tube = Math.max(12, width * channel.width);
        trace(ctx, channel, -0.04, 1.04, width, height);
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = tube;
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(6, tube - 3);
        ctx.stroke();

        const dye = Math.max(4, tube - 8);
        const head = (t * channel.speed + channel.offset) % 1;
        const tail = head - channel.length;
        if (tail < 0) {
          paintDye(channel, tail + 1, 1, dye);
          paintDye(channel, 0, head, dye);
        } else {
          paintDye(channel, tail, head, dye);
        }
      });
    };

    const loop = (now: number) => {
      if (!alive) return;
      draw(now);
      if (!reduce && onScreen && pageVisible) raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (!reduce && onScreen && pageVisible) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else cancelAnimationFrame(raf);
      },
      { threshold: 0.08 },
    );
    io.observe(canvas);

    const onVis = () => {
      pageVisible = document.visibilityState === "visible";
      if (pageVisible) start();
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVis);

    if (reduce) draw(0);
    else start();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="heart-stage">
      <canvas ref={ref} className="heart-canvas" aria-hidden="true" />
      <p className="sr-only">
        Red contrast dye moving upward through four clear capillary channels.
      </p>
    </div>
  );
}
