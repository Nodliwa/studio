"use client";

import { useState } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub: string;
  color: string;
  tooltip: string;
}

export function MetricCard({ label, value, sub, color, tooltip }: MetricCardProps) {
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <div
      className="relative group border border-gray-800 rounded-xl p-4"
      style={{ background: "#12121a" }}
      onMouseLeave={() => setTipOpen(false)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); setTipOpen(o => !o); }}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-400 text-xs leading-none focus:outline-none"
        aria-label="More info"
        tabIndex={-1}
      >
        ⓘ
      </button>
      <p className="text-xs text-gray-600 uppercase tracking-widest mb-1 pr-5">{label}</p>
      <p className={`text-3xl font-bold ${color} leading-none mb-1`}>{value}</p>
      <p className="text-xs text-gray-600">{sub}</p>
      <div
        className={`absolute top-9 right-0 z-20 w-48 transition-opacity duration-150 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 shadow-xl leading-relaxed ${
          tipOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
        }`}
      >
        {tooltip}
      </div>
    </div>
  );
}
