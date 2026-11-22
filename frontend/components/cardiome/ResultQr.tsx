"use client";

import { QRCodeSVG } from "qrcode.react";
import { useMemo } from "react";

function ipv4(value: string | null) {
  if (!value || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return null;
  const parts = value.split(".");
  if (!parts.every((part) => Number(part) <= 255)) return null;
  return value;
}

export function ResultQr({ id, lanIp }: { id: string; lanIp: string | null }) {
  const url = useMemo(() => {
    const host = window.location.hostname;
    const local = host === "localhost" || host === "127.0.0.1";
    const address = ipv4(lanIp);
    const port = window.location.port || "3000";
    const origin = local && address ? `http://${address}:${port}` : window.location.origin;
    return `${origin}/result/${id}`;
  }, [id, lanIp]);

  return (
    <div className="mt-4 border-t border-[#F0E4E7] pt-4 text-center">
      <a href={url} className="inline-block rounded-2xl border border-[#F0E4E7] bg-white p-2" aria-label="Open the standalone result">
        <QRCodeSVG value={url} size={148} level="M" bgColor="#ffffff" fgColor="#101014" title="QR code for this heart score" />
      </a>
      <p className="mt-2 text-sm font-medium text-[#101014]">Scan to open this result</p>
      <p className="mt-1 text-xs leading-relaxed text-[#667085]">
        The page shows this score and the details used to calculate it. Anyone with the code can open it.
      </p>
    </div>
  );
}
