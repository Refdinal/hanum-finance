import React from "react";
import { NavLink, Link } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/transactions", label: "Transaksi" },
  { to: "/investasi", label: "Investasi" },
];

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? "bg-ink-plum text-pure-white" : "text-graphite hover:text-ink-plum hover:bg-hero-violet/20"
  }`;

const Navbar = ({ onLogout }) => (
  <nav className="sticky top-0 z-40 border-b border-mist bg-lavender-mist/80 backdrop-blur">
    <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3 px-4 py-3">
      <Link to="/" className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-plum text-lg font-bold text-hero-violet">
          ₣
        </span>
        <span className="font-display text-xl uppercase tracking-[0.06em] text-ink-plum">
          Hanum Fi<span className="text-bitcoin-orange">n</span>ance
        </span>
      </Link>

      <div className="ml-auto flex flex-wrap items-center gap-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
            {l.label}
          </NavLink>
        ))}
        <Link to="/transactions/new" className="btn-pill btn-solid ml-2">
          + Tambah
        </Link>
        <button onClick={onLogout} className="btn-pill btn-danger ml-1">
          Logout
        </button>
      </div>
    </div>
  </nav>
);

export default Navbar;
