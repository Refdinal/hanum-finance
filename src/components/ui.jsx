import React from "react";

export const Card = ({ className = "", children }) => (
  <div className={`card-flat ${className}`}>{children}</div>
);

export const SectionTitle = ({ children, right = null }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="font-serif text-[26px] font-normal leading-[1.2] tracking-tight text-ink-plum">
      {children}
    </h2>
    {right}
  </div>
);

const tones = {
  glow: "bg-hero-violet/25 text-ink-plum border border-hero-violet",
  mint: "bg-mint/10 text-mint border border-mint/40",
  rose: "bg-rose/10 text-rose border border-rose/40",
  fog: "bg-mist text-graphite border border-line-fog",
  amber: "bg-bitcoin-orange/10 text-bitcoin-orange border border-bitcoin-orange/40",
};

export const Badge = ({ tone = "fog", children }) => (
  <span className={`chip ${tones[tone] || tones.fog}`}>{children}</span>
);

export const Stat = ({ label, value, tone = "text-ink-plum" }) => (
  <Card className="p-6">
    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">{label}</p>
    <p className={`mt-2 text-2xl font-bold tracking-tight ${tone}`}>{value}</p>
  </Card>
);

export const Button = ({ variant = "solid", className = "", ...props }) => {
  const variantClass = {
    solid: "btn-solid",
    ghost: "btn-ghost",
    muted: "btn-muted",
    danger: "btn-danger",
  }[variant];
  return <button className={`btn-pill ${variantClass} ${className}`} {...props} />;
};

export const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="label-dark">{label}</label>
    {children}
  </div>
);

export const Spinner = ({ text = "Memproses data..." }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-hero-violet/40 border-t-ink-plum" />
    <p className="mt-4 text-sm text-slate">{text}</p>
  </div>
);

export const Empty = ({ text = "Belum ada data." }) => (
  <p className="py-8 text-center text-sm text-slate">{text}</p>
);

export const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-plum/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-[48px] border border-mist bg-pure-white p-8 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-normal text-ink-plum">{title}</h3>
          <button onClick={onClose} className="text-slate hover:text-ink-plum" aria-label="Tutup">
            ✕
          </button>
        </div>
        <div className="text-sm text-graphite">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};
