import React, { useState } from "react";
import { formatRupiah } from "../lib/format";

const short = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}jt`;
  if (v >= 1e3) return `${Math.round(v / 1e3)}rb`;
  return String(Math.round(v));
};

// data: [{ label, [key]: number }]
// series: [{ key, label, shortLabel?, color, defaultOn? }]
const LineChart = ({ data, series }) => {
  const [visible, setVisible] = useState(() => {
    const on = series.filter((s) => s.defaultOn).map((s) => s.key);
    return new Set(on.length ? on : series.map((s) => s.key));
  });
  const [hover, setHover] = useState(null);

  const toggle = (key) =>
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const shown = series.filter((s) => visible.has(s.key));

  const width = 820;
  const height = 280;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 40;
  const n = data.length;

  const max = Math.max(1, ...data.flatMap((d) => shown.map((s) => Number(d[s.key]) || 0)));
  const x = (i) => (n <= 1 ? padL : padL + (i * (width - padL - padR)) / (n - 1));
  const y = (v) => padT + (height - padT - padB) * (1 - (Number(v) || 0) / max);
  const path = (key) => data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d[key])}`).join(" ");
  const ticks = Array.from({ length: 5 }, (_, k) => (max * k) / 4);
  const band = n > 1 ? (width - padL - padR) / (n - 1) : width - padL - padR;

  const tw = 230;
  const th = 24 + Math.max(shown.length, 1) * 18;
  const tipX = hover === null ? 0 : Math.min(Math.max(x(hover) - tw / 2, 4), width - tw - 4);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 560 }}>
        {ticks.map((t, i) => (
          <line key={`g${i}`} x1={padL} x2={width - padR} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
        ))}
        {ticks.map((t, i) => (
          <text key={`t${i}`} x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#6b7280">
            {short(t)}
          </text>
        ))}

        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={padT}
            y2={height - padB}
            stroke="#beaaff"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
          />
        )}

        {shown.map((s) => (
          <path key={`p${s.key}`} d={path(s.key)} fill="none" stroke={s.color} strokeWidth="2" />
        ))}
        {shown.map((s) =>
          data.map((d, i) => (
            <circle key={`c${s.key}${i}`} cx={x(i)} cy={y(d[s.key])} r={hover === i ? 5 : 3} fill={s.color} />
          )),
        )}

        {data.map((d, i) => (
          <text key={`x${i}`} x={x(i)} y={height - 14} textAnchor="middle" fontSize="10" fill="#6b7280">
            {d.label}
          </text>
        ))}

        {hover !== null && (
          <g transform={`translate(${tipX}, ${padT})`}>
            <rect width={tw} height={th} rx="8" fill="#ffffff" stroke="#e2e8f0" />
            <text x="12" y="17" fontSize="11" fontWeight="600" fill="#2c232e">
              {data[hover].label}
            </text>
            {shown.map((s, k) => (
              <g key={`tip${s.key}`} transform={`translate(12, ${30 + k * 18})`}>
                <rect x="0" y="-8" width="10" height="10" rx="2" fill={s.color} />
                <text x="16" y="0" fontSize="11" fill="#6b7280">
                  {s.shortLabel || s.label}
                </text>
                <text x={tw - 12} y="0" fontSize="11" fontWeight="600" fill="#2c232e" textAnchor="end">
                  {formatRupiah(data[hover][s.key])}
                </text>
              </g>
            ))}
            {shown.length === 0 && (
              <text x="12" y="34" fontSize="11" fill="#6b7280">
                Tidak ada garis aktif
              </text>
            )}
          </g>
        )}

        {data.map((d, i) => (
          <rect
            key={`h${i}`}
            x={Math.max(0, x(i) - band / 2)}
            y={padT}
            width={band}
            height={height - padT - padB}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {series.map((s) => {
          const on = visible.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggle(s.key)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${
                on ? "border-ink-plum text-ink-plum" : "border-line text-slate opacity-50"
              }`}
              title={on ? "Sembunyikan" : "Tampilkan"}
            >
              <span className="inline-block h-[3px] w-5 rounded" style={{ background: s.color }} />
              {s.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate">Klik legenda untuk menampilkan/menyembunyikan kategori.</p>
    </div>
  );
};

export default LineChart;
